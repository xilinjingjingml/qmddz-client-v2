import { http } from "../../../base/http"
import { monitor } from "../../../base/monitor"
import { setCaFilePath } from "../../../base/socket/Socket"
import { storage } from "../../../base/storage"
import TaskQueue from "../../../base/TaskQueue"
import { utils } from "../../../base/utils"
import BasePop from "../../../base/view/BasePop"
import { EAdType } from "../../ads"
import { app } from "../../app"
import { startFunc } from "../../startFunc"
import { EHOST, hosts, urls } from "../../urls"
import { Platform } from "./platform"

export enum EPluginType {
    kPluginAds = 1,     //广告
    kPluginIAP = 3,     //支付
    kPluginSession = 5, //登陆
    kPluginExend = 6,   //扩展
}

enum EExtendTag {
    EXTEND_METHOD_TAG_feedBack = 3,//用户反馈入口
    EXTEND_METHOD_TAG_onExit = 7,//退出页
    EXTEND_METHOD_TAG_shiming = 10,// 实名
}

interface IAdsConfig {
    name: string
    adId: string
    weight: number
}

enum EAppAdsType {
    BANNER = 0,         //banner广告
    INTER = 3,          //插屏广告
    REWARTVIDEO = 4,    //视频激励广告
    NATIVE = 5,         //信息流广告
    NATIVE_UNIFIED = 6,  //信息流自渲染
}

enum EAppAdsResult {
    INTER_SUCCEES = 10,         //插屏广告播放成功
    INTER_FAIL,                 //插屏广告播放失败
    REWARTVIDEO_SUCCESS,        //激励视频广告播放成功
    REWARTVIDEO_FAIL,           //激励视频广告播放失败
    BANNER_SUCCESS,             //banner广告播放成功
    BANNER_FAIL,                //banner广告load成功
    REWARTVIDEO_LOAD_FAIL,      //激励视频广告load失败
    REWARTVIDEO_LOAD_SUCCESS,   //激励视频广告load成功
    INTER_CLOSE,                //插屏广告关闭
    NATIVE_SUCCESS,             //信息流广告关闭
    NATIVE_FAIL,                //信息流广告关闭
    NATIVE_CLOSE,               //信息流广告关闭
    REWARTVIDEO_CLOSE,          //激励视频广告关闭
}

export interface IAppSessionInfo {
    SessionResultCode: number
    msg: string
    sessionInfo: {
        ef: string
        face: string
        first?: string
        flyBack: string
        ifBindWeixin: string
        ifBindAliPay: string
        imei: string
        ip: string
        isBindMobile: string
        lastlogintime: string
        maxid: string
        morrow: string
        msg: string
        nickname: string
        pid: string
        plat: string
        port: string
        regiGiftDesc: string
        regtime: string
        reply: string
        ret: string
        sex: string
        stayDay: string
        ticket: string
        tips: string
        uid: string
        url: string
        vn: string
        vs: string
        openId?: string
        phonenumber?: string
        callback?: string
    }
}

const AdBannerSizeName = "AdBannerSize"
export class AppNative extends Platform {
    supports: string[] = []
    plugins: { name: string, type: string, tag: string, mid: string }[]
    readonly thirdparty: string = "thirdparty/"
    readonly weChatSessionName: string = "SessionWeiXin"

    private pluginProxy: jsb.PluginProxyWrapper
    private versionCode: number // code 值
    private callBack: Function
    private videoConfigs: Record<string, IAdsConfig[]> = {}
    private bannerCount: number = 0
    private usedAdsDatas: { type: EAdType, index: number, excludes: string[] }

    init() {
        setCaFilePath(this.thirdparty + "wss.pem")

        if (CC_JSB) {
            this.pluginProxy = jsb.PluginProxyWrapper.getInstance()
            // 登陆回调
            // { ShareResultCode: number, msg: string, shareResultInfo: any }
            this.pluginProxy.setSessionCallBack(this.onPluginCallBack.bind(this))
            // 支付回调
            // { PayResultCode: number, msg: string, payInfo: any }
            this.pluginProxy.setIapCallBack(this.onPluginCallBack.bind(this))
            // 分享回调
            // { ShareResultCode: number, msg: string, shareResultInfo: any }
            this.pluginProxy.setSocialCallBack(this.onPluginCallBack.bind(this))
            // 平台回调
            // { PlatformResultCode: number, msg: string, url: any }
            this.pluginProxy.setPlatformCallBack(this.onPluginCallBack.bind(this))
            // 广告回调
            this.pluginProxy.setAdsCallBack(this.onAdsCallBack.bind(this))
        }

        this.readConfig()
        this.readPlugins()

        monitor.once("ads_config_update", this.onAdsConfigUpdate, this)
        monitor.on("ViewManager_showPopup", this.onShowPopup, this)
    }

