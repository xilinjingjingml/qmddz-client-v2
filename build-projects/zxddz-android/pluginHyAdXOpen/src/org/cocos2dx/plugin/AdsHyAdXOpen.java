package org.cocos2dx.plugin;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Point;
import android.os.Build;
import androidx.annotation.RequiresApi;
import android.util.Log;
import android.view.Display;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.RelativeLayout;
import android.widget.Toast;
import com.hytt.hyadxopensdk.HyAdXOpenSdk;
import com.hytt.hyadxopensdk.hyadxopenad.HyAdXOpenBannerAd;
import com.hytt.hyadxopensdk.hyadxopenad.HyAdXOpenImageAd;
import com.hytt.hyadxopensdk.hyadxopenad.HyAdXOpenMotivateVideoAd;
import com.hytt.hyadxopensdk.interfoot.HyAdXOpenBannerListener;
import com.hytt.hyadxopensdk.interfoot.HyAdXOpenListener;
import org.cocos2dx.libPluginHyAdXOpen.R;
import java.util.Hashtable;
import java.util.Random;

public class AdsHyAdXOpen implements InterfaceAds, ModuleApplication {

	private static final String LOG_TAG = "AdsHyAdXOpen";
	private static Activity mContext = null;
	private static boolean bDebug = true;
	public static AdsHyAdXOpen mAds = null;
	public static String appid = "";
	public static HyAdXOpenMotivateVideoAd mRewardVideo = null;
	public static HyAdXOpenBannerAd mBannerAD = null;
	public static HyAdXOpenImageAd mInLineAD = null;
	public static String inlineid = "";
	public static String videoID = "";
	public static String bannerID = "";
	private RelativeLayout bannerContainer = null;
	private View layout = null;
	private boolean isinit = false;
	public static boolean isvideoload = false;
	public static boolean isRewardVideo = false;

