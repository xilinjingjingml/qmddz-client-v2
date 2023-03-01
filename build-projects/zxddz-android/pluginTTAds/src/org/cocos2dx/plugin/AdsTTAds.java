package org.cocos2dx.plugin;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.util.Log;
import java.util.Hashtable;

public class AdsTTAds implements InterfaceAds, ModuleApplication {

	private static final String LOG_TAG = "AdsTTAds";
	private static Activity mContext = null;
	private static boolean bDebug = false;
	public static AdsTTAds mTTads = null;

	public AdsTTAds() {
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

	public AdsTTAds(Context context) {
		mContext = (Activity) context;
		mTTads = this;
	}

	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;
	}

	@Override
	public String getSDKVersion() {
		return TTAds.getSDKVersion();
	}

	@Override
	public void configDeveloperInfo(Hashtable<String, String> devInfo) {
		PluginWrapper.runOnMainThread(new Runnable() {

			@Override
			public void run()
			{
                TTAds.InitBannerLayout(mContext);
			}
		});
	}

	/**
	 *开屏广告TTSplashAd
	 *插屏广告AdSlot
	 *激励视频TTRewardVideoAd
	 * 原生信息流广告
	 * */
	@Override
	public void showAds(int adsType, int width, int height) {
		switch (adsType) {
		case AdsWrapper.ADS_TYPE_BANNER:
			TTAds.showBannerAd(mContext, width, height);
			break;
		case AdsWrapper.ADS_TYPE_FULL_SCREEN:
			LogD("Now not support full screen view in Admob");
			break;
		case AdsWrapper.ADS_TYPE_INTER://插屏广告
			TTAds.showInLineAd(mContext);
			break;
		case AdsWrapper.ADS_TYPE_REWARTVIDEO://激励视频广告
			TTAds.showRewardVideoAd(mContext);
			break;
		case AdsWrapper.ADS_TYPE_NATIVE://原生信息流广告
			TTAds.showNativeAd(mContext);
			break;
		default:
			break;
		}
	}
	public void showAds(Hashtable<String, String> adInfo) {
        TTAds.showAds(mContext, adInfo);
    }

	@Override
	public void spendPoints(int points) {
		// do nothing, Admob don't have this function
	}

	@Override
	public void hideAds(int adsType) {
		TTAds.hideAds(adsType);
	}

	@Override
	public String getPluginVersion() {
		return "1.0.0";
	}

	@Override
	public void onCreate(Application application) {
		TTAds.init(application.getApplicationContext());
	}

	public static void OnPluginDestroy() {
		TTAds.onDestroy();
	}
}
