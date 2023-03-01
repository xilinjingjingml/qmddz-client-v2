import { app } from "../../../start/app"

const { ccclass, property, disallowMultiple, menu } = cc._decorator

@ccclass
@disallowMultiple
@menu("component/DelayShow")
export default class DelayShow extends cc.Component {

    @property()
    onlineName: string = ""

    @property()
    defaultHide: boolean = true

    start() {
        if (app.getOnlineParam(this.onlineName, this.defaultHide)) {
            this.node.active = false
            this.scheduleOnce(() => {
                this.node.active = true
            }, 3)
        }
    }
}
