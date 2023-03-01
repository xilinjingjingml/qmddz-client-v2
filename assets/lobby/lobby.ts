import { audio } from "../base/audio"
import { NodeExtends } from "../base/extends/NodeExtends"
import { monitor } from "../base/monitor"
import { SocketManager } from "../base/socket/SocketManager"
import { storage } from "../base/storage"
import BaseView from "../base/view/BaseView"
import { ViewManager } from "../base/view/ViewManager"
import { report } from "../report"
import { ads } from "../start/ads"
import { app } from "../start/app"
import { startFunc } from "../start/startFunc"
import { appfunc } from "./appfunc"
import LobbySocket from "./LobbySocket"

const { ccclass } = cc._decorator

enum ViewType {
    FU_CARD = 0,
    RED_PACKET = 1,
}

const FREE_REDPACKET_TIME_KEY = "last_free_redpacket_time"
export const FAKE_GIFT_KEY = "fake_gift_show"

@ccclass
export default class lobby extends BaseView {

    isFakeGiftShow: boolean

    start() {
        report("大厅", "界面显示")
        audio.playMusic({ bundle: "lobby", path: "lobby/audios/bgm" })
        SocketManager.add("lobby", LobbySocket)

        storage.set("result_next", 1)
        this.isFakeGiftShow = storage.get(FAKE_GIFT_KEY)

        appfunc.loadUserRole()
        appfunc.loadExchangeConfig()
        appfunc.loadTomorrowStatus()

        this.addScrollCtrl()
        // this.$("nodeMain", cc.PageView).scrollToPage(ViewType.RED_PACKET, 0.01)

        // 分享
        this.$("share").active = app.getOnlineParam("lobby_share", false)

        if (app.getOnlineParam("app_review")) {
            this.isFakeGiftShow = true
            this.$("btn_red_packet").active = false
            this.$("btn_fuli").active = false
            this.$("indicator").active = false

            // this.$("nodeMain", cc.PageView).enabled = false
            this.$("content", cc.Widget).updateAlignment()
            this.$("content").removeComponent(cc.Widget)
            this.$("content").x = this.$("content").width / 4
            this.setMainView(ViewType.FU_CARD)
        }

        this.updateFreeIngot()       

        app.datas.cashVec = this.$("red_packet_view/money").convertToWorldSpaceAR(cc.v2())
        app.datas.ingotVec = this.$("red_packet_view/yuanbaoketijine_di").convertToWorldSpaceAR(cc.v2())
    }

    onPressShare(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        audio.playMenuEffect()
        app.platform.sociaShare()
    }

    onPressCashOut(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        audio.playMenuEffect()
        appfunc.showCashOutPop()
    }

    onPressFreeRedPacket() {
    //     ViewManager.showPopup({ bundle: "ddz", path: "Jiasutixian/jiasutixianPop", params: {} })
    // }
    // test() {
        audio.playMenuEffect()
        if (ads.checkCanReceive(ads.video.Free_Ingot)) {
            let cd = appfunc.getCooldownTime(FREE_REDPACKET_TIME_KEY)
            if (cd > 0) {
                startFunc.showToast(`请${cd}秒后再试`)
            } else {
                ads.receiveAward({
                    index: ads.video.Free_Ingot,
                    showAward: false,
                    success: (res) => {
                        if (res && res.ret == 0) {
                            storage.set(FREE_REDPACKET_TIME_KEY, appfunc.accurateTime())
                            // TODO checkCooldown
                            // this.checkCooldown()

                            // if (res.itemIndex != null && res.itemNum != null) {
                            //     appfunc.showAwardPop([{ index: res.itemIndex, num: res.itemNum }])
                            // } else {
                            //     appfunc.showAwardPop([{ index: ITEM.TO_CASH, num: 0 }])
                            // }
                            appfunc.showAwardPop(res.awards)

                            this.updateFreeIngot()
                        } else {
                            startFunc.showToast("领取失败")
                        }
                    }
                })
            }
        } else {
            startFunc.showToast("今日领元宝次数已用完，请明天再试")
        }
    }

    onPressAdsAward(event: cc.Event.EventTouch, adindex: string) {
        audio.playMenuEffect()
        if (ads.checkCanReceive(Number(adindex))) {
            appfunc.showAdsAwardPop(ads.awards[adindex])
        } else {
            startFunc.showToast("您今日的奖励次数已用完，请明天再来！")
        }
    }

    onPressFuli() {
        startFunc.showToast("敬请期待")
    }

    addScrollCtrl() {
        const time = 0.1
        let act_have_run = false
        // const node = this.$("nodeMain")

        const datas: { target: cc.Node, dis: number }[] = []
        datas.push({ target: this.$("node_menu_right"), dis: 200 })
        datas.push({ target: this.$("nodeRight"), dis: 120 })
        datas.push({ target: this.$("nodeUser"), dis: -cc.winSize.width })
        datas.push({ target: this.$("nodeMenu"), dis: -cc.winSize.width })

        // node.on("scroll-began", () => {
        //     act_have_run = true
        //     for (const itr of datas) {
        //         cc.tween(itr.target).by(time, { x: itr.dis }).start()
        //     }
        // })

        // node.on("scroll-ended", () => {
        //     if (!act_have_run) {
        //         return
        //     }
        //     act_have_run = false
        //     for (const itr of datas) {
        //         cc.tween(itr.target).by(time, { x: -itr.dis }).start()
        //     }
        // })
    }

    setMainView(type: ViewType, onlyUpdateButtons?: boolean) {
        const isFuCardView = type == ViewType.FU_CARD
        this.setButtonStatus("btn_fu_card", !isFuCardView)
        this.setButtonStatus("btn_red_packet", isFuCardView)

        if (onlyUpdateButtons) {
            return
        }

        this.$("nodeRight").children.forEach((child: cc.Node) => {
            child.active = !isFuCardView
        })

        if (isFuCardView && !this.isFakeGiftShow) {
            this.isFakeGiftShow = true
            storage.set(FAKE_GIFT_KEY, true)
            appfunc.showFakeGiftdPop()
        }

        monitor.emit("main_view_change", { type: type })
    }

    setButtonStatus(nodeName: string, active: boolean) {
        this.$(nodeName, cc.Button).interactable = active
        this.$(nodeName).getChildByName("icon").active = active
        this.$(nodeName).getChildByName("spine").active = !active

        if (active) {
            this.$(nodeName).setContentSize(183, 144)
        } else {
            this.$(nodeName).setContentSize(310, 180)
        }
    }

    onViewChange() {
        if (this.$("nodeMain", cc.PageView).getCurrentPageIndex() == ViewType.FU_CARD) {
            this.setMainView(ViewType.FU_CARD)
        } else {
            this.setMainView(ViewType.RED_PACKET)
        }
    }

    onPressView(event: cc.Event.EventTouch, type: string) {
        audio.playMenuEffect()
        if (Number(type) == ViewType.FU_CARD) {
            this.$("nodeMain", cc.PageView).setCurrentPageIndex(ViewType.FU_CARD)
            this.setMainView(ViewType.FU_CARD, true)
        } else {
            this.$("nodeMain", cc.PageView).setCurrentPageIndex(ViewType.RED_PACKET)
            this.setMainView(ViewType.RED_PACKET, true)
        }
    }

    onPressSign() {
        appfunc.showSignPop()
    }

    updateFreeIngot() {
        this.$("nodeRight/free_red_packet/point/num", cc.Label).string = `${ads.getVideoLeftTimes(ads.video.Free_Ingot)}`
    }

}
