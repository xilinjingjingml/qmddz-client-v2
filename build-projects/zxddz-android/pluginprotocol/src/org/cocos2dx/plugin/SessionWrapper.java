package org.cocos2dx.plugin;

import java.util.Hashtable;
import java.util.Iterator;
import org.cocos2dx.config.MsgStringConfig;
import org.cocos2dx.config.URLConfig;
import org.cocos2dx.utils.HttpsClientUtil;
import org.cocos2dx.utils.ParamerParseUtil;
import org.cocos2dx.utils.ResponseCallback;
import org.json.JSONException;
import org.json.JSONObject;

public class SessionWrapper
{
	public static final int SESSIONRESULT_SUCCESS 		    	= 0;
	public static final int SESSIONRESULT_CANCEL		   		= 1;
	public static final int SESSIONRESULT_FAIL			    	= 2;
	public static final int SESSIONRESULT_SWITCH_ACCOUNT    	= 3;
	public static final int SESSIONRESULT_DEFAULT_CALLBACK  	= 4;
	public static final int SESSIONRESULT_BINDING  				= 5;
	public static final int SESSIONRESULT_BINDING_SUCCESS  		= 6;
	public static final int SESSIONRESULT_UPDATE_SESSIONINFO	= 7;
	public static final int SESSIONRESULT_KILL_GAME				= 8;//调用乐逗定制时特有

	public static Hashtable<String, String> gameInfo = null;

	private static String sessionName; // 调用插件的名称，c++调用xx/xx/xx/xx形式
	private static String loginRequestUrl;
	public static String sessionJson = ""; // 将服务器返回的json以字符串的形式存储
	public static Hashtable<String, String> sessionInfo = null;//web登陆结果回调的信息
	private static LoginResultListener loginListener = null;
	
	//------------------------------------登陆流程开始-------------------------------------------------------------------
	
	/**
	 * 开始登录到登录服务器
	 * 
	 * param obj
	 * param url
	 * param loginReqParams
	 */
	public static void startOnLoginNew(InterfaceSession obj, String postfix, Hashtable<String, String> loginReqParams, LoginResultListener loginResultListener)
	{
		loginListener = loginResultListener;
		setSessionName(obj);
		loginRequestUrl = postfix;

		if (loginReqParams == null){//登录时传入的参数有误，返回失败
			onSessionResult(sessionName, SESSIONRESULT_FAIL, MsgStringConfig.msgLoginParamsError);
			return;
		}
		
		if(loginReqParams.get("version") != null && !"".equalsIgnoreCase(loginReqParams.get("version"))){
			//插件自己搜集的version规则自己处理，上层不覆盖
		}else{
			loginReqParams.put("version", PlatformWP.getInstance().getVersionName());
		}

		onLogin(loginRequestUrl, loginReqParams);
	}
	public static void startOnLoginNew(InterfaceSession obj, String postfix, Hashtable<String, String> loginReqParams)
	{
		setSessionName(obj);
		loginRequestUrl = postfix;

		if (loginReqParams == null){//登录时传入的参数有误，返回失败
			onSessionResult(sessionName, SESSIONRESULT_FAIL, MsgStringConfig.msgLoginParamsError);
			return;
		}

		if(loginReqParams.get("version") != null && !"".equalsIgnoreCase(loginReqParams.get("version"))){
			//插件自己搜集的version规则自己处理，上层不覆盖
		}else{
			loginReqParams.put("version", PlatformWP.getInstance().getVersionName());
		}

		onLogin(loginRequestUrl, loginReqParams);
	}
	
	/**
	 * 开始登录到登录服务器，拓展回调接口，上层所有的回调信息再次返回给插件层，
	 * 针对插件缓存登陆信息及其他逻辑处理
	 * 插件自己处理服务器返回的回调信息
	 * param obj
	 * param url
	 * param loginReqParams
	 * param loginResultListener
	 */
	public static void startOnLogin(InterfaceSession obj, String postfix, Hashtable<String, String> loginReqParams,LoginResultListener loginResultListener)
	{
		loginListener = loginResultListener;
		setSessionName(obj);
		setLoginRequestUrl(postfix);

		if (loginReqParams == null){//登录时传入的参数有误，返回失败
			onSessionResult(sessionName, SESSIONRESULT_FAIL, MsgStringConfig.msgLoginParamsError);
			return;
		}
		
		if(loginReqParams.get("version") != null && !"".equalsIgnoreCase(loginReqParams.get("version"))){
			//插件自己搜集的version规则自己处理，上层不覆盖
		}else{
			loginReqParams.put("version", PlatformWP.getInstance().getVersionName());
		}

		onLogin(loginRequestUrl, loginReqParams);
	}
	
	
	/**
	 * 开始登录到登录服务器
	 * 
	 * param obj
	 * param url
	 * param loginReqParams
	 */
	public static void startOnLogin(InterfaceSession obj, String postfix, Hashtable<String, String> loginReqParams)
	{
		setSessionName(obj);
		setLoginRequestUrl(postfix);

		if (loginReqParams == null){//登录时传入的参数有误，返回失败
			onSessionResult(sessionName, SESSIONRESULT_FAIL, MsgStringConfig.msgLoginParamsError);
			return;
		}
		
		if(loginReqParams.get("version") != null && !"".equalsIgnoreCase(loginReqParams.get("version"))){
			//插件自己搜集的version规则自己处理，上层不覆盖
		}else{
			loginReqParams.put("version", PlatformWP.getInstance().getVersionName());
		}

		onLogin(loginRequestUrl, loginReqParams);
	}
	
