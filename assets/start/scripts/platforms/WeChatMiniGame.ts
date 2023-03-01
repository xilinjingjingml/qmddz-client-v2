import { http } from "../../../base/http"
import { monitor } from "../../../base/monitor"
import { storage } from "../../../base/storage"
import { EAdType } from "../../ads"
import { app } from "../../app"
import { startFunc } from "../../startFunc"
import { urls } from "../../urls"
import { Platform } from "./platform"

declare const wx: any
interface IWxVideo { instance: any, valid: boolean, callback: Function }
interface IWxBanner { instance: any, valid: boolean, rect: null, ref: number }
interface IWxInter { instance: any, valid: boolean, visible: boolean }

enum AdsResult {
    Success,
    Cancel,
    Error,
}

const UnitId = {
    Video: "adunit-3892853d9d6c67bd",
    Banner: "adunit-81f5c0cca8729ed6",
    Inter: "adunit-1c48f34d0d49f9c3",
    // Grid: "adunit-b016cf057deb6a4c",
    CustomAd:"adunit-2c73120349def0dd"
}

const AdvertErr = [1000, 1003, 1004, 1005]
const AdvertFreqErr = [2001, 2002, 2003, 2004, 2005]
const KEY_OPEN_ID = "WX_USER_OPENID"

const adapt = { screen: null, design: null, ratio: 1, width: 0, height: 0 }
const share = { invoked: true, time: 0, skipCheck: false, callback: null }

let shareConfig: any = []

export class WeChatMiniGame extends Platform {

    wxOpenId: string = null
    wxUserInfo: any = null
    wxScene: number = 0
    wxQuery: any = null
    appQueryChecked: boolean = null

    video: { [adindex: string]: string } = {}
    advertVideo: { [unitid: string]: IWxVideo } = {}

    banner: { [adindex: string]: string } = {}
    advertBanner: { [unitid: string]: IWxBanner } = {}

    inter: { [adindex: string]: string } = {}
    advertInter: { [unitid: string]: IWxInter } = {}

    init() {
        app.platform.localStorage("isPureMode", 
            null, 
            false, 
            state=>{ 
                if(state){
                    app.datas.isPureMode = Boolean(state)
                }
                
                console.log("jin---checkSpecialAward localStorage1", state)
            })
        this.wxOpenId = storage.get(KEY_OPEN_ID)
        const opt = wx.getLaunchOptionsSync()
        this.wxScene = opt.scene
        this.wxQuery = opt.query

        this.checkAppUpdate()
        this.showShareMenu()
        this.addEventListener()

        adapt.screen = cc.view.getFrameSize()
        adapt.design = cc.view.getDesignResolutionSize()
        adapt.ratio = Math.min(adapt.screen.width / adapt.design.width, adapt.screen.height / adapt.design.height)
        adapt.width = 0

        const safeArea = wx.getSystemInfoSync().safeArea
        if (safeArea) {
            adapt.height = adapt.screen.height - safeArea.bottom
        }

        monitor.once("ads_config_update", this.initAdsdata, this)
    }

    login(isSyncInfo?: boolean) {
        const onGetOpenId = () => {
            !isSyncInfo ? this.loginGame() : this.getUserInfo((err) => {
                if (err) {
                    monitor.emit("platform_login_fail", err)
                    return
                }
                this.loginGame()
            })
        }

        const getOpenId = () => {
            startFunc.report("微信登录_开始")
            this.code2Session((err) => {
                startFunc.report("微信登录_完成")
                err ? monitor.emit("platform_login_fail", "GetOpenId:" + err) : onGetOpenId()
            })
        }

        !this.wxOpenId ? getOpenId() : this.checkSession((isValid) => {
            isValid ? onGetOpenId() : getOpenId()
        })
    }

