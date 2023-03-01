import { ENV } from "./config"

export enum EHOST {
    login,
    web,
    pay,
    activity,
    upload,
    update,
}

export const hosts: Record<ENV, Record<EHOST, string>> = {
    [ENV.TEST]: {
        [EHOST.login]: "https://t-login.wpgame.com.cn/",
        [EHOST.web]: "https://t-statics.wpgame.com.cn/",
        [EHOST.pay]: "https://t-mall.wpgame.com.cn/",
        [EHOST.activity]: "https://t-activity.wpgame.com.cn/",
        [EHOST.upload]: "https://t.upload.bdo.hiigame.com/",
        [EHOST.update]: "https://t-gamefile.wpgame.com.cn/",
    },
    [ENV.MIRROR]: {
        [EHOST.login]: "https://m-login.weipinggame.com.cn/",
        [EHOST.web]: "https://m-statics.weipinggame.com.cn/",
        [EHOST.pay]: "https://m-mall.weipinggame.com.cn/",
        [EHOST.activity]: "https://m-activity.weipinggame.com.cn/",
        [EHOST.upload]: "https://m.upload.bdo.hiigame.com/",
        [EHOST.update]: "https://m-gamefile.weipinggame.com.cn/",
    },
    [ENV.OFFICIAL]: {
        [EHOST.login]: "https://login.weipinggame.com.cn/",
        [EHOST.web]: "https://statics.weipinggame.com.cn/",
        [EHOST.pay]: "https://mall.weipinggame.com.cn/",
        [EHOST.activity]: "https://activity.weipinggame.com.cn/",
        [EHOST.upload]: "https://upload.bdo.hiigame.com/",
        [EHOST.update]: "https://gamefile.weipinggame.com.cn/",
    },
}

export const urls = {
    // login
    USER_LOGIN: { host: EHOST.login, url: "new/gateway/visitor/login" },
    GET_WX_OPENID: { host: EHOST.login, url: "wechat/jscode/session" },
    GAME_LOGIN: { host: EHOST.login, url: "new/gateway/webchat/miniapps/login" },
    UPDATE_USER_INFO: { host: EHOST.login, url: "new/gateway/user/uptinfo" },
    MOBILE_BIND_USER: { host: EHOST.login, url: "new/gateway/phone/login" },
    BIND_WEIXIN: { host: EHOST.login, url: "visitor/weixin/bind" },
    BIND_ZFB: { host: EHOST.login, url: "alipay/verified/bind" },
    ANTI_ADDICTION: { host: EHOST.login, url: "phone/antiAddiction/info" },

    // web
    LOADING_CONFIGS: { host: EHOST.web, url: "get/loading/configs" },
    AD_CONFIG: { host: EHOST.web, url: "load/adconfig" },
    GET_AD_AWARD: { host: EHOST.web, url: "execute/task/award/draw" },
    USERBATCH: { host: EHOST.web, url: "get/loading/user/batchs" },
    LOAD_TOMORROW_GIFT: { host: EHOST.web, url: "load/new/game/sign/config" },
    ACTIVE_ONCE_SIGN_INFO: { host: EHOST.web, url: "load/new/user/sign/info" },
    TOMORROW_AWARD: { host: EHOST.web, url: "get/tomorrow/award" },
    DUIHUAN: { host: EHOST.web, url: "user/exchange/goods" },
    DUIHUANCONFIG: { host: EHOST.web, url: "get/new/goods/exchange/list" },
    LOAD_PROMOTER_RECORD: { host: EHOST.web, url: "load/promoter/inviteLog" },
    MOBILE_STATUS: { host: EHOST.web, url: "get/user/info" },
    GET_USER_ROLE: { host: EHOST.web, url: "get/loading/configs/role" },
    MOBILE_CODE_GET: { host: EHOST.web, url: "get/phone/code" },
    ACTIVE_SIGN_CONFIG: { host: EHOST.web, url: "load/new/game/endlesssign/config" },
    ACTIVE_SIGN_INFO: { host: EHOST.web, url: "load/new/user/endlesssign/info" },
    ACTIVE_SIGN_EXECUTE: { host: EHOST.web, url: "execute/user/endlesssign/data" },
    LOAD_GAME_NUM: { host: EHOST.web, url: "load/game/num/rank" },
    ACTIVE_BLESS_INFO: { host: EHOST.web, url: "get/blessing" },
    EXCHANGE_RECORD: { host: EHOST.web, url: "get/user/goods/exchange/log" },
    ACTIVE_MONEY_CHANGE: { host: EHOST.web, url: "activity/money/change", method: "POST" },

    CREATE_AD_ORDER: { host: EHOST.web, url: "ad/order", method: "POST" },
    FINISH_AD_ORDER: { host: EHOST.web, url: "ad/notify", method: "POST" },

    // pay
    SHOPITEMS: { host: EHOST.pay, url: "shop/box/list" },

    // activity
    DIAL: { host: EHOST.activity, url: "load/place/dial" },
    DARW_DIAL: { host: EHOST.activity, url: "start/place/dial" },
}