    private readConfig() {
        if (CC_JSB) {
            const data = jsb.fileUtils.getValueMapFromFile(this.thirdparty + "config.plist")
            cc.log("[AppNative.readConfig]", data)
            if (data && data.config) {
                const config = data.config
                cc.log("[AppNative.readConfig] env", typeof config.env, config.env)
                if (config.env != null) {
                    app.env = parseInt(config.env)
                }
            }
        }
    }

    private readPlugins() {
        const path = this.thirdparty + "plugins"
        if (CC_JSB) {
            this.setPlugins(jsb.fileUtils.getValueMapFromFile(path + ".plist"))
        } else {
            utils.load({ bundle: "start", path: path, callback: asset => this.setPlugins(asset._nativeAsset) })
        }
    }

    private setPlugins(config: { game: { PacketName: string }[], plugins: { name: string, type: string, tag: string, mid: string }[] }) {
        cc.log("[AppNative.setPlugins]", config)
        this.plugins = config.plugins

        if (cc.sys.isBrowser) {
            monitor.emit("platform_init")
            return
        }

        if (config.game && config.game[0] && config.game[0].PacketName) {
            app.pn = config.game[0].PacketName
        }
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            app.pn = this.callStaticMethod("com/izhangxin/utils/luaj", "getChannelName", "()Ljava/lang/String;")
        }
        cc.log("[AppNative.setPlugins] pn", app.pn)
        app.version = this.getVersionName()
        this.pluginProxy.setPluginConfig(JSON.stringify(config))
        this.pluginProxy.setPackageName(app.pn)
        this.pluginProxy.switchPluginXRunEnv(app.env)
        this.plugins.forEach(plugin => this.loadPlugin(plugin.name, parseInt(plugin.type)))
        this.loadPluginFinish()
    }

    private loadPlugin(name: string, type: EPluginType) {
        this.pluginProxy.loadPlugin(name, 0, type)
    }

    private onPluginCallBack(data?: string) {
        cc.log("[AppNative.onPluginCallBack]", data)
        this.onCallBack(true, JSON.parse(data))
    }

    private onCallBack(success: boolean, ...args: any[]) {
        cc.log("[AppNative.onCallBack]", success, ...args)
        this.usedAdsDatas = null
        if (this.callBack == null) {
            return
        }
        const callback = this.callBack
        this.callBack = null
        success && callback(...args)
    }

    private onAdsCallBack(data: string) {
        cc.log("[AppNative.onAdsCallBack]", data)
        const info: { AdsResultCode: number, msg?: string, adsInfo?: { bannerWidth: string, bannerHeight: string, nativeWidth: string, nativeHeight: string, adSize: number } } = JSON.parse(data)
        if ([EAppAdsResult.BANNER_SUCCESS, EAppAdsResult.BANNER_FAIL].includes(info.AdsResultCode)) {
            // banner
            if (info.adsInfo == null) {
                return
            }
            if (info.AdsResultCode == EAppAdsResult.BANNER_SUCCESS) {
                const sendBannerSize: cc.Size = cc.size(Number(info.adsInfo.bannerWidth) / cc.view.getScaleX(), Number(info.adsInfo.bannerHeight) / cc.view.getScaleY())
                cc.log("[AppNative.onAdsCallBack] sendBannerSize", sendBannerSize.width, sendBannerSize.height)

                let isChangeBannerSize = true
                const dataBannerSize = storage.get(AdBannerSizeName)
                if (dataBannerSize) {
                    const saveBannerSize: cc.Size = cc.size(Number(dataBannerSize.width), Number(dataBannerSize.height))
                    cc.log("[AppNative.onAdsCallBack] saveBannerSize", saveBannerSize.width, saveBannerSize.height)
                    isChangeBannerSize = !saveBannerSize.equals(sendBannerSize)
                }
                cc.log("[AppNative.onAdsCallBack] isChangeBannerSize", isChangeBannerSize)
                if (true || isChangeBannerSize) {
                    storage.set(AdBannerSizeName, sendBannerSize)
                    monitor.emit("platform_ad_banner_size", { width: sendBannerSize.width, height: sendBannerSize.height, x: 0, y: 0 })
                }
            }
        } else if ([EAppAdsResult.REWARTVIDEO_SUCCESS, EAppAdsResult.REWARTVIDEO_FAIL, EAppAdsResult.REWARTVIDEO_LOAD_FAIL, EAppAdsResult.REWARTVIDEO_LOAD_SUCCESS, EAppAdsResult.REWARTVIDEO_CLOSE].includes(info.AdsResultCode)) {
            // video
            if (info.AdsResultCode == EAppAdsResult.REWARTVIDEO_SUCCESS) {
                cc.audioEngine.resumeMusic()
                monitor.emit("ads_loading_hide")
                this.onCallBack(true)
            } else if (info.AdsResultCode == EAppAdsResult.REWARTVIDEO_FAIL) {
                cc.audioEngine.resumeMusic()
                monitor.emit("ads_loading_hide")
                this.onCallBack(false)
                startFunc.showConfirm({ content: "完整观看视频才可以领取奖励哦", buttonNum: 1 })
            } else if (info.AdsResultCode == EAppAdsResult.REWARTVIDEO_CLOSE) {
                cc.audioEngine.resumeMusic()
                monitor.emit("ads_loading_hide")
                this.onCallBack(false)
            } else if (info.AdsResultCode == EAppAdsResult.REWARTVIDEO_LOAD_FAIL) {
                if (this.usedAdsDatas) {
                    this.openAdvert({
                        type: this.usedAdsDatas.type,
                        index: this.usedAdsDatas.index,
                        success: this.callBack,
                        excludes: this.usedAdsDatas.excludes,
                    })
                    return
                }
                startFunc.showToast("视频广告加载失败 请再点击一次")
                this.onCallBack(false)
            } else if (info.AdsResultCode == EAppAdsResult.REWARTVIDEO_LOAD_SUCCESS) {
                cc.audioEngine.pauseMusic()
                // 播放视频时关闭banner
                // this.closeAdvert({ type: EAdType.Banner, index: 0, closeAll: true })
            }
        } else if ([EAppAdsResult.NATIVE_SUCCESS, EAppAdsResult.NATIVE_FAIL, EAppAdsResult.NATIVE_CLOSE].includes(info.AdsResultCode)) {
            if (info.adsInfo == null) {
                return
            }

            if (Number(info.adsInfo.adSize) != 5) {
                if (info.AdsResultCode == EAppAdsResult.NATIVE_SUCCESS) {
                    const sendBannerSize: cc.Size = cc.size(Number(info.adsInfo.nativeWidth) / cc.view.getScaleX(), Number(info.adsInfo.nativeHeight) / cc.view.getScaleY())
                    cc.log("[AppNative.onAdsCallBack] sendBannerSize", sendBannerSize.width, sendBannerSize.height)

                    let isChangeBannerSize = true
                    const dataBannerSize = storage.get(AdBannerSizeName)
                    if (dataBannerSize) {
                        const saveBannerSize: cc.Size = cc.size(Number(dataBannerSize.width), Number(dataBannerSize.height))
                        cc.log("[AppNative.onAdsCallBack] saveBannerSize", saveBannerSize.width, saveBannerSize.height)
                        isChangeBannerSize = !saveBannerSize.equals(sendBannerSize)
                    }
                    cc.log("[AppNative.onAdsCallBack] isChangeBannerSize", isChangeBannerSize)
                    if (true || isChangeBannerSize) {
                        storage.set(AdBannerSizeName, sendBannerSize)
                        monitor.emit("platform_ad_banner_size", { width: sendBannerSize.width, height: sendBannerSize.height, x: 0, y: 0 })
                    }
                }
                return
            }

            // native
            if (info.AdsResultCode == EAppAdsResult.NATIVE_SUCCESS) {
                monitor.emit("ads_loading_show", -1, true) // 防误触遮罩
            } else if (info.AdsResultCode == EAppAdsResult.NATIVE_FAIL) {
            } else if (info.AdsResultCode == EAppAdsResult.NATIVE_CLOSE) {
                monitor.emit("ads_loading_hide")
            }
        } else if ([EAppAdsResult.INTER_SUCCEES, EAppAdsResult.INTER_FAIL, EAppAdsResult.INTER_CLOSE].includes(info.AdsResultCode)) {
            // inter
            if (info.AdsResultCode == EAppAdsResult.INTER_SUCCEES) {
                monitor.emit("ads_loading_show", -1, true) // 防误触遮罩
            } else if (info.AdsResultCode == EAppAdsResult.INTER_FAIL) {
                this.onCallBack(true)
            } else if (info.AdsResultCode == EAppAdsResult.INTER_CLOSE) {
                monitor.emit("ads_loading_hide")
                this.onCallBack(true)
            }
        }
    }

    onShowPopup(popup: BasePop) {
        cc.log("[AppNative.onShowPopup] banner", this.bannerCount)
        if (this.bannerCount == 0) {
            return
        }

        cc.log("[AppNative.onShowPopup] banner", popup.name)
        monitor.emitTo(popup, "platform_ad_banner_size", this.getAdBannerRect())
    }

    getAdBannerRect() {
        const rect = cc.rect(0, 0, 708.6875, 594.046875)
        const dataBannerSize: { width: string, height: string } = storage.get(AdBannerSizeName)
        if (dataBannerSize) {
            rect.width = Number(dataBannerSize.width)
            rect.height = Number(dataBannerSize.height)
        }
        return rect
    }

    onAdsConfigUpdate() {
        const adConfig = app.getOnlineParam("adConfig")
        if (adConfig == null) {
            return
        }

        const sources: Record<string, Record<string, string | { adId: string, weight?: number }>> = adConfig.sources
        if (sources == null) {
            return
        }

        for (const name in sources) {
            if (!this.hasPluginByName(name)) {
                cc.warn("未发现广告插件", name)
                continue
            }

            const source = sources[name]
            for (const adId in source) {
                let configs = this.videoConfigs[adId]
                if (configs == null) {
                    this.videoConfigs[adId] = configs = []
                }

                const config = source[adId]
                if (typeof config == "string") {
                    configs.push({ name: name, adId: config, weight: 1 })
                } else {
                    configs.push({ name: name, adId: config.adId, weight: config.weight ?? 1 })
                }
            }
        }
    }


    //************************************
    // pluginProxy 调用
    //************************************
    getPluginVersion() {
        return this.pluginProxy.getPluginVersion("PlatformWP", 1, 9)
    }

    getVersionName() {
        return this.pluginProxy.getVersionName()
    }

    getDeviceIMEI() {
        return this.pluginProxy.getDeviceIMEI()
    }

    getMacAddress() {
        return this.pluginProxy.getMacAddress()
    }

    getVersionCode() {
        if (this.versionCode === undefined) {
            this.versionCode = parseInt(this.pluginProxy.getVersionCode())
        }
        return this.versionCode
    }

    /**
     * 登陆
     */
    login(params: { sessionType: string, callback?: (data: IAppSessionInfo) => void, data?: any }) {
        const info = params.data ?? {}
        info.LoginHost = hosts[app.env][EHOST.login]
        info.PlatformHost = hosts[app.env][EHOST.web]
        cc.log("[AppNative.login]", params.sessionType, info)

        this.callBack = params.callback
        this.loadPlugin(params.sessionType, EPluginType.kPluginSession)
        this.pluginProxy.userItemsLogin(JSON.stringify(info))
    }

    /**
     * 插件登出
     */
    logout() {
        cc.log("[AppNative.logout]")
        this.pluginProxy.logout()
    }

    /**
     * 插件支付
     */
    pay(params: { payType: string, callback: (data: { PayResultCode: number, msg: string, payInfo: any }) => void, data?: any }) {
        const info = params.data ?? {}
        info.IapHost = hosts[app.env][EHOST.pay]
        cc.log("[AppNative.pay]", params.payType, info)

        this.callBack = params.callback
        this.loadPlugin(params.payType, EPluginType.kPluginIAP)
        this.pluginProxy.payForProduct(JSON.stringify(info))
    }

    /**
     * 插件分享
     */
    sociaShare() {
        cc.log("[AppNative.sociaShare]")
        if (!app.sharedData) {
            startFunc.showToast("暂不支持分享")
            return
        }

        // 分享url
        if (app.sharedData.sdType == 0) {
            const titles = [
                "好友来助攻，海量红包进来就领！",
                "玩游戏就送红包！这是你未玩过的全新版本！",
                "天降红包，你就是趟着领红包的人！"
            ]
            this.share({
                ShareWay: "WeiXin",
                ShareTitle: titles[Math.floor(Math.random() * titles.length)],
                ShareType: "0",
            })
            return
        }

        const filepath = jsb.fileUtils.getWritablePath() + "share_" + md5(app.sharedData.sdPic + app.sharedData.sdCodePic) + ".png"
        if (jsb.fileUtils.isFileExist(filepath)) {
            this.share({ ShareWay: "WeiXin", ShareType: "2", SharedImg: "file://" + filepath })
            return
        }

        const root = new cc.Node()
        const task = new TaskQueue(cc.Canvas.instance.node)
        task.add((next: Function) => {
            utils.loadHttpImage(app.sharedData.sdPic, (spriteFrame: cc.SpriteFrame) => {
                const node = new cc.Node()
                node.addComponent(cc.Sprite).spriteFrame = spriteFrame
                node.parent = root

                root.width = spriteFrame.getTexture().width
                root.height = spriteFrame.getTexture().height

                next()
            })
        })
        task.add((next: Function) => {
            utils.loadHttpImage(app.sharedData.sdCodePic, (spriteFrame: cc.SpriteFrame) => {
                const node = new cc.Node()
                node.addComponent(cc.Sprite).spriteFrame = spriteFrame
                node.y = -353
                node.parent = root

                next()
            })
        })
        task.add((next: Function) => {
            root.parent = cc.Canvas.instance.node
            this.shareNode(root, filepath)
            root.destroy()

            next()
        })
        task.run()
    }

    shareNode(node: cc.Node, filepath: string) {
        this.screenShotNode(node, filepath)
        this.share({ ShareWay: "WeiXin", ShareType: "2", SharedImg: "file://" + filepath })
    }

    private share(data: { ShareWay: "WeiXin" | "PengYouQuan", ShareTaskType?: string, ShareTitle?: string, ShareText?: string, ShareUrl?: string, ShareType?: "0" | "1" | "2", SharedImg?: string, }) {
        const info = {
            ShareWay: data.ShareWay == "PengYouQuan" ? "1004" : "1005",
            ShareTaskType: data.ShareTaskType || "0",
            ShareTitle: data.ShareTitle || app.sharedData.sdTitle,
            ShareText: data.ShareText || app.sharedData.sdContent[Math.floor(Math.random() * app.sharedData.sdContent.length)],
            ShareUrl: data.ShareUrl || app.sharedData.sdUrl,
            ShareType: data.ShareType || app.sharedData.sdType.toString(),
            gameid: app.gameId.toString(),
            SharedImg: data.SharedImg || "file://thirdparty/icon.png",
        }
        cc.log("[AppNative.share]", info)
        this.pluginProxy.shareWithItems(JSON.stringify(info))
    }

    private screenShotNode(node: cc.Node, filePath: string) {
        const width = node.width
        const height = node.height

        cc.log("[AppNative.screenShotNode]", width, height)
        if (width == 0 || height == 0) {
            cc.warn("[AppNative.screenShotNode] size = 0")
            return
        }

        const texture = new cc.RenderTexture()
        texture.initWithSize(width, height, cc.game._renderContext.STENCIL_INDEX8)

        const camera = node.addComponent(cc.Camera)
        camera.cullingMask = 0xffffffff
        camera.targetTexture = texture
        camera.alignWithScreen = false
        camera.orthoSize = height / 2
        camera.render(node)

        const data = texture.readPixels()
        const picData = new Uint8Array(width * height * 4)
        const rowBytes = width * 4
        for (let row = 0; row < height; row++) {
            const srow = height - 1 - row
            const start = srow * width * 4
            const reStart = row * width * 4
            for (let i = 0; i < rowBytes; i++) {
                picData[reStart + i] = data[start + i]
            }
        }

        node.removeComponent(cc.Camera)

        const ret = jsb.saveImageData(picData, width, height, filePath)
        cc.log("[AppNative.screenShotNode]", ret, filePath)
        return ret
    }

    /**
     * 展示广告
     */
    openAdvert(params: { type: EAdType, index?: number, success?: Function, excludes?: string[] }) {
        const appAdType = this.getAppAdType(params.type)
        // 根据广告点查找广告配置
        let configs: IAdsConfig[]
        if (params.type == EAdType.Video) {
            configs = this.videoConfigs[params.index]
        }
        if (configs == null || configs.length == 0) {
            configs = this.getCommoAdsConfigs(appAdType)
        }
        if (configs == null || configs.length == 0) {
            startFunc.showToast("暂不支持播放该广告，详情请联系客服！")
            return
        }

        configs = configs.slice()

        // 过滤失败广告
        if (params.excludes == null) {
            params.excludes = []
        } else if (params.excludes.length > 0) {
            for (let i = configs.length - 1; i >= 0; i--) {
                if (params.excludes.includes(configs[i].adId)) {
                    configs.splice(i, 1)
                }
            }

            if (configs.length == 0) {
                this.usedAdsDatas = null
                if (params.type == EAdType.Video) {
                    this.onAdsCallBack(JSON.stringify({ AdsResultCode: EAppAdsResult.REWARTVIDEO_LOAD_FAIL }))
                } else {
                    startFunc.showToast("暂不支持播放该广告，详情请联系客服！")
                }
                return
            }
        }

        // 随机广告
        let sum = 0
        for (const cfg of configs) {
            sum += cfg.weight
        }
        sum = Math.floor(Math.random() * sum)

        let config: IAdsConfig
        for (const cfg of configs) {
            sum -= cfg.weight
            if (sum < 0) {
                config = cfg
                break
            }
        }
        if (config == null) {
            startFunc.showToast("暂不支持播放该广告，详情请联系客服！")
            return
        }

        // 存储广告
        params.excludes.push(config.adId)
        this.usedAdsDatas = {
            type: params.type,
            index: params.index,
            excludes: params.excludes
        }

        if (params.type == EAdType.Banner) {
            this.bannerCount++
            // banner 调整ui位置
            const rect = this.getAdBannerRect()
            cc.log("[AppNative.openAdvert] banner", this.bannerCount)
            cc.log("[AppNative.openAdvert] banner rect", rect)
            monitor.emit("platform_ad_banner_size", rect)
        } else if (params.type == EAdType.Video) {
            // video 添加遮罩
            monitor.emit("ads_loading_show")
        }

        /**
         * 1 上
         * 2 下
         * 3 左
         * 4 右
         * 5 中
         */
        let adSize = 0
        if (appAdType == EAppAdsType.NATIVE || appAdType == EAppAdsType.NATIVE_UNIFIED) {
            adSize = params.type == EAdType.Banner ? 2 : 5
        }
        const info = {
            adType: appAdType.toString(),
            adId: config.adId,
            adWidth: "0",
            adHeight: "0",
            adSize: adSize.toString(),
        }
        cc.log("[AppNative.openAdvert]", params.type, info)
        this.callBack = params.success
        this.loadPlugin(config.name, EPluginType.kPluginAds)
        this.pluginProxy.showAds(JSON.stringify(info))
    }

    getAppAdType(type: EAdType) {
        if (type == EAdType.Banner) {
            // return EAdsWay.BANNER
            const configs = this.getCommoAdsConfigs(EAppAdsType.NATIVE_UNIFIED)
            if (configs && configs.length > 0) {
                return EAppAdsType.NATIVE_UNIFIED
            }
            return EAppAdsType.NATIVE
        } else if (type == EAdType.Inter) {
            return EAppAdsType.INTER
        } else if (type == EAdType.Video) {
            return EAppAdsType.REWARTVIDEO
        }
    }

    getCommoAdsConfigs(appAdType: EAppAdsType) {
        return this.videoConfigs[{
            [EAppAdsType.BANNER]: "banner",
            [EAppAdsType.INTER]: "inter",
            [EAppAdsType.REWARTVIDEO]: "video",
            [EAppAdsType.NATIVE]: "native",
            [EAppAdsType.NATIVE_UNIFIED]: "unified",
        }[appAdType]]
    }

    /**
     * 隐藏广告
     */
    closeAdvert(params: { type: EAdType, index: number, closeAll: boolean }) {
        cc.log("[AppNative.closeAdvert]", params.type, params.index)
        if (params.type == EAdType.Banner) {
            if (params.closeAll) {
                this.bannerCount = 0
            } else {
                this.bannerCount--
                if (this.bannerCount < 0) {
                    this.bannerCount = 0
                }
            }
            cc.log("[AppNative.closeAdvert] banner", this.bannerCount)
            if (this.bannerCount == 0) {
                this.pluginProxy.hideAds(this.getAppAdType(params.type))
            }
        }
    }

    /**
     * 登陆完成后通知推送插件 让它去注册推送
     */
    startPush() {
        const data = JSON.stringify({ PushHost: hosts[app.env][EHOST.web] })
        cc.log("[AppNative.startPush]", data)
        this.pluginProxy.StartPushSDKItem(data)
    }

    /**
     * 打开客服
     */
    openKeFu() {
        this.jump2ExtendMethod(EExtendTag.EXTEND_METHOD_TAG_feedBack)
    }

    private jump2ExtendMethod(tag: EExtendTag) {
        const data = JSON.stringify({})
        cc.log("[AppNative.jump2ExtendMethod]", tag, data)
        this.loadPluginByTag(tag, EPluginType.kPluginExend)
        this.pluginProxy.jump2ExtendMethod(tag, data)
    }

    copyToClipboard(text: string) {
        this.pluginProxy.copyToClipboard(text)
    }

    //************************************
    // callStaticMethod 调用
    //************************************

    /**
     * 调用 Java / Object C 的静态方法
     */
    callStaticMethod(className: string, methodName: string, methodSignature?: string, ...parameters: any[]) {
        try {
            return jsb.reflection.callStaticMethod(className, methodName, methodSignature, ...parameters)
        } catch (err) {
            cc.error("[AppNative.callStaticMethod]", err)
        }
    }

    private checkLuaJVersion(version: string) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            const luajversion = this.callStaticMethod("com/izhangxin/utils/luaj", "getVersion", "()Ljava/lang/String;")
            if (luajversion && utils.versionCompare(luajversion, version) >= 0) {
                return true
            }
        }

        return false
    }

    private loadPluginFinish() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            this.callStaticMethod("com/izhangxin/utils/luaj", "loadPluginFinish", "()V")
        }
    }

    private loadPluginByTag(tag: number, type: EPluginType) {
        for (const plugin of this.plugins) {
            if (parseInt(plugin.tag) == tag && parseInt(plugin.type) == type) {
                this.loadPlugin(plugin.name, parseInt(plugin.type))
                break
            }
        }
    }

    hasPluginByName(name: string) {
        return this.plugins.some(plugin => plugin.name == name)
    }

    hasWeChatSession() {
        return this.hasPluginByName(this.weChatSessionName)
    }

    hasPluginByType(type: EPluginType) {
        return this.plugins.some(plugin => parseInt(plugin.type) == type)
    }

    getPluginNameByMid(mid: string) {
        for (const plugin of this.plugins) {
            if (parseInt(plugin.type) == EPluginType.kPluginIAP && plugin.mid == mid.toString()) {
                return plugin.name
            }
        }
    }

    uploadKuaiShou(type: number) {
        if (!app.datas.kuaishou_callback) {
            return
        }
        http.open("http://ad.partner.gifshow.com/track/activate", {
            event_type: type,
            event_time: new Date().getTime(),
            callback: app.datas.kuaishou_callback
        })
    }

    bindWeiXin() {
        this.login({
            sessionType: this.weChatSessionName,
            callback: (data) => {
                if (data.SessionResultCode == 0) {
                    http.open(urls.BIND_WEIXIN, { visitorUid: app.user.guid, ticket: app.user.ticket, gameid: app.gameId, weixinUid: data.sessionInfo.pid, openId: data.sessionInfo.openId, type: 0, }, (err: Error, event: { ret: number, msg: string }) => {
                        if (event) {
                            if (event.ret == 1) {
                                startFunc.showConfirm({ content: "该微信账号已存在，请先更换其他微信号，再进行绑定。", buttonNum: 1 })
                                return
                            }

                            if (event.ret > 1) {
                                app.datas.ifBindWeixin = true
                            }

                            startFunc.showToast(event.msg)
                            this.login({ sessionType: storage.get("login_type") })
                        } else {
                            startFunc.showToast("绑定失败，请稍后再试！")
                        }
                    })
                } else {
                    startFunc.showToast("微信绑定失败")
                }
            }
        })
    }
}
