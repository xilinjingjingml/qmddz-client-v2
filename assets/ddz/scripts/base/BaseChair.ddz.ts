import BaseView from "../../../base/view/BaseView"
import { EPlayer } from "../../game/GameConfig.ddz"
import { GameFunc } from "../../game/GameFunc.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class BaseChair extends BaseView {
    params: { chairId: number }

    get isMyPlayer() {
        return this.params.chairId == EPlayer.Me
    }

    get isLord() {
        const sLordChairId = GameFunc.getSLordChairId()
        return sLordChairId >= 0 && this.isSelf(sLordChairId)
    }

    isSelf(sChairId: number) {
        
        // console.log("jin---isSelf:", this.params.chairId, sChairId, GameFunc.S2C(sChairId))
        return this.params.chairId == GameFunc.S2C(sChairId)
    }
}
