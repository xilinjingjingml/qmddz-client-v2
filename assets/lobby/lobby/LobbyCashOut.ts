import { listen } from "../../base/monitor"
import BaseView from "../../base/view/BaseView"
import { app } from "../../start/app"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class CashOut extends BaseView {

    start() {
        // this.node.children.forEach(i => i.active = false)
        setTimeout(() => {
            if (!this.isValid) return
            this.initNote()    
        }, 1);
    }

    showNotice(name: string) {
        // this.$("bg").active = true
        if (name.length > 6) {
            name = name.substring(0, 6) + "..."
        }

        this.$("center", cc.RichText).string = name
    }

    @listen("proto_lc_broadcast_message_not")
    proto_lc_broadcast_message_not(messsage: Iproto_lc_broadcast_message_not) {
        // this.$("bg").active = false
        this.$("gxhde").active = true
        let spine = this.$("gxhde", sp.Skeleton)
        spine.setCompleteListener(() => {
            // cc.tween(this.$("bg")).set({scale: 1.1}).to(.1, {scale: 1}).start()
        })
        const result = /恭喜用户(.*)成功兑换(.*)元话费/.exec(messsage.msg)
            if (result && Number(result[2]) > 20) {
                this.showNotice(result[1])
            }
        spine.addAnimation(0, "animation", false)
        cc.tween(this.$("bg")).set({scale: 1.1}).to(.1, {scale: 1}).start()
        // this.$("bg").scale = .9
    }

    initNote() {
        let messsage: Iproto_lc_broadcast_message_not = {
            gameId: app.gameId,
            pn: app.pn,
            msg: `恭喜用户${appfunc.randomName(100)}成功兑换888元话费`
        }

        this.proto_lc_broadcast_message_not(messsage)
    }
}
