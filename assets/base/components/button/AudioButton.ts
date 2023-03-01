import { audio } from "../../audio"
import BaseButton from "./BaseButton"

const { ccclass, disallowMultiple, menu } = cc._decorator

@ccclass
@disallowMultiple
@menu("button/AudioButton")
export default class AudioButton extends BaseButton {

    onClick() {
        audio.playMenuEffect()
    }
}
