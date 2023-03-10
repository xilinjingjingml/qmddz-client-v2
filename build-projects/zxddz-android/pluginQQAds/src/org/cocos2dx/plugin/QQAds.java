package org.cocos2dx.plugin;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Point;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.view.Display;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import com.androidquery.AQuery;
import com.androidquery.callback.AjaxStatus;
import com.androidquery.callback.BitmapAjaxCallback;
import com.qq.e.ads.cfg.VideoOption;
import com.qq.e.ads.interstitial2.UnifiedInterstitialAD;
import com.qq.e.ads.interstitial2.UnifiedInterstitialADListener;
import com.qq.e.ads.interstitial2.UnifiedInterstitialMediaListener;
import com.qq.e.ads.nativ.ADSize;
import com.qq.e.ads.nativ.MediaView;
import com.qq.e.ads.nativ.NativeADEventListener;
import com.qq.e.ads.nativ.NativeADMediaListener;
import com.qq.e.ads.nativ.NativeADUnifiedListener;
import com.qq.e.ads.nativ.NativeExpressAD;
import com.qq.e.ads.nativ.NativeExpressADView;
import com.qq.e.ads.nativ.NativeExpressMediaListener;
import com.qq.e.ads.nativ.NativeUnifiedAD;
import com.qq.e.ads.nativ.NativeUnifiedADData;
import com.qq.e.ads.nativ.widget.NativeAdContainer;
import com.qq.e.ads.rewardvideo.RewardVideoAD;
import com.qq.e.ads.rewardvideo.RewardVideoADListener;
import com.qq.e.comm.constants.AdPatternType;
import com.qq.e.comm.managers.GDTADManager;
import com.qq.e.comm.managers.status.SDKStatus;
import com.qq.e.comm.util.AdError;
import org.cocos2dx.config.MsgStringConfig;
import org.cocos2dx.libPluginQQAds.R;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Locale;
import static org.cocos2dx.plugin.PlatformWP.bannerContainer;
import static org.cocos2dx.plugin.PlatformWP.layout;
import static org.cocos2dx.plugin.PlatformWP.nativeView;
import static org.cocos2dx.plugin.PlatformWP.nativeContainer;

public class QQAds {

    private static final String LOG_TAG = "QQAds";
    private static boolean bDebug = true;
    private static boolean isInit = false;
    private static String bannerid = "";
    private static String rewardvideoid = "";
    private static String inlineid = "";
    private static String nativeid = "";
    private static NativeExpressAD nativeExpressAD = null;
    private static NativeExpressADView nativeExpressADView = null;
    private static UnifiedInterstitialAD mInLineAD = null;
    private static RewardVideoAD mRewardVideo = null;
    /////////////////////??????????????????/////////////////////
    public static View nativeUnifiedADView = null;
    private static NativeUnifiedADData mAdData = null;
    private static NativeUnifiedAD mAdManager = null;
    private static MediaView mMediaView = null;
    private static ImageView mImagePoster = null;
    private static RelativeLayout mADInfoContainer = null;
    private static TextView mDownloadText = null;
    private static AQuery mAQuery = null;
    private static NativeAdContainer mContainer = null;
    private static H mHandler = new H();
    private static final int MSG_INIT_AD = 0;
    private static final int MSG_VIDEO_START = 1;
    ////////////////////////////////////////////////////
    public static boolean isvideoload = false;
    public static boolean isRewardVideo = false;
    private static int bannerWidth = 300;
    private static int bannerHeight = 100;
    private static int screenscale = 3;
    private static int nativeSize = 5;//???1???2???3???4???5????????????5
    private static Hashtable<String, String> adsInfo = null;

    protected static void LogD(String msg) {
        if (bDebug) {
            Log.d(LOG_TAG, msg);
        }
    }

    public static void init(Context mContext) {
        if (!isInit) {
            ApplicationInfo info = null;
            String appid = "";
            try {
                info = mContext.getPackageManager().getApplicationInfo(
                        mContext.getPackageName(),
                        PackageManager.GET_META_DATA);
                if (info.metaData != null) {
                    appid = String.valueOf(info.metaData.get("qqads_appid"));
                    appid = appid.replaceAll("qqads_", "");
                    GDTADManager.getInstance().initWith(mContext, appid);
					BitmapAjaxCallback.setAgent("GDTMobSDK-AQuery-"+ SDKStatus.getIntegrationSDKVersion());
                    isInit = true;
                }
            } catch (PackageManager.NameNotFoundException e) {
                e.printStackTrace();
            }
        }
    }

    public static void InitBannerLayout(Activity mContext) {
        PlatformWP.getInstance().InitBannerLayout(mContext);
        if (nativeUnifiedADView == null)
        {
            nativeUnifiedADView = LayoutInflater.from(mContext).inflate(R.layout.activity_native_unified_ad, null);
            PluginWrapper.mFramelayout.addView(nativeUnifiedADView);
            nativeUnifiedADView.setVisibility(View.INVISIBLE);
            mMediaView = mContext.findViewById(R.id.gdt_media_view);
            mImagePoster = mContext.findViewById(R.id.img_poster);
            mADInfoContainer = mContext.findViewById(R.id.ad_info_container);
            mDownloadText = mContext.findViewById(R.id.btn_download);
            mDownloadText.setGravity(Gravity.CENTER);
            mContainer = mContext.findViewById(R.id.native_ad_container);
            mAQuery = new AQuery(mContext.findViewById(R.id.native_ad_container));
        }
    }

