import { http } from "../base/http"
import { math } from "../base/math"
import { monitor } from "../base/monitor"
import { SocketManager } from "../base/socket/SocketManager"
import { storage } from "../base/storage"
import { time } from "../base/time"
import { ViewManager } from "../base/view/ViewManager"
import { report } from "../report"
import { ads } from "../start/ads"
import { app } from "../start/app"
import { GAME, GAME_TYPE, ITEM, s0, ShopBoxType } from "../start/config"
import { areas, nicknames } from "../start/constant"
import { startFunc } from "../start/startFunc"
import { urls } from "../start/urls"

export namespace appfunc {
    // 注册广告奖励弹窗
    monitor.on("ads_awards", showAwardPop)
    monitor.on("ads_loading_show", showAdLoading)
    monitor.on("ads_loading_hide", closeAdLoading)

    export function showCashOutPop(params?: any) {
        if (app.getOnlineParam("cashout_type", "SmallWithdrawal") == "SmallWithdrawal") {
            appfunc.showSmallWithdrawalPop(params)
            return
        }

        ViewManager.showPopup({ bundle: "lobby", path: "cashout/cashout", params: params })
    }

    export function showLotteryPop(closeCallback?: Function) {
        ViewManager.showPopup({ bundle: "lobby", path: "lottery/lottery", params: { closeCallback: closeCallback } })
    }

    export function showAntiAddiction(closeCallback?: Function) {
        ViewManager.showPopup({ bundle: "lobby", path: "antiAddiction/antiAddiction", params: { closeCallback: closeCallback } })
    }

    export function showTomorrowPop() {
        ViewManager.showPopup({ bundle: "lobby", path: "tomorrow/tomorrow" })
    }

    export function showServerPop(type: number) {
        ViewManager.showPopup({ bundle: "lobby", path: "server/server", params: { type: type } })
    }

    export function showAwardPop(awards: IAward[], closeCallback?: Function) {
        ViewManager.showPopup({ bundle: "lobby", path: "awards/awards", params: { awards: awards, closeCallback: closeCallback } })
    }

    export function showAdsAwardPop(params: { index: number, number: number, adindex: number }) {
        ViewManager.showPopup({ bundle: "lobby", path: "adsaward/adsaward", params: params })
    }

    export function showProtocolPop(type: number) {
        ViewManager.showPopup({ bundle: "lobby", path: "protocol/protocol", params: { type: type } })
    }

    export function showBindingPop() {
        ViewManager.showPopup({ bundle: "lobby", path: "binding/binding" })
    }

    export function showReliefPop(params?: any) {
        ViewManager.showPopup({ bundle: "lobby", path: "relief/relief", params: params })
    }

    export function showNewUserPop() {
        ViewManager.showPopup({ bundle: "lobby", path: "newuser/newuser" })
    }

    export function showFakeGiftdPop(closeCallback?: Function) {
        ViewManager.showPopup({ bundle: "lobby", path: "fakegift/fakegift", params: { closeCallback: closeCallback } })
    }

    export function showDailyGiftdPop(closeCallback?: Function) {
        ViewManager.showPopup({ bundle: "lobby", path: "dailygift/dailygift", params: { closeCallback: closeCallback } })
    }

    export function showTreasurePop(closeCallback?: Function) {
        ViewManager.showPopup({ bundle: "lobby", path: "treasure/treasure", params: { closeCallback: closeCallback } })
    }

    export function showAdLoading(time: number = 20, showMask: boolean = false) {
        // app.user.switch_plugin = true
        ViewManager.showPopup({ bundle: "lobby", path: "AdLoading/AdLoading", mask: { show: showMask }, params: { time: time } })
    }

    export function showActivity(closeCallback: Function) {
        ViewManager.showPopup({ bundle: "lobby", path: "activity/activity", params: { closeCallback: closeCallback } })
    }

