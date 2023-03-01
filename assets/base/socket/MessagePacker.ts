import * as protobuf from "../extensions/protobuf"
/**
 * 消息打/解包
 */
export default class MessagePacker {
    private opcode: Record<string, string>
    private builder: any
    private name: string

    constructor(name: string) {
        this.name = name
        this.opcode = {}
        this.builder = protobuf.newBuilder({ convertFieldsToCamelCase: true })
    }

    add(message: any, opcode: Record<string, string>) {
        for (const id in opcode) {
            this.opcode[this.opcode[id] = opcode[id]] = id
        }
        this.builder = protobuf.loadJson(message, this.builder)
    }

    encode(name: string, message: any): ArrayBuffer {
        const id = this.opcode[name]
        if (id === undefined) {
            cc.error(`[MessagePacker.encode] ${this.name} not find message`, name)
            return
        }

        if (this.builder.lookup(name) == null) {
            cc.error(`[MessagePacker.encode] ${this.name} not find proto`, name)
            return
        }

        return this.writeCode(this.builder.build(name).encode(message).toBuffer(), parseInt(id))
    }

    decode(data: ArrayBuffer) {
        const buffer = new Uint8Array(data)
        const id = this.readCode(buffer)
        if (id === undefined) {
            cc.warn(`[MessagePacker.decode] ${this.name} buffer too short`)
            return
        }

        const name = this.opcode[id]
        if (name === undefined) {
            cc.warn(`[MessagePacker.decode] ${this.name} not find id`, id)
            return
        } else if (name.length == 0) {
            return
        }

        if (this.builder.lookup(name) == null) {
            cc.error(`[MessagePacker.decode] ${this.name} not find proto`, name)
            return
        }

        return { name: name, message: this.builder.build(name).decode(buffer.subarray(2, buffer.length)) }
    }

    private writeCode(buffer: Uint8Array, id: number): ArrayBuffer {
        let abuf = new ArrayBuffer(buffer.byteLength + 2)
        let ubuf = new Uint8Array(abuf)
        ubuf[0] = (id & 0xFF00) >>> 8
        ubuf[1] = id & 0x00FF
        ubuf.set(new Uint8Array(buffer), 2)
        return abuf
    }

    private readCode(buffer: Uint8Array) {
        if (buffer.length < 2) {
            return
        }

        let id = buffer[0] << 8
        id |= buffer[1]
        if ((id & 0x8000) === 0x8000) {
            id = -(0xFFFF - id + 1)
        }
        return id
    }
}
