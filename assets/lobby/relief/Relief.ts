import { audio } from "../../base/audio"
import { NodeExtends } from "../../base/extends/NodeExtends"
import { SocketManager } from "../../base/socket/SocketManager"
import BasePop from "../../base/view/BasePop"
import { ads } from "../../start/ads"
import { app } from "../../start/app"

const { ccclass } = cc._decorator

@ccclass
export default class Relief extends BasePop {

    start() {
        // this.$("label_value", cc.Label).string = (app.datas.reliefStatus.reliefAwardCount / 100).toFixed(2) + "元"
    }

    onPressGet(event: cc.Event.EventTouch) {
        audio.playMenuEffect()
        NodeExtends.cdTouch(event)

        ads.receiveAward({
            index: ads.video.BankruptDefend,
            success: () => {
                // SocketManager.send<Iproto_cl_get_relief_req>("lobby", "proto_cl_get_relief_req", { type: 0 })
                this.isValid && this.close()
            }
        })
    }
}