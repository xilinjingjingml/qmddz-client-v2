package org.cocos2dx.plugin;

import com.fm.openinstall.OpenInstall;
import com.tencent.mmkv.MMKV;
import android.annotation.SuppressLint;
import android.app.ActivityManager;
import android.app.Application;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.util.Log;

public class BaseApplication extends Application {
	
	private static final String[] MODULESLIST =
	        {"org.cocos2dx.plugin.IAPVIVO",
            "org.cocos2dx.plugin.ExtendQIYUKF",
	        "org.cocos2dx.plugin.SessionMiui",
	        "org.cocos2dx.plugin.SessionHuaWei",
	        "org.cocos2dx.plugin.SessionMangGuo",
			"org.cocos2dx.plugin.AnalyticsAdjust",
            "org.cocos2dx.plugin.SessionShanYan",
            "org.cocos2dx.plugin.AdsHyAdXOpen",
            "org.cocos2dx.plugin.SessionBaiDu",
			"org.cocos2dx.plugin.AdsGather",
            "org.cocos2dx.plugin.AdsTTAds",
            "org.cocos2dx.plugin.AdsQQAds",
            "org.cocos2dx.plugin.AdsYXAds",
			"org.cocos2dx.plugin.AdsHWAds",
            "org.cocos2dx.plugin.AdsBDAds"
			};

    @Override
    public void onCreate() {
        super.onCreate();
        if (isMainProcess()) {
            OpenInstall.init(this);
        }
        MMKV.initialize(this);
        //Module类的APP初始化
        modulesApplicationInit();
    }

    @SuppressLint("NewApi")
    public boolean isMainProcess() {
    	ApplicationInfo info = null;
		try {
			info = this.getPackageManager().getApplicationInfo(
					this.getPackageName(), 
					PackageManager.GET_META_DATA);
			if (info.metaData != null) {
				String appkey = String.valueOf(info.metaData.get("com.openinstall.APP_KEY"));
				if ("null".equalsIgnoreCase(appkey)){
					return false;
				}
			}
		} catch (NameNotFoundException e) {
			e.printStackTrace();
			return false;
		}
        int pid = android.os.Process.myPid();
        ActivityManager activityManager = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningAppProcessInfo appProcess : activityManager.getRunningAppProcesses()) {
            if (appProcess.pid == pid) {
                return getApplicationInfo().packageName.equals(appProcess.processName);
            }
        }
        return false;
    }
    private void modulesApplicationInit(){
        for (String moduleImpl : MODULESLIST){
            try {
                Class<?> clazz = Class.forName(moduleImpl);
                Object obj = clazz.newInstance();
                if (obj instanceof ModuleApplication){
                    ((ModuleApplication) obj).onCreate(this);
                }
            } catch (ClassNotFoundException e) {
                //e.printStackTrace();
                Log.d(moduleImpl, moduleImpl+" plugin is existent!");
            } catch (IllegalAccessException e) {
                //e.printStackTrace();
                Log.d(moduleImpl, moduleImpl+" plugin is existent!");
            } catch (InstantiationException e) {
                //e.printStackTrace();
                Log.d(moduleImpl, moduleImpl+" plugin is existent!");
            }
         }
   }
}
