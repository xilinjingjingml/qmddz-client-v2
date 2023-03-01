import { monitor } from "./monitor"
import { storage } from "./storage"
import { utils } from "./utils"

/**
 * 音频管理器
 */
export namespace audio {
    const audio_volume_music = "audio_volume_music"
    const audio_volume_effect = "audio_volume_effect"

    if (!CC_EDITOR) {
        setMusicVolume(storage.get(audio_volume_music) ?? 1)
        setEffectsVolume(storage.get(audio_volume_effect) ?? 1)
    }

    /**
     * 播放背景音乐
     */
    export function playMusic(parmes: ILoadAudio) {
        const load = parmes.load || utils.load.bind(utils)
        load({
            bundle: parmes.bundle,
            path: parmes.path,
            options: parmes.options,
            callback: (audio: cc.AudioClip) => cc.audioEngine.playMusic(audio, true)
        })
    }

    /**
     * 播放音效
     */
    export function playEffect(parmes: ILoadAudio) {
        const load = parmes.load || utils.load.bind(utils)
        load({
            bundle: parmes.bundle,
            path: parmes.path,
            options: parmes.options,
            callback: (audio: cc.AudioClip) => {
                const id = cc.audioEngine.playEffect(audio, false)
                if (parmes.callback) {
                    cc.audioEngine.setFinishCallback(id, parmes.callback)
                }
            }
        })
    }

    /**
     * 设置背景音乐音量
     */
    export function setMusicVolume(volume: number) {
        storage.set(audio_volume_music, volume)
        cc.audioEngine.setMusicVolume(volume)
        volume > 0 && monitor.emit("audio_music")
    }

    export function getMusicVolume() {
        return storage.get(audio_volume_music) ?? 1
    }

    /**
     * 设置音效音量
     */
    export function setEffectsVolume(volume: number) {
        storage.set(audio_volume_effect, volume)
        cc.audioEngine.setEffectsVolume(volume)
        volume > 0 && monitor.emit("audio_effect")
    }

    export function getEffectsVolume() {
        return storage.get(audio_volume_effect) ?? 1
    }

    /**
     * 播放按钮音效
     */
    export function playMenuEffect() {
        playEffect({ bundle: "start", path: "audios/menu" })
    }
}
