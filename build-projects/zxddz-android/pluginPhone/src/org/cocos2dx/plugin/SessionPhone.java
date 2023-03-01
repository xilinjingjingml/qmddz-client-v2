package org.cocos2dx.plugin;

import java.sql.Date;
import java.text.SimpleDateFormat;
import java.util.Hashtable;
import org.cocos2dx.config.MsgStringConfig;
import org.cocos2dx.utils.MD5Util;
import org.cocos2dx.utils.ParamerParseUtil;
import org.json.JSONException;
import org.json.JSONObject;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import com.tencent.mmkv.MMKV;

public class SessionPhone implements InterfaceSession {
	private static final String LOG_TAG = "SessionPhone";
	private static Activity mContext = null;
	private static SessionPhone mPhone = null;
	private static boolean bDebug = false;
	private static Hashtable<String, String> configInfo = null;
	private static Hashtable<String, String> loginInfo = null;
	private static String phonenumber = null;
	private static String password = null;//密码
	private static String code = null;//验证码
	private static String flag = "";//“bind”表示绑定 ，“reset”表示重置密码， "login"表示登录(注册), "phoneCodeLogin"表示验证码登陆
	private static String logincode = null;//登录验证码
	private static MMKV preferences;
	private static SharedPreferences.Editor editor;
	private static String loginhost = "";
	private static String codeFlag = null;//时间节点
	private static String showCode = null;//是否要显示验证码：0不显示，1显示

	private static LoginResultListener loginListener = new LoginResultListener(){

		@Override
		public void loginResult(int ret, String msg0, JSONObject json) {
			if (json == null) {
				CleanPwd();
				sessionResult(ret, msg0);
				return;
			}
			if (ret == 0){
				if ("login".equals(flag)){
					//SessionWrapper.sessionInfo.put("phonenumber", phonenumber);
					try {
						//JSONObject obj = json;//json.getJSONObject("sessionInfo");
						json.put("phonenumber", phonenumber);
						SessionWrapper.sessionJson = ParamerParseUtil.parseJsonToString(json);
					} catch (JSONException e) {
						e.printStackTrace();
					}

					sessionResult(ret, msg0);
				}else if ("reset".equals(flag)){
					sessionResult(10, msg0);
				}else if ("reg".equals(flag)){
					sessionResult(ret, msg0);
				}else if ("phonelogin".equals(flag)){
					sessionResult(ret, msg0);
				}else if ("phoneCodeLogin".equals(flag)) {
					try {
						String pwd = json.getString("tempPwd");
						if (pwd != null) {
							password = pwd;
						}
					} catch (JSONException e) {
						e.printStackTrace();
					}
					try {
						json.put("phonenumber", phonenumber);
					} catch (JSONException e) {
						e.printStackTrace();
					}
					SessionWrapper.sessionJson = ParamerParseUtil.parseJsonToString(json);
					sessionResult(ret, msg0);
				}
				SaveNumberPwd(phonenumber, password);
			}else {
				String msg = "";
				try {
					msg = json.getString("msg");
				} catch (JSONException e) {
					e.printStackTrace();
				}
				CleanPwd();
				sessionResult(-100, msg);
			}
		}};

	protected static void LogE(String msg, Exception e) {
		Log.e(LOG_TAG, msg, e);
		e.printStackTrace();
	}

	protected static void LogD(String msg) {
		if (bDebug) {
			Log.d(LOG_TAG, msg);
		}
	}

	public SessionPhone(Context context) {
		mContext = (Activity) context;
		mPhone = this;

		//preferences = mContext.getSharedPreferences("loginphone", Context.MODE_PRIVATE);// 记录一些信息，使用SharePreferences更方便。
		preferences = MMKV.mmkvWithID("loginphone");
		// 迁移旧数据
		{
			SharedPreferences old_man = mContext.getSharedPreferences("loginphone", Context.MODE_PRIVATE);
			preferences.importFromSharedPreferences(old_man);
			old_man.edit().clear().commit();
		}
		editor = preferences.edit();
	}