    loginGame() {
        startFunc.report("lobby登录_开始")
        http.open(urls.GAME_LOGIN, {
            appid: app.wxAppID,
            pn: app.pn,
            channel: this.wxUserInfo ? 1 : "",
            version: app.version,
            openId: this.wxOpenId,
            rawData: this.wxUserInfo ? this.wxUserInfo.rawData : "",
            signature: this.wxUserInfo ? this.wxUserInfo.signature : "",
            bindOpenId: this.getQueryOpenId(true) || ""
        }, (err, res) => {
            // console.log("jin---res:",res)
            if (!res || res.ret != 0) {
                let msg
                if (err) {
                    msg = err.message
                } else if (res) {
                    msg = res.tip || res.msg || "unknown"
                } else {
                    msg = "请求错误"
                }
                monitor.emit("platform_login_fail", "LoginGame:" + msg)
                return
            }

            if (res.ret == -101) {
                storage.remove(KEY_OPEN_ID)
            }

            app.user.guid = parseInt(res.pid)
            app.user.ticket = res.ticket
            app.user.nickname = res.nickname
            app.user.face = res.face
            app.user.imei = res.imei
            app.user.sex = res.sex
            app.user.openId = res.openId

            app.datas.regtime = res.regtime == 0 ? Math.floor(Date.now() / 1000) : res.regtime
            app.datas.stayDay = res.stayDay
            app.datas.ifBindWeixin = res.ifBindWeixin == 1
            app.datas.ifBindAliPay = res.ifBindAliPay == 1
            app.datas.bindPhone.hasBindMoble = res.isBindMobile
            app.datas.bindPhone.BindPhone = res.phonenumber || ""

            app.datas.first = res.first
            app.datas.morrow = res.first == 1 ? 0 : res.morrow

            startFunc.report("lobby登录_完成")
            monitor.emit("platform_login_success")
        })
    }

    code2Session(callback: (error: string) => any) {
        wx.login({
            success: (res) => {
                // console.log("jin---res1:",res, app.wxAppID)
                http.open(urls.GET_WX_OPENID, {
                    appid: app.wxAppID,
                    jscode: res.code
                }, (err, res) => {
                    // console.log("jin---res2:",err, res)
                    if (!res || !res.openid) {
                        if (err) {
                            callback(err.message)
                        } else if (res) {
                            callback(res.tip || res.msg || "unknown")
                        } else {
                            callback("请求错误")
                        }
                        return
                    }
                    storage.set(KEY_OPEN_ID, res.openid)
                    this.wxOpenId = res.openid
                    callback(null)
                })
            },
            fail: (res) => { callback(res.errMsg) }
        })
    }

    getUserInfo(callback: (error: string) => any) {
        wx.getUserInfo({
            lang: "zh_CN",
            success: (res) => {
                this.wxUserInfo = res
                callback(null)
            },
            fail: (res) => {
                callback(res.errMsg)
            }
        })
    }

    // wx.getUpdateManager >= 1.9.9
    checkAppUpdate() {
        if (wx.getUpdateManager) {
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate((res) => {
                if (res.hasUpdate) {
                    updateManager.onUpdateReady(() => {
                        wx.showModal({
                            title: "更新提示",
                            content: "新版本已经准备好,是否重启应用?",
                            success: (res) => {
                                if (res.confirm) {
                                    updateManager.applyUpdate()
                                }
                            }
                        })
                    })

                    updateManager.onUpdateFailed(() => {
                        wx.showModal({
                            title: "已经有新版本了",
                            content: "新版本已经上线啦,请您删除当前小程序,重新搜索打开",
                        })
                    })
                }
            })
        }
    }

    checkSession(callback: (isValid: boolean) => any) {
        wx.checkSession({
            success: () => { callback(true) },
            fail: () => { callback(false) }
        })
    }

    // wx.onShareMessageToFriend >= 2.9.4
    addEventListener() {
        wx.onShow((res) => {
            // console.log("jin---回到游戏")
            this.wxQuery = res.query
            this.wxScene = res.scene
            this.appQueryChecked = false
            this.showInter(UnitId.Inter)

            if (share.callback) {
                // console.log("jin---回到游戏  有回调")
                let success = true
                if (share.skipCheck) {
                    // do nothing
                } else if (!share.invoked) {
                    success = false
                    share.invoked = true
                    // DataManager.save("WX_FLAG_SHARE", true)
                } else if (Date.now() - share.time < 3000) {
                    success = false
                }

                success ? share.callback() : this.showModal("分享失败，请换个群试试。")
                share.callback = null
            }
        })

        if (wx.onShareMessageToFriend) {
            wx.onShareMessageToFriend((res) => {

                monitor.emit("share_friend_result", res.success)
            })
        }

        //监听用户主动截图
        if(wx.onUserCaptureScreen){
            wx.onUserCaptureScreen(function (res) {
                console.log('jin---用户截屏了', res)
                //TODO 标记状态为纯净版状态
                app.platform.localStorage("isPureMode", 
                    true, 
                    true, 
                    state=>{ 
                        wx.exitMiniProgram((res)=>{
                            console.log("jin---exitMiniProgram", state, res)
                        })
                    })
              })
        }
    }

