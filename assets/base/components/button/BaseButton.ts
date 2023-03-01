const { ccclass } = cc._decorator

@ccclass
export default abstract class BaseButton extends cc.Component {

    onLoad() {
        const button = this.node.getComponent(cc.Button)
        if (button) {
            const handler = new cc.Component.EventHandler()
            handler.target = this.node
            handler.component = this.__classname__
            handler.handler = "onClick"

            button.clickEvents.unshift(handler)
        } else {
            this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this)
        }
    }

    abstract onClick(event: cc.Event.EventTouch): void
}