	@Override
	public void configGameInfo(Hashtable<String, String> gameInfo) {
		SessionWrapper.gameInfo = gameInfo;
	}

	/*
	 * 绑定手机号、重置密码、手机号登录
	 * */
	@SuppressLint({ "SimpleDateFormat", "DefaultLocale" })
	public Hashtable<String, String> getLoginRequestParams() {
		if (loginInfo == null){
			loginInfo = new Hashtable<String, String>();
		}
		try
		{
			String version = PlatformWP.getInstance().getVersionName();
			String imei = PlatformWP.getInstance().getDeviceIMEI();
			String name = PlatformWP.getInstance().getDeviceName();
			String pn = SessionWrapper.gameInfo.get("PacketName");
			String pid = loginInfo.get("pid");
			if(pid == null)
				pid = "0";
			String ticket = loginInfo.get("ticket");
			if(ticket == null)
				ticket = "";

			SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
			Date curDate = new Date(System.currentTimeMillis());//获取当前时间
			String time = formatter.format(curDate);

			String pwd = MD5Util.md5Digest(password.toLowerCase());//密码加密规则
			StringBuffer sb = new StringBuffer();
			sb.append("pid=").append(0).append("&ticket=").append("").append("&phone=")
					.append(phonenumber).append("&code=").append(code).append("&password=").append(pwd).append("&pn=")
					.append(pn).append("&imei=").append(imei).append("&time=").append(time)
					.append("&flag=").append(flag).append("#").append("sadfw2342418u309snsfw");
			String sign = MD5Util.md5Digest(sb.toString());

			loginInfo.put("pid", "0");
			loginInfo.put("ticket", "");
			loginInfo.put("phone", phonenumber);
			loginInfo.put("password", pwd);
			loginInfo.put("pn", pn);
			loginInfo.put("imei", imei);
			loginInfo.put("time", time);
			loginInfo.put("name", name);
			loginInfo.put("version", version);
			loginInfo.put("flag", flag);
			if ("login".equals(flag)){

				loginInfo.put("codeFlag", codeFlag);
				loginInfo.put("code", "");
				loginInfo.put("sign", "");
				if (logincode != null && !"".equals(logincode)){
					loginInfo.put("logincode", logincode);
				}
				loginInfo.put("showCode", showCode);
			}else if ("reset".equals(flag)){
				loginInfo.put("code", code);
				loginInfo.put("sign", sign);
			}else if ("bind".equals(flag)){

			}else if ("phonelogin".equals(flag)){
				loginInfo.put("code", "");
				loginInfo.put("sign", "");
			}else if ("reg".equals(flag)){
				loginInfo.put("code", code);
				loginInfo.put("sign", sign);
			}else if ("phoneCodeLogin".equals(flag)) {
				loginInfo.put("code", code);
				loginInfo.put("sign", sign);
				if (logincode != null && !"".equals(logincode)){
					loginInfo.put("logincode", logincode);
				}
			}
		}
		catch(NullPointerException e)
		{
			loginInfo = null;
		}
		return loginInfo;
	}
	
	@Override
	public void configDeveloperInfo(Hashtable<String, String> cpInfo) {
		configInfo = cpInfo;
	}

    /**
	 * 开始登陆
	 */
	@SuppressLint("SimpleDateFormat")
	public void userLogin() {
		if (loginInfo != null){
			if (!loginInfo.isEmpty()){
				loginInfo.clear();
			}
		}
		if (!PlatformWP.networkReachable(mContext)) {
			sessionResult(SessionWrapper.SESSIONRESULT_FAIL, MsgStringConfig.msgNetworkError);
			return;
		}

		PluginWrapper.runOnMainThread(new Runnable() {

			@Override
			public void run() {
				if (ReadNumberPwd()){
					code = "";
					flag = "login";
					SimpleDateFormat webformatter = new SimpleDateFormat("yyyyMMdd");
					Date webcurDate = new Date(System.currentTimeMillis());//获取当前时间
					codeFlag = webformatter.format(webcurDate);
					showCode = "0";

					SessionWrapper.startOnLogin(mPhone, "new/gateway/phone/login", getLoginRequestParams(), loginListener);
				} else {
					sessionResult(SessionWrapper.SESSIONRESULT_FAIL, MsgStringConfig.msgLoginFail);
				}
			}
		});
	}

