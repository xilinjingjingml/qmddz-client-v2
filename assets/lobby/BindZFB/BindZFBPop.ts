import BasePop from "../../base/view/BasePop"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class BindZFBPop extends BasePop {

    onEditBoxBegin(event: cc.Event.EventTouch, name: string) {
        this.setEditBoxError(name, false)
    }

    setEditBoxError(name: string, show: boolean) {
        this.$(`editbox_${name}_error`).active = show
        this.$(`label_${name}_error`).active = show
    }

    onPressConfirm() {
        const account = this.$("editbox_account", cc.EditBox).string
        if (account.length <= 0) {
            this.setEditBoxError("account", true)
            return
        }

        const name = this.$("editbox_name", cc.EditBox).string
        if (name.length <= 0) {
            this.setEditBoxError("name", true)
            return
        }

        appfunc.showBindZFBConfirmPop({ account: account, name: name })
    }
}
