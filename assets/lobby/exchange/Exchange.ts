import { audio } from "../../base/audio"
import { http } from "../../base/http"
import { math } from "../../base/math"
import { listen } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import { ads } from "../../start/ads"
import { app } from "../../start/app"
import { ITEM } from "../../start/config"
import { AppNative } from "../../start/scripts/platforms/AppNative"
import { startFunc } from "../../start/startFunc"
import { urls } from "../../start/urls"
import { appfunc } from "../appfunc"

const { ccclass } = cc._decorator

const enum Condition {
    StayLogin,
    GameWinNum,
    InviteNum
}

interface IConfig {
    isNewUser: boolean
    gain: { id: number, num: number }
    conditions?: { id: number, value: number }[]
}

@ccclass
export default class Exchange extends BasePop {

    configs: IConfig[]
    newUserTime: number
    exchangeTypes: number[]
    itemData: IExchangeInfo
    wonPlyNum: number = 0
    spreadAwardList: any[]

    tabIndex: number = 0

    start() {
        this.configs = app.getOnlineParam("ExchangeScene_exchangeConfigs", [
            {
                isNewUser: true,
                gain: { id: -6, num: 3 },
            }, {
                isNewUser: true,
                gain: { id: -6, num: 5 },
                conditions: [{ id: Condition.GameWinNum, value: 35 }]
            }, {
                isNewUser: true,
                gain: { id: -4, num: 1 },
                conditions: [{ id: Condition.StayLogin, value: 4 }]
            }, {
                isNewUser: true,
                gain: { id: -4, num: 5 },
                conditions: [{ id: Condition.InviteNum, value: 3 }]
            }
        ])
        this.newUserTime = app.getOnlineParam("ExchangeScene_exchangeNewUserTime", 0)
        this.exchangeTypes = app.getOnlineParam("ExchangeScene_exchangeTypes", [-3, -4, -6])

        if (this.configs.some(config => config.conditions && config.conditions.some(condition => condition.id == Condition.InviteNum))) {
            this.spreadAwardList = []
            this.loadPromoterRecrod()
        }

        this.setItemNum()

        if (app.getOnlineParam("app_review")) {
            this.$("tab0").active = false
            this.$("tab1").x -= 230
            this.$("tab2").x -= 230
            this.$("content0").active = false
            this.$("content1").active = true
        } else {
            this.initView()
        }

        this.initItemView()
    }

    initView() {
        const num = app.user.getItemNum(ITEM.REDPACKET_TICKET)
        this.$("labelMyNum", cc.Label).string = "" + num
        this.$("labelValue", cc.Label).string = "约" + math.fixd(appfunc.toFuCard(num)) + "元"

        const model = this.$("item")
        model.removeFromParent()

        if (!app.datas.ExchangeInfo) {
            model.destroy()
            return
        }

        const datas = app.datas.ExchangeInfo.filter(item => {
            return item.exchangeItemList[0].exchangeItem == ITEM.REDPACKET_TICKET && this.exchangeTypes.indexOf(item.gainItemList[0].gainItem) != -1
        })

        datas.sort((a, b) => {
            const aNum = a.exchangeItemList[0].exchangeNum
            const bNum = b.exchangeItemList[0].exchangeNum

            const aGain = a.gainItemList[0].gainItem
            const bGain = b.gainItemList[0].gainItem

            return aNum == bNum ? (aGain > bGain ? -1 : aGain < bGain ? 1 : 0) : (aNum < bNum ? -1 : 1)
        })

        const container = this.$("container")
        container.removeAllChildren(true)

        for (let i = 0, len = datas.length; i < len; i++) {
            const data = datas[i]
            const config = this.findConfig(data)
            const isNewUser = config && config.isNewUser
            if (isNewUser && app.datas.regtime < this.newUserTime) {
                continue
            }

            const item = cc.instantiate(model) as any
            item.parent = container

            item.data = data

            if (isNewUser) {
                cc.find("new_user", item).active = true
            }

            cc.find("select/labelName", item).getComponent(cc.Label).string = data.goodsName
            cc.find("unselect/labelName", item).getComponent(cc.Label).string = data.goodsName

            if (i == 0) {
                this.setItem(data)
            }
        }

        model.destroy()
    }

