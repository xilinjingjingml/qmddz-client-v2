package org.cocos2dx.config;

/*
 * MsgStringConfig
 *
 * Version information V1.0
 *
 * Date 2014/02/17
 *
 * Copyright MicroBeam
 */
public class MsgStringConfig
{
	/* 登录相关提示信息 */
	public static String msgLoginParamsError 	= "登录参数错误，请稍后再试";
	public static String msgLoginCancel			= "登录取消";
	public static String msgLoginFail			= "登录服务器失败";
	public static String msgLoginSuccess		= "登录服务器成功";
	public static String msgLoginTimeout 		= "登录服务器超时，请稍后再试";
	public static String msgServerParamsError 	= "服务器参数错误，请稍后再试";
	public static String msgLogoutSuccess 		= "注销账户成功";
	
	/* 支付相关提示信息 */
	public static String msgPayParamerError		= "输入参数有错,无法提交购买请求";
	public static String msgProductInfoError	= "商品信息错误";
	public static String msgPayDefault			= "默认回调";
	public static String msgGetOrderFail		= "请求订单失败，请稍后再试";
	public static String msgGetOrderTimeout		= "请求订单超时，请稍后再试";
	public static String msgOrdersubmited		= "您的订单已经提交，如果支付成功将会在1~3分钟之内到帐";
	public static String msgPaySuccess			= "支付完成，购买商品将会在1~3分钟之内到帐";
	public static String msgPayCancel			= "支付取消";
	public static String msgPayFail				= "支付未完成";
	public static String msgVerifyOrderError	= "查询订单错误";
	public static String msgVerifyOrderFail		= "查询订单失败";
	public static String msgVerifyOrderTimeout	= "查询订单超时";
	public static String msgVerifyOrderSuccess	= "查询订单成功";
	public static String msgPayResultError		= "支付结果通知服务器失败";

	/* 广告相关提示信息 */
	public static String msgAdsSuccess			= "广告播放成功";
	public static String msgAdsFail			 	= "广告播放失败";
	public static String msgAdsLoadSuccess		= "广告LOAD成功";
	public static String msgAdsLoadFail			= "广告LOAD失败";
	public static String msgAdsClose			= "广告关闭成功";
	
	/* 图像上传提示信息 */
	public static String msgInsertSdCard		    = "请插入SD卡";
	public static String msgCopyUidSuccess		    = "复制成功";
	public static String msgCopyUidFail	   			= "复制失败";
	public static String msgInitHeadTitle			= "选择头像";
	public static String msgInitHeadItemsCamera		= "相机拍摄";
	public static String msgInitHeadItemsPhotograph	= "手机相册";
	public static String msgInitHeadItemsCancel		= "取消";
	
	public static String msgCopyIMGSuccess			= "保存至相册成功";
	public static String msgCopyIMGFail				= "保存至相册失败";

	public static String msgInitHeadfaceSuccess		= "头像初始化完成";
	public static String msgInitHeadfaceFail		= "头像初始化失败";
	public static String msgUploadHeadfaceSuccess	= "头像更新成功";
	public static String msgUploadHeadfaceFail		= "头像更新失败";
	public static String UploadHeadfaceSuccess		= "头像上传云端成功";
	public static String msgUploadExtraparamSuccess	= "图片更新成功";
	public static String msgUploadExtraparamFail	= "图片更新失败";
	
	public static String msgGetClipBoardSuccess		= "获取剪切板内容成功";
	
	/* 音频播放录制提示信息*/
	public static String msgPlaySoundStart			= "开始播放录音";
	public static String msgPlaySoundPause			= "中断播放录音";
	public static String msgPlaySoundResume			= "恢复播放录音";
	public static String msgPlaySoundStop			= "停止播放录音";
	public static String msgPlaySoundOver			= "录音播放结束";
	public static String msgPlaySoundError			= "录音播放错误";
	
	public static String msgRecordVoiceStart		= "录音开始";
	public static String msgRecordVoiceCancel		= "录音取消";
	public static String msgRecordVoiceOver			= "录音结束";
	public static String msgRecordVoiceFail			= "录音失败";
	public static String msgRecordVoiceUploadStart	= "上传录音开始";
	public static String msgRecordVoiceUploadOver	= "上传录音结束";
	public static String msgRecordVoiceUploadFail	= "上传录音失败";
	
	public static String msgLocationSuccess			= "定位成功";
	public static String msgLocationFail			= "定位失败";
	
	public static String msgUserUidSuccess			= "获取用户座椅号成功";
	
	/* 服务器交互提示信息 */
	public static String msgNetworkError		= "网络不可用，请检查网络";
	public static String msgServerError			= "服务器处理错误，请重新尝试";
	public static String msgResultError			= "结果解析失败，请稍后再试";
	
	public static String msgProcessDialg		= "订单确认中，请稍候...";
	
	/* 分享相关信息 */
	public static String msgShareSuccess		= "分享成功";
	public static String msgShareCancel			= "分享取消";
	public static String msgShareFail			= "分享失败";
	public static String msgShareTimeout		= "分享超时，请稍后重试";

	/*娃娃机信息*/
	public static String msgLoginWaWaJiRoomSuccess 	= "登录娃娃机房间成功";
	public static String msgWaWaJiRoomOnplaySuccess = "拉流成功";

	/*通讯录信息*/
	public static String msgContactsSuccess			= "获取通讯录内容成功";
	public static String msgContactsFail			= "获取通讯录内容失败";
	public static String msgContactsNone			= "通讯录没有任何联系人";
	public static String msgContactsNoAuthority		= "无权限访问通讯录";
	public static String msgContactsReject			= "通讯录授权被拒绝";

