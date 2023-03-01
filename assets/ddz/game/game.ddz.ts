import AutoLoad from "../../base/components/AutoLoad"
import { NodeExtends } from "../../base/extends/NodeExtends"
import { listen, monitor } from "../../base/monitor"
import { SocketManager } from "../../base/socket/SocketManager"
import TaskCounter from "../../base/TaskCounter"
import BaseView from "../../base/view/BaseView"
import { ViewManager } from "../../base/view/ViewManager"
import { appfunc } from "../../lobby/appfunc"
import { report } from "../../report"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { AppNative } from "../../start/scripts/platforms/AppNative"
import { AudioManager } from "../audio/AudioManager.ddz"
import DdzSocket from "./DdzSocket"
import { EGameState, EventName } from "./GameConfig.ddz"
import { GameFunc } from "./GameFunc.ddz"
import { ECardPoint } from "./GameRule.ddz"
import { GameView } from "./GameView.ddz"
import { storage } from "../../base/storage"

const { ccclass } = cc._decorator

@ccclass
export default class Game extends BaseView {
    params: IServerData
    taskCounter: TaskCounter
    autoLoads: AutoLoad[]

    onLoad() {
        this.taskCounter = new TaskCounter(() => this.isValid && this.onStart())
        this.autoLoads = this.getComponentsInChildren(AutoLoad)
        this.autoLoads.forEach(comp => comp.enabled = false)

    }

    start() {
        // report("斗地主", "界面显示")
        this.initData()
        this.loadAssets()

        // GameFunc.fsm.transform(EGameState.game_init)
        // ViewManager.showPopup({// TODOT
        //     bundle: GameFunc.bundle,
        //     path: "BaiYuanResultPop/BaiYuanResultPop",
        //     params: {},
        //     mask: { opacity: 0 }
        // })
        // GameView.showBaiYuanRegainLosePop({
        //     // closeCallback: next,
        //     // message: message,
        // })
        // let node = this.$("3dai1")
        // const dragonBone = node.getComponent(dragonBones.ArmatureDisplay)
        // // dragonBone.addEventListener(dragonBones.EventObject.LOOP_COMPLETE,this.animationEventHandler,this)
        // console.log("jin---dragonBonesName222:", dragonBone)
        // dragonBone.playAnimation("newAnimation", 1)
        // GameView.showGoToGamePop({})//mask:{show:false}
    }

    initData() {
        // 自动加载资源传参
        for (let i = 0; i < 3; i++) {
            this.$("node_player" + i, AutoLoad).params = { chairId: i }
        }

        AudioManager.setConfig(GameFunc.bundle, "audio/audios/", this.load.bind(this))

        GameFunc.initGameData()
        GameFunc.setDizhu(app.runGameServer.baseBet)
    }

    loadAssets() {
        // 预加载资源
        this.taskCounter.count()
        cc.assetManager.getBundle(GameFunc.bundle).loadDir("card/images", (err: Error, items: cc.Asset[]) => {
            if (err) {
                cc.error("[Game.loadAssets]", err)
            }

            if (!this.isValid) {
                return
            }

            if (items) {
                items.forEach(item => this._addRef(item))
            }
            this.taskCounter.done()
        })

        this.taskCounter.count()
        this.AutoLoad_loadComplete()
    }

    @listen("AutoLoad_loadComplete")
    AutoLoad_loadComplete() {
        if (this.autoLoads.length > 0) {
            for (let i = 0; i < this.autoLoads.length; i++) {
                const comp = this.autoLoads[i]
                if (comp.must) {
                    this.autoLoads.splice(i, 1)
                    comp.enabled = true
                    return
                }
            }

            this.autoLoads.forEach(comp => comp.enabled = true)
            this.autoLoads.length = 0
        } else {
            this.taskCounter.done()
        }
    }

    onStart() {
        SocketManager.add(GameFunc.socketName, DdzSocket)
        this.playBGMusic()
    }

    @listen("audio_music")
    playBGMusic() {
        AudioManager.playBGMusic()
    }

    @listen(EventName.game_wait_show)
    showWait() {
        this.$("spine_wait").active = true
        this.$("spine_wait", sp.Skeleton).setAnimation(0, "animation", true)
        this.$("spine_wait", sp.Skeleton).schedule(() => GameFunc.changeTable(), 6, cc.macro.REPEAT_FOREVER)
    }

    @listen(EventName.game_wait_hide)
    hideWait() {
        this.$("spine_wait", sp.Skeleton).unscheduleAllCallbacks()
        this.$("spine_wait").active = false
    }

    /******************************************************************************************************************/
    // button 事件
    /******************************************************************************************************************/
    onPressExit(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        monitor.emit(EventName.game_onPressExit)

        // report("斗地主", "离开")
    }

    @listen(EventName.game_onPressStart)
    onPressStart() {
        GameFunc.fsm.transform(EGameState.game_init)

        // report("斗地主", "开始下一局")
    }

    /******************************************************************************************************************/
    // FSM
    /******************************************************************************************************************/

    @listen(EventName.game_init)
    onGameInit() {
        this.showWait()

        // TODO
        // ads.closeBanner()
    }

