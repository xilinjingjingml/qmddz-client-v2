import { http } from "../../../base/http"
import { monitor } from "../../../base/monitor"
import { app } from "../../app"
import { ENV, PlatformType } from "../../config"
import { startFunc } from "../../startFunc"
import { urls } from "../../urls"
import { Platform } from "./platform"

export class WebBrowser extends Platform {
    querys: any = {}
    readonly thirdparty: string = "thirdparty/"

    init() {
        // 解析 window.location.search
        if (window.location.search.indexOf("?") != -1) {
            const pairs = window.location.search.substr(1).split("&")
            for (let i = 0; i < pairs.length; i++) {
                const splits = pairs[i].split("=")
                this.querys[splits[0]] = decodeURIComponent(splits[1])
            }

            app.datas.querys = this.querys
        }

        // env
        let value = { "o": ENV.OFFICIAL, "m": ENV.MIRROR, "t": ENV.TEST }[this.querys.env]
        if (value != null) {
            app.env = value
        }

        // pn
        value = this.querys.pn
        if (value != null) {
            app.pn = value
        }

        // platformType
        value = { "wx": PlatformType.WeChatMiniGame, "app": PlatformType.AppNative }[this.querys.platform]
        if (value != null) {
            app.platformType = value
        }
    }

    login() {
        const params = {
            pn: app.pn,
            imei: this.querys.imei,
            version: app.version,
            name: "Guest" + (this.querys.imei || "").substr(-4),
        }
        http.open(urls.USER_LOGIN, params, (err, res) => {
            if (err || !res || res.ret != 0) {
                monitor.emit("platform_login_fail")
                return
            }

            app.user.guid = parseInt(res.pid)
            app.user.ticket = res.ticket
            app.user.nickname = res.nickname
            app.user.face = res.face
            app.user.imei = res.imei
            app.user.sex = res.sex
            app.user.openId = res.openId

            app.datas.regtime = res.regtime || Math.floor(Date.now() / 1000)
            app.datas.stayDay = res.stayDay
            app.datas.ifBindWeixin = res.ifBindWeixin == 1
            app.datas.ifBindAliPay = res.ifBindAliPay == 1
            app.datas.bindPhone.hasBindMoble = res.isBindMobile
            app.datas.bindPhone.BindPhone = res.phonenumber || ""

            app.datas.first = res.first
            app.datas.morrow = res.first == 1 ? 0 : res.morrow

            monitor.emit("platform_login_success")
        })
    }

    sociaShare(data) {
        if (data && data.callback) {
            data.callback()
        }
    }

    preloadAdvert(data) {
        console.log("===preLoadAdvert", data)
    }

    openAdvert(data) {
        // app.user.switch_plugin = true   
        data.success && data.success(100)
    }

    copyToClipBoard(text: string) {
        const textarea = document.createElement("textarea")
        textarea.textContent = text
        document.body.appendChild(textarea)
        textarea.select()
        try {
            document.execCommand("copy")
            document.body.removeChild(textarea)
            startFunc.showToast("复制成功")
        } catch (e) {
            startFunc.showToast("复制失败")
        }
    }

    getVersionCode() {
        return app.version
    }

    callStaticMethod() {

    }
}
