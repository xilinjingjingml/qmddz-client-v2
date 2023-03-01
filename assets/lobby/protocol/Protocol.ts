import BasePop from "../../base/view/BasePop"
import { app } from "../../start/app"
import { AppNative } from "../../start/scripts/platforms/AppNative"

const { ccclass } = cc._decorator

@ccclass
export default class Protocol extends BasePop {

    params: { type: number }

    start() {
        this.$("label_title", cc.Label).string = this.params.type == 0 ? "用户协议" : "隐私条款"

        const agreement = { bundle: "lobby", path: "protocol/agreement/", total: 16 }
        const privacy = { bundle: "lobby", path: "protocol/privacy/", total: 11 }

        const data = this.params.type == 0 ? agreement : privacy
        const bundle = cc.assetManager.getBundle(data.bundle)
        if (!bundle) {
            return
        }

        let current = 1

        this.schedule(() => {
            const idx = current++
            const params: ILoadAsset = {
                bundle: data.bundle,
                path: data.path + idx,
                callback: (asset: cc.SpriteFrame) => {
                    const node = new cc.Node()
                    const sp = node.addComponent(cc.Sprite)
                    sp.spriteFrame = asset
                    node.scale = 0.75

                    this.addContent(node, idx)
                }
            }

            if (cc.sys.isNative) {
                const path = (app.platform as AppNative).thirdparty + params.path + ".png"
                if (jsb.fileUtils.isFileExist(path)) {
                    params.bundle = null
                    params.path = path
                }
            }

            this.load(params)
        }, 0, data.total - 1)
    }

    addContent(node: cc.Node, index: number) {
        this.$("content").addChild(node, index)
    }
}