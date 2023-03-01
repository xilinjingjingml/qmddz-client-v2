import { monitor } from "../monitor"
import BaseView from "./BaseView"
import RootPopup, { IRootPopupOption } from "./RootPopup"

enum EViewType {
    scene,
    layer,
    popup
}

interface IView {
    id: number
    name: string
    node: cc.Node
    type: EViewType
}

type IViewOption = Omit<IRootPopupOption, "prefab" | "eventId"> & { bundle?: string, path: string, multiple?: boolean, parent?: cc.Node, zIndex?: number }

/**
 * 界面管理器
 */
export namespace ViewManager {
    // 顺序界面
    const views: IView[] = []

    // 根预制
    let rootPrefab: cc.Prefab

    /**
     * 打开场景
     */
    export async function showScene(params: IViewOption & { showTransition?: boolean }) {
        if (checkMultiple(params)) {
            cc.warn("[ViewManager.showScene] had same name view", params.path)
            return
        }

        params.showTransition != false && cc.game.emit("main_active", true)

        cc.log("[ViewManager.showScene] start", params.path)
        const view = createView(params, EViewType.scene)
        try {
            const bundle = await loadBundle(params, view)
            const sceneAsset = await load<cc.SceneAsset>(onComplete => bundle.loadScene(params.path, onComplete), view.id)
            await load(onComplete => cc.director.runSceneImmediate(sceneAsset, undefined, onComplete), view.id)
        } catch (error) {
            cc.error("[ViewManager.showScene]", params.path, error)
            cc.game.emit("main_active", false)
            return
        }
        cc.log("[ViewManager.showScene] end", params.path)

        views.length = 0

        const node = cc.Canvas.instance.node

        // eventId
        const comps = node.getComponentsInChildren(BaseView)
        comps.forEach(comp => comp.eventId = monitor.pauseById(view.id))
        monitor.resume(view.id)

        // params
        if (params.params != null) {
            comps.forEach(comp => comp.params = params.params)
        }

        cc.game.emit("main_active", false)
    }

    /**
     * 打开界面
     */
    export function showLayer(params: IViewOption) {
        showView(params, EViewType.layer, (view: IView) => {
            for (let i = views.length - 1; i >= 0; i--) {
                const v = views[i]
                if (v.id != view.id) {
                    views.splice(i, 1)
                    v.node && destroy(v.node)
                }
            }
        })
    }

    /**
     * 打开弹窗
     */
    export function showPopup(params: IViewOption) {
        showView(params, EViewType.popup)
    }

    async function showView(params: IViewOption, type: EViewType, onLaunched?: (view: IView) => void) {
        if (checkMultiple(params)) {
            cc.warn("[ViewManager.showView] had same name view", params.path)
            return
        }

        cc.log("[ViewManager.showView] start", params.path)
        const view = createView(params, type)
        let prefab: cc.Prefab
        try {
            const bundle = await loadBundle(params, view)
            prefab = await load(onComplete => bundle.load(params.path, onComplete), view.id)
            if (rootPrefab == null) {
                const params = { bundle: "start", path: "prefabs/root" }
                const bundle = await loadBundle(params, view)
                rootPrefab = await load(onComplete => bundle.load(params.path, onComplete), view.id)
            }
        } catch (error) {
            cc.error("[ViewManager.showView]", params.path, error)
            return
        }

        cc.log("[ViewManager.showView] end", params.path)
        const node = cc.instantiate(rootPrefab)
        view.node = node
        node.getComponent(RootPopup).params = Object.assign({ prefab: prefab, eventId: view.id }, params)
        node.parent = params.parent || cc.Canvas.instance.node
        node.zIndex = params.zIndex || 0

        onLaunched?.(view)
    }

    async function loadBundle(params: { bundle?: string, path?: string }, view: IView) {
        return cc.assetManager.getBundle(params.bundle) || await load(onComplete => cc.assetManager.loadBundle(params.bundle, onComplete), view.id)
    }

    function load<T>(callback: (onComplete: (err: Error, asset: T) => void) => void, eventId: number) {
        return new Promise<T>((resolve, reject) => callback((err: Error, asset: T) => {
            if (err) {
                removeView(v => v.id == eventId)
                monitor.resume(eventId)
                return reject(err)
            }

            if (!views.some(v => v.id == eventId)) {
                monitor.resume(eventId)
                return reject("view not find")
            }

            resolve(asset)
        }))
    }

    function checkMultiple(params: IViewOption) {
        return !params.multiple && exist(getBaseName(params.path))
    }

    function getBaseName(path: string) {
        return path.split("/").pop()
    }

    function createView(params: IViewOption, type: EViewType) {
        // 删除之前正在加载的layer
        type < EViewType.popup && removeView(v => v.type == type)

        const view: IView = { id: monitor.pause(), name: getBaseName(params.path), node: null, type: type }
        views.push(view)
        return view
    }

    function removeView(check: (view: IView) => boolean, callback?: (view: IView) => void) {
        for (let i = views.length - 1; i >= 0; i--) {
            const v = views[i]
            if (check(v)) {
                views.splice(i, 1)
                callback?.(v)
                break
            }
        }
    }

    /**
    * 存在View
    */
    export function exist(name: string) {
        return views.some(v => v.name == name)
    }

    /**
     * 关闭View
     */
    export function close(name: string) {
        removeView(v => v.name == name, v => v.node && destroy(v.node))
    }

    /**
     * 关闭View
     */
    export function closeByNode(node: cc.Node) {
        removeView(v => v.node == node, v => v.node && destroy(v.node))
    }

    function destroy(node: cc.Node) {
        const comp = node.getComponent(RootPopup)
        if (comp.params.closeTween) {
            comp.params.closeTween
                .target(comp.child)
                .call(() => {
                    delete comp.params.closeTween
                    destroy(node)
                })
                .start()
            return
        }

        node.destroy()
        comp.child.getComponent(BaseView)?.params.closeCallback?.()
    }
}
