import { listen, monitor } from "../../base/monitor"
import { storage } from "../../base/storage"
import { time } from "../../base/time"
import { ViewManager } from "../../base/view/ViewManager"
import { appfunc } from "../../lobby/appfunc"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM, TASK } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import BaseGame from "../scripts/base/BaseGame.ddz"
import { EPlayer, EventName } from "./GameConfig.ddz"
import { GameFunc } from "./GameFunc.ddz"
import { GameView } from "./GameView.ddz"

const { ccclass } = cc._decorator

enum GameRoundPop {
    WinDouble,
    RegainLose,
    HBRound,
    LuckWelfare,
    DailyGift,
    Tomorrow,
    FreeLose_Skip,
    FreeLose_Must,
}

@ccclass
export default class BaiYuanGame extends BaseGame {
    winStreakCount: number
    roundCount: number
    GameRoundPopCheck: Record<number, (n: number) => boolean>
    GameRoundPopRandom: Record<number, { min: number, probability: number }[]>

    start() {
        super.start()

        this.roundCount = 0
        this.winStreakCount = 0
        this.GameRoundPopCheck = {
            [GameRoundPop.LuckWelfare]: n => n % 5 == 1,
            [GameRoundPop.DailyGift]: n => n % 6 == 1,
            [GameRoundPop.Tomorrow]: n => n % 6 == 2,
            [GameRoundPop.FreeLose_Skip]: n => n % 5 == 3,
            [GameRoundPop.FreeLose_Must]: n => n % 6 == 4 && n != 4,
        }
        this.GameRoundPopRandom = {
            [GameRoundPop.FreeLose_Skip]: [
                { min: 16000, probability: 0.3 },
                { min: 17000, probability: 0 },
            ],
        }

        // 新手每日礼包弹窗几率
        if (app.datas.morrow < 2) {
            this.GameRoundPopCheck[GameRoundPop.DailyGift] = n => n % 2 == 4
        }

        GameView.showBaiYuanCashOut()
        let result_order = storage.get("result_order")//当前显示礼包
        let result_bukan_order = storage.get("result_bukan_order")//不看时顺序
        let result_noSeeAd_count = storage.get("result_noSeeAd_count")//三局不看广告，强制看
        let result_next = storage.get("result_next")
        if (result_order == null || result_order == undefined || result_bukan_order > 4) {
            storage.set("result_order", 1)
        }
        if (result_bukan_order == null || result_bukan_order == undefined || result_bukan_order > 4) {
            storage.set("result_bukan_order", 1)
        }
        if (result_noSeeAd_count == null || result_noSeeAd_count == undefined || result_noSeeAd_count > 4) {
            storage.set("result_noSeeAd_count", 1)
        }
        if (result_next == null || result_next == undefined) {
            storage.set("result_next", 1)//1:开 2.关
        }
    }

    @listen(EventName.game_onPressExit)
    onPressExit() {
        if (GameFunc.isGameRuning()) {
            if (true) {
                startFunc.showToast("请游戏结束后再退出游戏哦~")
                return
            }

            const message: Iproto_gc_baiyuan_hb_round_not = this.cacheMessages["proto_gc_baiyuan_hb_round_not"]
            if (message && ads.checkCanReceive(ads.video.New_GameRedPacket)) {
                startFunc.showConfirm({
                    title: "退出游戏",
                    content: `再玩<color=#ff3e20>${message.nLimitRound - message.nCurRound}</c>局就可以开启红包\n现在退出，您的局数进度将被清空!`,
                    confirmText: "继续游戏",
                    cancelText: "退出清空进度",
                    cancelFunc: () => GameFunc.leaveGame(),
                })
                return
            }
        }

        super.onPressExit()
    }

    checkMoneyLimit() {
        if (this.isRelief()) {
            // if (ads.checkCanReceive(ads.video.New_BankruptDefend)) {
            //     GameFunc.send<Iproto_cg_baiyuan_can_bankruptcy_defend_req>("proto_cg_baiyuan_can_bankruptcy_defend_req", {})
            // } else {
            //     this.showReliefOver()
            // }
            appfunc.showReliefPop({
                closeCallback: () => this.isValid && this.scheduleOnce(this.tryMoneyLimit.bind(this), 1)
            })
            return true
        }

        return false
    }

