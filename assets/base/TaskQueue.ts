/**
 * 任务队列
 */
export default class TaskQueue {
    private handles: { callback: Function, target: any }[]
    private node: cc.Node

    constructor(node: cc.Node) {
        this.node = node
        this.handles = []
    }

    add(callback: Function, target?: any) {
        this.handles.push({ callback: callback, target: target })
    }

    remove(callback: Function, target?: any) {
        for (let i = this.handles.length - 1; i >= 0; i--) {
            const handle = this.handles[i]
            if (handle.callback !== callback) {
                continue
            }

            if (target && handle.target !== target) {
                continue
            }

            this.handles.splice(i, 1)
            break
        }
    }

    clear() {
        this.handles.length = 0
    }

    /**
     * 运行任务队列第一个任务
     */
    run() {
        if (this.handles.length <= 0) {
            return
        }

        if (!this.node.isValid) {
            return
        }

        try {
            this.handles[0].callback.call(this.handles[0].target, this.next.bind(this))
        } catch (err) {
            cc.error("[TaskQueue.run]", err)
            this.next()
        }
    }

    /**
     * 运行任务队列下一个任务
     */
    next() {
        if (this.handles.length > 0) {
            this.handles.shift()
        }
        this.run()
    }
}
