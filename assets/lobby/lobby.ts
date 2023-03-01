import { audio } from "../base/audio"
import { NodeExtends } from "../base/extends/NodeExtends"
import { monitor } from "../base/monitor"
import { SocketManager } from "../base/socket/SocketManager"
import { storage } from "../base/storage"
import BaseView from "../base/view/BaseView"
import { ads } from "../start/ads"
import { app } from "../start/app"
import { ITEM } from "../start/config"
import { startFunc } from "../start/startFunc"
import { appfunc } from "./appfunc"
import LobbySocket from "./LobbySocket"
import { WeChatMiniGame } from "../start/scripts/platforms/WeChatMiniGame"
import { time } from "../base/time"

const { ccclass } = cc._decorator

enum ViewType {
    RED_PACKET = 0,
    FU_CARD = 1,
    MORE_GAME = 2,
}

const FREE_REDPACKET_TIME_KEY = "last_free_redpacket_time"
export const FAKE_GIFT_KEY = "fake_gift_show"

@ccclass
export default class lobby extends BaseView {

    isFakeGiftShow: boolean

    //由于动态屏蔽红包场（或其他场次），故不写成结构体，-1意为移除当前页面
    FU_CARD_VIEW:number = 0
    RED_PACKET_VIEW:number = 1
    MORE_GAME_VIEW:number = 2

    startPos:cc.Vec2 = cc.v2(0,0)
    endPos:cc.Vec2 = cc.v2(0,0)

    NavigateToMiniGameprefab: cc.Prefab = null

    start() {
        startFunc.report("加载大厅_完成")
        audio.playMusic({ bundle: "lobby", path: "lobby/audios/bgm" })
        SocketManager.add("lobby", LobbySocket)

        this.isFakeGiftShow = storage.get(FAKE_GIFT_KEY)// !appfunc.checkSpecialAward() && 

        appfunc.loadUserRole()
        appfunc.loadExchangeConfig()
        appfunc.loadTomorrowStatus()

        // this.addScrollCtrl()
        this.$("nodeMain", cc.PageView).scrollToPage(this.RED_PACKET_VIEW, 0.01)

        // 金牛活动
        this.$("activity").active = this.$("activity2").active = appfunc.hasActivity(2)

        // 分享
        this.$("share").active = app.getOnlineParam("lobby_share", true)
        console.log("jin---checkSpecialAward1: ", appfunc.checkSpecialAward())
        if (appfunc.checkSpecialAward()) {//app.getOnlineParam("app_review")
            this.RED_PACKET_VIEW = -1
            this.FU_CARD_VIEW = 0
            this.MORE_GAME_VIEW = 1
            this.$("nodeMain", cc.PageView).scrollToPage(this.FU_CARD_VIEW, 0.01)
            //1.隐藏“立即提现” 
            this.isFakeGiftShow = true
            this.$("btn_red_packet").active = false
            this.$("btn_fuli").active = false
            this.$("indicator").active = false
            this.$("cash_out").active = false

            this.$("card_recorder").active = false
            this.$("daily_gift").active = false
            this.$("lottery").active = false 
            
            monitor.emit("tomorrow_status_update", false)

            //TODO 1.调整页码，移除界面后面的页码/clickEvent，依次减一  2.
            for(let clickEvent of this.$("btn_fu_card", cc.Button).clickEvents){
                if(clickEvent.handler == "onPressView"){
                    clickEvent.customEventData = String(this.FU_CARD_VIEW)
                }
            }

            for(let clickEvent of this.$("btn_more_game", cc.Button).clickEvents){
                if(clickEvent.handler == "onPressView"){
                    clickEvent.customEventData = String(this.MORE_GAME_VIEW)
                }
            }
            
            this.$("nodeMain", cc.PageView).removePage(this.$("red_packet_view"))
            if(!app.getOnlineParam("MoreGame")){
                this.$("btn_fu_card").active = false
                this.$("nodeMain", cc.PageView).enabled = false
            }
            
            this.setMainView(this.FU_CARD_VIEW)
        }

        //更多游戏 1：显示 0：隐藏
        if(!app.getOnlineParam("MoreGame")){
            this.MORE_GAME_VIEW = -1
            this.$("btn_more_game").active = false

            for(let clickEvent of this.$("btn_more_game", cc.Button).clickEvents){
                if(clickEvent.handler == "onPressView"){
                    clickEvent.customEventData = String(this.MORE_GAME_VIEW)
                }
            }

            this.$("nodeMain", cc.PageView).removePage(this.$("more_game_view"))
        }

        //

        // this.addMoreGameViewScrollCtrl()
        if(app.datas.morrow >= 3){
            this.$("more_game_finger").active = true
        }

        //miniGameGrid()
        this.showMiniGameGrid()
    }

