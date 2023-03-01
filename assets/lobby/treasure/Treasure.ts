import { audio } from "../../base/audio"
import { NodeExtends } from "../../base/extends/NodeExtends"
import BasePop from "../../base/view/BasePop"
import { ViewManager } from "../../base/view/ViewManager"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class Treasure extends BasePop {

    start() {
        this.initView()
        this.updateStatus()
    }

    initView() {
        const awards = app.getOnlineParam("TreasureHunt_awards") || [
            { index: ITEM.REDPACKET_TICKET, num: "60~600" },
            { index: ITEM.GOLD_COIN, num: "2万~20万" },
            { index: ITEM.CARD_RECORD, num: "1~5" },
            { index: ITEM.LOOK_LORDCARD, num: "1~5" },
            { index: ITEM.SUPER_JIABEI, num: "1~5" }
        ]

        const container = this.$("container")

        const model = container.children[0]
        model.removeFromParent()

        for (const val of awards) {
            const item = cc.instantiate(model)

            const icon = cc.find("item_" + val.index, item)
            icon && (icon.active = true)
            cc.find("desc", item).getComponent("cc.Label").string = appfunc.getItemName(val.index) + ":" + val.num

            container.addChild(item)
        }

        model.destroy()

        const chests = this.$("chests").children
        for (let i = 0, len = chests.length; i < len; i++) {
            const target = chests[i].getChildByName("box")
            cc.tween(target)
                .delay(0.5 * i)
                .then(cc.tween().to(1, { x: 2, y: 10 }).to(1, { x: 2, y: 0 }))
                .repeatForever()
                .start()
        }
    }

    updateStatus() {
        const canReceive = ads.checkCanReceive(ads.video.TreasureHunt)
        const chests = this.$("chests").children

        for (const chest of chests) {
            chest.getChildByName("open").active = canReceive
            chest.getChildByName("gray").active = !canReceive
        }

        this.$("labelLeft", cc.Label).string = "" + ads.getVideoLeftTimes(ads.video.TreasureHunt)
    }

    onPressChest(event: cc.Event.EventTouch) {
        audio.playMenuEffect()
        NodeExtends.cdTouch(event)
        ads.receiveAward({
            index: ads.video.TreasureHunt,
            success: () => {
                this.isValid && this.updateStatus()
            }
        })
    }

    onPressHelp() {
        audio.playMenuEffect()
        ViewManager.showPopup({ bundle: "lobby", path: "treasure/help" })
    }
}
