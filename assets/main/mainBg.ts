const { ccclass } = cc._decorator

@ccclass
export default class mainBg extends cc.Component {
    private assets: cc.Asset[] = []

    start() {
        const node = cc.find("bg", this.node)
        node.scale = Math.max(cc.winSize.width / node.width, cc.winSize.height / node.height)

        // loading转圈
        // cc.tween(cc.find("node_loading/loading_bg", this.node)).by(1, { angle: -360 }).repeatForever().start()

        if (CC_JSB) {
            // logo
            this.setSpriteLocal({ node: cc.find("logo", this.node), path: "logo", delay: true })
            // slogan
            this.setSpriteLocal({ node: cc.find("logo/slogan", this.node), path: "slogan", delay: true })
            // 文网文
            this.setSpriteLocal({ node: cc.find("wenzi_bg/wenzi", this.node), path: "wenzi", delay: true })
        }
    }

    setSpriteLocal(params: { node: cc.Node, path: string, options?: Record<string, any>, dirpath?: string, delay?: boolean }) {
        if (params.node == null || !params.node.isValid || !params.path) {
            return
        }

        params.path = (params.dirpath ?? "thirdparty/") + params.path + (params.options?.ext ?? ".png")
        if (!jsb.fileUtils.isFileExist(params.path)) {
            return
        }

        if (params.delay) {
            params.node.active = false
        }
        cc.assetManager.loadRemote(params.path, params.options, (err: Error, asset: cc.Texture2D | cc.SpriteFrame) => {
            if (err) {
                cc.error("[mainBg.load]", params.path, err)
                return
            }

            if (!params.node.isValid) {
                return
            }

            const spriteFrame = asset instanceof cc.Texture2D ? new cc.SpriteFrame(asset) : asset
            spriteFrame.addRef()
            this.assets.push(spriteFrame)
            params.node.getComponent(cc.Sprite).spriteFrame = spriteFrame

            if (params.delay) {
                params.node.active = true
            }
        })
    }

    onDestroy() {
        this.assets.forEach(asset => asset.decRef())
        this.assets.length = 0
    }
}
