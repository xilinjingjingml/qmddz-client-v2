package org.cocos2dx.plugin;

import java.util.Hashtable;
import android.app.Activity;
import android.content.Context;
import android.util.Log;
import com.baidu.gamesdk.BDGameSDK;
import com.baidu.gamesdk.OnGameExitListener;

public class ExtendBaiDu implements InterfaceExtend
{
	private static final String LOG_TAG = "ExtendBaiDu";
	private static Activity mContext = null;
	static ExtendBaiDu mbaidu = null;
	private static boolean bDebug = false;
	private static Hashtable<String, String> extendInfo = null;
	
	protected static void LogE(String msg, Exception e) 
	{
		Log.e(LOG_TAG, msg, e);
		e.printStackTrace();
	}

	protected static void LogD(String msg) 
	{
		if (bDebug) 
		{
			Log.d(LOG_TAG, msg);
		}
	}

	public ExtendBaiDu(Context context)
	{
		mContext = (Activity) context;
		mbaidu = this;
	}
	/**
	 * 游戏退出页(点击返回键)
	 *
	 * @return
	 */
	public void onExit() {
		if (!((Activity) PluginWrapper.getContext()).isFinishing()) {
			PluginWrapper.runOnMainThread(new Runnable() {
				public void run() {
					BDGameSDK.gameExit(mContext, new OnGameExitListener(){
						@Override
						public void onGameExit() {
							//在此处执行您的游戏退出逻辑
							PluginWrapper.onExit();
							mContext.finish();
							android.os.Process.killProcess(android.os.Process.myPid());
						}

					});
				}
			});
		}
	}

	public void jumpToExtend(int tag)
	{
		jumpToExtend(tag, null);
	}

	public void jumpToExtend(int tag, Hashtable<String, String> cpInfo)
	{
		extendInfo = cpInfo;
		switch(tag)
		{
		case 7://退出
			onExit();
			break;
		default:
			break;
		}
	}

	@Override
	public void setDebugMode(boolean debug) 
	{
		bDebug = debug;
	}

	@Override
	public String getSDKVersion() 
	{
		return "1.3.0";
	}

	@Override
	public String getPluginVersion() 
	{
		return "1.0.0";
	}
	
}