	/*客服信息*/
	public static String msgKeFuFail				= "当前客服服务不可用！";

	/*url跳转app透传的参数*/
	public static String msgURLParamsSuccess		= "获取url透传参数成功";

	/*openurl失败*/
	public static String msgOpenUrlFailed		    = "openurl失败";

	/*微信信息*/
	public static String msgWeiXinUninstall			= "请先安装微信！";
	public static String msgWeiXinUpgrade			= "分享失败，请升级微信版本！";
	public static String msgWeiXinIMGFail			= "分享失败，分享图片太大";
	
	/* 其他特殊渠道提示信息 */
//	public static String msgNdSyPaySuccess		= "亲，充值91豆成功后，还需将91豆兑换成游戏币";
//	public static String msgAlipayPluginError	= "未安装支付宝插件，请安装后重新购买";
//	public static String msgAuthenticaFail		= "认证失败，请重新尝试";
	
	//国家地区标示
	public static final int countryEnv_China 		= 0;//中国
	public static final int countryEnv_India 		= 1;//印度
	public static final int countryEnv_Vietnam 		= 2;//越南
	
	public static void swtichMsgLanguage(int countryEnv){
		switch(countryEnv){
		case countryEnv_India:
			
			/* 登录相关提示信息 */
			msgLoginTimeout 		= "Logging in server time out,please try again later";
			msgLoginParamsError 	= "Login error in parameters,please try again later";
			msgLoginSuccess			= "Login successful";
			msgLoginFail			= "Login failed";
			msgLoginCancel			= "Login cancel";
			msgServerParamsError 	= "The server parameter error,Please try again later";
			
			/* 支付相关提示信息 */
			msgGetOrderFail			= "Failure to request the order,please try again later";
			msgGetOrderTimeout		= "Request order Time out,please try again later";
			msgPaySuccess			= "Payment successful.Purchase of goods will arrive within 1 to 3 minutes";
			msgPayCancel			= "Payment cancel";
			msgPayFail				= "Payment unfinished";
   		    msgOrdersubmited		= "Your order has been submitted.If successful payment will arrive within 1 to 3 minutes";
			msgVerifyOrderFail		= "Failed to query order";
			msgVerifyOrderTimeout	= "Check order time out";
			msgVerifyOrderError		= "Check order failed";
			msgVerifyOrderSuccess	= "Check order successful";
			msgPayParamerError		= "The input parameters are wrong,cannot submit the purchase request";
			msgProductInfoError		= "Commodity information error";
			msgPayDefault			= "The default callback";
			
			/* 图像上传提示信息 */
			msgCopyUidSuccess		    = "Copy success";
			msgCopyUidFail	   			= "Copy failures";
			msgInsertSdCard         	= "Please insert the SD card";
			msgInitHeadTitle			= "Select Avatar";
			msgInitHeadItemsCamera		= "Camera";
			msgInitHeadItemsPhotograph	= "Photograph";
			msgInitHeadItemsCancel		= "Cancel";
			
			msgInitHeadfaceSuccess		= "Avatar initialization is complete";
			msgInitHeadfaceFail			= "Failed to initialize Avatar";
			msgUploadHeadfaceSuccess	= "Avatar updated successfully";
			msgUploadHeadfaceFail		= "Avatar update fails";
	
			/* 服务器交互提示信息 */
			msgNetworkError			= "The network is not available, please check the network";
			msgServerError			= "Server error, please try again";
			msgResultError			= "Results the resolution failed, please try again later.";
		
			msgProcessDialg			= "Order confirmation, please wait...";
			
			break;
		case countryEnv_Vietnam:
			
			/* 登录相关提示信息 */
			msgLoginTimeout 		= "Lỗi liên kết máy chủ, hãy thử lại sau";
			msgLoginParamsError 	= "Lỗi đăng nhập, hãy thử lại sau";
			msgLoginSuccess			= "Đăng nhập thành công";
			msgLoginFail			= "Không thể kết nối server";
			msgLoginCancel			= "Hủy đăng nhập";
			msgServerParamsError 	= "Lỗi liên kết máy chủ, hãy thử lại sau";
			
			/* 支付相关提示信息 */
			msgGetOrderFail			= "Liên kết thất bại, hãy thử lại sau";
			msgGetOrderTimeout		= "Lỗi liên kết, hãy thử lại sau";
			msgPaySuccess			= "Thanh toán thành công, bạn sẽ nhận được sản phẩm sau 1-3 phút";
			msgPayCancel			= "Hủy thanh toán";
			msgPayFail				= "Thanh toán chưa xử lý xong";
			msgOrdersubmited		= "Đã gửi đơn hàng, nếu thanh toán thành công, bạn sẽ nhận được sản phẩm sau 1-3 phút";
			msgVerifyOrderFail		= "Truy vấn đơn hàng thất bại";
			msgVerifyOrderTimeout	= "Truy vấn đơn hàng thất bại";
			msgVerifyOrderError		= "Lỗi truy vấn đơn hàng";
			msgVerifyOrderSuccess	= "Truy vấn đơn hàng thành công";
			msgPayParamerError		= "Tham số không đúng, không thể gửi yêu cầu mua";
			msgProductInfoError		= "Lỗi thông tin sản phẩm";
			msgPayDefault			= "Mặc định ban đầu";

			/* 服务器交互提示信息 */
			msgNetworkError			= "Lỗi mạng, kiểm tra lại kết nối mạng và thử lại";
			msgServerError			= "Lỗi xử lý máy chủ, hãy thử lại sau";
			msgResultError			= "Phân tích kết quả thất bại, hãy thử lại sau";
			
			msgProcessDialg			= "Đang xác nhận đơn hàng…";
			
			break;
			
		default:
			break;
		}

	}

}
