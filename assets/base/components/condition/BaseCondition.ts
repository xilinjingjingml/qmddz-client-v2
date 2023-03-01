import Condition from "./Condition";

const { ccclass, requireComponent } = cc._decorator

/**
 * 条件组件
 */
@ccclass
@requireComponent(Condition)
export default abstract class BaseCondition extends cc.Component {

    abstract checkCondition(): boolean
}