	/**
	 * 设置登录插件名称
	 */
	private static void setSessionName(InterfaceSession obj)
	{
		sessionName = obj.getClass().getName().replace('.', '/');
	}
	
	/**
	 * 设置登陆url地址
	 * 基础登陆域名+插件路径
	 */
	private static void setLoginRequestUrl(String postfix) 
	{
		loginRequestUrl = getServerURLPre() + postfix;
	}

	/**
	 * 获取服务器环境地址前缀
	 * 域名在URLConfig.java文件中进行配置
	 * 
	 * return serverURLPre
	 */
	public static String getServerURLPre()
	{
		String serverURLPre = URLConfig.oLoginHost;

		switch (PluginWrapper.nCurrentRunEnv)
		{
		case PluginWrapper.ENV_OFFICIAL:
		{
			serverURLPre = URLConfig.oLoginHost;
			break;
		}
		case PluginWrapper.ENV_TEST:
		{
			serverURLPre = URLConfig.tLoginHost;
			break;
		}
		case PluginWrapper.ENV_MIRROR:
		{
			serverURLPre = URLConfig.mLoginHost;
			break;
		}
		case PluginWrapper.ENV_DUFU:
		{
			serverURLPre = URLConfig.dLoginHost;
			break;
		}
		default:
		{
			serverURLPre = URLConfig.oLoginHost;
			break;
		}
		}

		return serverURLPre;
	}
	
	/**
	 * 异步处理登录服务器返回的结果
	 * 
	 * param loginReqUrl
	 * param loginReqParams
	 * return
	 */
	private static void onLogin(String loginReqUrl, Hashtable<String, String> loginReqParams)
	{
		loginReqUrl = loginReqUrl.replaceAll("http://", "https://");
		ParamerParseUtil.printfUrl(loginReqUrl, loginReqParams);
		HttpsClientUtil.post(loginReqUrl, loginReqParams, sessionJsonHandler);
	}
	/**
	 * 登录结果处理回调
	 *
	 * 在处理请求时重写ResponseCallback中的onFailure方法和onSuccess方法
	 * 在游戏完善过程中可以重写onStart和onFinishe方法，进行UI更新通知
	 */
	final static ResponseCallback sessionJsonHandler = new ResponseCallback()
	{
		@Override
		public void onFailure()
		{
			if(loginListener!=null)
			{
				loginListener.loginResult(SESSIONRESULT_FAIL, MsgStringConfig.msgLoginTimeout, null);
				loginListener = null;
			}else{
				onSessionResult(sessionName, SESSIONRESULT_FAIL, MsgStringConfig.msgLoginTimeout);
			}
		}
		
		/* 接收数成功后处理 */
		@Override
		public void onSuccess(JSONObject jsonObject)
		{
			if (jsonObject == null)
			{
				if(loginListener!=null)
				{
					loginListener.loginResult(SESSIONRESULT_FAIL, MsgStringConfig.msgServerParamsError, null);
					loginListener = null;
				}else{
					onSessionResult(sessionName, SESSIONRESULT_FAIL, MsgStringConfig.msgServerParamsError);
				}
				return;
			}
			
			sessionJson = ParamerParseUtil.parseJsonToString(jsonObject);
			if (sessionJson.length() == 0)
			{
				if(loginListener!=null)
				{
					loginListener.loginResult(SESSIONRESULT_FAIL, MsgStringConfig.msgServerParamsError, null);
					loginListener = null;
				}else{
					onSessionResult(sessionName, SESSIONRESULT_FAIL, MsgStringConfig.msgLoginParamsError);
				}
				return;
			}

			sessionInfo = new Hashtable<String, String>();
			try
			{
				String ret = jsonObject.getString("ret");
				if (ret.equalsIgnoreCase("0"))
				{
					Iterator<?> iterator = jsonObject.keys();
					while (iterator.hasNext())
					{
						String key = (String) iterator.next();
						sessionInfo.put(key, jsonObject.getString(key));
					}
					if(loginListener!=null)
					{
						loginListener.loginResult(SESSIONRESULT_SUCCESS, MsgStringConfig.msgLoginSuccess, jsonObject);
						loginListener = null;
					}else{
						onSessionResult(sessionName, SESSIONRESULT_SUCCESS, MsgStringConfig.msgLoginSuccess);
					}
				} 
				else
				{
					if(loginListener!=null)
					{
						loginListener.loginResult(SESSIONRESULT_FAIL, getResultMsg(MsgStringConfig.msgLoginFail), jsonObject);
						loginListener = null;
					}else{
						onSessionResult(sessionName, SESSIONRESULT_FAIL, getResultMsg(MsgStringConfig.msgLoginFail));
					}
				}
			}
			catch (JSONException e)
			{
				if(loginListener!=null)
				{
					loginListener.loginResult(SESSIONRESULT_FAIL, MsgStringConfig.msgLoginParamsError, null);
					loginListener = null;
				}else{
					onSessionResult(sessionName, SESSIONRESULT_FAIL, MsgStringConfig.msgLoginParamsError);
				}
			}
		}
	};
	
