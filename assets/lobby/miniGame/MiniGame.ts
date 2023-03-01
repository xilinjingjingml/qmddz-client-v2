/*
 * @Author: Jin
 * @Date: 2021-12-07 15:35:11
 * @LastEditTime: 2021-12-08 10:01:20
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \qmddz-client-v2\assets\lobby\miniGame\MiniGame.ts
 */
import { audio } from "../../base/audio"
import { NodeExtends } from "../../base/extends/NodeExtends"
import BasePop from "../../base/view/BasePop"
import { storage } from "../../base/storage"
import { time } from "../../base/time"
import { app } from "../../start/app"
import { WeChatMiniGame } from "../../start/scripts/platforms/WeChatMiniGame"

const { ccclass } = cc._decorator

@ccclass
export default class MiniGame extends BasePop {

    gameId: string

    start(){
        //TODO 1.当日唯一标识 2.加载图片 3.添加图片动画 4.btn_close动画
        storage.set("MiniGame" + time.format("yyyy-mm-dd"), true)
        console.log("jin---MiniGame: ", storage.get("MiniGame" + time.format("yyyy-mm-dd")))
        this.loadImage()
    }

    loadImage(){
        let path = app.getOnlineParam("Leaflet_game_picture")
        this.gameId = app.getOnlineParam("Leaflet_game_appid")
        if(!this.gameId || !path){
            return
        }

        cc.assetManager.loadRemote(path, (err: Error, asset: cc.Texture2D | cc.SpriteFrame)=>{
            if (err) {
                cc.error(err.message || err)
                return
            }
            // console.log("jin---setGameId loadRes")
            const spriteFrame = asset instanceof cc.Texture2D ? new cc.SpriteFrame(asset) : asset
            if(this.getNodeComponent(this.$("Leaflet"), cc.Sprite)){
                this.$("Leaflet", cc.Sprite).spriteFrame = spriteFrame
            }
        })
    }

    onPressGoToMiniGame(event: cc.Event.EventTouch){
        audio.playMenuEffect()
        NodeExtends.cdTouch(event);

        if(!this.gameId){
            return
        }
        
        //TODO 跳转微信
        (app.platform as WeChatMiniGame).navigateToMiniProgram(this.gameId, ()=>{
            this.isValid && this.close()
        })
    }
    
}