    getQueryOpenId(omitSelf: boolean = false) {
        const queryId = this.wxQuery ? this.wxQuery.openId : null

        if (omitSelf) {
            return queryId != this.wxOpenId ? queryId : null
        }

        return queryId
    }

    // wx.setClipboardData >= 1.1.0
    copyToClipBoard(text: string) {

        if (wx.setClipboardData) {
            wx.setClipboardData({
                data: String(text),
                success: () => {startFunc.showToast("复制成功")},//
                fail: (err) => {
                    startFunc.showToast("复制失败")
                    // console.log("jin---fail:", err, text)
                }
            })
        }
    }

    //TODO 处理 1.video 2.banner 数据
    initAdsdata() {
        const adConfig = app.getOnlineParam("adConfig")
        // console.log("jin---initAdsdata adConfig: ",  adConfig, app.datas.regtime)
        if (adConfig) {
            const regtime = app.datas.regtime
            const unitids = adConfig.unitids || {}
            
            for(const k in unitids){
                const unitid = (regtime >= unitids[k].sp ? unitids[k].tv : unitids[k].fv) || UnitId.Video
                this.video[k] = unitid
                 //TODO 预加载
                // for(const s of unitids.preload){
                //     if(k == s){
                //         this.createVideo(unitid)
                //     }
                // }
            }
        }

        const adBannerConfig = app.getOnlineParam("adBannerConfig")
        // console.log("jin---adBannerConfig: ", adBannerConfig)
        if (adBannerConfig) {
            const regtime = app.datas.regtime
            const unitids = adBannerConfig.unitids || {}
            
            for(const k in unitids){
                const unitid = (regtime >= unitids[k].sp ? unitids[k].tv : unitids[k].fv) || UnitId.Banner
                this.banner[k] = unitid
            }
            
        }

    }

    // wx.createRewardedVideoAd >= 2.0.4
    createVideo(unitid: string) {
        if (!wx.createRewardedVideoAd) {
            return null
        }

        if (!this.advertVideo[unitid]) {
            const advert: IWxVideo = { instance: null, valid: true, callback: null }
            const instance = wx.createRewardedVideoAd({ adUnitId: unitid, multiton: true })

            instance.onError((res) => {
                console.error("视频广告" + unitid, res)
                if (AdvertErr.indexOf(res.errCode) !== -1) {
                    advert.valid = false
                }

                if (advert.callback) {
                    advert.callback(AdsResult.Error)
                    advert.callback = null
                }
            })

            instance.onClose((res) => {
                if (advert.callback) {
                    if (!res || res.isEnded) {
                        advert.callback(AdsResult.Success)
                    } else {
                        advert.callback(AdsResult.Cancel)
                    }
                    advert.callback = null
                }
            })

            advert.instance = instance
            this.advertVideo[unitid] = advert
        }

        return this.advertVideo[unitid]
    }

    showVideo(unitid: string, callback: (result: AdsResult) => any) {
        const advert = this.createVideo(unitid || UnitId.Video)

        if (!advert || !advert.valid) {
            callback(AdsResult.Error)
            return
        }

        advert.callback = callback

        // wx.showLoading({ title: "广告加载中", mask: true })

        advert.instance.show()
        .then(()=>{
            console.log("jin---已经播放成功", unitid)
            // wx.hideLoading()
        })
        .catch(err =>{
            wx.showLoading({ title: "广告加载中", mask: true })
            advert.instance.load()
            .then(() => {
                advert.instance.show()
                    .then(()=>{
                        wx.hideLoading()
                        console.log("jin---已经播放成功2", unitid)
                        }
                    )
                    .catch((res) => {
                        console.error("视频广告显示", res)
                        wx.hideLoading()
                    })
            })
            .catch(wx.hideLoading)
        })

    }

