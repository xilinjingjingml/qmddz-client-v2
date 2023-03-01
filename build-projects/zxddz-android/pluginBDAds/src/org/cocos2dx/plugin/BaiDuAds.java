package org.cocos2dx.plugin;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Point;
import android.util.Log;
import android.view.Display;
import android.view.View;
import android.widget.RelativeLayout;
import com.baidu.mobads.AdSettings;
import com.baidu.mobads.AdView;
import com.baidu.mobads.AdViewListener;
import com.baidu.mobads.InterstitialAd;
import com.baidu.mobads.InterstitialAdListener;
import com.baidu.mobads.MobadsPermissionSettings;
import com.baidu.mobads.production.BaiduXAdSDKContext;
import com.baidu.mobads.rewardvideo.RewardVideoAd;
import org.cocos2dx.utils.ParamerParseUtil;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.Hashtable;
import static org.cocos2dx.plugin.PlatformWP.bannerContainer;
import static org.cocos2dx.plugin.PlatformWP.layout;

public class BaiDuAds {

    private static final String LOG_TAG = "BaiDuAds";
    private static final String MOBADS_PERMISSIONS = "mobads_permissions";
    // SP的key, 读取设备信息权限
    private static final String KEY_PHONE_STATE = "key_phone_state";
    // SP的key, 读取应用列表权限
    private static final String KEY_APP_LIST = "key_app_list";
    private static boolean bDebug = true;
    private static String bannerid = "";
    private static String rewardvideoid = "";
    private static String inlineid = "";
    private static AdView mBannerAD = null;
    private static InterstitialAd mInLineAD = null;
    private static RewardVideoAd mRewardVideo = null;
    public static boolean isvideoload = false;
    public static boolean isRewardVideo = false;
    //private static int bannerWidth = 233;//250;//300;
    private static int bannerHeight = 100;

    protected static void LogD(String msg) {
        if (bDebug) {
            Log.d(LOG_TAG, msg);
        }
    }

    public static void init(Context mContext) {
        MobadsPermissionSettings.setPermissionReadDeviceID(getPermissionBoolean(mContext, KEY_PHONE_STATE));
        MobadsPermissionSettings.setPermissionAppList(getPermissionBoolean(mContext, KEY_APP_LIST));
    }
    private static boolean getPermissionBoolean(Context mContext, String key) {
        if (mContext != null) {
            SharedPreferences preferences = mContext.getSharedPreferences(MOBADS_PERMISSIONS, Context.MODE_PRIVATE);
            return preferences.getBoolean(key, true);
        }
        return true;
    }

    public static void InitBannerLayout(Activity mContext) {
        PlatformWP.getInstance().InitBannerLayout(mContext);
    }

