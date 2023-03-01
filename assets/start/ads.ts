import { http } from "../base/http"
import { monitor } from "../base/monitor"
import { report, reportParam } from "../report"
import { app } from "./app"
import { ITEM, s1 } from "./config"
import { AppNative } from "./scripts/platforms/AppNative"
import { startFunc } from "./startFunc"
import { urls } from "./urls"

/**
 * 广告展现方式
 */
export enum EAdType {
    Banner,    // banner
    Inter,     // 插屏
    Video,     // 激励
}

export enum EAdMethod {
    Free = 0,      // 免费领取
    Share = 1,     // 分享领取
    Video = 2,     // 视频领取
}

export namespace ads {
    let initialized = false

    export const video = {
        Default: -1,

        SignPop: 1,                  // 签到处
        // FreeDrawPop: 2,              // 免费抽奖
        BankruptDefend: 3,           // 低保
        // DrawQtt: 5,                  // 免费趣金币
        // DrawGold: 6,                 // 免费金豆
        // NationalDayPop: 7,           // 双十一回馈
        // Double11ActivePop: 8,        // 双十一嘉年华
        CardNoteBuyPop: 11,          // 记牌器
        // GodOfWealth: 12,             // 拜财神第一次
        // VipExp: 15,                  // 看视频领VIP
        Wages: 16,                   // 每日工资
        TreasureHunt: 17,            // 寻宝
        Exemption: 18,               // 对局免输
        // DrawGameRp: 19,              // 再次抽红包
        DrawDiamond: 20,             // 领取钻石
        DrawRp: 21,                  // 免费红包
        DynamicGold: 22,             // 动态金豆
        LookLordCard: 23,            // 优先看底牌
        // WxShare: 24,                 // 分享战绩
        // WxFavorite: 25,              // 我的小程序进游戏
        // WinGetSingle: 26,            // 斗地主胜利后单倍获取福卡
        // WinGetMutiple: 27,           // 斗地主胜利后多倍获取福卡
        // NewbieRedpacket: 28,         // 新人前n局得福卡
        DrawRedpacket: 29,           // 抽奖得福卡
        TomorrowChoose: 30,          // 明日有礼选择抽取
        TomorrowGetMutiple: 31,      // 明日有礼领取奖励
        DoubleCard: 32,              // 超级加倍卡
        // LookCard: 33,                // 商城获取看底牌
        // Highlight: 34,               // 分享高光时刻
        // LotteryShare: 35,            // 转盘分享
        // InviteWxFriend: 36,          // 定向邀请微信好友
        // MonthCardAward: 37,          // 月卡奖励
        // WeekCardAward: 38,           // 周卡奖励
        // RegainLoseBonus: 39,         // 对局免输额外道具奖励
        WinDouble: 41,               // 赢金翻倍
        // ShareMoneyTask: 42,          // 分享赚钱分享任务
        ActivityBless: 43,              // 祈福
        ActivitySign: 45,               // 新年签到
        SmallWithdrawal: 46,            // 小额提现

        // CombinedOffline: 60,         // 合成离线收益 
        // CombinedSpeeding: 61,        // 合成加速 
        // CombinedLucky: 62,           // 合成宝箱奖励 
        // CombinedFreeShop: 63,        // 合成免费商品 
        // CombinedUnenough: 64,        // 合成银币不足 
        // CombinedLottery: 65,         // 合成中转盘 
        // CombinedLvRp: 66,            // 合成提升红包等级
        // CombinedExtLv: 67,           // 建筑额外升级

        New_DailyGift: 100,          // 每日礼包
        New_HappyLottery: 101,       // 开心转盘
        New_FreeRedPacket: 102,      // 免费红包
        New_NextLoseZero: 103,       // 下局输分免扣
        New_WinDouble: 104,          // 结算-赢分加倍
        New_RegainLose: 105,         // 结算-追回损失
        New_LuckyGift: 106,          // 结算-幸运福利
        New_GameRedPacket: 107,      // 三局开红包
        New_BankruptDefend: 108,     // 破产补助
        New_EarlyGain: 109,          // 提现加速
        // New_CardNote: 110,           // 结算看视频得记牌器

        Free_Ingot: 47,     // 免费元宝
        Jiasutixian: 48,    // 加速提现
        JinLiFuLi: 49,      // 锦鲤福利
        Jiasutixian2: 50,    // 加速提现2
        Jiasutixian3: 51,    // 加速提现3
    }

    export const banner = {
        All: -1,
    }

