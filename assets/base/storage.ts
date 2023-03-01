import { crypt } from "./crypt"
import { time } from "./time"

/**
 * 本地存储
 */
export namespace storage {
    /**
     * 保存
     */
    export function set(key: string, value: any, useCrypt: boolean = true) {
        if (typeof value == null) {
            remove(key)
            return
        }

        value = JSON.stringify(value)
        cc.sys.localStorage.setItem(key, useCrypt ? crypt.encrypt(value) : value)
    }

    /**
     * 取出
     */
    export function get(key: string, useCrypt: boolean = true) {
        const value = cc.sys.localStorage.getItem(key)
        if (!value) {
            return
        }

        return JSON.parse(useCrypt ? crypt.decrypt(value) : value)
    }

    /**
     * 移除
     */
    export function remove(key: string) {
        cc.sys.localStorage.removeItem(key)
    }

    /**
     * 清除所有
     */
    export function clear() {
        cc.sys.localStorage.clear()
    }

    /**
     * 保存今日数据
     */
    export function setToday(key: string, value: any) {
        set(key, { time: Date.now(), data: value })
    }

    /**
     * 取出今日数据
     */
    export function getToday(name: string) {
        const value: { time: number, data: any } = get(name)
        if (value) {
            const t = time.zero().getTime()
            if (value.time >= t && value.time < (t + 24 * 60 * 60 * 1000)) {
                return value.data
            }
        }
    }
}