    public static void loadBanner(final Activity mContext) {
        //banner广告
        if (bannerid == null || "0".equalsIgnoreCase(bannerid)) {
            AdsWrapper.onAdsResult(AdsBDAds.mBDAds, AdsWrapper.RESULT_CODE_BANNER_FAIL, "");
            return;
        }
        mBannerAD = new AdView(mContext, bannerid);
        mBannerAD.setListener(new AdViewListener() {
            /**
             * 广告加载成功回调，表示广告相关的资源已经加载完毕，Ready To Show
             * */
            @Override
            public void onAdReady(AdView adView) {
                LogD("AdViewListener onAdReady adView.getWidth() = " + adView.getWidth() +
                        ", adView.getHeight() = " + adView.getHeight());
                int scale = (int)mContext.getResources().getDisplayMetrics().density;
                int bannerH = bannerHeight*scale;
                int bannerW = bannerH * 7 / 3;

                String wh = "";
                JSONObject jsonObject = new JSONObject();
                try {
                    String bw = String.valueOf(bannerW);
                    String bh = String.valueOf(bannerH);
                    jsonObject.put("bannerWidth", bw);
                    jsonObject.put("bannerHeight", bh);
                    wh = ParamerParseUtil.parseJsonToString(jsonObject);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                AdsWrapper.onAdsResult(AdsBDAds.mBDAds, AdsWrapper.RESULT_CODE_BANNER_SUCCESS, wh);
            }
            /**
             * 当广告展现时发起的回调
             * */
            @Override
            public void onAdShow(JSONObject jsonObject) {
                LogD("AdViewListener onAdShow");
            }
            /**
             * 当广告点击时发起的回调
             * */
            @Override
            public void onAdClick(JSONObject jsonObject) {
                LogD("AdViewListener onAdClick");
            }
            /**
             * 广告加载失败，error对象包含了错误码和错误信息
             * */
            @Override
            public void onAdFailed(String error) {
                LogD("AdViewListener onAdFailed error = " + error);
                AdsWrapper.onAdsResult(AdsBDAds.mBDAds, AdsWrapper.RESULT_CODE_BANNER_FAIL, "");
            }
            /**
             * 广告刷新切换
             * */
            @Override
            public void onAdSwitch() {
                LogD("AdViewListener onAdSwitch");
            }
            /**
             * 当广告关闭时调用
             * */
            @Override
            public void onAdClose(JSONObject jsonObject) {
                LogD("AdViewListener onAdClose");
                layout.setVisibility(View.INVISIBLE);
            }
        });
        bannerContainer.removeAllViews();

        int scale = (int)mContext.getResources().getDisplayMetrics().density;
        int bannerH = bannerHeight*scale;
        int bannerW = bannerH * 7 / 3;

        RelativeLayout.LayoutParams layoutParams = (RelativeLayout.LayoutParams)bannerContainer.getLayoutParams();
        Display display = mContext.getWindowManager().getDefaultDisplay();
        Point size = new Point();
        display.getRealSize(size);
        int screenWidth = size.x;
        int screenHeight = size.y;
        LogD("AdViewListener onAdReady width-display :" + screenWidth);
        LogD("AdViewListener onAdReady height-display :" + screenHeight);
        layoutParams.setMargins((screenWidth-bannerW)/2, screenHeight - bannerH, (screenWidth-bannerW)/2, 0);
        bannerContainer.setLayoutParams(layoutParams);

        // 将adView添加到父控件中(注：该父控件不一定为您的根控件，只要该控件能通过addView能添加广告视图即可)
        RelativeLayout.LayoutParams rllp = new RelativeLayout.LayoutParams(bannerW, bannerH);
        rllp.addRule(RelativeLayout.ALIGN_PARENT_TOP);
        bannerContainer.addView(mBannerAD, rllp);
        layout.setVisibility(View.VISIBLE);
    }

    public static void loadRewardVideo(final Activity mContext) {
        //激励视频广告
        if (rewardvideoid == null || "0".equalsIgnoreCase(rewardvideoid)) {
            AdsWrapper.onAdsResult(AdsBDAds.mBDAds, AdsWrapper.RESULT_CODE_REWARTVIDEO_FAIL, "");
            return;
        }
        mRewardVideo = new RewardVideoAd(mContext, rewardvideoid, new RewardVideoAd.RewardVideoAdListener(){
            /**
             * 激励视频广告被点击
             */
            @Override
            public void onAdClick() {
                LogD("RewardVideoAD onAdClick");
            }
            /**
             * 激励视频广告被关闭，附带播放进度
             */
            @Override
            public void onAdClose(float playScale) {
                LogD("RewardVideoAD onAdClose playScale = " + playScale);
            }
            /**
             * 激励视频广告曝光
             */
            @Override
            public void onAdShow() {
                LogD("RewardVideoAD onAdShow");
                isRewardVideo = true;
            }
            /**
             * 广告流程出错
             */
            @Override
            public void onAdFailed(String reason) {
                LogD("RewardVideoAD onAdFailed reason=" + reason);
                AdsWrapper.onAdsResult(AdsBDAds.mBDAds, AdsWrapper.RESULT_CODE_REWARTVIDEO_FAIL, "");
                isvideoload = false;
                isRewardVideo = false;
            }
            /**
             * 视频素材缓存成功，可在此回调后进行广告展示
             */
            @Override
            public void onVideoDownloadSuccess() {
                LogD("RewardVideoAD onVideoDownloadSuccess");
                isvideoload = true;
                AdsWrapper.onAdsResult(AdsBDAds.mBDAds, AdsWrapper.RESULT_CODE_REWARTVIDEO_LOAD_SUCCESS, "");
                mRewardVideo.show();
            }
            /**
             * 视频素材缓存失败
             */
            @Override
            public void onVideoDownloadFailed() {
                LogD("RewardVideoAD onVideoDownloadFailed");
            }
            /**
             * 激励视频播放完毕
             */
            @Override
            public void playCompletion() {
                LogD("RewardVideoAD playCompletion");
                AdsWrapper.onAdsResult(AdsBDAds.mBDAds, AdsWrapper.RESULT_CODE_REWARTVIDEO_SUCCEES, "");
                isvideoload = true;
                isRewardVideo = false;
            }
        });
        //在项目里需要提前准备好视频，提前load
        mRewardVideo.load();
    }

    private static void loadInLine(final Activity mContext) {
        //插屏广告
        if (inlineid == null || "0".equalsIgnoreCase(inlineid)) {
            AdsWrapper.onAdsResult(AdsBDAds.mBDAds, AdsWrapper.RESULT_CODE_INTER_FAIL, "");
            return;
        }
        if (mInLineAD == null) {
            mInLineAD = new InterstitialAd(mContext, inlineid);
            mInLineAD.setListener(new InterstitialAdListener() {
                /**
                 * 插屏广告点击时回调
                 * */
                @Override
                public void onAdClick(InterstitialAd ad) {
                    LogD("InterstitialAdListener onAdClick");
                }
                /**
                 * 插屏广告关闭时回调
                 * */
                @Override
                public void onAdDismissed() {
                    LogD("InterstitialAdListener onAdDismissed");
                    AdsWrapper.onAdsResult(AdsBDAds.mBDAds, AdsWrapper.RESULT_CODE_INTER_CLOSE, "");
                }
                /**
                 * 插屏广告展开时回调
                 * */
                @Override
                public void onAdPresent() {
                    LogD("InterstitialAdListener onAdPresent");
                    AdsWrapper.onAdsResult(AdsBDAds.mBDAds, AdsWrapper.RESULT_CODE_INTER_SUCCEES, "");
                }
                /**
                 * 插屏广告加载完毕，此回调后才可以调用 show 方法
                 * */
                @Override
                public void onAdReady() {
                    LogD("InterstitialAdListener onAdReady");
                    mInLineAD.showAd(mContext);
                }
                /**
                 * 广告加载失败，error 对象包含了错误码和错误信息
                 * */
                @Override
                public void onAdFailed(String error) {
                    LogD("InterstitialAdListener onAdFailed, error =" + error);
                    AdsWrapper.onAdsResult(AdsBDAds.mBDAds, AdsWrapper.RESULT_CODE_INTER_FAIL, "");
                }
            });
        }
        mInLineAD.loadAd();
    }

    public static void showAds(Activity mContext, Hashtable<String, String> adInfo) {
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
                bannerid = adInfo.get("adId");
                bannerid = "7281043";
                showBannerAd(mContext, width, height);
                break;
            case AdsWrapper.ADS_TYPE_FULL_SCREEN:
                LogD("Now not support full screen view in Admob");
                break;
            case AdsWrapper.ADS_TYPE_INTER://插屏广告
                inlineid = adInfo.get("adId");
                inlineid = "7271686";
                showInLineAd(mContext);
                break;
            case AdsWrapper.ADS_TYPE_REWARTVIDEO://激励视频广告
                rewardvideoid = adInfo.get("adId");
                rewardvideoid = "7271688";
                showRewardVideoAd(mContext);
                break;
            default:
                break;
        }
    }
    public static void hideAds(int adsType) {
        switch (adsType) {
            case AdsWrapper.ADS_TYPE_BANNER:
                hideBannerAd();
                break;
            case AdsWrapper.ADS_TYPE_INTER:
            case AdsWrapper.ADS_TYPE_FULL_SCREEN:
            default:
                break;
        }
    }

    public static void showBannerAd(final Activity mContext, final int width, final int height) {
        PluginWrapper.runOnMainThread(new Runnable() {

            @Override
            public void run() {
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
                loadBanner(mContext);
            }
        });
    }
    public static void hideBannerAd() {
        PluginWrapper.runOnMainThread(new Runnable() {

            @Override
            public void run() {
				layout.setVisibility(View.INVISIBLE);
            }
        });
    }

    public static void showRewardVideoAd(final Activity mContext) {
        PluginWrapper.runOnMainThread(new Runnable() {

            @Override
            public void run() {
                loadRewardVideo(mContext);
            }
        });
    }

    public static void showInLineAd(final Activity mContext) {
        PluginWrapper.runOnMainThread(new Runnable() {

            @Override
            public void run() {
                loadInLine(mContext);
            }
        });
    }

    public static void onDestroy() {
        if (mInLineAD != null) {
            mInLineAD.destroy();
        }
        if (mBannerAD != null) {
            mBannerAD.destroy();
        }
        BaiduXAdSDKContext.exit();
    }

    public static String getSDKVersion() {
        return String.valueOf(AdSettings.getSDKVersion());
    }

}
