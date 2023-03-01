import { audio } from "../../base/audio"
import { NodeExtends } from "../../base/extends/NodeExtends"
import { http } from "../../base/http"
import { math } from "../../base/math"
import { listen } from "../../base/monitor"
import { storage } from "../../base/storage"
import { utils } from "../../base/utils"
import BasePop from "../../base/view/BasePop"
import { appfunc } from "../../lobby/appfunc"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM, TASK } from "../../start/config"
import { AppNative } from "../../start/scripts/platforms/AppNative"
import { startFunc } from "../../start/startFunc"
import { urls } from "../../start/urls"

const { ccclass } = cc._decorator

const SmallWithdrawal_Get_Award = "SmallWithdrawal_Get_Award"
const SmallWithdrawalPop_Ad_CD = "SmallWithdrawalPop_Ad_CD"

interface RECORD_DATA {
    date: number
    count: number
}

@ccclass
export default class SmallWithdrawalPop extends BasePop {
    params: { isGameRuning: boolean }
    taskItems: { node: cc.Node, task: Iproto_ATAchieveData }[] = []
    ready: boolean = false

    start() {
        this.$("item").active = false
        this.setItem(ITEM.TO_CASH, app.user.getItemNum(ITEM.TO_CASH))
        this.setItem(ITEM.INGOT, app.user.getItemNum(ITEM.INGOT))
        ads.loadAdConfig()
        // this.refreshAdButton()
        // appfunc.getTaskList(0)
        this.scheduleOnce(() => { this.ready = true; this.proto_lc_get_at_achieve_list_ack(null) }, 0.25)
    }

    @listen("item_update")
    setItem(itemId: ITEM, itemNum: number) {
        if (itemId == ITEM.TO_CASH) {
            // 红包信息
            this.$("tocash/node_hb/label_hb", cc.Label).string = math.fixd(itemNum / 100) || "0.00"

            // 下方红包进度
            if (!app.datas.cashStatus?.bp_ply_status || itemNum < appfunc.CASH_OUT_NUM) {
                const progress = itemNum / appfunc.CASH_OUT_NUM
                this.$("tocash/progress_hb", cc.ProgressBar).progress = progress
                this.$("tocash/value", cc.Label).string = `赢满888元全提走, 还差${appfunc.toCash(appfunc.CASH_OUT_NUM - itemNum)}元`
            }
            // this.$("label_progress_hb", cc.Label).string = Math.floor(progress * 100) + "%"    
        } else if (itemId === ITEM.INGOT) {
            this.$("small_tocash/node_hb/label_yb", cc.Label).string = math.fixd(itemNum / 10000) || "0.00"

            // 下方红包进度
            const progress = itemNum / appfunc.SMAILL_CASH_OUT_NUM
            this.$("small_tocash/progress_hb", cc.ProgressBar).progress = progress
            this.$("small_tocash/num", cc.Label).string = `${itemNum}`

            if (progress > 1) {
                let node = this.$("small_tocash/btn_tocash/shou")
                cc.Tween.stopAllByTarget(node)
                cc.tween(node)
                    .then(cc.tween().to(1.5, { opacity: 0 }).delay(.5).to(1.5, { opacity: 255 }))
                    .repeatForever()
                    .start()
            } else {
                this.$("small_tocash/btn_tocash/shou").opacity = 0
            }
        }
    }

    refreshAdButton() {
        if (this.params.isGameRuning || !ads.checkCanReceive(ads.video.SmallWithdrawal)) {
            this.$("node_ad").active = false
            return
        }

        const lastOpTime = storage.get(SmallWithdrawalPop_Ad_CD) || 0
        let cdTime = 50 - (appfunc.accurateTime() - lastOpTime)
        const showCd = lastOpTime > 0 && cdTime > 0

        this.$("btn_ad").active = !showCd
        this.$("node_ad_time").active = showCd

        if (showCd) {
            const label = this.$("label_ad_time", cc.Label)
            cc.tween(this.$("node_ad_time")).then(cc.tween()
                .call(() => {
                    label.string = `${math.fill(Math.floor(cdTime / 60))}:${math.fill(Math.floor(cdTime % 60))}`
                    cdTime--
                    if (cdTime < 0) {
                        this.refreshAdButton()
                    }
                })
                .delay(1))
                .repeat(cdTime + 1) // call执行时-1了 此时补回
                .start()
        }
    }

