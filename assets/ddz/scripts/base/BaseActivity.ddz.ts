import { NodeExtends } from "../../../base/extends/NodeExtends"
import BaseView from "../../../base/view/BaseView"
import { appfunc } from "../../../lobby/appfunc"
import { ads } from "../../../start/ads"
import { AudioManager } from "../../audio/AudioManager.ddz"

const { ccclass } = cc._decorator

@ccclass
export default class BaseActivity extends BaseView {

    onPressItemAd(event: cc.Event.EventTouch, data: string) {
        NodeExtends.cdTouch(event)
        AudioManager.playMenuEffect()
        appfunc.showAdsAwardPop(ads.awards[data])
    }
}
