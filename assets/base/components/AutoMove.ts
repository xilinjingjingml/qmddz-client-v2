
const { ccclass, property } = cc._decorator;

@ccclass
export default class AutoMove extends cc.Component {

    @property(cc.Vec2)
    startPoint: cc.Vec2 = cc.v2()
    @property(cc.Vec2)
    endPoint: cc.Vec2 = cc.v2()

    @property(Number)
    time: number = 1.5

    start() {
        if (this.node) {
            cc.tween(this.node)
                .then(
                    cc.tween()
                    .set({ position: cc.v3(this.startPoint) })
                    .to(this.time, { position: cc.v3(this.endPoint) })
                    .delay(.5))
                .repeatForever()
                .start()
        }
    }

    // update (dt) {}
}
