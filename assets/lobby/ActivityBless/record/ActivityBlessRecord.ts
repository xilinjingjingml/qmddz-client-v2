import { storage } from "../../../base/storage"
import { time } from "../../../base/time"
import { utils } from "../../../base/utils"
import BasePop from "../../../base/view/BasePop"
import { app } from "../../../start/app"
import { IBlessRecordData } from "../bless/ActivityBless"

const { ccclass } = cc._decorator

@ccclass
export default class ActivityBlessRecord extends BasePop {

    start() {
        let datas: IBlessRecordData[] = storage.getToday("bless_record") || []
        datas = datas.filter(data => data.uid == app.user.guid)

        const item = this.$("item")
        item.active = false

        for (let i = 0; i < datas.length; i++) {
            const node = cc.instantiate(item)
            node.active = true
            node.parent = this.$("content")

            const data = datas[i]
            const $ = utils.mark(node)
            utils.$($, "item_line").active = i != 0
            utils.$($, "type_ad").active = data.ad
            utils.$($, "type_free").active = !data.ad
            utils.$($, "label_bless", cc.Label).string = "" + data.value
            utils.$($, "label_time", cc.Label).string = "时间：" + time.format("hh:mm:ss", Math.floor(data.time / 1000))
        }
    }
}
