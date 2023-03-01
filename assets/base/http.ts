interface IHttpReq {
    url: string | { host: number, url: string }
    query?: { [key: string]: any }
    method?: "GET" | "POST"
    queryType?: "formdata"
    propertys?: any
    callback?: (err: Error, res: any) => void
}

interface IHttpOption {
    url: string
    query?: { [key: string]: any }
    method?: "GET" | "POST"
    queryType?: "formdata"
    propertys?: any
    callback?: (err: Error, res: any) => void
}

/**
 * Http网络请求
 */
export namespace http {
    let _host: Record<number, string> = {}

    export function setHost(host: typeof _host) {
        _host = host
    }

    /**
     * 打开链接
     */
    export function open(url: string | { host: number, url: string }, query?: { [key: string]: any }, callback?: (err: Error, res: any) => void)
    export function open(url: IHttpReq)
    export function open(url: string | { host: number, url: string } | IHttpReq, query?: { [key: string]: any }, callback?: (err: Error, res: any) => void) {
        let params = url as any
        params = params.query == null ? { url: url, query: query, callback: callback } : url
        if (typeof params.url !== "string") {
            params.url = _host[params.url.host] + params.url.url
        }

        params.url = params.url.replace("http://", "https://")

        const xhr = new XMLHttpRequest()

        const option: IHttpOption = params
        if (option.propertys) {
            for (const key in option.propertys) {
                xhr[key] = option.propertys[key]
            }
        }

        if (option.propertys == null || option.propertys.timeout == null) {
            xhr.timeout = 20 * 1000
        }

        if (option.callback) {
            xhr.onabort = () => {
                cc.error("[http.onabort]", option.url)
                option.callback(new Error("onabort"), null)
            }
            xhr.onerror = () => {
                cc.error("[http.onerror]", option.url)
                option.callback(new Error("onerror"), null)
            }
            xhr.ontimeout = () => {
                cc.warn("[http.ontimeout]", option.url)
                option.callback(new Error("ontimeout"), null)
            }
            xhr.onload = () => {
                cc.log("[http.onload]", option.url)
                if (xhr.status == 200) {
                    let content: any
                    if (xhr.responseType == "" || xhr.responseType == "text") {
                        content = xhr.responseText
                        if (typeof xhr.responseText == "string") {
                            try {
                                const data = JSON.parse(xhr.responseText)
                                if (typeof data == "object" && data) {
                                    content = data
                                }
                            } catch (error) {

                            }
                        }
                    } else {
                        content = xhr.response
                    }
                    option.callback(null, content)
                } else {
                    option.callback(new Error("wrong status:" + xhr.status), null)
                }
            }
        }

        let body: string | null = null
        if (option.query) {
            if (option.method == "POST") {
                const querys = []
                for (const key in option.query) {
                    querys.push(key + "=" + encodeURIComponent(option.query[key]))
                }
                if (querys.length > 0) {
                    body = querys.join("&")
                }
            } else {
                const querys = []
                for (const key in option.query) {
                    querys.push(key + "=" + encodeURIComponent(option.query[key]))
                }
                if (querys.length > 0) {
                    option.url += "?"
                    option.url += querys.join("&")
                }
            }
        }

        xhr.open(option.method || "GET", option.url, true)
        if (option.method == "POST" && option.queryType == "formdata") {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        xhr.send(body)
    }
}
