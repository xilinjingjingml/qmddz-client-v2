module.exports={"package":null,"syntax":"proto2","messages":[{"name":"proto_cb_use_protocol_proto_req","syntax":"proto2","fields":[]},{"name":"proto_cb_send_disconnect_req","syntax":"proto2","fields":[]},{"name":"proto_cb_login_req","syntax":"proto2","fields":[{"rule":"required","type":"int64","name":"ply_guid","id":1},{"rule":"required","type":"string","name":"ply_ticket","id":2},{"rule":"required","type":"int32","name":"version","id":3},{"rule":"required","type":"string","name":"ext_param","id":4},{"rule":"required","type":"int32","name":"main_game_id","id":5},{"rule":"required","type":"int32","name":"game_group","id":6}]},{"name":"proto_bc_login_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"ret","id":1},{"rule":"required","type":"proto_PlyBaseData","name":"ply_base_data","id":2},{"rule":"required","type":"proto_PlayerStatus","name":"ply_status","id":3},{"rule":"required","type":"string","name":"error_msg","id":4}]},{"name":"proto_PlyBaseData","syntax":"proto2","fields":[{"rule":"required","type":"int64","name":"ply_guid","id":1},{"rule":"required","type":"string","name":"nickname","id":2},{"rule":"required","type":"int32","name":"sex","id":3},{"rule":"required","type":"int32","name":"gift","id":4},{"rule":"required","type":"int64","name":"money","id":5},{"rule":"required","type":"int32","name":"score","id":6},{"rule":"required","type":"int32","name":"won","id":7},{"rule":"required","type":"int32","name":"lost","id":8},{"rule":"required","type":"int32","name":"dogfall","id":9},{"rule":"required","type":"int32","name":"table_id","id":10},{"rule":"required","type":"int32","name":"param_1","id":11},{"rule":"required","type":"int32","name":"param_2","id":12},{"rule":"required","type":"int32","name":"chair_id","id":13},{"rule":"required","type":"int32","name":"ready","id":14},{"rule":"required","type":"proto_VipData","name":"ply_vip","id":15}]},{"name":"proto_PlayerStatus","syntax":"proto2","fields":[{"rule":"required","type":"int64","name":"ply_guid","id":1},{"rule":"required","type":"string","name":"ply_nickname","id":2},{"rule":"required","type":"int32","name":"ply_status","id":3},{"rule":"required","type":"int32","name":"sex","id":4},{"rule":"required","type":"int32","name":"game_id","id":5},{"rule":"required","type":"int32","name":"game_server_id","id":6},{"rule":"required","type":"int32","name":"table_id","id":7},{"rule":"required","type":"int64","name":"money","id":8},{"rule":"required","type":"int32","name":"won","id":9},{"rule":"required","type":"int32","name":"lost","id":10},{"rule":"required","type":"int32","name":"money_rank","id":11},{"rule":"required","type":"int32","name":"won_rank","id":12},{"rule":"required","type":"int32","name":"param_1","id":13},{"rule":"required","type":"int32","name":"param_2","id":14},{"rule":"required","type":"float","name":"latitude","id":15},{"rule":"required","type":"float","name":"longitude","id":16}]},{"name":"proto_VipData","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"level","id":1},{"rule":"required","type":"int32","name":"nex_level_total_days","id":2},{"rule":"required","type":"int32","name":"auto_upgrade_day","id":3},{"rule":"required","type":"int32","name":"login_award","id":4},{"rule":"required","type":"int32","name":"friend_count","id":5},{"rule":"required","type":"int32","name":"next_level_due_days","id":6},{"rule":"required","type":"int32","name":"remain_due_days","id":7},{"rule":"required","type":"int32","name":"status","id":8}]},{"name":"proto_cb_join_table_req","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"table_id","id":1},{"rule":"required","type":"string","name":"password","id":2},{"rule":"required","type":"int32","name":"club_uid","id":3}]},{"name":"proto_bc_join_table_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"ret","id":1},{"rule":"required","type":"proto_TableAttr","name":"table_attrs","id":2},{"rule":"required","type":"string","name":"errMsg","id":3}]},{"name":"proto_TableAttr","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"table_id","id":1},{"rule":"required","type":"string","name":"name","id":2},{"rule":"required","type":"int32","name":"lock","id":3},{"rule":"repeated","type":"proto_PlyBaseData","name":"players","id":4}]},{"name":"proto_cb_leave_table_req","syntax":"proto2","fields":[]},{"name":"proto_bc_leave_table_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"ret","id":1},{"rule":"required","type":"string","name":"ply_nickname","id":2}]},{"name":"proto_bc_ply_join_not","syntax":"proto2","fields":[{"rule":"required","type":"proto_PlyBaseData","name":"ply_data","id":1}]},{"name":"proto_bc_ply_leave_not","syntax":"proto2","fields":[{"rule":"required","type":"int64","name":"ply_guid","id":1}]},{"name":"proto_cb_ready_req","syntax":"proto2","fields":[]},{"name":"proto_bc_ready_not","syntax":"proto2","fields":[{"rule":"required","type":"int64","name":"ply_guid","id":1}]},{"name":"proto_cb_change_table_req","syntax":"proto2","fields":[]},{"name":"proto_bc_update_ply_data_not","syntax":"proto2","fields":[{"rule":"required","type":"int64","name":"ply_guid","id":1},{"rule":"required","type":"int32","name":"upt_reason","id":2},{"rule":"required","type":"int32","name":"upt_type","id":3},{"rule":"required","type":"int32","name":"variant","id":4},{"rule":"required","type":"int64","name":"amount","id":5}]},{"name":"proto_bc_message_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"type","id":1},{"rule":"required","type":"string","name":"message","id":2}]},{"name":"proto_gc_game_start_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nGameMoney","id":1},{"rule":"required","type":"int32","name":"nCardNum","id":2},{"rule":"required","type":"int32","name":"nLordPos","id":3},{"rule":"required","type":"proto_CCard","name":"cLordCard","id":4},{"rule":"required","type":"int32","name":"nSerialID","id":5}]},{"name":"proto_CCard","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"m_nColor","id":1},{"rule":"required","type":"int32","name":"m_nValue","id":2},{"rule":"required","type":"int32","name":"m_nCard_Baovalue","id":3}]},{"name":"proto_gc_refresh_card_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cChairID","id":1},{"rule":"repeated","type":"proto_CCard","name":"vecCards","id":2}]},{"name":"proto_gc_lord_card_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cLord","id":1},{"rule":"repeated","type":"proto_CCard","name":"vecCards","id":2}]},{"name":"proto_gc_common_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nOp","id":1},{"rule":"required","type":"int32","name":"cChairID","id":2}]},{"name":"proto_gc_clienttimer_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"chairId","id":1},{"rule":"required","type":"int32","name":"sPeriod","id":2}]},{"name":"proto_gc_update_player_tokenmoney_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"ply_chairid","id":1},{"rule":"repeated","type":"proto_player_itemInfo","name":"itemInfo","id":2}]},{"name":"proto_player_itemInfo","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nItemIndex","id":1},{"rule":"required","type":"int32","name":"nItemNum","id":2},{"rule":"required","type":"int64","name":"nItemNum64","id":3}]},{"name":"proto_gc_magic_emoji_config_not","syntax":"proto2","fields":[{"rule":"repeated","type":"proto_emojiConfig","name":"emojiConfigs","id":1}]},{"name":"proto_emojiConfig","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cEmojiIndex","id":1},{"rule":"required","type":"int32","name":"cCostType","id":2},{"rule":"required","type":"int32","name":"cCostValue","id":3},{"rule":"required","type":"int32","name":"nTenItemIndex","id":4},{"rule":"required","type":"int32","name":"nTenItemNum","id":5},{"rule":"required","type":"int32","name":"nTenEmojiNum","id":6}]},{"name":"proto_gc_beishu_info_ack","syntax":"proto2","fields":[{"rule":"repeated","type":"int32","name":"vecBeiShuInfo","id":1},{"rule":"repeated","type":"int32","name":"vecPlayerBeiShu","id":2}]},{"name":"proto_gc_counts_not1","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"counts_num","id":1}]},{"name":"proto_gc_play_card_req","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cAuto","id":1},{"rule":"required","type":"int32","name":"nSerialID","id":2}]},{"name":"proto_gc_play_card_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cChairID","id":1},{"rule":"repeated","type":"proto_CCard","name":"vecCards","id":2},{"rule":"required","type":"proto_CCardsType","name":"cType","id":3}]},{"name":"proto_CCardsType","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"m_nTypeBomb","id":1},{"rule":"required","type":"int32","name":"m_nTypeNum","id":2},{"rule":"required","type":"int32","name":"m_nTypeValue","id":3}]},{"name":"proto_gc_call_score_req","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nScore","id":1},{"rule":"required","type":"int32","name":"nSerialID","id":2},{"rule":"optional","type":"int32","name":"nCallMode","id":3}]},{"name":"proto_cg_call_score_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nScore","id":1},{"rule":"required","type":"int32","name":"nSerialID","id":2}]},{"name":"proto_gc_auto_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cChairID","id":1},{"rule":"required","type":"int32","name":"cAuto","id":2}]},{"name":"proto_gc_send_dizhu_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nGameMoney","id":1}]},{"name":"proto_cg_play_card_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nSerialID","id":1},{"rule":"required","type":"int32","name":"cTimeOut","id":2},{"rule":"repeated","type":"proto_CCard","name":"vecCards","id":3}]},{"name":"proto_gc_rob_lord_req","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cDefaultLord","id":1},{"rule":"required","type":"int32","name":"nSerialID","id":2}]},{"name":"proto_cg_rob_lord_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cRob","id":1},{"rule":"required","type":"int32","name":"nSerialID","id":2}]},{"name":"proto_cg_auto_req","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cAuto","id":1}]},{"name":"proto_gc_complete_data_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nGameMoney","id":1},{"rule":"required","type":"int32","name":"nDouble","id":2},{"rule":"required","type":"int32","name":"cLord","id":3},{"rule":"repeated","type":"proto_CCard","name":"vecLordCards","id":4},{"rule":"repeated","type":"proto_stUserData","name":"vecData","id":5}]},{"name":"proto_stUserData","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cChairID","id":1},{"rule":"repeated","type":"proto_CCard","name":"vecHandCards","id":2},{"rule":"repeated","type":"proto_CCard","name":"vecPutCards","id":3}]},{"name":"proto_gc_show_card_req","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nSerialID","id":1},{"rule":"required","type":"int32","name":"nShowCardType","id":2},{"rule":"required","type":"int32","name":"nShowCardBet","id":3}]},{"name":"proto_cg_show_card_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cShowCard","id":1},{"rule":"required","type":"int32","name":"nSerialID","id":2},{"rule":"required","type":"int32","name":"nShowCardBet","id":3},{"rule":"required","type":"int32","name":"nShowCardType","id":4}]},{"name":"proto_gc_show_card_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nChairID","id":1},{"rule":"repeated","type":"proto_CCard","name":"vecCards","id":2}]},{"name":"proto_cg_card_count_req","syntax":"proto2","fields":[]},{"name":"proto_gc_card_count_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"counts_num","id":1},{"rule":"repeated","type":"proto_CCard","name":"m_vecPutCard","id":2}]},{"name":"proto_gc_game_result_not1","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"bType","id":1},{"rule":"required","type":"int32","name":"cDouble","id":2},{"rule":"required","type":"int32","name":"cCallScore","id":3},{"rule":"required","type":"int32","name":"bShowCard","id":4},{"rule":"required","type":"int32","name":"nBombCount","id":5},{"rule":"required","type":"int32","name":"bSpring","id":6},{"rule":"required","type":"int32","name":"bReverseSpring","id":7},{"rule":"required","type":"int32","name":"bRobLord","id":8},{"rule":"repeated","type":"proto_stUserResult1","name":"vecUserResult1","id":9}]},{"name":"proto_stUserResult1","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nChairID","id":1},{"rule":"required","type":"int32","name":"nScore","id":2},{"rule":"required","type":"int32","name":"nJifen","id":3}]},{"name":"proto_gc_double_score_req","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nSerialID","id":1}]},{"name":"proto_cg_double_score_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nScore","id":1},{"rule":"required","type":"int32","name":"nSerialID","id":2}]},{"name":"proto_magic_emoji_noti","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cIsError","id":1},{"rule":"required","type":"int32","name":"cEmojiIndex","id":2},{"rule":"required","type":"int32","name":"cFromChairID","id":3},{"rule":"required","type":"int32","name":"cToChairID","id":4},{"rule":"required","type":"int32","name":"cEmojiNum","id":5}]},{"name":"proto_magic_emoji_req","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cEmojiIndex","id":1},{"rule":"required","type":"int32","name":"cToChairID","id":2},{"rule":"required","type":"int32","name":"cCostType","id":3}]},{"name":"proto_TocashItemInfo","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cChairID","id":1},{"rule":"required","type":"int32","name":"nItemChange","id":2}]},{"name":"proto_item_info","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nItemId","id":1},{"rule":"required","type":"int32","name":"nItemNum","id":2}]},{"name":"proto_gc_baiyuan_tocash_item_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cType","id":1},{"rule":"repeated","type":"proto_TocashItemInfo","name":"vecItemInfo","id":2}]},{"name":"proto_gc_baiyuan_hb_round_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nCurRound","id":1},{"rule":"required","type":"int32","name":"nLimitRound","id":2}]},{"name":"proto_gc_baiyuan_hb_round_award_not","syntax":"proto2","fields":[{"rule":"repeated","type":"proto_item_info","name":"vecItemInfo","id":1}]},{"name":"proto_cg_baiyuan_hb_round_award_req","syntax":"proto2","fields":[]},{"name":"proto_gc_baiyuan_hb_round_award_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cRet","id":1},{"rule":"repeated","type":"proto_item_info","name":"vecItemInfo","id":2}]},{"name":"proto_gc_baiyuan_win_double_not","syntax":"proto2","fields":[{"rule":"repeated","type":"proto_item_info","name":"vecItemInfo","id":1}]},{"name":"proto_cg_baiyuan_win_double_req","syntax":"proto2","fields":[]},{"name":"proto_gc_baiyuan_win_double_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cRet","id":1},{"rule":"repeated","type":"proto_item_info","name":"vecItemInfo","id":2}]},{"name":"proto_gc_baiyuan_regain_lose_not","syntax":"proto2","fields":[{"rule":"repeated","type":"proto_item_info","name":"vecItemInfo","id":1}]},{"name":"proto_cg_baiyuan_regain_lose_req","syntax":"proto2","fields":[]},{"name":"proto_gc_baiyuan_regain_lose_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cRet","id":1},{"rule":"repeated","type":"proto_item_info","name":"vecItemInfo","id":2}]},{"name":"proto_gc_baiyuan_luck_welfare_not","syntax":"proto2","fields":[{"rule":"repeated","type":"proto_item_info","name":"vecItemInfo","id":1}]},{"name":"proto_cg_baiyuan_luck_welfare_req","syntax":"proto2","fields":[]},{"name":"proto_gc_baiyuan_luck_welfare_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cRet","id":1},{"rule":"repeated","type":"proto_item_info","name":"vecItemInfo","id":2}]},{"name":"proto_cg_baiyuan_can_bankruptcy_defend_req","syntax":"proto2","fields":[]},{"name":"proto_gc_baiyuan_can_bankruptcy_defend_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cRet","id":1},{"rule":"repeated","type":"proto_item_info","name":"vecItemInfo","id":2}]},{"name":"proto_cg_baiyuan_bankruptcy_defend_req","syntax":"proto2","fields":[]},{"name":"proto_gc_baiyuan_bankruptcy_defend_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cRet","id":1},{"rule":"repeated","type":"proto_item_info","name":"vecItemInfo","id":2}]},{"name":"proto_cg_get_redpackets_award_req","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"type","id":1}]},{"name":"proto_gc_get_redpackets_award_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"ret","id":1},{"rule":"required","type":"int32","name":"cur_rounds","id":2},{"rule":"required","type":"int32","name":"limit_rounds","id":3},{"rule":"required","type":"int32","name":"nAmount","id":4},{"rule":"required","type":"int32","name":"cItemtype","id":5},{"rule":"required","type":"int32","name":"task_id","id":6},{"rule":"repeated","type":"proto_player_itemInfo","name":"fakeItem","id":7}]},{"name":"proto_cg_regain_lose_score_req","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nOp","id":1},{"rule":"required","type":"int32","name":"nItemIndex","id":2},{"rule":"required","type":"int32","name":"nItemNum","id":3}]},{"name":"proto_gc_regain_lose_score_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nRet","id":1},{"rule":"required","type":"int32","name":"nTime","id":2},{"rule":"repeated","type":"int32","name":"nValue","id":3},{"rule":"required","type":"int32","name":"nCurCount","id":4},{"rule":"required","type":"int32","name":"nItemIndex","id":5},{"rule":"required","type":"int32","name":"nItemNum","id":6}]},{"name":"proto_cg_look_lord_card_item_req","syntax":"proto2","fields":[]},{"name":"proto_gc_look_lord_card_item_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nRet","id":1}]},{"name":"proto_gc_win_doubel_req","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nAddAmount","id":1},{"rule":"required","type":"int32","name":"nAddProbabily","id":2}]},{"name":"proto_cg_win_doubel_req","syntax":"proto2","fields":[]},{"name":"proto_gc_win_doubel_ack","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"cRet","id":1},{"rule":"repeated","type":"proto_ItemInfo","name":"vecItemInfo","id":2}]},{"name":"proto_ItemInfo","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nItemIndex","id":1},{"rule":"required","type":"int64","name":"nItemNum","id":2}]},{"name":"proto_cg_look_lord_card_req","syntax":"proto2","fields":[]},{"name":"proto_gc_item_info_not","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"nItemIndex","id":1},{"rule":"required","type":"int32","name":"nItemCount","id":2}]},{"name":"proto_bc_specify_item_update_not","syntax":"proto2","fields":[{"rule":"required","type":"int64","name":"ply_guid","id":1},{"rule":"required","type":"int32","name":"index","id":2},{"rule":"required","type":"int32","name":"num","id":3}]},{"name":"proto_cb_chat_req","syntax":"proto2","fields":[{"rule":"required","type":"int32","name":"type","id":1},{"rule":"required","type":"string","name":"message","id":2}]},{"name":"proto_bc_chat_not","syntax":"proto2","fields":[{"rule":"required","type":"int64","name":"ply_guid","id":1},{"rule":"required","type":"string","name":"nickname","id":2},{"rule":"required","type":"string","name":"message","id":3},{"rule":"required","type":"int32","name":"vip_level","id":4},{"rule":"required","type":"int32","name":"user_level","id":5}]}],"isNamespace":true}