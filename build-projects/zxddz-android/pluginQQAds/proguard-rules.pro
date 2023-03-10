#qqads
-dontwarn com.androidquery.**
-keep class com.androidquery.** { *;}

-dontwarn tv.danmaku.**
-keep class tv.danmaku.** { *;}

-dontwarn androidx.**

# 如果使用了tbs版本的sdk需要进行以下配置
-keep class com.tencent.smtt.** { *; }
-dontwarn dalvik.**
-dontwarn com.tencent.smtt.**
# 如果使用了微信OpenSDK，需要添加如下配置
-keep class com.tencent.mm.opensdk.** {
    *;
}
-keep class com.tencent.wxop.** {
    *;
}
-keep class com.tencent.mm.sdk.** {
    *;
}
# 如果接入了Bugly，需要添加如下配置
-dontwarn com.tencent.bugly.**
-keep public class com.tencent.bugly.**{*;}
# Google IMA
-keep class com.google.obf.** { *; }
-keep interface com.google.obf.** { *; }
-keep class com.google.ads.interactivemedia.** { *; }
-keep interface com.google.ads.interactivemedia.** { *; }
-dontwarn com.google.ads.interactivemedia.**
# 穿山甲
-keep class com.bytedance.sdk.openadsdk.** { *; }
-keep class com.androidquery.callback.** {*;}
-keep public interface com.bytedance.sdk.openadsdk.downloadnew.** {*;}
-keep class com.ss.sys.ces.* {*;}
-dontwarn com.ss.android.socialbase.downloader.**
-dontwarn com.ss.android.crash.log.**
# 百度
-keep class com.baidu.mobads.*.** { *; }
-keep class com.baidu.mobad.*.** { *; }
# MTG
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.mintegral.** {*; }
-keep interface com.mintegral.** {*; }
-keep class android.support.v4.** { *; }
-dontwarn com.mintegral.**
-keep class **.R$* { public static final int mintegral*; }
-keep class com.alphab.** {*; }
-keep interface com.alphab.** {*; }
# 快手
-dontwarn com.ksad.download.**
-dontwarn com.kwad.sdk.**
# qapm 平台
-keep class com.tencent.qapmsdk.**{*;}
-dontwarn com.tencent.qapmsdk.**
-dontnote com.tencent.qapmsdk.**

-dontpreverify# 不做预校验
-ignorewarnings
