import { listen } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"

const { ccclass } = cc._decorator

@ccclass
export default class BaiYuanCashOut extends BasePop {

    start() {
        this.node.parent.zIndex = 10000
        this.$("nodePop").opacity = 0
    }

    showNotice(name: string) {
        const node = this.$("nodePop")
        if (node.getNumberOfRunningActions() > 0) {
            return
        }

        if (name.length > 6) {
            name = name.substring(0, 6) + "..."
        }

        this.$("label_name", cc.Label).string = name

        cc.tween(node)
            .set({ opacity: 255 })
            .delay(5)
            .to(0.1, { opacity: 0 })
            .start()


        cc.tween(this.$("node_content"))
            .set({ scale: 0.2 })
            .to(0.2, { scale: 1 }, { easing: "backOut" })
            .start()

        this.$("spine", sp.Skeleton).setAnimation(1, "animation", false)

        cc.tween(this.$("shadow"))
            .set({ x: -500 })
            .delay(2)
            .to(0.4, { x: 1000 }, { easing: "sineInOut" })
            .start()
    }

    @listen("proto_lc_broadcast_message_not")
    proto_lc_broadcast_message_not(messsage: Iproto_lc_broadcast_message_not) {
        const result = /恭喜用户(.*)成功兑换(.*)元话费/.exec(messsage.msg)
        if (result && Number(result[2]) > 20) {
            this.showNotice(result[1])
        }
    }
}
