import BaseView from "../../../base/view/BaseView"

const { ccclass } = cc._decorator

/**
 * 牌
 */
@ccclass
export default abstract class BaseCard extends BaseView {
    card: Iproto_CCard

    unuse() {
        this.setLordMark(false)
    }

    setCard(card: Iproto_CCard) {
        this.card = card
        this.unuse()
    }

    setLordMark(active: boolean) {
        this.$("mark_lord").active = active
    }
}
