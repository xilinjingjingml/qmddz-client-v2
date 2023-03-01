import { monitor } from "../../base/monitor"
import { storage } from "../../base/storage"
import TaskQueue from "../../base/TaskQueue"
import BaseView from "../../base/view/BaseView"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { GAME, GAME_TYPE } from "../../start/config"
import { appfunc } from "../appfunc"
import { FAKE_GIFT_KEY } from "../lobby"
import { checkSign } from "../sign/Sign"

const { ccclass } = cc._decorator

@ccclass
export default class PopupCtrl extends BaseView {

    start() {
        const queue = new TaskQueue(this.node)

        // if (!app.getOnlineParam("app_review") && app.datas.first == 1 && app.getOnlineParam("jump2game") && !app.datas.newUserPopShow) {
        if (app.datas.first == 1 && !app.datas.newUserPopShow) {
            monitor.once("server_status_update", () => {
                if (app.getOnlineParam("anti_review") === 1) {
                    this.checkAntiAddition(appfunc.showNewUserPop)
                } else {
                    appfunc.showNewUserPop()
                }
            })
            app.datas.isLeaveGame = false
            return
        } else if (app.getOnlineParam("anti_review") !== 2) {
            queue.add(this.checkAntiAddition, this)
        }

        if (this.params.openCallback) {
            this.params.openCallback()
            app.datas.isLeaveGame = false
            return
        }

        if (app.getOnlineParam("app_review") && !storage.get(FAKE_GIFT_KEY)) {
            storage.set(FAKE_GIFT_KEY, true)
            queue.add((next: Function) => appfunc.showFakeGiftdPop(next))
        }

        if (!app.getOnlineParam("app_review")) {
            queue.add(this.checkDaliySign, this)
        }

        if (app.getOnlineParam("app_review")) {
            if (appfunc.hasActivity()) {
                queue.add(this.checkActive, this)
            }
        } else if (app.datas.isLeaveGame) {
            queue.add(this.checkLottery, this)
        } else if (appfunc.hasActivity()) {
            queue.add(this.checkActive, this)
        } else {
            queue.add(this.checkLottery, this)
        }

        app.datas.isLeaveGame = false
        if (ads.isInitialized()) {
            queue.run()
        } else {
            monitor.once("ads_config_update", queue.run, queue)
        }
    }

    checkDailyGift(next: Function) {
        if (ads.checkCanReceive(ads.video.New_DailyGift)) {
            appfunc.showDailyGiftdPop(next)
            return
        }

        next()
    }

    checkActive(next: Function) {
        appfunc.showActivity(next)
    }

    checkLottery(next: Function) {
        if (ads.checkCanReceive(ads.video.New_HappyLottery)) {
            appfunc.showLotteryPop(next)
            return
        }

        next()
    }

    checkAntiAddition(next: Function) {
        // if (app.datas.querys["skipAnti"] === "true") {
        //     next()
        //     return
        // }
        if (appfunc.hasAntiAddition()) {
            next()
            return
        }
        appfunc.showAntiAddiction(next)
    }

    checkDaliySign(next: Function) {
        checkSign((can: boolean) => {
            can && appfunc.showSignPop(next)
        })
    }
}
