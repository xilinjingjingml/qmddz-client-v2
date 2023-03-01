package org.cocos2dx.plugin;

import java.util.Hashtable;
import org.cocos2dx.config.MsgStringConfig;
import org.json.JSONException;
import org.json.JSONObject;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;
import com.tencent.mmkv.MMKV;
import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

public class SessionWeiXin implements InterfaceSession 
{
	private static final String LOG_TAG = "SessionWeiXin";
	private static Activity mContext = null;
	private static boolean bDebug = true;
	static SessionWeiXin mweixin = null;
	private static Hashtable<String, String> configInfo = null;
	private static Hashtable<String, String> loginInfo = null;
	public static String appid = "";
	//private static String userId = "";
	public static String code = "";
	private static String openid = "";
	private static String access_token = "";
	private static String refresh_token = "";
	private static boolean isinit = false;
	private static IWXAPI mWeiXinApi = null;
	public static boolean isloginsuccess = false;
	private static MMKV preferences;
	private static SharedPreferences.Editor editor;
	private static String loginhost = "";
	
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

	public SessionWeiXin(Context context) 
	{
		mContext = (Activity) context;
		mweixin = this;

		//preferences = mContext.getSharedPreferences("wpwxlogin", 0);// 记录一些信息，使用SharePreferences更方便。
		preferences = MMKV.mmkvWithID("wpwxlogin");
		// 迁移旧数据
		{
			SharedPreferences old_man = mContext.getSharedPreferences("wpwxlogin", Context.MODE_PRIVATE);
			preferences.importFromSharedPreferences(old_man);
			old_man.edit().clear().commit();
		}
		editor = preferences.edit();
	}
	
	public static void SetLoginSuccess(boolean flag){
		isloginsuccess = flag;
	}
	
	public static boolean GetLoginSuccess(){
		return isloginsuccess;
	}

	/**
	 * 配置游戏相关信息，包括pn等信息
	 */
	@Override
	public void configGameInfo(Hashtable<String, String> configGmeInfo) 
	{
		SessionWrapper.gameInfo = configGmeInfo;
	}

	/**
	 * 配置应用程序开发信息,应用程序只需加载一次
	 * 
	 * @param cpInfo
	 */
	@Override
	public void configDeveloperInfo(Hashtable<String, String> cpInfo) 
	{
		LogD("initDeveloperInfo invoked " + cpInfo.toString());

		configInfo = new Hashtable<String, String>(cpInfo);

		try 
		{
			appid = PlatformWP.getMetaName("wxapiAppID");
			if (isinit == false){
				
				mWeiXinApi = WXAPIFactory.createWXAPI(mContext, appid);
				isinit = true;
			}
		} 
		catch (Exception e) 
		{
			LogE("sdk init error", e);
		}
	}
	
	@Override
	public void setDebugMode(boolean debug) 
	{
		bDebug = debug;
	}
	
	public void setRunEnv(int env)
	{
		SessionWrapper.setRunEnv(env);
	}
	
	public static void sessionResult(int ret, String msg) 
	{
		SessionWrapper.onSessionResult(mweixin, ret, msg);
		LogD("mweixin result : " + ret + " msg : " + msg);
	}

	/**
	 * 用户录用，先通过sdk登录，然后登录服务器
	 */
	public void userLogin()
	{
		LogD("start login sdk ...");
		
		if(!PlatformWP.networkReachable(mContext))
		{
			sessionResult(SessionWrapper.SESSIONRESULT_FAIL, MsgStringConfig.msgNetworkError);
			return;
		}
		
		if (!mWeiXinApi.isWXAppInstalled()){
			sessionResult(SessionWrapper.SESSIONRESULT_FAIL, MsgStringConfig.msgWeiXinUninstall);
			return;
		}
		
		mContext.runOnUiThread(new Runnable()
		{
			@Override
			public void run()
			{
				String isbing = loginInfo.get("isBinding");
				if (isbing != null && "1".equalsIgnoreCase(isbing)){
					WXLogin();
				}else{
					if (ReadWXLogin()){
						code = "";
						if ("".equals(loginhost) || loginhost == null){
							SessionWrapper.startOnLogin(mweixin, "new/gateway/webchat/login", getLoginParams(), loginListener);
						}else{
							SessionWrapper.startOnLoginNew(mweixin, loginhost+"new/gateway/webchat/login", getLoginParams(), loginListener);
						}
					}else {
						WXLogin();
					}
				}
			}
		});
	}
	
	public void userItemsLogin(Hashtable<String,String> loginItemsInfo)
	{
		LogD("start login sdk ...");
		if (loginInfo != null){
			if (!loginInfo.isEmpty()){
				loginInfo.clear();
			}
		}
		loginInfo = loginItemsInfo;
		loginhost = loginInfo.get("LoginHost");

		userLogin();
	}
	
