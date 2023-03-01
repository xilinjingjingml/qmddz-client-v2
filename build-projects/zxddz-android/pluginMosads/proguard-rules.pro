#mosads
-keep class com.qq.e.** {
    public protected *;
}
-keep class android.support.v4.**{
    public *;
}
-keep class android.support.v7.**{
    public *;
}
-keep class com.bytedance.sdk.openadsdk.** { *; }
-keep public interface com.bytedance.sdk.openadsdk.downloadnew.** {*;}
-keep class com.ss.sys.ces.* { *; }
-keep class com.androidquery.callback.** { *; }
-keep class com.yixin.ttlib.** {
    public protected *;
}
-keep class com.mosads.adslib.* { *; }
-keep class com.mosads.adslib.Splash.* { *; }
-keep class com.mosads.adslib.tt.utils.** {
    public protected *;
}