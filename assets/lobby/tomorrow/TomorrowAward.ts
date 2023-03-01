import { audio } from "../../base/audio"
import { NodeExtends } from "../../base/extends/NodeExtends"
import { http } from "../../base/http"
import BasePop from "../../base/view/BasePop"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { urls } from "../../start/urls"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class TomorrowAward extends BasePop {

    params: { awards: IItemInfo[] }

    start() {
        const awards = this.params.awards
        const gifts = this.$("gifts").children

        if (awards.length == 1) {
            gifts[0].x = 0
            gifts[1].active = false
        }

        for (let i = 0; i < awards.length; i++) {
            const gift = gifts[i]
            if (awards[i].itemIndex == ITEM.TO_CASH) {
                const money = [5, 10, 15][awards[i].itemNum]
                cc.find("name", gift).getComponent(cc.Label).string = money ? `最高得${money}元` : ""
                const icon = cc.find(`icon${awards[i].itemIndex}_${awards[i].itemNum}`, gift)
                if (icon) {
                    icon.active = true
                }
            } else {
                cc.find("name", gift).getComponent(cc.Label).string = appfunc.getItemName(awards[i].itemIndex) + "x" + awards[i].itemNum
                // TODO icon
                const icon = cc.find("icon" + awards[i].itemIndex, gift)
                if (icon) {
                    icon.active = true
                }
            }
        }

        cc.tween(this.$("lights")).by(3, { angle: -180 }).repeatForever().start()
    }

    receiveAward(isDouble: boolean) {
        http.open(urls.TOMORROW_AWARD, {
            uid: app.user.guid,
            ticket: app.user.ticket,
            gameId: 1,
            flag: 1
        }, (err, res) => {
            if (res && res.ret == 0) {
                if (res.awardList) {
                    this.params.awards = res.awardList
                }
                const awards = []
                const ratio = isDouble ? 2 : 1
                for (const item of this.params.awards) {
                    awards.push({ index: item.itemIndex, num: item.itemNum * ratio })
                }
                appfunc.showAwardPop(awards)
                this.isValid && this.close()
            } else {
                startFunc.showToast("领取奖励失败")
            }
        })
    }

    onPressNormal(event: cc.Event.EventTouch) {
        audio.playMenuEffect()
        NodeExtends.cdTouch(event)
        this.receiveAward(false)
    }

    onPressDouble(event: cc.Event.EventTouch) {
        audio.playMenuEffect()
        NodeExtends.cdTouch(event)
        ads.receiveAward({
            index: ads.video.TomorrowGetMutiple,
            success: () => {
                this.receiveAward(true)
            }
        })
    }
}