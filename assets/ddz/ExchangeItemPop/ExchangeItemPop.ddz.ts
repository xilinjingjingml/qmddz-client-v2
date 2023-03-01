import { NodeExtends } from "../../base/extends/NodeExtends"
import BasePop from "../../base/view/BasePop"
import { appfunc } from "../../lobby/appfunc"
import { AudioManager } from "../audio/AudioManager.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class ExchangeItemPop extends BasePop {

    params: { itemId: number, exchangeInfo: IExchangeInfo }

    start() {
        const exchangeNum = this.params.exchangeInfo.exchangeItemList[0].exchangeNum
        const gainNum = this.params.exchangeInfo.gainItemList[0].gainNum
        const itemName = appfunc.getItemName(this.params.itemId)

        this.$("label_title", cc.Label).string = itemName + "数量不足"
        this.$("label_content", cc.Label).string = `是否消耗${exchangeNum}福卡购买${gainNum}个${itemName}？`
        this.$("label_fucard", cc.Label).string = exchangeNum + ""
        this.$("item_desc", cc.Label).string = `看底牌卡x${gainNum}`

        const info = appfunc.getItemIconInfo(this.params.itemId)
        if (info) {
            this.setSprite({ node: this.$("item_icon"), bundle: info.bundle, path: info.path, adjustSize: true })
        }
    }

    onPressGet(event: cc.Event.EventTouch) {
        AudioManager.playMenuEffect()
        NodeExtends.cdTouch(event)
        appfunc.exchangeAward(this.params.exchangeInfo.goodsId, () => this.isValid && this.close())
    }
}