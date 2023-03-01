import BaseView from "../../base/view/BaseView"
import AreaCard, { HorizontalDirection } from "../card/AreaCard.ddz"

const { ccclass, executeInEditMode } = cc._decorator

@ccclass
@executeInEditMode
export default class PlayerAdapter extends BaseView {
    params: { chairId: number }

    start() {
        if (CC_EDITOR) {
            this.params = { chairId: parseInt(this.node.parent.name.slice(-1)) }
        }

        if (this.params.chairId == 1) {
            const adapter = (parmes: { name: string, x?: boolean, anchor?: boolean, widget?: boolean, widgetSize?: boolean, area?: boolean }) => {
                if (parmes.x != false) {
                    this.$(parmes.name).x *= -1
                }

                if (parmes.anchor) {
                    this.$(parmes.name).anchorX = 1
                }

                if (parmes.widget && !CC_EDITOR) {
                    const widget = this.$(parmes.name, cc.Widget)
                    widget.isAlignLeft = false
                    widget.isAlignRight = true
                    widget.right = widget.left
                }

                if (parmes.widgetSize && !CC_EDITOR) {
                    const widget = this.$(parmes.name, cc.Widget)
                    const temp = widget.left
                    widget.left = widget.right
                    widget.right = temp
                }

                if (parmes.area) {
                    this.$(parmes.name, AreaCard).horizontalDirection = HorizontalDirection.RIGHT_TO_LEFT
                }
            }

            adapter({ name: "node_avater", widget: true })
            adapter({ name: "node_game", widget: true })
            adapter({ name: "node_poke" })
            adapter({ name: "node_operate" })
            adapter({ name: "spt_operate", anchor: true })
            adapter({ name: "spt_putover", anchor: true })
            adapter({ name: "node_clock" })
            adapter({ name: "node_hb_change" })
            adapter({ name: "label_hb_win", anchor: true })
            adapter({ name: "label_hb_lose", anchor: true })
            adapter({ name: "node_chat" })
            adapter({ name: "chat_bubble_text", anchor: true })
            adapter({ name: "chat_label", anchor: true })
            adapter({ name: "spine_zanman" })
            adapter({ name: "node_putcard", anchor: true, widgetSize: true, area: true })
            adapter({ name: "node_handcard", anchor: true, widgetSize: true, area: true })
        }
    }
}
