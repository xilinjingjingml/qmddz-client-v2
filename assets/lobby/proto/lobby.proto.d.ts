interface Iproto_cl_use_protocol_proto_req {
}

interface Iproto_cl_verify_ticket_req {
    plyGuid: number
    plyNickname: string
    plyTicket: string
    gameId: number
    version: number
    extParam: string
    sex: number
    packetName: string
}

interface Iproto_lc_verity_ticket_ack {
    ret: number
    plyLobbyData: Iproto_PlyLobbyData
    plyStatus: Iproto_PlayerStatus
    plyLoginAward: Iproto_LoginAward
    plyItems: Iproto_ItemData[]
    plyLoginAward2: Iproto_LoginAward2
    plyVip: Iproto_VipData
    timeStamp: number
    dailyOnlineTime_: number
}

interface Iproto_cl_get_player_game_list_req {
    gameList: number[]
}

interface Iproto_lc_get_player_game_list_ack {
    ret: number
    serverStatus: Iproto_ServerData2[]
}

interface Iproto_lc_trumpet_not {
    plyGuid: number
    plyNickname: string
    message: string
    gameId: number
    gameName: string
    vipLevel: number
    userLevel: number
}

interface Iproto_lc_broadcast_message_not {
    gameId: number
    pn: string
    msg: string
}

interface Iproto_ServerData2 {
    gameId: number
    serverId: number
    serverName: string
    serverKey: string
    serverAddr: string
    serverPort: number
    baseBet: number
    minMoney: number
    onlinePlayerNum: number
    channelId: number
    extParam: string
}

interface Iproto_PlyLobbyData {
    plyGuid: number
    nickname: string
    sex: number
    gift: number
    money: number
    score: number
    won: number
    lost: number
    moneyRank: number
    wonRank: number
    param_1: number
    param_2: number
}

interface Iproto_PlayerStatus {
    plyGuid: number
    plyNickname: string
    plyStatus: number
    sex: number
    gameId: number
    gameServerId: number
    tableId: number
    money: number
    won: number
    lost: number
    moneyRank: number
    wonRank: number
    param_1: number
    param_2: number
    latitude: number
    longitude: number
}

interface Iproto_LoginAward {
    loginDays: number
    money: number
}

interface Iproto_ItemData {
    index: number
    num: number
    gameId: number
    param_1: number
    param_2: number
    name: string
    url: string
}

interface Iproto_LoginAward2 {
    today: number
    loginAward: Iproto_LoginAward[]
}

interface Iproto_VipData {
    level: number
    nexLevelTotalDays: number
    autoUpgradeDay: number
    loginAward: number
    friendCount: number
    nextLevelDueDays: number
    remainDueDays: number
    status: number
}

interface Iproto_lc_send_user_data_change_not {
    plyLobbyData: Iproto_PlyLobbyData
    plyItems: Iproto_ItemData[]
    plyVip: Iproto_VipData
    plyGradingValue: number
}

interface Iproto_lc_send_vip_data_change_not {
    vipLevel: number
    vipRate: number
    nextVipneedMoney: number
    param: string
}

interface Iproto_cl_check_relief_status_req {
    type: number
}

interface Iproto_lc_check_relief_status_ack {
    ret: number
    currentRelief: number
    reliefTimeLeft: number
    reliefAwardCount: number
    reliefCd: number
    currentRelief_2: number
    reliefTimesMax: number
}

interface Iproto_cl_get_relief_req {
    type: number
}

interface Iproto_lc_get_relief_ack {
    ret: number
}

interface Iproto_cl_reload_user_data_req {
}

interface Iproto_bc_message_not {
    type: number
    message: string
}

interface Iproto_cl_get_at_achieve_list_req {
    type: number
}

interface Iproto_lc_get_at_achieve_list_ack {
    vecItems: Iproto_ATAchieveData[]
}

interface Iproto_ATAchieveData {
    gameId: number
    type: number
    index: number
    cond: number
    value: number
    max: number
    status: number
    merge: number
    vecAwards: Iproto_ATAchieveAward[]
    name: string
    desc: string
}

interface Iproto_ATAchieveAward {
    itemIndex: number
    itemNum: number
}

interface Iproto_cl_get_at_achieve_award_req {
    gameId: number
    index: number
    type: number
}

interface Iproto_lc_get_at_achieve_award_ack {
    ret: number
    vecAwards: Iproto_ATAchieveAward[]
}
