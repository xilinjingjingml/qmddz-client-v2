package org.cocos2dx.plugin;

import android.app.Activity;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Point;
import android.util.Log;
import android.view.Display;
import android.view.View;
import android.widget.RelativeLayout;
import com.bytedance.sdk.openadsdk.AdSlot;
import com.bytedance.sdk.openadsdk.TTAdConfig;
import com.bytedance.sdk.openadsdk.TTAdConstant;
import com.bytedance.sdk.openadsdk.TTAdDislike;
import com.bytedance.sdk.openadsdk.TTAdNative;
import com.bytedance.sdk.openadsdk.TTAdSdk;
import com.bytedance.sdk.openadsdk.TTAppDownloadListener;
import com.bytedance.sdk.openadsdk.TTCustomController;
import com.bytedance.sdk.openadsdk.TTNativeExpressAd;
import com.bytedance.sdk.openadsdk.TTRewardVideoAd;
import org.cocos2dx.config.MsgStringConfig;
import java.util.Hashtable;
import java.util.List;
import static org.cocos2dx.plugin.PlatformWP.bannerContainer;
import static org.cocos2dx.plugin.PlatformWP.layout;
import static org.cocos2dx.plugin.PlatformWP.nativeView;
import static org.cocos2dx.plugin.PlatformWP.nativeContainer;

public class TTAds {

    private static final String LOG_TAG = "TTAds";
    private static boolean bDebug = true;
    private static boolean isInit = false;
    private static String appid = "";
    private static String appname = "";
    private static String bannerid = "";
    private static String rewardvideoid = "";
    private static String inlineid = "";
    private static String nativeid = "";
    private static TTAdNative mTTAdNative = null;
    private static TTNativeExpressAd mTTAd = null;
    private static TTRewardVideoAd mRewardVideo = null;
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

    public static void init(Context context) {
        if (!isInit) {
            ApplicationInfo info = null;
            try {
                PackageManager packageManager = context.getPackageManager();
                info = packageManager.getApplicationInfo(
                        context.getPackageName(),
                        PackageManager.GET_META_DATA);
                if (info.metaData != null) {
                    appid = String.valueOf(info.metaData.get("TTAdsAppId"));
                    appid = appid.replaceAll("ttads_", "");//5113744
                }

                PackageInfo packageInfo = packageManager.getPackageInfo(
                        context.getPackageName(), 0);
                int labelRes = packageInfo.applicationInfo.labelRes;
                appname = context.getResources().getString(labelRes);
            } catch (PackageManager.NameNotFoundException e) {
                e.printStackTrace();
            }
            //TTAdSdk.getAdManager().requestPermissionIfNecessary(context);
            TTAdSdk.init(context, buildConfig());
            mTTAdNative = TTAdSdk.getAdManager().createAdNative(context);
            isInit = true;
        }
    }

    private static TTAdConfig buildConfig() {
        return new TTAdConfig.Builder()
                .appId(appid)//appid
                .useTextureView(true) //??????TextureView??????????????????,?????????SurfaceView,??????SurfaceView??????????????????????????????TextureView
                .appName(appname)
                .titleBarTheme(TTAdConstant.TITLE_BAR_THEME_DARK)// ????????????????????????????????????????????????TTAdConstant#TITLE_BAR_THEME_LIGHT
                .allowShowNotify(true) // ?????????????????????????????????SDK???????????????true?????????false??????????????????true??????
                .debug(false) // ???????????????????????????debug?????????????????????true?????????false???????????????false??????
                .directDownloadNetworkType(TTAdConstant.NETWORK_STATE_WIFI, TTAdConstant.NETWORK_STATE_3G) //???????????????????????????????????????
                .supportMultiProcess(false)//?????????????????????????????????????????????true?????????false?????????????????????false?????????
                .needClearTaskReset()
                //.httpStack(new MyOkStack3())//?????????????????????demo????????????okhttp3??????????????????????????????????????????????????????????????????
                //????????????????????????
//                .customController(new TTCustomController() {
//                    @Override
//                    public boolean isCanUseLocation() {
//                        return false;
//                    }
//                })
                .build();
    }

