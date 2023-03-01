import { audio } from "../../base/audio"
import { math } from "../../base/math"
import { storage } from "../../base/storage"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import BaseAdPop from "../../start/scripts/components/BaseAdPop"
import { startFunc } from "../../start/startFunc"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

const ADS_AWARDS_TIME_KEY = "ads_awards_time_key"

@ccclass
export default class AdsAward extends BaseAdPop {

    params: { index: number, number: number, adindex: number }

    bannerIndex: number = 0

    start() {
        // const info = appfunc.getItemIconInfo(this.params.index)
        // if (info) {
        //     this.setSprite({ node: this.$("item"), bundle: info.bundle, path: info.path, adjustSize: true })
        // }

        // if (this.params.number <= 0) {
        //     this.$("labelDesc", cc.Label).string = "免费领取大量奖励" + appfunc.getItemName(this.params.index)
        // } else {
        //     this.$("labelDesc", cc.Label).string = "免费领取奖励：" + appfunc.getItemName(this.params.index) + "x" + this.params.number
        // }

        let cd = appfunc.getCooldownTime(ADS_AWARDS_TIME_KEY)
        let count = ads.getVideoLeftTimes(this.params.adindex)
        if (count > 0) {
            this.$("gray").active = true
            this.$("gray/countdown").active = true
            this.$("countdownNum", cc.RichText).string = `今日剩余<color=#FCE784>${count}</color>次`
            if (cd > 0) {
                this.$("gray/countdown/time", cc.Label).string = `${cd}`//`<color=#FCE784>${cd}</color>秒后可领取`
                let label = this.$("gray/countdown/time", cc.Label)
                cc.tween(this.node).then(cc.tween()
                    .call(() => {
                        if (!this.isValid) return
                        cd--
                        label.string = `${cd}`//`<color=#FCE784>${cd}</color>秒后可领取`
                        if (cd <= 0) {
                            this.$("gray").active = false
                        }
                    })
                    .delay(1))
                    .repeatForever()
                    .start()
            } else {
                this.$("gray").active = false
                // this.$("countdown", cc.RichText).string = `今日剩余<color=#FCE784>${count}</color>次`
            }
        } else {
            this.$("gray").active = true
            this.$("gray/over").active = true
            this.$("countdownNum", cc.RichText).string = `今日次数已用完`
        }

        this.$("labelDesc", cc.Label).string = "x" + this.params.number

        // cc.tween(this.$("ljpq_guang")).then(cc.tween().set({angle: 0}).to(3.5, {angle: 180}).to(3.5, {angle: 360})).repeatForever().start()
        // cc.tween(this.$("ljpq_xx0")).then(cc.tween().delay(.2).to(1.5, {opacity: 100, scale: .6}).delay(.5).to(1.5, {opacity: 255, scale: 1.2})).repeatForever().start()
        // cc.tween(this.$("ljpq_xx1")).then(cc.tween().delay(.2).to(1.5, {opacity: 100, scale: 1.3}).delay(.5).to(1.5, {opacity: 255, scale: .8})).repeatForever().start()
        // cc.tween(this.$("ljpq_xx2")).then(cc.tween().delay(.2).to(1.5, {opacity: 100, scale: 1.5}).delay(.5).to(1.5, {opacity: 255, scale: .9})).repeatForever().start()
    }

    onPressGet() {
        audio.playMenuEffect()
        let cd = appfunc.getCooldownTime(ADS_AWARDS_TIME_KEY)
        if (cd > 0) {
            startFunc.showToast(`请${cd}秒后再试`)
            return
        }

        ads.receiveAward({
            index: this.params.adindex,
            success: () => {
                storage.set(ADS_AWARDS_TIME_KEY, appfunc.accurateTime())
                this.isValid && this.close()
            }
        })
    }
}