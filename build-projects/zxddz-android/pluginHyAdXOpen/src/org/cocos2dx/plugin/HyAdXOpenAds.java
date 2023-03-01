package org.cocos2dx.plugin;

import android.app.Activity;
import android.content.Context;
import android.graphics.Point;
import android.util.Log;
import android.view.Display;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.RelativeLayout;
import com.hytt.hyadxopensdk.HyAdXOpenSdk;
import com.hytt.hyadxopensdk.hyadxopenad.HyAdXOpenBannerAd;
import com.hytt.hyadxopensdk.hyadxopenad.HyAdXOpenImageAd;
import com.hytt.hyadxopensdk.hyadxopenad.HyAdXOpenMotivateVideoAd;
import com.hytt.hyadxopensdk.interfoot.HyAdXOpenBannerListener;
import com.hytt.hyadxopensdk.interfoot.HyAdXOpenListener;
import org.cocos2dx.libPluginHyAdXOpen.R;
import java.util.Hashtable;
import java.util.Random;

public class HyAdXOpenAds {

    private static final String LOG_TAG = "HyAdXOpenAds";
    private static boolean bDebug = true;
    private static boolean isInit = false;
    public static String appid = "";
    private static String bannerid = "";
    private static String rewardvideoid = "";
    private static String inlineid = "";
    private static HyAdXOpenBannerAd mBannerAD = null;
    private static HyAdXOpenImageAd mInLineAD = null;
    private static HyAdXOpenMotivateVideoAd mRewardVideo = null;
    private static RelativeLayout bannerContainer = null;
    private static View layout = null;
    public static boolean isvideoload = false;
    public static boolean isRewardVideo = false;
    private static int bannerWidth = 300;
    private static int bannerHeight = 100;

    protected static void LogD(String msg) {
        if (bDebug) {
            Log.d(LOG_TAG, msg);
        }
    }

    public static void init(Context context) {
        if (!isInit) {
            HyAdXOpenSdk.getInstance().init(context, appid);
            isInit = true;
        }
    }

    public static void InitBannerLayout(Activity mContext) {
        if (layout == null) {
            layout = LayoutInflater.from(mContext).inflate(R.layout.hyadxopen_banner, null);
            PluginWrapper.mFramelayout.addView(layout);
            layout.setVisibility(View.INVISIBLE);
            bannerContainer = (RelativeLayout)mContext.findViewById(R.id.bannerContainer);
        }
    }

