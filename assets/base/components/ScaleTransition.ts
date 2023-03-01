const { ccclass, menu } = cc._decorator

@ccclass
@menu("component/ScaleTransition")
export default class ScaleTransition extends cc.Component {

    start() {
        const origin = this.node.scale
        this.node.scale = 0.4 * origin
        cc.tween(this.node).to(0.25, { scale: origin }, { easing: "sineInOut" }).start()
    }
}
