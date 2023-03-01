import RootPopup from "../../view/RootPopup"
import { ViewManager } from "../../view/ViewManager"
import BaseButton from "./BaseButton"

const { ccclass, property, menu, disallowMultiple } = cc._decorator

enum Behavior {
    ShowPopup = 1,
    ShowScene,
    ClosePopup,
}

@ccclass
@disallowMultiple
@menu("button/ViewButton")
export default class ViewButton extends BaseButton {

    @property({ type: cc.Enum(Behavior) })
    behavior = Behavior.ClosePopup

    @property({ visible: function (this: ViewButton) { return this.behavior != Behavior.ClosePopup } })
    bundle = ""

    @property({ visible: function (this: ViewButton) { return this.behavior != Behavior.ClosePopup } })
    path = ""

    @property({ visible: function (this: ViewButton) { return this.behavior != Behavior.ClosePopup } })
    params = ""

    onClick() {
        if (this.behavior == Behavior.ShowPopup) {
            ViewManager.showPopup({ bundle: this.bundle, path: this.path, params: { data: this.params } })
        } else if (this.behavior == Behavior.ShowScene) {
            ViewManager.showScene({ bundle: this.bundle, path: this.path, params: { data: this.params } })
        } else if (this.behavior == Behavior.ClosePopup) {
            const root = this.getRootInParent(this.node)
            root && ViewManager.closeByNode(root)
        }
    }

    getRootInParent(node: cc.Node) {
        if (node.getComponent(RootPopup)) {
            return node
        }

        if (node.parent) {
            return this.getRootInParent(node.parent)
        }
    }
}
