import TableView from "../../../base/components/TableView"
import { UserExtends } from "../../../base/extends/UserExtends"
import { utils } from "../../../base/utils"
import BasePop from "../../../base/view/BasePop"
import { app } from "../../../start/app"
import { getAwardByRank } from "../bless/ActivityBless"

const { ccclass } = cc._decorator

@ccclass
export default class ActivityBlessRank extends BasePop {

    start() {
        this.$("item").active = false
        this.onClick(1)
    }

    onPressClick(toggle: cc.Toggle, data: string) {
        this.onClick(parseInt(data) || 1)
    }

    onClick(type: number) {
        this.refreshView(type)
        this.refreshMyRank(type)
    }

    refreshView(type: number) {
        this.$("scrollview", TableView).clear()

        const datas = type == 1 ? app.datas.GameRank.blessingTodayRank : app.datas.GameRank.blessingYesterdayRank

        const uids: { [uid: string]: IGameRankInfo } = {}
        datas.forEach(data => {
            if (data.face == null || data.nickName == null) {
                uids[data.plyGuid] = data
            }
        })

        const keys = Object.keys(uids)
        if (keys.length == 0) {
            this.refreshTableView(type, datas)
            return
        }

        UserExtends.getUserInfos(keys, infos => {
            if (!this.node.isValid) {
                return
            }

            infos.forEach(info => {
                const data = uids[info.uid]
                if (data) {
                    data.face = info.face
                    data.nickName = info.nickname
                }
            })

            this.refreshTableView(type, datas)
        })
    }

    refreshTableView(type: number, datas: IGameRankInfo[]) {
        this.$("scrollview", TableView).updateView(datas, this.$("item"), (item: cc.Node, data: IGameRankInfo, index: number) => {
            this.setItem({
                node: item,
                type: type,
                rank: index + 1,
                data: data
            })
        })
    }

    refreshMyRank(type: number) {
        const datas = type == 1 ? app.datas.GameRank.blessingTodayRank : app.datas.GameRank.blessingYesterdayRank
        let rank = 0
        for (let i = 0; i < datas.length; i++) {
            if (datas[i].plyGuid == app.user.guid) {
                rank = i + 1
                break
            }
        }

        this.setItem({
            node: this.$("item_my"),
            type: type,
            rank: rank,
            data: {
                plyGuid: app.user.guid,
                nickName: app.user.nickname,
                plyNum: app.datas.GameRank.blessing,
                face: app.user.face,
                vipLv: 0
            }
        })
    }

    setItem(parmes: { node: cc.Node, rank: number, data: IGameRankInfo, type: number }) {
        const $ = utils.mark(parmes.node)

        // line
        if (utils.$($, "item_line")) {
            utils.$($, "item_line").active = parmes.rank != 1
        }

        // rank
        if (utils.$($, "node_rank")) {
            if (utils.$($, "label_rank_no")) {
                utils.$($, "label_rank_no").active = parmes.rank == 0
            }
            utils.$($, "icon_rank1").active = parmes.rank == 1
            utils.$($, "icon_rank2").active = parmes.rank == 2
            utils.$($, "icon_rank3").active = parmes.rank == 3
            utils.$($, "label_rank").active = parmes.rank > 3
            utils.$($, "label_rank", cc.Label).string = "" + parmes.rank
        }

        // face
        if (parmes.data.face) {
            this.setSprite({
                path: parmes.data.face,
                node: utils.$($, "spt_face"),
                adjustSize: utils.$($, "spt_mask"),
            })
        }

        // info
        utils.$($, "label_name", cc.Label).string = parmes.data.nickName || ""
        utils.$($, "label_value", cc.Label).string = "" + parmes.data.plyNum
        utils.$($, "label_value").active = parmes.type == 1

        // award
        if (utils.$($, "node_awards")) {
            const award = getAwardByRank(parmes.rank)
            utils.$($, "label_award", cc.Label).string = "奖池*" + award + "%"
            utils.$($, "label_award").active = award > 0
        }
    }
}
