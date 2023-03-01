import { audio } from "../../base/audio"
import { NodeExtends } from "../../base/extends/NodeExtends"
import { http } from "../../base/http"
import BasePop from "../../base/view/BasePop"
import { ViewManager } from "../../base/view/ViewManager"
import { app } from "../../start/app"
import { startFunc } from "../../start/startFunc"
import { urls } from "../../start/urls"

const { ccclass } = cc._decorator

@ccclass
export default class BindZFBConfirmPop extends BasePop {
    params: { account: string, name: string }

    start() {
        this.$("label_account", cc.Label).string = this.params.account
        this.$("label_name", cc.Label).string = this.params.name
    }

    onPressConfirm(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        audio.playMenuEffect()

        http.open(urls.BIND_ZFB, {
            uid: app.user.guid,
            ticket: app.user.ticket,
            aliAccount: this.params.account,
            aliName: this.params.name,
        }, (err, res: { ret: number, msg: string }) => {
            cc.error(err, res)
            if (res) {
                if (res.ret == 0) {
                    app.datas.ifBindAliPay = true
                    startFunc.showToast(res.msg)

                    this.close()
                    ViewManager.close("BindZFBPop")
                } else {
                    startFunc.showToast("绑定失败！")
                }
            }
        })
    }
}
