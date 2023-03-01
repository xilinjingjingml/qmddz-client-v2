import { audio } from "../../base/audio"
import { math } from "../../base/math"
import { listen } from "../../base/monitor"
import BaseView from "../../base/view/BaseView"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class FuCardView extends BaseView {

    start() {
        this.setFuCardNum()
        this.setPlayerNum()
        if (app.getOnlineParam("app_review")) {
            this.$("info").active = false
        }
    }

    @listen("user_data_update")
    setFuCardNum() {
        this.$("labelFuCardNum", cc.Label).string = math.fixd(appfunc.toFuCard(app.user.getItemNum(ITEM.REDPACKET_TICKET))) + "元"
        if (app.getOnlineParam("app_review")) {
            this.$("labelFuCardNum", cc.Label).string = "" + app.user.getItemNum(ITEM.REDPACKET_TICKET)
        }
    }

    setPlayerNum() {
        const scopes = [
            [4000, 6000],
            [1000, 2000],
            [20000, 30000],
        ]
        for (let i = 0; i < 3; i++) {
            this.$("labelPlayerNum" + i, cc.Label).string = "" + Math.floor(Math.random() * (scopes[i][1] - scopes[i][0] + 1) + scopes[i][0])
        }
    }

    onPressServerType(event: cc.Event.EventTouch, type: string) {
        audio.playMenuEffect()
        appfunc.showServerPop(Number(type))
    }
}
