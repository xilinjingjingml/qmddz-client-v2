import { listen, monitor } from "../../../base/monitor"
import TaskQueue from "../../../base/TaskQueue"
import BaseView from "../../../base/view/BaseView"
import { startFunc } from "../../../start/startFunc"
import { EventName } from "../../game/GameConfig.ddz"
import { GameFunc } from "../../game/GameFunc.ddz"
import { storage } from "../../../base/storage"

const { ccclass } = cc._decorator

@ccclass
export default abstract class BaseGame extends BaseView {
    taskQueue: TaskQueue
    cacheMessages: Record<string, any> = {}

    abstract checkMoneyLimit(): boolean
    abstract isRelief(): boolean
    abstract showGameResultPops(): void
    abstract closeGameResultPops(): void

    start() {
        this.taskQueue = new TaskQueue(this.node)
    }

    @listen(EventName.game_onPressExit)
    onPressExit() {
        if (GameFunc.isGameRuning()) {
            startFunc.showConfirm({
                title: "退出游戏",
                content: "如果现在退出游戏，会\n由系统托管，输了的话千万别怪它哦!",
                confirmFunc: () => GameFunc.leaveGame(),
            })
            return
        }

        GameFunc.leaveGame()
    }

    @listen(EventName.game_onPressStart)
    onPressStart() {
        monitor.emit(EventName.game_reinit)
        if (this.checkMoneyLimit()) {
            monitor.emit(EventName.game_wait_hide)
            return
        }

        GameFunc.send<Iproto_cb_change_table_req>("proto_cb_change_table_req", {})
    }

    tryMoneyLimit() {
        if (this.isRelief()) {
            // TODO
            // if (Data.ins.hadGameStartCur) {
            //     monitor.emit(EventName.game_result_start)
            // } else {
            //     Data.ins.leaveGame()
            // }
            // monitor.emit(EventName.game_result_start)

            //原逻辑：打开按钮界面 开始游戏 改：展示 继续游戏 界面 startOfGamePop
            // monitor.emit(EventName.startOfGamePop)
            // GameView.showGoToGamePop()
            monitor.emit(EventName.game_result_next)
        } else {
            monitor.emit(EventName.game_wait_show)
            GameFunc.changeTable()
        }
    }

    showGameNext() {
        GameFunc.setDouble(null)
        this.cacheMessages = {}
        monitor.emit(EventName.game_reinit)
    }

    @listen(EventName.socket_login)
    onSocketLogin() {
        GameFunc.setIsJoinTable(false)
        if (this.checkMoneyLimit()) {
            monitor.emit(EventName.game_wait_hide)
            return
        }

        GameFunc.send<Iproto_cb_join_table_req>("proto_cb_join_table_req", { tableId: -1, password: "", clubUid: 0 })
    }

    @listen(EventName.socket_join_table)
    onSocketJoinTable(plyData: Iproto_PlyBaseData) {
        GameFunc.setIsJoinTable(true)
        console.log("jin---onSocketJoinTable:", plyData.chairId)
        GameFunc.setSMyChairId(plyData.chairId)
        GameFunc.send<Iproto_cb_ready_req>("proto_cb_ready_req", {})
    }

    @listen(EventName.socket_close)
    onSocketClose() {
        GameFunc.leaveGame("服务器连接出错")
    }

    @listen(EventName.socket_close_temp)
    onSocketCloseTemp(name: string) {
        if (name != GameFunc.socketName) {
            return
        }

        if (GameFunc.isGameRuning()) {
            return
        }

        this.taskQueue.clear()
        this.closeGameResultPops()
        this.showGameNext()
    }

    @listen(EventName.game_end)
    onGameEnd(message: Iproto_gc_game_result_not1) {
        this.cacheMessages["proto_gc_game_result_not1"] = message
    }

    @listen(EventName.game_result)
    onGameResult() {
        this.showGameResultPops()
        storage.set("result_next", 2)
    }
}
