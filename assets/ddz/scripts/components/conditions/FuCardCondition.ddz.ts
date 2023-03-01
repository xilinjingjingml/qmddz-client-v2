import BaseCondition from "../../../../base/components/condition/BaseCondition"
import { app } from "../../../../start/app"
import { GAME_TYPE } from "../../../../start/config"

const { ccclass, disallowMultiple, menu } = cc._decorator

/**
 * 条件组件
 */
@ccclass
@disallowMultiple
@menu("condition/FuCardCondition")
export default class FuCardCondition extends BaseCondition {

    checkCondition() {
        return isFuCard()
    }
}

export function isFuCard() {
    if (CC_EDITOR) {
        return true
    }
    return app.runGameServer?.ddz_game_type != GAME_TYPE.DDZ_BAIYUAN
}
