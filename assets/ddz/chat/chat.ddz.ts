import { listen } from "../../base/monitor"
import { utils } from "../../base/utils"
import BaseView from "../../base/view/BaseView"
import { AudioManager } from "../audio/AudioManager.ddz"
import { EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"

const { ccclass } = cc._decorator

export enum ChatType {
    Text = 1,
    Emoji,
}

export const ChatPrefix = {
    [ChatType.Text]: "<B┃┃",
    [ChatType.Emoji]: "<A┃┃",
}

export const chatTexts: { id: number, text: string, audio: string }[] = [
    { id: 6, text: "喂，快点出呀，别总是磨磨蹭蹭", audio: "chat_6" },
    { id: 0, text: "大家好，很高兴见到各位", audio: "chat_0" },
    { id: 2, text: "你的牌打得忒好了呀", audio: "chat_2" },
    { id: 3, text: "和你合作真是太愉快了", audio: "chat_3" },
    { id: 4, text: "不管是小牌还是杂牌，到了我手里都是好牌", audio: "chat_4" },
    { id: 5, text: "别想了，快把牌拆了，随便出一张吧", audio: "chat_5" },
    { id: 7, text: "我的天哪，我一张牌也没出，不会吧", audio: "chat_7" },
    { id: 8, text: "有没有搞错，这牌也太烂了吧", audio: "chat_8" },
    { id: 9, text: "哎，怎么会是这样啊", audio: "chat_9" },
]

export const chatEmojis: { id: number, icon: string, emoji: string }[] = [
    { id: 1, icon: "a1_1_win", emoji: "ani_a1_1_win" },
    { id: 2, icon: "a1_2_xiao", emoji: "ani_a1_2_xiao" },
    { id: 3, icon: "a1_3_ku", emoji: "ani_a1_3_ku" },
    { id: 4, icon: "a1_4_bisheng", emoji: "ani_a1_4_bisheng" },
    { id: 5, icon: "a1_5_ai", emoji: "ani_a1_5_ai" },
    { id: 6, icon: "a1_6_tiaoxin", emoji: "ani_a1_6_tiaoxin" },
    { id: 7, icon: "a1_7_chifan", emoji: "ani_a1_7_chifan" },
    { id: 8, icon: "a1_8_bishi", emoji: "ani_a1_8_bishi" },
    { id: 9, icon: "a1_9_waiting", emoji: "ani_a1_9_waiting" },
    { id: 10, icon: "a1_10_zhuangkuang", emoji: "ani_a1_10_zhuakuang" },
    { id: 11, icon: "a1_11_yun", emoji: "ani_a1_11_yun" },
    { id: 12, icon: "a1_12_ice", emoji: "ani_a1_12_ice" },
    { id: 13, icon: "a1_13_guzhang", emoji: "ani_a1_13_guzhang" },
    { id: 14, icon: "a1_14_han", emoji: "ani_a1_14_han" },
    { id: 15, icon: "a1_15_fa", emoji: "ani_a1_15_fa" },
    { id: 16, icon: "a1_16_shuai", emoji: "ani_a1_16_shuai" },
    { id: 17, icon: "a1_17_dahan", emoji: "ani_a1_17_dahan" },
    { id: 18, icon: "a1_18_fire", emoji: "ani_a1_18_fire" },
]

@ccclass
export default class chat extends BaseView {
    start() {
        this.$("node_chat").active = false
        this.$("item_text").active = false
        this.$("item_emoji").active = false

        this.setTab(ChatType.Text)
    }

    initViewText() {
        this.$("node_text", cc.ScrollView).scrollToTop()

        const item = this.$("item_text")
        const content = item.parent
        if (content.childrenCount > 1) {
            return
        }

        chatTexts.forEach((data, i) => {
            const node = cc.instantiate(item)
            node.active = true
            node.parent = content

            const $ = utils.mark(node)
            utils.$($, "line").active = i != 0
            utils.$($, "label", cc.Label).string = data.text
            node.getComponent(cc.Button).clickEvents[0].customEventData = "" + data.id
        })
    }

    initViewEmoji() {
        this.$("node_emoji", cc.ScrollView).scrollToTop()

        const item = this.$("item_emoji")
        const content = item.parent
        if (content.childrenCount > 1) {
            return
        }

        chatEmojis.forEach((data, i) => {
            const node = cc.instantiate(item)
            node.active = true
            node.parent = content

            const $ = utils.mark(node)
            this.setSprite({ node: utils.$($, "icon"), bundle: GameFunc.bundle, path: "chat/images/" + data.icon, delay: true })
            node.getComponent(cc.Button).clickEvents[0].customEventData = "" + data.id
        })
    }

    setTab(type: ChatType) {
        this.$("node_text").active = type == ChatType.Text
        this.$("node_emoji").active = type == ChatType.Emoji

        if (type == ChatType.Text) {
            this.initViewText()
        } else if (type == ChatType.Emoji) {
            this.initViewEmoji()
        }
    }

    onPressChat(event: cc.Event.EventTouch) {
        AudioManager.playMenuEffect()
        this.$("node_chat").active = !this.$("node_chat").active
    }

    onPressTab(event: cc.Event.EventTouch, data: string) {
        AudioManager.playMenuEffect()
        this.setTab(parseInt(data))
    }

    onPressText(event: cc.Event.EventTouch, data: string) {
        AudioManager.playMenuEffect()
        this.sendChat(ChatType.Text, data)
    }

    onPressEmoji(event: cc.Event.EventTouch, data: string) {
        AudioManager.playMenuEffect()
        this.sendChat(ChatType.Emoji, data)
    }

    sendChat(type: ChatType, index: string) {
        GameFunc.send<Iproto_cb_chat_req>("proto_cb_chat_req", { type: 0, message: ChatPrefix[type] + index })
        this.$("node_chat").active = false
    }

    @listen(EventName.game_end)
    onGameEnd() {
        this.$("node_chat").active = false
    }
}