    export function showActivityBlessAward(params: any) {
        ViewManager.showPopup({ bundle: "lobby", path: "ActivityBless/award/award", params: params })
    }

    export function showSmallWithdrawalPop(params?: any) {
        ViewManager.showPopup({ bundle: "lobby", path: "SmallWithdrawalPop/SmallWithdrawalPop", params: params, openTween: cc.tween().set({ scale: 0.4 }).to(0.25, { scale: 1 }, { easing: "sineInOut" }) })
    }

    export function showSmallWithdrawalNotice(params?: any) {
        ViewManager.showPopup({ bundle: "lobby", path: "SmallWithdrawalPop/SmallWithdrawalNotice", params: params, openTween: cc.tween().set({ scale: 0.4 }).to(0.25, { scale: 1 }, { easing: "sineInOut" }) })
    }

    export function showBindZFBPop(params?: any) {
        ViewManager.showPopup({ bundle: "lobby", path: "BindZFB/BindZFBPop", params: params, openTween: cc.tween().set({ scale: 0.4 }).to(0.25, { scale: 1 }, { easing: "sineInOut" }) })
    }

    export function showBindZFBConfirmPop(params?: any) {
        ViewManager.showPopup({ bundle: "lobby", path: "BindZFB/BindZFBConfirmPop", params: params, openTween: cc.tween().set({ scale: 0.4 }).to(0.25, { scale: 1 }, { easing: "sineInOut" }) })
    }

    export function closeAdLoading() {
        // app.user.switch_plugin = false
        ViewManager.close("AdLoading")
    }

    export function getReliefLine() {
        if (app.datas.reliefStatus) {
            return app.datas.reliefStatus.reliefAwardCount
        }
        return 20000
    }

    export function gotoGame(params: any, server: IServerData) {
        if (server.ddz_game_type != GAME_TYPE.DDZ_BAIYUAN && !checkCanJoinNormalGame()) {
            return
        }

        app.datas.isLeaveGame = false
        app.runGameServer = server
        params.showTransition = false
        showAdLoading(-1, false)
        ViewManager.showScene(params)
    }

    export function gobackLobby(params?: any) {
        app.datas.isLeaveGame = true
        app.runGameServer = null
        app.datas.runGameDatas = null
        SocketManager.closeAll("lobby")
        ViewManager.showScene({ bundle: "lobby", path: "lobby", params: params })
    }

    let server_time_diff = 0 // 毫秒

    export function setServerTime(timestamp: number) {
        server_time_diff = Math.ceil(timestamp * 1000 - Date.now())
    }

    export function accurateTime(isNeedObj: boolean = false): any {
        const ms = Date.now() + server_time_diff
        if (isNeedObj) {
            return new Date(ms)
        }

        return Math.ceil(ms / 1000)
    }

    export function setUserData(data: Iproto_PlyLobbyData, items: Iproto_ItemData[], type?: string) {

        const money = Math.max(data.money, 0)
        app.user.setItemNum(ITEM.GOLD_COIN, money)
        app.user.updateItems(items)

        app.user.gift = data.gift
        app.user.money = money
        app.user.score = data.score
        if (type == "verity_ticket") {
            app.user.won = data.won
            app.user.lost = data.lost

            cc.sys.localStorage.setItem("games", app.user.won + app.user.lost)
        }
        app.user.money_rank = data.moneyRank
        app.user.won_rank = data.wonRank

        monitor.emit("user_data_update")
    }

    export function updateUserShopBox(boxtype: ShopBoxType) {
        const param = {
            boxtype: boxtype,
            pn: app.pn,
            version: app.version,
            imsi: "",
            uid: app.user.guid,
            flag: 20141212,
        }

        http.open(urls.SHOPITEMS, param, (err, res) => {
            if (res && res.sl) {
                for (let i = app.shopBoxs.length - 1; i >= 0; i--) {
                    if (app.shopBoxs[i].boxType == boxtype) {
                        app.shopBoxs.splice(i, 1)
                    }
                }

                for (const box of res.sl) {
                    box.boxType = boxtype
                    app.shopBoxs.push(box)
                }

                monitor.emit("shop_box_item_update", boxtype)
            }
        })
    }

