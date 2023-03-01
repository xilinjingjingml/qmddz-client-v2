import { audio } from "../../base/audio"
import { NodeExtends } from "../../base/extends/NodeExtends"
import BasePop from "../../base/view/BasePop"
import { ads } from "../../start/ads"

const { ccclass } = cc._decorator

@ccclass
export default class DailyGift extends BasePop {

    start() {
        const canReceive = ads.checkCanReceive(ads.video.New_DailyGift)
        this.$("get").active = canReceive
        this.$("gray").active = !canReceive
    }

    onPressGet(event: cc.Event.EventTouch) {
        audio.playMenuEffect()
        NodeExtends.cdTouch(event)

        ads.receiveAward({
            index: ads.video.New_DailyGift,
            success: () => {
                this.isValid && this.close()
            },
            closeCallback: this.removeCloseCallback()
        })
    }
}