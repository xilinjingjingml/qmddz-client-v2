import { audio } from "../../base/audio"
import { math } from "../../base/math"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import BaseAdPop from "../../start/scripts/components/BaseAdPop"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class Awards extends BaseAdPop {

    params: { awards: IAward[] }
    bannerIndex: number = 0

    items: { model: cc.Node, num: number, target: cc.Vec2 }[] = []
    aniCount: number = 0

    start() {
        const awards = this.params?.awards || []
        if (awards.length === 0) {
            this.close()
            return
        }

        const model = this.$("item")
        model.removeFromParent()

        const container = this.$("container")

        awards.sort((a, b) => a.index === ITEM.INGOT ? 1 : b.index === ITEM.INGOT ? -1 : a.index > b.index ? -1 : 1)

        for (const a of awards) {
            if (!a) continue
            
            const item = cc.instantiate(model)
            item.parent = container

            // const num = a.index != ITEM.TO_CASH ? a.num : math.fixd(appfunc.toCash(a.num)) + "元"
            // cc.find("labelDesc", item).getComponent(cc.Label).string = (appfunc.getItemName(a.index) || "未知") + "x" + num

            cc.find("labelDesc", item).getComponent(cc.Label).string = a.index === ITEM.TO_CASH ? math.fixd(a.num / 100) + "元" : "" + a.num

            const info = appfunc.getItemIconInfo(a.index)
            if (info) {
                this.setSprite({ node: cc.find("icon", item), bundle: info.bundle, path: info.path, adjustSize: true })
            }

            if (a.index === ITEM.TO_CASH && app.datas.cashVec) {
                this.setSprite({ node: cc.find("icon0", item), bundle: info.bundle, path: "common/icons/icon_382_2", adjustSize: true })
                this.items.push({ model: cc.find("icon0", item), num: Math.floor(a.num / 100), target: app.datas.cashVec })
            } else if (a.index === ITEM.INGOT && app.datas.ingotVec) {
                this.setSprite({ node: cc.find("icon0", item), bundle: info.bundle, path: "common/icons/icon_384_1", adjustSize: true })
                this.items.push({ model: cc.find("icon0", item), num: a.num / 100, target: app.datas.ingotVec })
            }
        }

        model.destroy()
        audio.playEffect({ bundle: "lobby", path: "awards/audios/gxhd" })

        if (awards.some(a => a.index == ITEM.TO_CASH)) {
            audio.playEffect({ bundle: "lobby", path: "awards/audios/hb_coming" })
        }
    }

    onPressClose() {
        audio.playMenuEffect()
        // if (!storage.get("first_cashout") && app.user.getItemNum(ITEM.INGOT) > 3000) {
        //     appfunc.showCashOutPop()
        //     storage.set("first_cashout", true)
        // }
        // this.close()

        this.node.children.forEach(i => i.active = false)

        this.items.forEach(i => {
            this.fakeMoneyAni(i.model, i.num, i.target)
        })

        setTimeout(() => {
            this.isValid && this.close()
        }, 1000);
    }

    fakeMoneyAni(model: cc.Node, num: number, target: cc.Vec2) {
        const container = this.node
        const sprNum = Math.max(5, num) * 2

        let count = 0
        let self = this

        target = this.node.convertToNodeSpaceAR(target)

        for (let i = 0; i < sprNum; i++) {
            const spr = cc.instantiate(model)
            spr.active = true
            spr.scale = .5
            spr.position = this.node.convertToNodeSpaceAR(model.convertToWorldSpaceAR(cc.v3()))
            spr.x += Math.floor(Math.random() * 200 - 100)
            spr.y += Math.floor(Math.random() * 100 - 180)
            spr.parent = container
            const t = Math.random() * 3 / 10 + 0.3
            spr.runAction(cc.sequence(
                // cc.delayTime(0.5),
                cc.spawn(
                    cc.fadeTo(t, 200),
                    cc.jumpTo(t, target.x + Math.random() * 100 - 50, target.y + Math.random() * 40 - 20, 80, 1).easing(cc.easeSineInOut()),
                    cc.scaleTo(t, Math.random() * 2 / 10 + 0.2).easing(cc.easeSineInOut())
                ),
                cc.callFunc(() => {
                    count++
                    if (!self.isValid) return

                    if (count === sprNum) {
                        self.aniCount++
                    }

                    if (self.aniCount === self.items.length) {
                        self.close()
                    }
                }),
                cc.removeSelf()
            ))
        }
    }
}
