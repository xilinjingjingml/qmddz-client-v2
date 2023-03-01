import { listen } from "../../../base/monitor"
import BaseView from "../../../base/view/BaseView"
import Card from "../../card/Card.ddz"
import LordCard from "../../card/LordCard.ddz"
import { EPlayer, EventName } from "../../game/GameConfig.ddz"
import { GameFunc } from "../../game/GameFunc.ddz"

const { ccclass, property } = cc._decorator

export const Action_Time = 0.2625
export const Card_Scale_Start = 0.8
export const Card_Scale_End = 0.4
export const Card_Gap = 126

@ccclass
export default class BaseBoard extends BaseView {

    @property({ type: cc.Prefab })
    lordCard: cc.Prefab = null

    @property({ type: cc.Prefab })
    card: cc.Prefab = null

    start() {
        this.node.active = false

        for (let i = 0; i < 3; i++) {
            const nodeLordCard = cc.instantiate(this.lordCard)
            nodeLordCard.parent = this.$("node_lordCard")
            nodeLordCard.active = false

            const nodeCard = cc.instantiate(this.card)
            nodeCard.parent = this.$("node_card")
            nodeCard.active = false
        }
    }

    @listen(EventName.game_reinit)
    onGameReinit() {
        this.$("node_card").children.forEach(child => child.active = false)
        this.$("node_lordCard").children.forEach(child => child.active = false)
    }

    getDouble() {
        const chairId = GameFunc.getPlayer(EPlayer.Me)?.data?.chairId
        if (chairId == null) {
            return 1
        }
        return GameFunc.getDouble(chairId)
    }

    @listen(EventName.game_start)
    onGameStart() {
        this.node.active = true

        if (GameFunc.isReconnect()) {
            return
        }

        this.$("node_card").children.forEach((child, i) => {
            child.x = -Card_Gap * (i - 1)
            child.y = 0
            child.scale = Card_Scale_Start
            child.active = true
            child.getComponent(Card).setCardBack(true)
            cc.Tween.stopAllByTarget(child)
        })
    }

    @listen("proto_gc_beishu_info_ack")
    proto_gc_beishu_info_ack(message: Iproto_gc_beishu_info_ack) {
        GameFunc.setDouble(message)
    }

    @listen("proto_gc_send_dizhu_not")
    proto_gc_send_dizhu_not(message: Iproto_gc_send_dizhu_not) {
        GameFunc.setDizhu(message.nGameMoney)
    }

    @listen("proto_gc_lord_card_not")
    proto_gc_lord_card_not(message: Iproto_gc_lord_card_not) {
        if (GameFunc.isReconnect()) {
            message.vecCards.forEach((card, i) => {
                const nodeLordCard = this.$("node_lordCard").children[i]
                nodeLordCard.active = true
                nodeLordCard.getComponent(LordCard).setCard(card)
            })
            return
        }

        message.vecCards.forEach((card, i) => {
            const pos = this.$("node_card").convertToNodeSpaceAR(this.$("node_lordCard").convertToWorldSpaceAR(cc.v2(-75 * (i - 1), 0)))
            const nodeCard = this.$("node_card").children[i]
            cc.Tween.stopAllByTarget(nodeCard)
            cc.tween(nodeCard)
                .set({ x: -Card_Gap * (i - 1), y: 0, scale: Card_Scale_Start })
                .to(Action_Time, { scaleX: 0 })
                .call(() => nodeCard.getComponent(Card).setCard(card))
                .to(Action_Time, { scaleX: Card_Scale_Start })
                .to(Action_Time, { x: pos.x, y: pos.y, scale: Card_Scale_End })
                .call(() => {
                    nodeCard.active = false

                    const nodeLordCard = this.$("node_lordCard").children[i]
                    nodeLordCard.active = true
                    nodeLordCard.getComponent(LordCard).setCard(card)
                })
                .start()
        })
    }
}
