import { monitor } from "../../base/monitor"
import { ITEM } from "../config"

export class User {
    guid: number = 0
    nickname: string = ""
    ticket: string = ""
    sex: number = 0
    face: string = ""
    imei: string = ""
    openId: string = ""
    gift: number = 0
    money: number = 0
    score: number = 0
    won: number = 0
    lost: number = 0
    money_rank: number = 0
    won_rank: number = 0
    ply_state: Iproto_PlayerStatus
    items: Record<number, Iproto_ItemData> = {}

    getItemNum(itemId: ITEM) {
        if (itemId == ITEM.GOLD_COIN) {
            return this.money
        }

        return this.items[itemId]?.num ?? 0
    }

    updateItems(items: Iproto_ItemData[]) {
        const ids = new Set<string>()
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const itemId = item.index
            if (itemId == ITEM.GOLD_COIN) {
                continue
            }
            ids.add(itemId + "")

            if (this.items[itemId]) {
                this.setItemNum(itemId, item.num)
            } else {
                this.items[itemId] = item
                monitor.emit("item_update", itemId, item.num)
            }
        }

        for (const key in this.items) {
            if (!ids.has(key)) {
                this.setItemNum(this.items[key].index, 0)
            }
        }
    }

    setItemNum(itemId: ITEM, itemNum: number) {
        if (itemId == ITEM.GOLD_COIN) {
            if (this.money != itemNum) {
                this.money = itemNum
                monitor.emit("item_update", itemId, itemNum)
            }
            return
        }

        const item = this.items[itemId]
        if (item) {
            if (item.num != itemNum) {
                item.num = itemNum
                monitor.emit("item_update", itemId, itemNum)
            }
            return
        }

        this.items[itemId] = { index: itemId, num: itemNum, gameId: 0, param_1: 0, param_2: 0, name: "", url: "" }
        monitor.emit("item_update", itemId, itemNum)
    }
}
