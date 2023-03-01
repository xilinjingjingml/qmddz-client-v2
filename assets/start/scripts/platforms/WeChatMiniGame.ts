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
    Video: "adunit-efe436952d2ef6fc",
    Banner: "adunit-7bd52837ae07ea68",
    Inter: "adunit-5a57b7b03655a08b",
    // Grid: "adunit-b016cf057deb6a4c"
}

const AdvertErr = [1000, 1003, 1004, 1005]
const AdvertFreqErr = [2001, 2002, 2003, 2004, 2005]
const KEY_OPEN_ID = "WX_USER_OPENID"

const adapt = { screen: null, design: null, ratio: 1, width: 0, height: 0 }

export class WeChatMiniGame extends Platform {

    wxOpenId: string = null
    wxUserInfo: any = null
    wxScene: number = 0
    wxQuery: any = null

    video: { [adindex: string]: string } = {}
    advertVideo: { [unitid: string]: IWxVideo } = {}

    banner: { [adindex: string]: string } = {}
    advertBanner: { [unitid: string]: IWxBanner } = {}

    inter: { [adindex: string]: string } = {}
    advertInter: { [unitid: string]: IWxInter } = {}

    init() {
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
            this.code2Session((err) => {
                err ? monitor.emit("platform_login_fail", "GetOpenId:" + err) : onGetOpenId()
            })
        }

        !this.wxOpenId ? getOpenId() : this.checkSession((isValid) => {
            isValid ? onGetOpenId() : getOpenId()
        })
    }

    loginGame() {
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

            monitor.emit("platform_login_success")
        })
    }

    code2Session(callback: (error: string) => any) {
        wx.login({
            success: (res) => {
                http.open(urls.GET_WX_OPENID, {
                    appid: app.wxAppID,
                    jscode: res.code
                }, (err, res) => {
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

    // wx.showShareMenu >= 1.1.0
    showShareMenu() {
        wx.showShareMenu && wx.showShareMenu({ withShareTicket: false })

        wx.onShareAppMessage(() => {
            return {
                title: "",
                imageUrl: "",
                query: "a=1&b=2"
            }
        })
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
            this.wxQuery = res.query
            this.wxScene = res.scene

            // this.showInter(UnitId.Inter)
        })

        if (wx.onShareMessageToFriend) {
            wx.onShareMessageToFriend((res) => {
                monitor.emit("share_friend_result", res.success)
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
                data: text,
                success: () => startFunc.showToast("复制成功"),
                fail: () => startFunc.showToast("复制失败")
            })
        }
    }

    initAdsdata() {
        const adConfig = app.getOnlineParam("adConfig")
        if (adConfig) {
            const regtime = app.datas.regtime
            for (const adindex in adConfig) {
                const extra = adConfig[adindex].extra
                if (extra) {
                    const unitid = (regtime >= extra.sp ? extra.tv : extra.fv) || UnitId.Video

                    if (extra.preload) {
                        this.createVideo(unitid)
                    }

                    this.video[adindex] = unitid
                }
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

        wx.showLoading({ title: "广告加载中", mask: true })

        advert.instance.load()
            .then(() => {
                advert.instance.show()
                    .then(wx.hideLoading)
                    .catch((res) => {
                        console.error("视频广告显示", res)
                        wx.hideLoading()
                    })
            })
            .catch(wx.hideLoading)
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
                    width: 300
                }
            })

            instance.onError((res) => {
                console.error("Banner广告" + unitid, res)
                if (AdvertErr.indexOf(res.errCode) !== -1) {
                    instance.valid = false
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
            const advert = this.createBanner(unitid || UnitId.Banner)
            if (advert) {
                advert.ref--
                if (advert.ref <= 0) {
                    advert.ref = 0
                    advert.instance.hide()
                }
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

    openAdvert(params: { type: EAdType, index?: number, success?: Function }) {
        if (params.type == EAdType.Video) {
            this.showVideo(this.video[params.index], (result: AdsResult) => {
                if (result == AdsResult.Success) {
                    params.success && params.success()
                } else if (result == AdsResult.Cancel) {
                    startFunc.showToast("完整观看广告视频才可以领取奖励哦")
                } else {
                    startFunc.showToast("广告视频播放失败")
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
}