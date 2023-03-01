/**
 * 操作node的方法合集
 */
export namespace NodeExtends {
    /**
     * 设置图片纹理
     */
    export function setSprite(params: ILoadSprite) {
        if (params.node == null || !params.node.isValid || !params.path) {
            return
        }

        if (params.delay) {
            params.node.active = false
        }

        params.load({
            bundle: params.bundle,
            path: params.path,
            options: params.options ?? { ext: ".png" },
            callback: (spriteFrame: cc.SpriteFrame) => {
                if (!params.node.isValid) {
                    return
                }

                const lastSize = cc.size(params.node.width, params.node.height)

                params.node.getComponent(cc.Sprite).spriteFrame = spriteFrame

                if (params.delay) {
                    params.node.active = true
                }

                if (params.adjustSize) {
                    let size: cc.Size
                    if (typeof params.adjustSize === "boolean") {
                        size = lastSize
                    } else if (params.adjustSize instanceof cc.Size) {
                        size = params.adjustSize
                    } else {
                        size = params.adjustSize.getContentSize()
                    }
                    params.node.scale = Math.min(size.width / params.node.width, size.height / params.node.height)
                }

                params.callback?.()
            }
        })
    }

    // 立即刷新label 重置label长度
    export function updateLabel(label: cc.Label) {
        label._forceUpdateRenderData()
    }

    /**
     * 立即刷新widget
     */
    export function updateWidget(node: cc.Node) {
        cc._widgetManager.refreshWidgetOnResized(node)
    }

    /**
     * 按钮点击后延时后可以继续点击
     * @example
     * NodeExtends.cdTouch(event, 0.5)
     */
    export function cdTouch(event: cc.Event.EventTouch, t: number = 0.5) {
        cdComponent(event.getCurrentTarget().getComponent(cc.Button), t)
    }

    export function cdComponent(comp: cc.Component & { interactable: boolean }, t: number = 0.5) {
        comp.interactable = false
        comp.scheduleOnce(() => { comp.interactable = true }, t)
    }

    /**
     * node先隐藏 延时显示
     * @example
     * NodeExtends.delayShow(this, node, 3)
     */
    export function delayShow(target: cc.Component, node: cc.Node, t: number = 3) {
        node.active = false
        target.scheduleOnce(() => node.active = true, t)
    }
}
