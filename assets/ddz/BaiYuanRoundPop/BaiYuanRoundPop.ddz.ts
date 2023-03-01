import { NodeExtends } from "../../base/extends/NodeExtends"
import { listen } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import { appfunc } from "../../lobby/appfunc"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { AudioManager } from "../audio/AudioManager.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import { storage } from "../../base/storage";

const { ccclass } = cc._decorator

@ccclass
export default class BaiYuanRoundPop extends BasePop {
    // params: { message: Iproto_gc_baiyuan_hb_round_award_not }

    start() {
        // let itemNum = 0
        // this.params.message.vecItemInfo.forEach(info => {
        //     if (info.nItemId == ITEM.TO_CASH) {
        //         itemNum = info.nItemNum
        //     }
        // })
        // this.$("tianjianghongbao/ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:bone18/ATTACHED_NODE:bone3/label_value", cc.Label).string = appfunc.toCash(itemNum).toFixed(2) + "元"
        // // this.$("label_hb", cc.Label).string = GameFunc.toHBString(app.user.getItemNum(ITEM.TO_CASH)) + "元"

        
        cc.tween(this.$("node_hb")).set({ opacity: 0 }).delay(0.6).set({ opacity: 255 }).start()
        const node = this.$("tianjianghongbao")
        const spine = node.getComponent(sp.Skeleton)
        spine.setAnimation(0, "animation", false)
        console.log("jin---playSpine_lord播放")
        spine.setCompleteListener((track: sp.spine.TrackEntry) => {
            spine.setCompleteListener(null)
            // this.$("btn_get").active = true
        })

        cc.tween(this.$("btn_close")).set({ opacity: 0 }).delay(2.5).to(.5, { opacity: 255 }).start()
    }

    onPressGet(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        ads.receiveAward({
            index: ads.video.New_GameRedPacket,
            showAward: false,
            success: (res) => {
                if (res && res.ret == 0) {
                    appfunc.showAwardPop(res.awards, () => {
                        this.close()
                    })
                }
            }
        })
    }

    // @listen("proto_gc_baiyuan_hb_round_award_ack")
    // proto_gc_baiyuan_hb_round_award_ack(message: Iproto_gc_baiyuan_hb_round_award_ack) {
    //     if (message.cRet == 0) {
    //         const awards: IAward[] = []
    //         message.vecItemInfo.forEach(info => awards.push({ index: info.nItemId, num: info.nItemNum }))
    //         appfunc.showAwardPop(awards, this.removeCloseCallback())
    //         this.close()
    //     } else {
    //         startFunc.showToast("领取失败！")
    //     }
    // }

    onPressClose() {
        // let order =  storage.get("result_order")
        // storage.set("result_order", 1)
        this.close()
    }
}
