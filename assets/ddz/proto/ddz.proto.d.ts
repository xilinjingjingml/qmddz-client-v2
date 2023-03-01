interface Iproto_cb_use_protocol_proto_req {
}

interface Iproto_cb_send_disconnect_req {
}

interface Iproto_cb_login_req {
    plyGuid: number
    plyTicket: string
    version: number
    extParam: string
    mainGameId: number
    gameGroup: number
}

interface Iproto_bc_login_ack {
    ret: number
    plyBaseData: Iproto_PlyBaseData
    plyStatus: Iproto_PlayerStatus
    errorMsg: string
}

interface Iproto_PlyBaseData {
    plyGuid: number
    nickname: string
    sex: number
    gift: number
    money: number
    score: number
    won: number
    lost: number
    dogfall: number
    tableId: number
    param_1: number
    param_2: number
    chairId: number
    ready: number
    plyVip: Iproto_VipData
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

interface Iproto_cb_join_table_req {
    tableId: number
    password: string
    clubUid: number
}

interface Iproto_bc_join_table_ack {
    ret: number
    tableAttrs: Iproto_TableAttr
    errMsg: string
}

interface Iproto_TableAttr {
    tableId: number
    name: string
    lock: number
    players: Iproto_PlyBaseData[]
}

interface Iproto_cb_leave_table_req {
}

interface Iproto_bc_leave_table_ack {
    ret: number
    plyNickname: string
}

interface Iproto_bc_ply_join_not {
    plyData: Iproto_PlyBaseData
}

interface Iproto_bc_ply_leave_not {
    plyGuid: number
}

interface Iproto_cb_ready_req {
}

interface Iproto_bc_ready_not {
    plyGuid: number
}

interface Iproto_cb_change_table_req {
}

interface Iproto_bc_update_ply_data_not {
    plyGuid: number
    uptReason: number
    uptType: number
    variant: number
    amount: number
}

interface Iproto_bc_message_not {
    type: number
    message: string
}

interface Iproto_gc_game_start_not {
    nGameMoney: number
    nCardNum: number
    nLordPos: number
    cLordCard: Iproto_CCard
    nSerialID: number
}

interface Iproto_CCard {
    mNColor: number
    mNValue: number
    mNCard_Baovalue: number
}

interface Iproto_gc_refresh_card_not {
    cChairID: number
    vecCards: Iproto_CCard[]
}

interface Iproto_gc_lord_card_not {
    cLord: number
    vecCards: Iproto_CCard[]
}

interface Iproto_gc_common_not {
    nOp: number
    cChairID: number
}

interface Iproto_gc_clienttimer_not {
    chairId: number
    sPeriod: number
}

interface Iproto_gc_update_player_tokenmoney_not {
    plyChairid: number
    itemInfo: Iproto_player_itemInfo[]
}

interface Iproto_player_itemInfo {
    nItemIndex: number
    nItemNum: number
    nItemNum64: number
}

interface Iproto_gc_magic_emoji_config_not {
    emojiConfigs: Iproto_emojiConfig[]
}

interface Iproto_emojiConfig {
    cEmojiIndex: number
    cCostType: number
    cCostValue: number
    nTenItemIndex: number
    nTenItemNum: number
    nTenEmojiNum: number
}

interface Iproto_gc_beishu_info_ack {
    vecBeiShuInfo: number[]
    vecPlayerBeiShu: number[]
}

interface Iproto_gc_counts_not1 {
    countsNum: number
}

interface Iproto_gc_play_card_req {
    cAuto: number
    nSerialID: number
}

interface Iproto_gc_play_card_not {
    cChairID: number
    vecCards: Iproto_CCard[]
    cType: Iproto_CCardsType
}

interface Iproto_CCardsType {
    mNTypeBomb: number
    mNTypeNum: number
    mNTypeValue: number
}

interface Iproto_gc_call_score_req {
    nScore: number
    nSerialID: number
    nCallMode: number
}

interface Iproto_cg_call_score_ack {
    nScore: number
    nSerialID: number
}

interface Iproto_gc_auto_not {
    cChairID: number
    cAuto: number
}

interface Iproto_gc_send_dizhu_not {
    nGameMoney: number
}

interface Iproto_cg_play_card_ack {
    nSerialID: number
    cTimeOut: number
    vecCards: Iproto_CCard[]
}

interface Iproto_gc_rob_lord_req {
    cDefaultLord: number
    nSerialID: number
}

interface Iproto_cg_rob_lord_ack {
    cRob: number
    nSerialID: number
}

interface Iproto_cg_auto_req {
    cAuto: number
}

interface Iproto_gc_complete_data_not {
    nGameMoney: number
    nDouble: number
    cLord: number
    vecLordCards: Iproto_CCard[]
    vecData: Iproto_stUserData[]
}

interface Iproto_stUserData {
    cChairID: number
    vecHandCards: Iproto_CCard[]
    vecPutCards: Iproto_CCard[]
}

interface Iproto_gc_show_card_req {
    nSerialID: number
    nShowCardType: number
    nShowCardBet: number
}

interface Iproto_cg_show_card_ack {
    cShowCard: number
    nSerialID: number
    nShowCardBet: number
    nShowCardType: number
}

interface Iproto_gc_show_card_not {
    nChairID: number
    vecCards: Iproto_CCard[]
}

interface Iproto_cg_card_count_req {
}

interface Iproto_gc_card_count_ack {
    countsNum: number
    mVecPutCard: Iproto_CCard[]
}

interface Iproto_gc_game_result_not1 {
    bType: number
    cDouble: number
    cCallScore: number
    bShowCard: number
    nBombCount: number
    bSpring: number
    bReverseSpring: number
    bRobLord: number
    vecUserResult1: Iproto_stUserResult1[]
}

interface Iproto_stUserResult1 {
    nChairID: number
    nScore: number
    nJifen: number
}

interface Iproto_gc_double_score_req {
    nSerialID: number
}

interface Iproto_cg_double_score_ack {
    nScore: number
    nSerialID: number
}

interface Iproto_magic_emoji_noti {
    cIsError: number
    cEmojiIndex: number
    cFromChairID: number
    cToChairID: number
    cEmojiNum: number
}

interface Iproto_magic_emoji_req {
    cEmojiIndex: number
    cToChairID: number
    cCostType: number
}

interface Iproto_TocashItemInfo {
    cChairID: number
    nItemChange: number
}

interface Iproto_item_info {
    nItemId: number
    nItemNum: number
}

interface Iproto_gc_baiyuan_tocash_item_not {
    cType: number
    vecItemInfo: Iproto_TocashItemInfo[]
}

interface Iproto_gc_baiyuan_hb_round_not {
    nCurRound: number
    nLimitRound: number
}

interface Iproto_gc_baiyuan_hb_round_award_not {
    vecItemInfo: Iproto_item_info[]
}

interface Iproto_cg_baiyuan_hb_round_award_req {
}

interface Iproto_gc_baiyuan_hb_round_award_ack {
    cRet: number
    vecItemInfo: Iproto_item_info[]
}

interface Iproto_gc_baiyuan_win_double_not {
    vecItemInfo: Iproto_item_info[]
}

interface Iproto_cg_baiyuan_win_double_req {
}

interface Iproto_gc_baiyuan_win_double_ack {
    cRet: number
    vecItemInfo: Iproto_item_info[]
}

interface Iproto_gc_baiyuan_regain_lose_not {
    vecItemInfo: Iproto_item_info[]
}

interface Iproto_cg_baiyuan_regain_lose_req {
}

interface Iproto_gc_baiyuan_regain_lose_ack {
    cRet: number
    vecItemInfo: Iproto_item_info[]
}

interface Iproto_gc_baiyuan_luck_welfare_not {
    vecItemInfo: Iproto_item_info[]
}

interface Iproto_cg_baiyuan_luck_welfare_req {
}

interface Iproto_gc_baiyuan_luck_welfare_ack {
    cRet: number
    vecItemInfo: Iproto_item_info[]
}

interface Iproto_cg_baiyuan_can_bankruptcy_defend_req {
}

interface Iproto_gc_baiyuan_can_bankruptcy_defend_ack {
    cRet: number
    vecItemInfo: Iproto_item_info[]
}

interface Iproto_cg_baiyuan_bankruptcy_defend_req {
}

interface Iproto_gc_baiyuan_bankruptcy_defend_ack {
    cRet: number
    vecItemInfo: Iproto_item_info[]
}

interface Iproto_cg_get_redpackets_award_req {
    type: number
}

interface Iproto_gc_get_redpackets_award_ack {
    ret: number
    curRounds: number
    limitRounds: number
    nAmount: number
    cItemtype: number
    taskId: number
    fakeItem: Iproto_player_itemInfo[]
}

interface Iproto_cg_regain_lose_score_req {
    nOp: number
    nItemIndex: number
    nItemNum: number
}

interface Iproto_gc_regain_lose_score_ack {
    nRet: number
    nTime: number
    nValue: number[]
    nCurCount: number
    nItemIndex: number
    nItemNum: number
}

interface Iproto_cg_look_lord_card_item_req {
}

interface Iproto_gc_look_lord_card_item_ack {
    nRet: number
}

interface Iproto_gc_win_doubel_req {
    nAddAmount: number
    nAddProbabily: number
}

interface Iproto_cg_win_doubel_req {
}

interface Iproto_gc_win_doubel_ack {
    cRet: number
    vecItemInfo: Iproto_ItemInfo[]
}

interface Iproto_ItemInfo {
    nItemIndex: number
    nItemNum: number
}

interface Iproto_cg_look_lord_card_req {
}

interface Iproto_gc_item_info_not {
    nItemIndex: number
    nItemCount: number
}

interface Iproto_bc_specify_item_update_not {
    plyGuid: number
    index: number
    num: number
}

interface Iproto_cb_chat_req {
    type: number
    message: string
}

interface Iproto_bc_chat_not {
    plyGuid: number
    nickname: string
    message: string
    vipLevel: number
    userLevel: number
}