    export function loadLotteryData(channel: number, callback?: () => any) {
        if (!app.datas.lottery) {
            app.datas.lottery = {}
        }

        if (app.datas.lottery[channel]) {
            callback && callback()
            return
        }

        http.open(urls.DIAL, {
            gameid: app.gameId,
            channel: channel,
            activityId: 10000 + app.gameId,
            uid: app.user.guid,
            sign: md5("uid=" + app.user.guid + "&key=8923mjcm0d089d"),
            pn: app.pn,
            taskid: 2
        }, (err, res: { list: ILotteryData[] }) => {
            if (res && (res.list || (res[0] && res[0].list))) {
                const data: ILotteryData[] = res.list || res[0].list

                for (const itr of data) {
                    if (itr.acItemNum == 0) {
                        itr.itemDesc = "谢谢参与"
                    } else if (itr.acItemIndex == ITEM.TO_CASH) {
                        itr.itemDesc = Math.floor(appfunc.toCash(itr.acItemNum)) + "元"
                    }
                }

                data.sort((a, b) => {
                    return a.acAutoId - b.acAutoId
                })
                data.forEach((v, i) => v.index = i)
                data.sort((a, b) => b.acAutoId - a.acAutoId)

                app.datas.lottery[channel] = data
                callback && callback()
            }
        })
    }

    export function receiveLotteryAward(channel: number, callback: (res) => any) {
        const param = {
            gameid: app.gameId,
            channel: channel,
            activityId: 10000 + app.gameId,
            uid: app.user.guid,
            sign: md5("uid=" + app.user.guid + "&key=8923mjcm0d089d"),
            pn: app.pn,
            taskid: ads.video.New_HappyLottery,
            pnum: 0
        }

        http.open(urls.DARW_DIAL, param, (err, res) => {
            callback(res)
        })
    }

    export function getCooldownTime(key: string, time: number = 90) {
        const lastOpTime = storage.get(key) || 0
        if (lastOpTime > 0) {
            return time - (accurateTime() - lastOpTime)
        }
        return 0
    }

    export function loadTomorrowData(callback?: () => any) {
        if (app.datas.TomorrowData) {
            callback && callback()
            return
        }

        http.open(urls.LOAD_TOMORROW_GIFT, { gameid: 1 }, (err, res) => {
            if (res && res.ret == 0) {
                app.datas.TomorrowData = res.list
                callback && callback()
            }
        })
    }

    export function loadTomorrowStatus(callback?: () => any) {
        http.open(urls.ACTIVE_ONCE_SIGN_INFO, {
            uid: app.user.guid,
            gameid: 1,
            ticket: app.user.ticket
        }, (err, res) => {
            if (res) {
                if (!res.tomorrowAward) {
                    res.tomorrowAward = []
                }

                const curday = res.ret == 0 ? res.list[0].signDay : 0
                res.enabled = curday < 7 || (curday == 7 && res.tomorrowAward.length > 0)

                app.datas.TomorrowStatus = res
                monitor.emit("tomorrow_status_update")
                callback && callback()
            }
        })
    }
    //防沉迷
    export function hasAntiAddition() {
        //1.本地存储信息
        console.log("jin---anti_addiction_valid: ", storage.get("anti_addiction_valid"))
        if (!storage.get("anti_addiction_valid")) {
            return false
        }
        return true
    }
    export function UpdateAntiAddition(idCard: string, realName: string, callback: Function) {
        http.open(urls.ANTI_ADDICTION, {
            idCard: idCard,
            realName: realName,
            uid: app.user.guid,
        }, (err, res) => {
            if (err) {
                console.log("jin---UpdateAntiAddition err: ", err)
            }

            if (res) {
                console.log("jin---UpdateAntiAddition res: ", res)
                if (res.ret == 0 && res.authenStatus == 0) {
                    startFunc.showToast(res.msg)
                    callback && callback(true)
                } else {
                    // startFunc.showToast(res.msg)
                    startFunc.showToast("实名认证失败，请确认您的实名信息是否有误！")
                    callback && callback(false)
                    return
                }
            }
        })
    }