    initItemView() {
        const container = this.$("content1")
        const model = container.children[0]
        model.removeFromParent()

        if (!app.datas.ExchangeInfo) {
            model.destroy()
            return
        }

        const datas = app.datas.ExchangeInfo.filter(item => {
            return item.exchangeItemList[0].exchangeItem == ITEM.REDPACKET_TICKET && [-3, -4, -6].indexOf(item.gainItemList[0].gainItem) == -1
        })

        datas.sort((a, b) => {
            const aNum = a.exchangeItemList[0].exchangeNum
            const bNum = b.exchangeItemList[0].exchangeNum

            const aGain = a.gainItemList[0].gainItem
            const bGain = b.gainItemList[0].gainItem

            return aNum == bNum ? (aGain > bGain ? -1 : aGain < bGain ? 1 : 0) : (aNum < bNum ? -1 : 1)
        })

        for (let i = 0, len = datas.length; i < len; i++) {
            const data = datas[i]
            const item = cc.instantiate(model)
            item.parent = container

            cc.find("labelName", item).getComponent(cc.Label).string = data.goodsName
            cc.find("button/layout/labelCostNum", item).getComponent(cc.Label).string = "" + data.exchangeItemList[0].exchangeNum
            this.setSprite({ node: cc.find("icon", item), path: data.goodsImg, adjustSize: true })

            const event = new cc.Component.EventHandler()
            event.target = this.node
            event.component = "Exchange"
            event.handler = "onPressExchangeItem"
            event.customEventData = data as any
            cc.find("button", item).getComponent(cc.Button).clickEvents.push(event)
        }

        model.destroy()
    }

    initRecordView() {
        const container = this.$("record_container")
        const model = this.$("record")
        model.active = false

        container.removeAllChildren()

        const param = {
            uid: app.user.guid,
            ticket: app.user.ticket,
            pn: app.pn,
            gameid: app.gameId,
            pageNow: 1,
            pageSize: 20,
            isAd: 0
        }

        http.open(urls.EXCHANGE_RECORD, param, (err, res) => {
            if (res && res.ret == 0 && this.isValid) {
                const datas = res.list as any[]

                for (const data of datas) {
                    const record = cc.instantiate(model)
                    record.active = true
                    record.parent = container

                    cc.find("labelName", record).getComponent(cc.Label).string = data.goodsName
                    cc.find("labelTime", record).getComponent(cc.Label).string = data.exchangeTime.substring(5, data.exchangeTime.length - 3)
                    cc.find("labelStatus", record).getComponent(cc.Label).string = data.status
                }
            }
        })
    }

    @listen("user_data_update")
    setItemNum() {
        this.$("labelFuCardNum", cc.Label).string = math.short(app.user.getItemNum(ITEM.REDPACKET_TICKET))
        this.$("labelGoldBeanNum", cc.Label).string = math.short(app.user.getItemNum(ITEM.GOLD_COIN))
    }

    loadPromoterRecrod() {
        http.open(urls.LOAD_PROMOTER_RECORD, {
            uid: app.user.guid,
            gameId: app.gameId,
            ticket: app.user.ticket,
            pageNow: 1,
            pageSize: 20,
        }, (err, res) => {
            if (this.isValid && res && res.spreadAwardList) {
                this.spreadAwardList = res.spreadAwardList
            }
        })
    }

    setItem(data: IExchangeInfo) {
        this.itemData = data
        this.$("labelNeedNum", cc.Label).string = "" + data.exchangeItemList[0].exchangeNum
        this.resetCondView()
        // if (this.checkCanExchange(this.itemData, true)) {
        //     this.setCondView(0)
        // }
    }

    resetCondView() {
        this.$("condition").active = false
    }

    setCondView(type) {
        if (type == 0) {
            // cc.find("nodeContent/btnExchange", this.node).active = true
        } else {
            // cc.find("nodeContent/nodeCondition", this.node).active = true
            if (type == 1) {
                // cc.find("nodeContent/nodeCondition/btnExchange", this.node).active = true
            } else if (type == 2) {
                // cc.find("nodeContent/nodeCondition/btnGoGame", this.node).active = true
            } else if (type == 3) {
                // cc.find("nodeContent/nodeCondition/btnShare", this.node).active = true
            }
        }
    }

    setCondMessage(message) {
        this.$("labelCondDesc", cc.Label).string = message
    }

