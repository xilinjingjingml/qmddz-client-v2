const { ccclass, disallowMultiple, menu } = cc._decorator

@ccclass
@disallowMultiple
@menu("component/ScaleBreath")
export default class ScaleBreath extends cc.Component {

    start() {
        cc.tween(this.node)
            .then(cc.tween().to(0.8, { scale: 1.1 }).to(0.8, { scale: 1 }))
            .repeatForever()
            .start()
    }
}
