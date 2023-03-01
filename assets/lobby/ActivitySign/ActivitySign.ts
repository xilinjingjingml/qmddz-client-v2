import { audio } from "../../base/audio"
import { NodeExtends } from "../../base/extends/NodeExtends"
import { http } from "../../base/http"
import { monitor } from "../../base/monitor"
import BaseView from "../../base/view/BaseView"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { startFunc } from "../../start/startFunc"
import { urls } from "../../start/urls"
import { appfunc } from "../appfunc"
import ActivitySignItem from "./ActivitySignItem"

const { ccclass } = cc._decorator

@ccclass
export default class ActivitySign extends BaseView {
    data: IItemInfo[]
    double: number = 0

    start() {
        this.$("sign_item").active = false
        this.$("node_btns").active = false
        loadActivitySignConfig(() => {
            this.isValid && this.reloadData()
        })
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
        this.$("node_btns").active = checkCanSign()

        const content = this.$("sign_content")
        const item = this.$("sign_item")
        datas.forEach((data, i) => {
            let node = content.children[i]
            if (!node) {
                node = cc.instantiate(item)
                node.active = true
                node.parent = content
            }
            node.getComponent(ActivitySignItem).setData({
                index: i,
                signed: i < status.curday || (i == status.curday && status.alreadySign),
                choose: hasActivity && i == status.curday,
                data: data
            })
        })
    }

    onPressGet(event: cc.Event.EventTouch, data: string) {
        audio.playMenuEffect()
        NodeExtends.cdComponent(this.$("btn_get_double", cc.Button))
        NodeExtends.cdComponent(this.$("btn_get", cc.Button))

        this.double = 0
        if (parseInt(data) == 2) {
            ads.receiveAward({
                index: ads.video.ActivitySign,
                success: () => {
                    if (this.isValid) {
                        this.double = 1
                        this.getAward()
                    }
                }
            })
            return
        }

        this.getAward()
    }

    getAward() {
        http.open(urls.ACTIVE_SIGN_EXECUTE, {
            uid: app.user.guid,
            ticket: app.user.ticket,
            gameid: 2,
            specialValue: this.double
        }, (err, res) => {
            if (res && res.ret == 0) {
                const awards: IAward[] = []
                this.data.forEach(data => awards.push({ index: data.itemIndex, num: (this.double + 1) * data.itemNum }))
                appfunc.showAwardPop(awards)

                this.reloadData()
            } else {
                startFunc.showToast("签到失败!")
            }
        })
    }
}

export function loadActivitySignConfig(callback?: () => any) {
    if (app.datas.ActivitySignConfig) {
        callback && callback()
        return
    }

    http.open(urls.ACTIVE_SIGN_CONFIG, { gameid: 2 }, (err, res) => {
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
        gameid: 2,
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
    return appfunc.hasActivity() && status.curday < app.datas.ActivitySignConfig.length && !status.alreadySign
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
