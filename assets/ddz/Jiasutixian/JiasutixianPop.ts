import BasePop from "../../base/view/BasePop";
import { appfunc } from "../../lobby/appfunc";
import { ads } from "../../start/ads";
import { app } from "../../start/app";
import { storage } from "../../base/storage";

const { ccclass, property } = cc._decorator;

const YUANBAO = {
    0: 3100,
    1: 3100,
    2: 3100,
    3: 3000,
    4: 3000,
    5: 2800,
    6: 2800,
    7: 3000,
    8: 2800,
    9: 2700,
    10: 2400,
    11: 2400,
    12: 2000,
    13: 2000,
    14: 2200,
    15: 2000,
    16: 1800,
    17: 2000,
    18: 1700,
    19: 1800,
    20: 2000,
    21: 1800,
    22: 1800,
    23: 1800,
    24: 1800,
    25: 1800,
    32: 1500,
    40: 1500,
    43: 1700,
    50: 1500,
    60: 1400,
    65: 1800,
    80: 1600,
    95: 1500,
    120: 1400,
    150: 1300,
    999999999: 1200,
}

const DAILY_YUANBAO = {
    1: 2100,
    2: 2100,
    3: 1900,
    4: 1900,
    5: 1800,
    6: 1800
}

@ccclass
export default class Jiasutixian extends BasePop {

    _count: number = 0

    start() {
        this.$("money", cc.Label).string = "50元"
        if ((Date.now() / 1000) > app.datas.regtime && app.datas.adToday <= 6) {
            for (let k in DAILY_YUANBAO) {
                if (Number(k) >= app.datas.adTotal) {
                    this.$("yuanbao", cc.Label).string = `${DAILY_YUANBAO[k]}`
                    break
                }
            }
        } else {
            for (let k in YUANBAO) {
                if (Number(k) >= app.datas.adTotal) {
                    this.$("yuanbao", cc.Label).string = `${YUANBAO[k]}`
                    break
                }
            }
        }

        this._count = app.getOnlineParam("conJiasu", 3)
        this.$("countTip", cc.Label).string = `可加速${this._count}次`
    }

    onPressJiasu() {
        let index = ads.video.Jiasutixian
        if (this._count % 3 === 0) index = ads.video.Jiasutixian
        else if (this._count % 3 === 2 && ads.getVideoData(ads.video.Jiasutixian2)) index = ads.video.Jiasutixian2
        else if (this._count % 3 === 1 && ads.getVideoData(ads.video.Jiasutixian3)) index = ads.video.Jiasutixian3
        ads.receiveAward({
            index: index,
            showAward: false,
            success: (res) => {
                if (res && res.ret == 0) {
                    this._count--
                    this.$("countTip", cc.Label).string = `可加速${this._count}次`
                    appfunc.showAwardPop(res.awards, () => {
                        if (0 >= this._count) {
                            this.close()
                        }
                    })
                }
            }
        })
    }

    onPressClose() {
        // let order =  storage.get("result_order")
        // storage.set("result_order", Number(order) + 1)
        this.close()
    }
}
