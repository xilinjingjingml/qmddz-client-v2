const AudioConfig = {
	bg_music: "background3",

	audio_alarm: "cardalarm",
	audio_bomb: "bomb",
	audio_clock: "clock",
	audio_dropcard: "dropcards",
	audio_lose: "lose",
	audio_menu: "menu",

	audio_plane: "plane",
	audio_putcard: "putcard",
	audio_relieves: "relieves",
	audio_rocket: "wangzha",
	audio_sendcard: "sendcard",
	audio_start: "start",

	audio_shunzi: "double",
	audio_chat_0: "dialogue/chat_0",
	audio_chat_1: "dialogue/chat_1",
	audio_chat_2: "dialogue/chat_2",
	audio_chat_3: "dialogue/chat_3",
	audio_chat_4: "dialogue/chat_4",
	audio_chat_5: "dialogue/chat_5",
	audio_chat_6: "dialogue/chat_6",
	audio_chat_7: "dialogue/chat_7",
	audio_chat_8: "dialogue/chat_8",
	audio_chat_9: "dialogue/chat_9",

	audio_out_card: "Audio_Out_Card",
	audio_drop_money: "effect_dropmoney_1",
	audio_win: "effect_win",
	audio_select_card: "lord_select_card",
	audio_dispatch: "Special_Dispatch",
	audio_remind: "Special_Remind",

	audio_pass_type_1: "buyao1",
	audio_pass_type_2: "buyao2",
	audio_pass_type_3: "buyao3",
}

// 出牌人声
for (const sex of ["man", "woman"]) {
	AudioConfig["audio_pass" + sex] = `mandarin/${sex}/pass_${sex}`
	AudioConfig["audio_score0" + sex] = `mandarin/${sex}/score0_${sex}`
	AudioConfig["audio_score1" + sex] = `mandarin/${sex}/score1_${sex}`
	AudioConfig["audio_score2" + sex] = `mandarin/${sex}/score2_${sex}`
	AudioConfig["audio_score3" + sex] = `mandarin/${sex}/score3_${sex}`
	AudioConfig["audio_call_lord" + sex] = `mandarin/${sex}/call_lord_${sex}`
	AudioConfig["audio_show" + sex] = `mandarin/${sex}/show_card_${sex}`
	AudioConfig["audio_rob" + sex] = `mandarin/${sex}/rob_${sex}`
	AudioConfig["audio_no_rob" + sex] = `mandarin/${sex}/no_rob_${sex}`
	AudioConfig["audio_duiduishun" + sex] = `mandarin/${sex}/duiduishun_${sex}`
	AudioConfig["audio_feiji" + sex] = `mandarin/${sex}/feiji_${sex}`
	AudioConfig["audio_danshun" + sex] = `mandarin/${sex}/danshun_${sex}`
	AudioConfig["audio_jiabei" + sex] = `mandarin/${sex}/jiabei_${sex}`
	AudioConfig["audio_superdouble" + sex] = `mandarin/${sex}/superdouble_${sex}`
	AudioConfig["audio_3" + sex] = `mandarin/${sex}/3_0_0_${sex}`
	AudioConfig["audio_4" + sex] = `mandarin/${sex}/4_0_0_${sex}`
	AudioConfig["audio_5" + sex] = `mandarin/${sex}/5_0_0_${sex}`
	AudioConfig["audio_6" + sex] = `mandarin/${sex}/6_0_0_${sex}`
	AudioConfig["audio_7" + sex] = `mandarin/${sex}/7_0_0_${sex}`
	AudioConfig["audio_8" + sex] = `mandarin/${sex}/8_0_0_${sex}`
	AudioConfig["audio_9" + sex] = `mandarin/${sex}/9_0_0_${sex}`
	AudioConfig["audio_10" + sex] = `mandarin/${sex}/10_0_0_${sex}`
	AudioConfig["audio_11" + sex] = `mandarin/${sex}/11_0_0_${sex}`
	AudioConfig["audio_12" + sex] = `mandarin/${sex}/12_0_0_${sex}`
	AudioConfig["audio_13" + sex] = `mandarin/${sex}/13_0_0_${sex}`
	AudioConfig["audio_14" + sex] = `mandarin/${sex}/14_0_0_${sex}`
	AudioConfig["audio_15" + sex] = `mandarin/${sex}/15_0_0_${sex}`
	AudioConfig["audio_16" + sex] = `mandarin/${sex}/16_0_0_${sex}`
	AudioConfig["audio_17" + sex] = `mandarin/${sex}/17_0_0_${sex}`
	AudioConfig["audio_2_3" + sex] = `mandarin/${sex}/33_0_0_${sex}`
	AudioConfig["audio_2_4" + sex] = `mandarin/${sex}/44_0_0_${sex}`
	AudioConfig["audio_2_5" + sex] = `mandarin/${sex}/55_0_0_${sex}`
	AudioConfig["audio_2_6" + sex] = `mandarin/${sex}/66_0_0_${sex}`
	AudioConfig["audio_2_7" + sex] = `mandarin/${sex}/77_0_0_${sex}`
	AudioConfig["audio_2_8" + sex] = `mandarin/${sex}/88_0_0_${sex}`
	AudioConfig["audio_2_9" + sex] = `mandarin/${sex}/99_0_0_${sex}`
	AudioConfig["audio_2_10" + sex] = `mandarin/${sex}/1010_0_0_${sex}`
	AudioConfig["audio_2_11" + sex] = `mandarin/${sex}/1111_0_0_${sex}`
	AudioConfig["audio_2_12" + sex] = `mandarin/${sex}/1212_0_0_${sex}`
	AudioConfig["audio_2_13" + sex] = `mandarin/${sex}/1313_0_0_${sex}`
	AudioConfig["audio_2_14" + sex] = `mandarin/${sex}/1414_0_0_${sex}`
	AudioConfig["audio_2_15" + sex] = `mandarin/${sex}/1515_0_0_${sex}`
	AudioConfig["audio_3_0" + sex] = `mandarin/${sex}/333_0_0_${sex}`
	AudioConfig["audio_3_2" + sex] = `mandarin/${sex}/332_0_0_${sex}`
	AudioConfig["audio_3_1" + sex] = `mandarin/${sex}/331_0_0_${sex}`
	AudioConfig["audio_4_2" + sex] = `mandarin/${sex}/411_0_0_${sex}`
	AudioConfig["audio_plane_0" + sex] = `mandarin/${sex}/plane_${sex}`
	AudioConfig["audio_bomb_0" + sex] = `mandarin/${sex}/bomb_${sex}`
}
export default AudioConfig
