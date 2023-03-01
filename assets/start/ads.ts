import { http } from "../base/http"
import { monitor } from "../base/monitor"
import { app } from "./app"
import { ITEM } from "./config"
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
    }

    export const banner = {
        All: -1,

        FuCardResult: 1, // 福卡结算
        AdsAward: 2,     // 广告奖励
        Awards: 3,       // 奖励获得
        FuCardBoard: 4,  // 三局抽福卡
        BaiYuanRelie: 5, // 破产补助
        treasure: 6      // 寻宝
    }

    export const awards = {
        [video.DynamicGold]: { index: ITEM.GOLD_COIN, number: -1, adindex: video.DynamicGold },
        [video.DrawRp]: { index: ITEM.REDPACKET_TICKET, number: -1, adindex: video.DrawRp },
        [video.CardNoteBuyPop]: { index: ITEM.CARD_RECORD, number: 4, adindex: video.CardNoteBuyPop },
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
            // console.log("jin---adConfig award:", res)
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

            initialized = true
            monitor.emit("ads_config_update")
        })
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

    function requestAward(index: number, success: (res: any) => void) {
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
                    success(res)
                } else if (res.ret == -4) {
                    // TODO checkPhoneBinding()
                } else {
                    startFunc.showToast(res.msg)
                }
            }
        })
    }

    export function receiveAward(opt: IAdsReceiveOpt) {
        if (!checkCanReceive(opt.index)) {
            startFunc.showToast("您今日的奖励次数已用完，请明天再来！")
            return
        }

        const method = opt.method ?? nextMethod(opt.index)

        const receive = function () {
            requestAward(opt.index, (res) => {
                console.log("jin---奖励标识：",res)
                if (config.videos[opt.index]) {
                    config.videos[opt.index].count++
                }

                if (opt.showAward || opt.showAward == null) {
                    let awards: IAward[] = []

                    if (res.itemIndex != null && res.itemNum != null) {
                        awards.push({ index: res.itemIndex, num: res.itemNum })
                    } else if (opt.index == video.Wages) {
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
                    console.log("jin---ads_awards open page: ", awards, opt)
                    if (awards.length > 0) {
                        // TODO isFromDailyGift: adIndex == AdsConfig.taskAdsMap.New_DailyGift
                        // console.log("jin---ads_awards: ", awards, opt)
                        monitor.emit("ads_awards", awards, opt.closeCallback)
                    }
                    console.log("jin---awards:", awards)
                }
                
                monitor.emit("reload_user_data")

                opt.success && opt.success(res)
                monitor.emit("ads_config_update")
            })
        }

        if (method == EAdMethod.Free) {
            receive()
        } else if (method == EAdMethod.Share) {
            const data = opt.shareData || {}
            data.callback = receive
            app.platform.sociaShare(data)
        } else {
            app.platform.openAdvert({
                type: EAdType.Video,
                index: opt.index,
                success: receive,
            })
        }
    }

    export function openBanner(index: number, success:Function ) {
        app.platform.openAdvert({
            type: EAdType.Banner,
            index: index,
            success: success
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
}
