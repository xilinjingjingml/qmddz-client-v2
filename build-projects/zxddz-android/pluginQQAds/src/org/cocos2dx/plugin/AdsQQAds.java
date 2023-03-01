package org.cocos2dx.plugin;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.util.Log;
import java.util.Hashtable;

public class AdsQQAds implements InterfaceAds, ModuleApplication {

	private static final String LOG_TAG = "AdsQQAds";
	public static Activity mContext = null;
	private static boolean bDebug = false;
	public static AdsQQAds mQQAds = null;

	public AdsQQAds() {
		super();
	}

	protected static void LogE(String msg, Exception e) {
		Log.e(LOG_TAG, msg, e);
		e.printStackTrace();
	}

	protected static void LogD(String msg) {
		if (bDebug) {
			Log.d(LOG_TAG, msg);
		}
	}

	public AdsQQAds(Context context) {
		mContext = (Activity) context;
		mQQAds = this;
	}

	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;
	}

	@Override
	public String getSDKVersion() {
		return QQAds.getSDKVersion();
	}

	@Override
	public void configDeveloperInfo(Hashtable<String, String> devInfo) {
		PluginWrapper.runOnMainThread(new Runnable() {

			@Override
			public void run()
			{
				QQAds.InitBannerLayout(mContext);
			}
		});
	}

	/**
	 *开屏广告TTSplashAd
	 *插屏广告AdSlot
	 *激励视频TTRewardVideoAd
	 * */
	@Override
	public void showAds(int adsType, int width, int height) {
		switch (adsType) {
		case AdsWrapper.ADS_TYPE_BANNER:
			QQAds.showBannerAd(mContext, width, height);
			break;
		case AdsWrapper.ADS_TYPE_FULL_SCREEN:
			LogD("Now not support full screen view in Admob");
			break;
		case AdsWrapper.ADS_TYPE_INTER://插屏广告
			QQAds.showInLineAd(mContext);
			break;
		case AdsWrapper.ADS_TYPE_REWARTVIDEO://激励视频广告
			QQAds.showRewardVideoAd(mContext);
			break;
		case AdsWrapper.ADS_TYPE_NATIVE://原生信息流广告
			QQAds.showNativeAd(mContext);
			break;
		default:
			break;
		}
	}
	public void showAds(Hashtable<String, String> adInfo) {
		QQAds.showAds(mContext, adInfo);
	}

	@Override
	public void spendPoints(int points) {
		// do nothing, Admob don't have this function
	}

	@Override
	public void hideAds(int adsType) {
		QQAds.hideAds(adsType);
	}

	@Override
	public String getPluginVersion() {
		return "1.0.0";
	}

	public static void OnPluginResume() {
		QQAds.onResume();
	}
	public static void OnPluginPause() {
		QQAds.onPause();
	}
	public static void OnPluginDestroy() {
		QQAds.onDestroy();
	}

	@Override
	public void onCreate(Application application) {
		QQAds.init(application.getApplicationContext());
	}
}
