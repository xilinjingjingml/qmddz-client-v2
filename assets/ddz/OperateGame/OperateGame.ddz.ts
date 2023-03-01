import { NodeExtends } from "../../base/extends/NodeExtends"
import { listen, monitor } from "../../base/monitor"
import { AudioManager } from "../audio/AudioManager.ddz"
import { EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import { GameRule } from "../game/GameRule.ddz"
import { EButton } from "../OperateButton/OperateButton.ddz"
import BaseChair from "../scripts/base/BaseChair.ddz"
import HandCard from "./HandCard.ddz"

const { ccclass } = cc._decorator

/**
 * 玩家操控
 */
@ccclass
export default class OperateGame extends BaseChair {
    params: { chairId: number } = { chairId: 0 }
    handCard: HandCard

    nSerialID: number
    nBombTips: number
    nowcChairID: number
    nowCardType: Iproto_CCardsType
    tipCards: Iproto_CCard[][]
    tipCardsIndex: number
    isYaoBuQi: boolean

    start() {
        this.handCard = this.$("node_handcard", HandCard)
        this.onGameReinit()
    }

    @listen(EventName.game_reinit)
    onGameReinit() {
        this.nowcChairID = 0
        this.nBombTips = -1
        this.hideBombNumAni()
        this.hideChuPaiTip()
        this.setAuto(false)
    }

    @listen(EventName.game_OperateButton_onPressTiShi)
    onOperateGameTiShi() {
        if (this.tipCards.length == 0) {
            this.chupai([])
            return
        }

        if (this.tipCardsIndex >= this.tipCards.length) {
            this.tipCardsIndex = 0
        }
        this.handCard.seleteCards(this.tipCards[this.tipCardsIndex++])
    }

    @listen(EventName.game_OperateButton_onPressChuPai)
    onOperateGameChuPai() {
        this.chupai(this.handCard.getSeleteCards())
    }

    chupai(cards: Iproto_CCard[]) {
        if (cards.length > 0) {
            //提前移除手牌中出掉的牌
            let cardType = this.nowCardType
            if (this.nowcChairID == this.params.chairId || this.nowCardType.mNTypeNum == 0) {
                cardType = { mNTypeNum: 0, mNTypeValue: 0, mNTypeBomb: 0 }
            }

            // 检测是否选中的牌
            if (!GameRule.checkChooseCardsType(cards, this.handCard.cards, cardType)) {
                this.showChuPaiTip(this.$("operate_tips_choose_error"))
                return
            }

            const handCards = this.handCard.cards.slice()
            cards.forEach(card => {
                for (let i = handCards.length - 1; i >= 0; i--) {
                    const handCard = handCards[i]
                    if (handCard.mNValue == card.mNValue && handCard.mNColor == card.mNColor) {
                        handCards.splice(i, 1)
                        break
                    }
                }
            })

            monitor.emit<Iproto_gc_refresh_card_not>("proto_gc_refresh_card_not", {
                cChairID: GameFunc.getSMyChairId(),
                vecCards: handCards,
            })

            monitor.emit<Iproto_gc_play_card_not>("proto_gc_play_card_not", {
                cChairID: GameFunc.getSMyChairId(),
                vecCards: cards,
                cType: GameRule.m_chooseCardType
            })
        }

        GameFunc.send<Iproto_cg_play_card_ack>("proto_cg_play_card_ack", {
            nSerialID: this.nSerialID,
            cTimeOut: 0,
            vecCards: cards,
        })
    }

    onPressAuto(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        this.$("node_auto").active = false
        GameFunc.send<Iproto_cg_auto_req>("proto_cg_auto_req", {
            cAuto: 0,
        })
    }

    showPutButtons() {
        if (this.$("node_auto").active) {
            return
        }

        let operate: EButton
        if (this.nowcChairID == this.params.chairId || this.nowCardType.mNTypeNum == 0) {
            if (this.handCard.cards.length == 1) {
                this.chupai(this.handCard.cards)
                return
            }

            // 自己出牌
            GameRule.tipsAuto(this.handCard.cards)

            operate = EButton.ChuPai
        } else {
            // 接别人的牌
            GameRule.tips(this.handCard.cards, this.nowCardType)

            operate = EButton.JiePai
        }

        this.isYaoBuQi = false
        this.tipCardsIndex = 0
        this.tipCards = GameRule.m_tipCards

        if (this.tipCards.length == 0) {
            this.isYaoBuQi = true
            operate = EButton.YaoBuQi
            // 无牌大过上家
            this.showChuPaiTip(this.$("operate_tips_no_choose"))
        } else if (this.tipCards.length == 1) {
            // 只有一种配能接 弹出提示
            this.onOperateGameTiShi()
        }

        monitor.emit(EventName.game_OperateButton_showPutButtons, operate)
    }

    setAuto(active: boolean) {
        this.handCard.setBlackCards(active)
        this.$("node_auto").active = active
    }

    hideChuPaiTip() {
        [this.$("operate_tips_choose_error"), this.$("operate_tips_no_choose")].forEach(node => node.active = false)
    }

    showChuPaiTip(node: cc.Node) {
        this.hideChuPaiTip()
        node.active = true
        cc.Tween.stopAllByTarget(node)
        cc.tween(node)
            .set({ opacity: 0 })
            .to(0.25, { opacity: 255 })
            .delay(1)
            .to(0.25, { opacity: 0 })
            .call(() => { node.active = false })
            .start()
    }

    hideBombNumAni() {
        for (let i = 1; i < 5; i++) {
            this.$("bomb_tips_" + i).active = false
        }
    }

    playBombNumAni(bomb: number) {
        const node = this.$("bomb_tips_" + bomb)
        if (node == null) {
            return
        }

        node.active = true
        cc.tween(node)
            .set({ x: 0, opacity: 255 })
            .parallel(
                cc.tween().to(1.2, { x: 300 }, { easing: "cubicOut" }),
                cc.tween().delay(1).to(0.2, { opacity: 0 })
            )
            .call(() => {
                node.active = false
                if (bomb < this.nBombTips) {
                    this.playBombNumAni(bomb + 1)
                }
            })
            .start()
    }

    @listen(EventName.game_deal_card_num)
    onDealCard(n: number) {
        const bomb = GameRule.countBomb(this.handCard.cards.slice(0, n))
        if (this.nBombTips == bomb) {
            return
        }
        this.nBombTips = bomb

        for (let i = 1; i < 5; i++) {
            if (this.$("bomb_tips_" + i).active) {
                return
            }
        }

        this.playBombNumAni(bomb)
    }

    @listen(EventName.clock_timeout)
    onClockTimout(chairId: number) {
        if (chairId != this.params.chairId) {
            return
        }

        if (!this.isYaoBuQi) {
            return
        }

        this.isYaoBuQi = false
        this.chupai([])
    }

    @listen("proto_gc_clienttimer_not")
    proto_gc_clienttimer_not(message: Iproto_gc_clienttimer_not) {
        if (this.isSelf(message.chairId)) {
            if (this.isYaoBuQi) {
                message.sPeriod = 3 * 1000
            }
        }
        monitor.emit(EventName.clock_time, message)
    }

    @listen("proto_gc_play_card_req")
    proto_gc_play_card_req(message: Iproto_gc_play_card_req) {
        this.nSerialID = message.nSerialID
        this.setAuto(message.cAuto == 1)
        this.showPutButtons()
    }

    @listen("proto_gc_play_card_not")
    proto_gc_play_card_not(message: Iproto_gc_play_card_not) {
        if (message.cType.mNTypeNum != 0) {
            this.nowcChairID = GameFunc.S2C(message.cChairID)
            this.nowCardType = message.cType
        }
    }

    @listen("proto_gc_auto_not")
    proto_gc_auto_not(message: Iproto_gc_auto_not) {
        if (!this.isSelf(message.cChairID)) {
            return
        }
        this.setAuto(message.cAuto == 1)
    }

    @listen(EventName.game_end)
    onGameEnd() {
        this.setAuto(false)
    }
}
