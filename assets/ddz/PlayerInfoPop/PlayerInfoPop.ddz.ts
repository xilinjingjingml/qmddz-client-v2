import { audio } from "../../base/audio"
import { NodeExtends } from "../../base/extends/NodeExtends"
import { UserExtends } from "../../base/extends/UserExtends"
import { math } from "../../base/math"
import { utils } from "../../base/utils"
import BasePop from "../../base/view/BasePop"
import { appfunc } from "../../lobby/appfunc"
import { AudioManager } from "../audio/AudioManager.ddz"
import { GameFunc } from "../game/GameFunc.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class PlayerInfoPop extends BasePop {
    params: {
        type: number,
        data: Iproto_PlyBaseData,
        localtion: string,
        nHB: number,
        nFuCard: number,
    }

    start() {
        // avater
        UserExtends.setUserFace({
            node: this.$("spt_avater"),
            uid: this.params.data.plyGuid,
            adjustSize: true,
            delay: true,
            load: this.load.bind(this),
        })

        // sex
        const isMan = this.params.data.sex != 1
        this.$("icon_man").active = isMan
        this.$("icon_woman").active = !isMan

        // label_name
        this.$("label_name", cc.Label).string = utils.substr(this.params.data.nickname, 7)

        // label_localtion
        if (this.params.localtion) {
            this.$("label_localtion", cc.Label).string = this.params.localtion
        }

        // label_gold
        this.$("label_gold", cc.Label).string = math.short(this.params.data.money)
        // label_fucard
        this.$("label_fucard", cc.Label).string = math.short(this.params.nFuCard)
        // label_hb
        this.$("label_hb", cc.Label).string = appfunc.toCash(this.params.nHB).toFixed(2) + "元"

        this.$("settting").active = this.params.type == 0
        this.$("magic").active = this.params.type == 1

        this.refreshMusicSwith()
        this.refreshEffectSwith()
    }

    onPressMusic(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        audio.setMusicVolume(audio.getMusicVolume() > 0 ? 0 : 1)
        this.refreshMusicSwith()
    }

    onPressEffect(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)

        audio.setEffectsVolume(audio.getEffectsVolume() > 0 ? 0 : 1)
        AudioManager.playMenuEffect()
        this.refreshEffectSwith()
    }

    onPressMagic(event: cc.Event.EventTouch, data: string) {
        NodeExtends.cdTouch(event)

        this.onPressClose()
        GameFunc.send<Iproto_magic_emoji_req>("proto_magic_emoji_req", {
            cEmojiIndex: parseInt(data),
            cToChairID: this.params.data.chairId,
            cCostType: 1
        })
    }

    refreshMusicSwith() {
        const active = audio.getMusicVolume() > 0
        this.$("music_open").active = active
        this.$("music_close").active = !active
    }

    refreshEffectSwith() {
        const active = audio.getEffectsVolume() > 0
        this.$("effect_open").active = active
        this.$("effect_close").active = !active
    }
}
