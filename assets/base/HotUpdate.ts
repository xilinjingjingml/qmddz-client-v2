import { storage } from "./storage"
import { utils } from "./utils"

export enum EUpdateState {
    updating,
    noFound,
    failed,
    finished,
    already,
}

/**
 * 热更新
 * @example
 * const hotUpdate = new HotUpdate("xxx")
 * if (utils.versionCompare("xxxx", hotUpdate.getLocalVersion()) >= 0) {
 *     return
 * }
 * hotUpdate.setProgressHandle(xxx)
 * hotUpdate.setResultHandle(xxx)
 * hotUpdate.setUpdateUrl(xxx)
 * hotUpdate.update()
 * 
 * // failed
 * hotUpdate.updateFailed()
 */
export default class HotUpdate {
    private name: string
    private storagePath: string
    private manifestPath: string
    private assetsManager: jsb.AssetsManager
    private manifestJson: any
    private defaultManifestJson: any
    private progressHandle: (percent: number, total: number, download: number) => void
    private resultHandle: (ret: EUpdateState) => void
    private percent: number = -1
    private download: number = 0

    constructor(name: string, path: string) {
        this.name = name

        this.storagePath = jsb.fileUtils.getWritablePath() + name
        this.manifestPath = path + name + ".manifest"

        const paths: string[] = storage.get("hotUpdates", false) || []
        if (paths.includes(name)) {
            this.manifestPath = `${this.storagePath}/project.manifest`
        }
        this.assetsManager = new jsb.AssetsManager(this.manifestPath, this.storagePath, utils.versionCompare)

        const manifest = this.assetsManager.getLocalManifest()
        if (!manifest.isLoaded()) {
            this.defaultManifestJson = { version: "0.0.0.0" }
            manifest.parseJSONString(JSON.stringify(this.defaultManifestJson), manifest.getManifestRoot())
        }
    }

    getLocalVersion() {
        return this.assetsManager.getLocalManifest().getVersion()
    }

    setProgressHandle(handle: (value: number) => void) {
        this.progressHandle = handle
    }

    setResultHandle(handle: (ret: EUpdateState) => void) {
        this.resultHandle = handle
    }

    setUpdateUrl(url: string) {
        url += `/${this.name}/`
        cc.log("[HotUpdate.setUpdateUrl]", url)

        this.manifestJson = {
            packageUrl: url,
            remoteManifestUrl: url + "project.manifest",
            remoteVersionUrl: url + "version.manifest",
        }

        this.setManifest(this.assetsManager.getLocalManifest(), this.defaultManifestJson ?? JSON.parse(jsb.fileUtils.getStringFromFile(this.manifestPath)))
    }

    setManifest(manifest: jsb.Manifest, json: any) {
        manifest.parseJSONString(JSON.stringify(Object.assign(json, this.manifestJson)), manifest.getManifestRoot())
    }

    update() {
        cc.log("[HotUpdate.update]")
        this.assetsManager.setEventCallback(this.updateCallback.bind(this))
        this.assetsManager.update()
    }

    updateFailed() {
        cc.log("[HotUpdate.updateFailed]")
        this.assetsManager.setEventCallback(this.updateCallback.bind(this))
        this.assetsManager.downloadFailedAssets()
    }

    private updateCallback(event: jsb.EventAssetsManager) {
        let state: EUpdateState = EUpdateState.updating
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                cc.log("[HotUpdate.updateCallback] No local manifest file found, hot update skipped.")
                state = EUpdateState.noFound
                break
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                cc.log("[HotUpdate.updateCallback] Fail to download manifest file, hot update skipped.")
                state = EUpdateState.noFound
                break
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                cc.log("[HotUpdate.updateCallback] NEW_VERSION_FOUND.")
                const manifest = this.assetsManager.getRemoteManifest()
                this.setManifest(manifest, JSON.parse(jsb.fileUtils.getStringFromFile(manifest.getManifestRoot() + "project.manifest.temp")))
                break
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                cc.log("[HotUpdate.updateCallback] Already up to date with the latest remote version.")
                state = EUpdateState.already
                break
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                cc.log("[HotUpdate.updateCallback] Updated file.", event.getMessage())
                this.updateProgress(event)
                break
            case jsb.EventAssetsManager.ERROR_UPDATING:
                cc.log("[HotUpdate.updateCallback] Asset update error:", event.getMessage())
                break
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                cc.log("[HotUpdate.updateCallback] Update finished.")
                state = EUpdateState.finished
                break
            case jsb.EventAssetsManager.UPDATE_FAILED:
                cc.log("[HotUpdate.updateCallback] Update failed.")
                state = EUpdateState.failed
                break
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                cc.log("[HotUpdate.updateCallback] ERROR_DECOMPRESS.", event.getMessage())
                break
            default:
                break
        }

        if (state == EUpdateState.updating) {
            return
        }

        this.assetsManager.setEventCallback(null)

        if (state == EUpdateState.finished) {
            let paths = storage.get("hotUpdates", false) || []
            paths.push(this.name)
            paths = Array.from(new Set(paths))
            storage.set("hotUpdates", paths, false)
        }

        if (this.resultHandle) {
            this.resultHandle(state)
        }
    }

    private updateProgress(event: jsb.EventAssetsManager) {
        let percent = event.getPercent()
        let total = event.getTotalBytes()
        let download = event.getDownloadedBytes()
        cc.log("[HotUpdate.updateProgress] percent", percent, total, download)
        if (this.progressHandle == null || isNaN(percent)) {
            return
        }
        if (percent > 1) {
            percent = 1
        }
        if (percent <= this.percent) {
            return
        }
        if (download <= this.download) {
            this.download = download
        }
        this.percent = percent
        this.download = download
        this.progressHandle(percent, total, download)
    }
}
