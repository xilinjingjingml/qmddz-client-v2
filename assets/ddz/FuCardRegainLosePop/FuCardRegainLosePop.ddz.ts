import { NodeExtends } from "../../base/extends/NodeExtends"
import { listen } from "../../base/monitor"
import { appfunc } from "../../lobby/appfunc"
import { ads } from "../../start/ads"
import { ITEM } from "../../start/config"
import BaseAdPop from "../../start/scripts/components/BaseAdPop"
import { startFunc } from "../../start/startFunc"
import { AudioManager } from "../audio/AudioManager.ddz"
import { GameFunc } from "../game/GameFunc.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class FuCardRegainLosePop extends BaseAdPop {
    params: { message: Iproto_gc_regain_lose_score_ack }
    itemId: number = 0
    itemNum: number = 0

    start() {
        const nValue = this.params.message.nValue
        this.$("label_money", cc.Label).string = nValue.reduce((total, n) => total + n) + ""

        this.$("label_desc").active = nValue.length > 1

        this.$("label_get").active = this.params.message.nRet == 0 && nValue.length > 0
        this.$("label_get", cc.Label).string = `${(this.params.message.nCurCount + 1)}/${nValue.length}`

        let time = this.params.message.nTime
        let fakeTime = Math.min(time, 20)
        const next = () => {
            this.$("label_time", cc.Label).string = fakeTime + "s"
            this.$("node_time").active = fakeTime > 0
            fakeTime--

            time--
            if (time < 0) {
                this.unscheduleAllCallbacks()
                this.close()
            }
        }
        next()
        this.schedule(next, 1)
    }

    onPressGet(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        if (this.params.message.nRet == 2) {
            this.send_proto_cg_regain_lose_score_req()
            return
        }

        ads.receiveAward({
            index: ads.video.Exemption,
            success: () => this.isValid && this.send_proto_cg_regain_lose_score_req()
        })
    }

    send_proto_cg_regain_lose_score_req() {
        GameFunc.send<Iproto_cg_regain_lose_score_req>("proto_cg_regain_lose_score_req", {
            nOp: 1,
            nItemIndex: this.itemId,
            nItemNum: this.itemNum,
        })
    }

    @listen("proto_gc_regain_lose_score_ack")
    proto_gc_regain_lose_score_ack(message: Iproto_gc_regain_lose_score_ack) {
        // console.log("jin---Iproto_gc_regain_lose_score_ack: ", message)
        if (message.nRet == 1) {
            const awards: IAward[] = [{ index: ITEM.GOLD_COIN, num: this.params.message.nValue[this.params.message.nCurCount] }]
            if (message.nItemIndex >= 0 && message.nItemIndex < 10000 && message.nItemNum > 0) {
                if (message.nItemIndex == awards[0].index) {
                    awards[0].num += message.nItemNum
                } else {
                    awards.push({ index: message.nItemIndex, num: message.nItemNum })
                }
            }
            appfunc.showAwardPop(awards, this.removeCloseCallback())
            this.close()
        } else if (message.nRet < 0) {
            let msg = "领取失败！"
            switch (message.nRet) {
                case -1:
                    msg = "没开启功能"
                    break
                case -2:
                    msg = "游戏开始了"
                    break
                case -3:
                    msg = "没有单次次数"
                    break
                case -4:
                    msg = "超出时间"
                    break
                case -5:
                    msg = "输的金额领完了"
                    break
                case -6:
                    msg = "查询 超时"
                    break
                case -7:
                    msg = "每日次数用完了"
                    break
                case -8:
                    return
                    msg = "查询 没有输的金额"
                    break
                default:
                    break
            }
            startFunc.showToast(msg)
            this.close()
        }
    }
}
