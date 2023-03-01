package org.cocos2dx.plugin;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.annotation.RequiresApi;
import android.util.Log;
import android.view.View;
import java.util.Hashtable;

public class AdsGather implements InterfaceAds, ModuleApplication {

	private static final String LOG_TAG = "AdsGather";
	private static Activity mContext = null;
	private static boolean bDebug = true;
	public static AdsGather mAds = null;
	private static String channelName = "";
	private static int numBanner = 0;
	private static int numRewardVideo = 0;
	private static int numInLine = 0;

	public AdsGather()
	{
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

	public AdsGather(Context context) {
		mContext = (Activity) context;
		mAds = this;
	}

	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;
	}

	@Override
	public String getSDKVersion() {
		return "1.0.0";
	}

	@Override
	public void configDeveloperInfo(Hashtable<String, String> devInfo) {
		PluginWrapper.runOnMainThread(new Runnable() {

			@RequiresApi(api = Build.VERSION_CODES.JELLY_BEAN_MR1)
			@Override
			public void run()
			{
				QQAds.InitBannerLayout(mContext);
				TTAds.InitBannerLayout(mContext);
			}
		});
	}
	/**
	 * banner广告
	 * */
	private void showBannerAd(int width, int height)
	{
		if (numBanner%2 == 0) {
			//mosads.showBannerAd(mContext, width, height);
		} else {
			//hyAdXOpenads.showBannerAd(mContext, width, height);
		}
		numBanner ++;
	}

	/**
	 * 插屏广告
	 * */
	private void InterAd()
	{
		if (numInLine%2 == 0) {
			//mosads.showInLineAd(mContext);
		} else {
			//hyAdXOpenads.showInLineAd(mContext);
		}
		numInLine ++;
	}

	/**
	 * 激励视频广告
	 * */
	private void showRewardVideoAd()
	{
		if (numRewardVideo%2 == 0) {
			//mosads.showRewardVideoAd(mContext);
		} else {
			//hyAdXOpenads.showRewardVideoAd(mContext);
		}
		numRewardVideo ++;
	}

	/**
	 *开屏广告TTSplashAd
	 *插屏广告AdSlot
	 *激励视频TTRewardVideoAd
	 * */
	@Override
	public void showAds(int adsType, int width, int height) {
//		switch (adsType) {
//		case AdsWrapper.ADS_TYPE_BANNER://banner广告
//			showBannerAd(width, height);
//			break;
//		case AdsWrapper.ADS_TYPE_FULL_SCREEN:
//			LogD("Now not support full screen view in Admob");
//			break;
//		case AdsWrapper.ADS_TYPE_INTER://插屏广告
//			InterAd();
//			break;
//		case AdsWrapper.ADS_TYPE_REWARTVIDEO://激励视频广告
//			showRewardVideoAd();
//			break;
//		default:
//			break;
//		}
	}
	public void showAds(Hashtable<String, String> adInfo) {
//		String adPlugin = adInfo.get("adPlugin");
//		if ("mosads".equalsIgnoreCase(adPlugin)) {
//			mosads.showAds(mContext, adInfo);
//		} else if ("hyadxopen".equalsIgnoreCase(adPlugin)) {
//			hyAdXOpenads.showAds(mContext, adInfo);
//		}
	}

	@Override
	public void spendPoints(int points) {
		// do nothing, Admob don't have this function
	}

	@Override
	public void hideAds(int adsType) {

	}

	@Override
	public String getPluginVersion() {
		return "1.0.0";
	}

	@Override
	public void onCreate(Application application) {
		QQAds.init(application);
		TTAds.init(application);
	}

	public static void OnPluginDestroy() {
		QQAds.onDestroy();
		TTAds.onDestroy();
	}
}
