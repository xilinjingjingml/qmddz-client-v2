import { listen, monitor } from "../../base/monitor"
import { SocketManager } from "../../base/socket/SocketManager"
import { appfunc } from "../../lobby/appfunc"
import { app } from "../../start/app"
import { startFunc } from "../../start/startFunc"
import ddzOpcode from "../proto/ddz.opcode"
import { EventName } from "./GameConfig.ddz"
import { GameFunc } from "./GameFunc.ddz"
import message = require("../proto/ddz.message")

export default class DdzSocket implements ISocketDelegate {
    socket: ISocketWrapper

    startSocket() {
        if (app.runGameServer == null) {
            cc.error("[DdzSocket.startSocket] null")
            return
        }

        cc.log("[DdzSocket.startSocket]", app.runGameServer)
        this.socket.add(message, ddzOpcode)
        this.socket.startSocket({ ip: app.runGameServer.serverAddr, port: app.runGameServer.serverPort + 1 })
    }

    onOpenBefore() {
        this.socket.send<Iproto_cb_use_protocol_proto_req>("proto_cb_use_protocol_proto_req", {})
    }

    onOpen() {
        this.socket.send<Iproto_cb_login_req>("proto_cb_login_req", {
            plyGuid: app.user.guid,
            plyTicket: app.user.ticket,
            version: 1498492800,
            extParam: "",
            mainGameId: app.gameId,
            gameGroup: 0,
        })
    }

    onCloseBefore() {
        this.socket.send<Iproto_cb_send_disconnect_req>("proto_cb_send_disconnect_req", {})
    }

    onClose() {
        monitor.emit(EventName.socket_close, GameFunc.socketName)
    }

    onCloseTemp(view : string) {
        view ==="ddz" && monitor.emit(EventName.socket_close_temp, GameFunc.socketName)
    }

    @listen("proto_bc_login_ack")
    proto_bc_login_ack(message: Iproto_bc_login_ack) {
        if (message.ret == 0 || message.ret == 1 || message.ret == 2) {
            monitor.emit(EventName.socket_login, message)
        } else if (message.ret == -2) {
            const servers = app.servers.get(message.plyStatus.gameId)
            let lasetServer: IServerData
            if (servers) {
                for (const server of servers) {
                    if (server.serverId == message.plyStatus.gameServerId) {
                        lasetServer = server
                        break
                    }
                }
            }

            if (!lasetServer) {
                GameFunc.leaveGame("您有尚未完成的游戏")
                return
            }

            if (lasetServer.ddz_game_type == app.runGameServer.ddz_game_type) {
                SocketManager.closeAll("lobby")
                app.runGameServer = lasetServer
                SocketManager.add(GameFunc.socketName, DdzSocket)
                monitor.emit(EventName.game_server_update)
                return
            }

            GameFunc.leaveGame({
                openCallback: () => {
                    startFunc.showConfirm({
                        content: "您有尚未完成的游戏\n是否前往？",
                        confirmText: "前  往",
                        confirmFunc: () => {
                            SocketManager.closeAll("lobby")
                            appfunc.gotoGame({ bundle: GameFunc.bundle, path: "game" }, lasetServer)
                        },
                        buttonNum: 1,
                    })
                }
            })
        } else {
            let info = "服务器连接出错"
            if (message.errorMsg.length > 0) {
                info = message.errorMsg
            } else if (message.ret == -1) {
                info = "服务器忙"
            } else if (message.ret == -3) {
                info = "验证失败"
            } else if (message.ret == -4) {
                info = "游戏豆不足"
            }
            GameFunc.leaveGame(info)
        }
    }

    @listen("proto_bc_join_table_ack")
    proto_bc_join_table_ack(message: Iproto_bc_join_table_ack) {
        if (message.ret == 0) {
        } else {
            let info = "服务器连接出错"
            if (message.errMsg.length > 0) {
                info = message.errMsg
            } else if (message.ret == -2) {
                info = "服务器满"
            } else if (message.ret == -4) {
                info = "加入密码错误"
            } else if (message.ret == -5) {
                info = "房间满"
            }
            GameFunc.leaveGame(info)
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
}