    export const awards = {
        [video.DynamicGold]: { index: ITEM.GOLD_COIN, number: -1, adindex: video.DynamicGold },
        [video.DrawRp]: { index: ITEM.REDPACKET_TICKET, number: -1, adindex: video.DrawRp },
        [video.CardNoteBuyPop]: { index: ITEM.CARD_RECORD, number: 5, adindex: video.CardNoteBuyPop },
    }

    const config: IAdData = {
        videos: {},
        banners: {},
    }

    export function isInitialized() {
        return initialized
    }

    export function loadAdConfig() {
        http.open(urls.AD_CONFIG, {
            pid: app.user.guid,
            ticket: app.user.ticket
        }, (err, res) => {
            if (err || !res?.adConfig) {
                return
            }

            const videos = config.videos

            for (const cfg of res.adConfig) {
                const id = cfg.ca_ad_area
                let total: number = cfg.award && cfg.award[0] ? cfg.award[0].ca_award_num : 0

                if (id == video.Wages || id == video.SignPop || id == video.New_DailyGift) {
                    total = 1
                }

                videos[id] = { total: total, count: 0, method: 2, canfree: true }

                if (id == video.Wages) {
                    const awardConfig = {}
                    for (const t of cfg.award) {
                        if (!awardConfig[t.ca_sequence]) {
                            awardConfig[t.ca_sequence] = []
                        }
                        awardConfig[t.ca_sequence].push({ index: t.ca_award_index, num: t.ca_award_num })
                    }
                    app.datas.VipAwardConfig = awardConfig
                }
            }

            if (res.adCnt) {
                for (const itr of res.adCnt) {
                    if (videos[itr.ua_ad_area_id]) {
                        videos[itr.ua_ad_area_id].count = itr.ua_ad_times
                    }
                }
            }

            const adConfig = app.getOnlineParam("adConfig")
            if (adConfig) {
                for (const k in adConfig) {
                    if (videos[k]) {
                        const c = adConfig[k]

                        videos[k].method = c.method
                        videos[k].canfree = !!c.canfree
                    }
                }
            }

            app.datas.adTotal = res.adTotal
            app.datas.adToday = app.datas.adToday || 0
            app.datas.byLevel = res.byLevel
            app.datas.cashStatus = res.cashStatus?.[0] || {}
            app.datas.cashTask = res.cashTask || {}

            initialized = true
            monitor.emit("ads_config_update")

            let ap = app.getOnlineParam("ad_preload")
            console.log("===ad_preload", JSON.stringify(ap))
            if (Array.isArray(ap) && ap.length > 0) {
                for (let id of ap) {
                    app.platform.preloadAdvert({ type: EAdType.Video, index: id })
                }
            }
        })
    }

    export function sign(p: any) {
        let s = ""
        for (let k in p) {
            s += (s.length ? "#" : "") + (k + "=" + p[k])
        }
        s += "#" + s1
        return md5(s)
    }

    export function getVideoData(index: number) {
        return config.videos[index] || null
    }

    export function getVideoLeftTimes(index: number) {
        if (config.videos[index]) {
            return config.videos[index].total > config.videos[index].count ? config.videos[index].total - config.videos[index].count : 0
        }
        return 0
    }

    export function getVideoCurTimes(index: number) {
        if (config.videos[index]) {
            return config.videos[index].count
        }
        return 0
    }

    export function getVideoAllTimes() {
        let count = 0
        for (const index in config.videos) {
            const data = config.videos[index]
            if (data && data.count) {
                count += data.count
            }
        }
        return count
    }

    export function checkCanReceive(index: number) {
        if (config.videos[index]) {
            return config.videos[index].total > config.videos[index].count
        }
        return false
    }

    export function isFreeAdvert() {
        // TODO isFreeAdvert
        return false
    }

    export function nextMethod(index: number) {
        const data = config.videos[index] || null
        if (data) {
            const method = Array.isArray(data.method) ? data.method[data.count] : data.method
            if (method != null) {
                if (method == EAdMethod.Video && data.canfree) {
                    return isFreeAdvert() ? EAdMethod.Free : EAdMethod.Video
                }
                return method
            }
        }
        return EAdMethod.Video
    }

