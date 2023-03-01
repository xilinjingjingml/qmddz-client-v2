import { audio } from "../../base/audio"
import { http } from "../../base/http"
import BasePop from "../../base/view/BasePop"
import { app } from "../../start/app"
import { startFunc } from "../../start/startFunc"
import { urls } from "../../start/urls"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class Binding extends BasePop {

    onPressGetCode() {
        audio.playMenuEffect()
        const phone = this.$("editPhone", cc.EditBox).string

        if (phone.length != 11) {
            startFunc.showToast("手机号码格式有误")
            return
        }

        this.sendVerificationCode(phone)
    }

    onPressConfirm() {
        audio.playMenuEffect()
        const phone = this.$("editPhone", cc.EditBox).string

        if (phone.length != 11) {
            startFunc.showToast("手机号码格式有误")
            return
        }

        const code = this.$("editCode", cc.EditBox).string
        if (code.length != 6) {
            startFunc.showToast("验证码格式有误")
            return
        }

        this.bindPhone(phone, code)
    }

    sendVerificationCode(phone: string, flag: string = "bind") {
        let guid = 0
        let ticket = ""
        if (app.user.guid != 0) {
            guid = app.user.guid
            ticket = app.user.ticket
        }

        http.open(urls.MOBILE_CODE_GET, {
            pid: guid,
            ticket: ticket,
            pn: app.pn,
            version: 1,
            phone: phone,
            flag: flag,
            sign: md5("pid=" + guid + "&ticket=" + ticket + "&pn=" + app.pn + "&version=1&phone=" + phone + "&flag=" + flag + "&key=fas342wrff4t32dfg534g432"),
        }, (err, res) => {
            if (res && res.ret == 0) {
                startFunc.showToast("验证码已通过短信发送到您的手机")
                this.isValid && this.coolGetCode()
            } else {
                startFunc.showToast(res ? res.msg : "验证码发送失败")
            }
        })
    }

    coolGetCode() {
        const button = this.$("getcode", cc.Button)
        const label = this.$("labelCodeStatus", cc.Label)

        let cooldown = 60
        button.enabled = false
        label.string = "重新获取(" + cooldown + ")"

        cc.Tween.stopAllByTarget(this.$("getcode"))
        cc.tween(this.$("getcode"))
            .then(cc.tween().delay(1).call(() => {
                cooldown--

                if (cooldown == 0) {
                    button.enabled = true
                    label.string = "获取验证码"
                } else {
                    label.string = "重新获取(" + cooldown + ")"
                }
            }))
            .repeat(cooldown)
            .start()
    }

    bindPhone(phone: string, code: string) {
        // TODO DataManager.load("user_guest_openid") => app.user.imei
        const time = appfunc.accurateTime()
        const sign = "pid=" + app.user.guid
            + "&ticket=" + app.user.ticket
            + "&phone=" + phone
            + "&code=" + code
            + "&password=&pn=" + app.pn
            + "&imei=" + app.user.imei
            + "&time=" + time
            + "&flag=noPasswordBind#sadfw2342418u309snsfw"

        http.open(urls.MOBILE_BIND_USER, {
            pid: app.user.guid,
            ticket: app.user.ticket,
            phone: phone,
            code: code,
            pn: app.pn,
            version: 0,
            sign: md5(sign),
            password: "",
            time: time,
            imei: app.user.imei,
            name: "",
            flag: "noPasswordBind"
        }, (err, res) => {
            if (res) {
                if (res.ret == 0) {
                    app.datas.bindPhone = { hasBindMoble: 1, BindPhone: phone }
                    startFunc.showToast("绑定成功")
                    this.isValid && this.close()
                } else if (res.ret == 1) {
                    startFunc.showToast("该手机已绑定过，可以直接使用手机号登录")
                } else {
                    startFunc.showToast(res.msg || "绑定失败")
                }
            } else {
                startFunc.showToast("绑定失败")
            }
        })
    }
}