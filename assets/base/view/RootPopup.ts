import { monitor } from "../monitor"
import BaseView, { IBaseViewOption } from "./BaseView"
import { ViewManager } from "./ViewManager"

const { ccclass, property } = cc._decorator

export interface IRootPopupOption {
    prefab: cc.Prefab
    eventId: number
    mask?: {
        show?: boolean
        touchClose?: boolean
        opacity?: number
    }
    block?: {
        show?: boolean
    }
    openTween?: cc.Tween
    closeTween?: cc.Tween
    params?: IBaseViewOption
}

/**
 * 根View
 */
@ccclass
export default class RootPopup extends cc.Component {

    @property({ type: cc.Node })
    mask: cc.Node = null

    @property({ type: cc.Node })
    block: cc.Node = null

    child: cc.Node

    params: IRootPopupOption

    start() {
        // mask
        const mask = this.params.mask ?? {}
        if (mask.show == false) {
            this.mask.active = false
        } else if (!mask.touchClose) {
            this.mask.getComponent(cc.Button).interactable = false
        }
        if (mask.opacity != null) {
            this.mask.opacity = mask.opacity
        }

        // node
        const node = cc.instantiate(this.params.prefab)
        this.child = node

        // eventId
        const comps = node.getComponentsInChildren(BaseView)
        comps.forEach(comp => comp.eventId = monitor.pauseById(this.params.eventId))
        monitor.resume(this.params.eventId)

        // params
        if (this.params.params != null) {
            comps.forEach(comp => comp.params = this.params.params)
        }

        node.parent = this.node

        this.node.on("node_size_change", this.onNodeSizeChange, this)
        this.onNodeSizeChange()

        // action
        if (this.params.openTween != null) {
            this.params.openTween.target(node).start()
        }
    }

    onPressMask() {
        ViewManager.closeByNode(this.node)
    }

    onNodeSizeChange() {
        // block
        if (this.params.block?.show != false) {
            const rect = this.child.getBoundingBoxToWorld()
            this.block.setPosition(this.block.convertToNodeSpaceAR(cc.v2(rect.x + rect.width / 2, rect.y + rect.height / 2)))
            this.block.setContentSize(rect.width, rect.height)
        }
    }
}
