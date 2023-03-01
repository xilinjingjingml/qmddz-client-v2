import { ViewManager } from "../../base/view/ViewManager"
import { GameFunc } from "./GameFunc.ddz"

export namespace GameView {

    export function showPlayerInfoPop(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "PlayerInfoPop/PlayerInfoPop",
            params: params,
            openTween: cc.tween().set({ scale: 0.4 }).to(0.25, { scale: 1 }, { easing: "sineInOut" })
        })
    }

    export function showBaiYuanCashOut(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "BaiYuanCashOut/BaiYuanCashOut",
            params: params,
            mask: { show: false },
            block: { show: false },
            zIndex: 1,
        })
    }

    export function showBaiYuanToCashChange(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "BaiYuanToCashChange/BaiYuanToCashChange",
            params: params,
            mask: { show: false },
            block: { show: false },
            multiple: true,
            zIndex: 1,
        })
    }

    export function showBaiYuanResultPop(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "BaiYuanResultPop/BaiYuanResultPop",
            params: params,
            mask: { opacity: 0 }
        })
    }

    export function showBaiYuanLuckWelfarePop(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "BaiYuanLuckWelfarePop/BaiYuanLuckWelfarePop",
            params: params,
        })
    }

    export function showBaiYuanRegainLosePop(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "BaiYuanRegainLosePop/BaiYuanRegainLosePop",
            params: params,
        })
    }

    export function showBaiYuanRoundPop(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "BaiYuanRoundPop/BaiYuanRoundPop",
            params: params,
        })
    }

    export function showBaiYuanReliefPop(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "BaiYuanReliefPop/BaiYuanReliefPop",
            params: params,
            openTween: cc.tween().set({ scale: 0.4 }).to(0.25, { scale: 1 }, { easing: "sineInOut" })
        })
    }

    export function showRoundHBPop(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "RoundHBPop/RoundHBPop",
            params: params,
            openTween: cc.tween().set({ scale: 0.4 }).to(0.25, { scale: 1 }, { easing: "sineInOut" })
        })
    }

    export function showTomorrowPop(params?: any) {
        ViewManager.showPopup({
            bundle: "lobby",
            path: "tomorrow/tomorrow",
            params: params,
        })
    }

    export function showDailyGiftPop(params?: any) {
        ViewManager.showPopup({
            bundle: "lobby",
            path: "dailygift/dailygift",
            params: params,
        })
    }

    export function showFuCardRegainLosePop(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "FuCardRegainLosePop/FuCardRegainLosePop",
            params: params,
            openTween: cc.tween().set({ scale: 0.4 }).to(0.25, { scale: 1 }, { easing: "sineInOut" })
        })
    }

    export function showFuCardResultPop(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "FuCardResultPop/FuCardResultPop",
            params: params,
        })
    }

    export function showFuCardRoundPop(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "FuCardRoundPop/FuCardRoundPop",
            params: params,
        })
    }

    export function showFuCardWinDoublePop(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "FuCardWinDoublePop/FuCardWinDoublePop",
            params: params,
            openTween: cc.tween().set({ scale: 0.4 }).to(0.25, { scale: 1 }, { easing: "sineInOut" })
        })
    }

    export function showExchangeItemPop(params?: any) {
        ViewManager.showPopup({
            bundle: GameFunc.bundle,
            path: "ExchangeItemPop/ExchangeItemPop",
            params: params,
            openTween: cc.tween().set({ scale: 0.4 }).to(0.25, { scale: 1 }, { easing: "sineInOut" })
        })
    }
}
