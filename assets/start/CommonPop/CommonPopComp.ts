import BaseView from "../../base/view/BaseView"
import CommonPop from "./CommonPop"

const { ccclass, property, executeInEditMode, menu } = cc._decorator

@ccclass
@executeInEditMode
@menu("component/CommonPopComp")
export default class CommonPopComp extends BaseView {

    @property()
    private _title: string = "提示"
    @property()
    get title(): string {
        return this._title
    }
    set title(title: string) {
        this._title = title
        this.getComponentInChildren(CommonPop)?.setTitle(title)
    }

    @property()
    private _showClose: boolean = true
    @property()
    get showClose(): boolean {
        return this._showClose
    }
    set showClose(show: boolean) {
        this._showClose = show
        this.getComponentInChildren(CommonPop)?.setCloseShow(show)
    }

    @property()
    private _height: number = 430
    @property()
    get height(): number {
        return this._height
    }
    set height(height: number) {
        this._height = height
        this.getComponentInChildren(CommonPop)?.setHeight(height)
    }

    start() {
        const comp = this.getComponentInChildren(CommonPop)
        if (comp) {
            comp.setHeight(this.height)
            comp.setTitle(this.title)
            comp.setCloseShow(this.showClose)
        }
    }
}
