import HotUpdate, { EUpdateState } from "../../base/HotUpdate"
import { storage } from "../../base/storage"
import TaskQueue from "../../base/TaskQueue"
import { utils } from "../../base/utils"
import BaseView from "../../base/view/BaseView"
import { app } from "../app"
import { IConfirm } from "../confirm/confirm"
import { AppNative } from "../scripts/platforms/AppNative"
import { startFunc } from "../startFunc"
import { EHOST, hosts } from "../urls"

const { ccclass } = cc._decorator

const name = "game"
const versionName = name + "_version"

@ccclass
export default class update extends BaseView {
    taskQueue: TaskQueue
    hotUpdate: HotUpdate

    start() {
        this.showProgress(false)

        this.taskQueue = new TaskQueue(this.node)
        this.taskQueue.add(this.updateApp, this)
        this.taskQueue.add(this.updateGame, this)
        this.taskQueue.add(this.showLogin, this)
        this.taskQueue.run()

        cc.game.on("UpgradeUtil", this.onAppUpgrade, this)
    }

    onDestroy() {
        cc.game.off("UpgradeUtil", this.onAppUpgrade, this)
    }

    updateApp(next: Function) {
        if (!checkAppUpdatate()) {
            next()
            return
        }

        const params: IConfirm = {
            title: "发现新版本",
            content: app.versionupdate.msg,
            showClose: false,
            confirmText: "立即更新",
        }
        if (app.versionupdate.ef == 0) {
            params.cancelText = "暂不更新"
            params.cancelFunc = next
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            params.buttonNum = 1
        } else {
            params.cancelText = "关闭游戏"
            params.cancelFunc = () => {
                cc.log("[update.updateApp] cancelFunc")
                cc.game.end()
            }
        }
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            params.confirmFunc = () => {
                cc.log("[update.updateApp] confirmFunc")
                // 兼容该版本app打开链接强更新
                if (getAppNative().getVersionCode() == app.getOnlineParam("app_version_update_url", 20)) {
                    cc.sys.openURL(app.versionupdate.url)
                    return
                }

                getAppNative().callStaticMethod("com/izhangxin/utils/luaj", "showUpgradeDialog", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;I)V", app.versionupdate.url, "下载中", "正在更新游戏资源", md5(app.versionupdate.url) + ".apk", () => { })
            }
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            params.confirmFunc = () => {
                cc.log("[update.updateApp] confirmFunc")
                cc.sys.openURL(app.versionupdate.url)
            }
        }
        startFunc.showConfirm(params)
    }

    updateGame(next: Function) {
        this.hotUpdate = new HotUpdate(name, getAppNative().thirdparty)

        this.setGameVersion(this.hotUpdate.getLocalVersion())
        if (!checkGameVersion()) {
            next()
            return
        }

        this.hotUpdate.setProgressHandle(this.setProgress.bind(this))
        this.hotUpdate.setResultHandle(this.onResult.bind(this))
        this.hotUpdate.setUpdateUrl(`${hosts[app.env][EHOST.update]}${app.gameId}/${app.getOnlineParam(versionName)}`)
        this.hotUpdate.update()
    }

    setGameVersion(version: string) {
        if (version == app.version) {
            return
        }

        app.version = version
        storage.set(versionName, version)
    }

    showLogin() {
        this.showProgress(false)
        startFunc.showLogin()
    }

    showProgress(active: boolean) {
        this.$("node_progress").active = active
        this.$("node_loading").active = !active
    }

    setProgress(value: number) {
        cc.log("[update.setProgress]", value)
        this.showProgress(true)
        this.$("progressBar", cc.ProgressBar).progress = value
        this.$("label_progress", cc.Label).string = Math.floor(value * 100) + "%"
    }

    onResult(ret: EUpdateState) {
        if (ret == EUpdateState.failed) {
            this.showProgress(false)
            startFunc.checkNetwork({
                callback: () => this.hotUpdate.update(),
                must: true,
                content: "更新失败, 您的设备可能没有网络了",
                confirmText: "继续更新"
            })
            return
        }

        if (ret == EUpdateState.finished || ret == EUpdateState.already) {
            this.setGameVersion(app.getOnlineParam(versionName))
        }

        if (ret == EUpdateState.noFound || ret == EUpdateState.already) {
            this.taskQueue.next()
        } else {
            this.scheduleOnce(() => cc.game.restart())
        }
    }

    onAppUpgrade(message: { ret: number, event: string }): void {
        cc.log("[update.onAppUpgrade]", message)
        if (message.ret < 0) {
            startFunc.checkNetwork({ callback: () => this.taskQueue.run() })
        }
    }
}

export function checkUpdatate() {
    if (!cc.sys.isNative) {
        return false
    }

    if (checkAppUpdatate()) {
        return true
    }

    app.version = storage.get(versionName) ?? "1.0.0.0"
    if (checkGameVersion()) {
        return true
    }

    return false
}

function getAppNative() {
    return app.platform as AppNative
}

// 检测APP版本
function checkAppUpdatate() {
    if (getAppNative().getVersionCode() >= app.versionupdate.vn) {
        return false
    }

    return true
}

// 检测游戏版本
function checkGameVersion() {
    const gameVersion = app.getOnlineParam(versionName)
    if (gameVersion == null || utils.versionCompare(app.version, gameVersion) >= 0) {
        return false
    }

    return true
}