    public static void InitBannerLayout(Activity mContext) {
        PlatformWP.getInstance().InitBannerLayout(mContext);
    }

    public static void loadBanner(final Activity mContext) {
        //banner??????
        if (bannerid == null || "0".equalsIgnoreCase(bannerid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        //????????????????????????AdSlot
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId(bannerid)//?????????id
                .setSupportDeepLink(true)
                .setExpressViewAcceptedSize(327, 109)//??????????????????view???size,??????dp
                .setAdCount(3)//?????????????????????1???3???
                .build();
        mTTAdNative.loadBannerExpressAd(adSlot, new TTAdNative.NativeExpressAdListener() {

            @Override
            public void onError(int code, String message) {
                LogD("loadBannerExpressAd onError: code=" + code + ", message=" + message);
                adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onNativeExpressAdLoad(List<TTNativeExpressAd> list) {
                if (list == null || list.size() == 0) {
                    LogD("loadBannerExpressAd onNativeExpressAdLoad ??????????????????");
                    adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
                    return;
                }
                LogD("loadBannerExpressAd onNativeExpressAdLoad ??????????????????");
                mTTAd = list.get(0);
                mTTAd.setSlideIntervalTime(30*1000);//?????????????????? ms,?????????????????????????????????
                bindBannerAdListener(mContext);
                mTTAd.render();//??????render??????????????????
            }
        });
        bannerContainer.removeAllViews();
        layout.setVisibility(View.VISIBLE);
    }
    //??????banner????????????
    private static void bindBannerAdListener(final Activity mContext) {
        mTTAd.setExpressInteractionListener(new TTNativeExpressAd.ExpressAdInteractionListener() {

            @Override
            public void onAdClicked(View view, int type) {
                LogD("banner???????????????");
            }

            @Override
            public void onAdShow(View view, int type) {
                LogD("banner???????????? view.getWidth()="+view.getWidth()+", view.getHeight()="+view.getHeight());
            }

            @Override
            public void onRenderFail(View view, String msg, int code) {
                LogD("banner??????????????????, msg=" + msg + ", code=" + code);
                adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onRenderSuccess(View view, float width, float height) {
                LogD("banner?????????????????? view.getWidth()="+view.getWidth()+", view.getHeight()="+view.getHeight()+", width="+width+", height="+height);

                int bannerW = bannerWidth*screenscale;
                int bannerH = bannerHeight*screenscale;
                RelativeLayout.LayoutParams layoutParams = (RelativeLayout.LayoutParams)bannerContainer.getLayoutParams();
                Display display = mContext.getWindowManager().getDefaultDisplay();
                Point size = new Point();
                display.getRealSize(size);
                int screenWidth = size.x;
                int screenHeight = size.y;
                LogD("banner onRenderSuccess width-display :" + screenWidth);
                LogD("banner onRenderSuccess height-display :" + screenHeight);
                layoutParams.setMargins((screenWidth-bannerW)/2, screenHeight - bannerH, (screenWidth-bannerW)/2, 0);
                bannerContainer.setLayoutParams(layoutParams);
                bannerContainer.addView(view);

                String bw = String.valueOf(bannerW);
                String bh = String.valueOf(bannerH);
                adsInfo.put("bannerWidth", bw);
                adsInfo.put("bannerHeight", bh);
                adsResult(AdsWrapper.RESULT_CODE_BANNER_SUCCESS, MsgStringConfig.msgAdsSuccess);
            }
        });
        bindDislike(mContext);
        if (mTTAd.getInteractionType() != TTAdConstant.INTERACTION_TYPE_DOWNLOAD){
            return;
        }
        mTTAd.setDownloadListener(new TTAppDownloadListener() {

            @Override
            public void onIdle() {
                LogD("banner???????????????????????????");
            }

            @Override
            public void onDownloadActive(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("banner?????????????????????????????????");
            }

            @Override
            public void onDownloadPaused(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("banner????????????????????????????????????");
            }

            @Override
            public void onDownloadFailed(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("banner??????????????????????????????????????????");
            }

            @Override
            public void onDownloadFinished(long totalBytes, String fileName, String appName) {
                LogD("banner?????????????????????");
            }

            @Override
            public void onInstalled(String fileName, String appName) {
                //LogD("banner??????????????????????????????????????????");
            }
        });
    }
    /**
     * ????????????????????????, ??????????????????????????????????????????????????????dislike???????????????????????????????????? dislike???????????????dislike?????????
     */
    private static void bindDislike(Activity mContext) {
        //???????????????????????????dislike????????????
        mTTAd.setDislikeCallback(mContext, new TTAdDislike.DislikeInteractionCallback() {
            @Override
            public void onSelected(int position, String value) {
                LogD("????????????????????????: " + value);
                //???????????????????????????????????????????????????
                if (layout.getVisibility() == View.VISIBLE) {
                    bannerContainer.removeAllViews();
                    layout.setVisibility(View.INVISIBLE);
                }
                if (nativeView.getVisibility() == View.VISIBLE) {
                    nativeContainer.removeAllViews();
                    nativeView.setVisibility(View.INVISIBLE);
                    adsResult(AdsWrapper.RESULT_CODE_NATIVE_CLOSE, MsgStringConfig.msgAdsClose);
                }
            }

            @Override
            public void onCancel() {
                LogD("??????????????????????????????");
            }

            public void onRefuse() {
                LogD("???????????????????????????????????????????????????");
            }
        });
    }

    public static void loadRewardVideo(final Activity mContext) {
        if (rewardvideoid == null || "0".equalsIgnoreCase(rewardvideoid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        //??????????????????
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId(rewardvideoid)
                .setSupportDeepLink(true)
                //????????????????????????????????????????????????????????????,??????dp,?????????????????????????????????????????????0??????
                .setExpressViewAcceptedSize(500,500)
                //???????????????????????????????????????????????????????????????????????????????????????sdk??????
                //????????????????????????
                .setUserID("")
                .setOrientation(TTAdConstant.HORIZONTAL) //?????????????????????????????????????????????TTAdConstant.HORIZONTAL ??? TTAdConstant.VERTICAL
                .build();
        mTTAdNative.loadRewardVideoAd(adSlot, new TTAdNative.RewardVideoAdListener() {

            @Override
            public void onError(int code, String message) {
                LogD("????????????onError: code=" + code + ", message=" + message);
                adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_FAIL, MsgStringConfig.msgAdsFail);
                isvideoload = false;
                isRewardVideo = false;
            }

            @Override
            public void onRewardVideoAdLoad(TTRewardVideoAd ttRewardVideoAd) {
                LogD("onRewardVideoAdLoad ?????????????????????????????????????????????????????????");
                mRewardVideo = ttRewardVideoAd;
                mRewardVideo.setRewardAdInteractionListener(new TTRewardVideoAd.RewardAdInteractionListener() {

                    @Override
                    public void onAdShow() {
                        LogD("onRewardVideoAdLoad onAdShow");
                        isRewardVideo = true;
                    }

                    @Override
                    public void onAdVideoBarClick() {
                        LogD("onAdVideoBarClick");
                    }

                    @Override
                    public void onAdClose() {
                        LogD("onAdClose ????????????????????????");
                        adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_CLOSE, MsgStringConfig.msgAdsClose);
                    }

                    @Override
                    public void onVideoComplete() {
                        LogD("onVideoComplete ??????????????????????????????");
                    }

                    @Override
                    public void onVideoError() {
                        LogD("onVideoError");
                        adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_FAIL, MsgStringConfig.msgAdsFail);
                        isvideoload = false;
                        isRewardVideo = false;
                    }

                    @Override
                    public void onRewardVerify(boolean rewardVerify, int rewardAmount, String rewardName) {
                        //??????????????????????????????????????????
                        // rewardVerify??????????????????rewardAmount??????????????????rewardName???????????????
                        LogD("onRewardVerify ????????????????????????????????????");
                        LogD("onRewardVerify rewardVerify=" + rewardVerify +
                                ", rewardAmount=" + rewardAmount +
                                ", rewardName=" + rewardName);
                        if (rewardVerify) {
                            adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_SUCCEES, MsgStringConfig.msgAdsSuccess);
                            isvideoload = true;
                            isRewardVideo = false;
                        }
                    }

                    @Override
                    public void onSkippedVideo() {
                        LogD("onSkippedVideo");
                    }
                });
                mRewardVideo.setDownloadListener(new TTAppDownloadListener() {

                    @Override
                    public void onIdle() {
                        //LogD("????????????onIdle");
                    }

                    @Override
                    public void onDownloadActive(long totalBytes, long currBytes, String fileName, String appName) {
                        LogD("????????????onDownloadActive ?????????");
                        LogD("totalBytes=" + totalBytes + ", currBytes=" + currBytes + ", fileName=" + fileName + ", appName=" + appName);
                    }

                    @Override
                    public void onDownloadPaused(long totalBytes, long currBytes, String fileName, String appName) {
                        LogD("????????????onDownloadPaused ????????????");
                        LogD("totalBytes=" + totalBytes + ", currBytes=" + currBytes + ", fileName=" + fileName + ", appName=" + appName);
                    }

                    @Override
                    public void onDownloadFailed(long totalBytes, long currBytes, String fileName, String appName) {
                        LogD("????????????onDownloadFailed ????????????");
                        LogD("totalBytes=" + totalBytes + ", currBytes=" + currBytes + ", fileName=" + fileName + ", appName=" + appName);
                    }

                    @Override
                    public void onDownloadFinished(long totalBytes, String fileName, String appName) {
                        LogD("????????????onDownloadFinished ????????????");
                        LogD("totalBytes=" + totalBytes + ", fileName=" + fileName + ", appName=" + appName);
                    }

                    @Override
                    public void onInstalled(String fileName, String appName) {
                        LogD("????????????onInstalled ????????????");
                        LogD("fileName=" + fileName + ", appName=" + appName);
                    }
                });
                mRewardVideo.showRewardVideoAd(mContext);
            }

            @Override
            public void onRewardVideoCached() {
                LogD("onRewardVideoCached ?????????????????????????????????????????????????????????");
            }
        });
        isvideoload = true;
    }

    private static void loadInLine(final Activity mContext) {
        //????????????
        if (inlineid == null || "0".equalsIgnoreCase(inlineid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_INTER_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId(inlineid)
                .setSupportDeepLink(true)
                .setAdCount(1) //?????????????????????1???3???
                .setExpressViewAcceptedSize(300, 300)
                .build();
        mTTAdNative.loadInteractionExpressAd(adSlot, new TTAdNative.NativeExpressAdListener() {

            @Override
            public void onError(int code, String message) {
                Log.d(LOG_TAG, "load error : " + code + ", " + message);
                adsResult(AdsWrapper.RESULT_CODE_INTER_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onNativeExpressAdLoad(List<TTNativeExpressAd> ads) {
                if (ads == null || ads.size() == 0) {
                    return;
                }
                mTTAd = ads.get(0);
                bindInLineAdListener(mContext, mTTAd);
                mTTAd.render();//??????render??????????????????
            }
        });
    }
    private static void bindInLineAdListener(final Activity mContext, TTNativeExpressAd ad) {
        ad.setExpressInteractionListener(new TTNativeExpressAd.AdInteractionListener() {

            @Override
            public void onAdClicked(View view, int type) {
                Log.d(LOG_TAG, "?????????????????????");
            }

            @Override
            public void onAdShow(View view, int type) {
                Log.d(LOG_TAG, "??????????????????");
                adsResult(AdsWrapper.RESULT_CODE_INTER_SUCCEES, MsgStringConfig.msgAdsSuccess);
            }

            @Override
            public void onRenderFail(View view, String msg, int code) {
                Log.d(LOG_TAG, "??????render fail : code = " + code + ", msg = " + msg);
                adsResult(AdsWrapper.RESULT_CODE_INTER_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onRenderSuccess(View view, float width, float height) {
                Log.d(LOG_TAG, "???????????????????????? : width = " + width + ", height = " + height);
                mTTAd.showInteractionExpressAd(mContext);
            }

            @Override
            public void onAdDismiss() {
                Log.d(LOG_TAG, "??????????????????");
                adsResult(AdsWrapper.RESULT_CODE_INTER_CLOSE, MsgStringConfig.msgAdsClose);
            }
        });
        bindDislike(mContext);
        if (ad.getInteractionType() != TTAdConstant.INTERACTION_TYPE_DOWNLOAD) {
            return;
        }
        ad.setDownloadListener(new TTAppDownloadListener() {
            @Override
            public void onIdle() {
                LogD("?????????????????????????????????");
            }

            @Override
            public void onDownloadActive(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("???????????????????????????????????????");
            }

            @Override
            public void onDownloadPaused(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("??????????????????????????????????????????");
            }

            @Override
            public void onDownloadFailed(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("????????????????????????????????????????????????");
            }

            @Override
            public void onInstalled(String fileName, String appName) {
                LogD("????????????????????????????????????????????????");
            }

            @Override
            public void onDownloadFinished(long totalBytes, String fileName, String appName) {
                //LogD("???????????????????????????");
            }
        });
    }

    private static void loadNative(final Activity mContext) {
        //?????????????????????
        if (nativeid == null || "0".equalsIgnoreCase(nativeid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId(nativeid)
                .setSupportDeepLink(true)
                .setAdCount(1) //?????????????????????1???3???
                .setExpressViewAcceptedSize(375, 284)//???????????????0,?????????????????????
                .build();
        mTTAdNative.loadNativeExpressAd(adSlot, new TTAdNative.NativeExpressAdListener() {

            @Override
            public void onError(int code, String message) {
                LogD("?????????????????????NativeExpressAdListener onError : " + code + ", " + message);
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onNativeExpressAdLoad(List<TTNativeExpressAd> ads) {
                if (ads == null || ads.size() == 0) {
                    return;
                }
                mTTAd = ads.get(0);
                bindNativeAdListener(mContext, mTTAd);
                mTTAd.render();//??????render??????????????????
            }
        });
        nativeContainer.removeAllViews();
        nativeView.setVisibility(View.VISIBLE);
    }
    private static void bindNativeAdListener(final Activity mContext, TTNativeExpressAd ad) {
        ad.setExpressInteractionListener(new TTNativeExpressAd.ExpressAdInteractionListener() {

            @Override
            public void onAdClicked(View view, int type) {
                LogD("??????????????????????????????");
            }

            @Override
            public void onAdShow(View view, int type) {
                LogD("??????????????????????????? onAdShow : viewwidth = " + view.getWidth() + ", viewheight = " + view.getHeight());
                int nativeW = view.getWidth();
                int nativeH = view.getHeight();
                RelativeLayout.LayoutParams layoutParams = (RelativeLayout.LayoutParams)nativeContainer.getLayoutParams();
                Display display = mContext.getWindowManager().getDefaultDisplay();
                Point size = new Point();
                display.getRealSize(size);
                int screenWidth = size.x;
                int screenHeight = size.y;
                LogD("????????????????????? onAdShow width-display :" + screenWidth);
                LogD("????????????????????? onAdShow height-display :" + screenHeight);
                String nw = "";
                String nh = "";
                if (nativeSize == 5) {//????????????
                    LogD("????????????");
                    layoutParams.setMargins((screenWidth-nativeW)/2, (screenHeight-nativeH)/2, (screenWidth-nativeW)/2, (screenHeight-nativeH)/2);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH);
                } else if (nativeSize == 4) {//???????????????
                    LogD("???????????????");
                    layoutParams.setMargins(screenWidth-nativeW-10, (screenHeight-nativeH)/2, 10, (screenHeight-nativeH)/2);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH);
                } else if (nativeSize == 3) {//???????????????
                    LogD("???????????????");
                    layoutParams.setMargins(10, (screenHeight-nativeH)/2, screenWidth-nativeW-10, (screenHeight-nativeH)/2);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH);
                } else if (nativeSize == 2) {//???????????????
                    LogD("???????????????");
                    layoutParams.setMargins((screenWidth-nativeW)/2, screenHeight-nativeH-60, (screenWidth-nativeW)/2, 60);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH+60);
                } else if (nativeSize == 1) {//???????????????
                    LogD("???????????????");
                    layoutParams.setMargins((screenWidth-nativeW)/2, 60, (screenWidth-nativeW)/2, screenHeight-nativeH-60);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH+60);
                }
                nativeContainer.setLayoutParams(layoutParams);
                adsInfo.put("nativeWidth", nw);
                adsInfo.put("nativeHeight", nh);
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_SUCCESS, MsgStringConfig.msgAdsSuccess);
            }

            @Override
            public void onRenderFail(View view, String msg, int code) {
                LogD("?????????????????????render fail : code = " + code + ", msg = " + msg);
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onRenderSuccess(View view, float width, float height) {
                LogD("????????????????????????????????? : width = " + width + ", height = " + height);
                LogD("????????????????????????????????? : viewwidth = " + view.getWidth() + ", viewheight = " + view.getHeight());
                nativeContainer.addView(view);
            }
        });
        bindDislike(mContext);
        if (ad.getInteractionType() != TTAdConstant.INTERACTION_TYPE_DOWNLOAD) {
            return;
        }
        ad.setDownloadListener(new TTAppDownloadListener() {
            @Override
            public void onIdle() {
                LogD("??????????????????????????????????????????");
            }

            @Override
            public void onDownloadActive(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("????????????????????????????????????????????????");
            }

            @Override
            public void onDownloadPaused(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("???????????????????????????????????????????????????");
            }

            @Override
            public void onDownloadFailed(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("?????????????????????????????????????????????????????????");
            }

            @Override
            public void onInstalled(String fileName, String appName) {
                LogD("?????????????????????????????????????????????????????????");
            }

            @Override
            public void onDownloadFinished(long totalBytes, String fileName, String appName) {
                //LogD("????????????????????????????????????");
            }
        });
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
            default:
                break;
        }
    }
    public static void hideAds(int adsType) {
        switch (adsType) {
            case AdsWrapper.ADS_TYPE_BANNER:
                hideBannerAd();
                break;
            case AdsWrapper.ADS_TYPE_FULL_SCREEN:
            case AdsWrapper.ADS_TYPE_INTER://????????????
            case AdsWrapper.ADS_TYPE_REWARTVIDEO://??????????????????
            default:
                break;
            case AdsWrapper.ADS_TYPE_NATIVE://?????????????????????
                hideNativeAd();
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

    public static void onDestroy() {
        if (mTTAd != null) {
            mTTAd.destroy();
        }
    }

    public static String getSDKVersion() {
        return TTAdSdk.getAdManager().getSDKVersion();
    }

    public static void adsResult(int ret, String msg)
    {
        AdsWrapper.setAdsJson(adsInfo);
        AdsWrapper.onAdsResult(AdsTTAds.mTTads, ret, msg);
    }

}
