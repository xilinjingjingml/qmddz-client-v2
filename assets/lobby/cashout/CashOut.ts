import { audio } from "../../base/audio"
import { math } from "../../base/math"
import { listen } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class CashOut extends BasePop {

    params: { isGameRuning: boolean }

    start() {
        this.setBtnStatus()
        this.setUserMoney()
    }

    @listen("user_data_update")
    setUserMoney() {
        const num = appfunc.toCash(app.user.getItemNum(ITEM.TO_CASH))
        const sum = appfunc.toCash(appfunc.CASH_OUT_NUM)
        this.$("labelNum", cc.Label).string = math.fixd(num)
        this.$("progress", cc.Sprite).fillRange = num / sum
        this.$("labelDiff", cc.Label).string = "还差" + math.fixd((sum - num)) + "元"
        this.$("tips").x = -175 + (num / sum) * 506
    }

    setBtnStatus() {
        let show = true
        if (!ads.checkCanReceive(ads.video.New_EarlyGain)) {
            show = false
        } else if (app.user.getItemNum(ITEM.TO_CASH) >= (app.getOnlineParam("New_EarlyGain_money", 18000))) {
            show = false
        } else if (app.runGameServer) {
            show = !this.params.isGameRuning
        }
        this.$("btnEarlyGain").active = show
    }

    onPressCashOut() {
        audio.playMenuEffect()
        if (app.user.getItemNum(ITEM.TO_CASH) >= appfunc.CASH_OUT_NUM) {
            startFunc.showToast("库存不足！请明日再来")
        } else {
            startFunc.showToast("还差" + math.fixd(appfunc.toCash(appfunc.CASH_OUT_NUM - app.user.getItemNum(ITEM.TO_CASH))) + "元才能提现")
        }
    }

    onPressEarlyGain() {
        audio.playMenuEffect()
        ads.receiveAward({
            index: ads.video.New_EarlyGain,
            success: (res) => {
                if (this.isValid) {
                    this.setBtnStatus()
                }

                if (res.itemIndex != null && res.itemNum != null) {
                    appfunc.showAwardPop([{ index: res.itemIndex, num: res.itemNum }])
                } else {
                    appfunc.showAwardPop([{ index: ITEM.TO_CASH, num: 0 }])
                }
            },
            showAward: false
        })
    }
}