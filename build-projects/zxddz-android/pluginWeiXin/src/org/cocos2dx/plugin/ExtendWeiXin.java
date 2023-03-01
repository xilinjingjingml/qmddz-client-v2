package org.cocos2dx.plugin;

import java.util.Hashtable;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;
import android.app.Activity;
import android.content.Context;
import android.util.Log;

public class ExtendWeiXin implements InterfaceExtend 
{

	private static final String LOG_TAG = "ExtendWeiXin";
	private static IWXAPI mWeiXinApi = null;
	private static Activity mContext = null;
	static ExtendWeiXin mweixin = null;
	private static boolean bDebug = false;
	private static String wxaccreditHost = "";
	private static String extendflag = "";
	private static String appid = "";
	public static String code = "";
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

	public ExtendWeiXin(Context context) 
	{
		mContext = (Activity) context;
		mweixin = this;
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
		case 3://微信授权
			wxaccreditHost = extendInfo.get("WXAccreditHost");
			extendflag = extendInfo.get("extendflag");
			appid = PlatformWP.getMetaName("wxapiAppID");
			mWeiXinApi = WXAPIFactory.createWXAPI(mContext, appid);
			mWeiXinApi.registerApp(appid);
	        SendAuth.Req req = new SendAuth.Req();
	        req.openId = appid;
	        //应用授权作用域，如获取用户个人信息则填写snsapi_userinfo
	        req.scope = "snsapi_userinfo";
	        //用于保持请求和回调的状态，授权请求后原样带回给第三方
	        req.state = "ExtendWeiXin";
	        req.transaction = "ExtendWeiXin";
	        mWeiXinApi.sendReq(req);
			break;
		default:
			break;
		}
	}
	
	public static void extendweixin(){
		ExtendWrapper.startOnExtend(mweixin, wxaccreditHost, getExtendParams());
	}
	
	public static void extendResult(int ret, String msg) 
	{
		ExtendWrapper.onExtendResult(mweixin, ret, msg);
		LogD("mweixin result : " + ret + " msg : " + msg);
	}
	
	public static Hashtable<String, String> getExtendParams() {
		//Hashtable<String, String> extendParams = new Hashtable<String, String>();
		try
		{
			extendInfo.put("appid", appid);
			extendInfo.put("code", code);
			if (extendflag == null ||"".equals(extendflag)){
				extendInfo.put("extendflag", "");
			}else{
				extendInfo.put("extendflag", extendflag);
			}
		}
		catch(Exception e)
		{
			e.printStackTrace();
			LogE("params error !!!", e);
			extendInfo = null;
		}
		return extendInfo;
	}

	public boolean getSoundEffect()
	{
		return true;
	}

	@Override
	public void setDebugMode(boolean debug) 
	{
		bDebug = debug;
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
	
}
