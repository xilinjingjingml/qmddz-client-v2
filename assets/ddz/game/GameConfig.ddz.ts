
export enum EOperate {
    CO_NONE = -1,
    CO_NEW = 0,                  //开始新的一圈牌
    CO_CALL0 = 1,                //不叫
    CO_CALL1 = 2,                //叫1分
    CO_CALL2 = 3,                //叫2分
    CO_CALL3 = 4,                //叫3分
    CO_NOTCALLROB = 5,           //不叫地主
    CO_CALLROB = 6,              //叫地主
    CO_NOTROB = 7,               //不抢地主
    CO_ROB = 8,                  //抢地主
    CO_GIVEUP = 9,               //过牌
    CO_SHOWCARD = 10,            //亮牌
    CO_TIMEOUT = 11,             //超时	
    CO_READY = 12,               //准备
    CO_NOLORD = 13,              //本局没有地主，请求清理桌面，重新发牌
    CO_START = 14,               //开始游戏
    CO_PUT = 15,                 //出牌
    CO_LORDCARD = 16,            //地主底牌
    CO_END = 17,                 //游戏结束
    CO_VER = 18,                 //游戏版本信息
    CO_DATA = 19,                //保存的玩家信息
    CO_DOUBLE = 20,              //加倍结束
    CO_F_DOUBLE = 21,            //不加倍
    CO_T_DOUBLE = 22,            //加倍
    CO_CAN_LEAVE_TABLE = 23,     //离桌
    CO_FORCE_LEAVE_TABLE = 24,   //强制离桌
    CO_NO_STAMINA = 25,          //没有体力
    CO_DELAY_KEEPSTAR_TIME = 26, //没有体力		
    CO_SUPER_T_DOUBLE = 27,      //超级加倍
    CO_CALL4 = 28,               //叫4分
}

export enum EPlayer {
    Me,
    Right,
    Left,
}

export enum EGameState {
    game_init,
    game_start,  // 游戏开始
    game_end,    // 游戏结束
    game_result, // 游戏结算
    game_reinit,
}

export const EventName = {
    // socket
    socket_login: "socket_login",
    socket_join_table: "socket_join_table",
    socket_close_temp: "socket_close_temp",
    socket_close: "socket_close",

    // fsm
    game_init: "game_init",
    game_start: "game_start",
    game_end: "game_end",
    game_result: "game_result",
    game_reinit: "game_reinit",

    // event
    game_server_update: "game_server_update",
    clock_time: "clock_time",
    clock_timeout: "clock_timeout",
    game_deal_card_num: "game_deal_card_num",
    game_dizhu_update: "game_dizhu_update",
    game_exchange_item: "game_exchange_item",
    game_onPressExit: "game_onPressExit",
    game_onPressStart: "game_onPressStart",
    game_OperateButton_onPressChuPai: "game_OperateButton_onPressChuPai",
    game_OperateButton_onPressTiShi: "game_OperateButton_onPressTiShi",
    game_OperateButton_showPutButtons: "game_OperateButton_showPutButtons",
    game_player_hb_change: "game_player_hb_change",
    game_refreshHandCards: "game_refreshHandCards",
    game_result_next: "game_result_next",
    game_result_start: "game_result_start",
    game_showCard: "game_showCard",
    game_wait_hide: "game_wait_hide",
    game_wait_show: "game_wait_show",
}