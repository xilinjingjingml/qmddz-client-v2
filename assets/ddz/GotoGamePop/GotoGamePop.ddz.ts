import { listen, monitor } from "../../base/monitor"
import BasePop from "../../base/view/BasePop"
import { EPlayer, EventName } from "../game/GameConfig.ddz"
import { storage } from "../../base/storage"

const { ccclass, property } = cc._decorator

@ccclass
export default class GotoGamePop extends BasePop {
    @property({ type: cc.SpriteFrame })

    params: {
    }

    start() {
        console.log("jin---GotoGamePop")
    }

    onPressStartGame(event: cc.Event.EventTouch) {
        monitor.emit(EventName.startOfGamePop)
        storage.set("result_next", 1)
        this.close()
    }
}