    updateTask(task: Iproto_ATAchieveData, receiceTask: Iproto_ATAchieveData) {
        let data: { node: cc.Node, task: Iproto_ATAchieveData }
        for (const item of this.taskItems) {
            if (item.task.index == task.index) {
                data = item
                break
            }
        }

        if (data) {
            data.task = task
        } else {
            const node = cc.instantiate(this.$("item"))
            node.active = true
            node.parent = this.$("item").parent

            data = { node: node, task: task }
            this.taskItems.push(data)
        }

        if (receiceTask && data.task.status == 1 && data.task.index != receiceTask.index) {
            data.node.active = false
            return
        }

        let money = 0
        for (const award of task.vecAwards) {
            if (award.itemIndex == ITEM.WECHAT_MONEY_JIAO) {
                money = award.itemNum / 10
                break
            } else if (award.itemIndex == ITEM.WECHAT_MONEY_YUAN) {
                money = award.itemNum
                break
            }
        }
        const $ = utils.mark(data.node)
        utils.$($, "label_hb", cc.Label).string = money + "元"

        let desc = "每看1次视频都会提升提现进度"
        if (task.status == 1) {
            desc = "已成功提现至微信"
        } else if (task.value >= task.max) {
            desc = "可提现"
        }

        utils.$($, "btn_get", cc.Button).clickEvents[0].customEventData = "" + task.index

        utils.$($, "btn_get_no").active = task.status == 0 && task.value < task.max
        utils.$($, "btn_get").active = true//task.status == 0 && task.value >= task.max
        utils.$($, "icon_receive").active = task.status == 1
        utils.$($, "label_desc", cc.Label).string = desc

        const progress = Math.min(task.value / task.max, 1)
        utils.$($, "progress", cc.ProgressBar).progress = progress
        utils.$($, "label_progress", cc.Label).string = Math.round(progress * 100) + "%"
    }

    onPressGet(event: cc.Event.EventTouch, taskIds: string) {
        NodeExtends.cdTouch(event)
        audio.playMenuEffect()

        // 实名认证AB测试B
        if (!app.getOnlineParam("anti_review") && (app.getOnlineParam("anti_ab") === "b" || (app.getOnlineParam("anti_ab") !== "a" && app.user.guid % 2 === 1))) {
            if (!appfunc.hasAntiAddition()) {
                appfunc.showAntiAddiction(this.doGet.bind(this))
            } else {
                this.doGet(app.user.getItemNum(ITEM.INGOT))
            }
        } else {
            this.doGet(app.user.getItemNum(ITEM.INGOT))
        }
    }

