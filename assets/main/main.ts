const { ccclass } = cc._decorator

@ccclass
export default class main extends cc.Component {
    nodePersist: cc.Node

    onLoad() {
        this.report("首场景加载")
        const frameSize = cc.view.getFrameSize()
        const canvas = cc.Canvas.instance
        const wideScreen = frameSize.width / frameSize.height > canvas.designResolution.width / canvas.designResolution.height
        canvas.fitHeight = wideScreen
        canvas.fitWidth = !wideScreen

        cc.game.once("persist_node", (node: cc.Node) => this.nodePersist = node, this)
    }

    start() {
        cc.log("[main.start]")
        this.loadBundles(["base", "start"])

        if (cc.sys.isNative) {
            // log
            const format = (args: any[]) => args.forEach((arg, i) => arg && typeof arg === "object" && (args[i] = JSON.stringify(arg)))
            cc.log = (...args) => { format(args); console.log.apply(console, args) }
            cc.warn = (...args) => { format(args); console.warn.apply(console, args) }
            cc.error = (...args) => { format(args); console.error.apply(console, args) }

            // 关闭屏保
            cc.director.once(cc.Director.EVENT_AFTER_DRAW, () => {
                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    jsb.reflection.callStaticMethod("com/izhangxin/utils/luaj", "hideSplash", "()V")
                } else if (cc.sys.os == cc.sys.OS_IOS) {
                    jsb.reflection.callStaticMethod("LuaObjc", "hideSplash")
                }
            })
        }
    }

    loadBundles(bundles: string[]) {
        this.report("bundle加载")
        const bundle = bundles.shift()
        cc.log("[main.loadBundles]", bundle)
        cc.assetManager.loadBundle(bundle, (err: Error, bundle: cc.AssetManager.Bundle) => {
            if (err) {
                cc.error("[main.loadBundle]", bundle, err)
                return
            }

            this.report("bundle:" + bundle + "加载成功")

            if (bundles.length == 0) {
                cc.game.emit("game_start", this.nodePersist)
            } else {
                this.loadBundles(bundles)
            }
        })
    }

    report(str) {
        let wx = window["wx"]
        if (wx && wx.aldSendEvent) {
            wx.aldSendEvent(str)
        }
    }

}
