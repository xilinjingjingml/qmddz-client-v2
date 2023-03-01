import { utils } from "../utils"
const CONNECT_COUNTER = 3
const CONNECT_INTERVAL = 5 * 1000
const PING_COUNTER = 3
const PING_INTERVAL_NORMAL = 5 * 1000
const PING_INTERVAL_QUICK = 1 * 1000
const PING_INTERVAL_CHECK = 1 * 1000
//TODO 在第一次3个ping失败的时候，弹出重连弹框，3秒后，弹出重启游戏框

export interface ISocketWrapperIn {
    name: string
    sendPing(): void
    onOpenBefore(): void
    onOpen(): void
    onMessage(buffer: ArrayBuffer): void
    onCloseBefore(): void
    onClose(): void
    onCloseTemp(view : string): void
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
    private connectTimeId: any
    private pingStamp: number
    private pingCounter: number
    private pingInterval: number
    private pingTimeId: number
    private reConnectCounter: number //pingCounter3次为reConnectCounter1次

    constructor(wrapper: ISocketWrapperIn) {
        this.wrapper = wrapper
        this.reConnectCounter = 0
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
        this.reConnectCounter = this.reConnectCounter >= 3 ? this.reConnectCounter + 1 : this.connectCounter
        console.log("[Socket.connectSocket]", this.wrapper.name, this.connectCounter)

        this.socketState = true
        this.socket = cc.sys.isNative ? new WebSocket(this.url, undefined, caFilePath) : new WebSocket(this.url)
        this.socket.binaryType = "arraybuffer"
        this.socket.onopen = this.onOpen.bind(this)
        this.socket.onmessage = this.onMessage.bind(this)
        this.socket.onerror = this.onError.bind(this)
        this.socket.onclose = this.onClose.bind(this)

        this.connectTimeId = setTimeout(this.onTimeout.bind(this), CONNECT_INTERVAL)
        // TODO IPHONE中setTimeout是否生效
        console.log("jin---test1 TODO")
        let testNum:number = setTimeout(()=>{console.log("jin---test2 TODO")}, 5*1000)
        // cc.Component.scheduleOnce(this.onTimeout.bind(this), CONNECT_INTERVAL)
        console.log("jin---connectTimeId: ", this.connectTimeId, testNum)//
    }

    private onTimeout() {
        console.log("jin---onTimeout")
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

    private onError(event: ErrorEvent) {
        cc.error("[Socket.onError]", this.wrapper.name, event, event.message, this.connectTimeId)

        if(event.message == "The total timed out" ){
            console.log("jin---error enter:", event.message)
            this.socketState = false
            this.reWeChatSocketConnect()
            return
        }

        if (this.connectTimeId != null) {
            console.log("jin---clearDown error")
            this.socketState = false
            this.stopTimeout()
            this.closeSocket()
            this.reconnect()
        }
        
    }

    private onClose(event: CloseEvent) {
        const strEvent = utils.IsJSON(event) ? JSON.stringify(event) : event
        cc.log("[Socket.onClose]", this.wrapper.name, strEvent)
        console.log("jin---[Socket.onClose]", this.wrapper.name, strEvent, this.connectCounter)
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
        console.log("[Socket.reconnect]", this.wrapper.name, this.connectCounter, this.reConnectCounter)
        if (this.reConnectCounter < CONNECT_COUNTER) {
            if (this.connectState) {
                this.connectState = false
                if (this.reConnectCounter === 1) {
                    console.log("jin---onCloseTemp")
                    this.wrapper.onCloseTemp("ddz")
                }
            }
            this.connectSocket()
        } else if(this.reConnectCounter === CONNECT_COUNTER){
            console.log("[Socket.reconnect]3ci", this.wrapper.name, this.connectCounter, this.reConnectCounter)
            this.wrapper.onClose()
        }else if(CONNECT_COUNTER < this.reConnectCounter && this.reConnectCounter < CONNECT_COUNTER * 4){
            console.log("[Socket.reconnect]3ci~6ci", this.wrapper.name, this.connectCounter, this.reConnectCounter)
            this.connectSocket()
        }else if(this.reConnectCounter === CONNECT_COUNTER * 4){
            console.log("[Socket.reconnect]6ci", this.wrapper.name, this.connectCounter, this.reConnectCounter)
            this.wrapper.onCloseTemp("lobby")
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

        console.debug("[Socket.checkPing]", this.wrapper.name)
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

    getCloseState(){
        return this.socket?.readyState == WebSocket.CLOSED
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

    //微信错误 The total timed out
    reWeChatSocketConnect(){
        this.stopTimeout()

        console.log("[Socket.closeSocket]", this.wrapper.name)
        this.socketState && this.wrapper.onCloseBefore()
        this.socket.onopen = this.socket.onmessage = this.socket.onerror = this.socket.onclose = null
        this.socketState && this.socket.close()
        this.socket = null

        this.reconnect()
    }
}
