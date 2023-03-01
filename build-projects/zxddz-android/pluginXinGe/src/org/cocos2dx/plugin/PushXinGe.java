package org.cocos2dx.plugin;

import java.util.Hashtable;
import java.util.Timer;
import java.util.TimerTask;
import org.cocos2dx.utils.HttpsClientUtil;
import org.cocos2dx.utils.MD5Util;
import org.cocos2dx.utils.ResponseCallback;
import org.json.JSONException;
import org.json.JSONObject;
import com.tencent.android.tpush.XGIOperateCallback;
import com.tencent.android.tpush.XGPushConfig;
import com.tencent.android.tpush.XGPushManager;
import android.app.Activity;
import android.content.Context;
import android.util.Log;

public class PushXinGe implements InterfacePush {

	private static final String LOG_TAG = "PushXinGe";
	private static Activity mContext = null;
	static PushXinGe mXinGe = null;
	private static boolean bDebug = false;
	public static String uid = "";
	public static String token = "";
	public static String pn = "";
	public static String version = "";
	public static String appid = "";
	private static String pushuid = "";
	private static String pushtitle = "";
	private static String pushtext = "";
	private static String pushHost = "";
	private static Hashtable<String, String> pushInfo = null;
	
	protected static void LogE(String msg, Exception e) {
		Log.e(LOG_TAG, msg, e);
		e.printStackTrace();
	}

	protected static void LogD(String msg) {
		if (bDebug) {
			Log.d(LOG_TAG, msg);
		}
	}

