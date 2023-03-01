import { audio } from "../../base/audio"
import AudioConfig from "./AudioConfig.ddz"

export namespace AudioManager {
	let _bundle = ""
	let _path = ""
	let _load: (params: ILoadAudio) => void

	export function setConfig(bundle: string, path: string, load: (params: ILoadAudio) => void) {
		_bundle = bundle
		_path = path
		_load = load
	}

	export function playMusic(name: string) {
		if (!AudioConfig[name]) {
			cc.warn("[AudioManager.playMusic]", name)
			return
		}

		audio.playMusic({
			bundle: _bundle,
			path: _path + AudioConfig[name],
			load: _load
		})
	}

	export function playEffect(name: string, sex?: number, callback?: () => void) {
		if (sex != null) {
			const sexName = name + ((sex == 1) ? "woman" : "man")
			if (AudioConfig[sexName]) {
				_playEffect(sexName, callback)
				return
			}
		}

		if (!AudioConfig[name]) {
			cc.warn("[AudioManager.playSound]", name)
			return
		}
		_playEffect(name, callback)
	}

	function _playEffect(name, callback?: () => void) {
		audio.playEffect({
			bundle: _bundle,
			path: _path + AudioConfig[name],
			load: _load,
			callback: callback,
		})
	}

	export function playBGMusic() {
		playMusic("bg_music")
	}

	export function playMenuEffect() {
		audio.playMenuEffect()
	}
}