	/**
	 * 获取回调msg
	 * 在返回登录失败时调用该方法（注意）
	 * 默认返回的是传入的msg
	 * 在失败时从服务器返回的信息，比如账号被封的原因或提示
	 * param msg
	 * return
	 */
	public static String getResultMsg(String msg) 
	{
		String tips = msg;
		
		try 
		{
			JSONObject jsObject = new JSONObject(sessionJson.toString());
			if((null != jsObject.getString("tips")) && (0 != jsObject.getString("tips").length()))
			{
				tips = jsObject.getString("tips");
			}
		} 
		catch (JSONException e) 
		{
			e.printStackTrace();
		}
		
		return tips;
	}
	//-----------------------------------登陆流程结束------------------------------------------------------------

	
	/**
	 * 设置登录环境（正式->O、测试->T、镜像->M）
	 * 
	 * param env
	 */
	public static void setRunEnv(int env)
	{
		PluginWrapper.nCurrentRunEnv = env;
	}

	/**
	 * 获取前台接口站点URL地址前缀
	 * 1.个推服务器地址
	 * 2.游戏好友id上传地址       by zuoyanshun2014/10/21
	 * 域名在URLConfig.java文件中进行配置
	 * 
	 * return serverURLPre
	 */
	public static String getPlatformServerPre()
	{
		String serverUrlPre = URLConfig.oPlatformHost;

		switch (PluginWrapper.nCurrentRunEnv)
		{
		case PluginWrapper.ENV_OFFICIAL:
		{
			serverUrlPre = URLConfig.oPlatformHost;
			break;
		}
		case PluginWrapper.ENV_TEST:
		{
			serverUrlPre = URLConfig.tPlatformHost;
			break;
		}
		case PluginWrapper.ENV_MIRROR:
		{
			serverUrlPre = URLConfig.mPlatformHost;
			break;
		}
		case PluginWrapper.ENV_DUFU:
		{
			serverUrlPre = URLConfig.dPlatformHost;
			break;
		}
		default:
		{
			serverUrlPre = URLConfig.oPlatformHost;
			break;
		}
		}

		return serverUrlPre;
	}

	
	/**
	 * 设置游戏基本配置信息
	 * 
	 * param envHashtable
	 */
	public static void setGameInfo(Hashtable<String, String> configGameInfo)
	{
		gameInfo = configGameInfo;
		
	}
	
	/**
	 * 获取游戏基本配置信息，如渠道名
	 * return
	 */
	public static Hashtable<String, String> getGameInfo()
	{
		return gameInfo;
	}
	/**
	 * 清除登录信息
	 * param hashtable
	 */
	public static void clearSessionInfo()
	{
		if(sessionInfo != null)
		{
			if(sessionInfo.size() != 0)
			{
				sessionInfo.clear();
			}
			sessionInfo = null;
		}
		if (sessionJson.length() > 0) {
			sessionJson = "";
		}
	}
	
	//---------------------------------------------游戏底层回调start------------------------------------------------------
	/**
	 * 处理登录结果回调
	 * 
	 * param obj,插件的对象
	 * param ret
	 * param msg
	 */
	public static void onSessionResult(InterfaceSession obj, int ret, String msg)
	{
		String name = obj.getClass().getName();
		name = name.replace(".", "/");
		onSessionResult(name,ret, msg);
	}
	
	/**
	 * 处理登录结果回调
	 * 
	 * param name，插件的名称
	 * param ret
	 * param msg
	 */
	public static void onSessionResult(String name, int ret, String msg)
	{
		final String curName = name;
		final int curRet = ret;
		final String curMsg = msg;

		if (ret == SESSIONRESULT_SWITCH_ACCOUNT) {
			clearSessionInfo();
		}
		PluginWrapper.runOnGLThread(new Runnable()
		{
			@Override
			public void run()
			{
				nativeOnSessionResult(curName, curRet, curMsg, sessionJson);
			}
		});
	}

	/**
	 * 处理登录结果，将结果通过jni回调给游戏逻辑
	 * 
	 * param className
	 * param ret
	 * param msg
	 * param sessionMap
	 */
	private static native void nativeOnSessionResult(String className, int ret, String msg, String sessionJson);
	//-----------------------------------------------游戏底层回调end-------------------------------------------------------------
}
