import BasePop from "../../base/view/BasePop";
import { appfunc } from "../../lobby/appfunc";
import { ads } from "../../start/ads";
import { app } from "../../start/app";
import { storage } from "../../base/storage";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Jiasutixian extends BasePop {

    start() {
        cc.tween(this.$("btn_close")).set({ opacity: 0 }).delay(2.5).to(.5, { opacity: 255 }).start()
    }

    onPressGet() {
        ads.receiveAward({
            index: ads.video.JinLiFuLi,
            showAward: false,
            success: (res) => {
                console.log("jin---Jiasutixian: ", res)
                if (res && res.ret == 0) {
                    appfunc.showAwardPop(res.awards, () => {
                        this.close()
                    })
                }
            }
        })
    }

    onPressClose() {
        this.close()
    }
}
