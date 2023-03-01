import { ComponentExtend } from "../../extends/ComponentExtend"
import { monitor } from "../../monitor"
import AutoLoad from "../AutoLoad"

const { ccclass, property, executeInEditMode } = cc._decorator

/**
 * 自动加载资源组件
 */
@ccclass
@executeInEditMode
class AutoLoadEditor extends AutoLoad {

    @property({ type: cc.Prefab, serializable: false })
    _prefab: cc.Prefab = null

    @property({ type: cc.Prefab })
    get prefab(): cc.Prefab {
        return this._prefab
    }
    set prefab(prefab: cc.Prefab) {
        this._prefab = prefab
        this._uuid = prefab._uuid

        if (prefab) {
            JSON.parse(cc.sys.localStorage.getItem("AutoLoad_show_state")) && this.add()
        } else {
            this.remove()
        }
    }

    child: cc.Node

    start() {
        this.load(JSON.parse(cc.sys.localStorage.getItem("AutoLoad_show_state")))
    }

    onEnable() {
        monitor.on("show", this.show, this)
        monitor.on("sync", this.sync, this)
        monitor.on("reload", this.reload, this)
    }

    onDisable() {
        monitor.offTarget(this)
    }

    load(add: boolean) {
        if (this._uuid.length === 0) {
            return
        }

        cc.assetManager.loadAny({ bundle: this.bundle, uuid: this._uuid }, (err: Error, prefab: cc.Prefab) => {
            if (err) {
                cc.error("[DynamicLoadEditor]", this._uuid, err)
                return
            }

            if (!this.isValid) {
                return
            }

            this._prefab = prefab

            add && this.add()
        })
    }

    show(show: boolean) {
        if (!this._prefab) {
            return
        }

        this.remove()
        show && this.load(show)
    }

    sync(uuid: string) {
        if (!(this.child && this.child.isValid)) {
            return
        }

        const child = this.getChildByUuid(this.node, uuid)
        if (!child) {
            return
        }

        cc.log("sync", uuid)
        this.setFlags(false)

        Editor.Ipc.sendToPanel("scene", "scene:apply-prefab", this.child.uuid)

        // 保存操作是异步的
        cc.director.once(cc.Director.EVENT_BEFORE_UPDATE, () => this.setFlags(true))
    }

    add() {
        if (this._prefab && !(this.child && this.child.isValid)) {
            const node = cc.instantiate(this._prefab)
            node.parent = this.node
            this.child = node
            this.setFlags(true)
        }
    }

    remove() {
        if (this.child && this.child.isValid) {
            this.child.destroy()
        }
        this.child = null
    }

    reload() {
        if (this.child && this.child.isValid) {
            this.child.removeFromParent()
        }
        this.child = null
    }

    setFlags(add: boolean) {
        if (add) {
            this.child._objFlags |= cc.Object.Flags.DontSave | cc.Object.Flags.LockedInEditor
        } else {
            this.child._objFlags ^= cc.Object.Flags.DontSave | cc.Object.Flags.LockedInEditor
        }
    }

    getChildByUuid(node: cc.Node, uuid: string): cc.Node {
        const child = node.getChildByUuid(uuid)
        if (child) {
            return child
        }

        node.children.forEach(child => {
            if (!child.getComponent(AutoLoad)) {
                return this.getChildByUuid(child, uuid)
            }
        })
    }
}

if (CC_EDITOR) {
    ComponentExtend.replace(AutoLoad, AutoLoadEditor)

    const onKeyUp = function (event: KeyboardEvent) {
        if (!event.repeat && !event.shiftKey && !event.ctrlKey && event.altKey) {
            if (event.code == "KeyA") {
                cc.log("key show")
                let show = JSON.parse(cc.sys.localStorage.getItem("AutoLoad_show_state"))
                cc.sys.localStorage.setItem("AutoLoad_show_state", !show)
                monitor.emit("show", !show)
            } else if (event.code == "KeyS") {
                cc.log("key sync")
                const uuid = Editor.Selection.curActivate("node")
                uuid && monitor.emit("sync", uuid)
            }
        }
    }

    const onSoftReload = function () {
        window.removeEventListener(cc.SystemEvent.EventType.KEY_UP, onKeyUp)
        require("electron").ipcRenderer.off("scene:soft-reload", onSoftReload)
        require("electron").ipcRenderer.off("scene:enter-prefab-edit-mode", onEnterPrefab)

        monitor.emit("reload", false)
    }

    const onEnterPrefab = function () {
        cc.sys.localStorage.setItem("AutoLoad_show_state", false)
    }

    window.addEventListener(cc.SystemEvent.EventType.KEY_UP, onKeyUp)
    require("electron").ipcRenderer.on("scene:soft-reload", onSoftReload)
    require("electron").ipcRenderer.on("scene:enter-prefab-edit-mode", onEnterPrefab)
}
