package net.technology.spddz.android;

import android.Manifest;
import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.KeyEvent;
import android.widget.Toast;
import com.yixin.sdk.yxads.osk.Listener.YXSplashADListener;
import com.yixin.sdk.yxads.osk.api.YXSplash;
import com.yixin.sdk.yxads.osk.common.YXAdError;
import java.util.ArrayList;
import java.util.List;

/* 在AndroidManifest.xml 里可以配置闪屏， 没有特殊需求可以直接配置闪屏
 <activity android:name="com.yixin.sdk.yxads.osk.act.YXSplashActivity"
 不需要写这个类
*/
public class SplashActivity extends Activity {

    protected final String adptID = "896524";
    protected YXSplash mAd;
    protected boolean mIsADClick = false;
    protected boolean mIsADExposure = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        Log.d("AdsLog", "SplashActivity onCreate ");

        // 如果targetSDKVersion >= 23，就要申请好权限。如果您的App没有适配到Android6.0（即targetSDKVersion < 23），那么只需要在这里直接调用fetchSplashAD接口。
        if (Build.VERSION.SDK_INT >= 23) {
            checkAndRequestPermission();
        } else {
            // 如果是Android6.0以下的机器，默认在安装时获得了所有权限，可以直接调用SDK
            fetchSplashAD();
        }
    }

    protected void goToMainActivity()
    {
        Log.d("AdsLog", "SplashActivity goToMainActivity ");
        startActivity(new Intent(this, AppActivity.class));
        finish();
    }

    //创建广告
    protected void fetchSplashAD() {
        //YXSplash  内部会 mAct.setContentView(resLayoutId);
        mAd = new YXSplash(this, adptID, new YXSplashADListener(){
            @Override
            public void onADDismissed() {
                Log.d("AdsLog", "SplashActivity SplashAD onADDismissed:");
                goToMainActivity();
            }
            @Override
            public void onADError(YXAdError paramAdError) {
                Log.d("AdsLog", "SplashActivity SplashAD onNoAD: errcode:" + paramAdError.getErrorCode() + " errmsg:" + paramAdError.getErrorMsg());
                goToMainActivity();
            }

            @Override
            public void onADPresent(){
                Log.d("AdsLog", "SplashActivity onADPresent:");
            }

            @Override
            public void onADClicked() {
                Log.d("AdsLog", "SplashActivity onADClicked:");
            }

            @Override
            public void onADTick(long paramLong) {
                Log.d("AdsLog", "SplashActivity SplashAD onADTick: " + paramLong);
                mIsADClick = true;
            }

            @Override
            public void onADExposure() {
                Log.d("AdsLog", "SplashActivity SplashAD onADExposure:");
                mIsADExposure = true;
            }
        });
    }

    /**
     *
     * ----------非常重要----------
     *
     * Android6.0以上的权限适配简单示例：
     *
     * 如果targetSDKVersion >= 23，那么必须要申请到所需要的权限，再调用广点通SDK，否则广点通SDK不会工作。
     *
     * Demo代码里是一个基本的权限申请示例，请开发者根据自己的场景合理地编写这部分代码来实现权限申请。
     * 注意：下面的`checkSelfPermission`和`requestPermissions`方法都是在Android6.0的SDK中增加的API，如果您的App还没有适配到Android6.0以上，则不需要调用这些方法，直接调用广点通SDK即可。
     */
    //权限申请成功或者已经全部都有的
    private void permissionSuccess()
    {
        fetchSplashAD();
    }
    //权限获取失败 引导用户调用权限
    private void permissionFail()
    {
        // 如果用户没有授权，那么应该说明意图，引导用户去设置里面授权。
        Toast.makeText(this, "应用缺少必要的权限！请点击\"权限\"，打开所需要的权限。", Toast.LENGTH_LONG).show();
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.parse("package:" + getPackageName()));
        startActivity(intent);
        finish();
    }

    @TargetApi(Build.VERSION_CODES.M)
    private void checkAndRequestPermission() {
        List<String> lackedPermission = new ArrayList<String>();
        if (!(checkSelfPermission(Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED)) {
            lackedPermission.add(Manifest.permission.READ_PHONE_STATE);
        }

        if (!(checkSelfPermission(Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED )){
            lackedPermission.add(Manifest.permission.READ_EXTERNAL_STORAGE);
        }
        if (!(checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED)) {
            lackedPermission.add(Manifest.permission.WRITE_EXTERNAL_STORAGE);
        }

        if (!(checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED)) {
            lackedPermission.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }

        // 权限都已经有了，那么直接调用SDK
        if (lackedPermission.size() == 0) {
            permissionSuccess();
        } else {
            // 请求所缺少的权限，在onRequestPermissionsResult中再看是否获得权限，如果获得权限就可以调用SDK，否则不要调用SDK。
            String[] requestPermissions = new String[lackedPermission.size()];
            lackedPermission.toArray(requestPermissions);
            requestPermissions(requestPermissions, 1024);
        }
    }

    private boolean hasAllPermissionsGranted(int[] grantResults) {
        for (int grantResult : grantResults) {
            if (grantResult == PackageManager.PERMISSION_DENIED) {
                return false;
            }
        }
        return true;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 1024 && hasAllPermissionsGranted(grantResults)) {
            permissionSuccess();
        } else {
            // 如果用户没有授权，那么应该说明意图，引导用户去设置里面授权。
            permissionFail();
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        if(mAd != null)
        {
            mAd.onStop();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if(mAd != null)
        {
            mAd.onPause();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if(mAd != null)
        {
            mAd.onResume();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if(mAd != null)
        {
            mAd.onDestroy();
        }
    }

    /** 开屏页一定要禁止用户对返回按钮的控制，否则将可能导致用户手动退出了App而广告无法正常曝光和计费 */
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK || keyCode == KeyEvent.KEYCODE_HOME) {
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
