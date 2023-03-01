import { UserExtends } from "../../base/extends/UserExtends"
import { listen } from "../../base/monitor"
import { app } from "../../start/app"
import { EventName } from "../game/GameConfig.ddz"
import BaseChair from "../scripts/base/BaseChair.ddz"
import { isBaiYuan } from "../scripts/components/conditions/BaiYuanCondition.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class avater extends BaseChair {
    params: { chairId: number, guid?: number }
    guid: number

    start() {
        this.onGameReinit()
        if (this.params.guid) {
            this.setData(this.params.guid)
        }
    }

    @listen(EventName.game_reinit)
    onGameReinit() {
        this.setLord(false)
        this.setAuto(false)
        this.$("node_tixian").active = false
    }

    setData(guid: number) {
        if (this.guid == guid) {
            return
        }

        this.guid = guid

        // avater
        UserExtends.setUserFace({
            node: this.$("spt_avater"),
            uid: this.guid,
            adjustSize: this.$("mask"),
            load: this.load.bind(this),
        })

        // tixian
        if (isBaiYuan() && !this.isMyPlayer) {
            this.$("node_tixian").active = false
            const configs = app.getOnlineParam("GmmePlayer_tixian_config", [
                { weight: 15, value: 0 },
                { weight: 5, value: 200 },
                { weight: 1, value: 400 },
                { weight: 1, value: 600 },
                { weight: 1, value: 800 },
            ])
            let sum = 0
            configs.forEach(cfg => sum += cfg.weight)
            let rand = guid % sum
            for (let i = 0; i < configs.length; i++) {
                rand -= configs[i].weight
                if (rand < 0) {
                    if (configs[i].value > 0) {
                        this.$("node_tixian").active = true
                        this.$("label_tixian", cc.Label).string = "已提" + configs[i].value
                    }
                    return
                }
            }
        }
    }

    setLord(active: boolean) {
        this.$("mark_lord").active = active
    }

    setAuto(auto: boolean) {
        this.$("auto_robot").active = auto
    }

    @listen("proto_bc_join_table_ack")
    proto_bc_join_table_ack(message: Iproto_bc_join_table_ack) {
        if (message.ret == 0) {
            for (const plyData of message.tableAttrs.players) {
                if (this.isSelf(plyData.chairId)) {
                    this.setData(plyData.plyGuid)
                    break
                }
            }
        }
    }

    @listen("proto_bc_ply_join_not")
    proto_bc_ply_join_not(message: Iproto_bc_ply_join_not) {
        if (!this.isSelf(message.plyData.chairId)) {
            return
        }
        this.setData(message.plyData.plyGuid)
    }

    @listen("proto_gc_lord_card_not")
    proto_gc_lord_card_not(message: Iproto_gc_lord_card_not) {
        if (message.cLord < 0 || !this.isSelf(message.cLord)) {
            return
        }
        this.setLord(true)
    }

    @listen("proto_gc_play_card_req")
    proto_gc_play_card_req(message: Iproto_gc_play_card_req) {
        if (!this.isMyPlayer) {
            return
        }
        this.setAuto(message.cAuto == 1)
    }

    @listen(EventName.game_end)
    onGameEnd() {
        this.setAuto(false)
    }

    @listen("proto_gc_auto_not")
    proto_gc_auto_not(message: Iproto_gc_auto_not) {
        if (!this.isSelf(message.cChairID)) {
            return
        }
        this.setAuto(message.cAuto == 1)
    }
}
