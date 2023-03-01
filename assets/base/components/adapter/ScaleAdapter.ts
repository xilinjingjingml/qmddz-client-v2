import BaseAdapter from "./BaseAdapter"

const { ccclass, menu } = cc._decorator

/**
 * 缩放适配组件 缩放至填满整个屏幕
 */
@ccclass
@menu("adapter/ScaleAdapter")
export default class ScaleAdapter extends BaseAdapter {

    onResized() {
        cc.director.once(cc.Director.EVENT_AFTER_UPDATE, this._onResized, this)
    }

    _onResized() {
        if (!this.node.isValid) {
            return
        }

        this.node.scale = Math.max(cc.winSize.width / this.node.width, cc.winSize.height / this.node.height)
        this.node.setPosition(this.node.convertToNodeSpaceAR(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2)))
    }
}