    isRelief() {
        return app.user.getItemNum(ITEM.TO_CASH) <= 200//app.getOnlineParam("baiyuan_low_money", 2000)
    }

    showReliefOver() {
        startFunc.showConfirm({
            content: `您的红包不是太多，请到大厅获取足够红包再来吧`,
            showClose: false,
            confirmText: "立即前往",
            confirmFunc: () => GameFunc.leaveGame(),
            buttonNum: 1,
        })
    }

    closeGameResultPops() {
        ViewManager.close("BaiYuanLuckWelfarePop")
        ViewManager.close("BaiYuanRegainLosePop")
        ViewManager.close("BaiYuanResultPop")
        ViewManager.close("BaiYuanRoundPop")
    }

    showGameResultPops() {
        this.taskQueue.clear()
        this.taskQueue.add(this.showBaiYuanResult, this)
        this.taskQueue.add(this.showBaiYuanRegainLose, this)
        // this.taskQueue.add(this.showRoundHB, this)
        this.taskQueue.add(this.showBaiYuanJiaSuTiXian, this)
        this.taskQueue.add(this.showBaiYuanLuckWelfare, this)
        this.taskQueue.add(this.showBaiYuanJinLi, this)
        this.taskQueue.add(this.showBaiYuanRound, this)
        this.taskQueue.add(this.showCashout, this)

        // this.taskQueue.add(this.showTomorrow, this)
        // this.taskQueue.add(this.showDailyGift, this)
        this.taskQueue.add(this.showGameNext, this)
        this.taskQueue.run()
    }

    // 局数红包
    showRoundHB(next: Function) {
        if (app.datas.regtime <= Math.floor(time.toTimeStamp(app.getOnlineParam("round_hb_regtime") ?? "202102041110").getTime() / 1000)) {
            next()
            return
        }

        if (app.datas.AchieveList?.some(item => item.index == TASK.HB_ROUND && item.status == 1)) {
            next()
            return
        }

        monitor.once("proto_lc_get_at_achieve_list_ack", (message: Iproto_lc_get_at_achieve_list_ack) => {
            if (message.vecItems.some(item => item.type == 1)) {
                return
            }

            let task: Iproto_ATAchieveData
            for (const item of message.vecItems) {
                if (item.index == TASK.HB_ROUND) {
                    task = item
                    break
                }
            }

            if (task == null || task.status == 1) {
                next()
                return
            }

            if (task.value >= task.max) {
                GameView.showRoundHBPop({ closeCallback: next, message: task })
                return
            }

            next()
        }, this)
        appfunc.getTaskList(0)
    }

    // 输赢动画
    showBaiYuanResult(next: Function) {

        const message: Iproto_gc_game_result_not1 = this.cacheMessages["proto_gc_game_result_not1"]
        console.log("jin---showBaiYuanResult:", message)
        let count = 0
        message.vecUserResult1.forEach(v => {
            const isMe = GameFunc.S2C(v.nChairID) == EPlayer.Me
            if (isMe) {
                this.winStreakCount = v.nScore > 0 ? this.winStreakCount + 1 : 0
            }
            console.log("jin---showBaiYuanResult:", v, isMe)
            if (v.nScore == 0) {
                return
            }

            if (isMe && v.nScore > 0) {
                count++
            }

            // 玩家红包数字变化
            if (!isMe || v.nScore < 0) {
                monitor.emit(EventName.game_player_hb_change, v.nChairID, v.nScore)
            }
        })

        console.log("jin---showBaiYuanResult:", count)
        if (count == 0) {
            next()
            return
        }
        app.user.won++
        cc.sys.localStorage.setItem("games", app.user.won + app.user.lost)
        console.log("jin---showBaiYuanResult11: ", app.user.won, app.user.lost, app.user.dogfall)
        GameView.showBaiYuanResultPop({
            closeCallback: next,
            message: message,
            showDouble: this.isWinDoubel(),
            winStreakCount: this.winStreakCount,
        })
    }