    doGet(num) {
        // const taskId = Number(taskIds)
        // for (const item of this.taskItems) {
        //     if (item.task.index == taskId) {
        //         break
        //     }
        //     if (item.task.status == 0) {
        //         startFunc.showToast("请先提现上一档次红包")
        //         return
        //     }
        // }

        let today = new Date()
        today.setHours(0, 0, 0, 0)
        let record: RECORD_DATA = JSON.parse(cc.sys.localStorage.getItem("smallWithdrawal") || "{}")
        if (record?.date === today.getTime() && record.count >= 10) {
            startFunc.showToast("今日提现次数已达上限，请明日再来！")
            return
        }

        if (app.user.getItemNum(ITEM.INGOT) < appfunc.SMAILL_CASH_OUT_NUM) {
            startFunc.showToast("提现失败，你的元宝不足！")
            return
        }

        const isWechat = app.getOnlineParam("SmallWithdrawal_type", "wechat") == "wechat"
        if (isWechat) {
            if (!app.datas.ifBindWeixin) {
                if (cc.sys.isNative && (app.platform as AppNative).hasWeChatSession()) {
                    startFunc.showConfirm({
                        title: "绑定微信",
                        content: "<color=#a07f61>红包将提现到您的微信账号，请先绑定微信号</c>",
                        confirmText: "绑定微信",
                        buttonNum: 1,
                        confirmFunc: () => (app.platform as AppNative).bindWeiXin()
                    })
                    return
                }
            }
        } else {
            if (!app.datas.ifBindAliPay) {
                startFunc.showConfirm({
                    title: "绑定支付宝",
                    content: "<color=#a07f61>红包将提现到您的支付宝账号，请先绑定\n支付宝</c>",
                    confirmText: "绑定支付宝",
                    buttonNum: 1,
                    confirmFunc: () => appfunc.showBindZFBPop()
                })
                return
            }
        }

        // activity/money/change?uid=&gameid&pn=&flag=gold
        let params = {
            uid: app.user.guid,
            gameid: app.gameId,
            pn: app.pn,
            flag: "gold",
            money: num,
        }
        params["sign"] = appfunc.sign0(params)

        // params["method"] = "POST"

        http.open(urls.ACTIVE_MONEY_CHANGE, params, (err, res: { order: string, err_code: string }) => {
            if (res) {
                if (res.err_code == "SUCCESS") {
                    storage.setToday(SmallWithdrawal_Get_Award, true)
                    appfunc.showSmallWithdrawalNotice()
                    appfunc.getTaskList(0)
                    appfunc.reloadUserData()
                    let record: RECORD_DATA = JSON.parse(cc.sys.localStorage.getItem("smallWithdrawal") || "{}")
                    if (!record) {
                        record = { date: today.getTime(), count: 1 }
                    } else if (record?.date !== today.getTime()) {
                        record.count = 1
                    } else if (record?.date === today.getTime()) {
                        record.count++
                    }
                    cc.sys.localStorage.setItem("smallWithdrawal", JSON.stringify(record))
                    this.close()
                } else if (res.err_code == "CASH_LIMIT") {
                    startFunc.showToast("每天只能提现1次")
                    // startFunc.showToast("提现次数超过每日限制")
                } else if (res.err_code == "REQUEST_FREQUENT") {
                    startFunc.showToast("请求频繁！")
                } else if (res.err_code === "WAIT_AUDIT") {
                    startFunc.showToast("提现成功，预计1个工作日内到账！")
                } else {
                    cc.log("SmallWithdrawalPop", res)
                    startFunc.showToast("提现失败！")

                    if (app.getOnlineParam("SmallWithdrawal_type", "wechat") != "wechat") {
                        this.$("btn_zfb").active = true
                    }
                }
            }
        })
    }

