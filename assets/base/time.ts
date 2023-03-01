/**
 * 时间方法合集
 */
export namespace time {
    /**
     * 格式化
     */
    export function format(fmt: string, t?: number | Date) {
        let date: Date
        if (typeof t === "number") {
            date = new Date(t * 1000)
        } else if (t) {
            date = t
        } else {
            date = new Date()
        }
        var o = {
            "M+": date.getMonth() + 1,                   //月份   
            "d+": date.getDate(),                        //日   
            "h+": date.getHours(),                       //小时   
            "m+": date.getMinutes(),                     //分   
            "s+": date.getSeconds(),                     //秒   
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
            "S": date.getMilliseconds()                  //毫秒   
        }
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))
        }
        for (const k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
            }
        }
        return fmt
    }

    /**
     * 时间戳
     */
    export function timestamp(date?: Date) {
        return Math.floor((date ? date.getTime() : Date.now()) / 1000)
    }

    /**
     * 0点
     */
    export function zero() {
        const date = new Date()
        date.setHours(0, 0, 0, 0)
        return date
    }

    const configs: { name: keyof Date, length?: number, offset?: number }[] = [
        { name: "setFullYear", length: 4 },
        { name: "setMonth", offset: -1 },
        { name: "setDate", },
        { name: "setHours", },
        { name: "setMinutes", },
        { name: "setSeconds", },
        { name: "setMilliseconds", length: 3 },
    ]
    /**
     * yyyymmdd转时间戳
     */
    export function toTimeStamp(time: string) {
        const date = new Date()
        for (const config of configs) {
            const length = config.length ?? 2
            if (time.length < length) {
                date[config.name](0)
                continue
            }

            date[config.name](Number(time.substr(0, length)) + (config.offset ?? 0))
            time = time.substr(length)
        }
        return date
    }
}
