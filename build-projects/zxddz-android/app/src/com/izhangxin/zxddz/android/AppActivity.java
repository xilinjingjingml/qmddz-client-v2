/****************************************************************************
Copyright (c) 2015-2016 Chukong Technologies Inc.
Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 
http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package com.izhangxin.zxddz.android;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import org.cocos2dx.plugin.ActivityResultDelegate;
import org.cocos2dx.plugin.ActivityResultListener;
//import org.cocos2dx.plugin.BaiDuAds;
import org.cocos2dx.plugin.PlatformWP;
import org.cocos2dx.plugin.PlatformWrapper;
import org.cocos2dx.plugin.PluginWrapper;
import org.cocos2dx.plugin.QQAds;
import org.cocos2dx.plugin.TTAds;
import android.net.Uri;
import android.os.Bundle;
import android.content.Intent;
import android.content.res.Configuration;
import androidx.annotation.NonNull;
import android.view.WindowManager;
import com.fm.openinstall.OpenInstall;
import com.fm.openinstall.listener.AppWakeUpAdapter;
import com.fm.openinstall.model.AppData;
import com.izhangxin.utils.luaj;
//import com.meituan.android.walle.ChannelInfo;
//import com.meituan.android.walle.WalleChannelReader;

public class AppActivity extends Cocos2dxActivity implements ActivityResultListener {
    private static ActivityResultDelegate mDelegate;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            // Android launched another instance of the root activity into an existing task
            //  so just quietly finish and go away, dropping the user back into the activity
            //  at the top of the stack (ie: the last state of this task)
            // Don't need to finish it again since it's finished in super.onCreate .
            return;
        }
        this.getGLSurfaceView().requestFocus();
        // 屏幕常亮
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // for plugins
        PluginWrapper.init(this, this.mFrameLayout);
        PluginWrapper.setGLSurfaceView(Cocos2dxGLSurfaceView.getInstance());
        luaj.init(this);

        Intent intent = getIntent();
        if (null != intent) {
            processExtraData(intent);
        }

        //获取唤醒参数
        OpenInstall.getWakeUp(intent, wakeUpAdapter);
    }
    
    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

        return glSurfaceView;
    }

    @Override
    protected void onResume() {
        super.onResume();
        PluginWrapper.OnResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        PluginWrapper.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        PluginWrapper.onExit();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        luaj.onActivityResult(requestCode, resultCode, data);
        if (mDelegate != null){
            mDelegate.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

        if (TTAds.isRewardVideo) {
            TTAds.showRewardVideoAd(this);
        }
        if (QQAds.isRewardVideo) {
            QQAds.showRewardVideoAd(this);
        }
//        if (BaiDuAds.isRewardVideo) {
//            BaiDuAds.showRewardVideoAd(this);
//        }

        processExtraData(intent);

        // 此处要调用，否则App在后台运行时，会无法截获
        OpenInstall.getWakeUp(intent, wakeUpAdapter);
    }

    protected void processExtraData(Intent intent) {
        luaj.privateRoomCode = "";
        try {
            luaj.privateRoomCode = null;
            Uri uridata = intent.getData();
            if (null != uridata){
                luaj.privateRoomCode = uridata.getQueryParameter("param");
            }
            this.getIntent().setData(null);
        } catch (Exception e) {
        }
    }

    @Override
    protected void onRestart() {
        super.onRestart();
    }

    @Override
    protected void onStop() {
        super.onStop();
    }
        
    @Override
    public void onBackPressed() {
        super.onBackPressed();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onStart() {
        super.onStart();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        luaj.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    AppWakeUpAdapter wakeUpAdapter = new AppWakeUpAdapter() {
        @Override
        public void onWakeUp(AppData appData) {
            //获取绑定数据
            String bindData = appData.getData();
            //Log.d("OpenInstall", "getWakeUp : wakeupData = " + appData.toString());
            if (PlatformWP.mPlatformwp != null) {
                PlatformWrapper.onPlatformResult(PlatformWP.mPlatformwp, PlatformWrapper.GET_OPENINSTALL_PARAMS,
                        "获取app安装参数", bindData);
            }
        }
    };
	
	@Override
    public void setActivityResultDelegate(ActivityResultDelegate delegate) {
        mDelegate = delegate;
    }
}
