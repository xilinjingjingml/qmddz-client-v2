/**
 * 组件生命周期
 * constructor 导入代码会执行一次
 * constructor new
 * __preload
 * onLoad
 * onEnable
 * start
 * [------- 循环 整数循环 不会中断
 * EVENT_BEFORE_UPDATE (第一次不会执行)
 * update
 * lateUpdate
 * EVENT_AFTER_UPDATE
 * EVENT_BEFORE_DRAW
 * EVENT_AFTER_DRAW
 * -------]
 * onDisable
 * EVENT_BEFORE_UPDATE
 * EVENT_AFTER_UPDATE
 * _onPreDestroy => onDestroy  中执行此方法 可以重写子类自己控制顺序
 */

import { NodeExtends } from "../extends/NodeExtends"
import { monitor } from "../monitor"
import { utils } from "../utils"

const { ccclass } = cc._decorator

export interface IBaseViewOption {
    closeCallback?: Function,
    [key: string]: any
}

/**
 * View组件基类
 */
@ccclass
export default class BaseView extends cc.Component {
    private _$: Record<string, cc.Node>
    private assets: cc.Asset[] = []

    /**
     * 传入的参数
     */
    params: IBaseViewOption = {}

    eventId: number

    __preload() {
        cc.director.once(cc.Director.EVENT_AFTER_UPDATE, this._onTarget, this)
    }

    _onTarget() {
        if (!this.isValid) {
            return
        }
        monitor.onTarget(this)
        if (this.eventId != null) {
            const eventId = this.eventId
            delete this.eventId
            monitor.resume(eventId, this)
        }
    }

    onEnable() { }

    _onPreDestroy() {
        monitor.offTarget(this)
        if (this.eventId != null) {
            monitor.resume(this.eventId)
        }

        super._onPreDestroy()

        this.assets.forEach(asset => asset.decRef())
        this.assets.length = 0
    }

    /**
     * 获取子节点或组件
     */
    protected $(name: string): cc.Node
    protected $<T extends cc.Component>(name: string, type: { prototype: T }): T
    protected $<T extends cc.Component>(name: string, type?: { prototype: T }) {
        if (!this._$) {
            this._$ = utils.mark(this.node)
        }
        const item = this._$[name] || cc.find(name, this.node) || new cc.Node()
        if (item && type) {
            return item.getComponent(type) || {}
        }

        return item
    }

    /**
     * 当前界面导入资源
     */
    protected load<T extends cc.Asset>(params: ILoadAsset) {
        const callback = params.callback
        params.callback = (asset: T) => {
            if (!this.isValid) {
                return
            }

            if (asset instanceof cc.Texture2D) {
                asset = new cc.SpriteFrame(asset) as any
            }

            this._addRef(asset)
            callback?.(asset)
        }
        utils.load(params)
    }

    /**
     * 设置精灵
     */
    protected setSprite(params: ILoadSprite) {
        params.load = this.load.bind(this)
        NodeExtends.setSprite(params)
    }

    /**
     * 设置精灵
     */
    protected setSpriteLocal(params: ILoadSprite) {
        if (CC_JSB) {
            const path = params.path + (params.options?.ext ?? ".png")
            if (jsb.fileUtils.isFileExist(path)) {
                params.bundle = null
                params.path = path
            } else if (params.bundle == null) {
                return
            }
        }
        this.setSprite(params)
    }

    protected _addRef(asset: cc.Asset) {
        if (!this.isValid) {
            return
        }

        asset.addRef()
        this.assets.push(asset)
    }
}
