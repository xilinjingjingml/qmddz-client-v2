import { http } from "../../../base/http"
import { listen, monitor } from "../../../base/monitor"
import { storage } from "../../../base/storage"
import { time } from "../../../base/time"
import BaseView from "../../../base/view/BaseView"
import { ads, EAdMethod } from "../../../start/ads"
import { app } from "../../../start/app"
import { startFunc } from "../../../start/startFunc"
import { urls } from "../../../start/urls"
import { appfunc } from "../../appfunc"

const { ccclass } = cc._decorator

export interface IBlessRecordData { uid: number, time: number, value: number, ad: boolean }

@ccclass
export default class ActivityBless extends BaseView {
    firstPop: boolean = true

    start() {
        if (!appfunc.hasActivity()) {
            this.$("label_time", cc.Label).string = "00:00:00"
            this.$("node_get").active = false
            return
        }

        const date = Math.floor(time.zero().getTime() / 1000) + 24 * 60 * 60
        const next = () => {
            this.$("label_time", cc.Label).string = time.format("hh:mm:ss", date - Math.floor(Date.now() / 1000) + new Date().getTimezoneOffset() * 60)
        }
        next()
        this.schedule(next, 1)

        this.reloadData()
    }

    @listen("activity_sign_reload")
    reloadData(refresh?: boolean) {
        appfunc.loadActivityGameRank(() => {
            if (this.isValid) {
                monitor.emit("activity_bless_update")
                this.refreshView()
            }
        }, refresh)
    }

    refreshView() {
        if (this.firstPop) {
            this.firstPop = false
            const showAward = checkBlessAward()
            if (showAward != null) {
                if (showAward == false) {
                    storage.setToday("bless_award", true)
                    monitor.emit("activity_bless_update")
                }
                appfunc.showActivityBlessAward({ award: showAward })
            }
        }

        const leftTime = ads.getVideoCurTimes(ads.video.ActivityBless)
        if (leftTime == 0) {
            this.$("label_times", cc.Label).string = "祈福获得幸运值可参与瓜分奖池"
        } else if (leftTime == 1) {
            this.$("label_times", cc.Label).string = "首次必得今日更大幸运值"
        } else {
            this.$("label_times", cc.Label).string = `今日剩余祈福次数：${ads.getVideoLeftTimes(ads.video.ActivityBless)}次`
        }

        // 幸运值
        this.$("lable_max_bless", cc.Label).string = "" + app.datas.GameRank.blessing

        // 奖池数字
        const value = (Array(8).join("0") + app.datas.GameRank.blessingTotal).slice(-8)
        this.$("node_pool_layout").children.forEach((child, i) => child.getComponent(cc.Label).string = value[i])

        // 祈福按钮
        const adMethod = ads.nextMethod(ads.video.ActivityBless)
        this.$("btn_get").active = adMethod == EAdMethod.Free
        this.$("btn_get_ad").active = adMethod == EAdMethod.Video
    }

    blessAward(ad: boolean) {
        this.$("node_get").active = false

        http.open(urls.ACTIVE_BLESS_INFO, {
            uid: app.user.guid,
            ticket: app.user.ticket,
            gameId: app.gameId,
            flag: 0,
        }, (err, res: { ret: number, blessing: number, blessingTotal: 0, itemIndex: number, itemNum: number }) => {
            cc.log("ActivityBless.onPressGet", res)
            if (!this.isValid) {
                return
            }

            if (res && res.ret == 0) {
                const spine = this.$("spine", sp.Skeleton)
                spine.setAnimation(0, "dong", false)
                spine.setCompleteListener(() => {
                    spine.setCompleteListener(null)
                    if (this.isValid) {
                        spine.setAnimation(0, "jing", true)
                        this.onGetAward(res, ad)
                    }
                })
            } else {
                startFunc.showToast("祈福失败！")
            }
        })
    }

    onGetAward(res: { ret: number, blessing: number, blessingTotal: 0, itemIndex: number, itemNum: number }, ad: boolean) {
        this.$("node_get").active = true

        const datas: IBlessRecordData[] = storage.getToday("bless_record") || []
        datas.push({ uid: app.user.guid, time: Date.now(), value: res.blessing, ad: ad })
        storage.setToday("bless_record", datas)

        startFunc.showConfirm({
            title: "幸运值",
            content: `恭喜您本次祈福获得幸运值\n\n<color=#ff7425><b>${res.blessing}</b></c>`,
            contentFontSize: 40,
            buttonNum: 1,
            confirmFunc: () => appfunc.showAwardPop([{ index: res.itemIndex, num: res.itemNum }])
        })

        if (res.blessing > app.datas.GameRank.blessing) {
            app.datas.GameRank.blessing = res.blessing
            this.reloadData(true)
        }

        app.datas.GameRank.blessingTotal = res.blessingTotal
        this.refreshView()
    }

    onPressGet(event: cc.Event.EventTouch, data: string) {
        ads.receiveAward({
            index: ads.video.ActivityBless,
            success: () => this.blessAward(data == "2")
        })
    }
}

const awardConfigs = [
    { begin: 1, end: 1, award: 20 },
    { begin: 2, end: 2, award: 10 },
    { begin: 3, end: 3, award: 5 },
    { begin: 4, end: 10, award: 1 },
    { begin: 11, end: 50, award: 0.2 },
    { begin: 51, end: 100, award: 0.02 },
]

export function getAwardByRank(rank: number) {
    for (const config of awardConfigs) {
        if (rank >= config.begin && rank <= config.end) {
            return config.award
        }
    }

    return 0
}

function checkBlessAward() {
    if (app.datas.GameRank.blessingYesterdayRank.length > 0) {
        if (app.datas.GameRank.blessingRank > 0) {
            // blessingRankAward 领过变1 没领没有
            if (!app.datas.GameRank.blessingRankAward) {
                return true
            }
        } else {
            if (!storage.getToday("bless_award")) {
                return false
            }
        }
    }
}

export function checkBless(callback: (can: boolean) => void) {
    appfunc.loadActivityGameRank(() => callback(checkBlessAward() != null))
}