	@SuppressLint("SimpleDateFormat")
	public void userItemsLogin(Hashtable<String,String> loginItemsInfo){
		if (loginInfo != null){
			if (!loginInfo.isEmpty()){
				loginInfo.clear();
			}
		}
		loginInfo = new Hashtable<String,String>(loginItemsInfo);
		if (!PlatformWP.networkReachable(mContext)) {
			sessionResult(SessionWrapper.SESSIONRESULT_FAIL, MsgStringConfig.msgNetworkError);
			return;
		}
		
		PluginWrapper.runOnMainThread(new Runnable() {
			
			@Override
			public void run() {
				loginhost = loginInfo.get("LoginHost");
				if (ReadNumberPwd())
				{
					code = "";
					flag = "login";
					SimpleDateFormat webformatter = new SimpleDateFormat("yyyyMMdd");
					Date webcurDate = new Date(System.currentTimeMillis());//获取当前时间
					codeFlag = webformatter.format(webcurDate);
					showCode = "0";
				}
				else
				{
					phonenumber = loginInfo.get("phonenumber");
					password = loginInfo.get("password");
					code = loginInfo.get("code");
					flag = loginInfo.get("flag");
					logincode = loginInfo.get("logincode");
					if (logincode != null && !"".equals(logincode)){
						showCode = "1";
					}else {
						showCode = "0";
					}

					SimpleDateFormat webformatter = new SimpleDateFormat("yyyyMMdd");
					Date webcurDate = new Date(System.currentTimeMillis());//获取当前时间
					codeFlag = webformatter.format(webcurDate);
				}
				if ("".equals(loginhost) || loginhost == null)
				{
					SessionWrapper.startOnLogin(mPhone, "new/gateway/phone/login", getLoginRequestParams(), loginListener);
				}else
				{
					SessionWrapper.startOnLoginNew(mPhone, loginhost+"new/gateway/phone/login", getLoginRequestParams(), loginListener);
				}
			}
		});
	}
	
	public static void sessionResult(int ret, String msg) {
		LogD("mPhone result : " + ret + " msg : " + msg);
		SessionWrapper.onSessionResult(mPhone, ret, msg);
	}

	@Override
	public void setRunEnv(int env) {
		SessionWrapper.setRunEnv(env);
	}

	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;
	}

	@Override
	public String getSDKVersion() {
		return "0.1.0";
	}

	@Override
	public String getPluginVersion() {
		return "0.1.0";
	}

	/*
	 * 读取手机号和登陆密码
	 * */
	private boolean ReadNumberPwd(){
		boolean isread = true;

		phonenumber = preferences.getString("phonenumber", null);// 获取保存过的用户名。
		password = preferences.getString("password", null);// 获取保存过的密码。
		
		if (phonenumber == null || "".equals(phonenumber)){
			isread = false;
		}
		else if (password == null || "".equals(password)){
			isread = false;
		}
		
		return isread;
	}
	
	/*
	 * 保存手机号和登陆密码
	 * */
	private static void SaveNumberPwd(String username, String password){
		
		editor.putString("phonenumber", username);//保存手机号。
		editor.putString("password", password);//保存登陆密码。
		//editor.commit();
		System.out.println("记住密码：---保存手机号和登陆密码");
	}
	
	/*
	 * 登陆失败，清空登陆密码
	 * */
	private static void CleanPwd(){
		
		editor.putString("phonenumber", "");//清空登陆手机号。
		editor.putString("password", "");//清空登陆密码。
		//editor.commit();
		System.out.println("登陆失败，清空登陆密码");
	}

	@Override
	public void userLogout() {
		CleanPwd();
		sessionResult(SessionWrapper.SESSIONRESULT_SWITCH_ACCOUNT, MsgStringConfig.msgLogoutSuccess);
	}

}