    onPressToCash(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        audio.playMenuEffect()
        if (!app.datas.cashStatus?.bp_ply_status || appfunc.CASH_OUT_NUM > app.user.getItemNum(ITEM.TO_CASH)) {
            startFunc.showToast(`赢满${appfunc.toCash(appfunc.CASH_OUT_NUM)}元即可提走，请加油赚红包吧~`)
        } else if (app.datas.cashStatus?.bp_ply_status === 1) {
            // let date = new Date(app.datas.cashStatus.bp_reach_time * 1000)
            // let d = date.getFullYear() + "" + ("00" + date.getMonth()).substring(-2) + "" + ("00" + date.getDate()).substring(-2)
            let con = 0
            let lastDay = ""
            let gameCount = 0
            for (let i = 0; i < app.datas.cashTask.length; i++) {
                let d = "" + app.datas.cashTask[i].bg_date
                d = d.substring(0, 4) + "-" + d.substring(4, 6) + "-" + d.substring(6, 8)
                let bgd = new Date(new Date(d).getTime() + 86400000).toLocaleString().substring(0, 9);
                if (!lastDay) {
                    lastDay = new Date(d).toLocaleString().substring(0, 9);
                    gameCount = app.datas.cashTask[i].bg_game_count
                } else if (bgd === lastDay && app.datas.cashTask[i].bg_game_count >= 30) {
                    con++
                    lastDay = new Date(d).toLocaleString().substring(0, 9);
                } else {
                    break
                }
            }
            if (con === 0) {
                if (gameCount < 30) {
                    startFunc.showToast(`再完成${30 - gameCount}局即可提现`)
                } else {
                    startFunc.showToast(`再连续登录4天即可提现`)
                }
            } else {
                if (gameCount < 30) {
                    startFunc.showToast(`再完成${30 - gameCount}局即可提现`)
                } else {
                    startFunc.showToast(`再连续登录${5 - con - 1}天即可提现`)
                }
            }
        } else if (app.datas.cashStatus?.bp_ply_status === 2) {
            let date = new Date(app.datas.cashStatus.bp_reach_time * 1000)
            // let d = date.getFullYear() + "" + ("00" + date.getMonth()).substring(-2) + "" + ("00" + date.getDate()).substring(-2)
            let adCount = 0
            if (app.datas.cashTask?.[0]) {
                adCount = app.datas.cashTask[0].bg_ad_times
            }
            // for (let i = 0; i < app.datas.cashTask.length; i++) {
            //     if (app.datas.cashTask[i].bg_date === d) {
            //         adCount = app.datas.cashTask[i].bg_ad_times
            //         break
            //     }
            // }
            startFunc.showToast(`再观看${50 - adCount}个视频即可提现`)
        } else if (app.datas.cashStatus?.bp_ply_status === 3) {
            if (app.datas.byLevel === 50) {
                startFunc.showToast(`库存不足！`)
            } else {
                startFunc.showToast(`等级达到50级即可提现`)
            }
            // } else if (app.datas.cashStatus.bp_ply_status === 4) {
        }
    }

    onPressAd(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        audio.playMenuEffect()
        ads.receiveAward({
            index: ads.video.SmallWithdrawal,
            success: () => {
                storage.set(SmallWithdrawalPop_Ad_CD, appfunc.accurateTime())
                appfunc.getTaskList(0)
                this.isValid && this.refreshAdButton()
            },
            showAward: false
        })
    }

    @listen("proto_lc_get_at_achieve_list_ack")
    proto_lc_get_at_achieve_list_ack(message: Iproto_lc_get_at_achieve_list_ack) {
        if (!this.ready) {
            return
        }
        if (app.datas.AchieveList) {
            let receiceTask: Iproto_ATAchieveData
            app.datas.AchieveList.forEach((task) => {
                if (checkSmallWithdrawalTask(task) && task.status == 1) {
                    receiceTask = task
                }
            })

            let i = 0
            app.datas.AchieveList.forEach((task) => {
                if (checkSmallWithdrawalTask(task)) {
                    this.scheduleOnce(() => this.updateTask(task, receiceTask), i * 0.05)
                    i++
                }
            })
        }
    }

