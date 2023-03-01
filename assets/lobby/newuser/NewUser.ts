import { audio } from "../../base/audio"
import { monitor } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import { app } from "../../start/app"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class NewUser extends BasePop {

    start() {
        app.datas.newUserPopShow = true
        if (app.getOnlineParam("NewUser_skip_protocol", true)) {
            this.showAwardAni()
        } else {
            this.$("nodeProtocol").active = true
        }
    }

    onPressProtocol(event: cc.Event.EventTouch, type) {
        audio.playMenuEffect()
        appfunc.showProtocolPop(Number(type))
    }

    showOpenAni() {
        this.$("nodeProtocol").active = false
        this.$("animateOpen").active = true

        const spine = this.$("animateOpen", sp.Skeleton)
        spine.setAnimation(0, "xinrenjiangli", false)
        spine.setCompleteListener(() => {
            spine.setCompleteListener(null)
            if (this.isValid) {
                this.$("animateOpen").active = false
                this.showAwardAni()
            }
        })
    }

    showAwardAni() {
        this.$("animateAward").active = true
        this.$("animateAward", sp.Skeleton).setAnimation(0, "man200xinyunjiangli", false)

        const award = this.$("nodeAward")
        award.active = true
        cc.tween(award).set({ opacity: 0 }).delay(0.8).to(0.3, { opacity: 255 }).start()

        cc.tween(this.$("start")).then(cc.tween().to(0.8, { scale: 1.1 }).to(0.8, { scale: 1.0 })).repeatForever().start()

        this.scheduleOnce(() => {
            this.close()
            monitor.emit("fake_money_update")
        }, 3)
    }

    onPressStart() {
        audio.playMenuEffect()
        this.close()
        monitor.emit("fake_money_update")
    }

    onPressAgree() {
        audio.playMenuEffect()
        this.showOpenAni()
    }

    onPressDisAgree() {
        // TODO exit
        audio.playMenuEffect()
        cc.game.end()
    }
}
