import { UserExtends } from "../base/extends/UserExtends"
import { http } from "../base/http"
import { monitor } from "../base/monitor"
import { storage } from "../base/storage"
import { utils } from "../base/utils"
import { report } from "../report"
import { ads } from "./ads"
import { ENV, GAME, PlatformType } from "./config"
import { AppNative } from "./scripts/platforms/AppNative"
import { Platform } from "./scripts/platforms/platform"
import { WebBrowser } from "./scripts/platforms/WebBrowser"
import { WeChatMiniGame } from "./scripts/platforms/WeChatMiniGame"
import { User } from "./scripts/user"
import { startFunc } from "./startFunc"
import { checkUpdatate } from "./update/update"
import { hosts, urls } from "./urls"

/**
 * 集合所有特殊数据和方法
 */
class App {
    private _env: ENV // 当前环境
    pn = "com.union.hbddz.ad.kuaishou" // 当前渠道cn
    gameId = 1243 // 当前gameId
    wxAppID = "wx3ea29d364a8ddd09" // 微信小程序APPID
    bundule: string = "start"
    version: string
    sVersion: string
    platform: Platform // 当前平台
    platformApp: AppNative
    platformType: PlatformType // 当前平台
    user: User
    versionupdate: IVersionUpdate
    sharedData: ISharedData
    servers = new Map<number, IServerData[]>()
    gameList = [GAME.DDZ]
    runGameServer: IServerData // 正在/要运行的ServerData
    shopBoxs: IShopBox[] = []
    datas: IDatas = {}
    private onlineParam: IOnlineParam = {}
    nodePersist: cc.Node

    protocol0_url = "https://game.izhangxin.com/Apk/zxddz_yhxy.html"
    protocol1_url = "https://game.izhangxin.com/Apk/zxddz_ysxy.html"

    service_url = "https://www.yingyuchat.com/chatIndex?kefu_id=WY1234&ent_id=2928&lang=cn"

    _pluginFlagTimeout = null

    constructor() {
        this.env = storage.get("ENV") ?? ENV.OFFICIAL
        this.sVersion = "2.2.0.51"
        this.version = this.sVersion
        this.user = new User()
        this.datas.role = { roundSum: 0 }
        this.datas.bindPhone = { hasBindMoble: 0, BindPhone: "" }

        if (cc.sys.isBrowser) {
            this.platform = new WebBrowser()
        } else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this.platform = new WeChatMiniGame()
        } else if (cc.sys.isNative) {
            this.platform = new AppNative()
        }