    // wx.createBannerAd >= 2.0.4
    createBanner(unitid: string) {
        if (!wx.createBannerAd) {
            return null
        }

        if (!this.advertBanner[unitid]) {
            const advert = { instance: null, valid: true, rect: null, ref: 0 }
            const instance = wx.createBannerAd({
                adUnitId: unitid,
                adIntervals: 30,
                style: {
                    top: 0,
                    left: 0,
                    width: 500
                }
            })

            instance.onError((res) => {
                console.error("Banner广告" + unitid, res)
                if (AdvertErr.indexOf(res.errCode) !== -1) {
                    advert.valid = false
                }
            })

            instance.onResize((res) => {
                const left = (adapt.screen.width - res.width) / 2
                const top = adapt.screen.height - res.height

                instance.style.left = left
                instance.style.top = top

                const x = left / adapt.ratio - adapt.width / 2
                const y = (adapt.screen.height - top - res.height) / adapt.ratio
                const width = res.width / adapt.ratio
                const height = (res.height + adapt.height) / adapt.ratio

                advert.rect = cc.rect(x, y, width, height)

                monitor.emit("platform_ad_banner_size", advert.rect)
            })

            advert.instance = instance
            this.advertBanner[unitid] = advert
        }

        return this.advertBanner[unitid]
    }

    showBanner(unitid: string) {
        const advert = this.createBanner(unitid || UnitId.Banner)

        if (!advert || !advert.valid) {
            return
        }

        if (advert.rect) {
            monitor.emit("platform_ad_banner_size", advert.rect)
        }
        console.log("jin---showBanner: ", unitid)
        advert.ref++
        advert.instance.show()
            .catch((res) => {
                console.error("Banner广告显示", unitid, res)
            })
    }

    closeBanner(unitid: string, closeAll: boolean) {
        if (closeAll) {
            for (const id in this.advertBanner) {
                this.advertBanner[id].ref = 0
                this.advertBanner[id].instance.hide()
            }
        } else {
            // const advert = this.createBanner(unitid || UnitId.Banner)
            const advert = this.advertBanner[unitid] ? this.advertBanner[unitid] : this.advertBanner[UnitId.Banner]
            console.log("jin---消除banner广告1", unitid, advert)
            if (advert.ref > 0) {
                console.log("jin---消除banner广告2")
                advert.ref--
                if (advert.ref <= 0) {
                    advert.ref = 0
                    advert.instance.hide()
                }
            }else{
                //延时销毁
                setTimeout(()=>{
                    console.log("jin---消除banner广告3")
                    if(advert.ref >= 0){
                        advert.ref--
                        if (advert.ref <= 0) {
                            advert.ref = 0
                            advert.instance.hide()
                        }
                    }
                },5*1000);
            }
        }
    }

    // wx.createInterstitialAd >= 2.6.0
    createInter(unitid: string) {
        if (!wx.createInterstitialAd) {
            return null
        }

        if (!this.advertInter[unitid]) {
            const advert: IWxInter = { instance: null, valid: true, visible: false }
            const instance = wx.createInterstitialAd({ adUnitId: unitid })

            instance.onError((res) => {
                console.error("插屏广告", res)
                advert.visible = false
                if (AdvertFreqErr.indexOf(res.errCode) !== -1 && AdvertErr.indexOf(res.errCode) !== -1) {
                    advert.valid = false
                }
            })

            instance.onClose(() => {
                advert.visible = false
            })

            advert.instance = advert

            advert.instance = instance
            this.advertInter[unitid] = advert
        }

        return this.advertInter[unitid]
    }

    showInter(unitid: string) {
        const advert = this.createInter(unitid || UnitId.Inter)

        if (!advert || !advert.valid || advert.visible) {
            return
        }

        advert.visible = true

        advert.instance.show()
            .catch((res) => {
                console.error("插屏广告显示", res)
                advert.visible = false
            })
    }

