import { NodeExtends } from "../../base/extends/NodeExtends"
import { listen } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import { appfunc } from "../../lobby/appfunc"
import { ads } from "../../start/ads"
import { ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { AudioManager } from "../audio/AudioManager.ddz"
import { GameFunc } from "../game/GameFunc.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class BaiYuanRegainLosePop extends BasePop {
    params: { message: Iproto_gc_baiyuan_regain_lose_not }

    start() {
        let itemNum = 0
        this.params.message.vecItemInfo.forEach(info => {
            if (info.nItemId == ITEM.TO_CASH) {
                itemNum = info.nItemNum
            }
        })
        this.$("label_value", cc.Label).string = appfunc.toCash(itemNum).toFixed(2) + "元"

        cc.tween(this.$("guang"))
            .by(3, { angle: 360 })
            .repeatForever()
            .start()
    }

    onPressGet(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        ads.receiveAward({
            index: ads.video.New_LuckyGift,
            success: () => this.isValid && GameFunc.send<Iproto_cg_baiyuan_regain_lose_req>("proto_cg_baiyuan_regain_lose_req", {})
        })
    }

    @listen("proto_gc_baiyuan_regain_lose_ack")
    proto_gc_baiyuan_regain_lose_ack(message: Iproto_gc_baiyuan_regain_lose_ack) {
        if (message.cRet == 0) {
            const awards: IAward[] = []
            message.vecItemInfo.forEach(info => awards.push({ index: info.nItemId, num: info.nItemNum }))
            appfunc.showAwardPop(awards, this.removeCloseCallback())
            this.close()
        } else {
            startFunc.showToast("领取失败！")
        }
    }
}