        cc.game.once("game_start", this.game_start, this)
    }

    set env(e: ENV) {
        this._env = e
        http.setHost(hosts[e])
        UserExtends.setUrl(hosts[e][urls.USERBATCH.host] + urls.USERBATCH.url)
    }
    get env() {
        return this._env
    }

    private game_start(node: cc.Node) {
        this.nodePersist = node
        // report("App", "检查网络")
        startFunc.checkNetwork({ callback: this.loadConfig.bind(this) })
    }

    private loadConfig() {
        report("拉取在线参数", "开始")
        this.platform.init()

        const localCfg = storage.get("loadingConfig")

        http.open(urls.LOADING_CONFIGS, {
            pn: this.pn,
            fwversion: 20000000,///14042902,
            gtype: "mainF33",
            sgtype: "f33",
            sign: md5("pn=" + this.pn + "&key=qwer123321zxcv"),
            md5: localCfg?.md5 || "",
            uid: "",
            imei: "",
            level: "",
            gameNums: 0,
            loginSecret: md5("pn=" + this.pn + "&uid=&imei=&level=&gameNums=0-Jimbo3"),
            buildCode: 1,
            appConfigGame: this.gameId,
            appcode: 1
        }, (err: Error, res: any) => {
            if (res && res.ret == 0) {
                report("拉取在线参数", "完成")
                if (localCfg?.versionupdate && res.ip && res.port) {
                    if (localCfg.versionupdate.ip != res.ip || localCfg.versionupdate.port != res.port) {
                        localCfg.versionupdate.ip = res.ip
                        localCfg.versionupdate.port = res.port
                    }
                }
            }

            if (!res || typeof res == "string" || res.ret == 0) {
                if (!localCfg) {
                    report("拉取在线参数", "失败", (err || "config数据错误"))
                    cc.error("LodingConfig:" + (err || "config数据错误"))
                    return
                }
                res = localCfg
            } else {
                storage.set("loadingConfig", res)
            }

            // 版本更新
            this.versionupdate = res.versionupdate

            // 商品
            for (const k in res) {
                const r = /box_(\d)/.exec(k)
                if (r) {
                    const cfg = utils.safeJSON(res[k])
                    if (cfg && cfg.sl) {
                        for (const box of cfg.sl) {
                            box.boxType = Number(r[1])
                            this.shopBoxs.push(box)
                        }
                    }
                }
            }

            // 在线参数
            if (res.onlineparam && typeof res.onlineparam == "object") {
                this.onlineParam = res.onlineparam
            }

            // 分享
            const sharedData = JSON.parse(res.sharedData)
            if (sharedData.ret == 0) {
                this.sharedData = sharedData.sharedData[0]
                // sharedData.sdContent = Object_values(JSON.parse(sharedData.sdContent))
            }

            this.login()
        })
    }

    login() {
        monitor.once("platform_login_success", this.platform_login_success, this)
        monitor.once("platform_login_fail", this.platform_login_fail, this)

        // if (cc.sys.isNative || (cc.sys.isBrowser && this.platformType == PlatformType.AppNative)) {
        if (checkUpdatate()) {
            startFunc.showUpdate()
        } else {
            startFunc.showLogin()
        }
        // return
        // }
        // this.platform.login()
    }

    private platform_login_success() {
        ads.loadAdConfig()
        startFunc.getIPLocation()
        startFunc.showLobby()
    }

    private platform_login_fail(message: string) {
        startFunc.showConfirm({
            title: "登录失败",
            showClose: false,
            content: message || "登录失败",
            confirmText: "再次登录",
            confirmFunc: () => this.login(),
            buttonNum: 1,
        })
    }

    getOnlineParam(name: string, def?: any) {
        let value: any
        if (cc.sys.isNative) {
            value = this.onlineParam[name + (this.platform as AppNative)?.getVersionCode()]
        }
        if (value == null) {
            value = this.onlineParam[name]
        }
        if (value == null) {
            return def
        }

        if (value.ab != null) {
            return app.user.guid % value.ab == 0
        }
        if (value.rand != null) {
            return value.rand > Math.floor(Math.random() * 100)
        }
        if (value.uid != null) {
            return app.user.guid == value.uid
        }

        return value
    }

    switchPlugin() {
        this.user.switch_plugin = true
        if (this._pluginFlagTimeout) {
            clearTimeout(this._pluginFlagTimeout)
            this._pluginFlagTimeout = null
        }

        this._pluginFlagTimeout = setTimeout(() => {
            this.user.switch_plugin = false
        }, 100);
    }
}

export const app = new App()


let _interAdTimeout = null
cc.game.on(cc.game.EVENT_SHOW, () => {
    console.log("==foreground==", app.user.switch_plugin)
    report("游戏操作", "切换至前台")

    monitor.emit("show_foreground")

    // if (_interAdTimeout) {
    //     clearTimeout(_interAdTimeout)
    //     _interAdTimeout = null
    // }

    // _interAdTimeout = setTimeout(() => {
    //     if (!app.user.switch_plugin) {
    //         ads.openInter()
    //     }
    // }, 50);
    // if (!app.user.switch_plugin) {
    //     ads.openInter()
    // }

});

cc.game.on(cc.game.EVENT_HIDE, () => {
    // ads.openInter()
    console.log("==background==", app.user.switch_plugin)
    report("游戏操作", "切换至后台")

    monitor.emit("show_background")

    // 插屏广告
    monitor.off("show_foreground", ads.openInter, app)
    if (!app.user.switch_plugin) {
        monitor.once("show_foreground", ads.openInter, app)
    }
});
