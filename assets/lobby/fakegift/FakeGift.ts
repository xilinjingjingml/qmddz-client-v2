import { audio } from "../../base/audio"
import BasePop from "../../base/view/BasePop"
import { app } from "../../start/app"
import { startFunc } from "../../start/startFunc"
import { appfunc } from "../../lobby/appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class FakeGift extends BasePop {

    start() {
        if (appfunc.checkSpecialAward()) {//app.getOnlineParam("app_review")
            this.$("label2", cc.RichText).string = "福卡x2000"
        }
    }

    onPressGet() {
        audio.playMenuEffect()
        startFunc.showToast("领取成功")
        this.close()
    }
}