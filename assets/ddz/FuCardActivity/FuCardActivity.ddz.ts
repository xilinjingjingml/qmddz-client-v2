import TouchActive from "../../base/components/TouchActive"
import { listen } from "../../base/monitor"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import BaseActivity from "../scripts/base/BaseActivity.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class FuCardActivity extends BaseActivity {

    start() {
        this.$("node_btns").active = false
        this.$("node_hb_round").active = false
        this.$("btn_hb_round").active = false
        this.setCardCountActive()
        this.setItem(ITEM.REDPACKET_TICKET, app.user.getItemNum(ITEM.REDPACKET_TICKET))

        if (app.getOnlineParam("app_review")) {
            this.$("btn_hb_round", TouchActive).enabled = false
        }
    }

    @listen(EventName.game_result_next)
    onGameResultNext() {
        this.$("node_btns").active = true
        this.setCardCountActive()
    }

    @listen("ads_config_update")
    setCardCountActive() {
        this.$("btn_card_count").active = ads.checkCanReceive(ads.video.CardNoteBuyPop)
    }

    @listen("item_update")
    setItem(itemId: ITEM, itemNum: number) {
        if (itemId != ITEM.REDPACKET_TICKET) {
            return
        }

        // 红包信息
        this.$("label_hb", cc.Label).string = itemNum + "≈" + GameFunc.toFuCardString(itemNum)
    }

    refreshHBRound(now: number, sum: number) {
        now = Math.min(now, sum)
        this.$("label_fucard_progress", cc.Label).string = now + "/" + sum
        this.$("fucard_progress", cc.ProgressBar).progress = now / sum
        this.$("label_fucard", cc.Label).string = `再玩${sum - now}局`

        const money = [0, 0.2, 0.3, 0.5, 1, 2][app.runGameServer.level] || 100
        this.$("label_progress_hb_round", cc.Label).string = now + "/" + sum
        this.$("progress_hb_round", cc.ProgressBar).progress = now / sum
        this.$("label_round", cc.Label).string = `每${sum}局开福袋最高${money}元`

        if (!ads.checkCanReceive(ads.video.DrawRedpacket)) {
            this.$("btn_hb_round").getComponent(TouchActive).enabled = false
            this.$("node_hb_round").active = false
            this.$("fucard_progress").active = false
            this.$("label_fucard").y = this.$("fucard_progress").y - 7
            this.$("label_fucard", cc.Label).string = "您今日的福袋已开完"
        }
    }

    @listen(EventName.game_start)
    onGameStart() {
        this.$("node_btns").active = false
    }

    @listen("proto_gc_get_redpackets_award_ack")
    proto_gc_get_redpackets_award_ack(message: Iproto_gc_get_redpackets_award_ack) {
        this.$("btn_hb_round").active = true
        this.refreshHBRound(message.curRounds, message.limitRounds)
    }
}
