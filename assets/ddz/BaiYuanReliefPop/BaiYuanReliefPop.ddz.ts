import { NodeExtends } from "../../base/extends/NodeExtends"
import { math } from "../../base/math"
import { listen } from "../../base/monitor"
// import BasePop from "../../base/view/BasePop"
import { appfunc } from "../../lobby/appfunc"
import { ads } from "../../start/ads"
import { startFunc } from "../../start/startFunc"
import { AudioManager } from "../audio/AudioManager.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import BaseAdPop from "../../start/scripts/components/BaseAdPop"

const { ccclass } = cc._decorator

@ccclass
export default class BaiYuanReliefPop extends BaseAdPop {

    params: { itemNum: number }
    bannerIndex: number = ads.banner.BaiYuanRelie

    start() {
        this.$("labelNumber", cc.Label).string = math.fixd(appfunc.toCash(this.params.itemNum))
    }

    onPressGet(event: cc.Event.EventTouch) {
        AudioManager.playMenuEffect()
        NodeExtends.cdTouch(event)

        ads.receiveAward({
            index: ads.video.New_BankruptDefend,
            success: () => this.isValid && GameFunc.send<Iproto_cg_baiyuan_bankruptcy_defend_req>("proto_cg_baiyuan_bankruptcy_defend_req", {})
        })
    }

    @listen("proto_gc_baiyuan_bankruptcy_defend_ack")
    proto_gc_baiyuan_bankruptcy_defend_ack(message: Iproto_gc_baiyuan_bankruptcy_defend_ack) {
        if (message.cRet == 0) {
            const awards = []
            message.vecItemInfo.forEach(info => awards.push({ index: info.nItemId, num: info.nItemNum }))
            appfunc.showAwardPop(awards, this.removeCloseCallback())
            this.close()
        } else {
            startFunc.showToast("领取失败！")
        }
    }
}