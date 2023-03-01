import BasePop from "../../base/view/BasePop"

const { ccclass } = cc._decorator

@ccclass
export default class WithdrawalToastPop extends BasePop {

    start() {
        cc.tween(this.node)
            .delay(2)
            .parallel(
                cc.tween().to(0.2, { opacity: 0 }),
                cc.tween().by(0.2, { y: 20 }),
            )
            .call(this.close.bind(this))
            .start()
    }
}
