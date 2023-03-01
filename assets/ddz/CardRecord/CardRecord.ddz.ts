import { NodeExtends } from "../../base/extends/NodeExtends"
import { listen, monitor } from "../../base/monitor"
import BaseView from "../../base/view/BaseView"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { AudioManager } from "../audio/AudioManager.ddz"
import { EPlayer, EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import { ECardPoint } from "../game/GameRule.ddz"
import { isFuCard } from "../scripts/components/conditions/FuCardCondition.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class CardRecord extends BaseView {
    cardsCount: number[] = []
    cards: Iproto_CCard[] = []

    start() {
        this.initCardCount()
        this.showCardCount(false)
    }

    onPressCardCount(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        this.showCardCount(!this.$("node_card_count").active, true)
    }

    showCardCount(show: boolean, handle: boolean = false) {
        if (show) {
            if (isFuCard()) {
                if (app.user.getItemNum(ITEM.CARD_RECORD) <= 0) {
                    if (handle) {
                        monitor.emit(EventName.game_exchange_item, {
                            itemId: ITEM.CARD_RECORD,
                            success: () => this.isValid && this.showCardCount(show, handle),
                            fail: () => this.isValid && startFunc.showToast("您的记牌器不足，本局结束后可观看领取！"),
                        })
                    }
                    return
                }
            }

            if (app.user.getItemNum(ITEM.CARD_RECORD) <= 0) {
                if (handle) {
                    startFunc.showToast("您的记牌器不足，本局结束后可观看领取！")
                }
                return
            }

            if (!GameFunc.isGameRuning()) {
                if (handle) {
                    startFunc.showToast("游戏尚未开始，游戏开始后将自动使用记牌器")
                }
                return
            }
        }

        this.$("node_card_count").active = show
    }

    initCardCount() {
        for (let i = 0; i <= ECardPoint.Wang_Big; i++) {
            if (i >= ECardPoint.Wang) {
                this.cardsCount[i] = 1
            } else if (i >= ECardPoint.P3) {
                this.cardsCount[i] = 4
            } else {
                this.cardsCount[i] = 0
            }
        }
    }

    refreshCardCount(cards: Iproto_CCard[], refresh: boolean = true) {
        cards.forEach(card => {
            const value = card.mNValue == ECardPoint.Wang && card.mNColor == 1 ? ECardPoint.Wang_Big : card.mNValue
            this.cardsCount[value]--
            if (this.cardsCount[value] < 0) {
                this.cardsCount[value] = 0
            }
        })

        if (!refresh) {
            return
        }

        const tempCardsCount = this.cardsCount.slice()
        this.cards.forEach(card => {
            const value = card.mNValue == ECardPoint.Wang && card.mNColor == 1 ? ECardPoint.Wang_Big : card.mNValue
            tempCardsCount[value]--
            if (tempCardsCount[value] < 0) {
                tempCardsCount[value] = 0
            }
        })

        const children = this.$("node_card_count_labels").children
        for (let i = 0; i < tempCardsCount.length; i++) {
            const point = i - ECardPoint.P3
            if (children[point] == null) {
                continue
            }
            children[point].getComponent(cc.Label).string = tempCardsCount[i] + ""
        }
    }

    @listen(EventName.game_start)
    onGameStart() {
        this.initCardCount()
        this.refreshCardCount([])
    }

    @listen("proto_gc_lord_card_not")
    proto_gc_lord_card_not(message: Iproto_gc_lord_card_not) {
        if (message.cLord >= 0) {
            this.showCardCount(true)
        }
    }

    @listen("proto_gc_card_count_ack")
    proto_gc_card_count_ack(message: Iproto_gc_card_count_ack) {
        app.user.setItemNum(ITEM.CARD_RECORD, message.countsNum)
        this.initCardCount()
        this.refreshCardCount(message.mVecPutCard)
    }

    @listen("proto_gc_refresh_card_not")
    proto_gc_refresh_card_not(message: Iproto_gc_refresh_card_not) {
        if (GameFunc.S2C(message.cChairID) != EPlayer.Me) {
            return
        }
        this.cards = message.vecCards
        this.refreshCardCount([])
    }

    @listen("proto_gc_play_card_not")
    proto_gc_play_card_not(message: Iproto_gc_play_card_not) {
        this.refreshCardCount(message.vecCards, GameFunc.S2C(message.cChairID) != EPlayer.Me)
    }

    @listen(EventName.game_end)
    onGameEnd() {
        this.showCardCount(false)
    }
}
