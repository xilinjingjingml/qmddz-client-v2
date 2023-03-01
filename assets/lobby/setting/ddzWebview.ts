import { audio } from "../../base/audio";
import BasePop from "../../base/view/BasePop";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ddzWebview extends BasePop {
    params: { url: string, title: string }

    @property(cc.WebView)
    view: cc.WebView = null

    start() {        
        let height = (this.node.height - cc.sys.getSafeAreaRect().height) / 2
        this.$("top").height = height + 100
        this.$("content").position = cc.v3(0, this.node.height / 2 - height - 100)
        this.$("content").height = this.node.height - height - 100
        this.$("content/view").height = this.$("content").height / 2 - height * 2
        this.view.url = this.params.url
        this.$("top/title", cc.Label).string = this.params.title
    }

    onWebviewFinish() {

    }

    onWebViewClose(target, url) {
        if (url.indexOf("cocos://") >= 0) {
            this.close()
        }
    }

    onPressClose() {
        audio.playMenuEffect()
        this.close()
    }
}
