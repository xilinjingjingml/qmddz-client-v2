import { audio } from "../../base/audio"
import { math } from "../../base/math"
import { ITEM } from "../../start/config"
import BaseAdPop from "../../start/scripts/components/BaseAdPop"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class Awards extends BaseAdPop {

    params: { awards: IAward[] }
    bannerIndex: number = 0

    start() {
        const awards = this.params?.awards || []

        const model = this.$("item")
        model.removeFromParent()

        const container = this.$("container")

        for (const a of awards) {
            const item = cc.instantiate(model)
            item.parent = container

            const num = a.index != ITEM.TO_CASH ? a.num : math.fixd(appfunc.toCash(a.num)) + "元"
            cc.find("labelDesc", item).getComponent(cc.Label).string = (appfunc.getItemName(a.index) || "未知") + "x" + num

            const info = appfunc.getItemIconInfo(a.index)
            if (info) {
                this.setSprite({ node: cc.find("icon", item), bundle: info.bundle, path: info.path, adjustSize: true })
            }
        }

        model.destroy()
        audio.playEffect({ bundle: "lobby", path: "awards/audios/gxhd" })

        if (awards.some(a => a.index == ITEM.TO_CASH)) {
            audio.playEffect({ bundle: "lobby", path: "awards/audios/hb_coming" })
        }
    }
}
