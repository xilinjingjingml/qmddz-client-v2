import { audio } from "../../base/audio"
import { http } from "../../base/http"
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
        this.$("labelName", cc.Label).string = app.user.nickname
        this.$("labelUserId", cc.Label).string = "" + app.user.guid

        this.$("bindPhone").active = app.datas.bindPhone.hasBindMoble != 1
        this.$("bindWechat").active = false
        if (appfunc.checkSpecialAward()) {//app.getOnlineParam("app_review")
            this.$("bindPhone").active = false
            if (!app.datas.ifBindWeixin) {
                this.$("bindWechat").active = cc.sys.isNative && (app.platform as AppNative).hasWeChatSession()
            }
        }

        this.setSprite({ node: this.$("face"), path: app.user.face, adjustSize: true })
        this.setSexStatus()
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
