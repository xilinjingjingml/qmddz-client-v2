import { http } from "./http"

/**
 * 通用方法合集
 */
export namespace utils {
    /**
     * 标记节点
     */
    export function mark(node: cc.Node): any {
        const obj = {}
        for (const child of node.children) {
            if (!(child.name in obj)) {
                obj[child.name] = child
            }
            _mark(obj, child)
        }

        return obj
    }

    function _mark(obj: any, node: cc.Node) {
        for (const child of node.children) {
            if (!(child.name in obj)) {
                obj[child.name] = child
            }
            _mark(obj, child)
        }
    }

    /**
     * 获取子节点或组件
     */
    export function $(_$: any, name: string): cc.Node
    export function $<T extends cc.Component>(_$: any, name: string, type: { prototype: T }): T
    export function $<T extends cc.Component>(_$: any, name: string, type?: { prototype: T }) {
        const node = _$[name]
        return node && type ? node.getComponent(type) : node
    }

    // 比较字符串版本
    export function versionCompare(versionA: string, versionB: string) {
        const vA = versionA.split(".")
        const vB = versionB.split(".")
        for (let i = 0; i < vA.length; ++i) {
            const a = parseInt(vA[i])
            const b = parseInt(vB[i] || "0")
            if (a === b) {
                continue
            } else {
                return a - b
            }
        }
        if (vB.length > vA.length) {
            return -1
        } else {
            return 0
        }
    }

    export function substr(str: string, length: number) {
        if (str.length == 0) {
            return str
        }

        length *= 2
        let l = 0
        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 255) {
                l++
                length -= 2
            } else {
                l++
                length -= 1
            }
            if (length <= 0) {
                break
            }
        }
        return str.substr(0, l)
    }

    export function safeJSON(json: any, stringify?: boolean) {
        try {
            return stringify ? JSON.stringify(json) : JSON.parse(json)
        } catch (e) {
            return null
        }
    }

    // 加载 load
    export async function load<T extends cc.Asset>(params: ILoadAsset) {
        if (params.bundle == null) {
            if (params.path.startsWith("http")) {
                params.path = params.path.replace("http://", "https://")
            }

            try {
                const asset = await _load<T>(onComplete => cc.assetManager.loadRemote(params.path, params.options, onComplete))
                params.callback?.(asset)
            } catch (error) {
                cc.error("[utils.load]", params.path, error)
            }
            return
        }

        try {
            const bundle = cc.assetManager.getBundle(params.bundle) || await _load(onComplete => cc.assetManager.loadBundle(params.bundle, params.options, onComplete))
            const asset = await _load<T>(onComplete => bundle.load(params.path, onComplete))
            params.callback?.(asset)
        } catch (error) {
            cc.error("[utils.load]", params.path, error)
        }
    }

    function _load<T>(callback: (onComplete: (err: Error, asset: T) => void) => void) {
        return new Promise<T>((resolve, reject) => callback((err: Error, asset: T) => {
            if (err) {
                return reject(err)
            }

            resolve(asset)
        }))
    }

    export function loadHttpImage(url: string, callback: (spriteFrame: cc.SpriteFrame, path: string) => void) {
        if (!CC_JSB) {
            return
        }

        const path = jsb.fileUtils.getWritablePath() + md5(url) + ".png"
        const onComplete = () => utils.load({ path: url, callback: (texture: cc.Texture2D) => callback(new cc.SpriteFrame(texture), path) })

        if (jsb.fileUtils.isFileExist(path)) {
            onComplete()
            return
        }

        http.open({
            url: url,
            query: {},
            propertys: { responseType: "arraybuffer" },
            callback: (err: Error, res: any) => {
                if (res) {
                    if (jsb.fileUtils.writeDataToFile(new Uint8Array(res), path)) {
                        onComplete()
                    }
                }
            }
        })
    }
}
