import BaseAdapter from "./BaseAdapter"

const { ccclass, menu, requireComponent } = cc._decorator

/**
 * Canvas宽高适配组件
 */
@ccclass
@menu("adapter/CanvasAdapter")
@requireComponent(cc.Canvas)
export default class CanvasAdapter extends BaseAdapter {

    onResized() {
        const canvas = this.node.getComponent(cc.Canvas)
        const frameSize = cc.view.getFrameSize()
        const wideScreen = frameSize.width / frameSize.height > canvas.designResolution.width / canvas.designResolution.height
        canvas.fitHeight = wideScreen
        canvas.fitWidth = !wideScreen
    }
}