    public static void loadBanner(final Activity mContext) {
        //banner??????
        if (bannerid == null || "0".equalsIgnoreCase(bannerid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        //??????????????????
        nativeExpressAD = new NativeExpressAD(mContext,
                //new ADSize(bannerWidth, ADSize.AUTO_HEIGHT),
                new ADSize(327, 109),
                bannerid, new NativeExpressAD.NativeExpressADListener() {
            /**
             * ???????????????
             * */
            @Override
            public void onNoAD(AdError adError) {
                LogD("NativeExpressADListener onNoAD AdError code = " + adError.getErrorCode() +
                        ", msg = " + adError.getErrorMsg());
                adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
            }
            /**
             * ????????????
             * */
            @Override
            public void onADClicked(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onADClicked");
            }
            /**
             * ???????????????????????????
             * */
            @Override
            public void onADCloseOverlay(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onADCloseOverlay");
            }
            /**
             * ???????????????????????????????????????????????????????????????????????????????????????????????????????????????
             * */
            @Override
            public void onADClosed(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onADClosed");
                layout.setVisibility(View.INVISIBLE);
            }
            /**
             * ????????????
             * */
            @Override
            public void onADExposure(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onADExposure bannerwidth = " +
                        nativeExpressADView.getWidth() +
                        ", bannerheight = " + nativeExpressADView.getHeight());
            }
            /**
             * ??????????????????????????????????????? app ?????????
             * */
            @Override
            public void onADLeftApplication(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onADLeftApplication");
            }
            /**
             * ??????????????????????????????????????????????????????????????? NativeExpressADView???
             * ??????????????????????????????????????? NativeExpressADView ??? render ??????
             * */
            @Override
            public void onADLoaded(List<NativeExpressADView> adList) {
                LogD("NativeExpressADListener onADLoaded");
                if (nativeExpressADView != null) {
                    nativeExpressADView.destroy();
                }
                nativeExpressADView = adList.get(0);
                if (nativeExpressADView.getBoundData().getAdPatternType() != AdPatternType.NATIVE_VIDEO) {
                    bannerContainer.addView(nativeExpressADView);
                    nativeExpressADView.render();
                }
            }
            /**
             * ???????????????????????????
             * */
            @Override
            public void onADOpenOverlay(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onADOpenOverlay");
            }
            /**
             * NativeExpressADView ??????????????????
             * */
            @Override
            public void onRenderFail(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onRenderFail");
                adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
            }
            /**
             * NativeExpressADView ??????????????????
             * */
            @Override
            public void onRenderSuccess(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onRenderSuccess bannerwidth = " +
                        nativeExpressADView.getWidth() +
                        ", bannerheight = " + nativeExpressADView.getHeight());
                int bannerW = bannerWidth*screenscale;
                int bannerH = bannerHeight*screenscale;
                LogD("bannerW = " + bannerW);
                LogD("bannerH = " + bannerH);
                RelativeLayout.LayoutParams layoutParams = (RelativeLayout.LayoutParams) bannerContainer.getLayoutParams();
                Display display = mContext.getWindowManager().getDefaultDisplay();
                Point size = new Point();
                display.getRealSize(size);
                int screenWidth = size.x;
                int screenHeight = size.y;
                LogD("banner onRenderSuccess width-display :" + screenWidth);
                LogD("banner onRenderSuccess height-display :" + screenHeight);
                layoutParams.setMargins((screenWidth-bannerW)/2, screenHeight - bannerH, (screenWidth-bannerW)/2, 0);
                bannerContainer.setLayoutParams(layoutParams);

                String bw = String.valueOf(bannerW);
                String bh = String.valueOf(bannerH);
                adsInfo.put("bannerWidth", bw);
                adsInfo.put("bannerHeight", bh);
                adsResult(AdsWrapper.RESULT_CODE_BANNER_SUCCESS, MsgStringConfig.msgAdsSuccess);
            }
        });
        nativeExpressAD.loadAD(1);
        bannerContainer.removeAllViews();
        layout.setVisibility(View.VISIBLE);
    }

