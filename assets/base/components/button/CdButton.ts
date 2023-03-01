import { NodeExtends } from "../../extends/NodeExtends"
import BaseButton from "./BaseButton"

const { ccclass, property, disallowMultiple, menu } = cc._decorator

@ccclass
@disallowMultiple
@menu("button/CdButton")
export default class CdButton extends BaseButton {

    @property({ type: [cc.Node] })
    nodes: cc.Node[] = []

    onClick(event: cc.Event.EventTouch) {
        this.nodes.forEach(node => NodeExtends.cdComponent(node.getComponent(cc.Button)))
        NodeExtends.cdTouch(event)
    }
}
