import { audio } from "../../base/audio"
import { math } from "../../base/math"
import { monitor } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import { report } from "../../report"
import { app } from "../../start/app"
import { GAME, GAME_TYPE } from "../../start/config"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class NewUser extends BasePop {

    start() {
        report("新玩家", "界面显示")
        app.datas.newUserPopShow = true
        if (app.getOnlineParam("NewUser_skip_protocol", true)) {
            // this.showAwardAni()
            this.showHongbao()
        } else {
            this.$("nodeProtocol").active = true
        }
    }

    onPressProtocol(event: cc.Event.EventTouch, type) {
        audio.playMenuEffect()
        appfunc.showProtocolPop(Number(type))
    }

    showHongbao() {
        this.$("chaihongbao").active = true
        this.$("dakai").active = true
    }

    showOpenAni() {
        this.$("nodeProtocol").active = false
        // this.$("animateOpen").active = true

        // const spine = this.$("animateOpen", sp.Skeleton)
        // spine.setAnimation(0, "xinrenjiangli", false)
        // spine.setCompleteListener(() => {
        //     spine.setCompleteListener(null)
        //     if (this.isValid) {
        //         this.$("animateOpen").active = false
        //         this.showAwardAni()
        //     }
        // })
        this.$("dakai").active = false
        const spine = this.$("chaihongbao", sp.Skeleton)
        // spine.setCompleteListener(() => {
        //     this.scheduleOnce(() => {
        //         this.close()
        //         monitor.emit("fake_money_update")
        //     }, 3);
        // })
        spine.setAnimation(0, "animation2", false)
        cc.tween(this.node)
            .delay(.2)
            .call(() => this.showAwardAni())
            .start()
        // this.$("chaihongbao").active = true
    }

    showAwardAni() {
        // this.$("animateAward").active = true
        // this.$("animateAward", sp.Skeleton).setAnimation(0, "man200xinyunjiangli", false)

        let money = 0
        let step = 188 / 10
        const award = this.$("nodeAward")
        award.active = true
        // cc.tween(award).set({ opacity: 0 }).delay(0.8).to(0.3, { opacity: 255 }).start()
        // cc.tween(this.$("start")).then(cc.tween().to(0.8, { scale: 1.1 }).to(0.8, { scale: 1.0 })).repeatForever().start()
        cc.tween(award)
            .set({ opacity: 0 })
            .to(.3, { opacity: 255 })
            .then(cc.tween()
                .delay(.1)
                .call(() => this.$("money", cc.Label).string = `${math.fixd(money += step)}元`))
            .repeat(10)
            .start()

        // this.scheduleOnce(() => {
        //     this.close()
        //     monitor.emit("fake_money_update")
        // }, 3)
        // this.$("chaihongbao").active = true
        // this.$("dakai").active = true

        report("新玩家", "展示金额")
    }

    onPressStart() {
        audio.playMenuEffect()

        let startGame = () => {
            appfunc.startGame(GAME.DDZ, GAME_TYPE.DDZ_BAIYUAN)
            this.close()
        }

        // 实名认证AB测试A
        if (!app.getOnlineParam("anti_review") && (app.getOnlineParam("anti_ab") === "a" || (app.getOnlineParam("anti_ab") !== "b" && app.user.guid % 2 === 0))) {
            if (!appfunc.hasAntiAddition()) {
                appfunc.showAntiAddiction(startGame)
            } else {
                startGame()
            }            
        } else {
            startGame()
        }

        report("新玩家", "点击赚红包")
    }

    onPressAgree() {
        audio.playMenuEffect()
        this.showOpenAni()
        report("新玩家", "拆红包")
    }

    onPressDisAgree() {
        // TODO exit
        audio.playMenuEffect()
        cc.game.end()
    }
}
