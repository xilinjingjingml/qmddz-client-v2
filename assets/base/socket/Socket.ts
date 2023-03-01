const CONNECT_COUNTER = 3
const CONNECT_INTERVAL = 5 * 1000
const PING_COUNTER = 3
const PING_INTERVAL_NORMAL = 5 * 1000
const PING_INTERVAL_QUICK = 1 * 1000
const PING_INTERVAL_CHECK = 1 * 1000

export interface ISocketWrapperIn {
    name: string
    sendPing(): void
    onOpenBefore(): void
    onOpen(): void
    onMessage(buffer: ArrayBuffer): void
    onCloseBefore(): void
    onClose(): void
    onCloseTemp(): void
}

let caFilePath: string
export function setCaFilePath(path: string) {
    caFilePath = path
}

/**
 * websocket封装
 */
export default class Socket {
    private wrapper: ISocketWrapperIn
    private url: string
    private socket: WebSocket
    private socketState: boolean
    private connectState: boolean
    private connectCounter: number
    private connectTimeId: number
    private pingStamp: number
    private pingCounter: number
    private pingInterval: number
    private pingTimeId: number

    constructor(wrapper: ISocketWrapperIn) {
        this.wrapper = wrapper
    }

    connect(config: ISocketConfig) {
        this.url = "wss://" + config.ip + ":" + config.port
        cc.log("[Socket.connect]", this.wrapper.name, this.url)
        this.connectState = false
        this.connectCounter = 0
        this.connectSocket()
    }

    private connectSocket() {
        this.connectCounter += 1
        cc.log("[Socket.connectSocket]", this.wrapper.name, this.connectCounter)

        this.socketState = true
        this.socket = cc.sys.isNative ? new WebSocket(this.url, undefined, caFilePath) : new WebSocket(this.url)
        this.socket.binaryType = "arraybuffer"
        this.socket.onopen = this.onOpen.bind(this)
        this.socket.onmessage = this.onMessage.bind(this)
        this.socket.onerror = this.onError.bind(this)
        this.socket.onclose = this.onClose.bind(this)

        this.connectTimeId = setTimeout(this.onTimeout.bind(this), CONNECT_INTERVAL)
    }

    private onTimeout() {
        cc.warn("[Socket.onTimeout]", this.wrapper.name)
        this.stopTimeout()
        this.closeSocket()
        this.reconnect()
    }

    private onOpen(event: Event) {
        cc.log("[Socket.onOpen]", this.wrapper.name, event)
        this.stopTimeout()
        this.wrapper.onOpenBefore()
        this.startPing()
    }

    private onMessage(event: MessageEvent) {
        this.onPong()
        this.wrapper.onMessage(event.data)
    }

    private onError(event: Event) {
        cc.error("[Socket.onError]", this.wrapper.name, event)
        if (this.connectTimeId != null) {
            this.socketState = false
            this.stopTimeout()
            this.closeSocket()
            this.reconnect()
        }
    }

    private onClose(event: CloseEvent) {
        cc.log("[Socket.onClose]", this.wrapper.name, event)
        this.socketState = false
        this.stopPing()
        this.closeSocket()
        this.reconnect()
    }

    private onPong() {
        this.pingStamp = Date.now()
        this.pingCounter = 0
        this.pingInterval = PING_INTERVAL_NORMAL

        if (!this.connectState) {
            this.connectState = true
            this.connectCounter = 0
            this.wrapper.onOpen()
        }
    }

    private stopTimeout() {
        if (this.connectTimeId == null) {
            return
        }

        clearTimeout(this.connectTimeId)
        this.connectTimeId = null
    }

    private closeSocket() {
        if (this.socket == null) {
            return
        }

        cc.log("[Socket.closeSocket]", this.wrapper.name)
        this.socketState && this.wrapper.onCloseBefore()
        this.socket.onopen = this.socket.onmessage = this.socket.onerror = this.socket.onclose = null
        this.socketState && this.socket.close()
        this.socket = null
    }

    private reconnect() {
        cc.log("[Socket.reconnect]", this.wrapper.name, this.connectCounter)
        if (this.connectCounter < CONNECT_COUNTER) {
            if (this.connectState) {
                this.connectState = false
                if (this.connectCounter === 1) {
                    this.wrapper.onCloseTemp()
                }
            }
            this.connectSocket()
        } else {
            this.wrapper.onClose()
        }
    }

    private startPing() {
        this.pingStamp = Date.now()
        this.pingCounter = 0
        this.pingInterval = PING_INTERVAL_QUICK
        this.pingTimeId = setInterval(this.checkPing.bind(this), PING_INTERVAL_CHECK)
        this.sendPing()
    }

    private stopPing() {
        if (this.pingTimeId == null) {
            return
        }

        clearInterval(this.pingTimeId)
        this.pingTimeId = null
    }

    private checkPing() {
        if ((this.pingStamp + this.pingInterval) > Date.now()) {
            return
        }

        console.debug("[Socket.checkPing]", this.wrapper.name, this.pingCounter)
        if (this.pingCounter < PING_COUNTER) {
            this.pingInterval = PING_INTERVAL_QUICK
            this.sendPing()
        } else {
            this.stopPing()
            this.closeSocket()
            this.reconnect()
        }
    }

    private sendPing() {
        this.pingCounter += 1
        this.wrapper.sendPing()
    }

    isConnected() {
        return this.socket?.readyState == WebSocket.OPEN
    }

    send(buffer: ArrayBuffer) {
        this.socket.send(buffer)
    }

    close() {
        this.connectState = false
        this.stopTimeout()
        this.stopPing()
        this.closeSocket()
    }
}
