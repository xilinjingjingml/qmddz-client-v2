import { listen } from "../../base/monitor"
import { appfunc } from "../../lobby/appfunc"
import { EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import BaseBoard from "../scripts/base/BaseBoard.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class BaiYuanBoard extends BaseBoard {

    start() {
        super.start()

        this.setDouble(1)
    }

    @listen(EventName.game_reinit)
    onGameReinit() {
        super.onGameReinit()

        this.setDouble(1)
    }

    @listen(EventName.game_dizhu_update)
    refreshScore() {
        this.setScore(this.getDouble())
    }

    setDouble(double: number) {
        this.setScore(double)
    }

    setScore(double: number) {
        this.$("label_score", cc.Label).string = appfunc.toCash(GameFunc.getDizhu()) * double + ""
    }

    @listen("proto_gc_beishu_info_ack")
    proto_gc_beishu_info_ack(message: Iproto_gc_beishu_info_ack) {
        super.proto_gc_beishu_info_ack(message)

        this.setDouble(this.getDouble())
    }
}
