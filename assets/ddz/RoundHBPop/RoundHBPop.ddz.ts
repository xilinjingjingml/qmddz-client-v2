import { NodeExtends } from "../../base/extends/NodeExtends"
import { listen } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import { appfunc } from "../../lobby/appfunc"
import { ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { AudioManager } from "../audio/AudioManager.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class RoundHBPop extends BasePop {
    params: { message: Iproto_ATAchieveData }

    start() {
        let value = 10
        for (const award of this.params.message.vecAwards) {
            if (award.itemIndex == ITEM.TO_CASH) {
                value = appfunc.toCash(award.itemNum)
            }
        }

        this.$("label_money", cc.Label).string = "" + value
    }

    onPressGet(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()
        appfunc.getTaskAward(this.params.message.gameId, this.params.message.index)
    }

    @listen("proto_lc_get_at_achieve_award_ack")
    proto_lc_get_at_achieve_award_ack(message: Iproto_lc_get_at_achieve_award_ack) {
        if (message.ret == 0) {
            const awards: IAward[] = []
            message.vecAwards.forEach(info => awards.push({ index: info.itemIndex, num: info.itemNum }))
            appfunc.showAwardPop(awards, this.removeCloseCallback())

            this.close()
            appfunc.getTaskList(0)
            appfunc.reloadUserData()
        } else {
            startFunc.showToast("领取出错啦")
        }
    }
}
