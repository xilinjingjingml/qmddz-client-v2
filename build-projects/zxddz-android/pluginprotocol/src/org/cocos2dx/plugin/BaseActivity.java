package org.cocos2dx.plugin;

import android.app.Activity;
import android.util.Log;

public class BaseActivity {
	
	private static final String[] MODULESLIST =
	        {
	        "org.cocos2dx.plugin.SessionHuaWei",
	        "org.cocos2dx.plugin.SessionMangGuo",
            "org.cocos2dx.plugin.SessionShanYan",
            "org.cocos2dx.plugin.SessionBaiDu",
            "org.cocos2dx.plugin.SessionYSDKQQ"
			};

	public static void modulesActivityInit(Activity activity){
		for (String moduleImpl : MODULESLIST){
            try {
                Class<?> clazz = Class.forName(moduleImpl);
                Object obj = clazz.newInstance();
                if (obj instanceof ModuleActivity){
                    ((ModuleActivity) obj).onCreate(activity);
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
