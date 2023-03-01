import BasePop from "../../base/view/BasePop"

const { ccclass } = cc._decorator

@ccclass
export default class Toast extends BasePop {

    params: { message: string }

    start() {
        const label = this.$("label", cc.Label)
        label.string = this.params.message
        label._forceUpdateRenderData()

        if (label.node.width > 300) {
            this.$("board").width += label.node.width - 300
        }

        if (label.node.height > 40) {
            this.$("board").height += label.node.height - 30
        }

        cc.tween(this.node)
            .delay(2)
            .parallel(
                cc.tween().to(0.2, { opacity: 0 }),
                cc.tween().by(0.2, { y: 20 }),
            )
            .call(this.close.bind(this))
            .start()
    }
}