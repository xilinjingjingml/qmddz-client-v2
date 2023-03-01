package org.cocos2dx.plugin;

import java.util.Hashtable;
import org.cocos2dx.config.MsgStringConfig;
import android.app.Activity;
import android.content.Context;
import android.util.Log;

/**
 * 游客登录实现类
 * @author yufeilong
 * @version 0.2.0
 */

public class SessionGuest implements InterfaceSession
{
	private static final String LOG_TAG = "SessionGuest";
	private static Activity mContext = null;
	private static SessionGuest mGuset = null;
	private static boolean bDebug = false;
	
	private static Hashtable<String, String> configInfo = null;
	private static Hashtable<String, String> loginInfo = null;
	private static String loginhost = null;
	
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

	public SessionGuest(Context context) 
	{
		mContext = (Activity) context;
		mGuset = this;
	}
	
	/**
	 * 获取游戏相关基本配置
	 */
	@Override
	public void configGameInfo(Hashtable<String, String> gameInfo) 
	{
		SessionWrapper.gameInfo = gameInfo;
	}
	
	/**
	 * 配置SDK初始化相关信息
	 */
	@Override
	public void configDeveloperInfo(Hashtable<String, String> cpInfo) 
	{
		if(cpInfo != null && !cpInfo.isEmpty())
		{
			configInfo = new Hashtable<String, String>(cpInfo);
		}
		else
		{
			LogD("config developer error !!!");
		}
	}
	
	/**
	 * 设置登录参数
	 */
	@Override
	public Hashtable<String, String> getLoginRequestParams() 
	{
		if (loginInfo == null){
			loginInfo = new Hashtable<String, String>();
		}
		try
		{
			String version = PlatformWP.getInstance().getVersionName();
	        String imei = PlatformWP.getInstance().getDeviceIMEI();
	        String name = PlatformWP.getInstance().getDeviceName();
	        String pn = SessionWrapper.gameInfo.get("PacketName");
//	        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");        
//	        Date curDate = new Date(System.currentTimeMillis());//获取当前时间
//	        String time = formatter.format(curDate);
//	        
//	        StringBuffer sb = new StringBuffer();
//			sb.append("pid=").append(0).append("&ticket=").append("").append("&pn=")
//				.append(pn).append("&imei=").append(imei).append("&time=").append(time)
//				.append("#").append("sadfw2342418u309snsfw");
//			String sign = MD5Util.md5Digest(sb.toString());

	        loginInfo.put("imei", imei);
	        loginInfo.put("name", name);
	        loginInfo.put("pn", 	pn);
	        loginInfo.put("version", version);
//			loginParams.put("sign", sign);
			
		}
		catch(NullPointerException e)
		{
			LogE("Login params error !!!", e);
			loginInfo = null;
		}
		
		return loginInfo;
	}

	/**
	 * 用户登录
	 * 
	 * @param
	 */
	@Override
	public void userLogin() 
	{
		if(!PlatformWP.networkReachable(mContext)) 
		{
			sessionResult(SessionWrapper.SESSIONRESULT_FAIL,MsgStringConfig.msgNetworkError);
			
			return;
		}
		if (loginhost != null){
			SessionWrapper.startOnLoginNew(mGuset, loginhost+"new/gateway/visitor/login", getLoginRequestParams(), null);
		}else{
			SessionWrapper.startOnLogin(mGuset, "new/gateway/visitor/login", getLoginRequestParams());
		}	
	}
	public void userItemsLogin(Hashtable<String,String> loginItemsInfo){
		if (loginInfo != null){
			if (!loginInfo.isEmpty()){
				loginInfo.clear();
			}
		}
		loginInfo = loginItemsInfo;
		loginhost = loginInfo.get("LoginHost");

		userLogin();
	}
	 
	/**
	 * 登录结果回调
	 * 
	 * @param ret
	 * @param msg
	 */
	private static void sessionResult(int ret, String msg) 
	{
		LogD("SessionGuest result : " + ret + " msg : " + msg);
		SessionWrapper.onSessionResult(mGuset, ret, msg);
	}
	
	@Override
	public void setRunEnv(int env) 
	{
		SessionWrapper.setRunEnv(env);
	}
	
	@Override
	public void setDebugMode(boolean debug) 
	{
		bDebug = debug;
	}
	@Override
	public String getSDKVersion() 
	{
		return "0.2.0";
	}
	@Override
	public String getPluginVersion() 
	{
		return "0.2.0";
	}

	@Override
	public void userLogout() {
		sessionResult(SessionWrapper.SESSIONRESULT_SWITCH_ACCOUNT, MsgStringConfig.msgLogoutSuccess);
	}
}
