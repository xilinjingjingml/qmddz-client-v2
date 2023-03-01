package org.cocos2dx.config;

/*
 * URLConfig
 *
 * Version information V1.0
 *
 * Date 2014/02/17
 *
 * Copyright MicroBeam
 */
public class URLConfig
{
	/* 登录域名，o、m、t分别代表正式、镜像、测试 */
	public static String mycatLoginHost = "http://web.login.mycat.hiigame.net/";
	public static String oLoginHost = "http://login.hiigame.com/";
	public static String mLoginHost = "http://m.login.hiigame.com/";
	public static String tLoginHost = "http://t.login.hiigame.com/";
	public static String dLoginHost = "http://login.zhxqp.cn/";
	
	/* 支付域名，o、m、t分别代表正式、镜像、测试 */
	public static String mycatMallHost = "http://web.mall.mycat.hiigame.net/";
	public static String oMallHost = "http://mall.hiigame.com/";
	public static String mMallHost = "http://m.mall.hiigame.com/";
	public static String tMallHost = "http://t.mall.hiigame.com/";
	public static String dMallHost = "http://mall.zhxqp.cn/";
	
	/* 前台接口个推域名，o、m、t分别代表正式、镜像、测试 */  
	public static String mycatformHost = "http://web.statics.mycat.hiigame.net/";
	public static String oPlatformHost = "http://statics.hiigame.com/";
	public static String mPlatformHost = "http://m.statics.hiigame.com/";
	public static String tPlatformHost = "http://t.statics.hiigame.com/";
	public static String dPlatformHost = "http://statics.zhxqp.cn/";
	
	/* 修改头像、昵称地址, o、m、t分别代表正式、镜像、测试 */
	public static String oModifyUserInfoUrl = "http://login.hiigame.com/user/detail/upt";
	public static String mModifyUserInfoUrl = "http://m.login.hiigame.com/user/detail/upt";
	public static String tModifyUserInfoUrl = "http://t.login.hiigame.com/user/detail/upt";
	public static String dModifyUserInfoUrl = "http://login.zhxqp.cn/user/detail/upt";
	
	/* 分享域名，o、m、t分别代表正式、镜像、测试 */
	public static String oShareHost = "http://statics.hiigame.com/execute/task/award/draw";
	public static String mShareHost = "http://m.statics.hiigame.com/execute/task/award/draw";
	public static String tShareHost = "http://t.statics.hiigame.com/execute/task/award/draw";
	public static String dShareHost = "http://statics.zhxqp.cn/execute/task/award/draw";
	
	/* 头像云端保存地址 */
	public static String headFaceCloudUrl = "http://upload.bdo.hiigame.com/upload";//"http://upload.bdo.hiigame.com:8080/FileUploadControl";
	
	/* 音频文件云端保存地址*/
	public static String playManagerUrl = "http://upload.bdo.hiigame.com/upload";
	
	//国家地区标示
	public static final int countryEnv_China 		= 0;//中国
	public static final int countryEnv_India 		= 1;//印度
	public static final int countryEnv_Vietnam 		= 2;//越南
	public static final int countryEnv_Yingyongbao  = 3;//应用宝
	public static final int countryEnv_NanJingQianBao  	= 4;//钱宝
	public static final int countryEnv_Singapore    = 5;//新加坡（海外服务器）
	public static final int countryEnv_170817		= 6;//新的独服
	
