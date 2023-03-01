import { NodeExtends } from "../../base/extends/NodeExtends"
import { math } from "../../base/math"
import { listen, monitor } from "../../base/monitor"
import { utils } from "../../base/utils"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import BaseAdPop from "../../start/scripts/components/BaseAdPop"
import { AudioManager } from "../audio/AudioManager.ddz"
import { EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class FuCardResultPop extends BaseAdPop {
    params: {
        message: Iproto_gc_game_result_not1,
        fuCardMessage: Iproto_gc_get_redpackets_award_ack,
        closeCallback?: Function
    }
    bannerIndex: number = 0
    manualBanner: boolean = true
    beishuInfo: Iproto_gc_beishu_info_ack
    nGameMoney: number

    start() {
        this.refreshPlayers()
        this.refreshButtons()
        this.refreshHBRound(this.params.fuCardMessage.curRounds, this.params.fuCardMessage.limitRounds)
        this.removeCloseCallback()?.call(this)
    }

    refreshPlayers() {
        this.$("label_dizhu", cc.Label).string = Math.abs(GameFunc.getDizhu()) + ""

        const item = this.$("node_item")
        item.active = false

        this.params.message.vecUserResult1.sort((a, b) => GameFunc.S2C(a.nChairID) - GameFunc.S2C(b.nChairID))
        this.params.message.vecUserResult1.forEach((v, i) => {
            const node = cc.instantiate(item)
            node.parent = this.$("node_players")
            node.active = true
            const $ = utils.mark(node)

            let color: string
            if (i == 0) {
                if (v.nScore >= 0) {
                    this.$("node_win").active = true
                    this.$("node_lose").active = false
                    this.$("title_dizhu").color = cc.color("#bb3600")
                    color = "#d13800"
                } else {
                    this.$("node_win").active = false
                    this.$("node_lose").active = true
                    this.$("title_dizhu").color = cc.color("#41779b")
                    color = "#1674cc"
                }
            } else {
                color = "#555454"
            }
            utils.$($, "label_name").color = cc.color(color)
            utils.$($, "label_double").color = cc.color(color)
            utils.$($, "label_gold").color = cc.color(color)

            // 设置数据
            utils.$($, "node_lord").active = v.nChairID == GameFunc.getSLordChairId()
            utils.$($, "icon_pochan").active = false
            utils.$($, "icon_fengding").active = false

            const data = GameFunc.getPlayer(i)?.data
            utils.$($, "label_name", cc.Label).string = data ? utils.substr(data.nickname + "", 5) : ""
            utils.$($, "label_double", cc.Label).string = GameFunc.getDouble(v.nChairID) + ""
            utils.$($, "label_gold", cc.Label).string = math.short(v.nScore)
        })
    }

    refreshButtons() {
        const itemAds = {
            [ITEM.CARD_RECORD]: ads.video.CardNoteBuyPop,
            [ITEM.LOOK_LORDCARD]: ads.video.LookLordCard,
            [ITEM.SUPER_JIABEI]: ads.video.DoubleCard,
        }

        let itemId
        const itemIds = Object.keys(itemAds).sort((a, b) => app.user.getItemNum(Number(a)) - app.user.getItemNum(Number(b)))
        for (const id of itemIds) {
            if (ads.checkCanReceive(itemAds[id])) {
                itemId = id
                break
            }
        }

        this.$("btn_card_count").active = itemId == ITEM.CARD_RECORD
        this.$("btn_look_card").active = itemId == ITEM.LOOK_LORDCARD
        this.$("btn_jiabei").active = itemId == ITEM.SUPER_JIABEI
    }

    refreshHBRound(now: number, sum: number) {
        this.$("label_fucard_progress", cc.Label).string = now + "/" + sum
        this.$("fucard_progress", cc.ProgressBar).progress = now / sum
        this.$("label_fucard", cc.Label).string = `再打${sum - now}局开福袋`

        if (!ads.checkCanReceive(ads.video.DrawRedpacket)) {
            this.$("fucard_progress").active = false
            this.$("label_fucard").y = this.$("fucard_progress").y - 7
            this.$("label_fucard", cc.Label).string = "您今日的福袋已开完"
        }
    }

    onPressClose() {
        super.onPressClose()
        monitor.emit(EventName.game_result_start)
    }

    onPressNext() {
        super.onPressClose()
        monitor.emit(EventName.game_onPressStart)
    }

    onPressNextFree(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        ads.receiveAward({
            index: ads.video.LookLordCard,
            success: () => {
                GameFunc.send<Iproto_cg_look_lord_card_req>("proto_cg_look_lord_card_req", {})
                monitor.emit(EventName.game_onPressStart)
                this.close()
            }
        })
    }

    onPressItemAd(event: cc.Event.EventTouch, data: string) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()
        ads.receiveAward({ index: parseInt(data) })
    }

    onNodeSizeChange() {
        this.resizeBanner(this.$("node_popup"))
        super.onNodeSizeChange()
    }

    @listen("proto_gc_get_redpackets_award_ack")
    proto_gc_get_redpackets_award_ack(message: Iproto_gc_get_redpackets_award_ack) {
        this.refreshHBRound(message.curRounds, message.limitRounds)
    }
}
