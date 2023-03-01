import { audio } from "../../base/audio"
import { NodeExtends } from "../../base/extends/NodeExtends"
import { SocketManager } from "../../base/socket/SocketManager"
// import BasePop from "../../base/view/BasePop"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import BaseAdPop from "../../start/scripts/components/BaseAdPop"

const { ccclass } = cc._decorator

@ccclass
export default class Relief extends BaseAdPop {
    bannerIndex: number = ads.banner.BaiYuanRelie

    start() {
        this.$("labelNumber", cc.Label).string = "" + app.datas.reliefStatus.reliefAwardCount
    }

    onPressGet(event: cc.Event.EventTouch) {
        audio.playMenuEffect()
        NodeExtends.cdTouch(event)

        ads.receiveAward({
            index: ads.video.BankruptDefend,
            success: () => {
                SocketManager.send<Iproto_cl_get_relief_req>("lobby", "proto_cl_get_relief_req", { type: 0 })
                this.isValid && this.close()
            }
        })
    }
}