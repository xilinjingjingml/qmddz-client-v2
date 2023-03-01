import { http } from "../base/http"
import { monitor } from "../base/monitor"
import { ViewManager } from "../base/view/ViewManager"
import { app } from "./app"
import { IConfirm } from "./confirm/confirm"

export namespace startFunc {
    export function showToast(message: string) {
        ViewManager.showPopup({
            bundle: app.bundule,
            path: "toast/toast",
            params: { message: message },
            multiple: true,
            mask: { show: false },
            block: { show: false },
        })
    }

    export function showConfirm(parmes: IConfirm) {
        ViewManager.showPopup({
            bundle: app.bundule,
            path: "confirm/confirm",
            params: parmes,
            parent: app.nodePersist?.active && app.nodePersist,
            multiple: true,
            openTween: cc.tween().set({ scale: 0.4 }).to(0.25, { scale: 1 }, { easing: "sineInOut" })
        })
    }

    export function showUpdate() {        
        ViewManager.showScene({ bundle: app.bundule, path: "update/update" })
    }

    export function showLogin() {
        ViewManager.showScene({ bundle: app.bundule, path: "login/login" })
    }

    export function showLobby() {
        ViewManager.showScene({ bundle: "lobby", path: "lobby", multiple: true })
    }

    // 检测网络
    export function checkNetwork(parmes: { callback: Function, must?: boolean, content?: string, confirmText?: string }) {
        if (parmes.must || cc.sys.getNetworkType() == cc.sys.NetworkType.NONE) {
            const confirmParmes: IConfirm = {
                title: "温馨提示",
                content: parmes.content || "您的设备没有网络了",
                showClose: false,
                confirmText: parmes.confirmText || "尝试连接",
                confirmFunc: () => {
                    parmes.must = false
                    checkNetwork(parmes)
                },
                cancelText: "解决方案",
                cancelFunc: () => {
                    confirmParmes.buttonNum = 1
                    confirmParmes.autoSize = true
                    confirmParmes.contentAlignment = cc.macro.TextAlignment.LEFT
                    if (cc.sys.os == cc.sys.OS_IOS) {
                        confirmParmes.content = "建议您按照以下方法进行检查 \n\n1.打开手机的设置，检查WIFI或蜂窝移动网络是否开启。\n2.将联网方式（WiFi和移动蜂窝数据）切换一下再试。\n3.打开手机设置，滑动查看页面底部，寻找到该游戏后点击，检查移动蜂窝数据的选项是否开启\n4.如果仍无法连接，请您稍后再试。"
                    } else {
                        confirmParmes.content = "建议您按照以下方法进行检查\n\n1.打开手机的设置，检查WLAN或移动数据是否开启。\n2.将联网方式（WLAN和移动数据）切换一下再试。\n3.如果仍无法连接，请您稍后再试。"
                    }
                    showConfirm(confirmParmes)
                },
            }
            cc.log("[checkNetwork] showConfirm")
            showConfirm(confirmParmes)
            return
        }

        parmes.callback()
    }

    export function getIPLocation() {
        http.open("https://restapi.amap.com/v3/ip?key=0113a13c88697dcea6a445584d535837", {}, (err, res: IIPLocation) => {
            if (res && res.status == "1") {
                app.datas.IPLocation = res
                monitor.emit("IPLocation_update", res)
            }
        })
    }
}
