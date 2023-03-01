const { ccclass } = cc._decorator

@ccclass
export default class persist extends cc.Component {

    start() {
        cc.game.addPersistRootNode(this.node)

        // 监听显示事件
        cc.game.on("main_active", (active: boolean) => this.node.active = active, this)

        cc.game.emit("persist_node", this.node)
    }
}
