package org.cocos2dx.plugin;

import android.app.Activity;
import android.content.Context;
import android.graphics.Point;
import android.os.Build;
import androidx.annotation.RequiresApi;
import android.util.Log;
import android.view.Display;
import android.view.View;
import android.widget.RelativeLayout;
import com.mosads.adslib.MosAdsListener;
import com.mosads.adslib.MosAdsTool;
import com.mosads.adslib.MosBannerAD;
import com.mosads.adslib.MosBannerADListener;
import com.mosads.adslib.MosError;
//import com.mosads.adslib.MosInterAdListener;
//import com.mosads.adslib.MosInterstitialAD;
import com.mosads.adslib.MosRewardVideoAD;
import com.mosads.adslib.MosRewardVideoListener;
import com.qq.e.comm.util.AdError;
import org.cocos2dx.config.MsgStringConfig;
import java.util.Hashtable;
import static org.cocos2dx.plugin.PlatformWP.layout;
import static org.cocos2dx.plugin.PlatformWP.bannerContainer;

public class AdsMosads implements InterfaceAds {

	private static final String LOG_TAG = "AdsMosads";
	private static Activity mContext = null;
	private static boolean bDebug = false;
	private static AdsMosads mMosads = null;
	public static MosRewardVideoAD mRewardVideo = null;
	//public static MosInterstitialAD iad = null;
	public static MosBannerAD mBannerAD = null;
	public static boolean isBannerAD = false;
	private boolean isinit = false;
	public static boolean isvideoload = false;
	public static boolean isRewardVideo = false;
	private static String appid = "";
	private static String appkey = "";
	private static String channelName = "";
	private static Hashtable<String, String> adsInfo = null;

	protected static void LogE(String msg, Exception e) {
		Log.e(LOG_TAG, msg, e);
		e.printStackTrace();
	}

	protected static void LogD(String msg) {
		if (bDebug) {
			Log.d(LOG_TAG, msg);
		}
	}

