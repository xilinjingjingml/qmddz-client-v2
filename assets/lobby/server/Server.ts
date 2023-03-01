import { audio } from "../../base/audio"
import { math } from "../../base/math"
import { listen } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import { app } from "../../start/app"
import { GAME, GAME_TYPE, ITEM } from "../../start/config"
import { startFunc } from "../../start/startFunc"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

@ccclass
export default class Server extends BasePop {

    model: cc.Node
    gameType: number
    params: { type: number }
    config: { [type: string]: { [level: string]: { min: number, max: number, minmax: string, bet: string } } } = {}

    start() {
        this.model = this.$("container").children[0]
        this.model.removeFromParent()

        this.initConfig()
        this.setItemNum()
        this.updateView(this.params?.type ?? GAME_TYPE.DDZ_BXP)
    }

    initConfig() {
        for (const s of app.servers.get(GAME.DDZ) || []) {
            if (!this.config[s.ddz_game_type]) {
                this.config[s.ddz_game_type] = {}
            }

            if (!this.config[s.ddz_game_type][s.level]) {
                let minmax
                if (s.maxmoney) {
                    minmax = math.short(s.minMoney) + "~" + math.short(s.maxmoney)
                } else {
                    minmax = math.short(s.minMoney) + "以上"
                }
                this.config[s.ddz_game_type][s.level] = { min: s.minMoney, max: s.maxmoney, minmax: minmax, bet: math.short(s.baseBet) }
            }
        }
    }

    @listen("user_data_update")
    setItemNum() {
        this.$("labelFuCardNum", cc.Label).string = math.short(app.user.getItemNum(ITEM.REDPACKET_TICKET))
        this.$("labelGoldBeanNum", cc.Label).string = math.short(app.user.getItemNum(ITEM.GOLD_COIN))
    }

    updateView(type: number) {
        this.gameType = type

        for (const t of this.$("bottom").children) {
            if (t.name != "type" + this.gameType) {
                t.getChildByName("icon").active = true
                t.getChildByName("highlight").active = false
            } else {
                t.getChildByName("icon").active = false
                t.getChildByName("highlight").active = true
            }
        }

        const container = this.$("container")
        container.removeAllChildren()

        const server = appfunc.chooseServer(GAME.DDZ, this.gameType)

        const resize = this.config[this.gameType] && Object.keys(this.config[this.gameType]).length > 4

        const scale = resize ? 0.75 : 1
        const layout = this.$("container", cc.Layout)
        layout.paddingRight = layout.paddingLeft = resize ? 12.5 : 45
        layout.spacingX = resize ? 10 : 30

        for (const level in this.config[this.gameType] || []) {
            const item = cc.instantiate(this.model)
            item.scale = scale
            item.parent = container

            const info = this.config[this.gameType][level]
            const lv = cc.find("content/names/level" + level, item)
            if (lv) {
                lv.active = true
            }

            const panel = cc.find("content/panels/panel" + this.gameType, item)
            if (panel) {
                panel.active = true
            }

            cc.find("content/labelBet", item).getComponent(cc.Label).string = info.bet
            cc.find("content/labelMinMax", item).getComponent(cc.Label).string = info.minmax
            cc.find("content/frame", item).active = server && server.level == Number(level)

            const handler = new cc.Component.EventHandler()
            handler.target = this.node
            handler.component = "Server"
            handler.handler = "onChooseLevel"
            handler.customEventData = level
            item.getComponent(cc.Button).clickEvents.push(handler)
        }

        this.$("labelQucikDesc", cc.Label).string = server ? server.serverName : ""
    }

    onPressGameType(event: cc.Event.EventTouch, type: string) {
        audio.playMenuEffect()
        if (this.gameType != Number(type)) {
            this.updateView(Number(type))
        }
    }

    onChooseLevel(event: cc.Event.EventTouch, level: string) {
        audio.playMenuEffect()
        const user_money = app.user.getItemNum(ITEM.GOLD_COIN)
        const cfg = this.config[this.gameType][level]

        if (user_money < cfg.min) {
            if (user_money < appfunc.getReliefLine() && app.datas.reliefStatus.reliefTimes > 0) {
                appfunc.showReliefPop()
            } else {
                startFunc.showToast("您的金豆低于场次最低入场限制！")
            }
            return
        }

        if (cfg.max != null && user_money > cfg.max) {
            startFunc.showToast("您的金豆已经大于场次最高入场限制！")
            return
        }

        appfunc.startGame(GAME.DDZ, this.gameType, Number(level))
    }

    onPressQuickStart() {
        audio.playMenuEffect()
        appfunc.startGame(GAME.DDZ, this.gameType)
    }

    onDestroy() {
        this.model.destroy()
    }
}