    // 活动时间
    export function hasActivity(delayDay: number = 1) {
        const zone = appfunc.getActivityTimeZone()
        const now = Date.now()
        return now >= time.toTimeStamp(zone.begin).getTime() && now <= (time.toTimeStamp(zone.end).getTime() + delayDay * 24 * 60 * 60 * 1000)
    }

    // 活动时间
    export function getActivityTimeZone(): { begin: string, end: string } {
        return app.getOnlineParam("activity_time") ?? { begin: "20210123", end: "20210223" }
    }

    export function loadActivityGameRank(callback: Function, refresh?: boolean) {
        if (!refresh && app.datas.GameRank) {
            callback()
            return
        }

        const zone = getActivityTimeZone()
        http.open(urls.LOAD_GAME_NUM, {
            pid: app.user.guid,
            ticket: app.user.ticket,
            beginDate: zone.begin,
            endDate: zone.end,
        }, (err, res) => {
            if (res) {
                app.datas.GameRank = res
                callback()
            }
        })
    }

    export function randomArea(uid?: any) {
        if (uid != null) {
            return areas[parseInt(uid) % areas.length]
        }
        return areas[Math.floor(math.randomSeed() * areas.length)]
    }

    export function randomName(maxlen?: number) {
        const name = nicknames[Math.floor(math.randomSeed() * nicknames.length)]
        if (maxlen != null && name.length > maxlen) {
            return name.substring(0, maxlen) + "..."
        }
        return name
    }

    export function loadExchangeConfig(callback?: () => any) {
        http.open(urls.DUIHUANCONFIG, {
            pn: app.pn,
            sign: md5("pn=" + app.pn + "&key=6wFKBS5y6a0B"),
            uid: app.user.guid,
            ticket: app.user.ticket,
            gameid: app.gameId
        }, (err, res) => {
            if (res && res.ret == 0) {
                const datas = []
                for (const itr of res.list) {
                    if (app.datas.regtime >= (itr.limitRegTime || 0)) {
                        datas.push(itr)
                    }
                }

                app.datas.ExchangeInfo = datas

                callback && callback()
                monitor.emit("exchange_info_update")
            }
        })
    }

    export function getMobileState(callback?: () => any) {
        http.open(urls.MOBILE_STATUS, {
            pn: app.pn,
            pid: app.user.guid,
            ticket: app.user.ticket,
            version: app.version
        }, (err, res) => {
            if (res) {
                app.datas.bindPhone = { hasBindMoble: res.ret, BindPhone: res.phone }
            }
            callback && callback()
        })
    }

    export function exchangeAward(goodsId: number, callback?: () => any, addressId?: number) {
        http.open(urls.DUIHUAN, {
            uid: app.user.guid,
            gameid: app.gameId,
            goodsId: goodsId,
            ticket: app.user.ticket,
            pn: app.pn,
            sign: md5("pn=" + app.pn + "&key=6wFKBS5y6a0B"),
            app_id: "",
            open_id: app.user.imei,
            addressId: addressId != null ? addressId : ""
        }, (err, res) => {
            if (res && res.ret == 0) {
                reloadUserData()
                startFunc.showToast(res.msg)
                callback && callback()
                loadExchangeConfig()
            } else if (res && res.ret == -6) {
                startFunc.showToast("30秒内仅可以兑换一次!")
            } else {
                startFunc.showToast(res ? res.msg : "兑换失败")
            }
        })
    }

