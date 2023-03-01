import { listen } from "../../base/monitor"
import { storage } from "../../base/storage"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import BaseAdPop from "../../start/scripts/components/BaseAdPop"
import { AudioManager } from "../audio/AudioManager.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import { appfunc } from "../../lobby/appfunc"
import { WeChatMiniGame } from "../../start/scripts/platforms/WeChatMiniGame"

const { ccclass } = cc._decorator

@ccclass
export default class FuCardRoundPop extends BaseAdPop {
    params: { message: Iproto_gc_get_redpackets_award_ack }
    selectIndex: number = 0
    manualBanner: boolean = true
    bannerIndex: number = ads.banner.FuCardBoard

    start() {
        this.setItem(ITEM.REDPACKET_TICKET, app.user.getItemNum(ITEM.REDPACKET_TICKET))

        for (let i = 0; i < 3; i++) {
            const node = this.$("btn_fucard_" + i)
            cc.find("icon_fucard", node).active = true
            cc.find("open_fucard", node).active = false
        }

        this.$("node_rain").active = false
        this.$("spine").active = false

        this.playAni()

        if (appfunc.checkSpecialAward()) {//app.getOnlineParam("app_review")
            this.$("node_fucard").active = false
        }
    }

    onNodeSizeChange() {
        this.resizeBanner(this.$("node_popup"))
        this.$("node_top").y = this.$("node_popup").y
        super.onNodeSizeChange()
    }

    playAni() {
        this.setButton(false)

        const itmes = this.params.message.fakeItem.slice()
        itmes.push({
            nItemIndex: this.params.message.cItemtype,
            nItemNum: this.params.message.nAmount,
            nItemNum64: this.params.message.nAmount,
        })
        itmes.sort(() => Math.random() > 0.5 ? 1 : -1)

        const infos: { x: number, y: number, angle: number }[] = []
        for (let i = 0; i < 3; i++) {
            const node = this.$("btn_fucard_" + i)
            cc.find("icon_fucard", node).active = false
            cc.find("open_fucard", node).active = true

            cc.find("open_fucard/label_value", node).getComponent(cc.Label).string = itmes[i].nItemNum + ""

            infos.push({ x: node.x, y: node.y, angle: node.angle })
        }

        for (let i = 0; i < 3; i++) {
            const node = this.$("btn_fucard_" + i)
            cc.tween(node)
                .delay(1)
                .to(0.2, { scaleX: 0 })
                .call(() => {
                    cc.find("icon_fucard", node).active = true
                    cc.find("open_fucard", node).active = false
                })
                .to(0.2, { scaleX: 1 })
                .to(0.3, { x: infos[1].x, y: infos[1].y, angle: infos[1].angle })
                .delay(0.2)
                .to(0.3, { x: infos[i].x, y: infos[i].y, angle: infos[i].angle })
                .call(() => i == 0 && this.playSpineAni())
                .start()
        }
    }

    playSpineAni() {
        this.setButton(true)

        if (app.datas.role.roundSum <= 10 && app.getOnlineParam("GameRedPacketAwardLaye_finger", false) && storage.get("GameRedPacketAwardLayer_Finger", true)) {
            storage.set("GameRedPacketAwardLayer_Finger", false)
            this.$("spine").active = true
        }
    }

    @listen("item_update")
    setItem(itemId: ITEM, itemNum: number) {
        if (itemId != ITEM.REDPACKET_TICKET) {
            return
        }

        this.$("label_fucard", cc.Label).string = itemNum + "≈" + GameFunc.toFuCardString(itemNum)
    }

    onPressGet(event: cc.Event.EventTouch, data: string) {
        this.setButton(false)
        this.scheduleOnce(() => this.setButton(true), 3)

        AudioManager.playMenuEffect()
        this.$("spine").active = false

        ads.receiveAward({
            index: ads.video.DrawRedpacket,
            success: () => {
                if (!this.isValid) {
                    return
                }

                this.selectIndex = parseInt(data)
                GameFunc.send<Iproto_cg_get_redpackets_award_req>("proto_cg_get_redpackets_award_req", { type: 1 })
            }
        })
    }

    setButton(interactable: boolean) {
        for (let i = 0; i < 3; i++) {
            this.$("btn_fucard_" + i, cc.Button).interactable = interactable
        }
    }

    showRoundAni(items: Iproto_player_itemInfo[]) {
        this.unscheduleAllCallbacks()
        this.setButton(false)

        const centerIndex = 1
        if (this.selectIndex == centerIndex) {
            this.playRoundAni(items)
            return
        }

        const t = 0.3
        const nodeCenter = this.$("btn_fucard_" + centerIndex)
        const nodeSelect = this.$("btn_fucard_" + this.selectIndex)
        cc.Tween.stopAllByTarget(nodeCenter)
        cc.tween(nodeCenter)
            .to(t, { x: nodeSelect.x, y: nodeSelect.y, angle: nodeSelect.angle })
            .start()

        cc.Tween.stopAllByTarget(nodeSelect)
        cc.tween(nodeSelect)
            .to(t, { x: nodeCenter.x, y: nodeCenter.y, angle: nodeCenter.angle })
            .call(() => this.playRoundAni(items))
            .start()
    }

    playRoundAni(items: Iproto_player_itemInfo[]) {
        const t = 0.3
        for (let i = 0; i < 3; i++) {
            const data = items[i]
            const node = this.$("btn_fucard_" + i)
            cc.find("open_fucard/label_value", node).getComponent(cc.Label).string = data.nItemNum + ""

            cc.Tween.stopAllByTarget(node)
            if (i == this.selectIndex) {
                continue
            }
            cc.tween(node)
                .to(t, { scaleX: 0 })
                .call(() => {
                    cc.find("icon_fucard", node).active = false
                    cc.find("open_fucard", node).active = true
                })
                .to(t, { scaleX: 1 })
                .start()
        }

        const mask = this.$("mask")
        cc.Tween.stopAllByTarget(mask)
        cc.tween(mask)
            .set({ opacity: 0 })
            .to(t, { opacity: 180 })
            .start()

        const nodeSelect = this.$("btn_fucard_" + this.selectIndex)
        const pos = nodeSelect.convertToWorldSpaceAR(cc.Vec2.ZERO)
        nodeSelect.removeFromParent(false)
        nodeSelect.parent = this.$("node_mask")
        nodeSelect.setPosition(nodeSelect.convertToNodeSpaceAR(pos))

        cc.Tween.stopAllByTarget(nodeSelect)
        cc.tween(nodeSelect)
            .to(t, { scaleX: 0, scaleY: 1.1 })
            .call(() => {
                cc.find("icon_fucard", nodeSelect).active = false
                cc.find("open_fucard", nodeSelect).active = true
            })
            .to(t, { scaleX: 1.2, scaleY: 1.2 })
            .call(() => this.$("node_rain").active = true)
            .delay(3)
            .call(() => this.close())
            .start()
    }

    @listen("proto_gc_get_redpackets_award_ack")
    proto_gc_get_redpackets_award_ack(message: Iproto_gc_get_redpackets_award_ack) {
        if (message.ret == 2) {
            const itmes = message.fakeItem.slice()
            itmes.sort(() => Math.random() > 0.5 ? 1 : -1)
            itmes.splice(this.selectIndex, 0, {
                nItemIndex: message.cItemtype,
                nItemNum: message.nAmount,
                nItemNum64: message.nAmount,
            })
            this.showRoundAni(itmes)
        }
    }

}
