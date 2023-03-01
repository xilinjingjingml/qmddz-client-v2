import CommonPop from "../CommonPop/CommonPop"
import BaseAdPop from "../scripts/components/BaseAdPop"

export interface IConfirm {
    title?: string
    content: string
    autoSize?: boolean
    contentFontSize?: number
    contentAlignment?: cc.macro.TextAlignment
    showClose?: boolean
    closeFunc?: Function
    confirmText?: string
    confirmFunc?: Function
    cancelText?: string
    cancelFunc?: Function
    buttonNum?: number
    exchangeButton?: boolean
    //TODO 只负责加载，为网络问题准备提示
    preLoad?: boolean
}

const { ccclass } = cc._decorator

@ccclass
export default class confirm extends BaseAdPop {
    params: IConfirm

    start() {
        const commonPop = this.getComponentInChildren(CommonPop)
        if (this.params.title != null) {
            commonPop.setTitle(this.params.title)
        }
        if (this.params.content != null) {
            this.$("label_content", cc.RichText).string = this.params.content
        }
        if (this.params.contentFontSize != null) {
            this.$("label_content", cc.RichText).fontSize = this.params.contentFontSize
        }
        if (this.params.contentAlignment != null) {
            this.$("label_content", cc.RichText).horizontalAlign = this.params.contentAlignment
        }
        if (this.params.showClose == false) {
            commonPop.setCloseShow(false)
        }
        if (this.params.confirmText != null) {
            this.$("label_confirm", cc.Label).string = this.params.confirmText
        }
        if (this.params.cancelText != null) {
            this.$("label_cancel", cc.Label).string = this.params.cancelText
        }
        if (this.params.buttonNum == 1) {
            this.$("btn_confirm").x = 0
            this.$("btn_cancel").active = false
        } else if (this.params.exchangeButton) {
            [this.$("btn_confirm").x, this.$("btn_cancel").x] = [this.$("btn_cancel").x, this.$("btn_confirm").x]
        }

        if (this.params.autoSize) {
            const height = this.$("label_content").height + 270
            this.node.height = height
            commonPop.setHeight(height)
            this.$("node_btns", cc.Widget).updateAlignment()
            this.onNodeSizeChange()
        }
        if(this.params.preLoad){
            console.log("jin---已预加载提示框")
            this.close()
        }
    }

    onPressConfirm() {
        super.onPressClose()
        if (this.params.confirmFunc) {
            this.params.confirmFunc()
        }
    }

    onPressCancel() {
        super.onPressClose()
        if (this.params.cancelFunc) {
            this.params.cancelFunc()
        }
    }
}