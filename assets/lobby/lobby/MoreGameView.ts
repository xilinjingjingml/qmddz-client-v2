/**
 * Create by Jin on 2021/7/19
 */
 import BaseView from "../../base/view/BaseView"
 import { app } from "../../start/app"
const {ccclass, property} = cc._decorator;

@ccclass
export default class MoreGameView extends BaseView {

    @property({ type: cc.Prefab })
    miniGameItem: cc.Prefab = null

    onLoad () {
                //TODO 线上布局 1.游戏个数 2.game_name 3.icon_wwg 4.游戏入口
        //判断是否有数据
        //test
        var tempPromotion_info = []
        // const promotion_info = 
        // [{//更多游戏
        //     "promotion_appid": "wx1770e75cf1d9f874",
        //     "promotion_game_name": "方块大作战",
        //     "sort_id": 5, //界面显示顺序
        //     "desc": "你从未见过的双人竞技版方块游戏~",
        //     "icon": "https://pictures.hiigame.com/qmddz/block_blitz_120.png",//没用
        //     "promotion_game_pic": "https://game.izhangxin.com/Apk/qmddz/7.png",//显示图片
        //     "android_download_url": "",
        //     "ios_download_url": ""
        // }, {
        //     "promotion_appid": "wxb3cdbdaaced47580",
        //     "promotion_game_name": "泡泡龙",
        //     "sort_id": 4,
        //     "desc": "给你三分钟，消灭所有泡泡~",
        //     "icon": "https://pictures.hiigame.com/qmddz/shooter_120.png",
        //     "promotion_game_pic": "https://game.izhangxin.com/Apk/qmddz/3.png",
        //     "android_download_url": "",
        //     "ios_download_url": ""
        // }, {
        //     "promotion_appid": "wxa50fedcb1cdd0d82",
        //     "promotion_game_name": "空当接龙",
        //     "sort_id": 3,
        //     "desc": "纸牌接龙大赛，实物奖励开心抢",
        //     "icon": "https://pictures.hiigame.com/qmddz/solitaire_120.png",
        //     "promotion_game_pic": "https://game.izhangxin.com/Apk/qmddz/4.png",
        //     "android_download_url": "",
        //     "ios_download_url": ""
        // }, {
        //     "promotion_appid": "wx9588ac944ed2da19",
        //     "promotion_game_name": "俄罗斯方块",
        //     "sort_id": 7,
        //     "desc": "欢迎来到九零年代",
        //     "icon": "https://pictures.hiigame.com/qmddz/tetris_120.png",
        //     "promotion_game_pic": "https://game.izhangxin.com/Apk/qmddz/5.png",
        //     "android_download_url": "",
        //     "ios_download_url": ""
        // }, {
        //     "promotion_appid": "wx2a5bccd8cd181ac3",
        //     "promotion_game_name": "消消乐",
        //     "sort_id": 2,
        //     "desc": "和好友比比谁才是消消乐的王者！",
        //     "icon": "https://pictures.hiigame.com/qmddz/dots_blitz_120.png",
        //     "promotion_game_pic": "https://game.izhangxin.com/Apk/qmddz/6.png",
        //     "android_download_url": "",
        //     "ios_download_url": ""
        // }, {
        //     "promotion_appid": "wxfd9359237da92e7e",
        //     "promotion_game_name": "休闲斗地主",
        //     "sort_id": 6,
        //     "desc": "真好玩，快来玩",
        //     "icon": "https://pictures.hiigame.com/qmddz/dots_blitz_120.png",
        //     "promotion_game_pic": "https://game.izhangxin.com/Apk/qmddz/1.png",
        //     "android_download_url": "",
        //     "ios_download_url": ""
        // }, {
        //     "promotion_appid": "wx1fa2f9d9c35f0400",
        //     "promotion_game_name": "台球大作战",
        //     "sort_id": 1,
        //     "desc": "一杆全清，同场竞技",
        //     "icon": "https://pictures.hiigame.com/qmddz/dots_blitz_120.png",
        //     "promotion_game_pic": "https://game.izhangxin.com/Apk/qmddz/2.png",
        //     "android_download_url": "",
        //     "ios_download_url": ""
        // }]
        const promotion_info = app.getOnlineParam("promotion_info")   
        //排序顺序
        for(let i = 0; i <= promotion_info.length; i++){
            for(const j in promotion_info){
                if(i == promotion_info[j].sort_id){
                    tempPromotion_info.push(promotion_info[j])
                }
            }
        }

        //TODO 初始化更多游戏
        for(let i in tempPromotion_info){
            // cc.log("jin---promotion_info: ",tempPromotion_info[i])
            let MiniGame = cc.instantiate(this.miniGameItem)
            MiniGame.parent = this.$("New ScrollView/view/content")
            this.getNodeComponent(MiniGame,"MiniGameItem") && 
            this.getNodeComponent(MiniGame,"MiniGameItem").setMiniGameId(tempPromotion_info[i].promotion_appid, 
                tempPromotion_info[i].promotion_game_pic)
        }
    }

    start () { }

    // update (dt) {}
}
