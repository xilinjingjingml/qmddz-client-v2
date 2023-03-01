/****************************************************************************
Copyright (c) 2012-2013 cocos2d-x.org

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
package org.cocos2dx.plugin;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.Map.Entry;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.opengl.GLSurfaceView;
import android.os.Handler;
import android.util.Log;
import android.widget.FrameLayout;

public class PluginWrapper {
	
	public static final int ENV_OFFICIAL = 0;
	public static final int ENV_TEST = 1;
	public static final int ENV_MIRROR = 2;
	public static final int ENV_DUFU = 4;
	
	public static int nCurrentRunEnv = ENV_OFFICIAL;

	protected static Context sContext = null;
	protected static GLSurfaceView sGLSurfaceView = null; 
	protected static Handler sMainThreadHandler = null;
	private static final String TAG = "PluginWrapper";
	
	public static ArrayList<Hashtable<String, String>> pluginPlistInfo = new ArrayList<Hashtable<String,String>>();
	
	public static Hashtable<String, Object> m_sRunningPlugins = new Hashtable<String, Object>();
	
	public static FrameLayout mFramelayout = null;
	
	public static boolean addRunningPlugin(String pluginName,Object obj) {
		if(pluginName == null || "".equals(pluginName) || obj == null) return false;
		m_sRunningPlugins.put(pluginName,obj);
		return true;
	}
	
	public static void OnResume() {
		for(Entry<String, Object> var : m_sRunningPlugins.entrySet()) {
			Method[] methods = var.getValue().getClass().getMethods();
			for(Method m : methods) {
				if(m.getName().equals("OnPluginResume")) {
					try {
						m.invoke(var.getValue(), new Object[]{});
					} catch (IllegalAccessException e) {
						e.printStackTrace();
					} catch (IllegalArgumentException e) {
						e.printStackTrace();
					} catch (InvocationTargetException e) {
						e.printStackTrace();
					}
					break;
				}
			}
		}
	}
	public static void onPause() {
		for(Entry<String, Object> var : m_sRunningPlugins.entrySet()) {
			Method[] methods = var.getValue().getClass().getMethods();
			for(Method m : methods) {
				if(m.getName().equals("OnPluginPause")) {
					try {
						m.invoke(var.getValue(), new Object[]{});
					} catch (IllegalAccessException e) {
						e.printStackTrace();
					} catch (IllegalArgumentException e) {
						e.printStackTrace();
					} catch (InvocationTargetException e) {
						e.printStackTrace();
					}
					break;
				}
			}
		}
	}
	
	public static void onExit() {
		for(Entry<String, Object> var : m_sRunningPlugins.entrySet()) {
			Method[] methods = var.getValue().getClass().getMethods();
			for(Method m : methods) {
				if(m.getName().equals("OnPluginDestroy")) {
					try {
						m.invoke(var.getValue(), new Object[]{});
					} catch (IllegalAccessException e) {
						e.printStackTrace();
					} catch (IllegalArgumentException e) {
						e.printStackTrace();
					} catch (InvocationTargetException e) {
						e.printStackTrace();
					}
					break;
				}
			}
		}
	}
	
	public static void init(Context context, final FrameLayout layout)
	{
		sContext = context;
		if (null == sMainThreadHandler) {
			sMainThreadHandler = new Handler();
		}
		mFramelayout = layout;
		BaseActivity.modulesActivityInit((Activity)context);
	}
	
	public static void setGLSurfaceView(GLSurfaceView value) {
		sGLSurfaceView = value;
	}

	protected static Object initPlugin(String classFullName)
	{
		Log.i(TAG, "class name : ----" + classFullName + "----");
        Class<?> c = null;
        String fullName = "";
        try {
        	fullName = classFullName.replace('/', '.');
        	
            c = Class.forName(fullName);
        } catch (ClassNotFoundException e) {  
            Log.e(TAG, "Class " + classFullName + " not found.");
            e.printStackTrace();
            return null;
        }

        try {
        	Context ctx = getContext();
			if (ctx != null) {
	        	Object o = c.getDeclaredConstructor(Context.class).newInstance(ctx);
	        	//20140415
	        	IAPWrapper.setIAPName(o, classFullName);
	        	addRunningPlugin(fullName, o);
	        	//IAPWrapper.addIAPPlugin(findPluginInfo(classFullName), (InterfaceIAP)o);
				return o;
			} else {
				Log.e(TAG, "Plugin " + classFullName + " wasn't initialized.");
			}
        } catch (Exception e) {
			e.printStackTrace();
		}
        return null;
	}
	
	public static PluginInfo findPluginInfo(String pluginName) {
		PluginInfo pi = null;
		
		for(Hashtable<String, String> var : pluginPlistInfo) {
			if(var.get("name").equals(pluginName)) {
				pi = PluginInfo.create(pluginName, var.get("type"));
				break;
			}
		}
		
		return pi;
	}
	
	public static void addPluginConfig(Hashtable<String, String> configInfo) {
		
		String pluginName = configInfo.get("name");
		String pluginType = configInfo.get("type");
		if(pluginName == null || pluginType == null)
			return;
		
		boolean isExist = false;
		for(Hashtable<String, String> var : pluginPlistInfo) {
			if(var.get("name").equals(pluginName) && var.get("type").equals(pluginType)) {
				isExist = true;
				break;
			}
		}
		
		if(isExist)
			return;
		
		System.out.println("addPluginConfigaddPluginConfig");
		System.out.println(configInfo);
		
		pluginPlistInfo.add(configInfo);
	}

	protected static int getPluginType(Object obj) {
		int nRet = -1;
		try
		{
			Field filedID = obj.getClass().getField("PluginType");
			Integer nObj = (Integer) filedID.get(obj);
			nRet = nObj.intValue();
		} catch (Exception e) {
			e.printStackTrace();
		}

		return nRet;
	}

	public static Context getContext() {
		return sContext;
	}
	
	@SuppressLint("NewApi")
	public static void runOnGLThread(Runnable r) {
		if (null != sGLSurfaceView) {
			sGLSurfaceView.queueEvent(r);
		} else {
			Log.i(TAG, "runOnGLThread sGLSurfaceView is null");
			r.run();
		}
		//runOnMainThread(r);
	}

	public static void runOnMainThread(Runnable r) {
		if (null == sMainThreadHandler) return;
		sMainThreadHandler.post(r);
	}
}
