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
    private static int nativeSize = 5;//上1下2左3右4中5，默认中5
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
                .useTextureView(true) //使用TextureView控件播放视频,默认为SurfaceView,当有SurfaceView冲突的场景，可以使用TextureView
                .appName(appname)
                .titleBarTheme(TTAdConstant.TITLE_BAR_THEME_DARK)// 可选参数，设置落地页主题，默认为TTAdConstant#TITLE_BAR_THEME_LIGHT
                .allowShowNotify(true) // 可选参数，设置是否允许SDK弹出通知：true允许、false禁止。默认为true允许
                .debug(false) // 可选参数，是否打开debug调试信息输出：true打开、false关闭。默认false关闭
                .directDownloadNetworkType(TTAdConstant.NETWORK_STATE_WIFI, TTAdConstant.NETWORK_STATE_3G) //允许直接下载的网络状态集合
                .supportMultiProcess(false)//可选参数，设置是否支持多进程：true支持、false不支持。默认为false不支持
                .needClearTaskReset()
                //.httpStack(new MyOkStack3())//自定义网络库，demo中给出了okhttp3版本的样例，其余请自行开发或者咨询工作人员。
                //隐私信息控制开关
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
        //banner广告
        if (bannerid == null || "0".equalsIgnoreCase(bannerid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        //创建广告请求参数AdSlot
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId(bannerid)//广告位id
                .setSupportDeepLink(true)
                .setExpressViewAcceptedSize(327, 109)//期望模板广告view的size,单位dp
                .setAdCount(3)//请求广告数量为1到3条
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
                    LogD("loadBannerExpressAd onNativeExpressAdLoad 加载广告失败");
                    adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
                    return;
                }
                LogD("loadBannerExpressAd onNativeExpressAdLoad 加载广告成功");
                mTTAd = list.get(0);
                mTTAd.setSlideIntervalTime(30*1000);//设置轮播间隔 ms,不调用则不进行轮播展示
                bindBannerAdListener(mContext);
                mTTAd.render();//调用render开始渲染广告
            }
        });
        bannerContainer.removeAllViews();
        layout.setVisibility(View.VISIBLE);
    }
    //绑定banner广告行为
    private static void bindBannerAdListener(final Activity mContext) {
        mTTAd.setExpressInteractionListener(new TTNativeExpressAd.ExpressAdInteractionListener() {

            @Override
            public void onAdClicked(View view, int type) {
                LogD("banner广告被点击");
            }

            @Override
            public void onAdShow(View view, int type) {
                LogD("banner广告展示 view.getWidth()="+view.getWidth()+", view.getHeight()="+view.getHeight());
            }

            @Override
            public void onRenderFail(View view, String msg, int code) {
                LogD("banner广告渲染失败, msg=" + msg + ", code=" + code);
                adsResult(AdsWrapper.RESULT_CODE_BANNER_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onRenderSuccess(View view, float width, float height) {
                LogD("banner广告渲染成功 view.getWidth()="+view.getWidth()+", view.getHeight()="+view.getHeight()+", width="+width+", height="+height);

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
                LogD("banner广告，点击开始下载");
            }

            @Override
            public void onDownloadActive(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("banner广告，下载中，点击暂停");
            }

            @Override
            public void onDownloadPaused(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("banner广告，下载暂停，点击继续");
            }

            @Override
            public void onDownloadFailed(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("banner广告，下载失败，点击重新下载");
            }

            @Override
            public void onDownloadFinished(long totalBytes, String fileName, String appName) {
                LogD("banner广告，点击安装");
            }

            @Override
            public void onInstalled(String fileName, String appName) {
                //LogD("banner广告，安装完成，点击图片打开");
            }
        });
    }
    /**
     * 设置广告的不喜欢, 注意：强烈建议设置该逻辑，如果不设置dislike处理逻辑，则模板广告中的 dislike区域不响应dislike事件。
     */
    private static void bindDislike(Activity mContext) {
        //使用默认模板中默认dislike弹出样式
        mTTAd.setDislikeCallback(mContext, new TTAdDislike.DislikeInteractionCallback() {
            @Override
            public void onSelected(int position, String value) {
                LogD("广告的不喜欢点击: " + value);
                //用户选择不喜欢原因后，移除广告展示
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
                LogD("广告的不喜欢点击取消");
            }

            public void onRefuse() {
                LogD("您已成功提交反馈，请勿重复提交哦！");
            }
        });
    }

    public static void loadRewardVideo(final Activity mContext) {
        if (rewardvideoid == null || "0".equalsIgnoreCase(rewardvideoid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        //激励视频广告
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId(rewardvideoid)
                .setSupportDeepLink(true)
                //模板广告需要设置期望个性化模板广告的大小,单位dp,激励视频场景，只要设置的值大于0即可
                .setExpressViewAcceptedSize(500,500)
                //必传参数，表来标识应用侧唯一用户；若非服务器回调模式或不需sdk透传
                //可设置为空字符串
                .setUserID("")
                .setOrientation(TTAdConstant.HORIZONTAL) //必填参数，期望视频的播放方向：TTAdConstant.HORIZONTAL 或 TTAdConstant.VERTICAL
                .build();
        mTTAdNative.loadRewardVideoAd(adSlot, new TTAdNative.RewardVideoAdListener() {

            @Override
            public void onError(int code, String message) {
                LogD("视频广告onError: code=" + code + ", message=" + message);
                adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_FAIL, MsgStringConfig.msgAdsFail);
                isvideoload = false;
                isRewardVideo = false;
            }

            @Override
            public void onRewardVideoAdLoad(TTRewardVideoAd ttRewardVideoAd) {
                LogD("onRewardVideoAdLoad 视频广告加载后的视频文件资源缓存到本地");
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
                        LogD("onAdClose 激励视频广告关闭");
                        adsResult(AdsWrapper.RESULT_CODE_REWARTVIDEO_CLOSE, MsgStringConfig.msgAdsClose);
                    }

                    @Override
                    public void onVideoComplete() {
                        LogD("onVideoComplete 激励视频广告播放完成");
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
                        //视频播放完成后，奖励验证回调
                        // rewardVerify：是否有效，rewardAmount：奖励梳理，rewardName：奖励名称
                        LogD("onRewardVerify 视频播放完成后，奖励验证");
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
                        //LogD("视频广告onIdle");
                    }

                    @Override
                    public void onDownloadActive(long totalBytes, long currBytes, String fileName, String appName) {
                        LogD("视频广告onDownloadActive 下载中");
                        LogD("totalBytes=" + totalBytes + ", currBytes=" + currBytes + ", fileName=" + fileName + ", appName=" + appName);
                    }

                    @Override
                    public void onDownloadPaused(long totalBytes, long currBytes, String fileName, String appName) {
                        LogD("视频广告onDownloadPaused 下载暂停");
                        LogD("totalBytes=" + totalBytes + ", currBytes=" + currBytes + ", fileName=" + fileName + ", appName=" + appName);
                    }

                    @Override
                    public void onDownloadFailed(long totalBytes, long currBytes, String fileName, String appName) {
                        LogD("视频广告onDownloadFailed 下载失败");
                        LogD("totalBytes=" + totalBytes + ", currBytes=" + currBytes + ", fileName=" + fileName + ", appName=" + appName);
                    }

                    @Override
                    public void onDownloadFinished(long totalBytes, String fileName, String appName) {
                        LogD("视频广告onDownloadFinished 下载完成");
                        LogD("totalBytes=" + totalBytes + ", fileName=" + fileName + ", appName=" + appName);
                    }

                    @Override
                    public void onInstalled(String fileName, String appName) {
                        LogD("视频广告onInstalled 安装完成");
                        LogD("fileName=" + fileName + ", appName=" + appName);
                    }
                });
                mRewardVideo.showRewardVideoAd(mContext);
            }

            @Override
            public void onRewardVideoCached() {
                LogD("onRewardVideoCached 视频广告加载后的视频文件资源缓存到本地");
            }
        });
        isvideoload = true;
    }

    private static void loadInLine(final Activity mContext) {
        //插屏广告
        if (inlineid == null || "0".equalsIgnoreCase(inlineid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_INTER_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId(inlineid)
                .setSupportDeepLink(true)
                .setAdCount(1) //请求广告数量为1到3条
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
                mTTAd.render();//调用render开始渲染广告
            }
        });
    }
    private static void bindInLineAdListener(final Activity mContext, TTNativeExpressAd ad) {
        ad.setExpressInteractionListener(new TTNativeExpressAd.AdInteractionListener() {

            @Override
            public void onAdClicked(View view, int type) {
                Log.d(LOG_TAG, "插屏广告被点击");
            }

            @Override
            public void onAdShow(View view, int type) {
                Log.d(LOG_TAG, "插屏广告展示");
                adsResult(AdsWrapper.RESULT_CODE_INTER_SUCCEES, MsgStringConfig.msgAdsSuccess);
            }

            @Override
            public void onRenderFail(View view, String msg, int code) {
                Log.d(LOG_TAG, "插屏render fail : code = " + code + ", msg = " + msg);
                adsResult(AdsWrapper.RESULT_CODE_INTER_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onRenderSuccess(View view, float width, float height) {
                Log.d(LOG_TAG, "插屏广告渲染成功 : width = " + width + ", height = " + height);
                mTTAd.showInteractionExpressAd(mContext);
            }

            @Override
            public void onAdDismiss() {
                Log.d(LOG_TAG, "插屏广告关闭");
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
                LogD("插屏广告，点击开始下载");
            }

            @Override
            public void onDownloadActive(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("插屏广告，下载中，点击暂停");
            }

            @Override
            public void onDownloadPaused(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("插屏广告，下载暂停，点击继续");
            }

            @Override
            public void onDownloadFailed(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("插屏广告，下载失败，点击重新下载");
            }

            @Override
            public void onInstalled(String fileName, String appName) {
                LogD("插屏广告，安装完成，点击图片打开");
            }

            @Override
            public void onDownloadFinished(long totalBytes, String fileName, String appName) {
                //LogD("插屏广告，点击安装");
            }
        });
    }

    private static void loadNative(final Activity mContext) {
        //原生信息流广告
        if (nativeid == null || "0".equalsIgnoreCase(nativeid) || isInit == false) {
            adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            return;
        }
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId(nativeid)
                .setSupportDeepLink(true)
                .setAdCount(1) //请求广告数量为1到3条
                .setExpressViewAcceptedSize(375, 284)//高度设置为0,则高度会自适应
                .build();
        mTTAdNative.loadNativeExpressAd(adSlot, new TTAdNative.NativeExpressAdListener() {

            @Override
            public void onError(int code, String message) {
                LogD("原生信息流广告NativeExpressAdListener onError : " + code + ", " + message);
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onNativeExpressAdLoad(List<TTNativeExpressAd> ads) {
                if (ads == null || ads.size() == 0) {
                    return;
                }
                mTTAd = ads.get(0);
                bindNativeAdListener(mContext, mTTAd);
                mTTAd.render();//调用render开始渲染广告
            }
        });
        nativeContainer.removeAllViews();
        nativeView.setVisibility(View.VISIBLE);
    }
    private static void bindNativeAdListener(final Activity mContext, TTNativeExpressAd ad) {
        ad.setExpressInteractionListener(new TTNativeExpressAd.ExpressAdInteractionListener() {

            @Override
            public void onAdClicked(View view, int type) {
                LogD("原生信息流广告被点击");
            }

            @Override
            public void onAdShow(View view, int type) {
                LogD("原生信息流广告展示 onAdShow : viewwidth = " + view.getWidth() + ", viewheight = " + view.getHeight());
                int nativeW = view.getWidth();
                int nativeH = view.getHeight();
                RelativeLayout.LayoutParams layoutParams = (RelativeLayout.LayoutParams)nativeContainer.getLayoutParams();
                Display display = mContext.getWindowManager().getDefaultDisplay();
                Point size = new Point();
                display.getRealSize(size);
                int screenWidth = size.x;
                int screenHeight = size.y;
                LogD("原生信息流广告 onAdShow width-display :" + screenWidth);
                LogD("原生信息流广告 onAdShow height-display :" + screenHeight);
                String nw = "";
                String nh = "";
                if (nativeSize == 5) {//屏幕居中
                    LogD("屏幕居中");
                    layoutParams.setMargins((screenWidth-nativeW)/2, (screenHeight-nativeH)/2, (screenWidth-nativeW)/2, (screenHeight-nativeH)/2);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH);
                } else if (nativeSize == 4) {//屏幕居中右
                    LogD("屏幕居中右");
                    layoutParams.setMargins(screenWidth-nativeW-10, (screenHeight-nativeH)/2, 10, (screenHeight-nativeH)/2);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH);
                } else if (nativeSize == 3) {//屏幕居中左
                    LogD("屏幕居中左");
                    layoutParams.setMargins(10, (screenHeight-nativeH)/2, screenWidth-nativeW-10, (screenHeight-nativeH)/2);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH);
                } else if (nativeSize == 2) {//屏幕居中下
                    LogD("屏幕居中下");
                    layoutParams.setMargins((screenWidth-nativeW)/2, screenHeight-nativeH-60, (screenWidth-nativeW)/2, 60);
                    nw = String.valueOf(nativeW);
                    nh = String.valueOf(nativeH+60);
                } else if (nativeSize == 1) {//屏幕居中上
                    LogD("屏幕居中上");
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
                LogD("原生信息流广告render fail : code = " + code + ", msg = " + msg);
                adsResult(AdsWrapper.RESULT_CODE_NATIVE_FAIL, MsgStringConfig.msgAdsFail);
            }

            @Override
            public void onRenderSuccess(View view, float width, float height) {
                LogD("原生信息流广告渲染成功 : width = " + width + ", height = " + height);
                LogD("原生信息流广告渲染成功 : viewwidth = " + view.getWidth() + ", viewheight = " + view.getHeight());
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
                LogD("原生信息流广告，点击开始下载");
            }

            @Override
            public void onDownloadActive(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("原生信息流广告，下载中，点击暂停");
            }

            @Override
            public void onDownloadPaused(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("原生信息流广告，下载暂停，点击继续");
            }

            @Override
            public void onDownloadFailed(long totalBytes, long currBytes, String fileName, String appName) {
                LogD("原生信息流广告，下载失败，点击重新下载");
            }

            @Override
            public void onInstalled(String fileName, String appName) {
                LogD("原生信息流广告，安装完成，点击图片打开");
            }

            @Override
            public void onDownloadFinished(long totalBytes, String fileName, String appName) {
                //LogD("原生信息流广告，点击安装");
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
            case AdsWrapper.ADS_TYPE_INTER://插屏广告
            case AdsWrapper.ADS_TYPE_REWARTVIDEO://激励视频广告
            default:
                break;
            case AdsWrapper.ADS_TYPE_NATIVE://原生信息流广告
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
