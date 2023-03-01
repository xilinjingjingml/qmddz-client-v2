package org.cocos2dx.plugin;

import java.util.Hashtable;
import android.app.Activity;
import android.content.Context;
import android.util.Log;
import org.cocos2dx.config.MsgStringConfig;
import com.tencent.mm.opensdk.modelpay.PayReq;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;

public class IAPWeiXin implements InterfaceIAP{
	
	private static final String LOG_TAG = "IAPWeiXin";
	private static Activity mContext = null;
	static IAPWeiXin mWeiXin = null;
	private static boolean bDebug = true;
	private static String appid = "";// 应用id
	private static boolean issetinit = false;
	
	private static Hashtable<String, String> configInfo = null;
	private static Hashtable<String, String> productInfo = null;
	private static IWXAPI msgApi = null;
	private static PayReq req = null;
	private static String IAPHost = "";
	
	public IAPWeiXin(Context context) {
		mContext = (Activity)context;
		mWeiXin = this;
	}
	
	protected static void LogE(String msg, Exception e) {
		Log.e(LOG_TAG, msg, e);
		e.printStackTrace();
	}

	protected static void LogD(String msg) {
		if (bDebug) {
			Log.d(LOG_TAG, msg);
		}
	}
	
	@Override
	public void pay() {
		
		req = new PayReq();
		req.appId = appid;//公众账号ID
		req.partnerId = IAPWrapper.iapInfo.get("partnerId");//Constants.MCH_ID;商户号
		req.prepayId = IAPWrapper.iapInfo.get("prepayId");//resultunifiedorder.get("prepay_id");支付交易会话ID
		req.packageValue = IAPWrapper.iapInfo.get("package");//扩展字段
		req.nonceStr = IAPWrapper.iapInfo.get("nonceStr");//genNonceStr();随机字符串
		req.timeStamp = IAPWrapper.iapInfo.get("timeStamp");//String.valueOf(genTimeStamp());时间戳
		req.sign = IAPWrapper.iapInfo.get("sign");//签名
		
		//将该app注册到微信
		msgApi.registerApp(appid);
		msgApi.sendReq(req);
	}
	
	@Override
	public Hashtable<String, String> getPayRequestParams() {
		//String url = "http://mall.hiigame.com/weixin/intl/pay";
		//Hashtable<String, String> requsetParams = new Hashtable<String, String>();

        String uid = SessionWrapper.sessionInfo.get("pid");
        String ticket = SessionWrapper.sessionInfo.get("ticket");
        String boxid = productInfo.get("boxId");
        String version = PlatformWP.getInstance().getVersionName();
        String pn = SessionWrapper.gameInfo.get("PacketName");
        String imei = PlatformWP.getInstance().getDeviceIMEI();
        
//      requsetParams.put("mallUrl", url);
        productInfo.put("pid", uid);
        productInfo.put("pn", pn);
        productInfo.put("version", version);
        productInfo.put("ticket", ticket);
        productInfo.put("boxid", boxid);
        productInfo.put("imei", imei);
        productInfo.put("appid", appid);
        return productInfo;
	}
	
	@Override
	public void configDeveloperInfo(Hashtable<String, String> cpInfo) {
		configInfo = cpInfo;
		
		mContext.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				//支付初始化
				try
				{
					appid = PlatformWP.getMetaName("wxapiAppID");
					if (issetinit == false){
						// 通过WXAPIFactory工厂，获取IWXAPI的实例
						msgApi = WXAPIFactory.createWXAPI(mContext, appid);
						//将该app注册到微信
						msgApi.registerApp(appid);
						issetinit = true;
					}
				} catch (Exception e)
				{
					e.printStackTrace();
					LogE("sdk init error", e);
				}
			}
		});
	}

	@Override
	public void payForProduct(Hashtable<String, String> cpInfo) {
		LogD("payForProduct invoked " + cpInfo.toString());
		
		if (! PlatformWP.networkReachable(mContext)) {
			payResult(IAPWrapper.PAYRESULT_FAIL, MsgStringConfig.msgNetworkError);
			return;
		}
		if (!msgApi.isWXAppInstalled()){
			payResult(IAPWrapper.PAYRESULT_FAIL, MsgStringConfig.msgWeiXinUninstall);
			return;
		}
		
		productInfo = new Hashtable<String, String>(cpInfo);
		IAPHost = productInfo.get("IapHost");
		
		//payResult(IAPWrapper.PAYRESULT_DEFAULT_CALLBACK, MsgStringConfig.msgPaySuccess);
		
		if ("".equals(IAPHost) || IAPHost == null){
			IAPWrapper.startOnPay(productInfo, mWeiXin, "weixin/intl/pay", getPayRequestParams());
		}else{
			IAPWrapper.startOnPayNew(productInfo, mWeiXin, IAPHost+"weixin/intl/pay", getPayRequestParams());
		}
		
	}
	
	public static void payResult(int ret, String msg) {
		IAPWrapper.onPayResult(mWeiXin, ret, msg);
		LogD("mWeiXin result : " + ret + " msg : " + msg);
	}
	
	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;
	}

	@Override
	public String getSDKVersion() {
		return "1.0.0";
	}

	@Override
	public String getPluginVersion() {
		return "0.1.0";
	}

	@Override
	public void setRunEnv(int env) {
		IAPWrapper.setRunEnv(env);
	}
	
}
