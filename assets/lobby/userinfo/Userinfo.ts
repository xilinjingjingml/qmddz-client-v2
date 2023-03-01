import { audio } from "../../base/audio"
import { http } from "../../base/http"
import { math } from "../../base/math"
import BasePop from "../../base/view/BasePop"
import { app } from "../../start/app"
import { AppNative } from "../../start/scripts/platforms/AppNative"
import { startFunc } from "../../start/startFunc"
import { urls } from "../../start/urls"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class Userinfo extends BasePop {

    start() {
        this.$("labelName", cc.Label).string = "" + (app.user.nickname.length > 6 ? app.user.nickname.substring(0, 6) + "..." : app.user.nickname)
        this.$("labelUserId", cc.Label).string = "ID:" + app.user.guid

        // this.$("bindPhone").active = app.datas.bindPhone.hasBindMoble != 1
        // this.$("bindWechat").active = false
        // if (app.getOnlineParam("app_review")) {
        //     this.$("bindPhone").active = false
        //     if (!app.datas.ifBindWeixin) {
        //         this.$("bindWechat").active = cc.sys.isNative && (app.platform as AppNative).hasWeChatSession()
        //     }
        // }



        this.setSprite({ node: this.$("face"), path: app.user.face, adjustSize: true })
        this.setSexStatus()

        this.$("nodeUser/labelLocal", cc.Label).string = app.datas.IPLocation?.city || "未知"
        this.$("nodeUser/labelLv", cc.Label).string = "等级: " + app.datas.byLevel + "级"

        this.$("games", cc.Label).string = `${app.user.won + app.user.lost}`
        this.$("won", cc.Label).string = `${app.user.won != 0 ? math.fixd(app.user.won / (app.user.won + app.user.lost) * 100) : "0"}%`
    }

    setSexStatus() {
        this.$("male", cc.Button).interactable = app.user.sex != 0
        this.$("female", cc.Button).interactable = app.user.sex == 0
    }

    onPressCopy() {
        audio.playMenuEffect()
        app.platform.copyToClipBoard(app.user.guid)
    }

    onSexClick(event: cc.Event.EventTouch, sex: string) {
        audio.playMenuEffect()
        if (Number(sex) != app.user.sex) {
            http.open(urls.UPDATE_USER_INFO, {
                pid: app.user.guid,
                ticket: app.user.ticket,
                sex: sex
            }, (err, res) => {
                if (res && res.ret == 0) {
                    app.user.sex = Number(sex)
                    this.isValid && this.setSexStatus()
                    startFunc.showToast("修改性别成功")
                }
            })
        }
    }

    onPressBindWeChat() {
        audio.playMenuEffect();
        (app.platform as AppNative).bindWeiXin()
    }
}
