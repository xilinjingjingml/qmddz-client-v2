import { monitor } from "../monitor"
import baseOpcode from "../proto/base.opcode"
import MessagePacker from "./MessagePacker"
import Socket, { ISocketWrapperIn } from "./Socket"
import message = require("../proto/base.message")

/**
 * socket整套封装
 */
export default class SocketWrapper implements ISocketWrapper, ISocketWrapperIn {
    private packer: MessagePacker
    private socket: Socket
    private delegate: ISocketDelegate
    private connectCallback: () => void = null
    name: string

    constructor(name: string, delegate: ISocketDelegate) {
        this.name = name
        this.delegate = delegate
        this.packer = new MessagePacker(name)
        this.socket = new Socket(this)
        this.add(message, baseOpcode)
    }

    add(message: any, opcode: Record<string, string>) {
        this.packer.add(message, opcode)
    }

    startSocket(config: ISocketConfig) {
        this.socket.connect(config)
    }

    send<T>(name: string, message: T) {
        const buffer = this.packer.encode(name, message)
        if (buffer === undefined) {
                return
            }
        //TODO 1.正常：直接发  2.scoket关闭：存起来
        if(this.socket.isConnected()){
            console.log("jin---socket connect open")
            name != "proto_ping" && console.debug("[SW.send]", this.name, name, message)
            this.socket.send(buffer)
        }else if(this.socket.getCloseState){
            console.log("jin---socket Close save request")
            this.connectCallback = () => { this.socket.send(buffer) }
        }else{
            console.log(`jin---[${this.name}.send] not connected`)
            cc.error(`[${this.name}.send] not connected`)
            return
        }

        // if (!this.socket.isConnected()) {
        //     cc.error(`[${this.name}.send] not connected`)
        //     return
        // }


        // const buffer = this.packer.encode(name, message)
        // if (buffer === undefined) {
        //     return
        // }

        // name != "proto_ping" && console.debug("[SW.send]", this.name, name, message)
        // this.socket.send(buffer)
    }

    sendPing() {
        this.send<Iproto_ping>("proto_ping", { now: Date.now() })
    }

    close() {
        this.socket.close()
    }

    onOpenBefore() {
        this.delegate.onOpenBefore()
    }

    onOpen() {
        this.delegate.onOpen()
    }

    onMessage(buffer: ArrayBuffer) {
        const data = this.packer.decode(buffer)
        if (data === undefined) {
            return
        }

        if (data.name == "proto_pong" || !data.name) {
            console.log("jin---date.name error: ", data.name, this.connectCallback)
            // TODO 判断是否有为请求事件
            if(null != this.connectCallback){
                this.connectCallback()
                this.connectCallback = null
            }
            return
        }

        console.debug("[SW.rece]", this.name, data.name, data.message)
        monitor.emit(data.name, data.message)
    }

    onCloseBefore() {
        this.delegate.onCloseBefore?.()
    }

    onClose() {
        this.delegate.onClose()
    }

    onCloseTemp(view : string) {
        this.delegate.onCloseTemp?.(view)
    }
}
