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

@ccclass
export default class SmallWithdrawalPop extends BasePop {
    params: { isGameRuning: boolean }
    taskItems: { node: cc.Node, task: Iproto_ATAchieveData }[] = []
    ready: boolean = false

    start() {
        this.$("item").active = false
        this.setItem(ITEM.TO_CASH, app.user.getItemNum(ITEM.TO_CASH))
        this.refreshAdButton()
        appfunc.getTaskList(0)
        this.scheduleOnce(() => { this.ready = true; this.proto_lc_get_at_achieve_list_ack(null) }, 0.25)
    }

    @listen("item_update")
    setItem(itemId: ITEM, itemNum: number) {
        if (itemId != ITEM.TO_CASH) {
            return
        }

        // 红包信息
        this.$("label_hb", cc.Label).string = math.fixd(appfunc.toCash(itemNum))

        // 下方红包进度
        const progress = itemNum / appfunc.CASH_OUT_NUM
        this.$("progress_hb", cc.ProgressBar).progress = progress
        this.$("label_progress_hb", cc.Label).string = Math.floor(progress * 100) + "%"
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
        utils.$($, "btn_get").active = task.status == 0 && task.value >= task.max
        utils.$($, "icon_receive").active = task.status == 1
        utils.$($, "label_desc", cc.Label).string = desc

        const progress = Math.min(task.value / task.max, 1)
        utils.$($, "progress", cc.ProgressBar).progress = progress
        utils.$($, "label_progress", cc.Label).string = Math.round(progress * 100) + "%"
    }

    onPressGet(event: cc.Event.EventTouch, taskIds: string) {
        NodeExtends.cdTouch(event)
        audio.playMenuEffect()

        const taskId = Number(taskIds)
        for (const item of this.taskItems) {
            if (item.task.index == taskId) {
                break
            }
            if (item.task.status == 0) {
                startFunc.showToast("请先提现上一档次红包")
                return
            }
        }
        const isWechat = (app.getOnlineParam("SmallWithdrawal_type", "wechat") == "wechat") //TODOT  
        if (isWechat) {
            if (!app.datas.ifBindWeixin) {
                if (cc.sys.isNative && (app.platform as AppNative).hasWeChatSession()) {
                    startFunc.showConfirm({
                        title: "绑定微信",
                        content: "<color=#a07f61>红包将提现到您的微信账号，请先绑定\n微信号</c>",
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
        console.log("jin---绑定信息：", app.datas.ifBindWeixin, app.user.guid, app.gameId, app.pn, isWechat, taskId)
        http.open(urls.ACTIVE_MONEY_CHANGE, {
            uid: app.user.guid,
            gameid: app.gameId,
            pn: app.pn,
            sendMoneyType: isWechat ? "" : "aliPay",
            flag: "taskCash",
            param: taskId,
        }, (err, res: { order: string, err_code: string }) => {
            console.log("jin---提现：", res)
            if (res) {
                if (res.err_code == "SUCCESS") {
                    storage.setToday(SmallWithdrawal_Get_Award, true)
                    appfunc.showSmallWithdrawalNotice()
                    appfunc.getTaskList(0)
                    appfunc.reloadUserData()
                } else if (res.err_code == "CASH_LIMIT") {
                    startFunc.showToast("每天只能提现1次")
                    // startFunc.showToast("提现次数超过每日限制")
                } else if (res.err_code == "REQUEST_FREQUENT") {
                    startFunc.showToast("请求频繁！")
                } else {
                    cc.log("SmallWithdrawalPop", res)
                    startFunc.showToast("提现失败！")

                    if (app.getOnlineParam("SmallWithdrawal_type", "wechat") != "wechat") {//TODOT "wechat" 
                        this.$("btn_zfb").active = true
                    }
                }
            }
        })
    }

    onPressToCash(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        audio.playMenuEffect()
        if (app.user.getItemNum(ITEM.TO_CASH) >= appfunc.CASH_OUT_NUM) {
            startFunc.showToast("库存不足！请明日再来")
        } else {
            startFunc.showToast(`余额不足，余额满${appfunc.toCash(appfunc.CASH_OUT_NUM)}元可提现`)
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
