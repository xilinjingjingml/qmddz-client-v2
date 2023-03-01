import { listen, monitor } from "../base/monitor"
import { app } from "../start/app"
import { ITEM } from "../start/config"
import { startFunc } from "../start/startFunc"
import { appfunc } from "./appfunc"
import lobbyOpcode from "./proto/lobby.opcode"
import message = require("./proto/lobby.message")

export default class LobbySocket implements ISocketDelegate {
    socket: ISocketWrapper
    reConnectSocket: number
    // private leaveGameToLobbyState:boolean

    startSocket() {
        this.reConnectSocket = 1
        // this.leaveGameToLobbyState = false
        this.socket.add(message, lobbyOpcode)
        this.socket.startSocket({ ip: app.versionupdate.ip, port: parseInt(app.versionupdate.port) })
    }

    onOpenBefore() {
        this.socket.send<Iproto_cl_use_protocol_proto_req>("proto_cl_use_protocol_proto_req", {})
    }

    onOpen() {
        this.socket.send<Iproto_cl_verify_ticket_req>("proto_cl_verify_ticket_req", {
            plyGuid: app.user.guid,
            plyNickname: app.user.nickname,
            plyTicket: app.user.ticket,
            gameId: app.gameId,
            version: 2000000001,
            extParam: "",
            sex: app.user.sex,
            packetName: app.pn
        })
    }

    onClose() {
        console.log("jin---lobby onclose ckeckNetWork")
        // !this.leaveGameToLobbyState && , this.leaveGameToLobbyState
        this.ckeckNetWork()
        // console.log("jin---LobbySocket onClose", app.versionupdate.ip, parseInt(app.versionupdate.port))
        // startFunc.checkNetwork({
        //     must: true,
        //     callback: () => this.socket.startSocket({ ip: app.versionupdate.ip, port: parseInt(app.versionupdate.port) })
        // })
        // ++this.reConnectSocket
        // if(this.reConnectSocket == 5 || this.reConnectSocket == 20 || this.reConnectSocket == 50){
        //     startFunc.checkNetwork({
        //         must: true,
        //         callback: () => {
        //             this.reConnectSocket = 1
        //             this.socket.startSocket({ ip: app.versionupdate.ip, port: parseInt(app.versionupdate.port) })
        //         }
        //     })
        // }
    }

    onCloseTemp(view : string) {
        view ==="lobby" && appfunc.reLogin() //todo 重新登录 
    }

    @listen("proto_lc_verity_ticket_ack")
    proto_lc_verity_ticket_ack(message: Iproto_lc_verity_ticket_ack) {
        console.log("jin---proto_lc_verity_ticket_ack: ", message)
        if (message.ret == 0) {
            app.user.ply_state = message.plyStatus
            appfunc.setUserData(message.plyLobbyData, message.plyItems)

            appfunc.setServerTime(message.timeStamp)

            this.send_proto_cl_get_player_game_list_req()
            this.proto_cl_check_relief_status_req()
            appfunc.getTaskList(0)
        } else {
            cc.error("[proto_lc_verity_ticket_ack]", message.ret)
        }
    }

    @listen("proto_bc_message_not")
    proto_bc_message_not(message: Iproto_bc_message_not) {
        if (message.type == 1) {
            appfunc.kickout()
        } else if (message.type == 0) {
            startFunc.showToast(message.message)
        }
    }

    @listen("proto_lc_get_player_game_list_ack")
    proto_lc_get_player_game_list_ack(message: Iproto_lc_get_player_game_list_ack) {
        if (message.ret == 0) {
            app.servers.clear()
            message.serverStatus.forEach(server => {
                server.extParam.split("|").forEach(item => {
                    const param = item.split(":")
                    const value = Number(param[1])
                    server[param[0]] = value !== value ? param[1] : value
                })

                if (!app.servers.has(server.gameId)) {
                    app.servers.set(server.gameId, [])
                }
                app.servers.get(server.gameId).push(server)
            })
            //在大厅中需要加载游戏场，进行比赛；在游戏中，不需要加载游戏场，否则覆盖已有界面
            if ((app.user.ply_state.plyStatus == 2 || app.user.ply_state.plyStatus == 5) && cc.director.getScene().name == "lobby") {
                app.user.ply_state.plyStatus = 0
                appfunc.gobackGame(app.user.ply_state.gameId, app.user.ply_state.gameServerId)
            }

            monitor.emit("server_status_update")
        }
    }

    send_proto_cl_get_player_game_list_req() {
        this.socket.send<Iproto_cl_get_player_game_list_req>("proto_cl_get_player_game_list_req", { gameList: app.gameList })
    }

    @listen("proto_lc_send_user_data_change_not")
    proto_lc_send_user_data_change_not(message: Iproto_lc_send_user_data_change_not) {
        console.log("jin---proto_lc_send_user_data_change_not: ", message)
        appfunc.setUserData(message.plyLobbyData, message.plyItems)
    }

    @listen("proto_lc_send_vip_data_change_not")
    proto_lc_send_vip_data_change_not(message: Iproto_lc_send_vip_data_change_not) {
        app.datas.VipData = {
            vipLevel: message.vipLevel,
            vipRate: message.vipRate,
            nextVipneedMoney: message.nextVipneedMoney,
            param: message.param
        }
        monitor.emit("vip_data_update")
    }

    proto_cl_check_relief_status_req(type: number = 0) {
        this.socket.send<Iproto_cl_check_relief_status_req>("proto_cl_check_relief_status_req", { type: type })
    }

    @listen("proto_lc_check_relief_status_ack")
    proto_lc_check_relief_status_ack(message: Iproto_lc_check_relief_status_ack) {
        const leftTimes = message.reliefTimesMax - message.currentRelief_2 + 1
        app.datas.reliefStatus = {
            reliefTimes: leftTimes,
            currentRelief: message.currentRelief_2,
            ReliefTimesMax: message.reliefTimesMax,
            reliefCountdown: leftTimes > 0 ? message.reliefTimeLeft : -1,
            reliefAwardCount: message.reliefAwardCount
        }

        monitor.emit("relief_status_update")
    }

    @listen("proto_lc_get_relief_ack")
    proto_lc_get_relief_ack(message: Iproto_lc_get_relief_ack) {
        if (message.ret == 0) {
            appfunc.reloadUserData()
            appfunc.showAwardPop([{ index: ITEM.GOLD_COIN, num: app.datas.reliefStatus.reliefAwardCount }])
        }
        this.proto_cl_check_relief_status_req()
    }

    @listen("reload_user_data")
    proto_cl_reload_user_data_req() {
        this.socket.send<Iproto_cl_reload_user_data_req>("proto_cl_reload_user_data_req", {})
    }

    @listen("proto_lc_get_at_achieve_list_ack")
    proto_lc_get_at_achieve_list_ack(message: Iproto_lc_get_at_achieve_list_ack) {
        if (message.vecItems.length > 0) {
            if (message.vecItems[0].type == 0) {
                app.datas.AchieveList = message.vecItems
            }
        }
    }
    
    @listen("leave_game_to_lobby")
    leave_game_to_lobby(){
        this.ckeckNetWork()
    }

    ckeckNetWork(){
        // this.leaveGameToLobbyState = true
        startFunc.checkNetwork({
            must: true,
            callback: () => this.socket.startSocket({ ip: app.versionupdate.ip, port: parseInt(app.versionupdate.port) })
        })
    }

}
