import { audio } from "../../base/audio"
import { listen } from "../../base/monitor"
import BaseView from "../../base/view/BaseView"
import { checkBless } from "../ActivityBless/bless/ActivityBless"
import { checkSign } from "../ActivitySign/ActivitySign"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

enum ActivityTab {
    Sign = 1,
    Bless,
}

@ccclass
export default class activity extends BaseView {

    start() {
        const zone = appfunc.getActivityTimeZone()
        this.$("label_time", cc.Label).string = `活动时间：${zone.begin.substr(0, 4)}.${zone.begin.substr(4, 2)}.${zone.begin.substr(6, 2)}~${zone.end.substr(0, 4)}.${zone.end.substr(4, 2)}.${zone.end.substr(6, 2)}`

        this.checkSignMark()
        this.checkBlessMark()

        this.setTab(ActivityTab.Bless)
        this.$("toggle2", cc.Toggle).check()
    }

    onPressTab(toggle: cc.Toggle, data: string) {
        audio.playMenuEffect()
        this.setTab(parseInt(data))
    }

    setTab(tab: ActivityTab) {
        this.$("node_sign").active = tab == ActivityTab.Sign
        this.$("node_bless").active = tab == ActivityTab.Bless
    }

    @listen("activity_sign_update")
    checkSignMark() {
        const node = this.$("toggle1").getChildByName("mark")
        node.active = false
        checkSign(can => {
            if (this.isValid) {
                node.active = can
            }
        })
    }

    @listen("activity_bless_update")
    checkBlessMark() {
        const node = this.$("toggle2").getChildByName("mark")
        node.active = false
        checkBless(can => {
            if (this.isValid) {
                node.active = can
            }
        })
    }
}
