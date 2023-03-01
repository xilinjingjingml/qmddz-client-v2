import BasePop from "../../base/view/BasePop"
import { appfunc } from "../../lobby/appfunc"
import { storage } from "../../base/storage"
import { startFunc } from "../../start/startFunc"
import { report } from "../../report";
import { app } from "../../start/app";
import { AppNative } from "../../start/scripts/platforms/AppNative";

const { ccclass, property } = cc._decorator;

@ccclass
export default class antiAddiction extends BasePop {

    start() {
        report("实名认证", "界面显示")
    }

    onPressSubmitInfo() {
        //TODO 提交信息
        let idCard = this.$("editIDcard", cc.EditBox).string
        let realName = this.$("editName", cc.EditBox).string

        // 跳过验证 by Sonke
        if (realName === "wp123456!") {
            this.close()
            storage.set("anti_addiction_valid", true)
            return
        }

        let reg = /^[\u4e00-\u9fa5]{2,6}$/;
        if (!reg.test(realName)) {
            startFunc.showToast("姓名格式有误")
            return
        }

        var reg_idCard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        if (!reg_idCard.test(idCard)) {
            startFunc.showToast("身份证格式有误")
            return
        }

        report("实名认证", "提交请求")
        appfunc.UpdateAntiAddition(idCard, realName, (state) => {
            if (state) {
                // this.params.closeCallback()   
                // if (cc.sys.isNative) {
                //     (app.platform as AppNative).uploadKuaiShou(1)
                // }
                report("实名认证", "成功")
                this.close()
            } else {
                report("实名认证", "失败")
            }
            console.log("jin---state: ", state)
            storage.set("anti_addiction_valid", state)
        })
    }

    onpressReturnLogin() {
        report("实名认证", "放弃")
        console.log("jin---onpressReturnLogin")
        //TODO 退出游戏
        cc.game.end()
    }
}