    setProgressWithMessage(range, message) {
        this.$("pregress", cc.Sprite).fillRange = range
        this.setCondMessage(message)
    }

    // 检测道具
    checkCanExchangeItemNum(data: IExchangeInfo, updateCond: boolean = false) {
        const exchangeItem = data.exchangeItemList[0].exchangeItem
        const exchangeItemNum = data.exchangeItemList[0].exchangeNum

        if (app.user.getItemNum(exchangeItem) >= exchangeItemNum) {
            return true
        }

        if (updateCond) {
            this.setCondView(0)
        } else {
            if (data.exchangeItemList[0].exchangeItem == ITEM.REDPACKET_TICKET) {
                // TODO RPUnenoughGuidePop
                startFunc.showToast("您当前的福卡不足")
            } else if (data.exchangeItemList[0].exchangeItem == ITEM.DIAMOND) {

                if (!ads.checkCanReceive(ads.video.DrawDiamond)) {
                    startFunc.showToast("您当前的钻石不足")
                } else {
                    // TODO UnenoughDiamondPop
                    startFunc.showToast("您当前的钻石不足")
                }
            } else {
                startFunc.showToast("您当前的兑换道具不足")
            }
        }

        return false
    }

    // 检测VIP
    checkCanExchangeVipLevel(data: IExchangeInfo, updateCond: boolean = false) {
        if (app.datas.VipData.vipLevel >= data.limitVip) {
            return true
        }

        if (updateCond) {
            this.$("labelCondDesc", cc.Label).string = `VIP等级${data.limitVip}才可兑换，请先提升您的VIP等级吧！`
        } else {
            startFunc.showToast("无法兑换，您的VIP等级不足\n" + "VIP等级≥" + data.limitVip + "才可以兑换\n" + data.goodsName + "您当前VIP等级为" + app.datas.VipData.vipLevel)
        }

        return false
    }

    // 检测次数限制
    checkCanExchangeCountLimit(data: IExchangeInfo, updateCond: boolean = false) {
        if (data.exchangeCount != data.limitCount) {
            return true
        }

        if (updateCond) {
            this.setCondView(1)
            const tdesc = data.limitType == 1 ? "累计" : "每日"
            const tdesc2 = data.limitType == 1 ? "已" : "今日已"
            if (data.limitVip == 0) {
                this.setCondMessage(`新人专享${tdesc}可兑换${data.limitCount}次(您${tdesc2}兑换${data.limitCount}次)`)
            } else {
                this.setCondMessage(`VIP≥${data.limitVip}${tdesc}可兑换${data.limitCount}次(您${tdesc2}兑换${data.limitCount}次)`)
            }
        } else {
            if (data.limitType == 1) {
                startFunc.showToast("此道具兑换次数已用完\n" + "" + data.goodsName + "累计限兑换" + data.limitCount + "次")
            } else if (data.limitVip == 0 && app.datas.VipData.vipLevel == 0) {
                startFunc.showToast("VIP0玩家累计仅能兑换1次\n" + "请提升VIP等级后再来兑换")
            } else {
                startFunc.showToast("您今日的兑换次数已用完\n" + data.goodsName + "每日限兑换" + data.limitCount + "次")
            }
        }

        return false
    }

    // 检测连续登录
    checkCanExchangeStayLogin(data: IExchangeInfo, updateCond: boolean = false, conditionData: { value: number }) {
        const total = conditionData.value
        const current = app.datas.stayDay

        if (current >= total) {
            return true
        }

        if (updateCond) {
            this.setCondView(1)
            this.setProgressWithMessage(current / total, `连续登陆${total}天 (${current}/${total})`)
        } else {
            startFunc.showToast(`再连续登陆${total - current}天才可领取`)
        }

        return false
    }

    // 检测游戏局数
    checkCanExchangeGameWinNum(data: IExchangeInfo, updateCond: boolean = false, conditionData: { value: number }) {
        const total = conditionData.value
        const current = this.wonPlyNum

        if (current >= total) {
            return true
        }

        if (updateCond) {
            this.setCondView(2)
            this.setProgressWithMessage(current / total, `福卡场累计获胜${total}局 (${current}/${total})`)
        } else {
            startFunc.showToast(`再获胜${total - current}局就可以领取了，快去进行游戏吧！`)
        }

        return false
    }