    const items = {
        [ITEM.GOLD_COIN]: { name: "金豆", hasicon: true },
        [ITEM.CARD_RECORD]: { name: "记牌器", hasicon: true },
        [ITEM.REDPACKET_TICKET]: { name: "福卡", hasicon: true },
        [ITEM.SUPER_JIABEI]: { name: "超级加倍卡", hasicon: true },
        [ITEM.VIP_EXP]: { name: "VIP经验", hasicon: true },
        [ITEM.LOOK_LORDCARD]: { name: "看底牌卡", hasicon: true },
        [ITEM.TO_CASH]: { name: "红包", hasicon: true },
        [ITEM.FREE_LOSE]: { name: "免扣符", hasicon: true },
        [ITEM.INGOT]: { name: "元宝", hasicon: true },
    }

    export function getItemIconInfo(index: number) {
        if (items[index] && items[index].hasicon) {
            return { bundle: "lobby", path: "common/icons/icon_" + index }
        }

        return null
    }

    export function getItemName(index: number) {
        if (items[index] && items[index].name) {
            return items[index].name
        }

        return ""
    }

    export function loadUserRole(callback?: () => any) {
        http.open(urls.GET_USER_ROLE, {
            pid: app.user.guid,
            flag: "lobby",
            sgtype: "f33",
            ticket: app.user.ticket,
            pn: app.pn,
            versioncode: 14042902,
            version: app.version,
            gameid: app.gameId,
            token: md5("uid=" + app.user.guid + "&key=232b969e8375")
        }, (err, res) => {
            if (res) {
                app.datas.role = res
                try {
                    const info = JSON.parse(res.userInfo)
                    app.datas.bindReward = info.bindReward
                    if (info.ret == 1) {
                        app.datas.bindPhone = { hasBindMoble: 1, BindPhone: info.phone }
                    }
                } catch (e) { }

                // TODO parseMonthCardData

                app.datas.firstPayBox = JSON.parse(res.firstPayBox)
                monitor.emit("user_role_update")
                callback && callback()
            }
        })
    }

    function filterServers(gameid: number, gametype?: number, level?: number) {
        const all = app.servers.get(gameid)
        if (!all) {
            return null
        }

        const user_money = app.user.getItemNum(ITEM.GOLD_COIN)
        const canUseNewbieMode = (app.datas.role.roundSum < 4) && (accurateTime() - app.datas.regtime < 7200)

        const servers = all.filter((s) => {
            if (level != null && s.level != level) {
                return false
            }

            if (s.newbieMode == 1 && !canUseNewbieMode) {
                return false
            }

            if (gameid == GAME.DDZ && gametype != null && s.ddz_game_type != gametype) {
                return false
            }

            // if (s.lc_room_mode == 1 || s.lc_room_mode == 2) {
            if (s.lc_room_mode != 3) {
                return false
            }

            if (user_money < s.minMoney) {
                return false
            }

            if (s.maxmoney != null && user_money > s.maxmoney) {
                return false
            }

            return true
        })

        servers.sort((s1, s2) => {
            if (s1.ddz_game_type != null && s2.ddz_game_type != null && s1.ddz_game_type != s2.ddz_game_type) {
                return s1.ddz_game_type < s2.ddz_game_type ? -1 : 1
            }
            return s1.level < s2.level ? -1 : s1.level > s2.level ? 1 : 0
        })

        if (servers.length != 0) {
            if (level == null) {
                const minlevel = servers[0].level

                const higher = servers.filter((s) => {
                    return s.level > minlevel && user_money > s.minMoney * 1.5
                })

                if (higher.length != 0) {
                    return higher
                }
            }
            return servers
        }

        return null
    }

    export function chooseServer(gameid: number, gametype?: number, level?: number) {
        const servers = filterServers(gameid, gametype, level)
        if (servers) {
            return servers[Math.floor(Math.random() * servers.length)]
        }
        return null
    }