    function requestAward(index: number, order: any, ecpm: number, success: (res: any) => void) {
        report("广告奖励", "请求奖励", index)
        let getAward = (ingot: number) => {
            http.open(urls.GET_AD_AWARD, {
                pid: app.user.guid,
                ticket: app.user.ticket,
                gameid: app.gameId,
                taskInd: index,
                sign: md5("pid=" + app.user.guid + "&gameid=" + app.gameId + "&key=abcd123321efgh"),
                signDay: 0
            }, (err, res) => {
                if (res) {
                    if (res.ret == 0) {
                        res.ingot = ingot
                        report("广告奖励", "获取奖励", index)
                        app.datas.adTotal++
                        success(res)
                    } else if (res.ret == -4) {
                        // TODO checkPhoneBinding()
                        report("广告奖励", "奖励失败-4", index)
                    } else {
                        startFunc.showToast(res.msg)
                        report("广告奖励", "奖励失败" + res.msg, index)
                    }
                }
            })
        }
        finishAdOrder(order, ecpm, (res) => getAward(res.itemNum || 0))
    }

    export function receiveAward(opt: IAdsReceiveOpt) {
        report("广告", "请求广告", opt.index)
        if (!checkCanReceive(opt.index)) {
            startFunc.showToast("您今日的奖励次数已用完，请明天再来！")

            report("广告", "次数已用完", opt.index)
            return
        }

        const method = opt.method ?? nextMethod(opt.index)

        const receive = function (ecpm?: any) {
            ecpm = Number.parseInt(ecpm)

            let ecpmReport = app.getOnlineParam("ecpm_report") || []
            let subs = app.pn.split(".")
            let id = Number(subs[subs.length - 1])
            if (isNaN(id)) id = 0
            ecpmReport = ecpmReport[id]
            let local = JSON.parse(cc.sys.localStorage.getItem("ad_record") || "{}")
            if (!local.report && Array.isArray(ecpmReport)) {
                local.record = local.record || []
                ecpmReport.sort((a, b) => a.count < b.count ? -1 : a.count > b.count ? 1 : a.ecpm > b.ecpm ? -1 : 1)
                for (let i of ecpmReport) {
                    if (!local.record[i.id]) {
                        local.record[i.id] = {}
                        local.record[i.id].count = 1
                        local.record[i.id].ecpm = ecpm >= i.ecpm ? 1 : 0
                    } else {
                        local.record[i.id].count++
                        ecpm >= i.ecpm && local.record[i.id].ecpm++
                    }
                    if (local.record[i.id].count === i.acount && local.record[i.id].ecpm >= i.ecount) {
                        if (cc.sys.isNative) {
                            // let an = (app.platform as AppNative)
                            // if (an) {
                            //     an.uploadKuaiShou(143)
                            //     an?.logEvent("EVENT_KEY_PATH_OPTIMIZATION")
                            // }
                            (app.platform as AppNative).uploadKuaiShou(143)
                            // report("广告", `优质用户ID:${i.id}`, `ecpm:${i.ecpm}`, `adCount:${i.acount}`, `ecpmCount:${i.ecount}`)                            
                            reportParam({ ad0: i.id, ad1: i.ecpm, ad2: i.acount, ad3: i.ecount }, "广告", `优质用户`)
                            local.report = true
                            break
                        }
                    }
                }

                cc.sys.localStorage.setItem("ad_record", JSON.stringify(local))
            }

            // let adrecord = JSON.parse(cc.sys.localStorage.getItem("ad_record") || "{}")
            // if (!adrecord.report) {
            //     adrecord.adcount = adrecord.adcount ? adrecord.adcount + 1 : 1
            //     ecpm >= 10000 && (adrecord.ecpm0 = adrecord.ecpm0 ? adrecord.ecpm0 + 1 : 1)
            //     ecpm >= 6000 && (adrecord.ecpm1 = adrecord.ecpm1 ? adrecord.ecpm1 + 1 : 1)
            //     // 5次100的和8次60的
            //     if ((adrecord.adcount >= 5 && adrecord.ecpm0 >= 2) || (adrecord.adcount >= 8 && adrecord.ecpm1 >= 2)) {
            //         if (cc.sys.isNative) {
            //             (app.platform as AppNative).uploadKuaiShou(143)
            //             report("广告", "优质用户", JSON.stringify(adrecord))
            //             adrecord.report = true
            //         }
            //     }
            //     cc.sys.localStorage.setItem("ad_record", JSON.stringify(adrecord))
            // }


            reportParam({ ep: ecpm }, "广告", "播放完成", opt.index)
            requestAward(opt.index, opt.order, ecpm, (res) => {
                if (config.videos[opt.index]) {
                    config.videos[opt.index].count++
                }

                let awards: IAward[] = []

                if (res.ingot) {
                    awards.push({ index: ITEM.INGOT, num: res.ingot })
                }

                if (res.itemIndex != null && res.itemNum != null) {
                    awards.push({ index: res.itemIndex, num: res.itemNum })
                }
                
                if (opt.showAward || opt.showAward == null) {
                    // if (res.itemIndex != null && res.itemNum != null) {
                    //     awards.push({ index: res.itemIndex, num: res.itemNum })
                    // } else
                    if (opt.index == video.Wages) {
                        // TODO index == video.Wages
                        // const lv = DataManager.CommonData["VipData"] ? (DataManager.CommonData["VipData"].vipLevel || 0) : 0
                        // if (DataManager.CommonData.VipAwardConfig && DataManager.CommonData.VipAwardConfig[lv]) {
                        //     for (const award of DataManager.CommonData.VipAwardConfig[lv]) {
                        //         awards.push(award)
                        //     }
                        // }
                    } else if (res.awards) {
                        awards = res.awards
                    } else if (res.awardList) {
                        for (const a of res.awardList) {
                            awards.push({ index: a.ca_award_index, num: a.ca_award_num })
                        }
                    }

                    if (res.vipExp != null && res.vipExp > 0) {
                        awards.push({ index: ITEM.VIP_EXP, num: res.vipExp })
                    }

                    if (awards.length > 0) {
                        // TODO isFromDailyGift: adIndex == AdsConfig.taskAdsMap.New_DailyGift
                        monitor.emit("ads_awards", awards, opt.closeCallback)
                    }
                }

                res.awards = awards

                monitor.emit("reload_user_data")

                opt.success && opt.success(res)
                monitor.emit("ads_config_update")
            })
        }

        report("广告", "处理类型" + method, opt.index)
        let play = (transId) => {
            opt.order = transId
            if (method == EAdMethod.Free) {
                receive(-1)
            } else if (method == EAdMethod.Share) {
                const data = opt.shareData || {}
                data.callback = receive
                app.platform.sociaShare(data)
            } else {
                report("广告", "播放广告", opt.index)
                app.platform.openAdvert({
                    type: EAdType.Video,
                    index: opt.index,
                    transId: transId,
                    success: receive,
                })
            }
        }

        createAdOrder(opt.index, (transId) => play(transId))
    }

