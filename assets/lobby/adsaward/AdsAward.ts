import { audio } from "../../base/audio"
import { math } from "../../base/math"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import BaseAdPop from "../../start/scripts/components/BaseAdPop"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class AdsAward extends BaseAdPop {

    params: { index: number, number: number, adindex: number }

    bannerIndex: number = ads.banner.AdsAward

    start() {
        const info = appfunc.getItemIconInfo(this.params.index)
        if (info) {
            this.setSprite({ node: this.$("item"), bundle: info.bundle, path: info.path, adjustSize: true })
        }

        if (this.params.number <= 0) {
            this.$("labelDesc", cc.Label).string = "免费领取大量奖励" + appfunc.getItemName(this.params.index)
        } else {
            this.$("labelDesc", cc.Label).string = "免费领取奖励：" + appfunc.getItemName(this.params.index) + "x" + this.params.number
        }

        const num = app.user.getItemNum(ITEM.REDPACKET_TICKET)
        this.$("labelFuCardNum", cc.Label).string = num + " ≈ " + math.fixd(appfunc.toFuCard(num)) + "元"

        if (appfunc.checkSpecialAward() || this.params.index == ITEM.CARD_RECORD) {//app.getOnlineParam("app_review")
            this.$("nodeFuCard").active = false
        }
    }

    onPressGet() {
        audio.playMenuEffect()
        ads.receiveAward({
            index: this.params.adindex,
            success: () => {
                this.isValid && this.close()
            }
        })
    }
}