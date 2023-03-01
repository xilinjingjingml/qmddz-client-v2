import { UserExtends } from "../base/extends/UserExtends"
import { http } from "../base/http"
import { monitor } from "../base/monitor"
import { storage } from "../base/storage"
import { utils } from "../base/utils"
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
    pn = "com.union.xxddz.wechat" // 当前渠道cn
    gameId = 1238 // 当前gameId
    wxAppID = "wxfd9359237da92e7e" // 微信小程序APPID
    bundule: string = "start"
    version: string
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

    constructor() {
        this.env = storage.get("ENV") ?? ENV.OFFICIAL//OFFICIAL
        this.version = "2.1.0"
        this.user = new User()
        this.datas.role = { roundSum: 0 }
        this.datas.bindPhone = { hasBindMoble: 0, BindPhone: "" }
        this.datas.bannerList = []

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
        startFunc.report("资源加载完毕")
        this.nodePersist = node
        startFunc.checkNetwork({ callback: this.loadConfig.bind(this) })
    }

    private loadConfig() {
        startFunc.report("环境初始化")
        this.platform.init()

        const localCfg = storage.get("loadingConfig")

        startFunc.report("拉取配置_开始")
        http.open(urls.LOADING_CONFIGS, {
            pn: this.pn,
            fwversion: 14042902,
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
                if (localCfg?.versionupdate && res.ip && res.port) {
                    if (localCfg.versionupdate.ip != res.ip || localCfg.versionupdate.port != res.port) {
                        localCfg.versionupdate.ip = res.ip
                        localCfg.versionupdate.port = res.port
                    }
                }
            }

            if (!res || typeof res == "string" || res.ret == 0) {
                if (!localCfg) {
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
            startFunc.report("拉取配置_完成")
            this.login()
        })
    }

    login() {
        startFunc.report("用户登录_开始")
        monitor.once("platform_login_success", this.platform_login_success, this)
        monitor.once("platform_login_fail", this.platform_login_fail, this)

        if (cc.sys.isNative || (cc.sys.isBrowser && this.platformType == PlatformType.AppNative)) {
            if (checkUpdatate()) {
                startFunc.showUpdate()
            } else {
                startFunc.showLogin()
            }
            return
        }
        this.platform.login()
    }

    private platform_login_success() {
        startFunc.report("用户登录_完成")
        ads.loadAdConfig()
        startFunc.getIPLocation()
        startFunc.showLobby()
        startFunc.preLoad()
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
        // if (cc.sys.isNative) {
        //     value = this.onlineParam[name + (this.platform as AppNative).getVersionCode()]
        // }
        // else if(cc.sys.platform === cc.sys.WECHAT_GAME){
        //     /**
        //      * TODO wechatMiniGame 请求线上adsConfig
        //      * 1.消息处理暂时认为与app一样 ？？？
        //     */
        //     // value = this.onlineParam[name + (this.platform as WeChatMiniGame).getVersionCode()]
        // }

        if (value == null) {
            // console.log("jin---onlineParam: ", this.onlineParam)
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
}

export const app = new App()
