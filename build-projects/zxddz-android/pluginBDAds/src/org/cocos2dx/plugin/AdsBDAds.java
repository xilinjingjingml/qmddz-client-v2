package org.cocos2dx.plugin;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.util.Log;
import java.util.Hashtable;

public class AdsBDAds implements InterfaceAds, ModuleApplication {

	private static final String LOG_TAG = "AdsBDAds";
	private static Activity mContext = null;
	private static boolean bDebug = false;
	public static AdsBDAds mBDAds = null;

	public AdsBDAds() {
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

	public AdsBDAds(Context context) {
		mContext = (Activity) context;
		mBDAds = this;
	}

	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;
	}

	@Override
	public String getSDKVersion() {
		return BaiDuAds.getSDKVersion();
	}

	@Override
	public void configDeveloperInfo(Hashtable<String, String> devInfo) {
		PluginWrapper.runOnMainThread(new Runnable() {

			@Override
			public void run()
			{
				BaiDuAds.InitBannerLayout(mContext);
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
			BaiDuAds.showBannerAd(mContext, width, height);
			break;
		case AdsWrapper.ADS_TYPE_FULL_SCREEN:
			LogD("Now not support full screen view in Admob");
			break;
		case AdsWrapper.ADS_TYPE_INTER://插屏广告
			BaiDuAds.showInLineAd(mContext);
			break;
		case AdsWrapper.ADS_TYPE_REWARTVIDEO://激励视频广告
			BaiDuAds.showRewardVideoAd(mContext);
			break;
		default:
			break;
		}
	}
	public void showAds(Hashtable<String, String> adInfo) {
		BaiDuAds.showAds(mContext, adInfo);
	}

	@Override
	public void spendPoints(int points) {
		// do nothing, Admob don't have this function
	}

	@Override
	public void hideAds(int adsType) {
		BaiDuAds.hideAds(adsType);
	}

	@Override
	public String getPluginVersion() {
		return "1.0.0";
	}

	public static void OnPluginDestroy() {
		BaiDuAds.onDestroy();
	}

	@Override
	public void onCreate(Application application) {
		BaiDuAds.init(application.getApplicationContext());
	}
}
