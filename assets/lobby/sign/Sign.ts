import { audio } from "../../base/audio"
import { http } from "../../base/http"
import { listen, monitor } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { urls } from "../../start/urls"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

const CHANNEL = 3
const DRAW_TIME_KEY = "last_draw_time"

@ccclass
export default class Lottery extends BasePop {

    data: any = {}
    adIndex: number = 0
    isBusy: boolean = false
    zeroIdx: number = -1

    start() {
        this.adIndex = ads.video.SignPop

        cc.tween(this.$("main")).set({ scale: 0 }).to(0.3, { scale: 1 }, { easing: "sineInOut" }).start()

        loadActivitySignConfig(() => {
            this.isValid && this.reloadData()
        })

        this.updateUserItem()
    }

    reloadData() {
        loadActivitySignInfo(() => {
            if (this.isValid) {
                monitor.emit("activity_sign_update")
                this.refreshView()
            }
        })
    }

    refreshView() {
        const hasActivity = appfunc.hasActivity()
        const status = getSignStatus()
        const datas = app.datas.ActivitySignConfig
        this.data = datas[status.curday].itemConfig

        const content = this.$("sign_content")
        const item = this.$("sign_item")
        datas.forEach((data, i) => {
            let node = content.children[i]
            if (!node) {
                node = cc.instantiate(item)
                node.active = true
                node.parent = content
            }
            let days = this.$("day" + i)

            if (days) {
                for (let j of data.itemConfig) {
                    if (j.itemIndex === ITEM.CARD_RECORD) {
                        cc.find("curDay/record_num", days).getComponent(cc.Label).string = "" + j.itemNum
                        cc.find("passDay/record_num", days).getComponent(cc.Label).string = "" + j.itemNum
                        cc.find("nextDay/record_num", days).getComponent(cc.Label).string = "" + j.itemNum
                    }
                }
            }


            cc.find("passDay", days).active = i < status.curday || (i == status.curday && status.alreadySign)
            cc.find("curDay", days).active = i == status.curday && !status.alreadySign
            cc.find("nextDay", days).active = i > status.curday
        })

        this.$("btnGet").active = !status.alreadySign
        this.$("btnGray").active = status.alreadySign
    }

    onPressGet() {
        ads.receiveAward({
            showAward: false,
            index: ads.video.ActivitySign,
            success: (res) => {
                if (this.isValid) {
                    this.getAward(res.awards)
                }
            }
        })
    }

    getAward(awards: IAward[]) {
        http.open(urls.ACTIVE_SIGN_EXECUTE, {
            uid: app.user.guid,
            ticket: app.user.ticket,
            gameid: app.gameId,
        }, (err, res) => {
            if (res && res.ret == 0) {
                // const awards: IAward[] = []
                this.data.forEach(data => awards.push({ index: data.itemIndex, num: data.itemNum }))
                appfunc.showAwardPop(awards)

                this.reloadData()
            } else {
                startFunc.showToast("签到失败!")
            }
        })
    }

    onPressCashOut() {
        appfunc.showCashOutPop()
    }

    @listen("item_update")
    updateUserItem() {
        this.$("btnCashOut/ybtx_di/progress", cc.ProgressBar).progress = Math.min(1, (app.user.getItemNum(ITEM.INGOT) / 1000))
        this.$("btnCashOut/ybtx_di/New Label", cc.Label).string = Math.floor(Math.min(1, (app.user.getItemNum(ITEM.INGOT) / 1000)) * 100) + "%"
    }
}

export function loadActivitySignConfig(callback?: () => any) {
    if (app.datas.ActivitySignConfig) {
        callback && callback()
        return
    }

    http.open(urls.ACTIVE_SIGN_CONFIG, { gameid: app.gameId }, (err, res) => {
        if (res && res.ret == 0) {
            app.datas.ActivitySignConfig = res.list
            callback && callback()
        }
    })
}

export function loadActivitySignInfo(callback?: () => any) {
    http.open(urls.ACTIVE_SIGN_INFO, {
        uid: app.user.guid,
        ticket: app.user.ticket,
        gameid: app.gameId,
    }, (err, res) => {
        if (res) {
            if (!res.award) {
                res.award = []
            }

            const long = app.datas.ActivitySignConfig?.length || 14
            const curday = res.ret == 0 ? res.list[0].signDay : 0
            res.enabled = curday < long || (curday == long && res.award.length > 0)

            app.datas.ActivitySignInfo = res
            callback && callback()
        }
    })
}

export function checkSign(callback: (can: boolean) => void) {
    loadActivitySignConfig(() => {
        const onComplete = () => {
            callback(checkCanSign())
        }
        if (app.datas.ActivitySignInfo) {
            onComplete()
            return
        }

        loadActivitySignInfo(onComplete)
    })
}

function checkCanSign() {
    const status = getSignStatus()
    return status.curday < app.datas.ActivitySignConfig.length && !status.alreadySign
}

function getSignStatus() {
    const status = app.datas.ActivitySignInfo

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const zerotime = Math.floor(now.getTime() / 1000)

    const lastSignTime = status.ret == 0 ? status.list[0].signTime : 0
    const alreadySign = zerotime < lastSignTime
    let curday = status.ret == 0 ? status.list[0].signDay : 0
    if (alreadySign && curday > 0) {
        curday = curday - 1
    }

    return { curday: curday, alreadySign: alreadySign }
}