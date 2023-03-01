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
        audio.playMusic({ bundle: "lobby", path: "lobby/audios/bgm" })
        SocketManager.add("lobby", LobbySocket)

        this.isFakeGiftShow = storage.get(FAKE_GIFT_KEY)

        appfunc.loadUserRole()
        appfunc.loadExchangeConfig()
        appfunc.loadTomorrowStatus()

        this.addScrollCtrl()
        this.$("nodeMain", cc.PageView).scrollToPage(ViewType.RED_PACKET, 0.01)

        // 金牛活动
        this.$("activity").active = this.$("activity2").active = appfunc.hasActivity(2)

        // 分享
        this.$("share").active = app.getOnlineParam("lobby_share", false)

        if (app.getOnlineParam("app_review")) {
            this.isFakeGiftShow = true
            this.$("btn_red_packet").active = false
            this.$("btn_fuli").active = false
            this.$("indicator").active = false

            this.$("nodeMain", cc.PageView).enabled = false
            this.$("content", cc.Widget).updateAlignment()
            this.$("content").removeComponent(cc.Widget)
            this.$("content").x = this.$("content").width / 4
            this.setMainView(ViewType.FU_CARD)
        }
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
}
