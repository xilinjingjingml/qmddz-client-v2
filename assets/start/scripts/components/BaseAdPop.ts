import { listen, monitor } from "../../../base/monitor"
import BasePop from "../../../base/view/BasePop"
import { ads } from "../../ads"
import { app } from "../../app"

const { ccclass } = cc._decorator

/**
 * ViewPop组件
 */
@ccclass
export default class BaseAdPop extends BasePop {
    /**
     * 手动处理banner
     */
    protected manualBanner: boolean = false
    protected bannerIndex: number
    private bannerRect: cc.Rect

    onEnable() {
        // console.log("jin---调用了父类onEnable")
        super.onEnable()

        if (!app.getOnlineParam("show_banner", true)) {
            return
        }

        console.log("jin---消除baner广告", app.datas.bannerList)
        if (this.bannerIndex != null) {
            ads.openBanner(this.bannerIndex,()=>{
                if(!this || !this.node || !this.node.isValid){
                    ads.closeBanner(this.bannerIndex)
                }
            })
        }

        this.scheduleOnce(() => monitor.emit("ViewManager_showPopup", this), 0.1)
    }

    onDisable() {
        //1.本界面bannerId消失，但全局还有bannerId,延时关闭banner广告
        // console.log("jin---消除baner广告", app.datas.bannerList)
        if (this.bannerIndex != null) {
            console.log("jin---消除baner广告1")
            ads.closeBanner(this.bannerIndex)
        }
    }

    protected onNodeSizeChange() {
        // banner
        if (!this.manualBanner && this.bannerRect) {
            this.resizeBanner(this.node)
        }

        this.node.parent.emit("node_size_change")
    }

    protected resizeBanner(node: cc.Node) {
        const gap = this.bannerRect.y + this.bannerRect.height - node.getBoundingBoxToWorld().y
        if (gap <= 0) {
            return
        }

        node.y += gap

        const widget = node.getComponent(cc.Widget)
        if (widget) {
            if (widget.isAlignTop) {
                widget.top -= gap
            }
            if (widget.isAlignBottom) {
                widget.bottom += gap
            }
            if (widget.isAlignVerticalCenter) {
                widget.verticalCenter += gap
            }
        }
    }

    @listen("platform_ad_banner_size")
    platform_ad_banner_size(rect: cc.Rect) {
        cc.log("[BaseAdPop.platform_ad_banner_size]", rect)
        this.bannerRect = rect
        this.onNodeSizeChange()
    }
}