    //加速提现
    showBaiYuanJiaSuTiXian(next: Function) {
        // const message = this.cacheMessages["proto_gc_baiyuan_luck_welfare_not"]
        // if (!message) {
        //     next()
        //     return
        // }
        let round: Number = app.user.won + app.user.lost + app.user.dogfall
        console.log("jin---showBaiYuanJiaSuTiXian11: ", app.user.won, app.user.lost, app.user.dogfall)
        if (round == 1) {
            next()
            return
        }
        const result_order = storage.get("result_order")
        console.log("jin---showBaiYuanJiaSuTiXian: ", result_order)
        if (result_order != 1) {
            next()
            return
        }

        GameView.showBaiYuanJiaSuTiXianPop({
            closeCallback: next,
            message: {},
        })
    }


    // 幸运红包(天降红包)
    showBaiYuanLuckWelfare(next: Function) {
        // const message = this.cacheMessages["proto_gc_baiyuan_luck_welfare_not"]
        // console.log("jin---showBaiYuanLuckWelfare11: ", message)
        // if (!message) {
        //     next()
        //     return
        // }

        let round: Number = app.user.won + app.user.lost + app.user.dogfall
        if (round == 1) {
            next()
            return
        }

        const result_order = storage.get("result_order")
        console.log("jin---showBaiYuanLuckWelfare: ", result_order)
        if (result_order != 2) {
            next()
            return
        }

        // if (this.roundCount == 1 && !app.getOnlineParam("game_baiyuan_luck_round_1", false)) {
        //     next()
        //     return
        // }

        // if (!this.checkGameRoundPop(GameRoundPop.LuckWelfare)) {
        //     next()
        //     return
        // }

        // if (!ads.checkCanReceive(ads.video.New_LuckyGift)) {
        //     next()
        //     return
        // }

        GameView.showBaiYuanLuckWelfarePop({
            closeCallback: next,
            message: {},
        })
    }

    //todo 锦鲤福利
    showBaiYuanJinLi(next: Function) {
        const result_order = storage.get("result_order")
        console.log("jin---showBaiYuanJinLi: ", result_order)
        if (result_order != 3) {
            next()
            return
        }

        let round: Number = app.user.won + app.user.lost + app.user.dogfall
        if (round == 1) {
            next()
            return
        }

        GameView.showBaiYuanJinLiPop({
            closeCallback: next,
            message: {}
        })
    }

    // 追回损失
    showBaiYuanRegainLose(next: Function) {
        const message = this.cacheMessages["proto_gc_baiyuan_regain_lose_not"]
        console.log("jin---showBaiYuanRegainLose:", message, this.checkGameRoundPop(GameRoundPop.RegainLose), ads.checkCanReceive(ads.video.New_RegainLose))
        if (!message) {
            next()
            return
        }

        if (!this.checkGameRoundPop(GameRoundPop.RegainLose)) {
            next()
            return
        }

        if (!ads.checkCanReceive(ads.video.New_RegainLose)) {
            next()
            return
        }
        app.user.lost++
        cc.sys.localStorage.setItem("games", app.user.won + app.user.lost)
        console.log("jin---showBaiYuanRegainLose11: ", app.user.won, app.user.lost, app.user.dogfall)
        GameView.showBaiYuanRegainLosePop({
            closeCallback: next,
            message: message,
        })
    }