    @listen(EventName.game_result_next)
    onGameNext() {
        this.$("btn_exit").active = true
        this.$("node_player1").active = false
        this.$("node_player2").active = false
    }

    @listen(EventName.game_start)
    onGameStart(message: Iproto_gc_game_start_not) {
        this.$("btn_exit").active = false
        this.$("node_player1").active = true
        this.$("node_player2").active = true

        GameFunc.setDizhu(message.nGameMoney)

        this.hideWait()
        !cc.audioEngine.isMusicPlaying() && this.playBGMusic()
        AudioManager.playEffect("audio_start")
        // TODO
        // ads.closeBanner()

        GameFunc.send<Iproto_cg_look_lord_card_item_req>("proto_cg_look_lord_card_item_req", {})

        if (app.datas.role.roundSum == 0) {
            // if (cc.sys.isNative) {
            //     (app.platform as AppNative).uploadKuaiShou(1)
            // }
            // report("游戏", "牌局开始", "0局")
        }

        if (app.datas.role.roundSum <= 20) {
            report("斗地主", "游戏开始", app.datas.role.roundSum + "局")
        }

        cc.game.emit("cashout_pause")
    }

    @listen(EventName.game_end)
    onGameEnd() {
        GameFunc.setIsReconnect(false)

        if (app.datas.role.roundSum == 0) {
            // if (cc.sys.isNative) {
            //     (app.platform as AppNative).uploadKuaiShou(1)
            // }
            report("游戏", "牌局结算", "0局")
        }

        app.datas.role.roundSum++

        // 关闭无效弹窗
        ViewManager.close("PlayerInfoPop")
        // report("斗地主", "游戏结束")
        cc.game.emit("cashout_resume")
    }

    @listen(EventName.game_reinit)
    onGameReinit() {
        GameFunc.setSLordChairId(-1)
    }

    /******************************************************************************************************************/
    // socket message
    /******************************************************************************************************************/

    @listen("proto_bc_join_table_ack")
    proto_bc_join_table_ack(message: Iproto_bc_join_table_ack) {
        if (message.ret == 0) {
            for (const plyData of message.tableAttrs.players) {
                if (plyData.plyGuid == app.user.guid && Number(storage.get("result_next")) == 1) {
                    monitor.emit(EventName.socket_join_table, plyData)
                    storage.set("result_next", 1)
                    break
                }
            }
        }
    }

    @listen("proto_gc_game_start_not")
    proto_gc_game_start_not(message: Iproto_gc_game_start_not) {
        GameFunc.fsm.transform(EGameState.game_start, message)
    }

    @listen("proto_gc_lord_card_not")
    proto_gc_lord_card_not(message: Iproto_gc_lord_card_not) {
        if (message.cLord >= 0) {
            GameFunc.setSLordChairId(message.cLord)
        }
    }

    @listen("proto_gc_counts_not1")
    proto_gc_counts_not1(message: Iproto_gc_counts_not1) {
        app.user.setItemNum(ITEM.CARD_RECORD, message.countsNum)
    }

    @listen("proto_gc_item_info_not")
    proto_gc_item_info_not(message: Iproto_gc_item_info_not) {
        app.user.setItemNum(message.nItemIndex, message.nItemCount)
    }

    @listen("proto_gc_complete_data_not")
    proto_gc_complete_data_not(message: Iproto_gc_complete_data_not) {
        GameFunc.setIsReconnect(true)

        monitor.emit(EventName.game_reinit)

        monitor.emit<Iproto_gc_game_start_not>("proto_gc_game_start_not", {
            nGameMoney: message.nGameMoney,
            nCardNum: 0,
            nLordPos: 0,
            cLordCard: { mNValue: 0, mNColor: 0, mNCard_Baovalue: 0 },
            nSerialID: 0,
        })

        if (message.vecLordCards.some(card => card.mNValue >= ECardPoint.P3 && card.mNValue <= ECardPoint.Wang)) {
            monitor.emit<Iproto_gc_lord_card_not>("proto_gc_lord_card_not", {
                cLord: message.cLord,
                vecCards: message.vecLordCards,
            })
        }

        message.vecData.forEach(v => {
            monitor.emit<Iproto_gc_refresh_card_not>("proto_gc_refresh_card_not", {
                cChairID: v.cChairID,
                vecCards: v.vecHandCards,
            })

            monitor.emit<Iproto_gc_play_card_not>("proto_gc_play_card_not", {
                cChairID: v.cChairID,
                vecCards: v.vecPutCards,
                cType: { mNTypeBomb: 0, mNTypeNum: 0, mNTypeValue: 0 },
            })
        })

        GameFunc.send<Iproto_cg_card_count_req>("proto_cg_card_count_req", {})
    }

    @listen("proto_gc_game_result_not1")
    proto_gc_game_result_not1(message: Iproto_gc_game_result_not1) {
        GameFunc.fsm.transform(EGameState.game_end, message)
    }

    @listen("proto_gc_look_lord_card_item_ack")
    proto_gc_look_lord_card_item_ack(message: Iproto_gc_look_lord_card_item_ack) {
        console.log(message)
    }
}
