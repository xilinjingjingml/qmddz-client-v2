import BasePop from "../../base/view/BasePop"

const { ccclass } = cc._decorator

@ccclass
export default class AdLoading extends BasePop {
    params: { time: number }

    start() {
        // loading转圈
        // cc.tween(this.$("loading_bg")).by(1, { angle: -360 }).repeatForever().start()

        if (this.params.time > 0) {
            this.scheduleOnce(this.close.bind(this), this.params.time)
        }
    }
}
