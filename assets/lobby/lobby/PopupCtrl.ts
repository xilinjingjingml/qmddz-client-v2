import { monitor } from "../../base/monitor"
import { storage } from "../../base/storage"
import TaskQueue from "../../base/TaskQueue"
import BaseView from "../../base/view/BaseView"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { appfunc } from "../appfunc"
import { FAKE_GIFT_KEY } from "../lobby"
import { time } from "../../base/time"

const { ccclass } = cc._decorator

@ccclass
export default class PopupCtrl extends BaseView {

    start() {
        //!app.getOnlineParam("app_review")
        if (!appfunc.checkSpecialAward() && app.datas.first == 1 && app.getOnlineParam("jump2game") && !app.datas.newUserPopShow) {
            monitor.once("server_status_update", () => {
                appfunc.showNewUserPop()
            })
            app.datas.isLeaveGame = false
            return
        }
        if (this.params.openCallback) {
            this.params.openCallback()
            app.datas.isLeaveGame = false
            return
        }


        const queue = new TaskQueue(this.node)
        //app.getOnlineParam("app_review")
        if (appfunc.checkSpecialAward() && !storage.get(FAKE_GIFT_KEY)) {
            //TODO 关闭新人礼包界面
            // storage.set(FAKE_GIFT_KEY, true)
            // queue.add((next: Function) => appfunc.showFakeGiftdPop(next))
        }

        //TODO 添加小游戏宣传页
        let stateOfTodayMiniGame = storage.get("MiniGame" + time.format("yyyy-mm-dd"))
        console.log("jin---stateOfTodayMiniGame: ", stateOfTodayMiniGame, time.format("yyyy-mm-dd"))

        if(app.getOnlineParam("Leaflet_game_picture") && app.getOnlineParam("Leaflet_game_appid")&& !stateOfTodayMiniGame && app.datas.morrow >= 3){
            queue.add(this.checkMiniGame, this)
        }

        if (!appfunc.checkSpecialAward() ) {//!app.getOnlineParam("app_review")
            queue.add(this.checkDailyGift, this)
        }

        if (appfunc.checkSpecialAward()) {app.getOnlineParam("app_review")
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
    
    checkMiniGame(next: Function){
        appfunc.showMiniGame(next)
    }
}
