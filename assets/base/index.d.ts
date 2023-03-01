interface ISocketConfig {
    ip: string
    port: number
}

interface ISocketWrapper {
    add(message: any, opcode: Record<string, string>)
    startSocket(config: ISocketConfig)
    send<T>(name: string, message: T): void
    close(): void
}

interface ISocketDelegate {
    socket: ISocketWrapper
    startSocket(): void
    onOpenBefore(): void
    onOpen(): void
    onCloseBefore?(): void
    onClose(): void
    onCloseTemp?(view : string): void
}

interface ILoadAsset {
    bundle?: string
    path: string
    callback?: (asset: cc.Asset) => void
    options?: Record<string, any>
}

interface ILoadSprite extends ILoadAsset {
    node: cc.Node
    delay?: boolean // 加载完成后显示
    adjustSize?: boolean | cc.Size | cc.Node // 调整大小
    load?: (params: ILoadAsset) => void // 引用计数
    callback?: () => void // 安全成功回调
}

interface ILoadAudio extends ILoadAsset {
    load?: (params: ILoadAsset) => void // 引用计数
    callback?: () => void
}

