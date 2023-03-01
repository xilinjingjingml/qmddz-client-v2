const { ccclass, disallowMultiple, menu, requireComponent } = cc._decorator

interface IItemInfo {
    item: cc.Node
    rect: cc.Rect
}
/**
 * 列表组件 仅创建显示区域内的节点
 * @example
 * node.getComponent(TableView).updateView(datas, item, updateItem)
 */
@ccclass
@disallowMultiple
@menu("component/TableView")
@requireComponent(cc.ScrollView)
export default class TableView<T> extends cc.Component {
    datas: T[]
    mode: (data: T, index: number) => cc.Node
    updateItem: (item: cc.Node, data: T, index: number) => void

    private itemPool: Record<string, cc.NodePool> = {}
    private itemInfo: Record<number, IItemInfo> = {}

    onDestroy() {
        for (const key in this.itemPool) {
            this.itemPool[key].clear()
        }
        this.itemInfo = {}
    }

    /**
     * 异步方法只有通过此方法来判断 item 是否有效
    */
    checkValid(index: number) {
        return this.itemInfo[index]?.item?.isValid == true
    }

    clear() {
        // 清除之前创建 item
        for (const key in this.itemInfo) {
            const info = this.itemInfo[key]
            if (info.item) {
                this.putItem(info.item)
            }
        }
        this.itemInfo = {}
    }

    updateView(datas: T[], mode: cc.Node | ((data: T, index: number) => cc.Node), updateItem: (item: cc.Node, data: T, index: number) => void, realTime: boolean = false) {
        // 检测 scrollView 是否有 content
        const scrollView = this.getComponent(cc.ScrollView)
        const content = scrollView.content
        if (content == null) {
            return
        }

        // 检测 content 是否有 layout
        const layout = content.getComponent(cc.Layout)
        if (layout == null) {
            return
        }

        scrollView.stopAutoScroll()
        layout.enabled = false
        content.targetOff(this) // 关闭监听滑动

        // 清除之前创建 item
        for (const key in this.itemInfo) {
            const info = this.itemInfo[key]
            if (info.item) {
                this.putItem(info.item)
            }
        }
        this.itemInfo = {}
        // 隐藏 content 已有 child
        content.children.forEach(child => child.active = false)

        if (datas.length == 0) {
            return
        }

        this.datas = datas
        this.mode = typeof mode == "function" ? mode : () => mode
        this.updateItem = updateItem

        // 预先设置
        let onScrollView: Function
        let createScrollView: Function
        if (layout.type == cc.Layout.Type.HORIZONTAL) {
            createScrollView = onScrollView = this.onHORIZONTAL
            content.anchorX = layout.horizontalDirection
            content.width = layout.paddingLeft + layout.paddingRight
        } else if (layout.type == cc.Layout.Type.VERTICAL) {
            createScrollView = onScrollView = this.onVERTICAL
            content.anchorY = layout.verticalDirection
            content.height = layout.paddingTop + layout.paddingBottom
        } else if (layout.type == cc.Layout.Type.GRID) {
            if (layout.type == cc.Layout.Type.GRID && layout.startAxis == cc.Layout.AxisDirection.HORIZONTAL) {
                createScrollView = onScrollView = this.onGRID_HORIZONTAL
                content.anchorY = layout.verticalDirection
                content.height = layout.paddingTop + layout.paddingBottom
            } else {
                createScrollView = onScrollView = this.onGRID_VERTICAL
                content.anchorX = layout.horizontalDirection
                content.width = layout.paddingLeft + layout.paddingRight
            }
        } else {
            return
        }

        if (!realTime) {
            onScrollView = this.onScrollView
        }

        // 更新
        createScrollView.call(this)
        createScrollView.call(this)

        // 开启监听滑动
        content.on(cc.Node.EventType.POSITION_CHANGED, onScrollView, this)
    }

    // 通用滚动
    onScrollView() {
        const content = this.getComponent(cc.ScrollView).content
        const view = content.parent // 含 cc.Mask 组件的父节点
        // content 坐标系下的 view rect
        const viewRect = cc.rect(-content.x + -view.width * view.anchorX, -content.y + -view.height * view.anchorY, view.width, view.height)

        for (let i = 0; i < this.datas.length; i++) {
            let info = this.itemInfo[i]
            if (viewRect.intersects(info.rect)) {
                if (info.item == null) {
                    info.item = this.getItem(i)
                    this.updateInfoPos(info)
                    info.item.parent = content
                    this.updateItem(info.item, this.datas[i], i)
                }
            } else {
                if (info.item) {
                    this.putItem(info.item)
                    info.item = null
                }
            }
        }
    }

