import { audio } from "../../base/audio"
import { listen } from "../../base/monitor"
import BaseView from "../../base/view/BaseView"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { startFunc } from "../../start/startFunc"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class MenuCtrl extends BaseView {

    start() {
        if (app.datas.TomorrowStatus) {
            this.setTomorrowActive(false)
        }

        if (appfunc.checkSpecialAward()) {// app.getOnlineParam("app_review")
            this.$("exchange").active = false
            this.onChangeView({ type: 0 })
        }
    }

    @listen("tomorrow_status_update")
    setTomorrowActive(type?: boolean) {
        console.log("jin---setTomorrowActive", type)
        if(type === false){
            this.$("tomorrow_gift").active = false
            return
        }
        
        this.$("tomorrow_gift").active = app.datas.TomorrowStatus.enabled
    }

    @listen("main_view_change")
    onChangeView(param: { type: number }) {
        this.$("fu_card_menu").active = param.type == 0
        this.$("red_packet_menu").active = param.type == 1
    }

    onPressAdsAward(event: cc.Event.EventTouch, adindex: string) {
        audio.playMenuEffect()
        if (ads.checkCanReceive(Number(adindex))) {
            appfunc.showAdsAwardPop(ads.awards[adindex])
        } else {
            startFunc.showToast("您今日的奖励次数已用完，请明天再来！")
        }
    }
}