	public PushXinGe(Context context) {
		mContext = (Activity) context;
		mXinGe = this;
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
	 * 配置应用程序开发信息,应用程序只需加载一次
	 * 
	 * @param cpInfo
	 */
	@Override
	public void configDeveloperInfo(Hashtable<String, String> cpInfo) {
		
	}

	public void StartPushSDKItem(Hashtable<String, String> push){
		pushInfo = new Hashtable<String, String>(push);
		pushHost = pushInfo.get("PushHost");
		StartPushSDK();
	}

	@Override
	public void StartPushSDK(){
		PluginWrapper.runOnMainThread(new Runnable() {
			@Override
			public void run() {
				try {
					//初始化SDK
					uid = SessionWrapper.sessionInfo.get("pid");
					System.out.println("uid = " +  uid);
					
					// 开启logcat输出，方便debug，发布时请关闭
					if (bDebug){
						XGPushConfig.enableDebug(mContext, true);
					}else {
						XGPushConfig.enableDebug(mContext, false);
					}
					// 注册接口
					XGPushManager.bindAccount(mContext, uid, new XGIOperateCallback() {
						@Override
						public void onSuccess(Object data, int flag) {
							if (bDebug){
								PlatformWP.getInstance().showToast("注册成功，设备token为：" + data.toString());
							}
							token = XGPushConfig.getToken(mContext);
							appid = Long.toString(XGPushConfig.getAccessId(mContext));
							/**
							 * 设置标签，一个应用最多有10000个tag， 
							 * 每个token在一个应用下最多100个tag， 
							 * tag中不准包含空格。
							 * 渠道名、版本号、渠道名_版本号
							 */
							pn = SessionWrapper.gameInfo.get("PacketName");
							version = PlatformWP.getInstance().getVersionName();
							version = version.replace(".", "_");
							version = "V" + version;
							String[] aaa = pn.split("\\.");
							String name = aaa[aaa.length-1];
							String tag = name + "_" + version;
							//设置TAG：渠道名、版本号、渠道名_版本号
							String[] tags = {name, version, tag};
							for (int i = 0; i < tags.length; i++) {
								XGPushManager.setTag(mContext, tags[i]);
							}
							
							//把uid和设备信息发送到WEB端保存
							pushDeviceUID();
							
							//测试推送好友
//							Hashtable<String, String> configInfo = new Hashtable<String, String>();
//							configInfo.put("pushuid", "1113134341985050");
//							configInfo.put("pushtitle", "邀请好友");
//							configInfo.put("pushtext", "一起来斗地主！");
//							pushToUser(configInfo);
							
						}

						@Override
						public void onFail(Object data, int errCode, String msg) {
							if (bDebug){
								PlatformWP.getInstance().showToast("注册失败，错误码：" + errCode + ",错误信息：" + msg);
							}
						}
					});
					
				} catch (Exception e) {
					LogE("Developer info is wrong!", e);
				}
			}
		});
	}
	
	private static Timer pushinfotimer = null;
	public void pushDeviceUID(){
		String url = "";
		if ("".equalsIgnoreCase(pushHost) || pushHost == null){
			url = SessionWrapper.getPlatformServerPre() + "xinge/push/saveDeviceType";
		}else{
			url = pushHost + "xinge/push/saveDeviceType";
		}
		final String payReqUrl = url.replaceAll("http://", "https://");

//		StopPushTimer();
//		pushinfotimer = new Timer();
//		pushinfotimer.schedule(new TimerTask() {
//            public void run() {
//            	HttpClientUtil.post(payReqUrl, payRequestParams, pushDeviceJsonHandler);
//            }
//        }, 0, 5*1000);// 定时任务
		HttpsClientUtil.post(payReqUrl, getPushDeviceParams(), pushDeviceJsonHandler);
	}
	public Hashtable<String, String> getPushDeviceParams() {
		//Hashtable<String, String> mallInfo = new Hashtable<String, String>();
		try {
			pushInfo.put("uid", uid);
			pushInfo.put("deviceToken", token);
			pushInfo.put("deviceType", "1");//1：android 2：ios
			pushInfo.put("pn", pn);
			StringBuffer sb = new StringBuffer();
	 		sb.append("uid=").append(uid).append("&key=kx61x8lsphzz");
	 		String sign = MD5Util.md5Digest(sb.toString());
			pushInfo.put("sign", sign);
		
		} catch (Exception e) {
			e.printStackTrace();
			return null;
			//此地方容易出错，当hashtable键值对冲入空对象时汇会报空指针异常，建议以后插件数据结构改成hashMap存取，不过工程量较大
		}
        return pushInfo;
	}
	final ResponseCallback pushDeviceJsonHandler = new ResponseCallback()
	{

		@Override
		public void onFailure()
		{
			StopPushTimer();
		}

		@Override
		public void onSuccess(JSONObject jsonObject)
		{
			StopPushTimer();
			try 
			{
				String ret = jsonObject.getString("ret");
				
				if(ret.equalsIgnoreCase("0")){
					if (bDebug){
						PlatformWP.getInstance().showToast("设备信息发送成功");
					}
				} else {
					if (bDebug){
						PlatformWP.getInstance().showToast("设备信息发送失败");
					}
				}
			} 
			catch (JSONException e) 
			{
				StopPushTimer();
			}
		}
	
	};
	
	private static Timer pushusertimer = null;
	/**
	 * 用户推送消息给好友
	 * */
	public void pushToUser(Hashtable<String, String> userInfo)
	{
		String pushhost = userInfo.get("PushHost");
		String url = "";
		if ("".equalsIgnoreCase(pushhost) || pushhost == null){
			url = SessionWrapper.getPlatformServerPre() + "xinge/push/Client";
		}else{
			url = pushhost + "xinge/push/Client";
		}
		pushuid = userInfo.get("pushuid");
		pushtitle = userInfo.get("pushtitle");
		pushtext = userInfo.get("pushtext");
		
		final String payReqUrl = url.replaceAll("http://", "https://");

		StopPushTimer();
		pushusertimer = new Timer();
		pushusertimer.schedule(new TimerTask() {  
            public void run() {
            	HttpsClientUtil.post(payReqUrl, getPushRequestParams(), pushJsonHandler);
            }
        }, 0, 5*1000);// 定时任务
	}
	public Hashtable<String, String> getPushRequestParams() {
		//Hashtable<String, String> mallInfo = new Hashtable<String, String>();
		pushInfo.clear();
		try {
			pushInfo.put("uid", uid);
			pushInfo.put("pushuid", pushuid);
			pushInfo.put("pushtitle", pushtitle);
			pushInfo.put("pushtext", pushtext);
			pushInfo.put("pushappid", appid);
			pushInfo.put("deviceType", "1");//1：android 2：ios
			pushInfo.put("pn", pn);
			StringBuffer sb = new StringBuffer();
			sb.append("uid=").append(uid).append("&key=kx61x8lsphzz");
			String sign = MD5Util.md5Digest(sb.toString());
			pushInfo.put("sign", sign);
		
		} catch (Exception e) {
			e.printStackTrace();
			return null;
			//此地方容易出错，当hashtable键值对冲入空对象时汇会报空指针异常，建议以后插件数据结构改成hashMap存取，不过工程量较大
		}
        return pushInfo;
	}
	final ResponseCallback pushJsonHandler = new ResponseCallback()
	{

		@Override
		public void onFailure()
		{
			StopPushTimer();
		}

		@Override
		public void onSuccess(JSONObject jsonObject)
		{
			StopPushTimer();
			try 
			{
				String ret = jsonObject.getString("ret");
				
				if(ret.equalsIgnoreCase("0")){
					if (bDebug){
						PlatformWP.getInstance().showToast("推送消息成功");
					}
				} else {
					if (bDebug){
						PlatformWP.getInstance().showToast("推送消息失败");
					}
				}
			} 
			catch (JSONException e) 
			{
				StopPushTimer();
			}
		}
	
	};
	private static void StopPushTimer(){
		if (pushinfotimer != null){
			pushinfotimer.cancel();
			pushinfotimer = null;
		}
		if (pushusertimer != null){
			pushusertimer.cancel();
			pushusertimer = null;
		}
	}
	
	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;
	}
	
	@Override
	public String getSDKVersion() {
		return "2.4.7";
	}

	@Override
	public String getPluginVersion() {
		return "1.0.0";
	}
	
	public static void OnPluginResume(){
		XGPushManager.onActivityStarted(mContext);
	}
	
	public static void OnPluginPause(){
		XGPushManager.onActivityStoped(mContext);
	}
	
}