    onHORIZONTAL() {
        const content = this.getComponent(cc.ScrollView).content
        const view = content.parent // 含 cc.Mask 组件的父节点
        // content 坐标系下的 view rect
        const viewRect = cc.rect(-content.x + -view.width * view.anchorX, -content.y + -view.height * view.anchorY, view.width, view.height)

        const layout = content.getComponent(cc.Layout)
        for (let i = 0; i < this.datas.length; i++) {
            let info = this.itemInfo[i]
            if (info == null) {
                if (i == 0) {
                    const size = this.getMode(i)
                    info = { item: null, rect: cc.rect(0, -size.height / 2, size.width, size.height) }
                    info.rect.x += layout.horizontalDirection ? -(layout.paddingRight + size.width) : layout.paddingLeft

                    content.width += info.rect.width
                } else {
                    info = { item: null, rect: this.itemInfo[i - 1].rect.clone() }
                    info.rect.x += layout.horizontalDirection ? -(layout.spacingX + info.rect.width) : (layout.spacingX + info.rect.width)

                    content.width += layout.spacingX + info.rect.width
                }

                this.itemInfo[i] = info
            }

            if (viewRect.intersects(info.rect)) {
                if (info.item == null) {
                    info.item = this.getItem(i)
                    this.updateInfoPos(info)
                    info.item.parent = content
                    this.updateItem(info.item, this.datas[i], i)
                }

                let diss = info.item.width - info.rect.width
                if (diss != 0) {
                    content.width += diss

                    this.setRect(info.rect, info.rect.x, -info.item.height / 2, info.item.width, info.item.height)
                    if (layout.horizontalDirection) {
                        diss *= -1
                        info.rect.x += diss
                    }
                    info.item.x += diss / 2
                    this.addPos(i + 1, "x", diss)
                }
            } else {
                if (info.item) {
                    this.putItem(info.item)
                    info.item = null
                }
            }
        }
    }

    onVERTICAL() {
        const content = this.getComponent(cc.ScrollView).content
        const view = content.parent // 含 cc.Mask 组件的父节点
        // content 坐标系下的 view rect
        const viewRect = cc.rect(-content.x + -view.width * view.anchorX, -content.y + -view.height * view.anchorY, view.width, view.height)

        const layout = content.getComponent(cc.Layout)
        for (let i = 0; i < this.datas.length; i++) {
            let info = this.itemInfo[i]
            if (info == null) {
                if (i == 0) {
                    const size = this.getMode(i)
                    info = { item: null, rect: cc.rect(-size.width / 2, 0, size.width, size.height) }
                    info.rect.y += layout.verticalDirection ? -(layout.paddingTop + size.height) : layout.paddingBottom

                    content.height += info.rect.height
                } else {
                    info = { item: null, rect: this.itemInfo[i - 1].rect.clone() }
                    info.rect.y += layout.verticalDirection ? -(layout.spacingY + info.rect.height) : (layout.spacingY + info.rect.height)

                    content.height += layout.spacingY + info.rect.height
                }

                this.itemInfo[i] = info
            }

            if (viewRect.intersects(info.rect)) {
                if (info.item == null) {
                    info.item = this.getItem(i)
                    this.updateInfoPos(info)
                    info.item.parent = content
                    this.updateItem(info.item, this.datas[i], i)
                }

                let diss = info.item.height - info.rect.height
                if (diss != 0) {
                    content.height += diss

                    this.setRect(info.rect, -info.item.width / 2, info.rect.y, info.item.width, info.item.height)
                    if (layout.verticalDirection) {
                        diss *= -1
                        info.rect.y += diss
                    }
                    info.item.y += diss / 2
                    this.addPos(i + 1, "y", diss)
                }
            } else {
                if (info.item) {
                    this.putItem(info.item)
                    info.item = null
                }
            }
        }
    }