    openAdvert(params: { type: EAdType, index?: number, success?: Function }) {//todo cb: Function, 
        //TODO 所有广告都转入分享
        const parm = {
            title: null,
            imageUrl: null,
            withOpenId: true,
            callback: params.success
        }
        // console.log("jin---parm.callback: ", parm.callback, params.type)
        // if(params.type == EAdType.Video){
        //     this.sociaShare(parm)
        // }
        // return
        if (params.type == EAdType.Video) {
            this.showVideo(this.video[params.index], (result: AdsResult) => {
                if (result == AdsResult.Success) {
                    params.success && params.success()
                } else if (result == AdsResult.Cancel) {
                    startFunc.showToast("完整观看广告视频才可以领取奖励哦")
                } else {
                    //TODO 视频广告播放失败转向分享
                    console.log("jin---广告视频播放失败")
                    this.sociaShare(parm)
                    // startFunc.showToast("广告视频播放失败")
                }
            })
        } else if (params.type == EAdType.Banner) {
            this.showBanner(this.banner[params.index])
        } else if (params.type == EAdType.Inter) {
            this.showInter(this.inter[params.index])
        }
    }

    closeAdvert(params: { type: EAdType, index?: number, closeAll?: boolean }) {
        if (params.type == EAdType.Banner) {
            this.closeBanner(this.banner[params.index], params.closeAll)
        }
    }

    /**
     *  TODO 分享
     *  example:
     *  parm = {
            title: title,
            imageUrl: this.imageUrl,
            withOpenId: true,
            callback: null
        }
     */
    sociaShare(param){
        // console.log("jin---主动分享")
        wx.shareAppMessage(this.makeShareParam(param))
        if (param.callback) {
            // console.log("jin---主动分享 callback")
            share.skipCheck = param.skipCheck
            share.callback = param.callback
            share.time = Date.now()
        }
    }

    // wx.showShareMenu >= 1.1.0
    showShareMenu() {
        wx.showShareMenu && wx.showShareMenu({ withShareTicket: false })
        wx.onShareAppMessage(() => {
            const config = this.randomShare()
            let query = "openId=" + app.user.openId

            return {
                title: config.title,
                imageUrl: config.image,
                query: query
            }
        })
    }

    randomShare() {
        shareConfig = app.getOnlineParam("shareConfig")
        const config = shareConfig[Math.floor(Math.random() * shareConfig.length)]
        let title = config.title
        let image = config.image

        if (Array.isArray(title)) {
            title = title[Math.floor(Math.random() * title.length)]
        }

        if (Array.isArray(image)) {
            image = image[Math.floor(Math.random() * image.length)]
        }

        return { title: title, image: image }
    }

    makeShareParam(shareData) {
        shareData = shareData || {}

        shareData.query = shareData.query || {}

        if (shareData.withOpenId) {
            shareData.query.openId = app.user.openId
        }

        let query = ''
        let prefix = ''
        for (let key in shareData.query) {
            query += prefix + key + '=' + shareData.query[key]
            prefix = '&'
        }
        shareData.query = query

        const config = this.randomShare()

        return {
            title: shareData.title || config.title,
            imageUrl: shareData.imageUrl || config.image,
            query: shareData.query
        }
    }

    showModal(message) {
        wx.showModal({
            title: "系统提示",
            content: message,
            showCancel: false
        })
    }

    setStorageInfo(key: string, vaule: any, callback:(date: any) => void) {
            wx.setStorage({
                key: key,
                data: vaule,
                success: (res)=>{
                    console.log("jin---setStorageInfo success")
                    callback && callback(res.data)
                },
                fail: (res)=>{
                    console.log("jin---setStorageInfo fail")
                    callback && callback(res.data)
                }
            })
    }

    getStorageInfo(key:string, callback:(date: any) => void){
            wx.getStorage({
                key: key,
                success (res) {
                console.log("jin---getStorageInfo success",res.data)
                callback && callback(res.data)
                return res.data
                }
            })
    }

    localStorage(key: string, vaule: any, state: boolean, callback:(date: any) => void){
        //state: true(设置数据)
        if(state){
            this.setStorageInfo(key, vaule, callback)
        }else{
            // console.log("jin---WxWrapper.getStorageInfo",WxWrapper.getStorageInfo(key))
            this.getStorageInfo(key, callback)
        }
    }

    //小程序跳转
    navigateToMiniProgram(miniGameId: string, callback:(data:string) => void){
        wx.navigateToMiniProgram({
            appId: miniGameId,
            path: null,
            extraData: {
                foo: 'QMDDZ-AD-CLIENT'
            },
            envVersion: 'release',
            success(res) {
                console.log("jin---navigateToMiniProgram success")
                callback && callback(null)
            },
            fail(){
                console.log("jin---navigateToMiniProgram fail")
            }
        })
    }

}
