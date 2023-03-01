#baidu
-keepclassmembers public class * extends android.app.Activity {
    public *;
}
-keep public class * extends android.support.v4.app.Fragment
-keep public class * extends android.app.Fragment
# 支付第三方SDK
-keep class com.tencent..** {
    *;
}
-keep class com.alipay.** {
    *;
}
-keep class com.baidu.** {
    *;
}
-dontnote com.baidu.sapi2.**
-dontwarn com.squareup.picasso.**
-dontwarn android.support.test.**
-dontwarn com.baidu.sapi2.**
-dontwarn com.alipay.**
-dontwarn com.baidu.sofire.**
#百度百青藤广告
#-keep class com.baidu.mobads.** { *; }
#-keep class com.baidu.mobad.** { *; }
#-keep class com.bun.miitmdid.core.** {*;}
