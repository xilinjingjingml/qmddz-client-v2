import { math } from "../../base/math"
import { listen, monitor } from "../../base/monitor"
import { AudioManager } from "../audio/AudioManager.ddz"
import { EOperate, EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import BaseChair from "../scripts/base/BaseChair.ddz"

const { ccclass } = cc._decorator

/**
 * 闹钟
 */
@ccclass
export default class clock extends BaseChair {
    time: number
    delayTime: number

    start() {
        this.node.active = false
    }

    @listen(EventName.game_reinit)
    onGameReinit() {
        this.node.active = false
    }

    startTime(time: number) {
        this.stopTime()

        this.time = time
        this.node.active = true
        this.updateTime()
        this.schedule(this.updateTime, 1)
    }

    stopTime() {
        this.unschedule(this.updateTime)
        this.node.active = false
    }

    updateTime() {
        this.$("label_time", cc.Label).string = math.fill(this.time)
        if (this.time <= 0) {
            monitor.emit(EventName.clock_timeout, this.params.chairId)
            this.stopTime()
        }
        if (this.time <= 5) {
            AudioManager.playEffect("audio_clock")
        }
        this.time--
    }

    @listen("proto_gc_common_not")
    proto_gc_common_not(message: Iproto_gc_common_not) {
        if (message.nOp == EOperate.CO_TIMEOUT) {
        } else if (message.nOp == EOperate.CO_SHOWCARD) {
        } else if (message.cChairID < 0 || this.isSelf(message.cChairID)) {
            this.stopTime()
        }
    }

    @listen("proto_gc_lord_card_not")
    proto_gc_lord_card_not(message: Iproto_gc_lord_card_not) {
        if (message.cLord < 0 || !this.isSelf(message.cLord)) {
            return
        }
        if (GameFunc.isReconnect()) {
            return
        }
        this.delayTime = 1 // 延迟1秒显示闹钟 给叫分动画留个空
    }

    @listen(EventName.clock_time)
    proto_gc_clienttimer_not(message: Iproto_gc_clienttimer_not) {
        if (!this.isSelf(message.chairId)) {
            return
        }

        if (this.delayTime) {
            this.delayTime = 0
            this.scheduleOnce(() => this.startTime(Math.floor(message.sPeriod / 1000) - 1), 1)
            return
        }

        this.startTime(Math.floor(message.sPeriod / 1000))
    }

    @listen("proto_gc_play_card_not")
    proto_gc_play_card_not(message: Iproto_gc_play_card_not) {
        this.stopTime()
    }
}
