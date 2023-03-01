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
import { WeChatMiniGame } from "../../start/scripts/platforms/WeChatMiniGame"

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

    start() {
        const winChairIds: number[] = []
        const loseChairIds: number[] = []
        let isWin = false
        this.params.message.vecUserResult1.forEach(v => {
            const chairId = GameFunc.S2C(v.nChairID)
            if (v.nScore > 0) {
                winChairIds.push(chairId)
                if (chairId == EPlayer.Me) {
                    isWin = true
                }
            } else {
                loseChairIds.push(chairId)
            }
        })

        this.$("node_win").active = isWin
        this.$("node_lose").active = !isWin
        this.$("node_hb").active = isWin
        this.$("node_button").active = false

        let title = "胜利"
        if (this.params.winStreakCount >= 2 && this.params.winStreakCount <= 9) {
            title = this.params.winStreakCount + "连胜"
        }
        this.$("label_title_win", cc.Label).string = title

        if (isWin) {
            this.showRoundAni()
        }

        const chairId2pos = (chairId: number) => this.node.convertToNodeSpaceAR(GameFunc.getPlayerPos(chairId, "node_avater/node_info/node_hb") || cc.Vec2.ZERO)
        const name2pos = (name: string) => this.node.convertToNodeSpaceAR(this.$(name).convertToWorldSpaceAR(cc.Vec2.ZERO))

        if (isWin) {
            if (GameFunc.isLord()) {
                loseChairIds.forEach((chairId, i, arr) => {
                    this.sop_drop({
                        start: chairId2pos(chairId),
                        end: chairId == EPlayer.Left ? name2pos("lbl_money1") : name2pos("lbl_money2"),
                        angle: chairId == EPlayer.Left ? -90 : 90,
                        callback: i == arr.length - 1 ? this.showGeButton.bind(this) : null
                    })
                })
            } else {
                winChairIds.forEach((chairId, i, arr) => {
                    this.sop_drop({
                        start: chairId2pos(loseChairIds[0]),
                        end: chairId == 0 ? name2pos("lbl_money1") : chairId2pos(chairId),
                        angle: chairId == EPlayer.Left ? -90 : 90,
                        callback: i == arr.length - 1 ? this.showGeButton.bind(this) : null
                    })
                })
            }
        } else {
            if (GameFunc.isLord()) {
                winChairIds.forEach((chairId, i, arr) => {
                    this.sop_drop({
                        start: chairId2pos(loseChairIds[0]),
                        end: chairId2pos(chairId),
                        angle: chairId == EPlayer.Left ? -90 : 90,
                        callback: i == arr.length - 1 ? this.close.bind(this) : null
                    })
                })
            } else {
                loseChairIds.forEach((chairId, i, arr) => {
                    this.sop_drop({
                        start: chairId2pos(chairId),
                        end: chairId2pos(winChairIds[0]),
                        angle: chairId == EPlayer.Left ? -90 : 90,
                        callback: i == arr.length - 1 ? this.close.bind(this) : null
                    })
                })
            }
        }
        this.showMiniGameGrid()
    }

    showRoundAni() {
        this.$("lbl_money1").active = false
        this.$("lbl_money2").active = false
        this.$("node_hb").active = true
        if (!GameFunc.isLord()) {
            this.$("node_hb1").x = 0
            this.$("node_hb2").active = false
        }
        this.params.message.vecUserResult1.forEach(v => {
            const chairId = GameFunc.S2C(v.nChairID)
            if (GameFunc.isLord()) {
                if (chairId != EPlayer.Me) {
                    this.$("lbl_money" + (chairId == EPlayer.Right ? 2 : 1), cc.Label).string = appfunc.toCash(-v.nScore).toFixed(2) + ""
                }
            } else {
                if (chairId == EPlayer.Me) {
                    this.$("lbl_money" + 1, cc.Label).string = appfunc.toCash(v.nScore).toFixed(2) + ""
                }
            }
        })

        for (let i = 1; i <= 2; i++) {
            if (!this.$("node_hb" + i).active) {
                continue
            }

            const spine = this.$("spine_hb" + i, sp.Skeleton)
            spine.setAnimation(0, "kaishi", false)
            spine.setCompleteListener(() => {
                if (!this.isValid) {
                    return
                }

                spine.setCompleteListener(null)
                spine.setAnimation(0, "shuzi", true)
            })
        }
    }

    showGeButton() {
        for (let i = 1; i <= 2; i++) {
            if (!this.$("node_hb" + i).active) {
                continue
            }

            this.$("lbl_money" + i).active = true
            const spine = this.$("spine_hb" + i, sp.Skeleton)
            spine.setAnimation(0, "zhongjian", true)
        }
        this.$("node_button").active = true
        this.$("miniGameGrid").active = true
        this.$("btn_get_double").active = this.params.showDouble
        this.node.parent.getComponent(RootPopup).mask.opacity = 180
    }

    playHBSpineGet() {
        this.$("node_button").active = false
        const pos = GameFunc.getPlayerPos(EPlayer.Me, "node_avater/node_info/node_hb") || cc.Vec2.ZERO
        for (let i = 1; i <= 2; i++) {
            if (!this.$("node_hb" + i).active) {
                continue
            }

            this.$("lbl_money" + i).active = false
            this.$("node_button").active = false

            const node = this.$("spine_hb" + i)
            const spine = node.getComponent(sp.Skeleton)
            spine.setAnimation(0, "jiesu", false)
            spine.setCompleteListener(() => {
                spine.setCompleteListener(null)
                if (!this.isValid) {
                    return
                }

                let action = cc.spawn([
                    cc.scaleTo(0.6, 0.1),
                    cc.jumpTo(0.6, node.convertToNodeSpaceAR(pos), 50, 1).easing(cc.easeSineIn()),
                ])
                if (i == 1) {
                    action = cc.sequence([
                        action,
                        cc.callFunc(() => {
                            this.close()
                            for (const v of this.params.message.vecUserResult1) {
                                if (GameFunc.S2C(v.nChairID) == EPlayer.Me) {
                                    const score = this.winScore || v.nScore
                                    monitor.emit(EventName.game_player_hb_change, v.nChairID, score)
                                    // 玩家红包变化公告
                                    GameView.showBaiYuanToCashChange({ value: score,  bomb: false })
                                    break
                                }
                            }
                        })
                    ])
                }
                node.runAction(action)
            })
        }
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

        this.playHBSpineGet()
        audio.playEffect({ bundle: "lobby", path: "awards/audios/hb_coming" })
    }

    onPressDoubleGet(event: cc.Event.EventTouch) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()

        ads.receiveAward({
            index: ads.video.New_WinDouble,
            success: () => this.isValid && GameFunc.send<Iproto_cg_baiyuan_win_double_req>("proto_cg_baiyuan_win_double_req", {})
        })
    }

    @listen("proto_gc_baiyuan_win_double_ack")
    proto_gc_baiyuan_win_double_ack(message: Iproto_gc_baiyuan_win_double_ack) {
        if (message.cRet == 0) {
            const awards: IAward[] = []
            message.vecItemInfo.forEach(info => {
                if (info.nItemId == ITEM.TO_CASH) {
                    this.winScore += info.nItemNum
                }
                awards.push({ index: info.nItemId, num: info.nItemNum })
            })
            appfunc.showAwardPop(awards, () => this.isValid && this.playHBSpineGet())
        } else {
            startFunc.showToast("领取失败！")
        }
    }

    showMiniGameGrid(){
        //1.在线数据 2.显示 miniGameGrid_fuCard miniGameGrid_redPacket
        if(!app.getOnlineParam("display_game_appid") || !app.getOnlineParam("display_game_icon") || !app.getOnlineParam("display_game_name")){
            this.$("miniGameGrid").active = false
            return
        }
        cc.tween(this.$("miniGameGrid"))
        .then(cc.tween().to(0.09, { angle: 35 }).to(0.18, { angle: -35 }).to(0.09, { angle: 0 }).to(0.09, { angle: 35 }).to(0.18, { angle: -35 }).to(0.09, { angle: 0 }).delay(4))
        .repeatForever()
        .start()

        if(app.getOnlineParam("display_game_appid")){
            //图片
            cc.assetManager.loadRemote(app.getOnlineParam("display_game_icon"), (err: Error, asset: cc.Texture2D | cc.SpriteFrame)=>{
                if (err) {
                    cc.error(err.message || err)
                    return
                }
                // console.log("jin---setGameId loadRes")
                const spriteFrame = asset instanceof cc.Texture2D ? new cc.SpriteFrame(asset) : asset
                if(this.getNodeComponent(this.$("miniGameGrid/icon"), cc.Sprite)){
                    console.log("jin---setGameId loadRes")
                    this.$("miniGameGrid/icon", cc.Sprite).spriteFrame = spriteFrame
                    this.$("miniGameGrid/label_gameName", cc.Label).string = app.getOnlineParam("display_game_name")
                }
            })
        }

    }

    navigateToMiniGame(){
        console.log("jin---navigateToMiniGame");
        (app.platform as WeChatMiniGame).navigateToMiniProgram(app.getOnlineParam("display_game_appid"), null)
    }
}
