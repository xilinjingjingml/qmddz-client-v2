import { audio } from "../../base/audio"
import { listen } from "../../base/monitor"
import { storage } from "../../base/storage"
import BasePop from "../../base/view/BasePop"
import { ViewManager } from "../../base/view/ViewManager"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

const CHANNEL = 1
const DRAW_TIME_KEY = "last_draw_time"

@ccclass
export default class Lottery extends BasePop {

    data: any = {}
    adIndex: number = 0
    isBusy: boolean = false
    zeroIdx: number = -1

    start() {
        this.adIndex = ads.video.New_HappyLottery

        this.updateTimes()
        this.updateStatus()

        cc.tween(this.$("main")).set({ scale: 0 }).to(0.3, { scale: 1 }, { easing: "sineInOut" }).start()

        cc.tween(this.$("light_round")).then(cc.tween().set({ angle: 0 }).delay(1).set({ angle: 22.5 }).delay(1)).repeatForever().start()

        appfunc.loadLotteryData(CHANNEL, () => {
            this.isValid && this.initView()
        })
    }

    initView() {
        const data = app.datas.lottery[CHANNEL]
        const items = this.$("panel").children.filter(i => i.childrenCount > 0)

        for (let i = 0, len = data.length; i < len; i++) {
            const element = data[i]
            const item = items[i]

            if (element.acItemNum == 0) {
                this.zeroIdx = i + 1
            }

            this.data[i + 1] = { acItemIndex: element.acItemIndex, acItemNum: element.acItemNum, offset: i * 45 - 22.5 }

            // if (cc.sys.platform == cc.sys.WECHAT_GAME && element.acItemNum != 0) {
            //     this.setSprite({ node: cc.find("icon", item), bundle: "lobby", path: "lottery/images/huafei" + element.acItemNum })
            // } else {
            //     // this.setSprite({ node: cc.find("icon", item), path: element.acItemUrl })
            // }
            if (element.acItemIndex === ITEM.TO_CASH) {
                this.setSprite({ node: cc.find("icon", item), bundle: "lobby", path: "common/icons/icon_382_4", adjustSize: cc.size(72, 91) })
                cc.find("desc", item).getComponent(cc.Label).string = (element.acItemNum / 100) + "元"
            } else if (element.acItemIndex === ITEM.CARD_RECORD) {
                this.setSprite({ node: cc.find("icon", item), bundle: "lobby", path: "common/icons/icon_2", adjustSize: cc.size(77, 86) })
                cc.find("desc", item).getComponent(cc.Label).string = "x" + element.acItemNum
            } else if (element.acItemIndex === ITEM.INGOT) {
                this.setSprite({ node: cc.find("icon", item), bundle: "lobby", path: "common/icons/icon_384_1", adjustSize: cc.size(93, 67) })
                cc.find("desc", item).getComponent(cc.Label).string = (element.acItemNum / 10000) + "元"
            }


            // element.itemDesc
        }
    }

    @listen("ads_config_update")
    updateTimes() {
        const times = ads.getVideoLeftTimes(this.adIndex)
        this.$("chance", cc.Label).string = times + "次"
    }

    updateStatus() {
        this.node.stopAllActions()
        this.$("draw").active = false
        this.$("gray").active = false
        this.$("over").active = false
        this.$("countdown").active = true

        if (ads.checkCanReceive(this.adIndex)) {
            const lastOpTime = storage.get(DRAW_TIME_KEY) || 0
            let cdTime = 90 - (appfunc.accurateTime() - lastOpTime)

            if (lastOpTime > 0 && cdTime > 0) {
                this.$("gray").active = true
                this.$("gray/countdown/time").active = true

                const label = this.$("gray/countdown/time", cc.Label)

                cc.tween(this.node).then(cc.tween()
                    .call(() => {
                        const m = Math.floor(cdTime / 60)
                        const s = Math.floor(cdTime % 60)
                        // label.string = "0" + m + ":" + (s > 9 ? s : "0" + s)
                        label.string = cdTime + "s"
                        cdTime--
                        if (cdTime <= 0) {
                            this.updateStatus()
                        }
                    })
                    .delay(1))
                    .repeatForever()
                    .start()
            } else {
                this.$("draw").active = true
            }
        } else {
            this.$("gray").active = true
            this.$("over").active = true
            this.$("countdown").active = false
        }
    }

    showResult(awardId: number, awards: IAward[]) {
        let index = -1
        if (awardId != 0) {
            const datas = app.datas.lottery[CHANNEL]
            for (let i = 0; i < datas.length; i++) {
                if (datas[i].acAutoId == awardId) {
                    index = i + 1
                    break
                }
            }
        }
        if (awardId == 0 || !this.data[index]) {
            if (this.zeroIdx != -1) {
                index = this.zeroIdx
            } else {
                this.isBusy = false
                startFunc.showToast("谢谢参与")
                return
            }
        }

        const data = this.data[index]
        const pannel = this.$("panel")

        cc.tween(this.$("effect")).delay(3).show().blink(1, 6).hide().start()


        cc.tween(pannel)
            .by(3, { angle: -(3600 - data.offset + pannel.angle % 360) }, { easing: "circInOut" })
            .delay(1)
            .call(() => {
                this.isBusy = false
                if (index == this.zeroIdx) {
                    startFunc.showToast("谢谢参与")
                } else {
                    awards = awards || []
                    awards.push({
                        index: data.acItemIndex,
                        num: data.acItemNum
                    })
                    appfunc.showAwardPop(awards)
                }
                this.isBusy = false
            })
            .start()
    }

    onPressDraw() {
        audio.playMenuEffect()
        if (!this.isBusy) {
            if (!ads.checkCanReceive(this.adIndex)) {
                startFunc.showToast("抽奖次数已用完")
                return
            }

            ads.receiveAward({
                index: this.adIndex,
                showAward: false,
                success: (adres) => {
                    this.isBusy = true
                    appfunc.receiveLotteryAward(CHANNEL, (res) => {
                        if (this.isValid) {
                            if (res && res.ret == 0) {
                                storage.set(DRAW_TIME_KEY, appfunc.accurateTime())
                                this.updateStatus()
                                this.showResult(res.awardId, adres.awards)
                            } else {
                                this.isBusy = false
                                startFunc.showToast(res ? res.msg : "请求失败")
                            }
                        }
                    })
                }
            })
        }
    }

    onPressHelp() {
        audio.playMenuEffect()
        ViewManager.showPopup({ bundle: "lobby", path: "lottery/help" })
    }

    onPressClose() {
        if (!this.isBusy) {
            super.onPressClose()
        }
    }
}