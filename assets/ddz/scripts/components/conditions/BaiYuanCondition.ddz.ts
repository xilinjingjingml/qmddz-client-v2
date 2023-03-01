import BaseCondition from "../../../../base/components/condition/BaseCondition"
import { app } from "../../../../start/app"
import { GAME_TYPE } from "../../../../start/config"

const { ccclass, disallowMultiple, menu } = cc._decorator

/**
 * 条件组件
 */
@ccclass
@disallowMultiple
@menu("condition/BaiYuanCondition")
export default class BaiYuanCondition extends BaseCondition {

    checkCondition() {
        return isBaiYuan()
    }
}

export function isBaiYuan() {
    if (CC_EDITOR) {
        return false
    }
    return app.runGameServer?.ddz_game_type == GAME_TYPE.DDZ_BAIYUAN
}
