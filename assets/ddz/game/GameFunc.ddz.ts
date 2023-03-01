import FSM from "../../base/fsm"
import { math } from "../../base/math"
import { monitor } from "../../base/monitor"
import { SocketManager } from "../../base/socket/SocketManager"
import { appfunc } from "../../lobby/appfunc"
import { app } from "../../start/app"
import { startFunc } from "../../start/startFunc"
import player from "../player/player.ddz"
import { isBaiYuan } from "../scripts/components/conditions/BaiYuanCondition.ddz"
import { EGameState, EPlayer, EventName } from "./GameConfig.ddz"

export namespace GameFunc {
    export const socketName: string = "ddz"
    export const bundle: string = "ddz"
    export const fsm = new FSM<EGameState>({
        [EGameState.game_init]: {
            callback: (...args: any[]) => monitor.emit(EventName.game_init, ...args)
        },
        [EGameState.game_start]: {
            callback: (...args: any[]) => monitor.emit(EventName.game_start, ...args)
        },
        [EGameState.game_end]: {
            froms: [EGameState.game_start],
            callback: (...args: any[]) => monitor.emit(EventName.game_end, ...args)
        },
        [EGameState.game_result]: {
            froms: [EGameState.game_end],
            callback: (...args: any[]) => monitor.emit(EventName.game_result, ...args)
        },
        [EGameState.game_reinit]: {
            callback: (...args: any[]) => monitor.emit(EventName.game_reinit, ...args)
        },
    })

    export function send<T>(name: string, message: T) {
        SocketManager.send<T>(socketName, name, message)
    }

    export function leaveGame(params?: string | any) {
        appfunc.gobackLobby(typeof params === "string" ? { openCallback: () => startFunc.showToast(params) } : params)
    }

    export function toHBString(n: number) {
        return math.short(appfunc.toCash(n))
    }

    export function toFuCardString(n: number) {
        return math.short(appfunc.toFuCard(n))
    }

    export function changeTable() {
        if (getGameData().isJoinTable) {
            send<Iproto_cb_change_table_req>("proto_cb_change_table_req", {})
        } else {
            send<Iproto_cb_join_table_req>("proto_cb_join_table_req", { tableId: -1, password: "", clubUid: 0 })
        }
    }

    interface IGameData {
        sMyChairId?: number
        sLordChairId?: number
        isReconnect?: boolean
        isJoinTable?: boolean
        dizhu?: number
        beishuInfo?: Iproto_gc_beishu_info_ack
        players?: Record<number, player>
    }
    export function getGameData(): IGameData {
        return app.datas.runGameDatas
    }

    export function initGameData() {
        const data: IGameData = {
            sMyChairId: -1,
            sLordChairId: -1,
            isReconnect: false,
            isJoinTable: false,
            dizhu: 1,
            players: {},
        }
        console.log("jin---initGameData:", data)
        app.datas.runGameDatas = data
    }

    function setGameData(data: IGameData) {
        for (const key in data) {
            app.datas.runGameDatas[key] = data[key]
        }
    }

    export function setSMyChairId(chairId: number) {
        setGameData({ sMyChairId: chairId })
    }

    export function getSMyChairId(): number {
        return getGameData().sMyChairId
    }

    export function setSLordChairId(chairId: number) {
        setGameData({ sLordChairId: chairId })
    }

    export function getSLordChairId(): number {
        return getGameData().sLordChairId
    }

    export function setIsReconnect(isReconnect: boolean) {
        setGameData({ isReconnect: isReconnect })
    }

    export function isReconnect(): boolean {
        return getGameData().isReconnect
    }

    export function setIsJoinTable(isJoinTable: boolean) {
        setGameData({ isJoinTable: isJoinTable })
    }

    export function setDizhu(dizhu: number) {
        setGameData({ dizhu: dizhu })
        monitor.emit(EventName.game_dizhu_update, dizhu)
    }

    export function getDizhu(): number {
        return getGameData().dizhu
    }

    export function setDouble(message: Iproto_gc_beishu_info_ack) {
        setGameData({ beishuInfo: message })
    }

    export function getDouble(sChairId: number): number {
        const beishuInfo: Iproto_gc_beishu_info_ack = getGameData().beishuInfo
        if (beishuInfo == null) {
            return 1
        }

        if (isBaiYuan()) {
            return beishuInfo.vecBeiShuInfo[0] * beishuInfo.vecBeiShuInfo[6]
        }

        let commonBeishu = 1
        for (const beishu of beishuInfo.vecBeiShuInfo) {
            commonBeishu *= beishu
        }

        const sLordChairId = getSLordChairId()
        let isMyLord = false
        let lordBeishu = 1
        for (let i = 0; i < beishuInfo.vecPlayerBeiShu.length; i++) {
            if (i == sLordChairId) {
                isMyLord = i == sChairId
                lordBeishu = beishuInfo.vecPlayerBeiShu[i]
            }
        }

        let farmerBeishu = 0
        for (let i = 0; i < beishuInfo.vecPlayerBeiShu.length; i++) {
            if (i != sLordChairId) {
                if (isMyLord) {
                    farmerBeishu += beishuInfo.vecPlayerBeiShu[i]
                } else if (i == sChairId) {
                    farmerBeishu = beishuInfo.vecPlayerBeiShu[i]
                    break
                }
            }
        }
        farmerBeishu = farmerBeishu || 1

        return commonBeishu * lordBeishu * farmerBeishu
    }

    export function setPlayer(chairId: number, player: player) {
        const players = getGameData().players
        players[chairId] = player
        setGameData({ players: players })
    }

    export function getPlayer(chairId: number): player {
        return getGameData().players[chairId]
    }

    export function getPlayerPos(chairId: number, name: string = "node_avater/avater"): cc.Vec2 {
        const player = getPlayer(chairId)
        if (player) {
            return cc.find(name, player.node).convertToWorldSpaceAR(cc.Vec2.ZERO)
        }
    }

    export function S2C(sChairId: number) {
        if (sChairId == null || sChairId < 0) {
            cc.error("[GameFunc.S2C] chairId", sChairId)
            return
        }

        const sMyChairId = getSMyChairId()
        // console.log("jin---S2C:", sMyChairId, sChairId)
        if (sMyChairId < 0) {
            cc.error("[GameFunc.S2C] sMyChairId", sMyChairId)
            return
        }

        let cChairId = sChairId - sMyChairId
        if (cChairId < 0) {
            cChairId += 3
        }
        return cChairId
    }

    export function isGameRuning(): boolean {
        return fsm.state >= EGameState.game_start && fsm.state < EGameState.game_end
    }

    export function isLord() {
        const sLordChairId = getSLordChairId()
        return sLordChairId >= 0 && GameFunc.S2C(sLordChairId) == EPlayer.Me
    }
}
