import { listen } from "../../base/monitor"
import { ViewManager } from "../../base/view/ViewManager"
import { appfunc } from "../../lobby/appfunc"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import BaseGame from "../scripts/base/BaseGame.ddz"
import { EventName } from "./GameConfig.ddz"
import { GameFunc } from "./GameFunc.ddz"
import { GameView } from "./GameView.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class FuCardGame extends BaseGame {
    start() {
        super.start()

        this.setRoomTitle()

        this.setDiZhu(GameFunc.getDizhu())
    }

    @listen(EventName.game_server_update)
    onGameServerUpdate() {
        this.setRoomTitle()

        this.setDiZhu(GameFunc.getDizhu())
    }

    setRoomTitle() {
        let name = ""
        const gameType = ["抢地主", "叫三分", "不洗牌"][app.runGameServer.ddz_game_type]
        if (gameType) {
            name += gameType
        }

        const level = ["新手", "初级", "精英", "大师", "至尊"][app.runGameServer.level - 1]
        if (level) {
            name += level + "场"
        }

        this.$("room_title", cc.Label).string = name
    }

    @listen(EventName.game_dizhu_update)
    setDiZhu(dizhu: number) {
        this.$("room_dizhu", cc.Label).string = "底注：" + dizhu
    }

    @listen(EventName.game_onPressExit)
    onPressExit() {
        if (GameFunc.isGameRuning()) {
            if (true) {
                startFunc.showToast("请游戏结束后再退出游戏哦~")
                return
            }

            if (ads.checkCanReceive(ads.video.DrawRedpacket)) {
                startFunc.showConfirm({
                    title: "退出游戏",
                    content: "您当前的福卡进度将被清空，\n确定继续退出吗？",
                    confirmText: "继续游戏",
                    cancelText: "退出清空进度",
                    cancelFunc: () => GameFunc.leaveGame(),
                })
                return
            }
        }

        super.onPressExit()
    }

    @listen(EventName.game_exchange_item)
    onPressExchangeItem(params: { itemId: number, itemNum?: number, success: Function, fail: Function }) {
        params.itemNum = params.itemNum ?? 1

        const exchangeInfos = (app.datas.ExchangeInfo ?? []).filter(info => info.exchangeItemList[0].exchangeItem == ITEM.REDPACKET_TICKET && info.gainItemList.some(item => item.gainItem == params.itemId && item.gainNum >= params.itemNum))
        if (exchangeInfos.length == 0) {
            params.fail()
            return
        }

        exchangeInfos.sort((a, b) => a.exchangeItemList[0].exchangeItem - b.exchangeItemList[0].exchangeItem)

        GameView.showExchangeItemPop({
            itemId: params.itemId,
            exchangeInfo: exchangeInfos[0],
            closeCallback: () => this.isValid && this.scheduleOnce(() => app.user.getItemNum(params.itemId) >= params.itemNum && params.success(), 0.5)
        })
    }

    checkMoneyLimit() {
        const money = app.user.getItemNum(ITEM.GOLD_COIN)
        if (money < app.runGameServer.minMoney) {
            if (money < appfunc.getReliefLine() && app.datas.reliefStatus.reliefTimes > 0) {
                appfunc.showReliefPop({
                    closeCallback: () => this.isValid && this.scheduleOnce(this.tryMoneyLimit.bind(this), 1)
                })
            } else {
                startFunc.showConfirm({
                    content: `您的金豆低于场次最低入场限制！`,
                    showClose: false,
                    confirmText: "立即前往",
                    confirmFunc: () => GameFunc.leaveGame(),
                    buttonNum: 1,
                })
            }
            return true
        }

        if (app.runGameServer.maxmoney != null && money > app.runGameServer.maxmoney) {
            startFunc.showConfirm({
                content: `您的金豆已经大于场次最高入场限制！`,
                showClose: false,
                confirmText: "立即前往",
                confirmFunc: () => GameFunc.leaveGame({
                    openCallback: () => appfunc.startGame(app.runGameServer.gameId, app.runGameServer.ddz_game_type)
                }),
                buttonNum: 1,
            })
            return true
        }

        return false
    }

    isRelief() {
        return app.user.getItemNum(ITEM.GOLD_COIN) < app.runGameServer.minMoney
    }

    closeGameResultPops() {
        ViewManager.close("FuCardRoundPop")
        ViewManager.close("FuCardWinDouble")
        ViewManager.close("FuCardRegainLose")
    }

    showGameResultPops() {
        this.taskQueue.clear()
        this.taskQueue.add(this.showFuCardResult, this)
        this.taskQueue.add(this.showFuCardRound, this)
        this.taskQueue.add(this.showFuCardWinDouble, this)
        this.taskQueue.add(this.showFuCardRegainLose, this)
        this.taskQueue.add(this.showGameNext, this)
        this.taskQueue.run()
    }

    showFuCardResult(next: Function) {
        GameView.showFuCardResultPop({
            closeCallback: next,
            message: this.cacheMessages["proto_gc_game_result_not1"],
            fuCardMessage: this.cacheMessages["proto_gc_get_redpackets_award_ack"],
        })
    }

    showFuCardRound(next: Function) {
        if (!app.getOnlineParam("GameResultShowRedPacketAward", true)) {
            next()
            return
        }

        if (!ads.checkCanReceive(ads.video.DrawRedpacket)) {
            next()
            return
        }

        const message: Iproto_gc_get_redpackets_award_ack = this.cacheMessages["proto_gc_get_redpackets_award_ack"]
        if (message.ret != 1) {
            next()
            return
        }

        GameView.showFuCardRoundPop({
            closeCallback: next,
            message: message,
        })
    }

    showFuCardWinDouble(next: Function) {
        if (!app.getOnlineParam("GameResult_showWinDouble")) {
            next()
            return
        }

        const round = app.getOnlineParam("gameResult_windouble_round", 5)
        if (app.datas.role.roundSum <= round) {
            return false
        }

        if (!ads.checkCanReceive(ads.video.WinDouble)) {
            next()
            return
        }

        const message: Iproto_gc_win_doubel_req = this.cacheMessages["proto_gc_win_doubel_req"]
        if (!message) {
            next()
            return
        }

        GameView.showFuCardWinDoublePop({
            closeCallback: next,
            message: message,
        })
    }

    showFuCardRegainLose(next: Function) {
        if (!ads.checkCanReceive(ads.video.Exemption)) {
            next()
            return
        }

        const message: Iproto_gc_regain_lose_score_ack = this.cacheMessages["proto_gc_regain_lose_score_ack"]
        console.log("jin---showFuCardRegainLose message: ", message)
        if (!message || message.nTime <= 0 || !(message.nRet == 0 || message.nRet == 2)) {
            next()
            return
        }

        GameView.showFuCardRegainLosePop({
            closeCallback: next,
            message: message,
        })
    }

    @listen("proto_gc_get_redpackets_award_ack")
    proto_gc_get_redpackets_award_ack(message: Iproto_gc_get_redpackets_award_ack) {
        this.cacheMessages["proto_gc_get_redpackets_award_ack"] = message
    }

    @listen("proto_gc_regain_lose_score_ack")
    proto_gc_regain_lose_score_ack(message: Iproto_gc_regain_lose_score_ack) {
        this.cacheMessages["proto_gc_regain_lose_score_ack"] = message
    }

    @listen("proto_gc_win_doubel_req")
    proto_gc_win_doubel_req(message: Iproto_gc_win_doubel_req) {
        this.cacheMessages["proto_gc_win_doubel_req"] = message
    }
}
