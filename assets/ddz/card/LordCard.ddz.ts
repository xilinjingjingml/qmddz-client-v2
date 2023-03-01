import BaseView from "../../base/view/BaseView"
import { GameFunc } from "../game/GameFunc.ddz"
import { ECardPoint } from "../game/GameRule.ddz"

const { ccclass } = cc._decorator

/**
 * 地主牌
 */
@ccclass
export default class LordCard extends BaseView {

    setCard(card: Iproto_CCard) {
        const isWang = card.mNValue == ECardPoint.Wang
        this.$("value_lord").active = isWang
        this.$("color_lord").active = isWang
        this.$("value").active = !isWang
        this.$("color").active = !isWang
        this.setCardBack(false)

        const material = cc.Material.getBuiltinMaterial(card.mNColor % 2 == 0 ? cc.Material.BUILTIN_NAME.GRAY_SPRITE : cc.Material.BUILTIN_NAME.SPRITE)
        if (isWang) {
            // value_lord
            this.$("value_lord").getComponent(cc.RenderComponent).setMaterial(0, material)

            // color_lord
            this.setSprite({ node: this.$("color_lord"), bundle: GameFunc.bundle, path: "card/images/lord_color_lord" + card.mNColor })
        } else {
            // value
            this.setSprite({ node: this.$("value"), bundle: GameFunc.bundle, path: "card/images/" + card.mNValue })
            this.$("value").getComponent(cc.RenderComponent).setMaterial(0, material)

            // color
            this.setSprite({ node: this.$("color"), bundle: GameFunc.bundle, path: "card/images/color" + card.mNColor })
            this.$("color").getComponent(cc.RenderComponent).setMaterial(0, material)
        }
    }

    setCardBack(active: boolean) {
        this.$("card_back").active = active
    }
}
