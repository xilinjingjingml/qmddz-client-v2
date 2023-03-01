import { storage } from "../../base/storage"
import BasePop from "../../base/view/BasePop"
import { app } from "../../start/app"
import { AppNative } from "../../start/scripts/platforms/AppNative"

const { ccclass } = cc._decorator

@ccclass
export default class command extends BasePop {

    onPressCommand() {
        const str = this.$("editbox").getComponent(cc.EditBox).string
        if (str.substr(0, 5) != ">>*>>") {
            return
        }

        let changeLogin = false
        let changeVersion = false
        let command = str.substr(5)
        if (command.substr(0, 1) == "s") {
            changeLogin = true
            command = command.substr(1)
        }
        if (command.substr(0, 1) == "r") {
            changeVersion = true
            command = command.substr(1)
        }

        const env = ["t", "m", "o"].indexOf(command)
        if (env >= 0) {
            storage.set("ENV", env)
        }

        if (changeLogin) {
            storage.remove("login_type")
            storage.set("auto_login", false)
            if (cc.sys.isNative) {
                const platform = app.platform as AppNative
                platform.logout()
            }
        }

        if (changeVersion) {
            const paths: string[] = storage.get("hotUpdates", false)
            storage.remove("hotUpdates")
            if (paths) {
                if (CC_JSB) {
                    paths.forEach(path => jsb.fileUtils.removeDirectory(jsb.fileUtils.getWritablePath() + path))
                }
            }
        }

        cc.game.end()
    }
}