	public AdsMosads(Context context) {
		mContext = (Activity) context;
		mMosads = this;
	}

	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;
	}

	@Override
	public String getSDKVersion() {
		return "2.5.2.6";
	}

	public void InitBannerLayout() {
		PlatformWP.getInstance().InitBannerLayout(mContext);
	}

	@Override
	public void configDeveloperInfo(Hashtable<String, String> devInfo) {
		PluginWrapper.runOnMainThread(new Runnable() {

			@RequiresApi(api = Build.VERSION_CODES.JELLY_BEAN_MR1)
			@Override
			public void run()
			{
				if (isinit == false) {
					channelName = PlatformWP.getMetaName("ChannelName");
					appid = PlatformWP.getMetaName("MosAdsAppId");
					appkey = PlatformWP.getMetaName("MosAdsSecretKey");
					InitBannerLayout();
					MosadsInit(appid, appkey, channelName);
				}
			}
		});
	}

	public void MosadsInit(final String appid, final String appkey, final String channel) {
		MosAdsTool.setMosKey(appid, appkey, channel);
		MosAdsTool.init(mContext, new MosAdsListener(){
			public void onFail(MosError err) {
				isinit = false;
			}
			public void onSuccess() {
				isinit = true;
				InitMosBanner();
				InitMosRewardVideo();
			}
		});
	}
	private void InitMosBanner() {
		//banner广告
		mBannerAD = new MosBannerAD(mContext, bannerContainer, new MosBannerADListener() {

			@Override
			public void onNoAD(AdError error) {
				Log.d(LOG_TAG, String.format("MosBannerAD onNoAD，eCode = %d, eMsg = %s", error.getErrorCode(),
						error.getErrorMsg()));
				isBannerAD = false;
				adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
			}

			@Override
			public void onADReceiv() {
				Log.d(LOG_TAG, "MosBannerAD ONBannerReceive");
				isBannerAD = true;
				adsResult(AdsWrapper.RESULT_CODE_BANNER_SUCCESS, MsgStringConfig.msgAdsSuccess);
			}

			@Override
			public void onADClosed() {
				Log.d(LOG_TAG, "MosBannerAD ONBannerClosed");
				layout.setVisibility(View.INVISIBLE);
				mBannerAD.show();
			}
		});
		mBannerAD.show();
	}
	private void InitMosRewardVideo() {
		//激励视频广告
		mRewardVideo = new MosRewardVideoAD(mContext, new MosRewardVideoListener(){
			public void onADLoad(){
				LogD("MosRewardVideoAD onADLoad");
			}
			public void onADShow(){
				LogD("MosRewardVideoAD onADShow");
				isRewardVideo = true;
			}
			public void onReward(){
				LogD("MosRewardVideoAD onReward");
				adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_SUCCEES, MsgStringConfig.msgAdsSuccess);
				isvideoload = true;
				mRewardVideo.load();
				isRewardVideo = false;
			}
			public void onADClick(){
				LogD("MosRewardVideoAD onADClick");
			}
			public void onADClose(){
				LogD("MosRewardVideoAD onADClose");
			}
			public void onError(AdError var1){
				LogD("MosRewardVideoAD onError" + "onError() code:"+ var1.getErrorCode() + ", msg:" + var1.getErrorMsg());
				adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_FAIL, MsgStringConfig.msgAdsFail);
				isvideoload = false;
				isRewardVideo = false;
			}
		});
		//在项目里需要提前准备好视频，提前load
		mRewardVideo.load();
		isvideoload = true;
	}
	/**
	 * banner广告
	 * */
	private void BannerAd(final int width, final int height)
	{
		PluginWrapper.runOnMainThread(new Runnable() {

			@Override
			public void run() {
				int w = bannerContainer.getWidth();
				if (width > 0 && height > 0) {
					RelativeLayout.LayoutParams layoutParams = (RelativeLayout.LayoutParams)bannerContainer.getLayoutParams();
					Display display = mContext.getWindowManager().getDefaultDisplay();
					Point size = new Point();
					display.getRealSize(size);
					int screenWidth = size.x;
					int screenHeight = size.y;
					LogD("width-display :" + screenWidth);
					LogD("height-display :" + screenHeight);
					layoutParams.setMargins((screenWidth-width)/2, screenHeight - height, (screenWidth-width)/2, 0);
					bannerContainer.setLayoutParams(layoutParams);
				}
				if (isBannerAD == false){
					InitMosBanner();
				}
				layout.setVisibility(View.VISIBLE);
			}
		});
	}

	/**
	 * 插屏广告
	 * */
	private void InterAd()
	{
		//iad.show();
	}

	/**
	 * 激励视频广告
	 * */
	private void RewardVideoAd()
	{
		PluginWrapper.runOnMainThread(new Runnable() {

			@Override
			public void run() {
				if (mRewardVideo != null)
				{
					if (isvideoload == false)
					{
						mRewardVideo.load();
					}
					if(mRewardVideo.isValid() == true) //
					{
						if (mRewardVideo.isReady()) {
							mRewardVideo.show();  //默认有声
						}
					}
					else
					{
						adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_LOAD_FAIL, MsgStringConfig.msgAdsLoadFail);
						//需要重新下载video  之前下载好的视频可能过期 或者已经显示过了，不能再显示了，需要重新下载
						mRewardVideo.load();
					}
				}
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
			BannerAd(width, height);
			break;
		case AdsWrapper.ADS_TYPE_FULL_SCREEN:
			LogD("Now not support full screen view in Admob");
			break;
		case AdsWrapper.ADS_TYPE_INTER://插屏广告
			InterAd();
			break;
		case AdsWrapper.ADS_TYPE_REWARTVIDEO://激励视频广告
			RewardVideoAd();
			break;
		default:
			break;
		}
	}

	@Override
	public void spendPoints(int points) {
		// do nothing, Admob don't have this function
	}

	@Override
	public void hideAds(int adsType) {
		switch (adsType) {
		case AdsWrapper.ADS_TYPE_BANNER:
			hideBannerAd();
			break;
		case AdsWrapper.ADS_TYPE_INTER:
			hideInterAd();
			break;
		case AdsWrapper.ADS_TYPE_FULL_SCREEN:
		default:
			break;
		}
	}

	private void hideBannerAd()
	{
		PluginWrapper.runOnMainThread(new Runnable() {

			@Override
			public void run() {
                layout.setVisibility(View.INVISIBLE);
			}
		});
	}

	private void hideInterAd()
	{
		PluginWrapper.runOnMainThread(new Runnable() {
			@Override
			public void run() {

			}
		});
	}

	@Override
	public String getPluginVersion() {
		return "1.0.0";
	}

	public static void OnPluginDestroy() {
		if (mBannerAD != null) {
			mBannerAD.destroy();
		}
	}

	public static void adsResult(int ret, String msg)
	{
		AdsWrapper.setAdsJson(adsInfo);
		AdsWrapper.onAdsResult(mMosads, ret, msg);
	}

}