	public static void WXLogin(){
		mWeiXinApi.registerApp(appid);
        SendAuth.Req req = new SendAuth.Req();
        req.openId = appid;
        //应用授权作用域，如获取用户个人信息则填写snsapi_userinfo
        req.scope = "snsapi_userinfo";
        //用于保持请求和回调的状态，授权请求后原样带回给第三方
        req.state = "SessionWeiXin";
        mWeiXinApi.sendReq(req);
	}

	private static LoginResultListener loginListener = new LoginResultListener(){

		@Override
		public void loginResult(int ret, String msg0, JSONObject json) {
			if (json == null) {
				CleanWXLogin();
				sessionResult(ret, msg0);
				return;
			}
			try {
				String jret = json.getString("ret");
				if (jret.equalsIgnoreCase("0")){
					try {
						access_token = json.getString("accessToken");
						refresh_token = json.getString("refreshToken");
						openid = json.getString("openId");
						SaveWXLogin();
					} catch (JSONException e) {
						e.printStackTrace();
					}
					SetLoginSuccess(true);
					sessionResult(ret, msg0);
				}else if (jret.equalsIgnoreCase("10259")){
					CleanWXLogin();
					WXLogin();
				}else {
					String msg = "";
					try {
						msg = json.getString("msg");
					} catch (JSONException e) {
						e.printStackTrace();
					}
					CleanWXLogin();
					sessionResult(ret, msg);
				}
			} catch (JSONException e1) {
				e1.printStackTrace();
			}
			
		}};
	
	public static void loginweixin(){
		access_token = "";
		refresh_token = "";
		openid = "";
		if ("".equals(loginhost) || loginhost == null){
			SessionWrapper.startOnLogin(mweixin, "new/gateway/webchat/login", getLoginParams(), loginListener);
		}else{
			SessionWrapper.startOnLoginNew(mweixin, loginhost+"new/gateway/webchat/login", getLoginParams(), loginListener);
		}
	}
	
	/**
	 * 用户登录注销，切换账户
	 */
	public void userLogout() 
	{
		if (GetLoginSuccess()){
			//从微信注销
			mWeiXinApi.unregisterApp();
			SetLoginSuccess(false);
			CleanWXLogin();
			sessionResult(SessionWrapper.SESSIONRESULT_SWITCH_ACCOUNT, MsgStringConfig.msgLogoutSuccess);
		}
	}

	@Override
	public String getSDKVersion() 
	{
		return "1.0.0";
	}

	@Override
	public String getPluginVersion() 
	{
		return "2.0.0";
	}
	/**
	 * 设置登录参数
	 * 在接入SDK时根据需要设置登录参数
	 * 
	 * @return loginParams
	 */
	@Override
	public Hashtable<String, String> getLoginRequestParams() {
		Hashtable<String, String> loginParams = new Hashtable<String, String>();
		
		return loginParams;
	}
	
	public static Hashtable<String, String> getLoginParams() {
		//Hashtable<String, String> loginParams = new Hashtable<String, String>();
		if (loginInfo == null){
			loginInfo = new Hashtable<String, String>();
		}
		try
		{
			loginInfo.put("appid",     		appid);
			loginInfo.put("code", 			code);
			loginInfo.put("accessToken", 		access_token);
			loginInfo.put("refreshToken", 	refresh_token);
			loginInfo.put("openId", 			openid);
			loginInfo.put("pn", 				SessionWrapper.gameInfo.get("PacketName"));
			loginInfo.put("version", 			PlatformWP.getInstance().getVersionName());
			loginInfo.put("imei",    			PlatformWP.getInstance().getDeviceIMEI());
			loginInfo.put("name",    			PlatformWP.getInstance().getDeviceName());
		}
		catch(Exception e)
		{
			e.printStackTrace();
			LogE("params error !!!", e);
			loginInfo = null;
		}
		return loginInfo;
	}

	/*
	 * 读取微信登录记录
	 * */
	private boolean ReadWXLogin(){
		boolean isread = true;

		access_token = preferences.getString("access_token", null);// 获取微信登录记录
		refresh_token = preferences.getString("refresh_token", null);
		openid = preferences.getString("openid", null);
		
		if (access_token == null || "".equals(access_token) 
				|| refresh_token == null || "".equals(refresh_token)
				|| openid == null || "".equals(openid)){
			isread = false;
		}
		return isread;
	}
	
	/*
	 * 保存微信登录记录
	 * */
	private static void SaveWXLogin(){
		editor.putString("access_token", access_token);
		editor.putString("refresh_token", refresh_token);
		editor.putString("openid", openid);
		//editor.commit();
	}
	
	/*
	 * 登陆失败，清空微信登录记录
	 * */
	private static void CleanWXLogin(){
		editor.putString("access_token", "");//清空登陆记录
		editor.putString("refresh_token", "");
		editor.putString("openid", "");
		//editor.commit();
	}
	
}