    export function openBanner(index: number) {
        app.platform.openAdvert({
            type: EAdType.Banner,
            index: index
        })
    }

    export function closeBanner(index?: number) {
        app.platform.closeAdvert({
            type: EAdType.Banner,
            index: index,
            closeAll: index === undefined
        })
    }

    export function openInter(index?: number) {
        app.platform.openAdvert({
            type: EAdType.Inter,
            index: index
        })
    }


    // https://t_statics.wpgame.com.cn/ad/order?pid=20000008&ticket=CC69B721B9A276FC71768294688099B5&ad_id=1
    // https://t_statics.wpgame.com.cn/ad/notify?pid=20000008&ticket=CC69B721B9A276FC71768294688099B5&trans_id=202210245507544980&ecpm=90
    function createAdOrder(adId: any, callback: Function) {
        report("广告订单", "创建订单", adId)
        let params = {
            pid: app.user.guid,
            ticket: app.user.ticket,
            aid: adId,
        }
        http.open(urls.CREATE_AD_ORDER, {
            pid: params.pid,
            ticket: params.ticket,
            ad_id: params.aid,
            sign: sign(params)
        }, (err, res) => {
            if (res) {
                if (res.ret == 0) {
                    callback?.(res.trans_id)
                    report("广告奖励", "创建成功")
                } else {
                    startFunc.showToast(res.msg)
                    report("广告奖励", "创建失败" + res.msg, adId)
                }
            }
        })
    }

    function finishAdOrder(transId, ecpm, callback: Function) {
        report("广告订单", "完成订单", transId)
        let params = {
            pid: app.user.guid,
            ticket: app.user.ticket,
            transId: transId,
            ecpm: ecpm,
        }
        http.open(urls.FINISH_AD_ORDER, {
            pid: params.pid,
            ticket: params.ticket,
            trans_id: params.transId,
            ecpm: ecpm,
            sign: sign(params)
        }, (err, res) => {
            if (res) {
                if (res.ret == 0) {
                    callback?.(res)
                    report("广告奖励", "获取奖励")
                } else {
                    res.msg = res.msg || "奖励领取失败"
                    startFunc.showToast(res.msg)
                    report("广告奖励", "完成失败" + res.ret, transId, ecpm)
                }
            }
        })
    }
}
