import { NodeExtends } from "../../base/extends/NodeExtends"
import { listen } from "../../base/monitor"
import { appfunc } from "../../lobby/appfunc"
import { ads } from "../../start/ads"
import BaseAdPop from "../../start/scripts/components/BaseAdPop"
import { startFunc } from "../../start/startFunc"
import { AudioManager } from "../audio/AudioManager.ddz"
import { GameFunc } from "../game/GameFunc.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class FuCardWinDoublePop extends BaseAdPop {
    params: { message: Iproto_gc_win_doubel_req, money: number }

    start() {
        this.$("node_money").active = !!this.params.money
        this.$("label_money", cc.Label).string = this.params.money + ""

        this.$("node_add").active = this.params.message.nAddProbabily > 0
        this.$("label_add", cc.Label).string = this.params.message.nAddAmount + ""
    }

    onPressGet(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        ads.receiveAward({
            index: ads.video.WinDouble,
            success: () => this.isValid && GameFunc.send<Iproto_cg_win_doubel_req>("proto_cg_win_doubel_req", {})
        })
    }

    @listen("proto_gc_win_doubel_ack")
    proto_gc_win_doubel_ack(message: Iproto_gc_win_doubel_ack) {
        if (message.cRet == 0) {
            const awards: IAward[] = []
            message.vecItemInfo.forEach(info => awards.push({ index: info.nItemIndex, num: info.nItemNum }))
            appfunc.showAwardPop(awards, this.removeCloseCallback())
            this.close()
        } else {
            startFunc.showToast("领取失败！")
        }
    }
}
