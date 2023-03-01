import { GameFunc } from "../game/GameFunc.ddz"
import { ECardPoint } from "../game/GameRule.ddz"
import BaseCard from "../scripts/base/BaseCard.ddz"

const { ccclass } = cc._decorator

/**
 * 其他玩家明牌
 */
@ccclass
export default class ShowCard extends BaseCard {

    setCard(card: Iproto_CCard) {
        super.setCard(card)

        const isWang = card.mNValue == ECardPoint.Wang
        this.$("value_lord").active = isWang
        this.$("value").active = !isWang
        this.$("color").active = !isWang

        const material = cc.Material.getBuiltinMaterial(card.mNColor % 2 == 0 ? cc.Material.BUILTIN_NAME.GRAY_SPRITE : cc.Material.BUILTIN_NAME.SPRITE)
        if (isWang) {
            // value_lord
            this.$("value_lord").getComponent(cc.RenderComponent).setMaterial(0, material)
        } else {
            // value
            this.setSprite({ node: this.$("value"), bundle: GameFunc.bundle, path: "card/images/" + card.mNValue })
            this.$("value").getComponent(cc.RenderComponent).setMaterial(0, material)

            // color
            this.setSprite({ node: this.$("color"), bundle: GameFunc.bundle, path: "card/images/color" + card.mNColor })
            this.$("color").getComponent(cc.RenderComponent).setMaterial(0, material)
        }
    }
}
