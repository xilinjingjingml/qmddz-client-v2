import { NodeExtends } from "../../base/extends/NodeExtends"
import { listen } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import { appfunc } from "../../lobby/appfunc"
import { ads } from "../../start/ads"
import { ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { AudioManager } from "../audio/AudioManager.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import { app } from "../../start/app"
import { storage } from "../../base/storage";

const { ccclass } = cc._decorator

@ccclass
export default class BaiYuanRegainLosePop extends BasePop {
    params: { message: Iproto_gc_baiyuan_regain_lose_not }
    awards: IAward

    start() {
        let itemNum = 0
        this.params.message.vecItemInfo.forEach(info => {
            if (info.nItemId == ITEM.TO_CASH) {
                itemNum = info.nItemNum
            }
        })
        this.$("lbl_yuan_0", cc.Label).string = appfunc.toCash(itemNum).toFixed(2) + "元"

        cc.tween(this.$("guang"))
            .by(3, { angle: 360 })
            .repeatForever()
            .start()

        this.showUIAni()
    }

    showUIAni(){
        this.$("sp_shengli").active = false
        this.$("sp_yuan").active = false
        this.$("sp_yuanbao").active = false

        let round : Number = app.user.won + app.user.lost + app.user.dogfall
        let result_noSeeAd_count = storage.get("result_noSeeAd_count")
        console.log("jin---BaiYuanRegainLosePop showUIAni: ", app.user.won, app.user.lost, app.user.dogfall)
        cc.Tween.stopAllByTarget(this.node)
        cc.tween(this.node)
            .call(()=>{
                let self = this
                if (!this.isValid) {
                    return
                }
                self.$("sp_yuan").active = true
                const spine_yuan = this.$("sp_yuan", sp.Skeleton)
                spine_yuan.setAnimation(0, "animation", false)
            })
            .delay(1)
            .call(()=>{
                this.$("lbl_yuan_0").active = true
                cc.tween(this.$("lbl_yuan_0"))
                    .to(0.2, { position: cc.v3(-170, -65, 0) })
                    .start()
                this.$("lbl_yuanbao_1").active = true
                this.$('bg_score').active = true
                cc.tween(this.$("lbl_yuanbao_1"))
                    .to(0.2, { position: cc.v3(180, -65, 0) })
                    .start()
            })
            .delay(0.4)
            .call(()=>{
                // this.$("icon_video").active = round != 1
                // this.$("btn_get").active = round == 1
                // this.$("btn_text_free_get").active = round == 1
                this.$("node_button").active = true
                this.$("btn_get0").active = (Number(result_noSeeAd_count) == 4 && round > 10) ? false : true
                cc.tween(this.$("node_button"))
                    .to(0.3, { position: cc.v3(0, -280, 0) })
                    .start()
            })
            .start()
    }


    onPressGet(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        ads.receiveAward({
            index: ads.video.New_RegainLose,
            showAward: false,
            success: (res) => {
                if(this.isValid){
                    storage.set("result_order", 1)
                    GameFunc.send<Iproto_cg_baiyuan_regain_lose_req>("proto_cg_baiyuan_regain_lose_req", {})
                    this.awards = res.awards[0]
                }
            }
        })
    }

    @listen("proto_gc_baiyuan_regain_lose_ack")
    proto_gc_baiyuan_regain_lose_ack(message: Iproto_gc_baiyuan_regain_lose_ack) {
        if (message.cRet == 0) {
            const awards: IAward[] = []
            message.vecItemInfo.forEach(info => awards.push({ index: info.nItemId, num: info.nItemNum }))
            console.log("jin---结算输: ", this.awards)
            awards.push(this.awards)
            appfunc.showAwardPop(awards, () => this.close())
            storage.set("result_noSeeAd_count", 1)
        } else {
            startFunc.showToast("领取失败！")
        }
    }

    onpressGiveUp(){
        let result_order = storage.get("result_order")
        let result_bukan_order = storage.get("result_bukan_order")
        storage.set("result_bukan_order", Number(storage.get("result_bukan_order")) >= 4 ? 1 : Number(storage.get("result_bukan_order")) + 1)
        storage.set("result_order", Number(result_bukan_order) >= 4 ? 1 : Number(result_bukan_order) + 1)
        console.log("jin---showBaiYuanJiaSuTiXian: ", result_order)
        let result_noSeeAd_count = storage.get("result_noSeeAd_count")
        storage.set("result_noSeeAd_count", Number(result_noSeeAd_count) + 1)
        this.close()
    }
}
