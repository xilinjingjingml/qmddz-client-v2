/**
 * Create by Jin on 2021/7/19
 */
 import BaseView from "../../base/view/BaseView"
 import { app } from "../../start/app"
 import { WeChatMiniGame } from "../../start/scripts/platforms/WeChatMiniGame"
const {ccclass, property} = cc._decorator;

@ccclass
export default class miniGameItem extends BaseView {
    gameId:string = null
    setMiniGameId(gameId: string, picturePath: string){
        this.gameId = gameId

        cc.assetManager.loadRemote(picturePath, (err: Error, asset: cc.Texture2D | cc.SpriteFrame)=>{
            if (err) {
		        cc.error(err.message || err)
		        return
		    }
            // console.log("jin---setGameId loadRes")
            const spriteFrame = asset instanceof cc.Texture2D ? new cc.SpriteFrame(asset) : asset
            if(this.getNodeComponent(this.$("miniGame_ddz"), cc.Sprite)){
                this.$("miniGame_ddz", cc.Sprite).spriteFrame = spriteFrame
                app.platform.localStorage(this.gameId, 
                    null, 
                    false, 
                    WWGState=>{ this.$("icon_unplayed").active = WWGState})
                
            }
            
        })
        // this.$("label_game_name", cc.Label).string = appName

    }

    navigateToMiniGame(){
        console.log("jin---navigateToMiniGame")
        app.platform.localStorage(this.gameId, false, true, null);
        (app.platform as WeChatMiniGame).navigateToMiniProgram(this.gameId, ()=>{ this.$("icon_unplayed").active = false })
    }

}
