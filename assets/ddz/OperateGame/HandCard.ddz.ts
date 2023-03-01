import { listen, monitor } from "../../base/monitor"
import AreaCard from "../card/AreaCard.ddz"
import Card from "../card/Card.ddz"
import { EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import { ECardPoint, GameRule } from "../game/GameRule.ddz"
import BaseChair from "../scripts/base/BaseChair.ddz"

const { ccclass } = cc._decorator

/**
 * 玩家手牌操控
 */
@ccclass
export default class HandCard extends BaseChair {
    params: { chairId: number } = { chairId: 0 }
    private touchStartIndex: number
    private touchEndIndex: number = 0
    private black: boolean = false
    private isShowCard: boolean = false
    private isPlayLordCard: boolean = false

    start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchMove, this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
    }

    @listen(EventName.game_reinit)
    onGameReinit() {
        this.isShowCard = false
        this.refreshHandCards([])
    }

    private onTouchStart(event: cc.Event.EventTouch) {
        // 停止地主牌动画
        if (this.isPlayLordCard) {
            this.isPlayLordCard = false
            cc.Tween.stopAllByTarget(this.node)
        }
        this.onTouchMove(event)
    }

    private onTouchMove(event: cc.Event.EventTouch) {
        const index = this.getTouchIndex(event)
        if (index == null) {
            return
        }
        if (this.touchStartIndex == null) {
            this.touchStartIndex = index
        }
        this.touchEndIndex = index

        const start = Math.min(this.touchStartIndex, this.touchEndIndex)
        const end = Math.max(this.touchStartIndex, this.touchEndIndex)
        this.node.children.forEach((child: cc.Node, i: number) => child.getComponent(Card).setBlack(i >= start && i <= end))
    }

    private onTouchEnd(event: cc.Event.EventTouch) {
        if (this.touchStartIndex == null) {
            return
        }

        const start = Math.min(this.touchStartIndex, this.touchEndIndex)
        const end = Math.max(this.touchStartIndex, this.touchEndIndex)
        this.touchStartIndex = null

        const cardNodes: cc.Node[] = []
        this.node.children.forEach((child: cc.Node, i: number) => {
            child.getComponent(Card).setBlack(false)
            if (i >= start && i <= end) {
                cardNodes.push(child)
            }
        })

        const selectCardNodes = this.smartSelectCards(cardNodes) || cardNodes
        selectCardNodes.forEach(cardNode => {
            const cardComp = cardNode.getComponent(Card)
            cardComp.setSelect(!cardComp.iselect)
        })
    }

    get cards() {
        return this.getComponent(AreaCard).cards
    }

    @listen(EventName.game_refreshHandCards)
    refreshHandCards(cards: Iproto_CCard[]) {
        const isPlayDealCardAni = this.cards.length == 0 && cards.length > 0 && !GameFunc.isGameRuning()

        this.getComponent(AreaCard).refreshCards({
            cards: cards,
            cleanCards: false,
            showLord: this.isLord,
            showCard: this.isShowCard,
        })

        if (isPlayDealCardAni) {
            this.playDealCardAni()
        }

        if (this.black) {
            this._setBlackCards(true)
        }
    }

    seleteCards(cards: Iproto_CCard[]) {
        const chooseCardsIndex: Record<number, boolean> = {}

        cards.forEach(card => {
            for (let i = 0; i < this.node.childrenCount; i++) {
                if (!chooseCardsIndex[i] && card.mNValue == this.node.children[i].getComponent(Card).card.mNValue) {
                    chooseCardsIndex[i] = true
                    break
                }
            }
        })

        this.node.children.forEach((child: cc.Node, i: number) => child.getComponent(Card).setSelect(!!chooseCardsIndex[i]))
    }

    getSeleteCards() {
        const cards: Iproto_CCard[] = []
        this.node.children.forEach(child => {
            const cardComp = child.getComponent(Card)
            if (cardComp.iselect) {
                cards.push(cardComp.card)
            }
        })
        return cards
    }

    setBlackCards(black: boolean) {
        this.black = black
        this._setBlackCards(black)
    }

    private _setBlackCards(black: boolean) {
        this.node.children.forEach(child => child.getComponent(Card).setBlack(black))
    }

    private playDealCardAni() {
        // 加快发牌动画 暂停音效
        // AudioManager.playSound("audio_dispatch")
        this.node.children.forEach(child => 
            {
                child && (child.active = false)
            })

        let i = 0
        cc.Tween.stopAllByTarget(this.node)
        cc.tween(this.node)
            .then(cc.tween()
                .call(() => {
                    this.node.children[i] && (this.node.children[i].active = true)
                    i++
                    monitor.emit(EventName.game_deal_card_num, i)
                })
                .delay(0.04))
            .repeat(this.node.childrenCount)
            .call(() => {
                this.node.children.forEach(child => {
                    const x = child.x
                    cc.tween(child)
                        .to(0.15, { x: 0 })
                        .to(0.15, { x: x })
                        .start()
                })
            })
            .start()
    }

    private playLordCard(cards: Iproto_CCard[]) {
        this.isPlayLordCard = true
        this.seleteCards(cards)
        cc.Tween.stopAllByTarget(this.node)
        cc.tween(this.node)
            .delay(1)
            .call(() => {
                this.isPlayLordCard = false
                this.seleteCards([])
            })
            .start()
    }

    private getTouchIndex(event: cc.Event.EventTouch) {
        const v = this.node.convertToNodeSpaceAR(event.getLocation())
        for (let i = this.node.childrenCount - 1; i >= 0; i--) {
            if (this.node.children[i].getBoundingBox().contains(v)) {
                return i
            }
        }
    }

    private smartSelectCards(cardNodes: cc.Node[]) {
        const cards: Iproto_CCard[] = []
        const upCardNodes: cc.Node[] = []
        const downCardNodes: cc.Node[] = []
        for (let i = 0; i < cardNodes.length; i++) {
            const cardNode = cardNodes[i]
            const cardComp = cardNode.getComponent(Card)
            cards.push(cardComp.card)
            if (cardComp.iselect) {
                upCardNodes.push(cardNode)
            } else {
                downCardNodes.push(cardNode)
            }
        }

        // 如果选中的牌大于未选中 全部未选中
        if (upCardNodes.length > downCardNodes.length) {
            return upCardNodes
        }

        // 如果选中牌已经成型 就不再检测
        if (GameRule.checkCardsType(cards)) {
            return downCardNodes
        }

        cardNodes.sort(this.sortCardNodes.bind(this))

        const chooseCardNodes3: cc.Node[][][] = []
        this.smartSelectSeries(cardNodes, 1, 5, chooseCardNodes3)
        this.smartSelectSeries(cardNodes, 2, 6, chooseCardNodes3)
        this.smartSelectSeries(cardNodes, 3, 6, chooseCardNodes3)
        if (chooseCardNodes3.length == 0) {
            return
        }

        let chooseCardNodes: cc.Node[]
        let maxLong = 0
        for (const seriesCardNodes2 of chooseCardNodes3) {
            for (const cardNodes of seriesCardNodes2) {
                if (cardNodes.length > maxLong) {
                    chooseCardNodes = cardNodes
                    maxLong = cardNodes.length
                }
            }
        }

        if (chooseCardNodes) {
            for (let i = chooseCardNodes.length - 1; i >= 0; i--) {
                for (let j = 0; j < upCardNodes.length; j++) {
                    if (chooseCardNodes[i] == upCardNodes[j]) {
                        chooseCardNodes.splice(i, 1)
                        break
                    }
                }
            }
        }

        return chooseCardNodes
    }

    private smartSelectSeries(cardNodes: cc.Node[], same: number, minLong: number, chooseCardNodes3: cc.Node[][][]) {
        if (cardNodes.length < minLong) {
            return
        }

        const getValue = (cardNode: cc.Node) => {
            return cardNode.getComponent(Card).card.mNValue
        }

        const checkSame = (start: number) => {
            if (start + 1 < same) {
                return false
            }

            for (let i = 1; i < same; i++) {
                if (getValue(cardNodes[start]) != getValue(cardNodes[start - i])) {
                    return false
                }
            }

            return true
        }

        const addCard = (vecTempNodeCards: cc.Node[], start: number) => {
            for (let i = 0; i < same; i++) {
                vecTempNodeCards.push(cardNodes[start - i])
            }
        }

        const seriesCardNodes2: cc.Node[][] = []
        for (let i = cardNodes.length - 1; i >= minLong - 1; i--) {
            if (getValue(cardNodes[i]) >= ECardPoint.P2) {
                continue
            }

            if (!checkSame(i)) {
                continue
            }

            const tempCardNodes: cc.Node[] = []
            addCard(tempCardNodes, i)
            i -= same - 1

            for (let j = i - 1; j >= 0; j--) {
                if (getValue(cardNodes[i]) + (tempCardNodes.length / same) != getValue(cardNodes[j])) {
                    continue
                }

                if (getValue(cardNodes[j]) >= ECardPoint.P2) {
                    continue
                }

                if (!checkSame(j)) {
                    continue
                }

                addCard(tempCardNodes, j)
                j -= same - 1
            }

            if (tempCardNodes.length >= minLong) {
                seriesCardNodes2.push(tempCardNodes)
            }
        }

        chooseCardNodes3.push(seriesCardNodes2)
    }

    private sortCards(cardA: Iproto_CCard, cardB: Iproto_CCard) {
        const cardValueA = cardA.mNValue * 4 + cardA.mNColor
        const cardValueB = cardB.mNValue * 4 + cardB.mNColor
        if (cardValueA < cardValueB) {
            return 1
        } else if (cardValueA == cardValueB) {
            return 0
        } else {
            return -1
        }
    }

    private sortCardNodes(cardA: cc.Node, cardB: cc.Node) {
        return this.sortCards(cardA.getComponent(Card).card, cardB.getComponent(Card).card)
    }


    @listen(EventName.game_showCard)
    setShowCard() {
        this.isShowCard = true
        this.refreshHandCards(this.cards)
    }

    @listen("proto_gc_lord_card_not")
    proto_gc_lord_card_not(message: Iproto_gc_lord_card_not) {
        if (message.cLord < 0 || !this.isLord) {
            return
        }

        this.getComponent(AreaCard).refreshLordMark()

        if (GameFunc.isReconnect()) {
            return
        }

        // 提醒炸弹个数
        monitor.emit(EventName.game_deal_card_num, this.cards.length)

        this.playLordCard(message.vecCards)
    }
}
