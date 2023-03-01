
declare namespace cc {

    export namespace js {

        export function _getClassId(obj: any | Function, allowTempId: boolean = true): string

        export function _setClassId(classId: string, constructor: Function): void
    }

    export namespace Object {

        export const Flags: {

            DontSave: number = 1 << 3

            LockedInEditor: number = 1 << 9
        }
    }

    export namespace _widgetManager {

        export function remove(widget: cc.Widget): void

        export function refreshWidgetOnResized(node: cc.Node): void
    }

    export interface Object {

        _objFlags: number
    }

    export interface Game {

        _renderContext: {
            STENCIL_INDEX8: number
        }
    }

    export interface Asset {

        _uuid: string

        _nativeAsset: any
    }

    export interface Node {

        _touchListener: {

            setSwallowTouches: (swallow: boolean) => void
        }
    }

    export interface Component {

        _onPreDestroy(): void

        __scriptUuid: string

        __classname__: string
    }

    export interface Label {
        _forceUpdateRenderData(): void
    }

    export function color(r?: number | string, g?: number, b?: number, a?: number): Color
}

declare namespace jsb {

    /**
     * app 注入代码
     */
    export class PluginProxyWrapper {
        static getInstance(): jsb.PluginProxyWrapper
        setSessionCallBack: (callback: (data: string) => void) => void
        setIapCallBack: (callback: (data: string) => void) => void
        setSocialCallBack: (callback: (data: string) => void) => void
        setPlatformCallBack: (callback: (data: string) => void) => void
        setAdsCallBack: (callback: (data: string) => void) => void
        setPluginConfig: (data: string) => void
        setPackageName: (name: string) => void
        switchPluginXRunEnv: (env: number) => void
        loadPlugin: (name: string, tag: number, type: number) => void
        getPluginVersion: (name: string, tag: number, type: number) => string
        getVersionName: () => string
        getDeviceIMEI: () => string
        getMacAddress: () => string
        getVersionCode: () => string
        copyToClipboard: (text: string) => void
        userItemsLogin: (data: string) => void
        logout: () => void
        payForProduct: (data: string) => void
        shareWithItems: (data: string) => void
        jump2ExtendMethod: (tag: number, info: string) => void
        StartPushSDKItem: (data: string) => void
        hideAds: (type: number) => void
        showAds: (data: string) => void
    }

    export module fileUtils {
        export function writeDataToFile(data: ArrayBuffer, filepath: string): boolean
    }

    export function saveImageData(data: ArrayBuffer, width: number, height: number, filepath: string): boolean
}

declare interface electron {

    private ipcRenderer: {

        private on(event: string, callback: Function): void

        private off(event: string, callback: Function): void
    }
}

interface RequireMap {
    "electron": electron
}

declare function require<T extends keyof RequireMap>(name: T): RequireMap[T]
