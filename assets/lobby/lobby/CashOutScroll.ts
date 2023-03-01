import { math } from "../../base/math"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class CashOutScroll extends cc.Component {

    data: { name: string, area: string, time: number, money: number }[] = []

    onLoad() {
        const date: Date = appfunc.accurateTime(true)
        date.setSeconds(0, 0)
        math.setSeed(Math.floor(date.getTime() / 1000))

        for (let i = 0; i < 10; i++) {
            this.data.push({
                name: appfunc.randomName(6), area: appfunc.randomArea(), time: Math.floor(math.randomSeed() * 10 + 3),
                money: (math.randomSeed() * 300) / 100
            })
        }

        this.data.sort((a, b) => { return b.time - a.time })

        this.initView()
    }

    setNodeView(node: cc.Node, index: number, highlight: boolean, posY?: number, parent?: cc.Node) {
        const data = this.data[index]
        // const label = node.getComponent(cc.RichText)
        // if (highlight) {
        node.children.forEach(i => i.getComponent(cc.RichText).fontSize = 28)
        node.children[0].getComponent(cc.RichText).string = `${data.time}分钟前`
        node.children[1].getComponent(cc.RichText).string = `${data.name}`
        node.children[2].getComponent(cc.RichText).string = `提现${data.money < .3 ? "0.3" : data.money.toFixed(1)}元`
        node.opacity = 255
        // } else {
        //     node.children.forEach(i => i.getComponent(cc.RichText).fontSize = 26)            
        //     node.children[0].getComponent(cc.RichText).string = `${data.time}分钟前`
        //     node.children[1].getComponent(cc.RichText).string = `${data.area}的${data.name}`
        //     node.children[2].getComponent(cc.RichText).string = `${appfunc.toCash(appfunc.CASH_OUT_NUM)} </c>元`
        //     node.opacity = 178
        // }

        if (posY != undefined) {
            node.y = posY
        }

        if (parent != undefined) {
            node.parent = parent
        }

        node.active = true
    }

    initView() {
        const startY = -20
        const deltaY = 40
        const capacity = 3

        const model = this.node.children[0]
        model.removeFromParent()

        for (let i = 0, len = Math.min(capacity, this.data.length); i < len; i++) {
            this.setNodeView(cc.instantiate(model), i, false, i * -deltaY + startY, this.node)
        }

        if (this.data.length >= capacity) {
            const nodes = this.node.children
            const resetY = capacity * -deltaY + startY

            let dataIdx = capacity % this.data.length
            let nodeIdx = nodes.length
            let midIdx = 2
            let midDataIdx = 2

            this.setNodeView(cc.instantiate(model), dataIdx, false, resetY, this.node)

            for (const node of nodes) {
                node.runAction(cc.repeatForever(cc.sequence(
                    cc.moveBy(0.5, 0, deltaY),
                    cc.delayTime(5)
                )))
            }

            cc.tween(this.node).then(cc.tween()
                .delay(0.5)
                .call(() => {
                    this.setNodeView(nodes[midIdx], midDataIdx, true)
                })
                .delay(5)
                .call(() => {
                    this.setNodeView(nodes[midIdx], midDataIdx, false)
                    midDataIdx = (midDataIdx + 1) % this.data.length
                    midIdx = (midIdx + 1) % nodes.length

                    dataIdx = (dataIdx + 1) % this.data.length
                    nodeIdx = (nodeIdx + 1) % nodes.length
                    this.setNodeView(nodes[nodeIdx], dataIdx, false, resetY)
                })
            )
                .repeatForever()
                .start()
        }

        model.destroy()
    }
}