    // 局数红包
    showBaiYuanRound(next: Function) {
        // const message = this.cacheMessages["proto_gc_baiyuan_hb_round_award_not"]
        // if (!message) {
        //     next()
        //     return
        // }

        let round: Number = app.user.won + app.user.lost + app.user.dogfall
        if (round == 1) {
            next()
            return
        }

        const result_order = storage.get("result_order")
        console.log("jin---showBaiYuanRound: ", result_order)
        if (result_order != 4) {
            next()
            return
        }

        // if (!this.checkGameRoundPop(GameRoundPop.HBRound)) {
        //     next()
        //     return
        // }

        // if (!ads.checkCanReceive(ads.video.New_GameRedPacket)) {
        //     next()
        //     return
        // }
        // storage.set("result_bukan_order", 1)
        // storage.set("result_order", 1)
        GameView.showBaiYuanRoundPop({
            closeCallback: next,
            message: {},
        })
    }

    // 明日礼包
    showTomorrow(next: Function) {
        if (!this.checkGameRoundPop(GameRoundPop.Tomorrow)) {
            next()
            return
        }

        const count = storage.getToday("game_TomorrowGift") ?? 0
        if (count >= 3) {
            next()
            return
        }


        appfunc.loadTomorrowData(() => {
            if (!this.isValid) {
                return
            }

            appfunc.loadTomorrowStatus(() => {
                if (!this.isValid) {
                    return
                }

                const status = app.datas.TomorrowStatus

                const lastSignTime = status.ret == 0 ? status.list[0].signTime : 0

                const now = new Date()
                now.setHours(0, 0, 0, 0)
                const zerotime = Math.floor(now.getTime() / 1000)

                const alreadySign = zerotime < lastSignTime
                const canGetAward = lastSignTime < zerotime

                let curday = status.ret == 0 ? status.list[0].signDay : 0

                if (alreadySign && curday > 0) {
                    curday = curday - 1
                }

                if (curday > 6) {
                    next()
                    return
                }

                const data = app.datas.TomorrowData[curday].itemConfig

                if (canGetAward && status.tomorrowAward.length > 0) {
                    status.tomorrowAward = []
                }

                const ordered = app.datas.TomorrowStatus.tomorrowAward

                if (ordered.length < 2) {
                    const check = (data: IItemInfo) => {
                        return ordered.some(order => order.itemIndex == data.itemIndex && (data.itemIndex != ITEM.TO_CASH || order.itemNum == data.itemNum))
                    }
                }

                next()
            })
        })
    }

    //todo 0.3元提现
    showCashout(next: Function) {
        if (!storage.get("first_cashout") && app.user.getItemNum(ITEM.INGOT) > 3000) {
            appfunc.showCashOutPop({ closeCallback: next })
            storage.set("first_cashout", true)
        } else {
            next()
            return
        }
    }


    // 每日礼包
    showDailyGift(next: Function) {
        if (!this.checkGameRoundPop(GameRoundPop.DailyGift)) {
            next()
            return
        }

        if (!ads.checkCanReceive(ads.video.New_DailyGift)) {
            next()
            return
        }

        const count = storage.getToday("game_DailyGift") ?? 0
        if (count >= 3) {
            next()
            return
        }

        storage.setToday("game_DailyGift", count + 1)
        GameView.showDailyGiftPop({
            closeCallback: next
        })
    }

    /**
     * 继续优先显示样式
     * - 0 继续游戏
     * - 1 继续游戏和下局免输
     * - 2 下局免输
     */
    showGameNext() {
        super.showGameNext()

        let nextype = 0
        if (app.user.getItemNum(ITEM.FREE_LOSE) == 0) {
            if (ads.checkCanReceive(ads.video.New_NextLoseZero)) {
                if (this.checkGameRoundPop(GameRoundPop.FreeLose_Skip)) {
                    nextype = 1
                } else if (this.checkGameRoundPop(GameRoundPop.FreeLose_Must) && ads.getVideoAllTimes() < this.roundCount) {
                    nextype = 2
                }
            }
        }
        monitor.emit(EventName.game_result_next, nextype)
    }

