import { NodeExtends } from "../../base/extends/NodeExtends"
import { math } from "../../base/math"
import { listen, monitor } from "../../base/monitor"
import { time } from "../../base/time"
import { ViewManager } from "../../base/view/ViewManager"
import { appfunc } from "../../lobby/appfunc"
import { checkSmallWithdrawal } from "../../lobby/SmallWithdrawalPop/SmallWithdrawalPop"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM, TASK } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { AudioManager } from "../audio/AudioManager.ddz"
import { EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import { GameView } from "../game/GameView.ddz"
import BaseActivity from "../scripts/base/BaseActivity.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class BaiYuanActivity extends BaseActivity {

    start() {
        this.$("btn_lottery").active = false
        this.$("btn_tomorrow").active = false
        this.$("node_hb_round").active = false
        this.$("btn_hb_round").active = false
        this.$("btn_round").active = false
        this.setTomorrowActive()
        this.setCardCountActive()
        this.setItem(ITEM.TO_CASH, app.user.getItemNum(ITEM.TO_CASH))

        monitor.emit<Iproto_gc_baiyuan_hb_round_not>("proto_gc_baiyuan_hb_round_not", { nCurRound: 0, nLimitRound: 5 })
    }

    @listen(EventName.game_result_next)
    onGameResultNext() {
        this.$("btn_lottery").active = true
        this.$("btn_tomorrow").active = true
        this.setTomorrowActive()
        this.setCardCountActive()
        this.setCashOutParent(this.$("node_bottom_center"), 0)
    }

    @listen(EventName.game_end)
    onGameEnd() {
        this.setCashOutParent(cc.Canvas.instance.node, 10000)
        this.setCardCountActive()
    }

    setCashOutParent(parent: cc.Node, zIndex: number) {
        if (app.getOnlineParam("cashout_type", "SmallWithdrawal") != "SmallWithdrawal") {
            return
        }
        const node = this.$("node_hb")
        const pos = node.convertToWorldSpaceAR(cc.Vec2.ZERO)
        node.removeFromParent(false)
        node.parent = parent
        node.zIndex = zIndex
        node.setPosition(parent.convertToNodeSpaceAR(pos))
    }

    @listen("tomorrow_status_update")
    setTomorrowActive() {
        this.$("btn_tomorrow").active = app.datas.TomorrowStatus.enabled
    }

    @listen("ads_config_update")
    setCardCountActive() {
        this.$("btn_card_count").active = ads.checkCanReceive(ads.video.CardNoteBuyPop) && !GameFunc.isGameRuning()

        if (app.getOnlineParam("cashout_type", "SmallWithdrawal") != "SmallWithdrawal") {
            this.$("node_withdrawal").active = false
            return
        }
        const data = checkSmallWithdrawal()
        this.$("node_withdrawal").active = !data.receive && !GameFunc.isGameRuning()
        this.$("label_withdrawal", cc.Label).string = data.count > 0 ? `还需观看视频${data.count}次` : "可立即提现"
    }

    @listen("item_update")
    setItem(itemId: ITEM, itemNum: number) {
        if (itemId != ITEM.TO_CASH) {
            return
        }

        // 下方红包进度
        const progress = itemNum / appfunc.CASH_OUT_NUM
        this.$("progress_hb", cc.ProgressBar).progress = progress
        this.$("label_progress_hb", cc.Label).string = Math.floor(progress * 100) + "%"

        // 红包信息
        this.$("label_hb", cc.Label).string = GameFunc.toHBString(itemNum)
        this.$("label_hb_left", cc.Label).string = appfunc.toCash(math.sub(appfunc.CASH_OUT_NUM, itemNum)) + ""
    }

    onPressCashOut(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()
        appfunc.showCashOutPop({ isGameRuning: GameFunc.isGameRuning() })
    }

    onPressFreeLose(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()
        if (app.user.getItemNum(ITEM.FREE_LOSE) <= 0) {
            startFunc.showToast("您的免扣符不足，每日礼包或下局免输可领取！")
            return
        }

        startFunc.showToast("本局输分免扣哦！")
    }

    onPressRoundHB(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()
        for (const task of app.datas.AchieveList) {
            if (task.index == TASK.HB_ROUND) {
                if (task.status == 0 && task.value >= task.max) {
                    GameView.showRoundHBPop({ message: task })
                }
                break
            }
        }
    }

    refreshHBRound(now: number, sum: number) {
        now = Math.min(now, sum)
        this.$("label_hb_round", cc.Label).string = (sum - now) + ""
        this.$("label_progress_hb_round", cc.Label).string = now + "/" + sum
        this.$("progress_hb_round", cc.ProgressBar).progress = now / sum
    }

    @listen(EventName.game_start)
    onGameStart() {
        this.$("btn_lottery").active = false
        this.$("btn_card_count").active = false
        this.$("btn_tomorrow").active = false
        ViewManager.close("cashout")

        this.setCardCountActive()
    }

    @listen("proto_gc_baiyuan_hb_round_not")
    proto_gc_baiyuan_hb_round_not(message: Iproto_gc_baiyuan_hb_round_not) {
        this.$("btn_hb_round").active = true
        this.refreshHBRound(message.nCurRound, message.nLimitRound)
    }

    @listen("proto_lc_get_at_achieve_list_ack")
    proto_lc_get_at_achieve_list_ack(message: Iproto_lc_get_at_achieve_list_ack) {
        if (app.datas.AchieveList && app.datas.regtime > Math.floor(time.toTimeStamp(app.getOnlineParam("round_hb_regtime") ?? "202102041110").getTime() / 1000)) {
            let task: Iproto_ATAchieveData
            for (const item of app.datas.AchieveList) {
                if (item.index == TASK.HB_ROUND) {
                    task = item
                    break
                }
            }

            if (task == null || task.status == 1) {
                this.$("btn_round").active = false
            } else {
                this.$("btn_round").active = true
                this.$("round_hb_title").active = task.value < task.max
                this.$("label_round", cc.Label).string = "" + Math.max(task.max - task.value, 0)
                this.$("round_hb_get").active = task.value >= task.max
            }
        }
    }
}