	public AdsHyAdXOpen()
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
			//Toast.makeText(mContext, msg, Toast.LENGTH_SHORT).show();
		}
	}

	public AdsHyAdXOpen(Context context) {
		mContext = (Activity) context;
		mAds = this;
	}

	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;
	}

	@Override
	public String getSDKVersion() {
		return "1.2.24";
	}

	@Override
	public void configDeveloperInfo(Hashtable<String, String> devInfo) {
		PluginWrapper.runOnMainThread(new Runnable() {

			@RequiresApi(api = Build.VERSION_CODES.JELLY_BEAN_MR1)
			@Override
			public void run()
			{
				if (isinit == false) {
					isinit = true;
					InitBannerLayout();
				}
			}
		});
	}

	public void InitBannerLayout() {
		if (layout == null) {
			layout = LayoutInflater.from(mContext).inflate(R.layout.hyadxopen_banner, null);
			PluginWrapper.mFramelayout.addView(layout);
			layout.setVisibility(View.INVISIBLE);
			bannerContainer = (RelativeLayout)mContext.findViewById(R.id.bannerContainer);
		}
	}
	private void loadBanner() {
		if (!"0".equalsIgnoreCase(bannerID) && bannerID != null)
		{
			//banner??????
			if (mBannerAD == null) {
				int width = bannerContainer.getWidth();
				int height = 180;
				mBannerAD = new HyAdXOpenBannerAd(mContext,
						bannerID,
						width,
						height,
						new HyAdXOpenBannerListener() {
							/**
							 * ?????????????????????
							 *
							 * @param code     ?????????200???????????????
							 * @param searchId ??????load???????????????????????????
							 * @param view     ??????????????????????????????parent?????????view???????????????????????????ViewGroup??????
							 *                 ?????????????????????GONE???????????????HyAdXOpenSplashAd.show()??????????????????
							 */
							@Override
							public void onAdFill(int code, String searchId, View view) {
								LogD("hyAdXOpenBannerAd onAdFill: code=" + code + ", searchId=" + searchId);
								if (code == 200) {
									bannerContainer.addView(view);
									mBannerAD.show();
								} else {
									AdsWrapper.onAdsResult(mAds, AdsWrapper.RESULT_CODE_BANNER_FAIL, "");
								}
							}

							/**
							 * ?????????????????????
							 *
							 * @param code     ?????????200???????????????
							 * @param searchId ???????????????????????????????????????????????????????????????????????????
							 */
							@Override
							public void onAdShow(int code, String searchId) {
								LogD("hyAdXOpenBannerAd onAdShow: code=" + code + ", searchId=" + searchId);
								AdsWrapper.onAdsResult(mAds, AdsWrapper.RESULT_CODE_BANNER_SUCCESS, "");
							}

							/**
							 * ?????????????????????
							 *
							 * @param code     ?????????200???????????????
							 * @param searchId ???????????????????????????????????????????????????????????????????????????
							 */
							@Override
							public void onAdClick(int code, String searchId) {
								LogD("hyAdXOpenBannerAd onAdClick: code=" + code + ", searchId=" + searchId);
							}

							/**
							 * ?????????????????????
							 *
							 * @param code    ?????????
							 * @param message ????????????
							 */
							@Override
							public void onAdFailed(int code, String message) {
								LogD("hyAdXOpenBannerAd onAdFailed: code=" + code + ", searchId=" + message);
								AdsWrapper.onAdsResult(mAds, AdsWrapper.RESULT_CODE_BANNER_FAIL, "");
							}

							/**
							 * ????????????????????????????????????
							 *
							 * @param code     ?????????200
							 * @param searchId ???????????????????????????????????????????????????????????????????????????????????????
							 */
							@Override
							public void onAdClose(int code, String searchId) {
								LogD("hyAdXOpenBannerAd onAdClose: code=" + code + ", searchId=" + searchId);
								layout.setVisibility(View.INVISIBLE);
							}
						});
			}
			mBannerAD.load();
		}
	}
	public static void loadRewardVideo() {
		if (!"0".equalsIgnoreCase(videoID) && videoID != null)
		{
			mRewardVideo = new HyAdXOpenMotivateVideoAd(mContext, videoID, new HyAdXOpenListener() {
				//???????????????????????????
				//code?????????200???
				//searchid??????????????????????????????id
				//view?????????????????????????????????????????????view???????????????????????????????????????viewgroup???
				@Override
				public void onAdFill(int code, final String searchId, View view) {
					LogD("onAdFill: " + code + " " + searchId);
					if (code == 200) {
						isvideoload = true;
						AdsWrapper.onAdsResult(mAds, AdsWrapper.RESULT_CODE_REWARTVIDEO_LOAD_SUCCESS, "");
						mRewardVideo.show();
					} else {
						AdsWrapper.onAdsResult(mAds, AdsWrapper.RESULT_CODE_REWARTVIDEO_LOAD_FAIL, "");
					}
				}

				//???????????????????????????
				@Override
				public void onAdShow(int code, String searchId) {
					LogD("onAdShow: code=" + code + ", searchId=" + searchId);
					isRewardVideo = true;
				}

				//??????????????????????????????
				@Override
				public void onAdClick(int code, String searchId) {
					LogD("onAdClick: code=" + code + ", searchId=" + searchId);
				}

				//??????????????????????????????
				@Override
				public void onAdClose(int code, String searchId) {
					LogD("onAdClose: code=" + code + ", searchId=" + searchId);
					AdsWrapper.onAdsResult(mAds, AdsWrapper.RESULT_CODE_REWARTVIDEO_SUCCEES, "");
					isvideoload = false;
					isRewardVideo = false;
				}

				//???????????????????????????????????????????????????
				@Override
				public void onAdFailed(int code, String message) {
					LogD("onAdFailed: code=" + code + ", searchId=" + message);
					AdsWrapper.onAdsResult(mAds, AdsWrapper.RESULT_CODE_REWARTVIDEO_FAIL, "");
					isvideoload = false;
					isRewardVideo = false;
				}

				//??????????????????????????????
				@Override
				public void onVideoDownloadSuccess(int code, String searchId) {
					LogD("onVideoDownloadSuccess: code=" + code + ", searchId=" + searchId);
				}

				//??????????????????????????????
				@Override
				public void onVideoDownloadFailed(int code, String searchId) {
					LogD("onVideoDownloadFailed: code=" + code + ", searchId=" + searchId);
				}

				//??????????????????????????????
				@Override
				public void onVideoPlayStart(int code, String searchId) {
					LogD("onVideoPlayStart: code=" + code + ", searchId=" + searchId);
				}

				//??????????????????????????????
				@Override
				public void onVideoPlayEnd(int code, String searchId) {
					LogD("onVideoPlayEnd: code=" + code + ", searchId=" + searchId);
				}
			});
			mRewardVideo.load();
		}
	}
	private void loadInLine() {
		if (!"0".equalsIgnoreCase(inlineid) && inlineid != null) {
			if (mInLineAD == null) {
				Display display = mContext.getWindowManager().getDefaultDisplay();
				Point size = new Point();
				display.getRealSize(size);
				int screenHeight = size.y;
				Random r = new Random(System.currentTimeMillis());
				mInLineAD = new HyAdXOpenImageAd(mContext,
						inlineid,
						r.nextInt(5) % 4 + 1,
						screenHeight,
						screenHeight * 2 / 3,
						screenHeight,
						screenHeight * 2 / 3 - 80,
						new HyAdXOpenListener() {
							@Override
							public void onAdFill(int code, final String searchId, final View view) {
								LogD("HyAdXOpenImageAd onAdFill: code = " + code + ", searchId = " + searchId);
								if (code == 200) {
									PluginWrapper.mFramelayout.addView(view);
									mInLineAD.show();
								}
							}

							@Override
							public void onAdShow(int code, String searchId) {
								LogD("HyAdXOpenImageAd onAdShow: code = " + code + ", searchId = " + searchId);
							}

							@Override
							public void onAdClick(int code, String searchId) {
								LogD("HyAdXOpenImageAd onAdClick: code = " + code + ", searchId = " + searchId);
							}

							@Override
							public void onAdClose(int code, String searchId) {
								LogD("HyAdXOpenImageAd onAdClose: code = " + code + ", searchId = " + searchId);
							}

							@Override
							public void onAdFailed(int code, String message) {
								LogD("HyAdXOpenImageAd onAdFailed: code = " + code + ", message = " + message);
							}

							@Override
							public void onVideoDownloadSuccess(int code, String searchId) {
								LogD("HyAdXOpenImageAd onVideoDownloadSuccess: code = " + code + ", searchId = " + searchId);
							}

							@Override
							public void onVideoDownloadFailed(int code, String searchId) {
								LogD("HyAdXOpenImageAd onVideoDownloadFailed: code = " + code + ", searchId = " + searchId);
							}

							@Override
							public void onVideoPlayStart(int code, String searchId) {
								LogD("HyAdXOpenImageAd onVideoPlayStart: code = " + code + ", searchId = " + searchId);
							}

							@Override
							public void onVideoPlayEnd(int code, String searchId) {
								LogD("HyAdXOpenImageAd onVideoPlayEnd: code = " + code + ", searchId = " + searchId);
							}
						});
			}
			mInLineAD.load();
		}
	}

	/**
	 * banner??????
	 * */
	private void BannerAd(final int widht, final int height)
	{
		if (mBannerAD != null)
		{
			PluginWrapper.runOnMainThread(new Runnable() {

				@Override
				public void run() {
					loadBanner();
					layout.setVisibility(View.VISIBLE);
				}
			});
		}
	}

	/**
	 * ????????????
	 * */
	private void InterAd()
	{
		PluginWrapper.runOnMainThread(new Runnable() {

			@Override
			public void run() {
				loadInLine();
			}
		});
	}

	/**
	 * ??????????????????
	 * */
	private void RewardVideoAd()
	{
		PluginWrapper.runOnMainThread(new Runnable() {

			@Override
			public void run() {
				loadRewardVideo();
			}
		});
	}

	/**
	 *????????????TTSplashAd
	 *????????????AdSlot
	 *????????????TTRewardVideoAd
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
		case AdsWrapper.ADS_TYPE_INTER://????????????
			InterAd();
			break;
		case AdsWrapper.ADS_TYPE_REWARTVIDEO://??????????????????
			RewardVideoAd();
			break;
		default:
			break;
		}
	}
	public void showAds(Hashtable<String, String> adInfo) {
		String adType = adInfo.get("adType");
		int adsType = Integer.valueOf(adType);
		switch (adsType) {
			case AdsWrapper.ADS_TYPE_BANNER:
				int width = 0;
				int height = 0;
				String adWidth = adInfo.get("adWidth");
				String adHeight = adInfo.get("adHeight");
				if (adWidth != null && !"".equalsIgnoreCase(adWidth)) {
					width = Integer.valueOf(adWidth);
				}
				if (adHeight != null && !"".equalsIgnoreCase(adHeight)) {
					height = Integer.valueOf(adHeight);
				}
				bannerID = adInfo.get("adId");
				BannerAd(width, height);
				break;
			case AdsWrapper.ADS_TYPE_FULL_SCREEN:
				LogD("Now not support full screen view in Admob");
				break;
			case AdsWrapper.ADS_TYPE_INTER://????????????
				inlineid = adInfo.get("adId");
				InterAd();
				break;
			case AdsWrapper.ADS_TYPE_REWARTVIDEO://??????????????????
				videoID = adInfo.get("adId");
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
			break;
		default:
			break;
		}
	}

	private void hideBannerAd()
	{
		PluginWrapper.runOnMainThread(new Runnable() {

			@Override
			public void run() {
				if (layout != null) {
					layout.setVisibility(View.INVISIBLE);
				}
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

	@Override
	public void onCreate(Application application) {
		ApplicationInfo info = null;
		try {
			info = application.getPackageManager().getApplicationInfo(
					application.getPackageName(),
					PackageManager.GET_META_DATA);
			if (info.metaData != null) {
				appid = String.valueOf(info.metaData.get("hyadxopen_appid"));
				appid = appid.replaceAll("hyadxopen_", "");
				bannerID = String.valueOf(info.metaData.get("hyadxopen_bannerID"));
				bannerID = bannerID.replaceAll("hyadxopen_", "");
				videoID = String.valueOf(info.metaData.get("hyadxopen_videoID"));
				videoID = videoID.replaceAll("hyadxopen_", "");
				inlineid = String.valueOf(info.metaData.get("hyadxopen_inlineID"));
				inlineid = inlineid.replaceAll("hyadxopen_", "");
			}
		} catch (PackageManager.NameNotFoundException e) {
			e.printStackTrace();
		}
		HyAdXOpenSdk.getInstance().init(application, appid);
	}
}