	public static void switchGlobalUrl(int countryEnv){
		switch (countryEnv) {
		case countryEnv_170817:
			
			/* 登录域名，o、m、t分别代表正式、镜像、测试 */
			oLoginHost = "http://login.zhxqp.cn/";
			mLoginHost = "http://m.login.hiigame.com/";
			tLoginHost = "http://t.login.hiigame.com/";
			
			/* 支付域名，o、m、t分别代表正式、镜像、测试 */
			oMallHost = "http://mall.zhxqp.cn/";
			mMallHost = "http://m.mall.hiigame.com/";
			tMallHost = "http://t.mall.hiigame.com/";
			
			/* 个推域名，o、m、t分别代表正式、镜像、测试 */
			oPlatformHost = "http://statics.zhxqp.cn/";
			mPlatformHost = "http://m.statics.hiigame.com/";
			tPlatformHost = "http://t.statics.hiigame.com/";
			
			/* 修改头像、昵称地址, o、m、t分别代表正式、镜像、测试 */
			oModifyUserInfoUrl = "http://login.zhxqp.cn/user/detail/upt";
			mModifyUserInfoUrl = "http://m.login.oseas.hiigame.com/user/detail/upt";
			tModifyUserInfoUrl = "http://t.login.oseas.hiigame.com/user/detail/upt";
			
			/* 分享域名，o、m、t分别代表正式、镜像、测试 */
			oShareHost = "http://statics.zhxqp.cn/execute/task/award/draw";
			mShareHost = "http://m.statics.hiigame.com/execute/task/award/draw";
			tShareHost = "http://t.statics.hiigame.com/execute/task/award/draw";
			
			/* 头像云端保存地址 */
			headFaceCloudUrl = "http://upload.bdo.hiigame.com/upload";//"http://upload.bdo.hiigame.com:8080/FileUploadControl";
			break;
		case countryEnv_Singapore:
			
			/* 登录域名，o、m、t分别代表正式、镜像、测试 */
			oLoginHost = "http://login.oseas.hiigame.com/";
			mLoginHost = "http://m.login.oseas.hiigame.com/";
			tLoginHost = "http://t.login.oseas.hiigame.com/";
			
			/* 支付域名，o、m、t分别代表正式、镜像、测试 */
			oMallHost = "http://mall.oseas.hiigame.com/";
			mMallHost = "http://m.mall.oseas.hiigame.com/";
			tMallHost = "http://t.mall.oseas.hiigame.com/";
			
			/* 个推域名，o、m、t分别代表正式、镜像、测试 */
			oPlatformHost = "http://static.teenpatti.izhangxin.com/";
			mPlatformHost = "http://m.statics.teenpatti.izhangxin.com:16150/";
			tPlatformHost = "http://t.statics.hiigame.com/";
			
			/* 修改头像、昵称地址, o、m、t分别代表正式、镜像、测试 */
			oModifyUserInfoUrl = "http://login.oseas.hiigame.com/user/detail/upt";
			mModifyUserInfoUrl = "http://m.login.oseas.hiigame.com/user/detail/upt";
			tModifyUserInfoUrl = "http://t.login.oseas.hiigame.com/user/detail/upt";
			
			/* 头像云端保存地址 */
			headFaceCloudUrl = "http://upload.bdo.hiigame.com/upload";//"http://upload.bdo.hiigame.com:8080/FileUploadControl";
			break;
			
		case countryEnv_India:	
			
			/* 登录域名，o、m、t分别代表正式、镜像、测试 */
			oLoginHost = "http://login.teenpatti.izhangxin.com/";
			mLoginHost = "http://m.teenpatti.izhangxin.com:16150/";
			tLoginHost = "http://t.login.hiigame.com/";
			
			/* 支付域名，o、m、t分别代表正式、镜像、测试 */
			oMallHost = "http://mall.teenpatti.izhangxin.com/";
			mMallHost = "http://m.mall.teenpatti.izhangxin.com:16150/";
			tMallHost = "http://t.mall.hiigame.com/";
			
			/* 个推域名，o、m、t分别代表正式、镜像、测试 */
			oPlatformHost = "http://static.teenpatti.izhangxin.com/";
			mPlatformHost = "http://m.statics.teenpatti.izhangxin.com:16150/";
			tPlatformHost = "http://t.statics.hiigame.com/";
			
			/* 修改头像、昵称地址, o、m、t分别代表正式、镜像、测试 */
			oModifyUserInfoUrl = "http://login.teenpatti.izhangxin.com/user/detail/upt";
			mModifyUserInfoUrl = "http://m.teenpatti.izhangxin.com:16150/user/detail/upt";
			tModifyUserInfoUrl = "http://t.login.hiigame.com/user/detail/upt";
			
			/* 头像云端保存地址 */
			headFaceCloudUrl = "http://upload.bdo.hiigame.com/upload";//"http://upload.bdo.hiigame.com:8080/FileUploadControl";
			break;
			
		case countryEnv_Yingyongbao:
			
			/* 登录域名，o、m、t分别代表正式、镜像、测试 */
			oLoginHost = "http://login.tencent.izhangxin.com/";
			mLoginHost = "http://m.login.hiigame.com/";
			tLoginHost = "http://t.login.hiigame.com/";
			
			/* 支付域名，o、m、t分别代表正式、镜像、测试 */
			oMallHost = "http://mall.tencent.izhangxin.com/";
			mMallHost = "http://m.mall.hiigame.com/";
			tMallHost = "http://t.mall.hiigame.com/";
			
			/* 个推域名，o、m、t分别代表正式、镜像、测试 */  
			oPlatformHost = "http://statics.tencent.izhangxin.com/";
			mPlatformHost = "http://m.statics.hiigame.com/";
			tPlatformHost = "http://t.statics.hiigame.com/";
			
			/* 修改头像、昵称地址, o、m、t分别代表正式、镜像、测试 */
			oModifyUserInfoUrl = "http://login.tencent.izhangxin.com/user/detail/upt";
			mModifyUserInfoUrl = "http://m.login.hiigame.com/user/detail/upt";
			tModifyUserInfoUrl = "http://t.login.hiigame.com/user/detail/upt";
			
			/* 头像云端保存地址 */
		    headFaceCloudUrl = "http://upload.bdo.hiigame.com/upload";//"http://upload.bdo.hiigame.com:8080/FileUploadControl";
			
			break;
		case countryEnv_Vietnam:
			
//			agent.vietnam.izhangxin.com
//			admin.vietnam.izhangxin.com
//			
//			login.vietnam.izhangxin.com
//			mall.vietnam.izhangxin.com
//			statics.vietnam.izhangxin.com
//			
//			镜像
//			vietnam.hiigame.com:16150
//			mall.vietnam.hiigame.com:16150
//			statics.vietnam.hiigame.com:16150

			
			/* 登录域名，o、m、t分别代表正式、镜像、测试 */
			oLoginHost = "http://login.vietnam.izhangxin.com/";
			mLoginHost = "http://vietnam.hiigame.com:16150/";
			tLoginHost = "http://t.login.hiigame.com/";
			
			/* 支付域名，o、m、t分别代表正式、镜像、测试 */
			oMallHost = "http://mall.vietnam.izhangxin.com/";
			mMallHost = "http://mall.vietnam.hiigame.com:16150/";
			tMallHost = "http://t.mall.hiigame.com/";
			
			/* 个推域名，o、m、t分别代表正式、镜像、测试 */
			oPlatformHost = "http://statics.vietnam.izhangxin.com/";
			mPlatformHost = "http://statics.vietnam.hiigame.com:16150/";
			tPlatformHost = "http://t.statics.hiigame.com/";
			
			/* 修改头像、昵称地址, o、m、t分别代表正式、镜像、测试 */
			oModifyUserInfoUrl = "http://login.vietnam.izhangxin.com/user/detail/upt";
			mModifyUserInfoUrl = "http://vietnam.hiigame.com:16150/user/detail/upt";
			tModifyUserInfoUrl = "http://t.login.hiigame.com/user/detail/upt";
			
			/* 头像云端保存地址 */
			headFaceCloudUrl = "http://upload.bdo.hiigame.com/upload";//"http://upload.bdo.hiigame.com:8080/FileUploadControl";
			
			break;	
		case countryEnv_NanJingQianBao:
			
			/* 登录域名，o、m、t分别代表正式、镜像、测试 */
			oLoginHost = "http://qb.login.hiigame.com/";
			mLoginHost = "http://m.qb.login.hiigame.com/";
			tLoginHost = "http://t.qb.login.hiigame.com/";
			
			/* 支付域名，o、m、t分别代表正式、镜像、测试 */
			oMallHost = "http://qb.mall.hiigame.com/";
			mMallHost = "http://m.qb.mall.hiigame.com/";
			tMallHost = "http://t.qb.mall.hiigame.com/";
			
			/* 个推域名，o、m、t分别代表正式、镜像、测试 */  
			oPlatformHost = "http://qb.statics.hiigame.com/";
			mPlatformHost = "http://m.qb.statics.hiigame.com/";
			tPlatformHost = "http://t.qb.statics.hiigame.com/";
			
			/* 修改头像、昵称地址, o、m、t分别代表正式、镜像、测试 */
			oModifyUserInfoUrl = "http://qb.login.hiigame.com/user/detail/upt";
			mModifyUserInfoUrl = "http://m.qb.login.hiigame.com/user/detail/upt";
			tModifyUserInfoUrl = "http://t.qb.login.hiigame.com/user/detail/upt";
			
			/* 头像云端保存地址 */
		    headFaceCloudUrl = "http://upload.bdo.hiigame.com/upload";//"http://upload.bdo.hiigame.com:8080/FileUploadControl";
			
			break; 
		default:
			break;
		}
	}
}
