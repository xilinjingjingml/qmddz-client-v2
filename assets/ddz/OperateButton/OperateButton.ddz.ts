import AutoLoad from "../../base/components/AutoLoad"
import { NodeExtends } from "../../base/extends/NodeExtends"
import { listen, monitor } from "../../base/monitor"
import { appfunc } from "../../lobby/appfunc"
import { report } from "../../report"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { GAME_TYPE, ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { AudioManager } from "../audio/AudioManager.ddz"
import { EOperate, EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import BaseChair from "../scripts/base/BaseChair.ddz"
import { isBaiYuan } from "../scripts/components/conditions/BaiYuanCondition.ddz"

const { ccclass } = cc._decorator

export enum EButton {
    None,
    Start, // 开始
    CallScore, // 叫分
    CallLord, // 叫地主
    RobLord, // 叫地主
    ShowCardDeal, // 发牌阶段明牌
    JiaBei, // 加倍
    ShowCardChuPai, // 地主第一次出牌
    ChuPai, // 出牌
    JiePai, // 接牌
    YaoBuQi, // 要不起
    Next, // 重新开始
    Next_Free, // 重新开始
}

/**
 * 玩家按钮面板
 */
@ccclass
export default class OperateButton extends BaseChair {
    params: { chairId: number } = { chairId: 0 }
    buttons: cc.Node[]
    nSerialID: number
    showPutShowCard: boolean = false

    onLoad(){
        this.params.chairId = 0
        this.$("node_clock", AutoLoad).params = { chairId: this.params.chairId }
        this.buttons = this.$("node_buttons").children.slice()
        this.onGameReinit()
    }

    start() {
        // this.$("node_clock", AutoLoad).params = { chairId: this.params.chairId }
        
    }

    @listen(EventName.game_reinit)
    onGameReinit() {
        this.showPutShowCard = false
        this.showOperateButtons()
    }

    @listen(EventName.game_OperateButton_showPutButtons)
    showPutButtons(operate: EButton) {
        if (this.showPutShowCard && operate == EButton.ChuPai) {
            operate = EButton.ShowCardChuPai
            this.showPutShowCard = false
        }
        this.showOperateButtons(operate)
    }

    showOperateButtons(operate: EButton = EButton.None) {
        if (operate == EButton.None) {
            this.showButtons([])
        } else if (operate == EButton.Start) {
            this.showButtons([this.$("btn_start")])
        } else if (operate == EButton.CallLord) {
            this.showButtons([this.$("btn_no_call"), this.$("btn_call_1"), this.$("btn_call_2")], true)
        } else if (operate == EButton.RobLord) {
            this.showButtons([this.$("btn_no_rob"), this.$("btn_rob")], true)
        } else if (operate == EButton.ShowCardDeal) {
            this.showButtons([this.$("btn_showcard_deal")])
        } else if (operate == EButton.JiePai) {
            this.showButtons([this.$("btn_buchu"), this.$("btn_tishi"), this.$("btn_chupai")], true)
        } else if (operate == EButton.ChuPai) {
            this.showButtons([this.$("btn_tishi"), this.$("btn_chupai")], true)
        } else if (operate == EButton.ShowCardChuPai) {
            this.showButtons([this.$("btn_showcard_put"), this.$("btn_tishi"), this.$("btn_chupai")], true)
        } else if (operate == EButton.JiaBei) {
            const buttons = [this.$("btn_no_jiabei"), this.$("btn_jiabei")]
            if (app.user.getItemNum(ITEM.SUPER_JIABEI) > 0) {
                buttons.push(this.$("btn_chaojijiabei"))
            }
            this.showButtons(buttons, true, buttons.length >= 3)
        } else if (operate == EButton.YaoBuQi) {
            this.showButtons([this.$("btn_yaobuqi")], true)
        } else if (operate == EButton.Next) {
            // this.showButtons([this.$("btn_next")])
        } else if (operate == EButton.Next_Free) {
            // this.showButtons([this.$("node_next_free")])
        } else {
            this.showButtons([])
        }
    }

    showButtons(buttons: cc.Node[], showClock: boolean = false, upClock: boolean = false) {
        upClock = true
        this.buttons.forEach(btn => btn.active = false)
        const nodeClock = this.$("node_clock")
        nodeClock.active = false

        if (buttons.length == 0) {
            return
        }

        const parent = this.$("node_button")
        parent.getComponent(cc.Layout).spacingX = [0, 15, 70, 60][buttons.length] || 0
        const index = Math.floor(buttons.length / 2)
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i]
            button.removeFromParent(false)
            button.parent = parent
            button.zIndex = i + (i >= index ? 1 : 0)
            button.active = true
        }

        if (!showClock) {
            this.$("node_clock_center").active = false
            return
        }
        this.$("node_clock_center").zIndex = index
        this.$("node_clock_center").active = !upClock
        nodeClock.removeFromParent(false)
        nodeClock.parent = upClock ? this.$("node_clock_up") : this.$("node_clock_center")
        nodeClock.active = true
        // console.log("jin---showButtons: ", " showClock:",showClock, " upClock:", upClock, " upClock:"," index:", index, this.$("node_clock_up"), this.$("node_clock_center"))
    }

    onPressCall(event: cc.Event.EventTouch, data: string) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        this.showOperateButtons()
        GameFunc.send<Iproto_cg_call_score_ack>("proto_cg_call_score_ack", {
            nSerialID: this.nSerialID,
            nScore: parseInt(data) || 0,
        })

        // report("斗地主", "叫分")
    }

    onPressRob(event: cc.Event.EventTouch, data: string) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        this.showOperateButtons()
        GameFunc.send<Iproto_cg_rob_lord_ack>("proto_cg_rob_lord_ack", {
            nSerialID: this.nSerialID,
            cRob: parseInt(data) || 0,
        })

        // report("斗地主", data === "0" ? "不抢地主" : "抢地主")
    }

    onPressBuChu(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        this.showOperateButtons()
        GameFunc.send<Iproto_cg_play_card_ack>("proto_cg_play_card_ack", {
            nSerialID: this.nSerialID,
            cTimeOut: 0,
            vecCards: [],
        })

        // report("斗地主", "不出")
    }

    onPressTiShi(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        monitor.emit(EventName.game_OperateButton_onPressTiShi)

        // report("斗地主", "提示")
    }

    onPressChuPai(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        monitor.emit(EventName.game_OperateButton_onPressChuPai)

        // report("斗地主", "出牌")
        if (app.datas.role.roundSum == 0) {
            if (!cc.sys.localStorage.getItem("firstChuPai")) {
                report("游戏", "牌局中", "玩家手动出牌", "0局")
                cc.sys.localStorage.setItem("firstChuPai", true)
            }
        }
    }

    onPressStart(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        this.showOperateButtons()
        monitor.emit(EventName.game_onPressStart)
    }

    @listen(EventName.startOfGamePop)
    startOfGamePop() {
        // NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()
        this.showOperateButtons()
        monitor.emit(EventName.game_onPressStart)
    }


    onPressNextFreeStart(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        this.showOperateButtons()
        ads.receiveAward({
            index: ads.video.New_NextLoseZero,
            success: () => monitor.emit(EventName.game_onPressStart)
        })

        // report("斗地主", "下局免费")
    }

    onPressShowCardStart(event: cc.Event.EventTouch, data: string) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        this.showOperateButtons()
        GameFunc.send<Iproto_cg_show_card_ack>("proto_cg_show_card_ack", {
            cShowCard: 0,
            nSerialID: this.nSerialID,
            nShowCardBet: parseInt(data),
            nShowCardType: 1,
        })

        monitor.emit(EventName.game_onPressStart)

        // report("斗地主", "")
    }

    onPressShowCardDeal(event: cc.Event.EventTouch, data: string) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        this.showOperateButtons()
        GameFunc.send<Iproto_cg_show_card_ack>("proto_cg_show_card_ack", {
            cShowCard: 0,
            nSerialID: this.nSerialID,
            nShowCardBet: parseInt(data),
            nShowCardType: 2,
        })

        // report("斗地主", "明牌", data)
    }

    onPressShowCardPut(event: cc.Event.EventTouch, data: string) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        this.showOperateButtons(EButton.ChuPai)
        GameFunc.send<Iproto_cg_show_card_ack>("proto_cg_show_card_ack", {
            cShowCard: 0,
            nSerialID: this.nSerialID,
            nShowCardBet: parseInt(data),
            nShowCardType: 3,
        })
    }

    onPressJiaBei(event: cc.Event.EventTouch, data: string) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()
        this.onJiaBei(parseInt(data))

        // report("斗地主", "加倍", data)
    }

    onJiaBei(double: number) {
        if (double == 4) {
            if (app.user.getItemNum(ITEM.SUPER_JIABEI) <= 0) {
                monitor.emit(EventName.game_exchange_item, {
                    itemId: ITEM.SUPER_JIABEI,
                    success: () => this.isValid && this.onJiaBei(double),
                    fail: () => this.isValid && startFunc.showToast("您的超级加倍卡不足，可在寻宝获得！"),
                })
                return
            }
        }

        this.showOperateButtons()
        GameFunc.send<Iproto_cg_double_score_ack>("proto_cg_double_score_ack", {
            nScore: double,
            nSerialID: this.nSerialID,
        })
    }

    @listen(EventName.game_start)
    onGameStart() {
        this.$("btn_next").active = false
        this.$("node_next_free").active = false
        this.$("btn_start").active = false
    }

    @listen("proto_gc_common_not")
    proto_gc_common_not(message: Iproto_gc_common_not) {
        if (message.nOp == EOperate.CO_NEW) {
            this.showOperateButtons()
        } else if (message.nOp == EOperate.CO_TIMEOUT) {
        } else if (message.nOp == EOperate.CO_NOLORD) {
            this.showOperateButtons()
        }
    }

    @listen("proto_gc_call_score_req")
    proto_gc_call_score_req(message: Iproto_gc_call_score_req) {
        this.nSerialID = message.nSerialID
        console.log("jin---proto_gc_call_score_req: ", message)
        const isCallScore = app.runGameServer.ddz_game_type == GAME_TYPE.DDZ_JF || isBaiYuan()
        if (!isCallScore) {
            this.showOperateButtons(EButton.CallLord)
            return
        }

        // const buttons = [this.$("btn_call_1"), this.$("btn_call_2")].slice(message.nScore)//, this.$("btn_call_3")
        let buttons = null
        if (message.nScore == 4) {
            buttons = [this.$("btn_call_2")]
        } else if (message.nScore == 0) {
            buttons = [this.$("btn_call_1"), this.$("btn_call_2")]
        }
        buttons.unshift(this.$("btn_no_call"))
        this.showButtons(buttons, true, buttons.length >= 4)
    }

    @listen("proto_gc_rob_lord_req")
    proto_gc_rob_lord_req(message: Iproto_gc_rob_lord_req) {
        this.nSerialID = message.nSerialID
        this.showOperateButtons(EButton.RobLord)
    }

    @listen("proto_gc_show_card_req")
    proto_gc_show_card_req(message: Iproto_gc_show_card_req) {
        this.nSerialID = message.nSerialID
        if (message.nShowCardType == 2) {
            this.showOperateButtons(EButton.ShowCardDeal)
            const next = () => {
                if (message.nShowCardBet < 2) {
                    if (this.$("btn_showcard_deal").active) {
                        this.showOperateButtons()
                    }
                    this.unschedule(next)
                    return
                }
                this.$("label_showcard_deal", cc.Label).string = "" + message.nShowCardBet
                this.$("btn_showcard_deal", cc.Button).clickEvents[0].customEventData = "" + message.nShowCardBet
                message.nShowCardBet--
            }
            next()
            this.schedule(next, 1)
        } else if (message.nShowCardType == 3) {
            this.showPutShowCard = true
            this.$("label_showcard_put", cc.Label).string = "" + message.nShowCardBet
            this.$("btn_showcard_put", cc.Button).clickEvents[0].customEventData = "" + message.nShowCardBet
        }
    }

    @listen("proto_gc_double_score_req")
    proto_gc_double_score_req(message: Iproto_gc_double_score_req) {
        this.nSerialID = message.nSerialID
        this.showOperateButtons(EButton.JiaBei)
    }

    @listen("proto_gc_play_card_req")
    proto_gc_play_card_req(message: Iproto_gc_play_card_req) {
        this.nSerialID = message.nSerialID
    }

    @listen("proto_gc_play_card_not")
    proto_gc_play_card_not(message: Iproto_gc_play_card_not) {
        if (!this.isSelf(message.cChairID)) {
            return
        }
        this.showOperateButtons()
    }

    @listen(EventName.game_result_next)
    game_result_next(nextype: number) {
        console.log("jin---game_result_next: ", nextype)
        if (nextype == 0) {
            this.$("btn_continue").active = false
        } else {
            // TODO 暂时关闭该功能
            this.$("btn_continue").active = true
            // 继续游戏延迟显示
            // NodeExtends.delayShow(this, this.$("btn_continue"))
        }

        // * - 0 继续游戏
        // * - 1 继续游戏和下局免输
        // * - 2 下局免输
        this.showOperateButtons(nextype == 0 ? EButton.Next : EButton.Next_Free)
    }

    @listen(EventName.game_result_start)
    game_result_start() {
        this.showOperateButtons(EButton.Start)
    }
}
