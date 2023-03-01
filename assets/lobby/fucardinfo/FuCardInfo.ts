import { audio } from "../../base/audio"
import { math } from "../../base/math"
import { listen } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { GAME, GAME_TYPE, ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { appfunc } from "../appfunc"
import { WeChatMiniGame } from "../../start/scripts/platforms/WeChatMiniGame"

const { ccclass } = cc._decorator

@ccclass
export default class FuCardInfo extends BasePop {

    start() {
        this.setFuCardNum()
        this.showMiniGameGrid()
    }

    @listen("user_data_update")
    setFuCardNum() {
        const num = app.user.getItemNum(ITEM.REDPACKET_TICKET)
        this.$("labelFuCardNum", cc.Label).string = num + "≈" + math.fixd(appfunc.toFuCard(num)) + "元"
    }

    onPressGoGame() {
        audio.playMenuEffect()
        appfunc.startGame(GAME.DDZ, GAME_TYPE.DDZ_BXP)
        this.close()
    }

    onPressFreeAds() {
        audio.playMenuEffect()
        if (ads.checkCanReceive(Number(ads.video.DrawRp))) {
            appfunc.showAdsAwardPop(ads.awards[ads.video.DrawRp])
            this.close()
        } else {
            startFunc.showToast("您今日的奖励次数已用完，请明天再来！")
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
