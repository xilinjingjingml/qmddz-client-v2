import { audio } from "../../base/audio"
import { NodeExtends } from "../../base/extends/NodeExtends"
import { http } from "../../base/http"
import BasePop from "../../base/view/BasePop"
import { ViewManager } from "../../base/view/ViewManager"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { urls } from "../../start/urls"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class Tomorrow extends BasePop {

    data: IItemInfo[]

    start() {
        appfunc.loadTomorrowData(() => {
            appfunc.loadTomorrowStatus(() => {
                this.isValid && this.initView()
            })
        })
    }

    initView() {
        const status = app.datas.TomorrowStatus

        const lastSignTime = status.ret == 0 ? status.list[0].signTime : 0

        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const zerotime = Math.floor(now.getTime() / 1000)

        const alreadySign = zerotime < lastSignTime
        const canGetAward = lastSignTime < zerotime

        let curday = status.ret == 0 ? status.list[0].signDay : 0

        if (alreadySign && curday > 0) {
            curday = curday - 1
        }

        let canOrder = true
        if (curday > 6) {
            curday = 6
            canOrder = false
        }

        this.data = app.datas.TomorrowData[curday].itemConfig

        const days = this.$("days").children

        for (let i = 0; i < curday + 1; i++) {
            cc.find("passed", days[i]).active = true
            cc.find("future", days[i]).active = false
            cc.find("label", days[i]).color = cc.color(178, 122, 65)
        }

        const gifts = this.$("gifts").children

        for (let i = 0; i < gifts.length; i++) {
            const gift = gifts[i]
            if (this.data[i].itemIndex == ITEM.TO_CASH) {
                cc.find("name", gift).getComponent(cc.Label).string = `最高得${[5, 10, 15][i]}元`
                const icon = cc.find(`icon${this.data[i].itemIndex}_${this.data[i].itemNum}`, gift)
                if (icon) {
                    icon.active = true
                }
            } else {
                cc.find("name", gift).getComponent(cc.Label).string = appfunc.getItemName(this.data[i].itemIndex) + "x" + this.data[i].itemNum
                // TODO icon
                const icon = cc.find("icon" + this.data[i].itemIndex, gift)
                if (icon) {
                    icon.active = true
                }
            }
        }

        if (canGetAward && status.tomorrowAward.length > 0) {
            ViewManager.showPopup({ bundle: "lobby", path: "tomorrow/award", params: { awards: status.tomorrowAward } })
            status.tomorrowAward = []
        }

        canOrder && this.initOrderView(status.tomorrowAward)
    }

    initOrderView(ordered: IItemInfo[]) {
        const gifts = this.$("gifts").children

        const st = {}
        for (var i = 0; i < ordered.length; i++) {
            st[ordered[i].itemIndex] = 1
        }

        const check = (data: IItemInfo) => {
            return ordered.some(order => order.itemIndex == data.itemIndex && (data.itemIndex != ITEM.TO_CASH || order.itemNum == data.itemNum))
        }

        for (let i = 0; i < gifts.length; i++) {
            const order = cc.find("order", gifts[i])
            const orderAd = cc.find("orderAd", gifts[i])
            order.active = orderAd.active = false

            if (check(this.data[i])) {
                cc.find("flag", gifts[i]).active = true
            } else {
                if (ordered.length == 0) {
                    order.active = true
                } else if (ordered.length == 1) {
                    orderAd.active = true
                }
            }
        }

        this.$("text1").active = this.$("text2").active = this.$("text3").active = false
        if (ordered.length == 0) {
            this.$("text1").active = true
        } else if (ordered.length == 1) {
            this.$("text2").active = true
        } else {
            this.$("text3").active = true
        }
    }

    orderTomorrowAward(item: IItemInfo) {
        http.open(urls.TOMORROW_AWARD, {
            uid: app.user.guid,
            ticket: app.user.ticket,
            gameId: 1,
            itemNum: item.itemNum,
            itemIndex: item.itemIndex,
            flag: 0
        }, (err, res) => {
            if (res && res.ret == 0) {
                const data = app.datas.TomorrowStatus
                data.tomorrowAward.push(item)
                this.isValid && this.initOrderView(data.tomorrowAward)
            } else {
                startFunc.showToast("预约奖励失败")
            }
        })
    }

    onPressOrder(event: cc.Event.EventTouch, id: number) {
        audio.playMenuEffect()
        NodeExtends.cdTouch(event)
        // TODO requestSubscribeMessage
        this.orderTomorrowAward(this.data[id])
    }

    onPressOrderByAds(event: cc.Event.EventTouch, id: number) {
        audio.playMenuEffect()
        NodeExtends.cdTouch(event)
        ads.receiveAward({
            index: ads.video.TomorrowChoose,
            success: () => {
                this.orderTomorrowAward(this.data[id])
            }
        })
    }
}