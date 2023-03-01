import BaseView from "../../base/view/BaseView"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class ActivitySignItem extends BaseView {

    setData(data: { index: number, signed: boolean, choose: boolean, data: ISignData }) {
        this.$("label_time", cc.Label).string = "第" + (data.index + 1) + "天"
        this.$("sign_black").active = data.signed
        this.$("sign_mask").active = data.signed
        this.$("item_choose").active = data.choose

        if (data.data.itemConfig.length > 0) {
            const item = data.data.itemConfig[0]
            const itemInfo = appfunc.getItemIconInfo(item.itemIndex)
            this.setSprite({
                node: this.$("item_icon"),
                bundle: itemInfo.bundle,
                path: itemInfo.path,
                adjustSize: true
            })

            this.$("label_desc", cc.Label).string = appfunc.getItemName(item.itemIndex) + "x" + item.itemNum
            return
        }

        this.setSprite({ node: this.$("item_icon"), path: data.data.descImg, adjustSize: true })
        this.$("label_desc", cc.Label).string = data.data.desc
    }
}
