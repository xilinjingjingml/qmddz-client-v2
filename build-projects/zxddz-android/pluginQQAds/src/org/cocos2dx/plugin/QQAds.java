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
    /////////////////////信息流自渲染/////////////////////
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
    private static int nativeSize = 5;//上1下2左3右4中5，默认中5
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
        //banner广告
        if (bannerid == null || "0".equalsIgnoreCase(bannerid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        //原生广告模板
        nativeExpressAD = new NativeExpressAD(mContext,
                //new ADSize(bannerWidth, ADSize.AUTO_HEIGHT),
                new ADSize(327, 109),
                bannerid, new NativeExpressAD.NativeExpressADListener() {
            /**
             * 无广告填充
             * */
            @Override
            public void onNoAD(AdError adError) {
                LogD("NativeExpressADListener onNoAD AdError code = " + adError.getErrorCode() +
                        ", msg = " + adError.getErrorMsg());
                adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
            }
            /**
             * 广告点击
             * */
            @Override
            public void onADClicked(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onADClicked");
            }
            /**
             * 广告关闭遮盖时调用
             * */
            @Override
            public void onADCloseOverlay(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onADCloseOverlay");
            }
            /**
             * 广告被关闭，将不再显示广告，此时广告对象已经释放资源，不可以再次用来展示了
             * */
            @Override
            public void onADClosed(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onADClosed");
                layout.setVisibility(View.INVISIBLE);
            }
            /**
             * 广告曝光
             * */
            @Override
            public void onADExposure(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onADExposure bannerwidth = " +
                        nativeExpressADView.getWidth() +
                        ", bannerheight = " + nativeExpressADView.getHeight());
            }
            /**
             * 因为广告点击等原因离开当前 app 时调用
             * */
            @Override
            public void onADLeftApplication(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onADLeftApplication");
            }
            /**
             * 广告数据加载成功，返回了可以用来展示广告的 NativeExpressADView，
             * 但是想让广告曝光还需要调用 NativeExpressADView 的 render 方法
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
             * 广告展开遮盖时调用
             * */
            @Override
            public void onADOpenOverlay(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onADOpenOverlay");
            }
            /**
             * NativeExpressADView 渲染广告失败
             * */
            @Override
            public void onRenderFail(NativeExpressADView nativeExpressADView) {
                LogD("NativeExpressADListener onRenderFail");
                adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
            }
            /**
             * NativeExpressADView 渲染广告成功
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
        //激励视频广告
        if (rewardvideoid == null || "0".equalsIgnoreCase(rewardvideoid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        mRewardVideo = new RewardVideoAD(mContext, rewardvideoid, new RewardVideoADListener(){
            /**
             * 激励视频广告被点击
             */
            @Override
            public void onADClick() {
                LogD("RewardVideoAD onADClick");
            }
            /**
             * 激励视频广告被关闭
             */
            @Override
            public void onADClose() {
                LogD("RewardVideoAD onADClose");
                adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_CLOSE, MsgStringConfig.msgAdsClose);
            }
            /**
             * 激励视频广告曝光
             */
            @Override
            public void onADExpose() {
                LogD("RewardVideoAD onADExpose");
            }
            /**
             * 广告加载成功，可在此回调后进行广告展示
             **/
            @Override
            public void onADLoad() {
                LogD("RewardVideoAD onADLoad");
                isvideoload = true;
                adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_LOAD_SUCCESS, MsgStringConfig.msgAdsLoadSuccess);
                mRewardVideo.showAD();
            }
            /**
             * 激励视频广告页面展示
             */
            @Override
            public void onADShow() {
                LogD("RewardVideoAD onADShow");
                isRewardVideo = true;
            }
            /**
             * 广告流程出错
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
             * 激励视频触发激励（观看视频大于一定时长或者视频播放完毕）
             */
            @Override
            public void onReward() {
                LogD("RewardVideoAD onReward");
                adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_SUCCEES, MsgStringConfig.msgAdsSuccess);
                isvideoload = true;
                isRewardVideo = false;
            }
            /**
             * 视频素材缓存成功，可在此回调后进行广告展示
             */
            @Override
            public void onVideoCached() {
                LogD("RewardVideoAD onVideoCached");
            }
            /**
             * 激励视频播放完毕
             */
            @Override
            public void onVideoComplete() {
                LogD("RewardVideoAD onVideoComplete");
            }
        });
        //在项目里需要提前准备好视频，提前load
        mRewardVideo.loadAD();
    }

    private static void loadInLine(Activity mContext) {
        //插屏广告
        if (inlineid == null || "0".equalsIgnoreCase(inlineid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_INTER_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        if (mInLineAD == null) {
            mInLineAD = new UnifiedInterstitialAD(mContext, inlineid, new UnifiedInterstitialADListener() {
                /**
                 * 插屏2.0广告点击时回调
                 * */
                @Override
                public void onADClicked() {
                    LogD("UnifiedInterstitialAD onADClicked");
                }
                /**
                 * 插屏2.0广告关闭时回调
                 * */
                @Override
                public void onADClosed() {
                    LogD("UnifiedInterstitialAD onADClosed");
                    adsResult(AdsWrapper.RESULT_CODE_INTER_CLOSE, MsgStringConfig.msgAdsClose);
                }
                /**
                 * 插屏2.0广告曝光时回调
                 * */
                @Override
                public void onADExposure() {
                    LogD("UnifiedInterstitialAD onADExposure");
                }
                /**
                 * 插屏2.0广告点击离开应用时回调
                 * */
                @Override
                public void onADLeftApplication() {
                    LogD("UnifiedInterstitialAD onADLeftApplication");
                }
                /**
                 * 插屏2.0广告展开时回调
                 * */
                @Override
                public void onADOpened() {
                    LogD("UnifiedInterstitialAD onADOpened");
                    adsResult(AdsWrapper.RESULT_CODE_INTER_SUCCEES, MsgStringConfig.msgAdsSuccess);
                }
                /**
                 * 插屏2.0广告加载完毕，此回调后才可以调用 show 方法
                 * */
                @Override
                public void onADReceive() {
                    LogD("UnifiedInterstitialAD onADReceive");
                    if (mInLineAD.getAdPatternType() == AdPatternType.NATIVE_VIDEO) {
                        mInLineAD.setMediaListener(new UnifiedInterstitialMediaListener() {
                            /**
                             * 视频播放结束，自然播放到达最后一帧时都会触发
                             * */
                            @Override
                            public void onVideoComplete() {
                                LogD("UnifiedInterstitialMediaListener onVideoComplete");
                            }
                            /**
                             * 视频播放时出现错误，error 对象包含了错误码和错误信息
                             * */
                            @Override
                            public void onVideoError(AdError adError) {
                                LogD("UnifiedInterstitialMediaListener onVideoError error code=" +
                                        adError.getErrorCode() +
                                        ", error msg=" + adError.getErrorMsg());
                                adsResult(AdsWrapper.RESULT_CODE_INTER_FAIL, MsgStringConfig.msgAdsFail);
                            }
                            /**
                             * 视频播放 View 初始化完成
                             * */
                            @Override
                            public void onVideoInit() {
                                LogD("UnifiedInterstitialMediaListener onVideoInit");
                            }
                            /**
                             * 视频下载中
                             * */
                            @Override
                            public void onVideoLoading() {
                                LogD("UnifiedInterstitialMediaListener onVideoLoading");
                            }
                            /**
                             * 退出视频落地页
                             * */
                            @Override
                            public void onVideoPageClose() {
                                LogD("UnifiedInterstitialMediaListener onVideoPageClose");
                                adsResult(AdsWrapper.RESULT_CODE_INTER_CLOSE, MsgStringConfig.msgAdsClose);
                            }
                            /**
                             * 进入视频落地页
                             * */
                            @Override
                            public void onVideoPageOpen() {
                                LogD("UnifiedInterstitialMediaListener onVideoPageOpen");
                            }
                            /**
                             * 视频暂停
                             * */
                            @Override
                            public void onVideoPause() {
                                LogD("UnifiedInterstitialMediaListener onVideoPause");
                            }
                            /**
                             * 视频播放器初始化完成，准备好可以播放了
                             * videoDuration 是视频素材的时间长度，单位为 ms
                             * */
                            @Override
                            public void onVideoReady(long videoDuration) {
                                LogD("UnifiedInterstitialMediaListener onVideoReady videoDuration=" + videoDuration);
                                adsResult(AdsWrapper.RESULT_CODE_INTER_SUCCEES, MsgStringConfig.msgAdsSuccess);
                            }
                            /**
                             * 视频开始播放
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
                 * 广告加载失败，error 对象包含了错误码和错误信息
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
                 * 插屏2.0视频广告，视频素材下载完成
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
        //原生信息流广告
        if (nativeid == null || "0".equalsIgnoreCase(nativeid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        nativeExpressAD = new NativeExpressAD(mContext,
                //new ADSize(340, ADSize.AUTO_HEIGHT),
                new ADSize(375, 284),
                nativeid, new NativeExpressAD.NativeExpressADListener() {
            /**
             * 无广告填充
             * */
            @Override
            public void onNoAD(AdError adError) {
                LogD("原生信息流广告NativeExpressADListener onNoAD AdError code = " + adError.getErrorCode() +
                        ", msg = " + adError.getErrorMsg());
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            }
            /**
             * 广告点击
             * */
            @Override
            public void onADClicked(NativeExpressADView adView) {
                LogD("原生信息流广告NativeExpressADListener onADClicked");
            }
            /**
             * 广告关闭遮盖时调用
             * */
            @Override
            public void onADCloseOverlay(NativeExpressADView adView) {
                LogD("原生信息流广告NativeExpressADListener onADCloseOverlay");
            }
            /**
             * 广告被关闭，将不再显示广告，此时广告对象已经释放资源，不可以再次用来展示了
             * */
            @Override
            public void onADClosed(NativeExpressADView adView) {
                LogD("原生信息流广告NativeExpressADListener onADClosed");
                nativeContainer.removeAllViews();
                nativeView.setVisibility(View.INVISIBLE);
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_CLOSE, MsgStringConfig.msgAdsClose);
            }
            /**
             * 广告曝光
             * */
            @Override
            public void onADExposure(NativeExpressADView adView) {
                LogD("原生信息流广告NativeExpressADListener onADExposure nativewidth = " +
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
                    LogD("原生信息流广告NativeExpressADListener onADExposure width-display :" + screenWidth);
                    LogD("原生信息流广告NativeExpressADListener onADExposure height-display :" + screenHeight);
                    String nw = "";
                    String nh = "";
                    if (nativeSize == 5) {//屏幕居中
                        LogD("原生信息流广告 屏幕居中");
                        layoutParams.setMargins((screenWidth-nativeW)/2, (screenHeight-nativeH)/2, (screenWidth-nativeW)/2, (screenHeight-nativeH)/2);
                        nw = String.valueOf(nativeW);
                        nh = String.valueOf(nativeH);
                    } else if (nativeSize == 4) {//屏幕居中右
                        LogD("原生信息流广告 屏幕居中右");
                        layoutParams.setMargins(screenWidth-nativeW-10, (screenHeight-nativeH)/2, 10, (screenHeight-nativeH)/2);
                        nw = String.valueOf(nativeW);
                        nh = String.valueOf(nativeH);
                    } else if (nativeSize == 3) {//屏幕居中左
                        LogD("原生信息流广告 屏幕居中左");
                        layoutParams.setMargins(10, (screenHeight-nativeH)/2, screenWidth-nativeW-10, (screenHeight-nativeH)/2);
                        nw = String.valueOf(nativeW);
                        nh = String.valueOf(nativeH);
                    } else if (nativeSize == 2) {//屏幕居中下
                        LogD("原生信息流广告 屏幕居中下");
                        layoutParams.setMargins((screenWidth-nativeW)/2, screenHeight-nativeH-60, (screenWidth-nativeW)/2, 60);
                        nw = String.valueOf(nativeW);
                        nh = String.valueOf(nativeH+60);
                    } else if (nativeSize == 1) {//屏幕居中上
                        LogD("原生信息流广告 屏幕居中上");
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
             * 因为广告点击等原因离开当前 app 时调用
             * */
            @Override
            public void onADLeftApplication(NativeExpressADView adView) {
                LogD("原生信息流广告NativeExpressADListener onADLeftApplication");
            }
            /**
             * 广告数据加载成功，返回了可以用来展示广告的 NativeExpressADView，
             * 但是想让广告曝光还需要调用 NativeExpressADView 的 render 方法
             * */
            @Override
            public void onADLoaded(List<NativeExpressADView> adList) {
                LogD("原生信息流广告NativeExpressADListener onADLoaded");
                if (nativeExpressADView != null) {
                    nativeExpressADView.destroy();
                }
                nativeContainer.removeAllViews();
                nativeView.setVisibility(View.VISIBLE);
                nativeExpressADView = adList.get(0);
                if (nativeExpressADView.getBoundData().getAdPatternType() == AdPatternType.NATIVE_VIDEO) {
                    LogD("原生信息流广告 视频");
                    nativeExpressADView.setMediaListener(new NativeExpressMediaListener() {
                        /**
                         *视频下载完成
                         * */
                        @Override
                        public void onVideoCached(NativeExpressADView adView) {
                            LogD("原生信息流广告NativeExpressMediaListener onVideoCached");
                        }
                        /**
                         *视频播放结束
                         * */
                        @Override
                        public void onVideoComplete(NativeExpressADView adView) {
                            LogD("原生信息流广告NativeExpressMediaListener onVideoComplete");
                        }
                        /**
                         *视频播放时出现错误
                         * */
                        @Override
                        public void onVideoError(NativeExpressADView adView, AdError adError) {
                            LogD("原生信息流广告NativeExpressMediaListener onVideoError code = " + adError.getErrorCode()
                                    + ", msg = " + adError.getErrorMsg());
                            adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
                        }
                        /**
                         *视频播放 View 初始化完成
                         * */
                        @Override
                        public void onVideoInit(NativeExpressADView adView) {
                            LogD("原生信息流广告NativeExpressMediaListener onVideoInit");
                        }
                        /**
                         *视频下载中
                         * */
                        @Override
                        public void onVideoLoading(NativeExpressADView adView) {
                            LogD("原生信息流广告NativeExpressMediaListener onVideoLoading");
                        }
                        /**
                         *退出视频落地页
                         * */
                        @Override
                        public void onVideoPageClose(NativeExpressADView adView) {
                            LogD("原生信息流广告NativeExpressMediaListener onVideoPageClose");
                            adsResult(AdsWrapper.RESULT_CODE_NATIVE_CLOSE, MsgStringConfig.msgAdsClose);
                        }
                        /**
                         *进入视频落地页
                         * */
                        @Override
                        public void onVideoPageOpen(NativeExpressADView adView) {
                            LogD("原生信息流广告NativeExpressMediaListener onVideoPageOpen");
                        }
                        /**
                         *视频暂停
                         * */
                        @Override
                        public void onVideoPause(NativeExpressADView adView) {
                            LogD("原生信息流广告NativeExpressMediaListener onVideoPause");
                        }
                        /**
                         *视频播放器初始化完成，准备好可以播放了
                         * */
                        @Override
                        public void onVideoReady(NativeExpressADView adView, long l) {
                            LogD("原生信息流广告NativeExpressMediaListener onVideoReady");
                        }
                        /**
                         *视频开始播放
                         * */
                        @Override
                        public void onVideoStart(NativeExpressADView adView) {
                            LogD("原生信息流广告NativeExpressMediaListener onVideoStart nativewidth = " +
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
                            LogD("原生信息流广告NativeExpressMediaListener onVideoStart width-display :" + screenWidth);
                            LogD("原生信息流广告NativeExpressMediaListener onVideoStart height-display :" + screenHeight);
                            String nw = "";
                            String nh = "";
                            if (nativeSize == 5) {//屏幕居中
                                LogD("原生信息流广告 屏幕居中");
                                layoutParams.setMargins((screenWidth-nativeW)/2, (screenHeight-nativeH)/2, (screenWidth-nativeW)/2, (screenHeight-nativeH)/2);
                                nw = String.valueOf(nativeW);
                                nh = String.valueOf(nativeH);
                            } else if (nativeSize == 4) {//屏幕居中右
                                LogD("原生信息流广告 屏幕居中右");
                                layoutParams.setMargins(screenWidth-nativeW-10, (screenHeight-nativeH)/2, 10, (screenHeight-nativeH)/2);
                                nw = String.valueOf(nativeW);
                                nh = String.valueOf(nativeH);
                            } else if (nativeSize == 3) {//屏幕居中左
                                LogD("原生信息流广告 屏幕居中左");
                                layoutParams.setMargins(10, (screenHeight-nativeH)/2, screenWidth-nativeW-10, (screenHeight-nativeH)/2);
                                nw = String.valueOf(nativeW);
                                nh = String.valueOf(nativeH);
                            } else if (nativeSize == 2) {//屏幕居中下
                                LogD("原生信息流广告 屏幕居中下");
                                layoutParams.setMargins((screenWidth-nativeW)/2, screenHeight-nativeH-60, (screenWidth-nativeW)/2, 60);
                                nw = String.valueOf(nativeW);
                                nh = String.valueOf(nativeH+60);
                            } else if (nativeSize == 1) {//屏幕居中上
                                LogD("原生信息流广告 屏幕居中上");
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
             * 广告展开遮盖时调用
             * */
            @Override
            public void onADOpenOverlay(NativeExpressADView adView) {
                LogD("原生信息流广告NativeExpressADListener onADOpenOverlay");
            }
            /**
             * NativeExpressADView 渲染广告失败
             * */
            @Override
            public void onRenderFail(NativeExpressADView adView) {
                LogD("原生信息流广告NativeExpressADListener onRenderFail");
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            }
            /**
             * NativeExpressADView 渲染广告成功
             * */
            @Override
            public void onRenderSuccess(NativeExpressADView adView) {
                LogD("原生信息流广告NativeExpressADListener onRenderSuccess nativewidth = " +
                        adView.getWidth() +
                        ", nativeheight = " + adView.getHeight());
                nativeContainer.addView(nativeExpressADView);
            }
        });
        nativeExpressAD.setVideoPlayPolicy(VideoOption.VideoPlayPolicy.AUTO);
        nativeExpressAD.loadAD(1);
    }

    /**
     * 原生信息流自渲染2.0
     * */
    public static void loadNativeUnified(final Activity mContext) {
        //原生信息流自渲染2.0
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
                LogD("信息流自渲染 NativeADUnifiedListener onNoAD 广告加载失败回调");
                LogD("信息流自渲染 onNoAd error code: " + adError.getErrorCode()
                        + ", error msg: " + adError.getErrorMsg());
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onADLoaded(List<NativeUnifiedADData> ads) {
                LogD("信息流自渲染 NativeADUnifiedListener onADLoaded 广告加载成功回调");
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
         * 设置本次拉取的视频广告，从用户角度看到的视频播放策略<p/>
         *
         * "用户角度"特指用户看到的情况，并非SDK是否自动播放，与自动播放策略AutoPlayPolicy的取值并非一一对应 <br/>
         *
         * 例如开发者设置了VideoOption.AutoPlayPolicy.NEVER，表示从不自动播放 <br/>
         * 但满足某种条件(如晚上10点)时，开发者调用了startVideo播放视频，这在用户看来仍然是自动播放的
         */
        mAdManager.setVideoPlayPolicy(VideoOption.VideoPlayPolicy.AUTO); // 本次拉回的视频广告，从用户的角度看是自动播放的
        /**
         * 该接口已经废弃，仅支持sdk渲染，不再支持开发者自己渲染 <p/>
         * 当前仅支持VideoADContainerRender.SDK VideoADContainerRender.DEV不再支持
         */
        // 视频播放前，用户看到的广告容器是由SDK渲染的
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
                    LogD(String.format(Locale.getDefault(), "信息流自渲染 (pic_width,pic_height) = (%d , %d)", ad
                                    .getPictureWidth(),
                            ad.getPictureHeight()));
                    initAd(AdsQQAds.mContext, ad);
                    LogD("信息流自渲染 eCPMLevel = " + ad.getECPMLevel() + " , " +
                            "videoDuration = " + ad.getVideoDuration());
                    nativeUnifiedADView.setVisibility(View.VISIBLE);
                    mContainer.setVisibility(View.VISIBLE);
                    break;
                case MSG_VIDEO_START:
                    LogD("信息流自渲染 handleMessage MSG_VIDEO_START");
                    mImagePoster.setVisibility(View.GONE);
                    mMediaView.setVisibility(View.VISIBLE);
                    break;
            }
        }
    }
    private static void initAd(final Activity mContext, final NativeUnifiedADData ad) {
        renderAdUi(ad);
        //点击直接下载（App广告）或进入落地页
        List<View> clickableViews = new ArrayList<>();
        List<View> customClickableViews = new ArrayList<>();
        customClickableViews.add(mADInfoContainer);
        //作为customClickableViews传入，点击不进入详情页，直接下载或进入落地页，图文、视频广告均生效，
        ad.bindAdToView(mContext, mContainer, null, clickableViews, customClickableViews);
        ad.setNativeAdEventListener(new NativeADEventListener() {
            @Override
            public void onADExposed() {
                LogD("信息流自渲染 广告被曝光回调 onADExposed: ");
                LogD("信息流自渲染 mADInfoContainer.width: " + mADInfoContainer.getWidth());
                LogD("信息流自渲染 mADInfoContainer.height: " + mADInfoContainer.getHeight());
                LogD("信息流自渲染 mMediaView.width: " + mMediaView.getWidth());
                LogD("信息流自渲染 mMediaView.height: " + mMediaView.getHeight());
                LogD("信息流自渲染 mContainer.width: " + mContainer.getWidth());
                LogD("信息流自渲染 mContainer.height: " + mContainer.getHeight());
                int nativeW = mContainer.getWidth();//340*screenscale;
                int nativeH = mContainer.getHeight();//236*screenscale;
                RelativeLayout.LayoutParams layoutParams = (RelativeLayout.LayoutParams)mContainer.getLayoutParams();
                Display display = mContext.getWindowManager().getDefaultDisplay();
                Point size = new Point();
                display.getRealSize(size);
                int screenWidth = size.x;
                int screenHeight = size.y;
                LogD("信息流自渲染 NativeADEventListener onADExposed width-display :" + screenWidth);
                LogD("信息流自渲染 NativeADEventListener onADExposed height-display :" + screenHeight);
                String nw = "";
                String nh = "";
                if (nativeSize == 5) {//屏幕居中
                    LogD("信息流自渲染 屏幕居中");
                    layoutParams.setMargins((screenWidth-nativeW)/2, (screenHeight-nativeH)/2, (screenWidth-nativeW)/2, (screenHeight-nativeH)/2);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH);
                } else if (nativeSize == 4) {//屏幕居中右
                    LogD("信息流自渲染 屏幕居中右");
                    layoutParams.setMargins(screenWidth-nativeW-10, (screenHeight-nativeH)/2, 10, (screenHeight-nativeH)/2);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH);
                } else if (nativeSize == 3) {//屏幕居中左
                    LogD("信息流自渲染 屏幕居中左");
                    layoutParams.setMargins(10, (screenHeight-nativeH)/2, screenWidth-nativeW-10, (screenHeight-nativeH)/2);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH);
                } else if (nativeSize == 2) {//屏幕居中下
                    LogD("信息流自渲染 屏幕居中下");
                    layoutParams.setMargins((screenWidth-nativeW)/2, screenHeight-nativeH-60, (screenWidth-nativeW)/2, 60);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH+60);
                } else if (nativeSize == 1) {//屏幕居中上
                    LogD("信息流自渲染 屏幕居中上");
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
                LogD("信息流自渲染 广告被点击回调 onADClicked: " + " clickUrl: " + ad.ext.get("clickUrl"));
            }

            @Override
            public void onADError(AdError error) {
                LogD("信息流自渲染 错误回调 onADError error code :" + error.getErrorCode()
                        + "  error msg: " + error.getErrorMsg());
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onADStatusChanged() {
                LogD("信息流自渲染 apk数据更新状态时的回调 onADStatusChanged: ");
                updateAdAction(mDownloadText, ad);
            }
        });
        if (ad.getAdPatternType() == AdPatternType.NATIVE_VIDEO) {
            mHandler.sendEmptyMessage(MSG_VIDEO_START);
            VideoOption videoOption = getVideoOption(mContext.getIntent());
            ad.bindMediaView(mMediaView, videoOption, new NativeADMediaListener() {
                @Override
                public void onVideoInit() {
                    LogD("信息流自渲染 视频组件初始化 onVideoInit: ");
                }

                @Override
                public void onVideoLoading() {
                    LogD("信息流自渲染 视频开始加载 onVideoLoading: ");
                }

                @Override
                public void onVideoReady() {
                    LogD("信息流自渲染 视频组件准备完成 onVideoReady");
                }

                @Override
                public void onVideoLoaded(int videoDuration) {
                    LogD("信息流自渲染 视频加载完成 onVideoLoaded: 视频时长 = " + videoDuration);
                }

                @Override
                public void onVideoStart() {
                    LogD("信息流自渲染 视频开始播放 onVideoStart");
                }

                @Override
                public void onVideoPause() {
                    LogD("信息流自渲染 视频暂停 onVideoPause: ");
                }

                @Override
                public void onVideoResume() {
                    LogD("信息流自渲染 视频继续播放 onVideoResume: ");
                }

                @Override
                public void onVideoCompleted() {
                    LogD("信息流自渲染 视频播放完成 onVideoCompleted: ");
                }

                @Override
                public void onVideoError(AdError error) {
                    LogD("信息流自渲染 视频播放报错 onVideoError: ");
                    adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
                }

                @Override
                public void onVideoStop() {
                    LogD("信息流自渲染 视频播放停止 onVideoStop");
                }

                @Override
                public void onVideoClicked() {
                    LogD("信息流自渲染 onVideoClicked");
                }
            });
        }
        updateAdAction(mDownloadText, ad);
    }
    private static void renderAdUi(NativeUnifiedADData ad) {
        int patternType = ad.getAdPatternType();
        if (patternType == AdPatternType.NATIVE_VIDEO) {
            LogD("信息流自渲染 renderAdUi");
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
            button.setText("立即浏览");
            return;
        }
        switch (ad.getAppStatus()) {
            case 0:
                button.setText("立即下载");
                break;
            case 1:
                button.setText("立即启动");
                break;
            case 2:
                button.setText("立即更新");
                break;
            case 4:
                button.setText("下载中: "+ad.getProgress() + "%");
                break;
            case 8:
                button.setText("立即安装");
                break;
            case 16:
                button.setText("重新下载");
                break;
            default:
                button.setText("立即浏览");
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
            case AdsWrapper.ADS_TYPE_INTER://插屏广告
                inlineid = adInfo.get("adId");
                showInLineAd(mContext);
                break;
            case AdsWrapper.ADS_TYPE_REWARTVIDEO://激励视频广告
                rewardvideoid = adInfo.get("adId");
                showRewardVideoAd(mContext);
                break;
            case AdsWrapper.ADS_TYPE_NATIVE://原生信息流广告
                nativeid = adInfo.get("adId");
                String adSize = adInfo.get("adSize");
                if (adSize != null && !"".equalsIgnoreCase(adSize)) {
                    nativeSize = Integer.valueOf(adSize);
                }
                showNativeAd(mContext);
                break;
            case AdsWrapper.ADS_TYPE_NATIVEUNIFIED://原生信息流自渲染广告
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
            case AdsWrapper.ADS_TYPE_NATIVE://原生信息流广告
                hideNativeAd();
                break;
            case AdsWrapper.ADS_TYPE_NATIVEUNIFIED://原生信息流自渲染广告
                hideNativeUnifiedAd();
                break;
            case AdsWrapper.ADS_TYPE_FULL_SCREEN:
            case AdsWrapper.ADS_TYPE_INTER://插屏广告
            case AdsWrapper.ADS_TYPE_REWARTVIDEO://激励视频广告
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