    public static void loadRewardVideo(final Activity mContext) {
        //??????????????????
        if (rewardvideoid == null || "0".equalsIgnoreCase(rewardvideoid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        mRewardVideo = new RewardVideoAD(mContext, rewardvideoid, new RewardVideoADListener(){
            /**
             * ???????????????????????????
             */
            @Override
            public void onADClick() {
                LogD("RewardVideoAD onADClick");
            }
            /**
             * ???????????????????????????
             */
            @Override
            public void onADClose() {
                LogD("RewardVideoAD onADClose");
                adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_CLOSE, MsgStringConfig.msgAdsClose);
            }
            /**
             * ????????????????????????
             */
            @Override
            public void onADExpose() {
                LogD("RewardVideoAD onADExpose");
            }
            /**
             * ?????????????????????????????????????????????????????????
             **/
            @Override
            public void onADLoad() {
                LogD("RewardVideoAD onADLoad");
                isvideoload = true;
                adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_LOAD_SUCCESS, MsgStringConfig.msgAdsLoadSuccess);
                mRewardVideo.showAD();
            }
            /**
             * ??????????????????????????????
             */
            @Override
            public void onADShow() {
                LogD("RewardVideoAD onADShow");
                isRewardVideo = true;
            }
            /**
             * ??????????????????
             */
            @Override
            public void onError(AdError adError) {
                LogD("RewardVideoAD onError error code=" + adError.getErrorCode() + ", error msg=" + adError.getErrorMsg());
                if (adError.getErrorCode() == 6000) {
                    adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_LOAD_FAIL, MsgStringConfig.msgAdsLoadFail);
                } else {
                    adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_FAIL, MsgStringConfig.msgAdsFail);
                }
                isvideoload = false;
                isRewardVideo = false;
            }
            /**
             * ????????????????????????????????????????????????????????????????????????????????????
             */
            @Override
            public void onReward() {
                LogD("RewardVideoAD onReward");
                adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_SUCCEES, MsgStringConfig.msgAdsSuccess);
                isvideoload = true;
                isRewardVideo = false;
            }
            /**
             * ???????????????????????????????????????????????????????????????
             */
            @Override
            public void onVideoCached() {
                LogD("RewardVideoAD onVideoCached");
            }
            /**
             * ????????????????????????
             */
            @Override
            public void onVideoComplete() {
                LogD("RewardVideoAD onVideoComplete");
            }
        });
        //????????????????????????????????????????????????load
        mRewardVideo.loadAD();
    }

    private static void loadInLine(Activity mContext) {
        //????????????
        if (inlineid == null || "0".equalsIgnoreCase(inlineid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_INTER_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        if (mInLineAD == null) {
            mInLineAD = new UnifiedInterstitialAD(mContext, inlineid, new UnifiedInterstitialADListener() {
                /**
                 * ??????2.0?????????????????????
                 * */
                @Override
                public void onADClicked() {
                    LogD("UnifiedInterstitialAD onADClicked");
                }
                /**
                 * ??????2.0?????????????????????
                 * */
                @Override
                public void onADClosed() {
                    LogD("UnifiedInterstitialAD onADClosed");
                    adsResult(AdsWrapper.RESULT_CODE_INTER_CLOSE, MsgStringConfig.msgAdsClose);
                }
                /**
                 * ??????2.0?????????????????????
                 * */
                @Override
                public void onADExposure() {
                    LogD("UnifiedInterstitialAD onADExposure");
                }
                /**
                 * ??????2.0?????????????????????????????????
                 * */
                @Override
                public void onADLeftApplication() {
                    LogD("UnifiedInterstitialAD onADLeftApplication");
                }
                /**
                 * ??????2.0?????????????????????
                 * */
                @Override
                public void onADOpened() {
                    LogD("UnifiedInterstitialAD onADOpened");
                    adsResult(AdsWrapper.RESULT_CODE_INTER_SUCCEES, MsgStringConfig.msgAdsSuccess);
                }
                /**
                 * ??????2.0???????????????????????????????????????????????? show ??????
                 * */
                @Override
                public void onADReceive() {
                    LogD("UnifiedInterstitialAD onADReceive");
                    if (mInLineAD.getAdPatternType() == AdPatternType.NATIVE_VIDEO) {
                        mInLineAD.setMediaListener(new UnifiedInterstitialMediaListener() {
                            /**
                             * ??????????????????????????????????????????????????????????????????
                             * */
                            @Override
                            public void onVideoComplete() {
                                LogD("UnifiedInterstitialMediaListener onVideoComplete");
                            }
                            /**
                             * ??????????????????????????????error ???????????????????????????????????????
                             * */
                            @Override
                            public void onVideoError(AdError adError) {
                                LogD("UnifiedInterstitialMediaListener onVideoError error code=" +
                                        adError.getErrorCode() +
                                        ", error msg=" + adError.getErrorMsg());
                                adsResult(AdsWrapper.RESULT_CODE_INTER_FAIL, MsgStringConfig.msgAdsFail);
                            }
                            /**
                             * ???????????? View ???????????????
                             * */
                            @Override
                            public void onVideoInit() {
                                LogD("UnifiedInterstitialMediaListener onVideoInit");
                            }
                            /**
                             * ???????????????
                             * */
                            @Override
                            public void onVideoLoading() {
                                LogD("UnifiedInterstitialMediaListener onVideoLoading");
                            }
                            /**
                             * ?????????????????????
                             * */
                            @Override
                            public void onVideoPageClose() {
                                LogD("UnifiedInterstitialMediaListener onVideoPageClose");
                                adsResult(AdsWrapper.RESULT_CODE_INTER_CLOSE, MsgStringConfig.msgAdsClose);
                            }
                            /**
                             * ?????????????????????
                             * */
                            @Override
                            public void onVideoPageOpen() {
                                LogD("UnifiedInterstitialMediaListener onVideoPageOpen");
                            }
                            /**
                             * ????????????
                             * */
                            @Override
                            public void onVideoPause() {
                                LogD("UnifiedInterstitialMediaListener onVideoPause");
                            }
                            /**
                             * ?????????????????????????????????????????????????????????
                             * videoDuration ?????????????????????????????????????????? ms
                             * */
                            @Override
                            public void onVideoReady(long videoDuration) {
                                LogD("UnifiedInterstitialMediaListener onVideoReady videoDuration=" + videoDuration);
                                adsResult(AdsWrapper.RESULT_CODE_INTER_SUCCEES, MsgStringConfig.msgAdsSuccess);
                            }
                            /**
                             * ??????????????????
                             * */
                            @Override
                            public void onVideoStart() {
                                LogD("UnifiedInterstitialMediaListener onVideoStart");
                            }
                        });
                        mInLineAD.showAsPopupWindow();
                    } else {
                        mInLineAD.show();
                    }
                }
                /**
                 * ?????????????????????error ???????????????????????????????????????
                 * */
                @Override
                public void onNoAD(AdError adError) {
                    LogD("UnifiedInterstitialAD onNoAD, error code=" +
                            adError.getErrorCode() +
                            ", error msg=" +
                            adError.getErrorMsg());
                    adsResult(AdsWrapper.RESULT_CODE_INTER_FAIL, MsgStringConfig.msgAdsFail);
                }
                /**
                 * ??????2.0???????????????????????????????????????
                 * */
                @Override
                public void onVideoCached() {
                    LogD("UnifiedInterstitialAD onVideoCached");
                }
            });
        }
        mInLineAD.setVideoPlayPolicy(VideoOption.VideoPlayPolicy.AUTO);
        mInLineAD.loadAD();
    }

    private static void loadNative(final Activity mContext) {
        //?????????????????????
        if (nativeid == null || "0".equalsIgnoreCase(nativeid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        nativeExpressAD = new NativeExpressAD(mContext,
                //new ADSize(340, ADSize.AUTO_HEIGHT),
                new ADSize(375, 284),
                nativeid, new NativeExpressAD.NativeExpressADListener() {
            /**
             * ???????????????
             * */
            @Override
            public void onNoAD(AdError adError) {
                LogD("?????????????????????NativeExpressADListener onNoAD AdError code = " + adError.getErrorCode() +
                        ", msg = " + adError.getErrorMsg());
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            }
            /**
             * ????????????
             * */
            @Override
            public void onADClicked(NativeExpressADView adView) {
                LogD("?????????????????????NativeExpressADListener onADClicked");
            }
            /**
             * ???????????????????????????
             * */
            @Override
            public void onADCloseOverlay(NativeExpressADView adView) {
                LogD("?????????????????????NativeExpressADListener onADCloseOverlay");
            }
            /**
             * ???????????????????????????????????????????????????????????????????????????????????????????????????????????????
             * */
            @Override
            public void onADClosed(NativeExpressADView adView) {
                LogD("?????????????????????NativeExpressADListener onADClosed");
                nativeContainer.removeAllViews();
                nativeView.setVisibility(View.INVISIBLE);
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_CLOSE, MsgStringConfig.msgAdsClose);
            }
            /**
             * ????????????
             * */
            @Override
            public void onADExposure(NativeExpressADView adView) {
                LogD("?????????????????????NativeExpressADListener onADExposure nativewidth = " +
                        adView.getWidth() +
                        ", nativeheight = " + adView.getHeight());
                if (nativeExpressADView.getBoundData().getAdPatternType() != AdPatternType.NATIVE_VIDEO) {
                    int nativeW = adView.getWidth();//340*screenscale;
                    int nativeH = adView.getHeight();//236*screenscale;
                    RelativeLayout.LayoutParams layoutParams = (RelativeLayout.LayoutParams)nativeContainer.getLayoutParams();
                    Display display = mContext.getWindowManager().getDefaultDisplay();
                    Point size = new Point();
                    display.getRealSize(size);
                    int screenWidth = size.x;
                    int screenHeight = size.y;
                    LogD("?????????????????????NativeExpressADListener onADExposure width-display :" + screenWidth);
                    LogD("?????????????????????NativeExpressADListener onADExposure height-display :" + screenHeight);
                    String nw = "";
                    String nh = "";
                    if (nativeSize == 5) {//????????????
                        LogD("????????????????????? ????????????");
                        layoutParams.setMargins((screenWidth-nativeW)/2, (screenHeight-nativeH)/2, (screenWidth-nativeW)/2, (screenHeight-nativeH)/2);
                        nw = String.valueOf(nativeW);
                        nh = String.valueOf(nativeH);
                    } else if (nativeSize == 4) {//???????????????
                        LogD("????????????????????? ???????????????");
                        layoutParams.setMargins(screenWidth-nativeW-10, (screenHeight-nativeH)/2, 10, (screenHeight-nativeH)/2);
                        nw = String.valueOf(nativeW);
                        nh = String.valueOf(nativeH);
                    } else if (nativeSize == 3) {//???????????????
                        LogD("????????????????????? ???????????????");
                        layoutParams.setMargins(10, (screenHeight-nativeH)/2, screenWidth-nativeW-10, (screenHeight-nativeH)/2);
                        nw = String.valueOf(nativeW);
                        nh = String.valueOf(nativeH);
                    } else if (nativeSize == 2) {//???????????????
                        LogD("????????????????????? ???????????????");
                        layoutParams.setMargins((screenWidth-nativeW)/2, screenHeight-nativeH-60, (screenWidth-nativeW)/2, 60);
                        nw = String.valueOf(nativeW);
                        nh = String.valueOf(nativeH+60);
                    } else if (nativeSize == 1) {//???????????????
                        LogD("????????????????????? ???????????????");
                        layoutParams.setMargins((screenWidth-nativeW)/2, 60, (screenWidth-nativeW)/2, screenHeight-nativeH-60);
                        nw = String.valueOf(nativeW);
                        nh = String.valueOf(nativeH+60);
                    }
                    nativeContainer.setLayoutParams(layoutParams);
                    adsInfo.put("nativeWidth", nw);
                    adsInfo.put("nativeHeight", nh);
                    adsResult(AdsWrapper.RESULT_CODE_NATIVE_SUCCESS, MsgStringConfig.msgAdsSuccess);
                }
            }
            /**
             * ??????????????????????????????????????? app ?????????
             * */
            @Override
            public void onADLeftApplication(NativeExpressADView adView) {
                LogD("?????????????????????NativeExpressADListener onADLeftApplication");
            }
            /**
             * ??????????????????????????????????????????????????????????????? NativeExpressADView???
             * ??????????????????????????????????????? NativeExpressADView ??? render ??????
             * */
            @Override
            public void onADLoaded(List<NativeExpressADView> adList) {
                LogD("?????????????????????NativeExpressADListener onADLoaded");
                if (nativeExpressADView != null) {
                    nativeExpressADView.destroy();
                }
                nativeContainer.removeAllViews();
                nativeView.setVisibility(View.VISIBLE);
                nativeExpressADView = adList.get(0);
                if (nativeExpressADView.getBoundData().getAdPatternType() == AdPatternType.NATIVE_VIDEO) {
                    LogD("????????????????????? ??????");
                    nativeExpressADView.setMediaListener(new NativeExpressMediaListener() {
                        /**
                         *??????????????????
                         * */
                        @Override
                        public void onVideoCached(NativeExpressADView adView) {
                            LogD("?????????????????????NativeExpressMediaListener onVideoCached");
                        }
                        /**
                         *??????????????????
                         * */
                        @Override
                        public void onVideoComplete(NativeExpressADView adView) {
                            LogD("?????????????????????NativeExpressMediaListener onVideoComplete");
                        }
                        /**
                         *???????????????????????????
                         * */
                        @Override
                        public void onVideoError(NativeExpressADView adView, AdError adError) {
                            LogD("?????????????????????NativeExpressMediaListener onVideoError code = " + adError.getErrorCode()
                                    + ", msg = " + adError.getErrorMsg());
                            adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
                        }
                        /**
                         *???????????? View ???????????????
                         * */
                        @Override
                        public void onVideoInit(NativeExpressADView adView) {
                            LogD("?????????????????????NativeExpressMediaListener onVideoInit");
                        }
                        /**
                         *???????????????
                         * */
                        @Override
                        public void onVideoLoading(NativeExpressADView adView) {
                            LogD("?????????????????????NativeExpressMediaListener onVideoLoading");
                        }
                        /**
                         *?????????????????????
                         * */
                        @Override
                        public void onVideoPageClose(NativeExpressADView adView) {
                            LogD("?????????????????????NativeExpressMediaListener onVideoPageClose");
                            adsResult(AdsWrapper.RESULT_CODE_NATIVE_CLOSE, MsgStringConfig.msgAdsClose);
                        }
                        /**
                         *?????????????????????
                         * */
                        @Override
                        public void onVideoPageOpen(NativeExpressADView adView) {
                            LogD("?????????????????????NativeExpressMediaListener onVideoPageOpen");
                        }
                        /**
                         *????????????
                         * */
                        @Override
                        public void onVideoPause(NativeExpressADView adView) {
                            LogD("?????????????????????NativeExpressMediaListener onVideoPause");
                        }
                        /**
                         *?????????????????????????????????????????????????????????
                         * */
                        @Override
                        public void onVideoReady(NativeExpressADView adView, long l) {
                            LogD("?????????????????????NativeExpressMediaListener onVideoReady");
                        }
                        /**
                         *??????????????????
                         * */
                        @Override
                        public void onVideoStart(NativeExpressADView adView) {
                            LogD("?????????????????????NativeExpressMediaListener onVideoStart nativewidth = " +
                                    adView.getWidth() +
                                    ", nativeheight = " + adView.getHeight());
                            int nativeW = adView.getWidth();
                            int nativeH = adView.getHeight();
                            RelativeLayout.LayoutParams layoutParams = (RelativeLayout.LayoutParams)nativeContainer.getLayoutParams();
                            Display display = mContext.getWindowManager().getDefaultDisplay();
                            Point size = new Point();
                            display.getRealSize(size);
                            int screenWidth = size.x;
                            int screenHeight = size.y;
                            LogD("?????????????????????NativeExpressMediaListener onVideoStart width-display :" + screenWidth);
                            LogD("?????????????????????NativeExpressMediaListener onVideoStart height-display :" + screenHeight);
                            String nw = "";
                            String nh = "";
                            if (nativeSize == 5) {//????????????
                                LogD("????????????????????? ????????????");
                                layoutParams.setMargins((screenWidth-nativeW)/2, (screenHeight-nativeH)/2, (screenWidth-nativeW)/2, (screenHeight-nativeH)/2);
                                nw = String.valueOf(nativeW);
                                nh = String.valueOf(nativeH);
                            } else if (nativeSize == 4) {//???????????????
                                LogD("????????????????????? ???????????????");
                                layoutParams.setMargins(screenWidth-nativeW-10, (screenHeight-nativeH)/2, 10, (screenHeight-nativeH)/2);
                                nw = String.valueOf(nativeW);
                                nh = String.valueOf(nativeH);
                            } else if (nativeSize == 3) {//???????????????
                                LogD("????????????????????? ???????????????");
                                layoutParams.setMargins(10, (screenHeight-nativeH)/2, screenWidth-nativeW-10, (screenHeight-nativeH)/2);
                                nw = String.valueOf(nativeW);
                                nh = String.valueOf(nativeH);
                            } else if (nativeSize == 2) {//???????????????
                                LogD("????????????????????? ???????????????");
                                layoutParams.setMargins((screenWidth-nativeW)/2, screenHeight-nativeH-60, (screenWidth-nativeW)/2, 60);
                                nw = String.valueOf(nativeW);
                                nh = String.valueOf(nativeH+60);
                            } else if (nativeSize == 1) {//???????????????
                                LogD("????????????????????? ???????????????");
                                layoutParams.setMargins((screenWidth-nativeW)/2, 60, (screenWidth-nativeW)/2, screenHeight-nativeH-60);
                                nw = String.valueOf(nativeW);
                                nh = String.valueOf(nativeH+60);
                            }
                            nativeContainer.setLayoutParams(layoutParams);
                            adsInfo.put("nativeWidth", nw);
                            adsInfo.put("nativeHeight", nh);
                            adsResult(AdsWrapper.RESULT_CODE_NATIVE_SUCCESS, MsgStringConfig.msgAdsSuccess);
                        }
                    });
                }
                nativeExpressADView.render();
            }
            /**
             * ???????????????????????????
             * */
            @Override
            public void onADOpenOverlay(NativeExpressADView adView) {
                LogD("?????????????????????NativeExpressADListener onADOpenOverlay");
            }
            /**
             * NativeExpressADView ??????????????????
             * */
            @Override
            public void onRenderFail(NativeExpressADView adView) {
                LogD("?????????????????????NativeExpressADListener onRenderFail");
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            }
            /**
             * NativeExpressADView ??????????????????
             * */
            @Override
            public void onRenderSuccess(NativeExpressADView adView) {
                LogD("?????????????????????NativeExpressADListener onRenderSuccess nativewidth = " +
                        adView.getWidth() +
                        ", nativeheight = " + adView.getHeight());
                nativeContainer.addView(nativeExpressADView);
            }
        });
        nativeExpressAD.setVideoPlayPolicy(VideoOption.VideoPlayPolicy.AUTO);
        nativeExpressAD.loadAD(1);
    }

    /**
     * ????????????????????????2.0
     * */
    public static void loadNativeUnified(final Activity mContext) {
        //????????????????????????2.0
        if (nativeid == null || "0".equalsIgnoreCase(nativeid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        if (mAdData != null) {
            mAdData.destroy();
        }
        mAdManager = new NativeUnifiedAD(mContext, nativeid, new NativeADUnifiedListener() {

            @Override
            public void onNoAD(AdError adError) {
                LogD("?????????????????? NativeADUnifiedListener onNoAD ????????????????????????");
                LogD("?????????????????? onNoAd error code: " + adError.getErrorCode()
                        + ", error msg: " + adError.getErrorMsg());
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onADLoaded(List<NativeUnifiedADData> ads) {
                LogD("?????????????????? NativeADUnifiedListener onADLoaded ????????????????????????");
                if (ads != null && ads.size() > 0) {
                    Message msg = Message.obtain();
                    msg.what = MSG_INIT_AD;
                    mAdData = ads.get(0);
                    msg.obj = mAdData;
                    mHandler.sendMessage(msg);
                }
            }
        });
        /**
         * ??????????????????????????????????????????????????????????????????????????????<p/>
         *
         * "????????????"????????????????????????????????????SDK??????????????????????????????????????????AutoPlayPolicy??????????????????????????? <br/>
         *
         * ????????????????????????VideoOption.AutoPlayPolicy.NEVER??????????????????????????? <br/>
         * ?????????????????????(?????????10???)????????????????????????startVideo?????????????????????????????????????????????????????????
         */
        mAdManager.setVideoPlayPolicy(VideoOption.VideoPlayPolicy.AUTO); // ?????????????????????????????????????????????????????????????????????
        /**
         * ?????????????????????????????????sdk?????????????????????????????????????????? <p/>
         * ???????????????VideoADContainerRender.SDK VideoADContainerRender.DEV????????????
         */
        // ???????????????????????????????????????????????????SDK?????????
        mAdManager.setVideoADContainerRender(VideoOption.VideoADContainerRender.SDK);
        mAdManager.loadData(1);
    }
    private static class H extends Handler {
        public H() {
            super();
        }

        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case MSG_INIT_AD:
                    NativeUnifiedADData ad = (NativeUnifiedADData) msg.obj;
                    LogD(String.format(Locale.getDefault(), "?????????????????? (pic_width,pic_height) = (%d , %d)", ad
                                    .getPictureWidth(),
                            ad.getPictureHeight()));
                    initAd(AdsQQAds.mContext, ad);
                    LogD("?????????????????? eCPMLevel = " + ad.getECPMLevel() + " , " +
                            "videoDuration = " + ad.getVideoDuration());
                    nativeUnifiedADView.setVisibility(View.VISIBLE);
                    mContainer.setVisibility(View.VISIBLE);
                    break;
                case MSG_VIDEO_START:
                    LogD("?????????????????? handleMessage MSG_VIDEO_START");
                    mImagePoster.setVisibility(View.GONE);
                    mMediaView.setVisibility(View.VISIBLE);
                    break;
            }
        }
    }
    private static void initAd(final Activity mContext, final NativeUnifiedADData ad) {
        renderAdUi(ad);
        //?????????????????????App???????????????????????????
        List<View> clickableViews = new ArrayList<>();
        List<View> customClickableViews = new ArrayList<>();
        customClickableViews.add(mADInfoContainer);
        //??????customClickableViews??????????????????????????????????????????????????????????????????????????????????????????????????????
        ad.bindAdToView(mContext, mContainer, null, clickableViews, customClickableViews);
        ad.setNativeAdEventListener(new NativeADEventListener() {
            @Override
            public void onADExposed() {
                LogD("?????????????????? ????????????????????? onADExposed: ");
                LogD("?????????????????? mADInfoContainer.width: " + mADInfoContainer.getWidth());
                LogD("?????????????????? mADInfoContainer.height: " + mADInfoContainer.getHeight());
                LogD("?????????????????? mMediaView.width: " + mMediaView.getWidth());
                LogD("?????????????????? mMediaView.height: " + mMediaView.getHeight());
                LogD("?????????????????? mContainer.width: " + mContainer.getWidth());
                LogD("?????????????????? mContainer.height: " + mContainer.getHeight());
                int nativeW = mContainer.getWidth();//340*screenscale;
                int nativeH = mContainer.getHeight();//236*screenscale;
                RelativeLayout.LayoutParams layoutParams = (RelativeLayout.LayoutParams)mContainer.getLayoutParams();
                Display display = mContext.getWindowManager().getDefaultDisplay();
                Point size = new Point();
                display.getRealSize(size);
                int screenWidth = size.x;
                int screenHeight = size.y;
                LogD("?????????????????? NativeADEventListener onADExposed width-display :" + screenWidth);
                LogD("?????????????????? NativeADEventListener onADExposed height-display :" + screenHeight);
                String nw = "";
                String nh = "";
                if (nativeSize == 5) {//????????????
                    LogD("?????????????????? ????????????");
                    layoutParams.setMargins((screenWidth-nativeW)/2, (screenHeight-nativeH)/2, (screenWidth-nativeW)/2, (screenHeight-nativeH)/2);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH);
                } else if (nativeSize == 4) {//???????????????
                    LogD("?????????????????? ???????????????");
                    layoutParams.setMargins(screenWidth-nativeW-10, (screenHeight-nativeH)/2, 10, (screenHeight-nativeH)/2);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH);
                } else if (nativeSize == 3) {//???????????????
                    LogD("?????????????????? ???????????????");
                    layoutParams.setMargins(10, (screenHeight-nativeH)/2, screenWidth-nativeW-10, (screenHeight-nativeH)/2);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH);
                } else if (nativeSize == 2) {//???????????????
                    LogD("?????????????????? ???????????????");
                    layoutParams.setMargins((screenWidth-nativeW)/2, screenHeight-nativeH-60, (screenWidth-nativeW)/2, 60);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH+60);
                } else if (nativeSize == 1) {//???????????????
                    LogD("?????????????????? ???????????????");
                    layoutParams.setMargins((screenWidth-nativeW)/2, 60, (screenWidth-nativeW)/2, screenHeight-nativeH-60);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH+60);
                }
                mContainer.setLayoutParams(layoutParams);
                adsInfo.put("nativeWidth", nw);
                adsInfo.put("nativeHeight", nh);
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_SUCCESS, MsgStringConfig.msgAdsSuccess);
            }

            @Override
            public void onADClicked() {
                LogD("?????????????????? ????????????????????? onADClicked: " + " clickUrl: " + ad.ext.get("clickUrl"));
            }

            @Override
            public void onADError(AdError error) {
                LogD("?????????????????? ???????????? onADError error code :" + error.getErrorCode()
                        + "  error msg: " + error.getErrorMsg());
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onADStatusChanged() {
                LogD("?????????????????? apk?????????????????????????????? onADStatusChanged: ");
                updateAdAction(mDownloadText, ad);
            }
        });
        if (ad.getAdPatternType() == AdPatternType.NATIVE_VIDEO) {
            mHandler.sendEmptyMessage(MSG_VIDEO_START);
            VideoOption videoOption = getVideoOption(mContext.getIntent());
            ad.bindMediaView(mMediaView, videoOption, new NativeADMediaListener() {
                @Override
                public void onVideoInit() {
                    LogD("?????????????????? ????????????????????? onVideoInit: ");
                }

                @Override
                public void onVideoLoading() {
                    LogD("?????????????????? ?????????????????? onVideoLoading: ");
                }

                @Override
                public void onVideoReady() {
                    LogD("?????????????????? ???????????????????????? onVideoReady");
                }

                @Override
                public void onVideoLoaded(int videoDuration) {
                    LogD("?????????????????? ?????????????????? onVideoLoaded: ???????????? = " + videoDuration);
                }

                @Override
                public void onVideoStart() {
                    LogD("?????????????????? ?????????????????? onVideoStart");
                }

                @Override
                public void onVideoPause() {
                    LogD("?????????????????? ???????????? onVideoPause: ");
                }

                @Override
                public void onVideoResume() {
                    LogD("?????????????????? ?????????????????? onVideoResume: ");
                }

                @Override
                public void onVideoCompleted() {
                    LogD("?????????????????? ?????????????????? onVideoCompleted: ");
                }

                @Override
                public void onVideoError(AdError error) {
                    LogD("?????????????????? ?????????????????? onVideoError: ");
                    adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
                }

                @Override
                public void onVideoStop() {
                    LogD("?????????????????? ?????????????????? onVideoStop");
                }

                @Override
                public void onVideoClicked() {
                    LogD("?????????????????? onVideoClicked");
                }
            });
        }
        updateAdAction(mDownloadText, ad);
    }
    private static void renderAdUi(NativeUnifiedADData ad) {
        int patternType = ad.getAdPatternType();
        if (patternType == AdPatternType.NATIVE_VIDEO) {
            LogD("?????????????????? renderAdUi");
            mAQuery.id(R.id.img_logo).image(ad.getIconUrl(), false, true);
            mAQuery.id(R.id.img_poster).image(ad.getImgUrl(), false, true, 0, 0,
                    new BitmapAjaxCallback() {
                        @Override
                        protected void callback(String url, ImageView iv, Bitmap bm, AjaxStatus status) {
                            if (iv.getVisibility() == View.VISIBLE) {
                                iv.setImageBitmap(bm);
                            }
                        }
                    });
            mAQuery.id(R.id.text_title).text(ad.getTitle());
            mAQuery.id(R.id.text_desc).text(ad.getDesc());
        }
    }
    private static void updateAdAction(TextView button, NativeUnifiedADData ad) {
        if (!ad.isAppAd()) {
            button.setText("????????????");
            return;
        }
        switch (ad.getAppStatus()) {
            case 0:
                button.setText("????????????");
                break;
            case 1:
                button.setText("????????????");
                break;
            case 2:
                button.setText("????????????");
                break;
            case 4:
                button.setText("?????????: "+ad.getProgress() + "%");
                break;
            case 8:
                button.setText("????????????");
                break;
            case 16:
                button.setText("????????????");
                break;
            default:
                button.setText("????????????");
                break;
        }
    }
    public static VideoOption getVideoOption(Intent intent) {
        if(intent == null){
            return null;
        }
        VideoOption videoOption = null;
        VideoOption.Builder builder = new VideoOption.Builder();
        builder.setAutoPlayPolicy(1);
        builder.setAutoPlayMuted(intent.getBooleanExtra("mute", true));
        builder.setDetailPageMuted(intent.getBooleanExtra("detail_page_muted",false));
        builder.setNeedCoverImage(intent.getBooleanExtra("need_cover", true));
        builder.setNeedProgressBar(intent.getBooleanExtra("need_progress", true));
        builder.setEnableDetailPage(intent.getBooleanExtra("enable_detail_page", true));
        builder.setEnableUserControl(intent.getBooleanExtra("enable_user_control", false));
        videoOption = builder.build();
        return videoOption;
    }

    public static void showAds(Activity mContext, Hashtable<String, String> adInfo) {
        if (adsInfo != null){
            if (!adsInfo.isEmpty()){
                adsInfo.clear();
            }
        }
        adsInfo = new Hashtable<String, String>(adInfo);
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
            case AdsWrapper.ADS_TYPE_INTER://????????????
                inlineid = adInfo.get("adId");
                showInLineAd(mContext);
                break;
            case AdsWrapper.ADS_TYPE_REWARTVIDEO://??????????????????
                rewardvideoid = adInfo.get("adId");
                showRewardVideoAd(mContext);
                break;
            case AdsWrapper.ADS_TYPE_NATIVE://?????????????????????
                nativeid = adInfo.get("adId");
                String adSize = adInfo.get("adSize");
                if (adSize != null && !"".equalsIgnoreCase(adSize)) {
                    nativeSize = Integer.valueOf(adSize);
                }
                showNativeAd(mContext);
                break;
            case AdsWrapper.ADS_TYPE_NATIVEUNIFIED://??????????????????????????????
                nativeid = adInfo.get("adId");
                String adsize = adInfo.get("adSize");
                if (adsize != null && !"".equalsIgnoreCase(adsize)) {
                    nativeSize = Integer.valueOf(adsize);
                }
                showNativeUnifiedAd(mContext);
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
            case AdsWrapper.ADS_TYPE_NATIVE://?????????????????????
                hideNativeAd();
                break;
            case AdsWrapper.ADS_TYPE_NATIVEUNIFIED://??????????????????????????????
                hideNativeUnifiedAd();
                break;
            case AdsWrapper.ADS_TYPE_FULL_SCREEN:
            case AdsWrapper.ADS_TYPE_INTER://????????????
            case AdsWrapper.ADS_TYPE_REWARTVIDEO://??????????????????
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

    public static void hideNativeAd() {
        PluginWrapper.runOnMainThread(new Runnable() {

            @Override
            public void run() {
                if (nativeView.getVisibility() == View.VISIBLE) {
                    nativeContainer.removeAllViews();
                    nativeView.setVisibility(View.INVISIBLE);
                    adsResult(AdsWrapper.RESULT_CODE_NATIVE_CLOSE, MsgStringConfig.msgAdsClose);
                }
            }
        });
    }

    public static void hideNativeUnifiedAd() {
        PluginWrapper.runOnMainThread(new Runnable() {

            @Override
            public void run() {
                if (mContainer.getVisibility() == View.VISIBLE) {
                    nativeUnifiedADView.setVisibility(View.INVISIBLE);
                    mContainer.setVisibility(View.INVISIBLE);
                    adsResult(AdsWrapper.RESULT_CODE_NATIVE_CLOSE, MsgStringConfig.msgAdsClose);
                }
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

    public static void showNativeAd(final Activity mContext) {
        PluginWrapper.runOnMainThread(new Runnable() {

            @Override
            public void run() {
                loadNative(mContext);
            }
        });
    }

    public static void showNativeUnifiedAd(final Activity mContext) {
        PluginWrapper.runOnMainThread(new Runnable() {

            @Override
            public void run() {
                loadNativeUnified(mContext);
            }
        });
    }

    public static void onResume() {
        if (mAdData != null) {
            mAdData.resume();
        }
    }
    public static void onPause() {

    }
    public static void onDestroy() {
        if (nativeExpressADView != null) {
            nativeExpressADView.destroy();
            nativeExpressADView = null;
        }
        if (mInLineAD != null) {
            mInLineAD.destroy();
            mInLineAD = null;
        }
        if (mAdData != null) {
            mAdData.destroy();
            mAdData = null;
        }
    }

    public static String getSDKVersion() {
        return SDKStatus.getIntegrationSDKVersion();
    }

    public static void adsResult(int ret, String msg)
    {
        AdsWrapper.setAdsJson(adsInfo);
        AdsWrapper.onAdsResult(AdsQQAds.mQQAds, ret, msg);
    }

}
