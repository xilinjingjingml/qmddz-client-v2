import { audio } from "../../base/audio"
import BasePop from "../../base/view/BasePop"
import { ViewManager } from "../../base/view/ViewManager"
import { app } from "../../start/app"
import { AppNative } from "../../start/scripts/platforms/AppNative"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class Setting extends BasePop {
    musicVol = 1
    effectVol = 1
    clickCount: number = 0
    lastClickTime: number = 0

    start() {
        this.$("labelUserId", cc.Label).string = "ID:" + app.user.guid
        this.$("labelVersion", cc.Label).string = "版本号:" + app.sVersion + (["测试", "镜像"][app.env] || "")
        if (cc.sys.isNative) {
            const platform = app.platform as AppNative
            this.$("labelVersion", cc.Label).string += `-${platform.getVersionName()}-${platform.getVersionCode()}`
        }

        this.musicVol = audio.getMusicVolume()
        this.setMusicStatus()

        this.effectVol = audio.getEffectsVolume()
        this.setEffectStatus()
    }

    setMusicStatus() {
        this.$("music_open").active = this.musicVol == 1
        this.$("music_close").active = this.musicVol == 0
    }

    onPressMusicSwitch() {
        audio.playMenuEffect()
        if (this.musicVol == 1) {
            this.musicVol = 0
        } else {
            this.musicVol = 1
        }

        audio.setMusicVolume(this.musicVol)
        this.setMusicStatus()
    }

    setEffectStatus() {
        this.$("effect_open").active = this.effectVol == 1
        this.$("effect_close").active = this.effectVol == 0
    }

    onPressEffectSwitch() {
        audio.playMenuEffect()
        if (this.effectVol == 1) {
            this.effectVol = 0
        } else {
            this.effectVol = 1
        }

        audio.setEffectsVolume(this.effectVol)
        this.setEffectStatus()
    }

    onPressProtocol(event: cc.Event.EventTouch, type) {
        audio.playMenuEffect()
        
        if (cc.WebView) {
            appfunc.showWebview({ url: type === "0" ? app.protocol0_url : app.protocol1_url, title: type === "0" ? "用户协议" : "隐私协议" })
        } else {
            ViewManager.showPopup({ bundle: "lobby", path: type === "0" ? "setting/protocol0" : "setting/protocol1" })
        }

        this.close()
    }

    onPressCommand() {
        this.clickCount++
        if (0 != this.lastClickTime && 500 < new Date().getTime() - this.lastClickTime) {
            return
        }

        this.lastClickTime = new Date().getTime()

        if (this.clickCount == 15) {
            this.close()
            ViewManager.showPopup({ bundle: "lobby", path: "command/command" })
        }
    }

    onPressPush() {

    }

    onPressService() {
        audio.playMenuEffect()
        appfunc.showWebview({ url: app.service_url, title: "客服" })
        this.close()
    }
}