    export function startGame(gameid: number, gametype?: number, level?: number) {
        const server = chooseServer(gameid, gametype, level)

        if (gametype && gametype != GAME_TYPE.DDZ_BAIYUAN && !checkCanJoinNormalGame()) {
            return
        }

        if (server) {
            gotoGame({ bundle: "ddz", path: "game" }, server)
            // report("开始游戏", "进入游戏")
        } else {
            // startFunc.showToast("没有合适的游戏场次！")            
            monitor.once("server_status_update", () => {
                startGame(gameid, gametype, level)
            })
            monitor.emit("reget_game_list")
            report("开始游戏", "没有合适场次")
        }
    }

    export function gobackGame(gameId: number, serverId: number) {
        const servers = app.servers.get(gameId)
        if (servers) {
            for (const server of servers) {
                if (server.serverId == serverId) {
                    gotoGame({ bundle: "ddz", path: "game" }, server)
                    return
                }
            }
        }

        startFunc.showToast("没有找到游戏场次！")
    }

    export function loadReliefStatus(type: number = 0) {
        SocketManager.send<Iproto_cl_check_relief_status_req>("lobby", "proto_cl_check_relief_status_req", { type: type })
    }

    export function reloadUserData() {
        monitor.emit("reload_user_data")
    }

    export function checkCanJoinNormalGame() {
        if (app.getOnlineParam("app_review")) {
            return true
        }

        const left = app.getOnlineParam("NormalGame_round_lock", 50) - app.datas.role.roundSum
        if (left > 0) {
            startFunc.showToast(`还需要在${appfunc.toCash(appfunc.CASH_OUT_NUM)}元提现赛玩${left}局游戏才可畅玩福卡场`)
            return false
        }
        return true
    }

    export function kickout() {
        SocketManager.closeAll()
        cc.game.emit("main_active", true)
        startFunc.showConfirm({
            content: "您的帐号已在其他地方登录\n是否需要重新登录？",
            showClose: false,
            confirmText: "重新登录",
            confirmFunc: () => app.login(),
            buttonNum: 1,
        })
    }

    export function getTaskList(type: number) {
        SocketManager.send<Iproto_cl_get_at_achieve_list_req>("lobby", "proto_cl_get_at_achieve_list_req", { type: type })
    }

    export function getTaskAward(gameId: number, index: number, double?: boolean) {
        SocketManager.send<Iproto_cl_get_at_achieve_award_req>("lobby", "proto_cl_get_at_achieve_award_req", {
            gameId: gameId,
            index: index,
            type: double ? 1 : 0,
        })
    }

    /**
     * 提现数量
     */
    export const CASH_OUT_NUM = 88800
    export const SMAILL_CASH_OUT_NUM = 3000

    export function toCash(n: number) {
        return math.div(n, 100)
    }

    export function toFuCard(n: number) {
        return math.div(n, 10000)
    }

    export function showWebview(params?: any) {
        ViewManager.showPopup({ bundle: "lobby", path: "setting/webview", params: params })
    }

    export function showSignPop(closeCallback?: Function) {
        ViewManager.showPopup({ bundle: "lobby", path: "sign/sign", params: { closeCallback: closeCallback } })
        // ViewManager.showPopup({ bundle: "ddz", path: "JiasutixianPop/JiasutixianPop", params: {} })
    }

    
    export function sign0(p: any) {
        let s = ""
        for (let k in p) {
            s += (["flag"].includes(k) ? "" : (s.length ? "&" : "") + k + "=" + p[k])
        }
        s += "&key=" + s0
        return md5(s)
    }

}

let consoleError = window.console.error
window.console.error = (...args: any[]) => {
    consoleError && consoleError.apply(window, args);
    report("error", JSON.stringify(args))
}

let ccerror = cc.error
cc.error = (...args: any[]) => {
    ccerror && ccerror.apply(window, args);
    report("error", JSON.stringify(args))
}