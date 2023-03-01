const { ccclass, disallowMultiple } = cc._decorator

@ccclass
@disallowMultiple
export default abstract class BaseAdapter extends cc.Component {

    onEnable() {
        cc.view.on("canvas-resize", this.onResized, this)
        this.onResized()
    }

    onDisable() {
        cc.view.off("canvas-resize", this.onResized, this)
    }

    abstract onResized(): void
}
