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
        let fixY = 0
        let isShowX = false
        let spineName = ""
        let dragonBonesName = ""
        if (name == "wangzha") {
            spineName = "animation"
            // if (chairId == EPlayer.Me) {
            //     spineName = "animation"
            // } else if (chairId == EPlayer.Right) {
            //     spineName = "animation"
            // } else if (chairId == EPlayer.Left) {
            //     spineName = "animation"
            // } else {
            //     spineName = "animation"
            //     this.shakeWorld(1.1)
            // }
        } else if (name == "zhadan") {
            spineName = "animation"
            // if (chairId == EPlayer.Me) {
            //     spineName = "animation"
            // } else if (chairId == EPlayer.Right) {
            //     spineName = "animation"
            // } else if (chairId == EPlayer.Left) {
            //     spineName = "animation"
            // } else {
            //     spineName = "animation"
            //     this.shakeWorld(0.1)
            // }
        } else if (name == "shunzi2") {
            spineName = "tongqian"
            fixY = chairId == 0 ? 130 : 280
        } else if (name == "shunzi") {
            dragonBonesName = "newAnimation"
            isShowX = true
            // fixY = chairId == 0 ? 130 : 280
        } else if (name == "liandui") {
            dragonBonesName = "newAnimation"
            isShowX = true
            // fixY = chairId == 0 ? 70 : 220
        } else if (name == "chuntian") {
            spineName = "animation"
        } else if (name == "fanchuntian") {
            spineName = "animation02"
        } else if (name == "feiji") {
            // spineName = "animation"
            if (chairId == EPlayer.Me) {
                spineName = "animation"
                name = "feiji-you"//me与right动画相同 feiji-xia
            } else if (chairId == EPlayer.Right) {
            spineName = "animation"
                name = "feiji-you"
            } else if (chairId == EPlayer.Left) {
                spineName = "animation"
                name = "feiji-zuo"
            }
        } else if (name == "3dai1") {
            dragonBonesName = "newAnimation"
            isShowX = true
        } else if (name == "3dai2") {
            dragonBonesName = "newAnimation"
            isShowX = true
        } else if (name == "4dai2") {
            dragonBonesName = "newAnimation"
            isShowX = true
        }

        const node = this.$(name)
        if (node == null) {
            return
        }

        // if (spineName.length == EPlayer.Me) {
        //     return
        // }
        node.active = true
        node.setScale(0.9)
        node.y = fixY + (chairId >= 0 ? this.$("node_player" + chairId).y : 0)
        if(isShowX){
            node.y = this.$("node_player" + chairId + "_me").y
            node.x = this.$("node_player" + chairId + "_me").x
        }
        console.log("jin---dragonBones: ", dragonBonesName, "  spine: ",spineName," node.x: ", node.x, " node.y: ", node.y, " isShowX: ",isShowX," chairId: ", chairId, this.$("node_player" + chairId).y)
        if(dragonBonesName != ""){
            const dragonBone = node.getComponent(dragonBones.ArmatureDisplay)
            dragonBone.playAnimation(dragonBonesName, 1)
        }else if(spineName != ""){
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
        // console.log("jin---proto_gc_play_card_not: ", message)
        if (message.cType.mNTypeBomb > 0) {
            if (message.cType.mNTypeValue == ECardPoint.Wang) {
                AudioManager.playEffect("audio_rocket")
                this.playSpine("wangzha", chairId) //火箭, () => this.playSpine("wangzha")
            } else {
                AudioManager.playEffect("audio_bomb")
                this.playSpine("zhadan", chairId) //炸弹, () => this.playSpine("zhadan")
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
        } else if (GameRule.checkSanDai_1(message.cType.mNTypeNum)) {
            AudioManager.playEffect("audio_plane")//todo 音效
            console.log("jin---三带一: ", )
            this.playSpine("3dai1", chairId) //三带一
        } else if (GameRule.checkSanDai_2(message.cType.mNTypeNum)) {
            AudioManager.playEffect("audio_plane")//todo 音效
            console.log("jin---三带er: ", )
            this.playSpine("3dai2", chairId) //三带二
        }//todo
        else if (Number(message.cType.mNTypeNum) == 411 || Number(message.cType.mNTypeNum) == 422) {
            AudioManager.playEffect("audio_plane")//todo 音效
            this.playSpine("4dai2", chairId) //四带二
        }//todo
    }

    @listen(EventName.game_end)
    onGameEnd(message: Iproto_gc_game_result_not1) {
        //游戏结束 结算
        console.log("jin---onGameEnd: ", message)
        const next = () => {
            GameFunc.fsm.transform(EGameState.game_result)
        }
        if (message.bSpring) {
            cc.tween(this.node)
                .delay(1)
                .call(()=>{this.playSpine("chuntian", -1, next)})
                .start()
        } else if (message.bReverseSpring) {
            cc.tween(this.node)
                .delay(1)
                .call(()=>{this.playSpine("fanchuntian", -1, next)})
                .start()
        } else {
            // 延迟显示结算界面 等消息飞一会儿
            this.scheduleOnce(next, 2)
        }
    }
}
