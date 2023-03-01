import { audio } from "../../base/audio"
import { math } from "../../base/math"
import { listen } from "../../base/monitor"
import BaseView from "../../base/view/BaseView"
import { app } from "../../start/app"
import { GAME, GAME_TYPE, ITEM } from "../../start/config"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class RedPacketView extends BaseView {

    // _idx: number = 0

    start() {
        this.setMoneyNum()
        // this.$("labelPlayerNum", cc.Label).string = Math.floor(-310583 + (appfunc.accurateTime() - 1604289417) / 10) + "人正在赚红包中"
        let spine = this.$("chaihongbaodj", sp.Skeleton)
        spine.setCompleteListener(this.loopAni.bind(this))
        this.loopAni()
    }

    loopAni() {
        let spine = this.$("chaihongbaodj", sp.Skeleton)
        // spine.addAnimation(0, this._idx ++ % 2 === 0 ? "animation" : "animation2", false)
        spine.addAnimation(0, Math.floor(Math.random() * 100) % 3 === 0 ? "animation2" : "animation", false)
    }

    @listen("user_data_update")
    setMoneyNum() {
        if (app.datas.first == 1 && app.getOnlineParam("jump2game") && !app.datas.newUserPopShow) {
            return
        }

        this.$("labelMoneyNum", cc.Label).string = math.fixd(appfunc.toCash(app.user.getItemNum(ITEM.TO_CASH)))
        this.$("yuanbao_price", cc.RichText).string = `元宝可提金额 <size=40><b>${(app.user.getItemNum(ITEM.INGOT) / 10000).toFixed(2)}</b></size> 元`
    }

    @listen("fake_money_update")
    fakeMoneyAni() {
        const model = this.$("model_money")
        const container = this.node

        const label = this.$("labelMoneyNum", cc.Label)
        label.string = "0"

        const total = Math.floor(appfunc.toCash(app.user.getItemNum(ITEM.TO_CASH)))

        let current = 0
        const sprNum = 10
        const step = total / sprNum
        const center = cc.v2(0, 250)

        for (let i = 0; i < sprNum; i++) {
            const spr = cc.instantiate(model)
            spr.x = center.x + Math.floor(Math.random() * 200 - 100)
            spr.y = center.y + Math.floor(Math.random() * 10 - 180)
            spr.parent = container
            const t = i == 0 ? 1 : Math.random() * 5 / 10 + 0.4
            spr.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.spawn(
                    cc.fadeTo(t, 200),
                    cc.jumpTo(t, center.x + Math.random() * 100 - 50, center.y + Math.random() * 40 - 20, 80, 1).easing(cc.easeSineInOut()),
                    cc.scaleTo(t, Math.random() * 2 / 10 + 0.3).easing(cc.easeSineInOut())
                ),
                cc.callFunc(() => {
                    if (i == 0) {
                        this.setMoneyNum()
                        cc.tween(container).delay(0.3).call(this.onPressGoGame.bind(this)).start()
                    } else {
                        current += step
                        label.string = math.fixd(current)
                    }
                }),
                cc.removeSelf()
            ))
        }
    }

    onPressGoGame() {
        audio.playMenuEffect()
        if (app.user.getItemNum(ITEM.TO_CASH) < 800) {
            appfunc.showReliefPop({
                closeCallback: () => {
                    if (!this.isValid) return
                    if (app.user.getItemNum(ITEM.TO_CASH) >= 800) {
                        this.scheduleOnce(this.onPressGoGame.bind(this), 1)
                    }
                }
            })
            return
        }
        appfunc.startGame(GAME.DDZ, GAME_TYPE.DDZ_BAIYUAN)
    }
}
