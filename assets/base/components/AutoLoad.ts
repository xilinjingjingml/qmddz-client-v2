import { monitor } from "../monitor"
import BaseView from "../view/BaseView"

const { ccclass, property, menu } = cc._decorator

/**
 * 自动加载资源组件
 */
@ccclass
@menu("component/AutoLoad")
export default class AutoLoad extends cc.Component {

    @property()
    must: boolean = false

    @property()
    bundle: string = ""

    @property()
    _uuid: string = ""

    _prefab: cc.Prefab = null

    params: any

    eventId: number

    onLoad() {
        if (this.eventId == null) {
            this.eventId = monitor.pause()
        }
    }

    onEnable() {
        if (this._uuid.length === 0 || this._prefab) {
            return
        }

        cc.assetManager.loadAny({ bundle: this.bundle, uuid: this._uuid }, (err: Error, prefab: cc.Prefab) => {
            if (err) {
                cc.error("[AutoLoad]", this._uuid, err)
                this.release()
                return
            }

            if (!this.isValid) {
                this.release()
                return
            }

            monitor.emit("AutoLoad_loadComplete")

            prefab.addRef()
            this._prefab = prefab

            const node = cc.instantiate(prefab)

            // 子AutoLoad也会继续缓存消息
            node.getComponentsInChildren(AutoLoad).forEach(comp => comp.eventId = monitor.pauseById(this.eventId))

            // eventId
            const comps = node.getComponentsInChildren(BaseView)
            comps.forEach(comp => comp.eventId = monitor.pauseById(this.eventId))
            this.release()

            // params
            if (this.params != null) {
                comps.forEach(comp => comp.params = this.params)
            }

            node.parent = this.node
        })
    }

    release() {
        if (this.eventId != null) {
            monitor.resume(this.eventId)
            this.eventId = null
        }
    }

    onDestroy() {
        this.release()
        this._prefab?.decRef()
    }
}
