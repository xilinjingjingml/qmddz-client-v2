import { audio } from "../../base/audio"
import { math } from "../../base/math"
import { listen } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { GAME, GAME_TYPE, ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class FuCardInfo extends BasePop {

    start() {
        this.setFuCardNum()
    }

    @listen("user_data_update")
    setFuCardNum() {
        const num = app.user.getItemNum(ITEM.REDPACKET_TICKET)
        this.$("labelFuCardNum", cc.Label).string = num + "≈" + math.fixd(appfunc.toFuCard(num)) + "元"
    }

    onPressGoGame() {
        audio.playMenuEffect()
        appfunc.startGame(GAME.DDZ, GAME_TYPE.DDZ_BXP)
        this.close()
    }

    onPressFreeAds() {
        audio.playMenuEffect()
        if (ads.checkCanReceive(Number(ads.video.DrawRp))) {
            appfunc.showAdsAwardPop(ads.awards[ads.video.DrawRp])
            this.close()
        } else {
            startFunc.showToast("您今日的奖励次数已用完，请明天再来！")
        }
    }
}
