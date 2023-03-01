import { audio } from "../audio"
import BaseView from "./BaseView"
import { ViewManager } from "./ViewManager"

const { ccclass } = cc._decorator

/**
 * ViewPop组件
 */
@ccclass
export default class BasePop extends BaseView {

    onEnable() {
        super.onEnable()

        // widget
        const widget = this.node.getComponent(cc.Widget)
        if (widget) {
            widget.updateAlignment()
            cc._widgetManager.remove(widget)
        }
    }

    removeCloseCallback() {
        const closeCallback = this.params.closeCallback
        delete this.params.closeCallback
        return closeCallback
    }

    /**
     * 关闭当前界面
     */
    close() {
        ViewManager.closeByNode(this.node.parent)
    }

    /**
     * 关闭按钮
     */
    onPressClose() {
        audio.playMenuEffect()
        this.close()
    }
}
