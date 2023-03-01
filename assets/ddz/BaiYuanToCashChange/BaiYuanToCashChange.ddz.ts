import BasePop from "../../base/view/BasePop"
import { appfunc } from "../../lobby/appfunc"
import { GameFunc } from "../game/GameFunc.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class BaiYuanToCashChange extends BasePop {
    params: { value: number, bomb: boolean }

    start() {
        const win = this.params.value > 0
        const bomb = this.params.bomb
        const isLord = GameFunc.isLord()
        this.$("bg_win").active = win
        this.$("bg_lose").active = !win
        this.$("label_win").active = win
        this.$("label_lose").active = !win
        this.$("bomb_win").active = bomb && win
        this.$("bomb_lose").active = bomb && !win
        this.$("result_lord_win").active = !bomb && win && isLord
        this.$("result_lord_lose").active = !bomb && !win && isLord
        this.$("result_win").active = !bomb && win && !isLord
        this.$("result_lose").active = !bomb && !win && !isLord
        this.$("icon_zhadan").active = bomb && !win


        const value = appfunc.toCash(this.params.value).toFixed(2)
        if (win) {
            this.$("label_win", cc.Label).string = "+" + value + "元"
        } else {
            this.$("label_lose", cc.Label).string = value + "元"
        }

        cc.tween(this.node)
            .set({ opacity: 0 })
            .to(0.3, { opacity: 255 })
            .delay(3)
            .to(0.3, { opacity: 0 })
            .call(this.close.bind(this))
            .start()
    }
}
