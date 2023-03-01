import { audio } from "../audio"
import RootPopup from "../view/RootPopup"
import { ViewManager } from "../view/ViewManager"

const { ccclass, property, menu, disallowMultiple } = cc._decorator

enum Behavior {
    ShowPopup = 1,
    ShowScene,
    ClosePopup,
}

@ccclass
@disallowMultiple
@menu("component/ViewTrigger")
export default class ViewTrigger extends cc.Component {

    @property({ type: cc.Enum(Behavior) })
    behavior = Behavior.ShowPopup

    @property({ visible: function (this: ViewTrigger) { return this.behavior != Behavior.ClosePopup } })
    bundle = ""

    @property({ visible: function (this: ViewTrigger) { return this.behavior != Behavior.ClosePopup } })
    path = ""

    @property({ visible: function (this: ViewTrigger) { return this.behavior != Behavior.ClosePopup } })
    params = ""

    onLoad() {
        const button = this.node.getComponent(cc.Button)
        if (button) {
            const handler = new cc.Component.EventHandler()
            handler.target = this.node
            handler.component = "ViewTrigger"
            handler.handler = "onTrigger"

            button.clickEvents.unshift(handler)
        } else {
            this.node.on(cc.Node.EventType.TOUCH_END, this.onTrigger, this)
        }
    }

    onTrigger() {
        audio.playMenuEffect()

        if (this.behavior == Behavior.ShowPopup) {
            ViewManager.showPopup({ bundle: this.bundle, path: this.path, params: { data: this.params } })
        } else if (this.behavior == Behavior.ShowScene) {
            ViewManager.showScene({ bundle: this.bundle, path: this.path })
        } else if (this.behavior == Behavior.ClosePopup) {
            const root = this.findRoot(this.node)
            if (root) {
                ViewManager.closeByNode(root)
            }
        }
    }

    findRoot(node: cc.Node) {
        if (node.getComponent(RootPopup)) {
            return node
        }

        if (node.parent) {
            return this.findRoot(node.parent)
        }
    }
}
