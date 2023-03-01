import { audio } from "../../base/audio"
import { NodeExtends } from "../../base/extends/NodeExtends"
import { listen, monitor } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import RootPopup from "../../base/view/RootPopup"
import { appfunc } from "../../lobby/appfunc"
import { ads } from "../../start/ads"
import { ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { AudioManager } from "../audio/AudioManager.ddz"
import { EPlayer, EventName } from "../game/GameConfig.ddz"
import { GameFunc } from "../game/GameFunc.ddz"
import { GameView } from "../game/GameView.ddz"
import { app } from "../../start/app"
import { storage } from "../../base/storage";

const { ccclass, property } = cc._decorator

@ccclass
export default class BaiYuanResultPop extends BasePop {
    @property({ type: cc.SpriteFrame })
    hbIcon: cc.SpriteFrame = null

    params: {
        message: Iproto_gc_game_result_not1,
        showDouble: boolean,
        winStreakCount: number,
    }

    winScore: number = 0
    awards: IAward

    start() {
        console.log("jin---BaiYuanResultPop")
        // const winChairIds: number[] = []
        // const loseChairIds: number[] = []
        // let isWin = false
        // this.params.message.vecUserResult1.forEach(v => {
        //     const chairId = GameFunc.S2C(v.nChairID)
        //     if (v.nScore > 0) {
        //         winChairIds.push(chairId)
        //         if (chairId == EPlayer.Me) {
        //             isWin = true
        //         }
        //     } else {
        //         loseChairIds.push(chairId)
        //     }
        // })

        // this.$("node_win").active = isWin
        // this.$("node_lose").active = !isWin
        // this.$("node_hb").active = isWin
        // this.$("node_button").active = false

        // let title = "胜利"
        // if (this.params.winStreakCount >= 2 && this.params.winStreakCount <= 9) {
        //     title = this.params.winStreakCount + "连胜"
        // }
        // this.$("label_title_win", cc.Label).string = title

        // if (isWin) {
        //     this.showRoundAni()
        // }

        // const chairId2pos = (chairId: number) => this.node.convertToNodeSpaceAR(GameFunc.getPlayerPos(chairId, "node_avater/node_info/node_hb") || cc.Vec2.ZERO)
        // const name2pos = (name: string) => this.node.convertToNodeSpaceAR(this.$(name).convertToWorldSpaceAR(cc.Vec2.ZERO))

        // if (isWin) {
        //     if (GameFunc.isLord()) {
        //         loseChairIds.forEach((chairId, i, arr) => {
        //             this.sop_drop({
        //                 start: chairId2pos(chairId),
        //                 end: chairId == EPlayer.Left ? name2pos("lbl_money1") : name2pos("lbl_money2"),
        //                 angle: chairId == EPlayer.Left ? -90 : 90,
        //                 callback: i == arr.length - 1 ? this.showGeButton.bind(this) : null
        //             })
        //         })
        //     } else {
        //         winChairIds.forEach((chairId, i, arr) => {
        //             this.sop_drop({
        //                 start: chairId2pos(loseChairIds[0]),
        //                 end: chairId == 0 ? name2pos("lbl_money1") : chairId2pos(chairId),
        //                 angle: chairId == EPlayer.Left ? -90 : 90,
        //                 callback: i == arr.length - 1 ? this.showGeButton.bind(this) : null
        //             })
        //         })
        //     }
        // } else {
        //     if (GameFunc.isLord()) {
        //         winChairIds.forEach((chairId, i, arr) => {
        //             this.sop_drop({
        //                 start: chairId2pos(loseChairIds[0]),
        //                 end: chairId2pos(chairId),
        //                 angle: chairId == EPlayer.Left ? -90 : 90,
        //                 callback: i == arr.length - 1 ? this.close.bind(this) : null
        //             })
        //         })
        //     } else {
        //         loseChairIds.forEach((chairId, i, arr) => {
        //             this.sop_drop({
        //                 start: chairId2pos(chairId),
        //                 end: chairId2pos(winChairIds[0]),
        //                 angle: chairId == EPlayer.Left ? -90 : 90,
        //                 callback: i == arr.length - 1 ? this.close.bind(this) : null
        //             })
        //         })
        //     }
        // }

        // const winChairIds: number[] = []
        // const loseChairIds: number[] = []
        // let isWin = false
        // this.params.message.vecUserResult1.forEach(v => {
        //     const chairId = GameFunc.S2C(v.nChairID)
        //     if (v.nScore > 0) {
        //         winChairIds.push(chairId)
        //         if (chairId == EPlayer.Me) {
        //             isWin = true
        //         }
        //     } else {
        //         loseChairIds.push(chairId)
        //     }
        // })
        // this.params.message.vecUserResult1.forEach(v => {
        //     console.log("jin---vecUserResult1:", v)
        //     this.$("lbl_yuan_0", cc.Label).string = appfunc.toCash(v.nScore).toFixed(2) + ""
        // })

        this.params.message.vecUserResult1.forEach(v => {
            console.log("jin---vecUserResult1:", v)
            const chairId = GameFunc.S2C(v.nChairID)
            // if (GameFunc.isLord()) {
            //     if (chairId != EPlayer.Me) {
            //         this.$("lbl_yuan_0", cc.Label).string = appfunc.toCash(-v.nScore).toFixed(2) + ""
            //     }
            // } else {
            if (chairId == EPlayer.Me) {
                this.$("lbl_yuan_0", cc.Label).string = appfunc.toCash(v.nScore).toFixed(2) + ""
            }
            // }
        })
        this.showUIAni()

    }

    showUIAni() {
        this.$("sp_shengli").active = false
        this.$("sp_yuan").active = false
        this.$("sp_yuanbao").active = false

        let round: Number = app.user.won + app.user.lost + app.user.dogfall
        let firstAd = app.getOnlineParam("first_ad", 0)
        let free = false
        if (round == 1 && (firstAd === -1 || (firstAd === 0 && app.user.guid % 2 === 0))) {
            free = true
        }
        let result_noSeeAd_count = storage.get("result_noSeeAd_count")
        console.log("jin---BaiYuanResultPop showUIAni: ", app.user.won, app.user.lost, app.user.dogfall)
        cc.Tween.stopAllByTarget(this.node)
        cc.tween(this.node)
            .delay(0.2)
            .call(() => {
                let self = this
                if (!this.isValid) {
                    return
                }
                self.$("sp_shengli").active = true
                const spine_sl = this.$("sp_shengli", sp.Skeleton)
                spine_sl.setAnimation(0, "shengli", false)
            })
            // .delay(0.1)
            .call(() => {
                let self = this
                if (!this.isValid) {
                    return
                }
                self.$("sp_yuan").active = true
                const spine_yuan = this.$("sp_yuan", sp.Skeleton)
                spine_yuan.setAnimation(0, "animation", false)
            })
            .delay(1)
            .call(() => {
                this.$("lbl_yuan_0").active = true
                cc.tween(this.$("lbl_yuan_0"))
                    .to(0.1, { position: cc.v3(-170, -65, 0) })
                    .start()

                this.$("bg_score").active = true
                this.$("lbl_yuanbao_1").active = true
                cc.tween(this.$("lbl_yuanbao_1"))
                    .to(0.1, { position: cc.v3(180, -65, 0) })
                    .start()
            })

            // .call(() => {
            //     let self = this
            //     if (!this.isValid) {
            //         return
            //     }
            //     self.$("sp_yuanbao").active = true
            //     const spine_yuanbao = this.$("sp_yuanbao", sp.Skeleton)
            //     spine_yuanbao.setAnimation(0, "yuanbao_tanchu2", false)
            // })
            // .call(() => {
            //     this.$("bg_score").active = true
            //     this.$("lbl_yuanbao_1").active = true
            //     cc.tween(this.$("lbl_yuanbao_1"))
            //         .to(0.1, { position: cc.v3(180, -65, 0) })
            //         .start()
            // })
            .delay(0.4)
            .call(() => {
                this.$("icon_video").active = !free
                this.$("btn_text_double_get").active = !free
                this.$("btn_text_free_get").active = free
                this.$("node_button").active = true
                console.log("jin---result_noSeeAd_count: ", Number(result_noSeeAd_count), round)
                this.$("btn_get").active = round > 1 ? ((Number(result_noSeeAd_count) == 4 && round > 10) ? false : true) : round != 1
                cc.tween(this.$("node_button"))
                    .to(0.4, { position: cc.v3(0, -300, 0) })
                    .start()
            })
            .start()
    }

    // showRoundAni() {
    //     this.$("lbl_money1").active = false
    //     this.$("lbl_money2").active = false
    //     this.$("node_hb").active = true
    //     if (!GameFunc.isLord()) {
    //         this.$("node_hb1").x = 0
    //         this.$("node_hb2").active = false
    //     }
    //     this.params.message.vecUserResult1.forEach(v => {
    //         const chairId = GameFunc.S2C(v.nChairID)
    //         if (GameFunc.isLord()) {
    //             if (chairId != EPlayer.Me) {
    //                 this.$("lbl_money" + (chairId == EPlayer.Right ? 2 : 1), cc.Label).string = appfunc.toCash(-v.nScore).toFixed(2) + ""
    //             }
    //         } else {
    //             if (chairId == EPlayer.Me) {
    //                 this.$("lbl_money" + 1, cc.Label).string = appfunc.toCash(v.nScore).toFixed(2) + ""
    //             }
    //         }
    //     })

    //     for (let i = 1; i <= 2; i++) {
    //         if (!this.$("node_hb" + i).active) {
    //             continue
    //         }

    //         const spine = this.$("spine_hb" + i, sp.Skeleton)
    //         spine.setAnimation(0, "kaishi", false)
    //         spine.setCompleteListener(() => {
    //             if (!this.isValid) {
    //                 return
    //             }

    //             spine.setCompleteListener(null)
    //             spine.setAnimation(0, "shuzi", true)
    //         })
    //     }
    // }

    playHBSpineGet() {
        for (const v of this.params.message.vecUserResult1) {
            if (GameFunc.S2C(v.nChairID) == EPlayer.Me) {
                const score = this.winScore || v.nScore
                monitor.emit(EventName.game_player_hb_change, v.nChairID, score)
                // 玩家红包变化公告
                // GameView.showBaiYuanToCashChange({ value: score,  bomb: false })

                this.close()
                break
            }
        }
        // this.$("node_button").active = false
        // const pos = GameFunc.getPlayerPos(EPlayer.Me, "node_avater/node_info/node_hb") || cc.Vec2.ZERO
        // for (let i = 1; i <= 2; i++) {
        //     if (!this.$("node_hb" + i).active) {
        //         continue
        //     }

        //     this.$("lbl_money" + i).active = false
        //     this.$("node_button").active = false

        //     const node = this.$("spine_hb" + i)
        //     const spine = node.getComponent(sp.Skeleton)
        //     spine.setAnimation(0, "jiesu", false)
        //     spine.setCompleteListener(() => {
        //         spine.setCompleteListener(null)
        //         if (!this.isValid) {
        //             return
        //         }

        //         let action = cc.spawn([
        //             cc.scaleTo(0.6, 0.1),
        //             cc.jumpTo(0.6, node.convertToNodeSpaceAR(pos), 50, 1).easing(cc.easeSineIn()),
        //         ])
        //         if (i == 1) {
        //             action = cc.sequence([
        //                 action,
        //                 cc.callFunc(() => {
        //                     this.close()
        //                     for (const v of this.params.message.vecUserResult1) {
        //                         if (GameFunc.S2C(v.nChairID) == EPlayer.Me) {
        //                             const score = this.winScore || v.nScore
        //                             monitor.emit(EventName.game_player_hb_change, v.nChairID, score)
        //                             // 玩家红包变化公告
        //                             GameView.showBaiYuanToCashChange({ value: score,  bomb: false })
        //                             break
        //                         }
        //                     }
        //                 })
        //             ])
        //         }
        //         node.runAction(action)
        //     })
        // }
    }

    // 从一个地方吸到另一个地方
    sop_drop(params: { start: cc.Vec2, end: cc.Vec2, angle: number, callback?: Function }) {
        const sum = 10
        for (let i = 0; i < sum; i++) {
            const node = new cc.Node()
            node.scale = 2
            node.parent = this.node
            node.setPosition(params.start)

            const sprite = node.addComponent(cc.Sprite)
            sprite.spriteFrame = this.hbIcon

            const delayTime = i * 0.1
            cc.tween(node)
                .hide()
                .delay(delayTime)
                .show()
                .to(0.5, { angle: params.angle, scale: 0.8, x: params.end.x, y: params.end.y }, { easing: "cubicOut" })
                .call(() => {
                    node.parent = null
                    node.destroy()
                    if (i == sum - 1 && params.callback) {
                        params.callback()
                    }
                })
                .start()
        }
    }

    onPressGet(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()
        let result_order = storage.get("result_order")
        let result_bukan_order = storage.get("result_bukan_order")
        storage.set("result_bukan_order", Number(storage.get("result_bukan_order")) >= 4 ? 1 : Number(storage.get("result_bukan_order")) + 1)
        storage.set("result_order", Number(result_bukan_order) >= 4 ? 1 : Number(result_bukan_order) + 1)
        console.log("jin---showBaiYuanJiaSuTiXian: ", result_order)
        this.playHBSpineGet()
        let result_noSeeAd_count = storage.get("result_noSeeAd_count")
        storage.set("result_noSeeAd_count", Number(result_noSeeAd_count) + 1)
        audio.playEffect({ bundle: "lobby", path: "awards/audios/hb_coming" })
    }

    onPressDoubleGet(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()
        let round = app.user.won + app.user.lost + app.user.dogfall
        //新手第一局免费获得
        let firstAd = app.getOnlineParam("first_ad", 0)
        if (round == 1 && (firstAd === -1 || (firstAd === 0 && app.user.guid % 2 === 0))) {
            if (this.isValid) {
                ads.receiveAward({
                    method: 0,
                    index: ads.video.New_WinDouble,
                    showAward: false,
                    success: (res) => {
                        console.log("jin---onPressDoubleGet: ", res)
                        if (this.isValid) {
                            storage.set("result_order", 1)
                            GameFunc.send<Iproto_cg_baiyuan_win_double_req>("proto_cg_baiyuan_win_double_req", {})
                            this.awards = res.awards[0]
                        }

                    }
                })
            }
        } else {
            ads.receiveAward({
                index: ads.video.New_WinDouble,
                showAward: false,
                success: (res) => {
                    console.log("jin---onPressDoubleGet: ", res)
                    if (this.isValid) {
                        storage.set("result_order", 1)
                        GameFunc.send<Iproto_cg_baiyuan_win_double_req>("proto_cg_baiyuan_win_double_req", {})
                        this.awards = res.awards[0]
                    }

                }
            })
        }

    }

    @listen("proto_gc_baiyuan_win_double_ack")
    proto_gc_baiyuan_win_double_ack(message: Iproto_gc_baiyuan_win_double_ack) {
        if (message.cRet == 0) {
            const awards: IAward[] = []
            message.vecItemInfo.forEach(info => {
                console.log("jin---proto_gc_baiyuan_win_double_ack: ", info)
                if (info.nItemId == ITEM.TO_CASH) {
                    this.winScore += info.nItemNum
                }
                awards.push({ index: info.nItemId, num: info.nItemNum })
            })
            awards.push(this.awards)
            console.log("jin---proto_gc_baiyuan_win_double_ack222: ", awards)
            appfunc.showAwardPop(awards, () => {
                console.log("jin---proto_gc_baiyuan_win_double_ack333: ", this.isValid)
                if (this.isValid) {
                    this.playHBSpineGet()
                    storage.set("result_noSeeAd_count", 1)
                }
            })
        } else {
            startFunc.showToast("领取失败！")
        }
    }
}