    onPressShare(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        audio.playMenuEffect()
        const parm = {
            title: null,
            imageUrl: null,
            withOpenId: true,
            callback: ()=>{}
        }
        app.platform.sociaShare(parm)
    }

    onPressCashOut(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        audio.playMenuEffect()
        appfunc.showCashOutPop()
    }

    onPressFreeRedPacket() {
        audio.playMenuEffect()
        if (ads.checkCanReceive(ads.video.New_FreeRedPacket)) {
            if (appfunc.getCooldownTime(FREE_REDPACKET_TIME_KEY) > 0) {
                startFunc.showToast("免费红包5分钟一次")
            } else {
                ads.receiveAward({
                    index: ads.video.New_FreeRedPacket,
                    showAward: false,
                    success: (res) => {
                        if (res && res.ret == 0) {
                            storage.set(FREE_REDPACKET_TIME_KEY, appfunc.accurateTime())
                            // TODO checkCooldown
                            // this.checkCooldown()

                            if (res.itemIndex != null && res.itemNum != null) {
                                appfunc.showAwardPop([{ index: res.itemIndex, num: res.itemNum }])
                            } else {
                                appfunc.showAwardPop([{ index: ITEM.TO_CASH, num: 0 }])
                            }
                        } else {
                            startFunc.showToast("领取失败")
                        }
                    }
                })
            }
        } else {
            startFunc.showToast("今日红包已领完，请明日再来")
        }
    }

    onPressFuli() {
        startFunc.showToast("敬请期待")
    }

    addScrollCtrl() {
        const time = 0.1
        let act_have_run = false
        const node = this.$("nodeMain")

        const datas: { target: cc.Node, dis: number }[] = []
        datas.push({ target: this.$("node_menu_right"), dis: 200 })
        datas.push({ target: this.$("nodeRight"), dis: 120 })
        datas.push({ target: this.$("nodeUser"), dis: -cc.winSize.width })
        datas.push({ target: this.$("nodeMenu"), dis: -cc.winSize.width })

        node.on("scroll-began", () => {
            act_have_run = true
            for (const itr of datas) {
                cc.tween(itr.target).by(time, { x: itr.dis }).start()
            }
        })

        node.on("scroll-ended", () => {
            if (!act_have_run) {
                return
            }
            act_have_run = false
            for (const itr of datas) {
                cc.tween(itr.target).by(time, { x: -itr.dis }).start()
            }
        })
    }