    onGRID_HORIZONTAL() {
        const content = this.getComponent(cc.ScrollView).content
        const view = content.parent // 含 cc.Mask 组件的父节点
        // content 坐标系下的 view rect
        const viewRect = cc.rect(-content.x + -view.width * view.anchorX, -content.y + -view.height * view.anchorY, view.width, view.height)

        const layout = content.getComponent(cc.Layout)

        const ratio = cc.v2(layout.horizontalDirection ? -1 : 1, layout.verticalDirection ? -1 : 1)
        const startPos = cc.v2(layout.horizontalDirection ? (content.width / 2 - layout.paddingRight) : (-content.width / 2 + layout.paddingLeft), layout.verticalDirection ? -layout.paddingTop : layout.paddingBottom)
        const endPos = content.width / 2 - (layout.horizontalDirection ? layout.paddingLeft : layout.paddingRight)
        const pos = cc.Vec2.ZERO
        const table = cc.Vec2.ZERO
        const posTemp = cc.Vec2.ZERO
        const tableTemp = cc.Vec2.ZERO
        let infos: IItemInfo[] = []
        let infosTemp: IItemInfo[] = []

        const newline = () => {
            // 计算之前infos坐标
            const maxInfo = infosTemp.reduce((info1, info2) => (info1.item || info1.rect).height > (info2.item || info2.rect).height ? info1 : info2)
            const max = (maxInfo.item || maxInfo.rect).height
            infosTemp.forEach(info => info.rect.height = max)
            if (layout.verticalDirection) {
                infosTemp.forEach(info => info.rect.y = (posTemp.y - max))
            }
            infosTemp.forEach(info => info.item && this.updateInfoPos(info))
            infosTemp.length = 0

            // 换行
            this.setPos(tableTemp, 0, tableTemp.y + 1)
            this.setPos(posTemp, startPos.x, posTemp.y + (max + layout.spacingY) * ratio.y)
        }

        const backup = () => {
            this.syncPos(tableTemp, table)
            this.syncPos(posTemp, pos)
            infosTemp = infos.slice()
        }

        const restore = () => {
            infos = infosTemp.slice()
            this.syncPos(table, tableTemp)
            this.syncPos(pos, posTemp)
        }

        const calcPos_ = (info: IItemInfo) => {
            if ((posTemp.x * ratio.x + info.rect.width) <= endPos) {
                this.syncPos(info.rect, posTemp)
                if (layout.horizontalDirection) {
                    info.rect.x += -info.rect.width
                }
                if (layout.verticalDirection) {
                    info.rect.y += -info.rect.height
                }
                return
            }

            if (tableTemp.x == 0) {
                this.setPos(info.rect, -info.rect.width / 2, posTemp.y)
                if (layout.verticalDirection) {
                    info.rect.y += -info.rect.height
                }
                return
            }

            newline()

            // 重新计算
            calcPos_(info)
        }

        const calcPos = (info: IItemInfo) => {
            backup()

            calcPos_(info)

            tableTemp.x += 1
            posTemp.x += (info.rect.width + layout.spacingX) * ratio.x

            infosTemp.push(info)
        }

        this.syncPos(pos, startPos)
        this.syncPos(table, cc.Vec2.ZERO)
        for (let i = 0; i < this.datas.length; i++) {
            let info = this.itemInfo[i]
            if (info == null) {
                const size = i == 0 ? this.getMode(i) : this.itemInfo[i - 1].rect
                this.itemInfo[i] = info = { item: null, rect: cc.rect(0, 0, size.width, size.height) }
            }

            calcPos(info)

            if (viewRect.intersects(info.rect)) {
                if (info.item == null) {
                    info.item = this.getItem(i)
                    info.item.parent = content
                    this.updateItem(info.item, this.datas[i], i)
                }

                if (info.item.width != info.rect.width || info.item.height > info.rect.height) {
                    this.setSize(info.rect, info.item)
                    calcPos(info)
                }

                this.updateInfoPos(info)
            } else {
                if (info.item) {
                    this.putItem(info.item)
                    info.item = null
                }
            }

            restore()
        }

        backup()
        newline()
        const firstInfo = this.itemInfo[0]
        const lastInfo = this.itemInfo[this.datas.length - 1]
        if (layout.verticalDirection) {
            content.height = firstInfo.rect.y + firstInfo.rect.height - lastInfo.rect.y + layout.paddingTop + layout.paddingBottom
        } else {
            content.height = lastInfo.rect.y + lastInfo.rect.height - firstInfo.rect.y + layout.paddingTop + layout.paddingBottom
        }
    }

