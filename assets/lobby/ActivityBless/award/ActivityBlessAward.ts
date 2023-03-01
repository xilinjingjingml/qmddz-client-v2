import { http } from "../../../base/http"
import { monitor } from "../../../base/monitor"
import BasePop from "../../../base/view/BasePop"
import { app } from "../../../start/app"
import { ITEM } from "../../../start/config"
import { startFunc } from "../../../start/startFunc"
import { urls } from "../../../start/urls"
import { appfunc } from "../../appfunc"
import { getAwardByRank } from "../bless/ActivityBless"

const { ccclass } = cc._decorator

@ccclass
export default class ActivityBlessAward extends BasePop {

    params: { award: boolean }

    start() {
        const showAward = this.params.award

        const rank = app.datas.GameRank.blessingRank

        this.$("node_win").active = showAward
        this.$("node_lose").active = !showAward

        if (showAward) {
            this.$("label_box", cc.Label).string = "奖池*" + getAwardByRank(rank) + "%"
            this.$("label_rank", cc.RichText).string = `您上一轮祈福排名为<color=ff74250> ${rank} </c>名`
        } else {
            this.$("label_rank", cc.RichText).string = `您上一轮祈福排名为<color=ff74250>未上榜</c>`
        }
    }

    onPressGet() {
        http.open(urls.ACTIVE_BLESS_INFO, {
            uid: app.user.guid,
            ticket: app.user.ticket,
            gameId: app.gameId,
            flag: 1,
        }, (err, res: { ret: number, itemNum: number }) => {
            cc.log("ActivityBlessAward.onPressGet", res)
            if (!this.isValid) {
                return
            }

            this.close()
            if (res && res.ret == 0) {
                monitor.emit("activity_sign_reload", true)
                appfunc.showAwardPop([{ index: ITEM.REDPACKET_TICKET, num: res.itemNum }])
            } else {
                startFunc.showToast("领取错误！")
            }
        })
    }
}
