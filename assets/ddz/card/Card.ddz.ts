import { GameFunc } from "../game/GameFunc.ddz"
import { ECardPoint } from "../game/GameRule.ddz"
import BaseCard from "../scripts/base/BaseCard.ddz"

const { ccclass } = cc._decorator

/**
 * 牌
 */
@ccclass
export default class Card extends BaseCard {
    iselect: boolean = false

    onEnable() {
        super.onEnable()

        const callback = function () { }
        this.node.on(cc.Node.EventType.TOUCH_START, callback, this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, callback, this)
        this.node.on(cc.Node.EventType.TOUCH_END, callback, this)
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, callback, this)
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_START)
        this.node.off(cc.Node.EventType.TOUCH_MOVE)
        this.node.off(cc.Node.EventType.TOUCH_END)
        this.node.off(cc.Node.EventType.TOUCH_CANCEL)
    }

    unuse() {
        super.unuse()
        this.setShow(false)
        this.setBlack(false)
        this.select(false)
        this.setCardBack(false)
    }

    setCard(card: Iproto_CCard) {
        super.setCard(card)

        const isWang = card.mNValue == ECardPoint.Wang
        this.$("value_lord").active = isWang
        this.$("color_lord").active = isWang
        this.$("value").active = !isWang
        this.$("color_small").active = !isWang
        this.$("color").active = !isWang

        const material = cc.Material.getBuiltinMaterial(card.mNColor % 2 == 0 ? cc.Material.BUILTIN_NAME.GRAY_SPRITE : cc.Material.BUILTIN_NAME.SPRITE)
        if (isWang) {
            // value_lord
            this.$("value_lord").getComponent(cc.RenderComponent).setMaterial(0, material)

            // color_lord
            this.setSprite({ node: this.$("color_lord"), bundle: GameFunc.bundle, path: "card/images/color_lord" + card.mNColor, delay: false })
        } else {
            // value
            this.setSprite({ node: this.$("value"), bundle: GameFunc.bundle, path: "card/images/" + card.mNValue, delay: false })
            this.$("value").getComponent(cc.RenderComponent).setMaterial(0, material)

            // color_small
            this.setSprite({ node: this.$("color_small"), bundle: GameFunc.bundle, path: "card/images/color" + card.mNColor, delay: false })
            this.$("color_small").getComponent(cc.RenderComponent).setMaterial(0, material)

            // color
            this.setSprite({ node: this.$("color"), bundle: GameFunc.bundle, path: "card/images/color" + card.mNColor, delay: false })
            this.$("color").getComponent(cc.RenderComponent).setMaterial(0, material)
        }
    }

    setShow(active: boolean) {
        this.$("mark_show").active = active
    }

    setBlack(active: boolean) {
        this.$("black").active = active
    }

    setSelect(select: boolean) {
        if (this.iselect == select) {
            return
        }

        this.select(select)
        this.node.y += select ? 30 : -30
    }

    private select(select: boolean) {
        this.iselect = select
        this.$("select").active = select
    }

    setCardBack(active: boolean) {
        this.$("card_back").active = active
    }
}
