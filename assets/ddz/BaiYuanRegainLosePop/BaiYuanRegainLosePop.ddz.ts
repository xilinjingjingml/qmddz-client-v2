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
import { WeChatMiniGame } from "../../start/scripts/platforms/WeChatMiniGame"

const { ccclass } = cc._decorator

@ccclass
export default class BaiYuanRegainLosePop extends BasePop {
    params: { message: Iproto_gc_baiyuan_regain_lose_not }

    start() {
        let itemNum = 0
        this.params.message.vecItemInfo.forEach(info => {
            if (info.nItemId == ITEM.TO_CASH) {
                itemNum = info.nItemNum
            }
        })
        this.$("label_value", cc.Label).string = appfunc.toCash(itemNum).toFixed(2) + "元"

        cc.tween(this.$("guang"))
            .by(3, { angle: 360 })
            .repeatForever()
            .start()

        this.showMiniGameGrid()
    }

    onPressGet(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        ads.receiveAward({
            index: ads.video.New_LuckyGift,
            success: () => this.isValid && GameFunc.send<Iproto_cg_baiyuan_regain_lose_req>("proto_cg_baiyuan_regain_lose_req", {})
        })
    }

    @listen("proto_gc_baiyuan_regain_lose_ack")
    proto_gc_baiyuan_regain_lose_ack(message: Iproto_gc_baiyuan_regain_lose_ack) {
        if (message.cRet == 0) {
            const awards: IAward[] = []
            message.vecItemInfo.forEach(info => awards.push({ index: info.nItemId, num: info.nItemNum }))
            appfunc.showAwardPop(awards, this.removeCloseCallback())
            this.close()
        } else {
            startFunc.showToast("领取失败！")
        }
    }
    showMiniGameGrid(){
        //1.在线数据 2.显示 miniGameGrid_fuCard miniGameGrid_redPacket
        if(!app.getOnlineParam("display_game_appid") || !app.getOnlineParam("display_game_icon") || !app.getOnlineParam("display_game_name")){
            this.$("miniGameGrid").active = false
            return
        }

        cc.tween(this.$("miniGameGrid"))// miniGameGrid_fuCard
        .then(cc.tween().to(0.09, { angle: 35 }).to(0.18, { angle: -35 }).to(0.09, { angle: 0 }).to(0.09, { angle: 35 }).to(0.18, { angle: -35 }).to(0.09, { angle: 0 }).delay(4))
        .repeatForever()
        .start()

        if(app.getOnlineParam("display_game_appid")){
            //图片
            cc.assetManager.loadRemote(app.getOnlineParam("display_game_icon"), (err: Error, asset: cc.Texture2D | cc.SpriteFrame)=>{
                if (err) {
                    cc.error(err.message || err)
                    return
                }
                // console.log("jin---setGameId loadRes")
                const spriteFrame = asset instanceof cc.Texture2D ? new cc.SpriteFrame(asset) : asset
                if(this.getNodeComponent(this.$("miniGameGrid/icon"), cc.Sprite)){
                    this.$("miniGameGrid/icon", cc.Sprite).spriteFrame = spriteFrame
                    this.$("miniGameGrid/label_gameName", cc.Label).string = app.getOnlineParam("display_game_name")
                }
            })
        }

    }

    navigateToMiniGame(){
        console.log("jin---navigateToMiniGame");
        (app.platform as WeChatMiniGame).navigateToMiniProgram(app.getOnlineParam("display_game_appid"), null)
    }
}
