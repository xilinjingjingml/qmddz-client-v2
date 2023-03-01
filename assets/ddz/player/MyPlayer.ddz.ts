import AutoLoad from "../../base/components/AutoLoad"
import { listen, monitor } from "../../base/monitor"
import { appfunc } from "../../lobby/appfunc"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { EventName } from "../game/GameConfig.ddz"
import player from "./player.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class MyPlayer extends player {

    onLoad() {
        super.onLoad()
        // 头像
        this.$("avater", AutoLoad).params.guid = app.user.guid
    }

    start() {
        // // 金豆
        // this.setItem(ITEM.GOLD_COIN, app.user.getItemNum(ITEM.GOLD_COIN))
        // // 福卡
        // this.setItem(ITEM.REDPACKET_TICKET, app.user.getItemNum(ITEM.REDPACKET_TICKET))
        // 红包
        this.setItem(ITEM.TO_CASH, app.user.getItemNum(ITEM.TO_CASH))
        this.setItem(ITEM.INGOT, app.user.getItemNum(ITEM.INGOT))

        cc.director.once(cc.Director.EVENT_AFTER_DRAW, () => {
            app.datas.cashVec = this.$("node_avater/node_infoHB").convertToWorldSpaceAR(cc.v2(-95, 0))
            app.datas.ingotVec = this.$("node_avater/node_infoYB").convertToWorldSpaceAR(cc.v2(-95, 0))
        })
        
        this.reinit()
    }

    onGameJoin() {
        cc.log("[MyPlayer.onGameJoin]")
        this.reinit()
    }

    onGameStart() {
        cc.log("[MyPlayer.onGameStart]")
        this.reinit()
    }

    onGameLeave() {
        cc.log("[MyPlayer.onGameLeave]")
        this.reinit()
    }

    @listen(EventName.game_reinit)
    onGameReinit() {
        cc.log("[MyPlayer.onGameReinit]")
        this.reinit()
    }

    reinit() {
        this.refreshPutCards([])
        this.$("spt_putover").active = false
        this.$("node_hb_change").active = false
        this.$("node_chat").active = false
    }

    @listen("item_update")
    setItem(itemId: ITEM, itemNum: number) {
        console.log("jin---setItem:", itemId, itemNum)
        // super.setItem(itemId, itemNum)
        if(itemId == ITEM.TO_CASH) {
            this.$("yuan_num", cc.Label).string = "" + appfunc.toCash(itemNum).toFixed(2)// + "元"

            const progress = itemNum / appfunc.CASH_OUT_NUM
            this.$("progress_hb", cc.ProgressBar).progress = progress
            // this.$("label_progress_hb", cc.Label).string = Math.floor(progress * 100) + "%"
        }
        
        if (itemId === ITEM.INGOT) {
            this.$("yuanbao_num", cc.Label).string = "" + itemNum
            this.$("progress_yb", cc.ProgressBar).progress = itemNum / appfunc.SMAILL_CASH_OUT_NUM
            this.$("yuanbao", cc.Label).string = `≈ ${(Math.floor(itemNum / 100) / 100).toFixed(2)}元`
        }

        
    }

    playHbChangeAni(node: cc.Node) {
        cc.tween(node)
            .set({ y: -60, opacity: 0 })
            .to(0.3, { y: 0, opacity: 255 })
            .delay(1)
            .to(0.1, { opacity: 0 })
            .call(() => node.active = false)
            .start()
    }

    refreshHandCards(cards: Iproto_CCard[]) {
        monitor.emit(EventName.game_refreshHandCards, cards)
    }

    @listen("proto_bc_update_ply_data_not")
    proto_bc_update_ply_data_not(message: Iproto_bc_update_ply_data_not) {
        if (message.plyGuid == app.user.guid || message.plyGuid == this.data?.plyGuid) {
            app.user.setItemNum(ITEM.GOLD_COIN, message.amount)
        }
    }

    @listen("proto_bc_specify_item_update_not")
    proto_bc_specify_item_update_not(message: Iproto_bc_specify_item_update_not) {
        if (message.plyGuid == app.user.guid || message.plyGuid == this.data?.plyGuid) {
            app.user.setItemNum(message.index, message.num)
        }
    }

    @listen("proto_gc_play_card_req")
    proto_gc_play_card_req(message: Iproto_gc_play_card_req) {
        this.refreshPutCards([])
    }

    onPressCashout() {
        appfunc.showCashOutPop()
    }
}
