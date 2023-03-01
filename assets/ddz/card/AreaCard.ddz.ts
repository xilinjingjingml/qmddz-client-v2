import BaseView from "../../base/view/BaseView"
import BaseCard from "../scripts/base/BaseCard.ddz"
import Card from "./Card.ddz"

const { ccclass, property, executeInEditMode } = cc._decorator

export enum HorizontalDirection {
    LEFT_TO_RIGHT, // 一行内从左往右
    RIGHT_TO_LEFT, // 一行内从右往左
    CENTER_TO_SIDE, // 一行内从中间往两边
}

enum VerticalDirection {
    TOP_TO_BOTTOM, // 以上方为起点
    BOTTOM_TO_TOP, // 以下方为起点
    CENTER_TO_SIDE, // 以上方为起点
}

enum VerticalPriority {
    TOP, // 上方总是尽量满的
    BOTTOM, // 下方总是尽量满的
}

/**
 * 牌组
 */
@ccclass
@executeInEditMode
export default class AreaCard extends BaseView {

    /**
     * 横向排布
     */
    @property({ type: cc.Enum(HorizontalDirection) })
    private _horizontalDirection: HorizontalDirection = HorizontalDirection.LEFT_TO_RIGHT
    @property({ type: cc.Enum(HorizontalDirection) })
    get horizontalDirection(): HorizontalDirection {
        return this._horizontalDirection
    }
    set horizontalDirection(horizontalDirection: HorizontalDirection) {
        this._horizontalDirection = horizontalDirection
        this.updateCardsPos()
    }

    /**
     * 纵向排布
     */
    @property({ type: cc.Enum(VerticalDirection) })
    private _verticalDirection: VerticalDirection = VerticalDirection.TOP_TO_BOTTOM
    @property({ type: cc.Enum(VerticalDirection) })
    get verticalDirection(): VerticalDirection {
        return this._verticalDirection
    }
    set verticalDirection(verticalWidget: VerticalDirection) {
        this._verticalDirection = verticalWidget
        this.updateCardsPos()
    }

    /**
     * 纵向优先级
     */
    @property({ type: cc.Enum(VerticalPriority) })
    private _verticalPriority: VerticalPriority = VerticalPriority.TOP
    @property({ type: cc.Enum(VerticalPriority), tooltip: "TOP 上方总是尽量满的\nBOTTOM 下方总是尽量满的" })
    get verticalPriority(): VerticalPriority {
        return this._verticalPriority
    }
    set verticalPriority(verticalDirection: VerticalPriority) {
        this._verticalPriority = verticalDirection
        this.updateCardsPos()
    }

    /**
     * 间隔
     */
    @property()
    private _spacing: cc.Vec2 = cc.Vec2.ZERO
    @property()
    get spacing(): cc.Vec2 {
        return this._spacing
    }
    set spacing(spacing: cc.Vec2) {
        this._spacing = spacing
        this.updateCardsPos()
    }

    /**
     * 一行中最大数量
     */
    @property()
    private _maxRowCount: number = 10
    @property({ min: 1, step: 1 })
    get maxRowCount() {
        return this._maxRowCount
    }
    set maxRowCount(maxRowCount: number) {
        this._maxRowCount = maxRowCount
        this.updateCardsPos()
    }

    /**
     * 缩放
     */
    @property()
    private _scale: number = 1
    @property()
    get scale() {
        return this._scale
    }
    set scale(scale: number) {
        this._scale = scale
        this.updateCardsPos()
    }

    @property({ type: cc.Prefab })
    card: cc.Prefab = null

    private cardPool: cc.NodePool
    cards: Iproto_CCard[]

    onLoad() {
        if (CC_EDITOR) {
            this.node.on(cc.Node.EventType.SIZE_CHANGED, this.updateCardsPos, this)
            this.node.on(cc.Node.EventType.ANCHOR_CHANGED, this.updateCardsPos, this)
            this.node.on(cc.Node.EventType.CHILD_ADDED, this.updateCardsPos, this)
            this.node.on(cc.Node.EventType.CHILD_REMOVED, this.updateCardsPos, this)
            this.node.on(cc.Node.EventType.CHILD_REORDER, this.updateCardsPos, this)
            this.updateCardsPos()
        }

        this.cardPool = new cc.NodePool(BaseCard)
        this.cards = []
    }

    onDestroy() {
        this.cardPool.clear()
    }

