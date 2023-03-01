interface IEvent {
    callback: Function
    target?: any
    once?: boolean
}

/**
 * 事件分发器
 */
export namespace monitor {
    const eventList: Record<string, IEvent[]> = {}

    let cacheId = 0
    const cacheIds = new Map<number, number>()
    const cacheEvents: { time: number, name: string, args: any[] }[] = []

    /**
     * 注册事件
     * @example
     * monitor.on(name, this.callback, this)
     */
    export function on(name: string, callback: Function, target?: any, clean: boolean = true) {
        const events = eventList[name]
        if (events) {
            // 防止重复注册
            if (clean && callback) {
                off(name, callback, target)
                on(name, callback, target, false)
                return
            }
            events.push({ target: target, callback: callback })
        } else {
            eventList[name] = [{ target: target, callback: callback }]
        }
    }

    /**
     * 注册事件
     * @example
     * monitor.once(name, this.callback, this)
     */
    export function once(name: string, callback: Function, target?: any, clean: boolean = true) {
        const events = eventList[name]
        if (events) {
            // 防止重复注册
            if (clean && callback) {
                off(name, callback, target)
                once(name, callback, target, false)
                return
            }
            events.push({ target: target, callback: callback, once: true })
        } else {
            eventList[name] = [{ target: target, callback: callback, once: true }]
        }
    }

    /**
     * 取消注册事件
     * @example
     * monitor.off(name, this.callback)
     */
    export function off(name: string, callback?: Function, target?: any) {
        const events = eventList[name]
        if (events === undefined) {
            return
        }

        if (callback === undefined) {
            delete eventList[name]
            return
        }

        for (let i = events.length - 1; i >= 0; i--) {
            const event = events[i]
            if (event.callback === callback && (target === undefined || event.target === target)) {
                events.splice(i, 1)
            }
        }
        if (events.length === 0) {
            delete eventList[name]
        }
    }

    /**
     * 批量注册事件
     * @example
     * EventEmitter.onTarget(this)
     */
    export function onTarget(target: any) {
        listenMap.forEach((listens, t) => {
            if (target instanceof t.constructor) {
                listens.forEach(listen => on(listen.name, target[listen.method], target))
            }
        })
    }

    /**
     * 取消对象注册事件
     * @example
     * monitor.offTarget(this)
     */
    export function offTarget(target: any) {
        for (const name in eventList) {
            const events = eventList[name]
            for (let i = events.length - 1; i >= 0; i--) {
                if (events[i].target === target) {
                    events.splice(i, 1)
                }
            }

            if (events.length === 0) {
                delete eventList[name]
            }
        }
    }

    /**
     * 是否有注册事件
     * @example
     * monitor.has(name)
     * // or
     * monitor.has(name, this.callback)
     */
    export function has(name: string, callback?: Function) {
        const events = eventList[name]
        if (events === undefined) {
            return false
        }

        if (callback === undefined) {
            return events.length > 0
        }

        return events.some(event => event.callback === callback)
    }

    /**
     * 发射事件
     * @example
     * monitor.emit(name, xxx)
     */
    export function emit<T>(name: string, message: T): void
    export function emit(name: string, ...args: any[]): void
    export function emit(name: string, ...args: any[]) {
        if (cacheIds.size > 0) {
            cacheEvents.push({ time: Date.now(), name: name, args: args })
        }

        const events = eventList[name]
        if (events === undefined) {
            return
        }

        for (let i = 0; i < events.length; i++) {
            const event = events[i]
            if (event.once) {
                events.splice(i, 1)
                i--
            }

            call(event, ...args)
        }
    }

    /**
     * 发射事件给target
     */
    export function emitTo(target: any, name: string, ...args: any[]) {
        const events = eventList[name]
        if (events === undefined) {
            return
        }

        for (let i = 0; i < events.length; i++) {
            const event = events[i]
            if (event.target !== target) {
                continue
            }

            if (event.once) {
                events.splice(i, 1)
                i--
            }

            call(event, ...args)
        }
    }

    function call(event: IEvent, ...args: any[]) {
        // 自己测试使用
        if (cc.sys.isBrowser) {
            event.callback.apply(event.target, args)
            return
        }

        try {
            event.callback.apply(event.target, args)
        } catch (err) {
            cc.error("[monitor.emit]", err)
        }
    }

    export function pauseById(eventId: number) {
        let time = cacheIds.get(eventId)
        if (time === undefined) {
            cc.warn("[monitor.resume] not find cacheId", eventId)
            return
        }

        return pause(time)
    }

    export function pause(t?: number) {
        const id = cacheId++
        cacheIds.set(id, t ?? Date.now())
        return id
    }

    export function resume(id: number, target?: any) {
        let time = cacheIds.get(id)
        if (time === undefined) {
            cc.warn("[monitor.resume] not find cacheId", id)
            return
        }

        cacheIds.delete(id)

        // 发送暂存消息
        if (target) {
            cacheEvents.forEach(event => event.time > time && emitTo.apply(monitor, [target, event.name].concat(event.args)))
        }

        // 清除过期缓存消息
        if (cacheIds.size === 0) {
            cacheEvents.length = 0
        } else {
            time = cacheIds.values().next().value
            cacheIds.forEach(t => time > t && (time = t))

            for (let i = 0; i < cacheEvents.length; i++) {
                if (cacheEvents[i].time >= time) {
                    cacheEvents.splice(0, i)
                    break
                }
            }
        }
    }
}

const listenMap = new Map<any, { name: string, method: string }[]>()
export function listen(name: string) {
    return function (t: any, method: string) {
        let listens = listenMap.get(t)
        if (!listens) {
            listens = []
            listenMap.set(t, listens)
        }

        listens.push({ name: name, method: method })
    }
}
