import { math } from "../../base/math"
import { listen } from "../../base/monitor"
import BaseView from "../../base/view/BaseView"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"

const { ccclass } = cc._decorator

@ccclass
export default class UserCtrl extends BaseView {

    start() {
        this.$("labelName", cc.Label).string = app.user.nickname
        this.setSprite({ node: this.$("face"), path: app.user.face, adjustSize: true })

        this.setItemNum()
    }

    @listen("user_data_update")
    setItemNum() {
        this.$("labelFuCardNum", cc.Label).string = math.short(app.user.getItemNum(ITEM.REDPACKET_TICKET))
        this.$("labelGoldBeanNum", cc.Label).string = math.short(app.user.getItemNum(ITEM.GOLD_COIN))
    }

    @listen("main_view_change")
    onChangeView(param: any) {
        this.$("nodeItem").active = param.type == 1 ? false : true
    }
}
