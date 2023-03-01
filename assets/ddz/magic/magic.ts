import FrameAnimation from "../../base/components/FrameAnimation"
import { listen } from "../../base/monitor"
import BaseView from "../../base/view/BaseView"
import { GameFunc } from "../game/GameFunc.ddz"

const { ccclass, property } = cc._decorator

@ccclass
export default class magic extends BaseView {

    @property(cc.Node)
    magic: cc.Node = null

    start() {
        this.magic.active = false
    }

    getPlayerPos(sChairId: number) {
        const pos = GameFunc.getPlayerPos(GameFunc.S2C(sChairId))
        if (pos == null) {
            return
        }

        return this.node.convertToNodeSpaceAR(pos)
    }

    @listen("proto_magic_emoji_noti")
    proto_magic_emoji_noti(message: Iproto_magic_emoji_noti) {
        if (message.cIsError != 0) {
            return
        }

        const fromPos = this.getPlayerPos(message.cFromChairID)
        if (fromPos == null) {
            cc.error("[magic] not find pos:fromPos")
            return
        }

        const toPos = this.getPlayerPos(message.cToChairID)
        if (toPos == null) {
            cc.error("[magic] not find pos:toPos")
            return
        }

        const name = "magic" + message.cEmojiIndex

        const node = cc.instantiate(this.magic)
        node.active = true
        node.parent = this.node
        node.setPosition(fromPos)
        node.getComponent(FrameAnimation).setSpirte(name)
        cc.tween(node)
            .set({ opacity: 0 })
            .to(0.5, { opacity: 255 })
            .to(0.5, { x: toPos.x, y: toPos.y })
            .call(() => {
                const animation = node.getComponent(cc.Animation)
                animation.play(name)
                animation.on("finished", () => {
                    node.destroy()
                })
            })
            .start()
    }
}