    refreshCards(parmes: { cards: Iproto_CCard[], cleanCards: boolean, showLord: boolean, showCard: boolean }) {
        if (parmes.cards.length == 0) {
            this.clearCards()
            return
        }

        if (parmes.cleanCards) {
            this.clearCards()
            parmes.cards.forEach(card => {
                const node = this.getCard()
                node.parent = this.node
                node.getComponent(BaseCard).setCard(card)
            })
        } else {
            const exists: Record<number, boolean> = {}
            const tempCards: Iproto_CCard[] = []

            parmes.cards.forEach(card => {
                for (let i = this.node.childrenCount - 1; i >= 0; i--) {
                    if (exists[i]) {
                        continue
                    }

                    const child = this.node.children[i]
                    const cardB = child.getComponent(BaseCard).card
                    if (card.mNValue == cardB.mNValue && card.mNColor == cardB.mNColor) {
                        exists[i] = true
                        return
                    }
                }

                tempCards.push(card)
            })

            for (let i = this.node.childrenCount - 1; i >= 0; i--) {
                if (exists[i]) {
                    this.node.children[i].getComponent(BaseCard).unuse()
                } else {
                    this.setCard(this.node.children[i])
                }
            }

            tempCards.forEach(card => {
                const node = this.getCard()
                node.parent = this.node
                node.getComponent(BaseCard).setCard(card)
            })
        }

        this.cards = parmes.cards
        this.node.children.sort(this.sortCardNodes.bind(this))
        this.updateCardsPos()

        if (parmes.showLord) {
            this.refreshLordMark()
        }

        if (parmes.showCard && this.node.childrenCount > 0) {
            this.node.children[this.node.childrenCount - 1].getComponent(Card).setShow(parmes.showCard)
        }
    }

    refreshLordMark() {
        if (this.node.childrenCount == 0) {
            return
        }
        this.node.children[this.node.childrenCount - 1].getComponent(BaseCard).setLordMark(true)
    }

    private clearCards() {
        this.cards.length = 0
        for (let i = this.node.childrenCount - 1; i >= 0; i--) {
            this.setCard(this.node.children[i])
        }
    }

    private updateCardsPos() {
        if (this.node.childrenCount == 0) {
            return
        }

        const firstCardNode = this.node.children[0]
        const count = Math.max(1, Math.min(this.maxRowCount, Math.floor((this.node.width + this.spacing.x) / (this.scale * firstCardNode.width + this.spacing.x))))

        // 分组
        const lineCardNodes: cc.Node[][] = []
        let index = 0
        if (this.verticalPriority == VerticalPriority.BOTTOM) {
            index = this.node.childrenCount % count
            if (index > 0) {
                lineCardNodes.push(this.node.children.slice(0, index))
            }
        }
        while (index < this.node.childrenCount) {
            lineCardNodes.push(this.node.children.slice(index, index + count))
            index += count
        }

        // 设置初始坐标
        let y = 0
        for (let i = 0; i < lineCardNodes.length; i++) {
            const cardNodes = lineCardNodes[i]
            let x = 0
            for (let j = 0; j < cardNodes.length; j++) {
                const cardNode = cardNodes[j]
                cardNode.scale = this.scale
                cardNode.x = x + this.scale * cardNode.width * cardNode.anchorX
                cardNode.y = y - this.scale * cardNode.height * (1 - cardNode.anchorY)
                x += this.scale * cardNode.width + this.spacing.x
            }
            y -= this.scale * firstCardNode.height + this.spacing.y
        }

        if (this.horizontalDirection == HorizontalDirection.LEFT_TO_RIGHT) {
            const x = this.node.width * this.node.anchorX
            lineCardNodes.forEach(cardNodes => cardNodes.forEach(cardNode => cardNode.x -= x))
        } else if (this.horizontalDirection == HorizontalDirection.RIGHT_TO_LEFT) {
            lineCardNodes.forEach(cardNodes => {
                const x = this.node.width * (1 - this.node.anchorX) - (cardNodes.length * (this.scale * firstCardNode.width + this.spacing.x) - this.spacing.x)
                cardNodes.forEach(cardNode => cardNode.x += x)
            })
        } else if (this.horizontalDirection == HorizontalDirection.CENTER_TO_SIDE) {
            lineCardNodes.forEach(cardNodes => {
                const x = (cardNodes.length * (this.scale * firstCardNode.width + this.spacing.x) - this.spacing.x) / 2
                cardNodes.forEach(cardNode => cardNode.x -= x)
            })
        }

        const height = this.scale * firstCardNode.height * lineCardNodes.length + (lineCardNodes.length - 1) * this.spacing.y
        if (this.verticalDirection == VerticalDirection.TOP_TO_BOTTOM) {
            y = this.node.height * (1 - this.node.anchorY)
        } else if (this.verticalDirection == VerticalDirection.BOTTOM_TO_TOP) {
            y = height - this.node.height * this.node.anchorY
        } else if (this.verticalDirection == VerticalDirection.CENTER_TO_SIDE) {
            y = this.node.height * (0.5 - this.node.anchorY) + height / 2
        }
        lineCardNodes.forEach(cardNodes => cardNodes.forEach(cardNode => cardNode.y += y))
    }

    private setCard(node: cc.Node) {
        this.cardPool.put(node)
    }

    private getCard() {
        return this.cardPool.get() || cc.instantiate(this.card)
    }

    private sortCardNodes(cardA: cc.Node, cardB: cc.Node) {
        return this.sortCards(cardA.getComponent(BaseCard).card, cardB.getComponent(BaseCard).card)
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
}