    //TODO 添加 更多游戏 触摸事件控制
    addMoreGameViewScrollCtrl(){
        const node = this.$("New ScrollView")
        node.on(cc.Node.EventType.TOUCH_START, (event) => {
            console.log("jin---addMoreGameViewScrollCtrl left1", event.touch.getLocation())
            // this.$("nodeMain", cc.PageView).scrollToPage(this.$("nodeMain", cc.PageView).getCurrentPageIndex()-1, 0.3)
            this.startPos = event.touch.getLocation()
            
        })
        node.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            this.endPos = event.touch.getLocation()
            if(this.startPos.x && 200 <= (this.endPos.x - this.startPos.x)){
                console.log("jin---addMoreGameViewScrollCtrl left", this.endPos, this.startPos.x ,this.endPos.x - this.startPos.x)
                this.$("nodeMain", cc.PageView).scrollToPage(this.$("nodeMain", cc.PageView).getCurrentPageIndex() - 1, 0.3)
            }
        })
    }

    setMainView(type: number, onlyUpdateButtons?: boolean) {
        // console.log("jin---setMainView:",type, onlyUpdateButtons)

        this.setButtonStatus("btn_fu_card", type != this.FU_CARD_VIEW ? true : false)
        this.setButtonStatus("btn_red_packet", type != this.RED_PACKET_VIEW ? true : false)
        this.setButtonStatus("btn_more_game", type != this.MORE_GAME_VIEW ? true : false)
        // console.log("jin---app.datas.morrow: ", app.datas.morrow)
        if(type == this.MORE_GAME_VIEW ){
            this.$("more_game_finger").active && (this.$("more_game_finger").active = false)
        }

        if (onlyUpdateButtons) {
            return
        }

        this.$("nodeRight").children.forEach((child: cc.Node) => {
            child.active = type == this.RED_PACKET_VIEW ? true : false
        })

        if ((type != this.FU_CARD_VIEW ? true : false) && !this.isFakeGiftShow) {
            //TODO 关闭新人礼包界面+
            // this.isFakeGiftShow = true
            // storage.set(FAKE_GIFT_KEY, true)
            // appfunc.showFakeGiftdPop()
        }
        if (appfunc.checkSpecialAward()) {
            monitor.emit("main_view_change", { type: 0 })
        }else{
            monitor.emit("main_view_change", { type: type })
        }
    }

    setButtonStatus(nodeName: string, active: boolean) {
        this.$(nodeName, cc.Button).interactable = active
        this.$(nodeName).getChildByName("icon").active = active
        if(this.$(nodeName).getChildByName("spine")){
            this.$(nodeName).getChildByName("spine").active = !active
        }
        
        if (active) {
            this.$(nodeName).setContentSize(183, 144)
        } else {
            this.$(nodeName).setContentSize(310, 180)
        }
    }

    onViewChange() {
        if (this.$("nodeMain", cc.PageView).getCurrentPageIndex() == this.FU_CARD_VIEW) {
            this.setMainView(this.FU_CARD_VIEW)
        } else if(this.$("nodeMain", cc.PageView).getCurrentPageIndex() == this.RED_PACKET_VIEW){
            this.setMainView(this.RED_PACKET_VIEW)
        }else if(this.$("nodeMain", cc.PageView).getCurrentPageIndex() == this.MORE_GAME_VIEW){
            this.setMainView(this.MORE_GAME_VIEW)
        }
    }

    onPressView(event: cc.Event.EventTouch, type: string) {
        audio.playMenuEffect()
        if (Number(type) == this.FU_CARD_VIEW) {
            this.$("nodeMain", cc.PageView).setCurrentPageIndex(this.FU_CARD_VIEW)
            this.setMainView(this.FU_CARD_VIEW, true)
        } else if(Number(type) == this.RED_PACKET_VIEW){
            this.$("nodeMain", cc.PageView).setCurrentPageIndex(this.RED_PACKET_VIEW)
            this.setMainView(this.RED_PACKET_VIEW)
        }else if(Number(type) == this.MORE_GAME_VIEW){
            this.$("nodeMain", cc.PageView).setCurrentPageIndex(this.MORE_GAME_VIEW)
            this.setMainView(this.MORE_GAME_VIEW, true)
        }
    }

    showMiniGameGrid(){
        //1.在线数据 2.显示 miniGameGrid_fuCard miniGameGrid_redPacket
        if(!app.getOnlineParam("display_game_appid") || !app.getOnlineParam("display_game_icon") || !app.getOnlineParam("display_game_name")){
            this.$("miniGameGrid_redPacket").active = false
            this.$("miniGameGrid_fuCard").active = false
            return
        }
        cc.tween(this.$("miniGameGrid_redPacket"))// miniGameGrid_fuCard
        .then(cc.tween().to(0.09, { angle: 35 }).to(0.18, { angle: -35 }).to(0.09, { angle: 0 }).to(0.09, { angle: 35 }).to(0.18, { angle: -35 }).to(0.09, { angle: 0 }).delay(4))
        .repeatForever()
        .start()
        // console.log("jin---display_game_appid: ", app.getOnlineParam("display_game_appid"))
        if(app.getOnlineParam("display_game_appid")){
            //图片
            cc.assetManager.loadRemote(app.getOnlineParam("display_game_icon"), (err: Error, asset: cc.Texture2D | cc.SpriteFrame)=>{
                if (err) {
                    cc.error(err.message || err)
                    return
                }
                // console.log("jin---setGameId loadRes")
                const spriteFrame = asset instanceof cc.Texture2D ? new cc.SpriteFrame(asset) : asset
                if(this.getNodeComponent(this.$("icon_redPacket"), cc.Sprite)){
                    this.$("icon_redPacket", cc.Sprite).spriteFrame = spriteFrame
                    this.$("label_gameName_redPacket", cc.Label).string = app.getOnlineParam("display_game_name")
                }
            })
        }

        cc.tween(this.$("miniGameGrid_fuCard"))
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
                if(this.getNodeComponent(this.$("icon_fuCard"), cc.Sprite)){
                    this.$("icon_fuCard", cc.Sprite).spriteFrame = spriteFrame
                    this.$("label_gameName_fuCard", cc.Label).string = app.getOnlineParam("display_game_name")
                }
            })
        }
    }

    navigateToMiniGame(){
        console.log("jin---navigateToMiniGame");
        (app.platform as WeChatMiniGame).navigateToMiniProgram(app.getOnlineParam("display_game_appid"), null)
    }
}