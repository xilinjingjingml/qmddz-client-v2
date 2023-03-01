import { monitor } from "../../monitor"
import BaseView from "../../view/BaseView"
import BaseCondition from "./BaseCondition"

const { ccclass, property } = cc._decorator

/**
 * 条件显示组件
 */
@ccclass
export default class Condition extends cc.Component {

    // @property() // 组件多了再打开吧
    all: boolean = true

    onEnable() {
        const comps = this.getComponents(BaseCondition)
        const active = this.all ? comps.every(comp => comp.checkCondition()) : comps.some(comp => comp.checkCondition())
        this.node.active = active
        !active && this.getComponents(BaseView).forEach(comp => {
            cc.director.off(cc.Director.EVENT_AFTER_UPDATE, comp._onTarget, comp)
            monitor.offTarget(comp)
        })
    }
}
