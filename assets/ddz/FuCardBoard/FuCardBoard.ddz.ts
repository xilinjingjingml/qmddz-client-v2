import { NodeExtends } from "../../base/extends/NodeExtends"
import { listen, monitor } from "../../base/monitor"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { AudioManager } from "../audio/AudioManager.ddz"
import Card from "../card/Card.ddz"
import LordCard from "../card/LordCard.ddz"
import { EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import BaseBoard, { Action_Time, Card_Gap, Card_Scale_End, Card_Scale_Start } from "../scripts/base/BaseBoard.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class FuCardBoard extends BaseBoard {
    isLookCard: boolean

    start() {
        super.start()

        this.isLookCard = false
        this.setDouble(1)
        this.$("btn_lookcard").active = false
        this.$("lookcard_tips").active = false
    }

    @listen(EventName.game_reinit)
    onGameReinit() {
        super.onGameReinit()

        this.isLookCard = false
        this.setDouble(1)
        this.$("btn_lookcard").active = false
        this.$("lookcard_tips").active = false
    }

    setDouble(double: number) {
        this.$("label_double", cc.Label).string = double + ""
    }

    onPressLookCard(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()
        this.onLookCard()
    }

    onLookCard() {
        if (app.user.getItemNum(ITEM.LOOK_LORDCARD) <= 0) {
            monitor.emit(EventName.game_exchange_item, {
                itemId: ITEM.LOOK_LORDCARD,
                success: () => this.isValid && this.onLookCard(),
                fail: () => this.isValid && startFunc.showToast("您的看底牌卡不足，可在寻宝获得！"),
            })
            return
        }

        this.isLookCard = true
        this.$("btn_lookcard").active = false
        this.$("lookcard_tips").active = true
        GameFunc.send<Iproto_cg_look_lord_card_item_req>("proto_cg_look_lord_card_item_req", {})
    }

    onGameStart() {
        super.onGameStart()

        if (GameFunc.isReconnect()) {
            this.$("btn_lookcard").active = false
            this.$("lookcard_tips").active = false
            return
        }

        this.$("btn_lookcard").active = true
    }

    @listen("proto_gc_beishu_info_ack")
    proto_gc_beishu_info_ack(message: Iproto_gc_beishu_info_ack) {
        super.proto_gc_beishu_info_ack(message)

        this.setDouble(this.getDouble())
    }

    @listen("proto_gc_look_lord_card_item_ack")
    proto_gc_look_lord_card_item_ack(message: Iproto_gc_look_lord_card_item_ack) {
        if (message.nRet >= 0) {
            this.isLookCard = true
        }
        if (message.nRet == 0) {
            this.$("lookcard_tips").active = true
        } else if (message.nRet == -4) {
            startFunc.showToast("您的看底牌卡不足，可在寻宝获得！")
            app.user.setItemNum(ITEM.LOOK_LORDCARD, 0)
        } else if (message.nRet < 0) {
            startFunc.showToast("看底牌失败，道具已返还")
        }
    }

    @listen("proto_gc_lord_card_not")
    proto_gc_lord_card_not(message: Iproto_gc_lord_card_not) {
        this.$("btn_lookcard").active = false
        this.$("lookcard_tips").active = false

        if (GameFunc.isReconnect() || !this.isLookCard) {
            super.proto_gc_lord_card_not(message)
            return
        }

        message.vecCards.forEach((card, i) => {
            const pos = this.$("node_card").convertToNodeSpaceAR(this.$("node_lordCard").convertToWorldSpaceAR(cc.v2(-75 * (i - 1), 0)))
            const nodeCard = this.$("node_card").children[i]
            cc.Tween.stopAllByTarget(nodeCard)
            if (message.cLord < 0) {
                cc.tween(nodeCard)
                    .set({ x: -Card_Gap * (i - 1), y: 0, scale: Card_Scale_Start })
                    .to(Action_Time, { scaleX: 0 })
                    .call(() => nodeCard.getComponent(Card).setCard(card))
                    .to(Action_Time, { scaleX: Card_Scale_Start })
                    .start()
            } else {
                cc.tween(nodeCard)
                    .call(() => nodeCard.getComponent(Card).setCard(card))
                    .to(Action_Time, { x: pos.x, y: pos.y, scale: Card_Scale_End })
                    .call(() => {
                        nodeCard.active = false

                        const nodeLordCard = this.$("node_lordCard").children[i]
                        nodeLordCard.active = true
                        nodeLordCard.getComponent(LordCard).setCard(card)
                    })
                    .start()
            }
        })
    }
}