    @listen("ads_config_update")
    updateTaskStats() {
        if (!app.datas.cashStatus?.bp_ply_status || appfunc.CASH_OUT_NUM > app.user.getItemNum(ITEM.TO_CASH)) {
            const itemNum = app.user.getItemNum(ITEM.TO_CASH)
            const progress = itemNum / appfunc.CASH_OUT_NUM
            this.$("tocash/progress_hb", cc.ProgressBar).progress = progress
            this.$("tocash/value", cc.Label).string = `赢满888元全提走, 还差${appfunc.toCash(appfunc.CASH_OUT_NUM - itemNum)}元`
        } else if (app.datas.cashStatus?.bp_ply_status === 1) {
            let con = 0
            let lastDay = ""
            let gameCount = 0
            for (let i = 0; i < app.datas.cashTask.length; i++) {
                let d = "" + app.datas.cashTask[i].bg_date
                d = d.substring(0, 4) + "-" + d.substring(4, 6) + "-" + d.substring(6, 8)
                let bgd = new Date(new Date(d).getTime() + 86400000).toLocaleString().substring(0, 9);
                if (!lastDay) {
                    lastDay = new Date(d).toLocaleString().substring(0, 9);
                    gameCount = app.datas.cashTask[i].bg_game_count
                } else if (bgd === lastDay && app.datas.cashTask[i].bg_game_count >= 30) {
                    con++
                    lastDay = new Date(d).toLocaleString().substring(0, 9);
                    // gameCount = app.datas.cashTask[i].bg_game_count
                } else {
                    break
                }
            }
            if (con === 0) {
                if (gameCount < 30) {
                    this.$("tocash/progress_hb", cc.ProgressBar).progress = gameCount / 30
                    this.$("tocash/value", cc.Label).string = `连续5天每日玩30局，今日还差${30 - gameCount}局`
                } else {
                    this.$("tocash/progress_hb", cc.ProgressBar).progress = .2
                    this.$("tocash/value", cc.Label).string = `连续5天每日玩30局，还差4天`
                }
            } else {
                if (gameCount < 30) {
                    this.$("tocash/progress_hb", cc.ProgressBar).progress = gameCount / 30
                    this.$("tocash/value", cc.Label).string = `连续5天每日玩30局，今日还差${30 - gameCount}局`
                } else {
                    this.$("tocash/progress_hb", cc.ProgressBar).progress = (con + 1) / 5
                    this.$("tocash/value", cc.Label).string = `连续5天每日玩30局，还差${5 - con - 1}天`
                }
            }
        } else if (app.datas.cashStatus?.bp_ply_status === 2) {
            let date = new Date(app.datas.cashStatus.bp_reach_time * 1000)
            let d = date.getFullYear() + "" + ("00" + date.getMonth()).substring(-2) + "" + ("00" + date.getDate()).substring(-2)
            // let adCount = 0
            // for (let i = 0; i < app.datas.cashTask.length; i++) {
            //     if (app.datas.cashTask[i].bg_date === d) {
            //         adCount = app.datas.cashTask[i].bg_ad_times
            //         break
            //     }
            // }
            let adCount = 0
            if (app.datas.cashTask?.[0]) {
                adCount = app.datas.cashTask[0].bg_ad_times
            }
            this.$("tocash/progress_hb", cc.ProgressBar).progress = adCount / 50
            this.$("tocash/value", cc.Label).string = `今日看50个广告，还差${50 - adCount}个`
        } else if (app.datas.cashStatus?.bp_ply_status === 3) {
            if (app.datas.byLevel === 50) {
                this.$("tocash/progress_hb", cc.ProgressBar).progress = 1
                this.$("tocash/value", cc.Label).string = `所有条件已达成`
            } else {
                this.$("tocash/progress_hb", cc.ProgressBar).progress = app.datas.byLevel / 50
                this.$("tocash/value", cc.Label).string = `游戏等级升级至50级，还差${50 - app.datas.byLevel}级`
            }
            // } else if (app.datas.cashStatus.bp_ply_status === 4) {
            //     this.$("tocash/progress_hb", cc.ProgressBar).progress = 1
            //     this.$("tocash/value", cc.Label).string = `所有条件已达成`
        }
    }
}

function checkSmallWithdrawalTask(task: Iproto_ATAchieveData) {
    return task.cond == TASK.SMALL_WITHDRAWA
}

export function checkSmallWithdrawal() {
    const data = { receive: true, count: 0 }
    if (app.datas.AchieveList && !storage.getToday(SmallWithdrawal_Get_Award)) {
        let unReceiceTask: Iproto_ATAchieveData
        for (const task of app.datas.AchieveList) {
            if (checkSmallWithdrawalTask(task) && task.status == 0) {
                unReceiceTask = task
                break
            }
        }
        if (unReceiceTask) {
            data.receive = unReceiceTask.status == 1
            data.count = Math.max(unReceiceTask.max - unReceiceTask.value, 0)
        }
    }
    return data
}
