export enum ENV {
    /**
     * 测试环境
     */
    TEST,
    /**
     * 镜像环境
     */
    MIRROR,
    /**
     * 正式环境
     */
    OFFICIAL,
}

export enum PlatformType {
    /**
     * 浏览器
     */
    WebBrowser,
    /**
     * 微信小程序
     */
    WeChatMiniGame,
    /**
     * app
     */
    AppNative,
}

export enum ShopBoxType {
    /**
     * 普通宝箱
     */
    Normal = 0,
    /**
     * OneYuan
     */
    OneYuan = 2,
    /**
     * Active
     */
    Active = 5,
    /**
     * 一次性宝箱
     */
    Once = 7,
    /**
     * 月卡
     */
    Month = 8,
    /**
     * 折扣宝箱
     */
    Discount = 9,
    /**
     * 俱乐部宝箱
     */
    Club = 12,
}

export enum ITEM {
    /**
     * 微信零钱-角
     */
    WECHAT_MONEY_JIAO = -6,

    /**
     * 微信零钱-元
     */
    WECHAT_MONEY_YUAN = -4,

    /**
     * 金豆
     */
    GOLD_COIN = 0,

    /**
     * 记牌器
     */
    CARD_RECORD = 2,

    /**
     * 红包券
     */
    REDPACKET_TICKET = 365,

    /**
     * 斗地主超级加倍卡
     */
    SUPER_JIABEI = 373,

    /**
     * 钻石
     */
    DIAMOND = 372,

    /**
     * 斗地主优先看底牌卡
     */
    LOOK_LORDCARD = 375,

    /**
     * 高级碎片
     */
    CHIP_ADVANCE = 376,

    /**
     *传奇碎片
     */
    CHIP_LEGEND = 377,

    /**
     *提现道具
     */
    OLD_TO_CASH = 382,

    /**
     *免扣符
     */
    FREE_LOSE = 383,

    /**
     *元宝                                                                                                                   
     */
    INGOT = 384,

     /**
     *提现道具 新                                                                                                                   
     */
     TO_CASH = 385,

    /**
     *VIP经验
     */
    VIP_EXP = 374,
}

export enum GAME {
    /**
     * 斗地主
     */
    DDZ = 408,
}

export enum GAME_TYPE {
    /**
     * 斗地主-抢地主
     */
    DDZ_QDZ = 0,
    /**
     * 斗地主-叫分
     */
    DDZ_JF = 1,
    /**
     * 斗地主-不洗牌
     */
    DDZ_BXP = 2,
    /**
     * 斗地主-百元场
     */
    DDZ_BAIYUAN = 3,
}


export const s0 = "c-950q0oldzx7rpqd"
export const s1 = "MffcVoozO5zdwIDAQAB"

export enum TASK {
    /**
     * 局数红包
     */
    HB_ROUND = 11104,
    /**
     * 小额提现
     */
    SMALL_WITHDRAWA = 118,
}
