import { audio } from "../../base/audio"
import { NodeExtends } from "../../base/extends/NodeExtends"
import { listen, monitor } from "../../base/monitor"
import { storage } from "../../base/storage"
import BaseView from "../../base/view/BaseView"
import { ViewManager } from "../../base/view/ViewManager"
import { report } from "../../report"
import { app } from "../app"
import { AppNative, EPluginType, IAppSessionInfo } from "../scripts/platforms/AppNative"
import { WebBrowser } from "../scripts/platforms/WebBrowser"
import { startFunc } from "../startFunc"

const { ccclass } = cc._decorator

@ccclass
export default class login extends BaseView {
    platform: AppNative
    tempSessionType: string

    start() {
        // report("登录", "界面显示")
        if (cc.sys.isBrowser) {
            app.platformApp = this.platform = new AppNative()
            this.platform.init()
            // monitor.once("platform_init", this.initLoginButtons, this)
        } else {
            this.platform = app.platform as AppNative
            // this.initLoginButtons()
        }

        this.showLoginButtons(false)

        // 上次自动登录
        const lastLoginType = storage.get("login_type")
        if (lastLoginType) {
            console.log("=====lastLoginType ", lastLoginType)
            this.login(lastLoginType)
            return
        }

        // 游客自动登录
        const SessionName = "SessionGuest"
        if (storage.get("auto_login") != false && app.getOnlineParam("auto_login_guest", false) && this.platform.hasPluginByName(SessionName)) {
            console.log("=====auto_login ", "SessionGuest")
            this.login(SessionName)
            return
        }

        storage.remove("auto_login")
        // 手动选择登录
        this.showLoginButtons(true)

        this.$("jiazaidonghua").active = false
    }

    // initLoginButtons() {
    //     const button: cc.Node = this.$("btn_login")
    //     button.active = false
    //     for (const plugin of this.platform.plugins) {
    //         if (plugin.type != EPluginType.kPluginSession.toString()) {
    //             continue
    //         }

    //         if (!this.checkLoginSession(plugin.name)) {
    //             continue
    //         }

    //         cc.log("[LoginLayer.initLoginButtons] add plugin", plugin.name)
    //         const node = cc.instantiate(button)
    //         node.active = true
    //         node.parent = this.$("node_btns")
    //         node.getComponent(cc.Button).clickEvents[0].customEventData = plugin.name
    //         this.setSpriteLocal({
    //             node: node,
    //             bundle: app.bundule,
    //             path: this.platform.thirdparty + plugin.name,
    //             delay: true,
    //         })
    //     }
    // }

    checkLoginSession(name: string) {
        const showname = "show" + name.substring(7)
        const value = app.getOnlineParam(showname)
        if (value != null) {
            return value == 1
        }

        return true
    }

    showLoginButtons(active: boolean) {
        this.$("node_btns").active = active
        this.$("node_loading").active = !active
        this.unscheduleAllCallbacks()
        if (!active) {
            this.scheduleOnce(() => {
                startFunc.showToast("登陆超时")
                this.showLoginButtons(true)
            }, 20)
        }
    }

    onPressLogin(event: cc.Event.EventTouch, data: string) {
        audio.playMenuEffect()
        NodeExtends.cdTouch(event)
        this.login(data)
    }

    onPressWeixin() {
        audio.playMenuEffect()
        if (!this.checkPact()) {
            return
        }
        this.login("SessionWeiXin")
        report("登录", "微信登录")
    }

    onPressFast() {
        audio.playMenuEffect()
        if (!this.checkPact()) {
            return
        }
        this.login("SessionGuest")
        report("登录", "快速登录")
    }

    checkPact() {
        let check = this.$("node_btns/check_pact", cc.Toggle).isChecked
        if (!check) {
            startFunc.showToast("请勾选同意下方的协议后即可进入游戏！")
            // report("登录", "提示勾选协议")
            return false
        }

        return true
    }

    login(data: string) {
        this.tempSessionType = data
        this.showLoginButtons(false)

        if (cc.sys.isBrowser) {
            app.platform.login()
            return
        }

        this.platform.login({ sessionType: data, callback: this.onLoginResult.bind(this) })
    }

    onLoginResult(data: IAppSessionInfo) {
        this.unscheduleAllCallbacks()
        if (data.SessionResultCode == 0) {
            const res = data.sessionInfo
            app.user.guid = Number(res.pid)
            app.user.ticket = res.ticket
            app.user.nickname = res.nickname
            app.user.face = res.face
            app.user.imei = res.imei
            app.user.sex = Number(res.sex)
            app.user.openId = res.openId ?? ""

            app.datas.regtime = Number(res.regtime) || Math.floor(Date.now() / 1000)
            app.datas.stayDay = Number(res.stayDay)
            app.datas.ifBindWeixin = Number(res.ifBindWeixin) == 1
            app.datas.ifBindAliPay = Number(res.ifBindAliPay) == 1
            app.datas.bindPhone.hasBindMoble = Number(res.isBindMobile)
            app.datas.bindPhone.BindPhone = res.phonenumber || ""

            app.datas.first = Number(res.first)
            app.datas.morrow = app.datas.first == 1 ? 0 : Number(res.morrow)
            app.datas.kuaishou_callback = res.callback

            cc.sys.localStorage.setItem("guid", app.user.guid)

            this.platform.startPush()
            if (app.datas.first == 1) {
                // this.platform.uploadKuaiShou(1)
                if (cc.sys.isNative) {
                    (app.platform as AppNative).uploadKuaiShou(1)
                }
            } else if (app.datas.morrow == 1) {
                if (!storage.get("kuaishou_second_stay")) {
                    storage.set("kuaishou_second_stay", true)
                    if (cc.sys.isNative) {
                        (app.platform as AppNative).uploadKuaiShou(7)
                    }
                }
            }
            cc.sys.localStorage.setItem("newbiew", app.datas.first === 1)
            monitor.emit("platform_login_success")
            report("登录", "登录成功")
        } else {
            this.showLoginButtons(true)

            let msg = "登陆失败"
            if (data.sessionInfo && data.sessionInfo.tips && data.sessionInfo.tips.length > 0) {
                msg = data.sessionInfo.tips
            } else if (data.msg && data.msg.length > 0) {
                msg = data.msg
            }
            startFunc.showToast(msg)
            storage.remove("login_type")

            report("登录", "登录失败", msg)
        }
    }

    @listen("platform_login_success")
    platform_login_success() {
        storage.set("login_type", this.tempSessionType)
    }

    onPressProtocol(event: cc.Event.EventTouch, type) {
        audio.playMenuEffect()

        if (cc.WebView) {
            ViewManager.showPopup({ bundle: "lobby", path: "setting/webview", params: { url: type === "0" ? app.protocol0_url : app.protocol1_url, title: type === "0" ? "用户协议" : "隐私协议" } })
        } else {
            ViewManager.showPopup({ bundle: "lobby", path: type === "0" ? "setting/protocol0" : "setting/protocol1" })
        }
    }
}