    public static void loadTTBanner(final Activity mContext) {
        //banner广告
        if (bannerid == null || "0".equalsIgnoreCase(bannerid) || isInit == false) {
            return;
        }
        //banner广告
        if (mBannerAD == null) {
            int width = bannerContainer.getWidth();
            int height = 180;
            mBannerAD = new HyAdXOpenBannerAd(mContext,
                    bannerid,
                    width,
                    height,
                    new HyAdXOpenBannerListener() {
                        /**
                         * 广告填充的回调
                         *
                         * @param code     默认为200，表示成功
                         * @param searchId 每次load成功后的唯一标识符
                         * @param view     填充后会回调一个没有parent的开屏view，可以被添加到任意ViewGroup中，
                         *                 默认显示状态为GONE，可以通过HyAdXOpenSplashAd.show()将其展示出来
                         */
                        @Override
                        public void onAdFill(int code, String searchId, View view) {
							LogD("hyAdXOpenBannerAd onAdFill: code=" + code + ", searchId=" + searchId);
                            if (code == 200) {
                                bannerContainer.addView(view);
                                mBannerAD.show();
                            } else {
                                AdsWrapper.onAdsResult(AdsHyAdXOpen.mAds, AdsWrapper.RESULT_CODE_BANNER_FAIL, "");
                            }
                        }

                        /**
                         * 广告展示的回调
                         *
                         * @param code     默认为200，表示成功
                         * @param searchId 每次广告请求的唯一标识符，表示哪次请求的广告被展示
                         */
                        @Override
                        public void onAdShow(int code, String searchId) {
							LogD("hyAdXOpenBannerAd onAdShow: code=" + code + ", searchId=" + searchId);
                            AdsWrapper.onAdsResult(AdsHyAdXOpen.mAds, AdsWrapper.RESULT_CODE_BANNER_SUCCESS, "");
                        }

                        /**
                         * 广告点击的回调
                         *
                         * @param code     默认为200，表示成功
                         * @param searchId 每次广告请求的唯一标识符，表示哪次请求的广告被点击
                         */
                        @Override
                        public void onAdClick(int code, String searchId) {
							LogD("hyAdXOpenBannerAd onAdClick: code=" + code + ", searchId=" + searchId);
                        }

                        /**
                         * 广告失败的回调
                         *
                         * @param code    错误码
                         * @param message 错误说明
                         */
                        @Override
                        public void onAdFailed(int code, String message) {
							LogD("hyAdXOpenBannerAd onAdFailed: code=" + code + ", searchId=" + message);
                            AdsWrapper.onAdsResult(AdsHyAdXOpen.mAds, AdsWrapper.RESULT_CODE_BANNER_FAIL, "");
                        }

                        /**
                         * 广告被用户手动关闭的回调
                         *
                         * @param code     默认为200
                         * @param searchId 每次广告请求的唯一标识符，表示哪次请求的广告被用户手动关闭
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

    public static void loadTTRewardVideo(final Activity mContext) {
        if (rewardvideoid == null || "0".equalsIgnoreCase(rewardvideoid) || isInit == false) {
            return;
        }
        mRewardVideo = new HyAdXOpenMotivateVideoAd(mContext, rewardvideoid, new HyAdXOpenListener() {
            //广告填充时候回调，
            //code默认为200，
            //searchid为每次请求时候的唯一id
            //view为当广告为图文素材时返回广告的view，开发者可直接添加到指定的viewgroup中
            @Override
            public void onAdFill(int code, final String searchId, View view) {
                LogD("onAdFill: " + code + " " + searchId);
                if (code == 200) {
                    isvideoload = true;
                    AdsWrapper.onAdsResult(AdsHyAdXOpen.mAds, AdsWrapper.RESULT_CODE_REWARTVIDEO_LOAD_SUCCESS, "");
                    mRewardVideo.show();
                } else {
                    AdsWrapper.onAdsResult(AdsHyAdXOpen.mAds, AdsWrapper.RESULT_CODE_REWARTVIDEO_LOAD_FAIL, "");
                }
            }

            //广告被展示时候回调
            @Override
            public void onAdShow(int code, String searchId) {
				LogD("onAdShow: code=" + code + ", searchId=" + searchId);
                isRewardVideo = true;
            }

            //广告被点击时候的回调
            @Override
            public void onAdClick(int code, String searchId) {
				LogD("onAdClick: code=" + code + ", searchId=" + searchId);
            }

            //广告被关闭时候的回调
            @Override
            public void onAdClose(int code, String searchId) {
				LogD("onAdClose: code=" + code + ", searchId=" + searchId);
                AdsWrapper.onAdsResult(AdsHyAdXOpen.mAds, AdsWrapper.RESULT_CODE_REWARTVIDEO_SUCCEES, "");
                isvideoload = false;
                isRewardVideo = false;
            }

            //广告请求出错时候的回调，如没有填充
            @Override
            public void onAdFailed(int code, String message) {
				LogD("onAdFailed: code=" + code + ", searchId=" + message);
                AdsWrapper.onAdsResult(AdsHyAdXOpen.mAds, AdsWrapper.RESULT_CODE_REWARTVIDEO_FAIL, "");
                isvideoload = false;
                isRewardVideo = false;
            }

            //视频广告下载成功回调
            @Override
            public void onVideoDownloadSuccess(int code, String searchId) {
				LogD("onVideoDownloadSuccess: code=" + code + ", searchId=" + searchId);
            }

            //视频广告下载失败回调
            @Override
            public void onVideoDownloadFailed(int code, String searchId) {
				LogD("onVideoDownloadFailed: code=" + code + ", searchId=" + searchId);
            }

            //视频广告开始播放回调
            @Override
            public void onVideoPlayStart(int code, String searchId) {
				LogD("onVideoPlayStart: code=" + code + ", searchId=" + searchId);
            }

            //视频广告播放完成回调
            @Override
            public void onVideoPlayEnd(int code, String searchId) {
				LogD("onVideoPlayEnd: code=" + code + ", searchId=" + searchId);
            }
        });
        mRewardVideo.load();
    }

    private static void loadInLine(final Activity mContext) {
        //插屏广告
        if (inlineid != null && !"0".equalsIgnoreCase(inlineid) && isInit) {
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
                                    //PluginWrapper.mFramelayout.addView(view);
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
                showBannerAd(mContext, width, height);
                break;
            case AdsWrapper.ADS_TYPE_FULL_SCREEN:
                LogD("Now not support full screen view in Admob");
                break;
            case AdsWrapper.ADS_TYPE_INTER://插屏广告
                inlineid = adInfo.get("adId");
                showInLineAd(mContext);
                break;
            case AdsWrapper.ADS_TYPE_REWARTVIDEO://激励视频广告
                rewardvideoid = adInfo.get("adId");
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
                loadTTBanner(mContext);
                layout.setVisibility(View.VISIBLE);
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
                loadTTRewardVideo(mContext);
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

}
