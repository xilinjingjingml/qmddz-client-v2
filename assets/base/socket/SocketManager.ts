import { monitor } from "../monitor"
import SocketWrapper from "./SocketWrapper"

/**
 * Socket管理器
 */
export namespace SocketManager {
    const sockets: Record<string, ISocketDelegate> = {}

    export function add<T extends ISocketDelegate>(name: string, SocketDelegate: { new(): T }): T {
        if (sockets[name] !== undefined) {
            return
        }

        const delegate = new SocketDelegate()
        sockets[name] = delegate
        monitor.onTarget(delegate)
        delegate.socket = new SocketWrapper(name, delegate)
        delegate.startSocket()
    }

    export function send<T>(name: string, messageName: string, message: T) {
        const delegate = sockets[name]
        if (delegate === undefined) {
            cc.error("[SocketManager.send] not find socket", name)
            return
        }

        delegate.socket.send(messageName, message)
    }

    export function close(name: string) {
        const delegate = sockets[name]
        if (delegate === undefined) {
            cc.warn("[SocketManager.send] not find socket", name)
            return
        }

        delete sockets[name]
        monitor.offTarget(delegate)
        delegate.socket.close()
        delegate.socket = null
    }

    export function closeAll(except?: string) {
        for (const name in sockets) {
            if (except && name === except) {
                continue
            }

            close(name)
        }
    }

    export function getSocket<T extends ISocketDelegate>(name: string): T {
        return sockets[name] as T
    }
}
