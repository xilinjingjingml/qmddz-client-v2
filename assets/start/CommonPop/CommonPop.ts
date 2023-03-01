import BaseView from "../../base/view/BaseView"

const { ccclass } = cc._decorator

@ccclass
export default class CommonPop extends BaseView {

    start() {
        if (CC_EDITOR) {
            this.node._objFlags = cc.Object.Flags.DontSave
            this.$("node_title")._objFlags = cc.Object.Flags.DontSave
            this.$("label_title")._objFlags = cc.Object.Flags.DontSave
            this.$("btn_close")._objFlags = cc.Object.Flags.DontSave
        }
    }

    setTitle(title: string) {
        if (title.length == 0) {
            this.$("node_title").active = false
            return
        }

        this.$("node_title").active = true
        if (title.length < 4) {
            title = title.split("").join(" ")
        }
        this.$("label_title", cc.Label).string = title
    }

    setHeight(height: number) {
        this.node.height = height
    }

    setCloseShow(show: boolean) {
        this.$("btn_close").active = show
    }
}
