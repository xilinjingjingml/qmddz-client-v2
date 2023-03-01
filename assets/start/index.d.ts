interface IVersionUpdate {
    gameid: number
    vs: string
    msg: string
    ip: string
    port: string
    url: string
    vn: number
    ef: number
    channel: number
}

interface ISharedData {
    sdCodePic: string,
    sdContent: string[],
    sdGameStr: string,
    sdGameid: number,
    sdId: number,
    sdMatchPic: string,
    sdMatchTicket: string,
    sdPic: string,
    sdPn: string,
    sdPnStr: string,
    sdTitle: string,
    sdType: number,
    sdUrl: string
}

interface IServerData extends Iproto_ServerData2 {
    ddz_game_type?: number
    level?: number
    maxmoney?: number
    newbieMode?: number
    lc_room_mode?: number
}

interface IOnlineParam {
    [x: string]: any
}

interface IDatas {
    IPLocation?: IIPLocation
    TomorrowData?: ISignData[]
    TomorrowStatus?: ISignStatus
    ActivitySignConfig?: ISignData[]
    ActivitySignInfo?: ISignStatus
    GameRank?: IGameRank
    VipData?: any
    regtime?: number
    stayDay?: number
    ExchangeInfo?: IExchangeInfo[]
    ifBindWeixin?: boolean
    ifBindAliPay?: boolean
    role?: any
    bindPhone?: { hasBindMoble: number, BindPhone: string }
    reliefStatus?: { reliefTimes: number, currentRelief: number, ReliefTimesMax: number, reliefCountdown: number, reliefAwardCount: number }
    first?: number
    morrow?: number
    newUserPopShow?: boolean
    kuaishou_callback?: string
    lottery?: Record<number, ILotteryData[]>
    AchieveList?: Iproto_ATAchieveData[]
    isLeaveGame?: boolean
    runGameDatas?: any
    Sign?: Iproto_AccumulateSigninInfo

    querys?: any
    adTotal?: number
    adToday?: number
    byLevel?: number
    cashStatus?: any
    cashTask?: any

    cashVec?: cc.Vec2
    ingotVec?: cc.Vec2

    [x: string]: any
}

interface IIPLocation { status: string, info: string, infocode: string, province: string, city: string, adcode: string, rectangle: string }

interface ISignData { autoId: number, desc: string, descImg: string, gameId: number, gameName: number, itemConfig: IItemInfo[] }

interface ISignStatus { msg: string, ret: number, ratioTotal: number, list: { signDay: number, signTime: number }[], tomorrowAward: IItemInfo[], enabled: boolean }

interface IGameRank {
    // 本期激战局数
    wonNum: number,
    tenFieldNum: number,
    // 本期激战排行榜
    tenField: IGameRankInfo[],

    fiftyFieldNum: number,
    // 上期激战排行榜
    fiftyField: IGameRankInfo[],

    growNum: number,
    growRank: IGameRankInfo[],

    dividendRank: IGameRankInfo[],

    // 祈福
    blessing: number,
    blessingRank: number,
    blessingRankAward?: number,
    blessingTotal: number,
    blessingTodayRank: IGameRankInfo[],
    blessingYesterdayRank: IGameRankInfo[]
}

interface IGameRankInfo { plyGuid: number, plyNum: number, face?: string, nickName?: string, vipLv: number }

interface IExchangeInfo {
    limitCount: number,
    goodsId: number,
    limitType: number,
    exchangeItemList: { exchangeNum: number, exchangeItem: number }[],
    goodsImg: string,
    exchangeCount: number,
    limitVip: number,
    gainItemList: { gainItem: number, gainNum: number, itemType: number }[]
    stocks: number,
    isLimitCount: boolean,
    goodsName: string,
    stocksType: number,
    limitRegTime: number
}

interface ILotteryData { index?: number, acActivityId: number, acAutoId: number, acChannelId: number, acGameId: number, acItemIndex: number, acItemNum: number, acItemRound: number, acItemStock: number, acItemUrl: string, itemDesc: string }

interface IAdVideoData {
    total: number
    count: number
    method: number | number[]
    canfree: boolean
}

interface IAdBannerData {

}

interface IAdData {
    videos: Record<string, IAdVideoData>
    banners: Record<string, IAdBannerData>
}

interface IUserInfo {
    nickname: string
    regPn: string
    plat: number
    regTime: number
    face: string
    sex: number
    status: number
    phone: string
    isforbid: number
    address: string
    uid: string
    code: string
    realname: string
    age: number
    account: string
    desc: string
}

interface IShopBox {
    boxType: number
    area: any
    boxId: number
    boxname: string
    boxvalue: number
    cardDays: number
    complementCount: number
    content: { idx: number, num: number }[]
    daylimit: number
    desc: string
    firstMoney: number
    gmDay: number
    havePhone: number
    icon: string
    isBuy: number
    isDx: number
    isLt: number
    isYd: number
    pmList: any
    price: number
    serino: string
    spList: []
    superscript: string
}

interface IAdsReceiveOpt {
    index: number
    success?: (res) => any
    shareData?: any
    showAward?: boolean
    method?: number
    closeCallback?: Function

    order?: number
}

interface IItemInfo {
    itemNum: number
    itemIndex: number
}

interface IAward {
    index: number
    num: number
}