    onGRID_VERTICAL() {
        const content = this.getComponent(cc.ScrollView).content
        const view = content.parent // 含 cc.Mask 组件的父节点
        // content 坐标系下的 view rect
        const viewRect = cc.rect(-content.x + -view.width * view.anchorX, -content.y + -view.height * view.anchorY, view.width, view.height)

        const layout = content.getComponent(cc.Layout)

        const ratio = cc.v2(layout.horizontalDirection ? -1 : 1, layout.verticalDirection ? -1 : 1)
        const startPos = cc.v2(layout.horizontalDirection ? -layout.paddingRight : layout.paddingLeft, layout.verticalDirection ? (content.height / 2 - layout.paddingTop) : (-content.height / 2 + layout.paddingBottom))
        const endPos = content.height / 2 - (layout.verticalDirection ? layout.paddingTop : layout.paddingBottom)
        const pos = cc.Vec2.ZERO
        const table = cc.Vec2.ZERO
        const posTemp = cc.Vec2.ZERO
        const tableTemp = cc.Vec2.ZERO
        let infos: IItemInfo[] = []
        let infosTemp: IItemInfo[] = []

        const newline = () => {
            // 计算之前infos坐标
            const maxInfo = infosTemp.reduce((info1, info2) => (info1.item || info1.rect).width > (info2.item || info2.rect).width ? info1 : info2)
            const max = (maxInfo.item || maxInfo.rect).width
            infosTemp.forEach(info => info.rect.width = max)
            if (layout.horizontalDirection) {
                infosTemp.forEach(info => info.rect.x = (posTemp.x - max))
            }
            infosTemp.forEach(info => info.item && this.updateInfoPos(info))
            infosTemp.length = 0

            // 换行
            this.setPos(tableTemp, tableTemp.x + 1, 0)
            this.setPos(posTemp, posTemp.x + (max + layout.spacingX) * ratio.x, startPos.y)
        }

        const backup = () => {
            this.syncPos(tableTemp, table)
            this.syncPos(posTemp, pos)
            infosTemp = infos.slice()
        }

        const restore = () => {
            infos = infosTemp.slice()
            this.syncPos(table, tableTemp)
            this.syncPos(pos, posTemp)
        }

        const calcPos_ = (info: IItemInfo) => {
            if ((posTemp.y * ratio.y + info.rect.height) <= endPos) {
                this.syncPos(info.rect, posTemp)
                if (layout.horizontalDirection) {
                    info.rect.x += -info.rect.width
                }
                if (layout.verticalDirection) {
                    info.rect.y += -info.rect.height
                }
                return
            }

            if (tableTemp.y == 0) {
                this.setPos(info.rect, posTemp.x, -info.rect.height / 2)
                if (layout.horizontalDirection) {
                    info.rect.x += -info.rect.width
                }
                return
            }

            newline()

            // 重新计算
            calcPos_(info)
        }

        const calcPos = (info: IItemInfo) => {
            backup()

            calcPos_(info)

            tableTemp.y += 1
            posTemp.y += (info.rect.height + layout.spacingY) * ratio.y

            infosTemp.push(info)
        }

        this.syncPos(pos, startPos)
        this.syncPos(table, cc.Vec2.ZERO)
        for (let i = 0; i < this.datas.length; i++) {
            let info = this.itemInfo[i]
            if (info == null) {
                const size = i == 0 ? this.getMode(i) : this.itemInfo[i - 1].rect
                this.itemInfo[i] = info = { item: null, rect: cc.rect(0, 0, size.width, size.height) }
            }

            calcPos(info)

            if (viewRect.intersects(info.rect)) {
                if (info.item == null) {
                    info.item = this.getItem(i)
                    info.item.parent = content
                    this.updateItem(info.item, this.datas[i], i)
                }

                if (info.item.height != info.rect.height || info.item.width > info.rect.width) {
                    this.setSize(info.rect, info.item)
                    calcPos(info)
                }

                this.updateInfoPos(info)
            } else {
                if (info.item) {
                    this.putItem(info.item)
                    info.item = null
                }
            }

            restore()
        }

        backup()
        newline()
        const firstInfo = this.itemInfo[0]
        const lastInfo = this.itemInfo[this.datas.length - 1]
        if (layout.horizontalDirection) {
            content.width = firstInfo.rect.x + firstInfo.rect.width - lastInfo.rect.x + layout.paddingLeft + layout.paddingRight
        } else {
            content.width = lastInfo.rect.x + lastInfo.rect.width - firstInfo.rect.x + layout.paddingLeft + layout.paddingRight
        }
    }

    getItem(index: number) {
        const mode = this.getMode(index)
        const pool = this.itemPool[mode.name]
        let item = pool && pool.get()
        if (item == null) {
            item = cc.instantiate(mode)
        }
        item.active = true
        item.zIndex = index
        return item
    }

    getMode(index: number) {
        return this.mode(this.datas[index], index)
    }

    putItem(item: cc.Node) {
        let pool = this.itemPool[item.name]
        if (pool == null) {
            pool = this.itemPool[item.name] = new cc.NodePool()
        }
        pool.put(item)
    }

    setRect(rect: cc.Rect, x: number, y: number, width: number, height: number) {
        rect.x = x
        rect.y = y
        rect.width = width
        rect.height = height
    }

    setSize(v: { width: number, height: number }, v2: { width: number, height: number }) {
        v.width = v2.width
        v.height = v2.height
    }

    setPos(v2: { x?: number, y?: number }, x: number, y: number) {
        v2.x = x
        v2.y = y
    }

    syncPos(v: { x: number, y: number }, v2: { x: number, y: number }) {
        v.x = v2.x
        v.y = v2.y
    }

    addPos(index: number, key: string, value: number) {
        for (let i = index; i < this.datas.length; i++) {
            const info = this.itemInfo[i]
            if (info == null) {
                break
            }

            info.rect[key] += value
            if (info.item) {
                info.item[key] += value / 2
            }
        }
    }

    updateInfoPos(info: IItemInfo) {
        this.setPos(info.item, info.rect.x + info.rect.width * info.item.anchorX, info.rect.y + info.rect.height * info.item.anchorY)
    }
}
