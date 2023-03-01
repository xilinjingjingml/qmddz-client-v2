import { http } from "../http"
import { NodeExtends } from "./NodeExtends"

/**
 * 用户操作合集
 */
export namespace UserExtends {
    let _url: string = ""
    const _infos: { [uid: string]: IUserInfo } = {}

    export function setUrl(url: string) {
        _url = url
    }

    /**
     * 获取用户信息 不保证顺序
     */
    export function getUserInfos(uids: (number | string)[], callback: (infos: IUserInfo[]) => void) {
        const infos: IUserInfo[] = []

        const remainUids = []
        uids.forEach(uid => {
            const info = _infos[uid]
            if (info) {
                infos.push(info)
                return
            }

            remainUids.push(uid)
        })

        if (remainUids.length == 0) {
            callback(infos)
            return
        }

        http.open(_url, { uids: remainUids.toString() }, (err: Error, res: { list: IUserInfo[] }) => {
            if (err || res == null || res.list == null) {
                return
            }

            if (Array.isArray(res.list)) {
                res.list.forEach(info => _infos[info.uid] = info)
            } else {
                res.list = []
            }

            callback(infos.concat(res.list))
        })
    }

    /**
     * 设置用户头像
     */
    export function setUserFace(params: Omit<ILoadSprite, "path"> & { uid: number }) {
        const info = _infos[params.uid]
        if (info) {
            NodeExtends.setSprite(Object.assign({ path: info.face }, params))
            return
        }

        getUserInfos([params.uid], (infos: IUserInfo[]) => { infos.length > 0 && setUserFace(params) })
    }
}
