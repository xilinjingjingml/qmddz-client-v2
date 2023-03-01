import AutoLoad from "../../base/components/AutoLoad"
import FrameAnimation from "../../base/components/FrameAnimation"
import { NodeExtends } from "../../base/extends/NodeExtends"
import { math } from "../../base/math"
import { listen, monitor } from "../../base/monitor"
import { appfunc } from "../../lobby/appfunc"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { AudioManager } from "../audio/AudioManager.ddz"
import AreaCard from "../card/AreaCard.ddz"
import { chatEmojis, ChatPrefix, chatTexts, ChatType } from "../chat/chat.ddz"
import { EOperate, EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import { ECardPoint, GameRule } from "../game/GameRule.ddz"
import { GameView } from "../game/GameView.ddz"
import BaseChair from "../scripts/base/BaseChair.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class player extends BaseChair {
    data: Iproto_PlyBaseData
    operate: EOperate
    operateRuning: boolean
    operatActive: boolean
    items: Record<number, number> = {}
    nHBNum: number = 0

    onLoad() {
        GameFunc.setPlayer(this.params.chairId, this)

        this.$("avater", AutoLoad).params = { chairId: this.params.chairId }
        if (this.$("node_clock")) {
            this.$("node_clock", AutoLoad).params = { chairId: this.params.chairId }
        }

        this.setItem(ITEM.GOLD_COIN, 0)
        this.setItem(ITEM.REDPACKET_TICKET, 0)
        this.setItem(ITEM.TO_CASH, 0)
    }

    start() {
        this.node.active = false
    }

    onGameJoin() {
        cc.log("[player.onGameJoin]", this.params.chairId)
        this.operateRuning = false
        this.operatActive = false

        this.refreshHandCards([])

        this.node.active = true

        this.$("node_poke").active = false
        this.$("spt_putover").active = false
        this.$("node_hb_change").active = false
        this.$("node_chat").active = false
        this.refreshPutCards([])
    }

    @listen(EventName.game_start)
    onGameStart() {
        cc.log("[player.onGameStart]", this.params.chairId)
        this.node.active = true

        this.$("node_poke").active = true
        this.$("spt_putover").active = false
        this.$("node_hb_change").active = false
        this.$("node_chat").active = false
        this.refreshPutCards([])
    }

    onGameLeave() {
        cc.log("[player.onFsmLeave]", this.params.chairId)
        this.node.active = false
        this.items = {}
        this.nHBNum = 0
    }

    @listen(EventName.game_reinit)
    onGameReinit() {
        cc.log("[player.onGameReinit]", this.params.chairId)
        this.operateRuning = false
        this.operatActive = false
        this.refreshHandCards([])

        this.$("node_poke").active = false
        this.$("spt_putover").active = false
        this.$("node_hb_change").active = false
        this.$("node_chat").active = false
        this.refreshPutCards([])
    }

    // 更新玩家数据
    setData(data: Iproto_PlyBaseData) {
        this.data = data

        // TODO
        // 昵称
        // const label_name = this.$("label_name", cc.Label)
        // if (label_name) {
        //     label_name.string = utils.substr(this.data.nickname, 5)
        // }
        // IP
        const label_localtion = this.$("label_localtion", cc.Label)
        if (label_localtion) {
            label_localtion.string = appfunc.randomArea(data.plyGuid) + "市"
        }
        // 金豆
        this.setItem(ITEM.GOLD_COIN, data.money)
        // 准备
        this.showOperate(data.ready == 1 ? EOperate.CO_READY : EOperate.CO_NEW)
    }

    // 设置玩家道具数量
    setItem(itemId: number, itemNum: number) {
        if (itemId == ITEM.GOLD_COIN) {
            this.$("label_gold", cc.Label).string = math.short(itemNum) + ""
        } else if (itemId == ITEM.REDPACKET_TICKET) {
            this.$("label_fucard", cc.Label).string = math.short(itemNum) + ""
        } else if (itemId == ITEM.TO_CASH) {
            this.$("label_hb", cc.Label).string = appfunc.toCash(itemNum).toFixed(2) + "元"
        }

        this.items[itemId] = itemNum
    }

    // 显示玩家操作文字
    showOperate(operate: EOperate = EOperate.CO_NONE) {
        let opath = ""
        let audio = ""
        if (operate == EOperate.CO_NONE) {
            this.hideOperate()
            return
        } else if (operate == EOperate.CO_NEW) {
            this.hideOperate()
            return
        } else if (operate == EOperate.CO_CALL0) {
            opath = "op_bujiao"
            audio = "audio_score0"
        } else if (operate == EOperate.CO_CALL1) {
            opath = "op_1fen"
            audio = "audio_score1"
        } else if (operate == EOperate.CO_CALL2) {
            opath = "op_2fen"
            audio = "audio_score2"
        } else if (operate == EOperate.CO_CALL3) {
            opath = "op_3fen"
            audio = "audio_score3"
        } else if (operate == EOperate.CO_CALLROB) {
            opath = "op_jiaodizhu"
            audio = "audio_call_lord"
        } else if (operate == EOperate.CO_NOTROB) {
            opath = "op_buqiang"
            audio = "audio_no_rob"
        } else if (operate == EOperate.CO_ROB) {
            opath = "op_qiangdizhu"
            audio = "audio_rob"
        } else if (operate == EOperate.CO_GIVEUP) {
            opath = "op_buchu"
            audio = "audio_pass_type_" + math.random(1, 4)
        } else if (operate == EOperate.CO_SHOWCARD) {
            opath = "op_mingpai"
            audio = "audio_show"
            this.isMyPlayer && monitor.emit(EventName.game_showCard)
        } else if (operate == EOperate.CO_TIMEOUT) {
            return
        } else if (operate == EOperate.CO_READY) {
            opath = "op_ready"
        } else if (operate == EOperate.CO_NOLORD) {
            return
        } else if (operate == EOperate.CO_F_DOUBLE) {
            opath = "op_bujiabei"
        } else if (operate == EOperate.CO_T_DOUBLE) {
            opath = "op_jiabei"
            audio = "audio_jiabei"
        } else if (operate == EOperate.CO_SUPER_T_DOUBLE) {
            opath = "op_chaojijiabei"
            audio = "audio_superdouble"
        } else {
            this.hideOperate()
            return
        }

        if (audio) {
            AudioManager.playEffect(audio, this.data.sex)
        }

        const node = this.$("spt_operate")
        this.operate = operate
        this.operateRuning = true
        this.operatActive = true
        this.setSprite({
            bundle: GameFunc.bundle,
            path: "player/images/operate/" + opath,
            node: node,
            delay: true,
            callback: () => {
                if (this.operate != operate) {
                    node.active = false
                    return
                }

                cc.Tween.stopAllByTarget(node)
                cc.tween(node)
                    .set({ scale: 0.1 })
                    .to(0.3, { scale: 1.2 })
                    .delay(0.5)
                    .call(() => {
                        this.operateRuning = false
                        if (!this.operatActive) {
                            node.active = false
                        }
                    })
                    .start()
            }
        })
    }

    hideOperate() {
        if (this.operateRuning) {
            this.operatActive = false
        } else {
            this.$("spt_operate").active = false
        }
    }

    showPutOver() {
        const node = this.$("spt_putover")
        node.active = true
        cc.tween(node)
            .set({ opacity: 0, scale: 0 })
            .delay(0.5)
            .to(0.3, { opacity: 255, scale: 1 })
            .delay(3)
            .to(0.1, { opacity: 0 })
            .call(() => node.active = false)
            .start()
    }

    @listen(EventName.game_player_hb_change)
    setHBChange(sChairId: number, num: number) {
        if (!this.isSelf(sChairId)) {
            return
        }

        // 攒满spine
        if (this.$("spine_zanman")) {
            if (this.nHBNum < appfunc.CASH_OUT_NUM && num >= appfunc.CASH_OUT_NUM) {
                this.$("spine_zanman").active = true
                const skeleton = this.$("spine_zanman", sp.Skeleton)
                skeleton.setAnimation(0, "kaishi", false)
                skeleton.setCompleteListener(() => {
                    let count = 0
                    skeleton.setAnimation(0, "xunhuan", true)
                    skeleton.setCompleteListener(() => {
                        count++
                        if (count == 2) {
                            skeleton.setCompleteListener(null)
                            if (this.isValid) {
                                this.$("spine_zanman").active = false
                            }
                        }
                    })
                })
            }
        }

        // 变化label
        this.$("node_hb_change").active = true
        this.$("label_hb_win").active = false
        this.$("label_hb_lose").active = false

        const node = num > 0 ? this.$("label_hb_win") : this.$("label_hb_lose")
        node.getComponent(cc.Label).string = (num > 0 ? "+" : "") + appfunc.toCash(num).toFixed(2) + "元"
        node.active = true

        cc.Tween.stopAllByTarget(node)
        this.playHbChangeAni(node)
    }

    playHbChangeAni(node: cc.Node) {
        cc.tween(node)
            .set({ opacity: 100 })
            .to(0.2, { opacity: 255 })
            .to(0.2, { opacity: 100 })
            .to(0.2, { opacity: 255 })
            .delay(0.5)
            .to(0.1, { opacity: 0 })
            .call(() => node.active = false)
            .start()
    }

    // 更新手牌
    refreshHandCards(cards: Iproto_CCard[]) {
        const nodeHandcard = this.$("node_handcard")
        const areaCard = this.$("node_handcard", AreaCard)
        const showCard = cards.some(card => card.mNValue >= ECardPoint.P3 && card.mNValue <= ECardPoint.Wang)

        const label = this.$("label_handnum", cc.Label)
        label.string = cards.length + ""
        areaCard.refreshCards({
            cards: showCard ? cards : [],
            cleanCards: false,
            showLord: this.isLord,
            showCard: false,
        })

        cc.Tween.stopAllByTarget(nodeHandcard)
        if (showCard && areaCard.cards.length == 0 && cards.length > 0 && !GameFunc.isGameRuning()) {
            let i = 0
            label.string = "0"
            nodeHandcard.children.forEach(child => child.active = false)
            cc.tween(nodeHandcard)
                .then(cc.tween()
                    .call(() => {
                        nodeHandcard.children[i++].active = true
                        label.string = i + ""
                    })
                    .delay(0.04))
                .repeat(cards.length)
                .call(() => {
                    nodeHandcard.children.forEach(child => {
                        const x = child.x
                        cc.tween(child)
                            .to(0.15, { x: 0 })
                            .to(0.15, { x: x })
                            .start()
                    })
                })
                .start()
        }
    }

    // 更新出牌
    refreshPutCards(cards: Iproto_CCard[]) {
        this.showOperate()

        this.$("node_putcard", AreaCard).refreshCards({ cards: cards, cleanCards: true, showLord: this.isLord, showCard: false })
        // 出牌动画
        if (cards.length > 0) {
            cc.tween(this.$("node_putcard"))
                .to(0.05, { scale: 1 - 0.05 })
                .to(0.05, { scale: 1 + 0.1 })
                .to(0.05, { scale: 1 })
                .start()
        }
    }

    onPressAvater(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        if (this.isMyPlayer || GameFunc.isGameRuning()) {
        } else {
            return
        }

        let data = this.data
        if (data == null && this.isMyPlayer) {
            data = { plyGuid: app.user.guid, sex: app.user.sex, nickname: app.user.nickname, money: app.user.getItemNum(ITEM.GOLD_COIN) } as any
        }
        if (data == null) {
            return
        }

        GameView.showPlayerInfoPop({
            type: this.isMyPlayer ? 0 : 1,
            data: data,
            localtion: this.isMyPlayer ? app.datas.IPLocation?.city : (appfunc.randomArea(data.plyGuid) + "市"),
            nHB: this.items[ITEM.TO_CASH] || 0,
            nFuCard: this.items[ITEM.REDPACKET_TICKET] || 0,
        })
    }

    @listen("proto_bc_update_ply_data_not")
    proto_bc_update_ply_data_not(message: Iproto_bc_update_ply_data_not) {
        if (this.data?.plyGuid == message.plyGuid) {
            this.setItem(ITEM.GOLD_COIN, message.amount)
        }
    }

    @listen("proto_bc_specify_item_update_not")
    proto_bc_specify_item_update_not(message: Iproto_bc_specify_item_update_not) {
        if (this.data?.plyGuid == message.plyGuid) {
            this.setItem(message.index, message.num)
        }
    }

    @listen("proto_bc_join_table_ack")
    proto_bc_join_table_ack(message: Iproto_bc_join_table_ack) {
        if (message.ret == 0) {
            for (const plyData of message.tableAttrs.players) {
                if (this.isSelf(plyData.chairId)) {
                    this.onGameJoin()
                    this.setData(plyData)
                    break
                }
            }
        }
    }

    @listen("proto_bc_ply_join_not")
    proto_bc_ply_join_not(message: Iproto_bc_ply_join_not) {
        if (!this.isSelf(message.plyData.chairId)) {
            return
        }
        this.onGameJoin()
        this.setData(message.plyData)
    }

    @listen("proto_bc_ply_leave_not")
    proto_bc_ply_leave_not(message: Iproto_bc_ply_leave_not) {
        if (this.data?.plyGuid == message.plyGuid) {
            this.onGameLeave()
        }
    }

    @listen("proto_bc_ready_not")
    proto_bc_ready_not(message: Iproto_bc_ready_not) {
        if (this.data?.plyGuid == message.plyGuid) {
            this.showOperate(EOperate.CO_READY)
        }
    }

    @listen("proto_gc_update_player_tokenmoney_not")
    proto_gc_update_player_tokenmoney_not(message: Iproto_gc_update_player_tokenmoney_not) {
        if (!this.isSelf(message.plyChairid)) {
            return
        }
        if (this.isMyPlayer) {
            message.itemInfo.forEach(info => app.user.setItemNum(info.nItemIndex, info.nItemNum64))
            return
        }
        message.itemInfo.forEach(info => this.setItem(info.nItemIndex, info.nItemNum64))
    }

    @listen("proto_gc_clienttimer_not")
    proto_gc_clienttimer_not(message: Iproto_gc_clienttimer_not) {
        if (!this.isSelf(message.chairId)) {
            return
        }
        this.refreshPutCards([])
    }

    @listen("proto_gc_common_not")
    proto_gc_common_not(message: Iproto_gc_common_not) {
        if (message.cChairID < 0 || this.isSelf(message.cChairID)) {
            this.showOperate(message.nOp)
        }
    }

    @listen("proto_gc_show_card_not")
    proto_gc_show_card_not(message: Iproto_gc_show_card_not) {
        if (!this.isSelf(message.nChairID)) {
            return
        }
        this.showOperate(EOperate.CO_SHOWCARD)
        this.refreshHandCards(message.vecCards)
        if (message.vecCards.length == 0) {
            this.showPutOver()
        }
    }

    @listen("proto_gc_refresh_card_not")
    proto_gc_refresh_card_not(message: Iproto_gc_refresh_card_not) {
        if (!this.isSelf(message.cChairID)) {
            return
        }
        this.refreshHandCards(message.vecCards)
        if (message.vecCards.length == 0) {
            this.showPutOver()
        }
    }


    @listen("proto_gc_play_card_not")
    proto_gc_play_card_not(message: Iproto_gc_play_card_not) {
        if (!this.isSelf(message.cChairID)) {
            return
        }
        this.refreshPutCards(message.vecCards)
        this.playPutCardsSound(message.cType)
    }

    @listen("proto_bc_chat_not")
    proto_bc_chat_not(message: Iproto_bc_chat_not) {
        if (this.data?.plyGuid != message.plyGuid) {
            return
        }

        this.$("chat_bubble_text").active = false
        this.$("chat_bubble_emoji").active = false

        const front = message.message.substr(0, 4)
        const end = message.message.substr(4)
        if (front == ChatPrefix[ChatType.Text]) {
            let chatData: { id: number, text: string, audio: string }
            for (const data of chatTexts) {
                if ((data.id + "") == end) {
                    chatData = data
                    break
                }
            }

            if (!chatData) {
                return
            }

            this.$("node_chat").active = true
            cc.Tween.stopAllByTarget(this.$("node_chat"))

            this.$("chat_bubble_text").active = true
            this.$("chat_label", cc.Label).string = chatData.text
            AudioManager.playEffect("audio_chat_" + chatData.id, null, () => {
                this.$("node_chat").active = false
            })
        } else if (front == ChatPrefix[ChatType.Emoji]) {
            let chatData: { id: number, icon: string, emoji: string }
            for (const data of chatEmojis) {
                if ((data.id + "") == end) {
                    chatData = data
                    break
                }
            }

            if (!chatData) {
                return
            }

            this.$("node_chat").active = true
            cc.Tween.stopAllByTarget(this.$("node_chat"))

            const nodeEmoji = this.$("chat_bubble_emoji")
            nodeEmoji.active = true

            const name = chatData.id + ""
            const frameAnimation = this.$("chat_emoji", FrameAnimation)
            frameAnimation.setSpirte(name)

            const size = this.$("chat_emoji").getContentSize()
            nodeEmoji.setContentSize(cc.size(size.width + 40, size.height + 40))
            this.$("chat_emoji").y = (0.5 - nodeEmoji.anchorY) * nodeEmoji.height

            const frameAnimationClip = frameAnimation.getFrameAnimationClip(name)
            let count = frameAnimationClip ? Math.floor(10 / frameAnimationClip.total) : 1
            const playAni = () => {
                count--
                if (count < 0) {
                    this.$("node_chat").active = false
                    return
                }

                const animation = this.$("chat_emoji", cc.Animation)
                animation.targetOff(this)
                animation.play(name)
                animation.on("finished", playAni, this)
            }
            playAni()
        }
    }

    playPutCardsSound(cardType: Iproto_CCardsType) {
        if (cardType.mNTypeNum == 0) {
            return
        }

        AudioManager.playEffect("audio_putcard")

        if (cardType.mNTypeNum == 1) {
            AudioManager.playEffect("audio_" + cardType.mNTypeValue, this.data.sex)
        } else if (cardType.mNTypeNum == 2 && cardType.mNTypeValue != ECardPoint.Wang) {
            AudioManager.playEffect("audio_2_" + cardType.mNTypeValue, this.data.sex)
        } else if (cardType.mNTypeNum == 3) {
            AudioManager.playEffect("audio_3_0", this.data.sex)
            this.scheduleOnce(() => AudioManager.playEffect("audio_" + cardType.mNTypeValue, this.data.sex), 0.4)
        } else if (cardType.mNTypeNum == 31) {
            AudioManager.playEffect("audio_3_1", this.data.sex)
        } else if (cardType.mNTypeNum == 32) {
            AudioManager.playEffect("audio_3_2", this.data.sex)
        } else if (cardType.mNTypeNum == 411 || cardType.mNTypeNum == 422) {
            AudioManager.playEffect("audio_4_2", this.data.sex)
        } else if (cardType.mNTypeNum == 4) {
            AudioManager.playEffect("audio_bomb_0", this.data.sex)
        } else if (GameRule.checkShunZi(cardType.mNTypeNum)) {
            AudioManager.playEffect("audio_danshun", this.data.sex)
        } else if (GameRule.checkLianDui(cardType.mNTypeNum)) {
            AudioManager.playEffect("audio_duiduishun", this.data.sex)
        } else if (GameRule.checkFeiJi(cardType.mNTypeNum)) {
            AudioManager.playEffect("audio_feiji", this.data.sex)
        }
    }
}
