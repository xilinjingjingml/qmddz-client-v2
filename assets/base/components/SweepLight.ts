const { ccclass, property, disallowMultiple, menu } = cc._decorator

@ccclass
@disallowMultiple
@menu("component/SweepLights")
export default class SweepLights extends cc.Component {

    @property()
    speed: number = 300

    @property()
    intervalDelay: number = 0.3

    @property({ type: [cc.Node] })
    lights: cc.Node[] = []

    start() {
        if (this.lights.length == 0) {
            return
        }

        const startx = this.lights[0].convertToWorldSpaceAR(cc.Vec2.ZERO).x
        const interval = this.intervalDelay + (this.lights[0].width / 2 + this.lights[this.lights.length - 1].width / 2 + this.node.width) / this.speed
        this.lights.forEach(node => {
            const x = node.width * node.anchorX + node.parent.width * node.parent.anchorX
            const t = (node.width + node.parent.width) / this.speed
            const delay = (node.convertToWorldSpaceAR(cc.Vec2.ZERO).x - startx) / this.speed
            cc.tween(node)
                .set({ x: -x })
                .delay(delay)
                .then(cc.tween()
                    .set({ x: -x })
                    .to(t, { x: x })
                    .delay(interval - t))
                .repeatForever()
                .start()
        })
    }
}
