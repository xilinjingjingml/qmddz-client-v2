import { audio } from "../audio"

const { ccclass, property, disallowMultiple, menu } = cc._decorator

enum TouchChoice {
    REVERSE, // 反转
    ACTIVE, // 设置显示
}

/**
 * 触摸显示/隐藏节点
 */
@ccclass
@disallowMultiple
@menu("component/TouchActive")
export default class TouchActive extends cc.Component {

    @property({ type: cc.Node, tooltip: "操作节点 默认自身" })
    target: cc.Node = null

    @property({ type: cc.Enum(TouchChoice) })
    choice: TouchChoice = TouchChoice.REVERSE

    @property({ tooltip: "显示/隐藏", visible: function (this: TouchActive) { return this.choice == TouchChoice.ACTIVE } })
    active: boolean = false

    @property({ tooltip: "触摸穿透" })
    swallow: boolean = false

    @property()
    audio: boolean = false

    onEnable() {
        if (this.target == null) {
            this.target = this.node
        }
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this)
        if (this.swallow) {
            this.node._touchListener.setSwallowTouches(false)
        }
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnded, this)
    }

    _onTouchEnded() {
        if (this.audio) {
            audio.playMenuEffect()
        }

        this.target.active = this.choice == TouchChoice.REVERSE ? !this.target.active : this.active
    }
}