    // 检测邀请人数
    checkCanExchangeInviteNum(data: IExchangeInfo, updateCond: boolean = false, conditionData: { value: number }) {
        const total = conditionData.value
        const current = this.spreadAwardList.length

        if (app.datas.VipData.vipLevel >= data.limitVip) {
            return true
        }

        if (updateCond) {
            this.setCondView(3)
            this.setProgressWithMessage(current / total, `成功邀请${total}位新人 (${current}/${total})`)
        } else {
            startFunc.showToast(`再邀请${total - current}位新人就可以领取了，快去邀请吧！`)
        }

        return false
    }

    // 检测手机绑定
    checkCanExchangePhoneBind(data: IExchangeInfo, updateCond: boolean = false) {
        if (app.datas.bindPhone.hasBindMoble == 1) {
            return true
        }

        if (updateCond) {
            this.setCondView(0)
        } else {
            appfunc.showBindingPop()
        }

        return false
    }

    // 检测微信绑定
    checkCanExchangeWeiXin(data: IExchangeInfo, updateCond: boolean = false) {
        if (app.datas.ifBindWeixin) {
            return true
        }

        if (!(cc.sys.isNative && (app.platform as AppNative).hasWeChatSession())) {
            return true
        }

        if (updateCond) {
            this.setCondView(0)
        } else {
            startFunc.showConfirm({
                title: "绑定微信",
                content: "<color=#a07f61>红包将提现到您的微信账号，请先绑定\n微信号</c>",
                confirmText: "绑定微信",
                buttonNum: 1,
                confirmFunc: () => (app.platform as AppNative).bindWeiXin()
            })
        }

        return false
    }

    checkCanExchange(data: IExchangeInfo, updateCond: boolean = false) {
        // 检测道具
        if (!this.checkCanExchangeItemNum(data, updateCond)) {
            return false
        }

        // 检测VIP
        if (!this.checkCanExchangeVipLevel(data, updateCond)) {
            return false
        }

        // 检测次数限制
        if (!this.checkCanExchangeCountLimit(data, updateCond)) {
            return false
        }

        const config = this.findConfig(data)
        if (config && config.conditions) {
            for (const condition of config.conditions) {
                // 检测连续登录
                if (condition.id == Condition.StayLogin && !this.checkCanExchangeStayLogin(data, updateCond, condition)) {
                    return false
                }

                // 检测游戏局数
                if (condition.id == Condition.GameWinNum && !this.checkCanExchangeGameWinNum(data, updateCond, condition)) {
                    return false
                }

                // 检测邀请人数
                if (condition.id == Condition.InviteNum && !this.checkCanExchangeInviteNum(data, updateCond, condition)) {
                    return false
                }
            }
        }

        if (!app.getOnlineParam("app_review")) {
            // 检测手机绑定
            if (!this.checkCanExchangePhoneBind(data, updateCond)) {
                return false
            }

            // 检测微信绑定
            if (!this.checkCanExchangeWeiXin(data, updateCond)) {
                return false
            }
        }

        return true
    }

    findConfig(item: IExchangeInfo): IConfig {
        const gainItem = item.gainItemList[0]
        for (const config of this.configs) {
            if (config.gain.id == gainItem.gainItem && config.gain.num == gainItem.gainNum) {
                return config
            }
        }
    }

    onClickItem(target) {
        audio.playMenuEffect()
        this.setItem(target.node.data)
    }

    onPressExchange() {
        audio.playMenuEffect()
        if (!this.itemData) {
            return
        }

        if (this.checkCanExchange(this.itemData)) {
            // TODO this.itemData.gainItemList[0].gainItem == -3
            appfunc.exchangeAward(this.itemData.goodsId)
        }
    }

    onPressTab(event: cc.Event.EventTouch, data: number) {
        if (this.tabIndex != data) {
            this.$("sign").x = event.target.x
            this.$("content" + this.tabIndex).active = false
            this.$("content" + data).active = true
            this.tabIndex = data

            if (this.tabIndex == 2) {
                this.initRecordView()
            }
        }
    }

    onPressExchangeItem(event: cc.Event.EventTouch, data: IExchangeInfo) {
        if (this.checkCanExchange(data)) {
            appfunc.exchangeAward(data.goodsId)
        }
    }
}