import { listen } from "../../base/monitor"
import BaseView from "../../base/view/BaseView"
import { AudioManager } from "../audio/AudioManager.ddz"
import { EGameState, EPlayer, EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import { ECardPoint, GameRule } from "../game/GameRule.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class spine extends BaseView {

    start() {
        this.$("spines").children.forEach(child => child.active = false)
    }

    playSpine(name: string, chairId: number = -1, callback: Function = null) {
        const node = this.$(name)
        if (node == null) {
            return
        }

        let fixY = 0
        let spineName = ""
        if (name == "wangzha") {
            if (chairId == EPlayer.Me) {
                spineName = "huojianfei_ziji"
            } else if (chairId == EPlayer.Right) {
                spineName = "huojianfei_you"
            } else if (chairId == EPlayer.Left) {
                spineName = "huojianfei_zuo"
            } else {
                spineName = "huojianzha"
                this.shakeWorld(1.1)
            }
        } else if (name == "zhadan") {
            if (chairId == EPlayer.Me) {
                spineName = "lujingzhu"
            } else if (chairId == EPlayer.Right) {
                spineName = "lujingyou"
            } else if (chairId == EPlayer.Left) {
                spineName = "lujingzuo"
            } else {
                spineName = "zha"
                this.shakeWorld(0.1)
            }
        } else if (name == "shunzi2") {
            spineName = "tongqian"
            fixY = chairId == 0 ? 130 : 280
        } else if (name == "shunzi") {
            spineName = "tongqian"
            fixY = chairId == 0 ? 130 : 280
        } else if (name == "liandui") {
            spineName = "liandui"
            fixY = chairId == 0 ? 70 : 220
        } else if (name == "chuntian") {
            spineName = "Spring"
        } else if (name == "fanchuntian") {
            spineName = "Spring"
        } else if (name == "feiji") {
            if (chairId == EPlayer.Me) {
                spineName = "Feiji_M"
            } else if (chairId == EPlayer.Right) {
                spineName = "Feiji_R"
            } else if (chairId == EPlayer.Left) {
                spineName = "Feiji_L"
            }
        }

        if (spineName.length == EPlayer.Me) {
            return
        }

        node.active = true
        node.y = fixY + (chairId >= 0 ? this.$("node_player" + chairId).y : 0)
        const spine = node.getComponent(sp.Skeleton)
        spine.setAnimation(0, spineName, false)
        spine.setCompleteListener((track: sp.spine.TrackEntry) => {
            spine.setCompleteListener(null)
            if (!this.isValid) {
                return
            }
            node.active = false
            if (callback && track.animation?.name === spineName) {
                // 延迟1帧否则,避免"被"setCompleteListener(null)
                this.scheduleOnce(callback)
            }
        })
    }

    shakeWorld(t: number) {
        const dt = 0.1
        const angle = 1.1
        const node = cc.Canvas.instance.node
        cc.Tween.stopAllByTarget(node)
        cc.tween(node)
            .delay(t)
            .set({ angle: 0 })
            .then(cc.tween().to(dt, { angle: angle }).to(dt, { angle: -angle }))
            .repeat(2)
            .to(dt, { angle: 0 })
            .start()
    }

    @listen("proto_gc_play_card_not")
    proto_gc_play_card_not(message: Iproto_gc_play_card_not) {
        const chairId = GameFunc.S2C(message.cChairID)
        if (message.cType.mNTypeBomb > 0) {
            if (message.cType.mNTypeValue == ECardPoint.Wang) {
                AudioManager.playEffect("audio_rocket")
                this.playSpine("wangzha", chairId, () => this.playSpine("wangzha")) //火箭
            } else {
                AudioManager.playEffect("audio_bomb")
                this.playSpine("zhadan", chairId, () => this.playSpine("zhadan")) //炸弹
            }
        } else if (GameRule.checkShunZi(message.cType.mNTypeNum)) {
            if (message.cType.mNTypeNum == 12) {
                this.playSpine("shunzi2", chairId) //顺子
            } else {
                this.playSpine("shunzi", chairId) //顺子
            }
        } else if (GameRule.checkLianDui(message.cType.mNTypeNum)) {
            this.playSpine("liandui", chairId) //连队
        } else if (GameRule.checkFeiJi(message.cType.mNTypeNum)) {
            AudioManager.playEffect("audio_plane")
            this.playSpine("feiji", chairId) //飞机
        }
    }

    @listen(EventName.game_end)
    onGameEnd(message: Iproto_gc_game_result_not1) {
        const next = () => {
            GameFunc.fsm.transform(EGameState.game_result)
        }
        if (message.bSpring) {
            this.playSpine("chuntian", -1, next)
        } else if (message.bReverseSpring) {
            this.playSpine("fanchuntian", -1, next)
        } else {
            // 延迟显示结算界面 等消息飞一会儿
            this.scheduleOnce(next, 2)
        }
    }
}