    // 根据局数 根据概率判断当前是否弹窗
    checkGameRoundPop(eType: GameRoundPop) {
        const check = this.GameRoundPopCheck[eType]
        if (check) {
            if (!check(this.roundCount)) {
                cc.log("[BaiYuanGame.checkGameRoundPop] fail ", eType, this.roundCount)
                return false
            }
        }

        const configs = this.GameRoundPopRandom[eType]
        if (configs) {
            const num = app.user.getItemNum(ITEM.TO_CASH)
            for (let i = configs.length - 1; i >= 0; i--) {
                const config = configs[i]
                if (num >= config.min) {
                    if (config.probability <= Math.random()) {
                        cc.log("[BaiYuanGame.checkGameRoundPop] fail ", eType, config.probability)
                        return false
                    }
                    break
                }
            }
        }

        cc.log("[BaiYuanGame.checkGameRoundPop] success", eType, this.roundCount)
        return true
    }

    // 赢分加倍
    isWinDoubel() {
        if (!this.cacheMessages["proto_gc_baiyuan_win_double_not"]) {
            return false
        }

        if (!this.checkGameRoundPop(GameRoundPop.WinDouble)) {
            return false
        }

        if (!ads.checkCanReceive(ads.video.New_WinDouble)) {
            return false
        }

        return true
    }

    onGameEnd(message: Iproto_gc_game_result_not1) {
        super.onGameEnd(message)

        this.roundCount++

        ViewManager.close("cashout")
        ViewManager.close("SmallWithdrawalPop")
    }

    @listen("proto_gc_baiyuan_can_bankruptcy_defend_ack")
    proto_gc_baiyuan_can_bankruptcy_defend_ack(message: Iproto_gc_baiyuan_can_bankruptcy_defend_ack) {
        if (message.cRet != 0) {
            this.showReliefOver()
            return
        }

        GameView.showBaiYuanReliefPop({
            itemNum: message.vecItemInfo[0].nItemNum,
            closeCallback: () => this.isValid && this.scheduleOnce(this.tryMoneyLimit.bind(this), 1)
        })
    }

    @listen("proto_gc_baiyuan_hb_round_not")
    proto_gc_baiyuan_hb_round_not(message: Iproto_gc_baiyuan_hb_round_not) {
        this.cacheMessages["proto_gc_baiyuan_hb_round_not"] = message
    }

    // 金额变化提示框
    @listen("proto_gc_baiyuan_tocash_item_not")
    proto_gc_baiyuan_tocash_item_not(message: Iproto_gc_baiyuan_tocash_item_not) {
        message.vecItemInfo.forEach(info => {
            if (info.nItemChange == 0) {
                return
            }

            // 玩家红包数字变化
            monitor.emit(EventName.game_player_hb_change, info.cChairID, info.nItemChange)

            // 玩家红包变化公告
            if (GameFunc.S2C(info.cChairID) == EPlayer.Me) {
                GameView.showBaiYuanToCashChange({
                    value: info.nItemChange,
                    bomb: true,
                })
            }
        })
    }

    @listen("proto_gc_baiyuan_hb_round_award_not")
    proto_gc_baiyuan_hb_round_award_not(message: Iproto_gc_baiyuan_hb_round_award_not) {
        this.cacheMessages["proto_gc_baiyuan_hb_round_award_not"] = message
    }

    @listen("proto_gc_baiyuan_win_double_not")
    proto_gc_baiyuan_win_double_not(message: Iproto_gc_baiyuan_win_double_not) {
        this.cacheMessages["proto_gc_baiyuan_win_double_not"] = message
    }

    @listen("proto_gc_baiyuan_regain_lose_not")
    proto_gc_baiyuan_regain_lose_not(message: Iproto_gc_baiyuan_regain_lose_not) {
        this.cacheMessages["proto_gc_baiyuan_regain_lose_not"] = message
    }

    @listen("proto_gc_baiyuan_luck_welfare_not")
    proto_gc_baiyuan_luck_welfare_not(message: Iproto_gc_baiyuan_luck_welfare_not) {
        this.cacheMessages["proto_gc_baiyuan_luck_welfare_not"] = message
    }

    //todo 继续游戏界面
    @listen(EventName.game_result_next)
    showGoToGame() {
        GameView.showGoToGamePop()
    }
}
