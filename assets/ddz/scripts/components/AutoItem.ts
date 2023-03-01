import { listen } from "../../../base/monitor"
import BaseView from "../../../base/view/BaseView"
import { app } from "../../../start/app"
import { ITEM } from "../../../start/config"

const { ccclass, property, disallowMultiple, menu, requireComponent } = cc._decorator

@ccclass
@disallowMultiple
@menu("component/AutoItem")
@requireComponent(cc.Label)
export default class AutoItem extends BaseView {

    @property({ type: cc.Enum(ITEM) })
    itemId = ITEM.TO_CASH

    start() {
        this.setItem(this.itemId, app.user.getItemNum(this.itemId))
    }

    @listen("item_update")
    setItem(itemId: ITEM, itemNum: number) {
        if (itemId != this.itemId) {
            return
        }
        this.getComponent(cc.Label).string = "" + itemNum
    }
}
