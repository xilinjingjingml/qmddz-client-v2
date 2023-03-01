package org.cocos2dx.plugin;

import java.net.URLEncoder;
import java.util.Hashtable;
import java.util.Map;
import org.cocos2dx.config.MsgStringConfig;
import android.app.Activity;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Handler;
import android.os.Message;
import android.text.TextUtils;
import android.util.Log;
import android.view.KeyEvent;
import com.alipay.sdk.app.PayTask;

/**
 * 支付宝支付
 * @author Heguanjun
 *
 */
public class IAPAlipay implements InterfaceIAP {

	private static final String LOG_TAG = "IAPAlipay";
	private static Activity mContext = null;
	private static Handler mHandler = null;
	private static IAPAlipay mAdapter = null;
	private static boolean bDebug = false;
	private static Hashtable<String, String> configInfo = null;
	private static Hashtable<String, String> productInfo = null;
	
	private static String isDanji = "";

	public IAPAlipay() 
	{
		
	}
	
	public IAPAlipay(Context context) {
		mContext = (Activity) context;
		mAdapter = this;
		PluginWrapper.runOnMainThread(new Runnable() {
			@Override
			public void run() {
				initUIHandle();
			}
		});
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
	
	/**
	 * 配置及SDK开发者信息
	 * @param cpInfo
	 */
	@Override
	public void configDeveloperInfo(Hashtable<String, String> cpInfo)
	{
		if(cpInfo != null && !cpInfo.isEmpty())
		{
			configInfo = new Hashtable<String, String>(cpInfo);
		}else
		{
			LogD("developer info error !!!");
			return;
		}
	}
	
	/**
	 * 获取订单并调用支付SDK
	 */
	@Override
	public void payForProduct(Hashtable<String, String> cpInfo) 
	{
		if (! PlatformWP.networkReachable(mContext))
		{
			payResult(IAPWrapper.PAYRESULT_FAIL, MsgStringConfig.msgNetworkError);
			return;
		}
		
		productInfo = new Hashtable<String, String>(cpInfo);

		isDanji = productInfo.get("isdanji");
		String IAPHost = productInfo.get("IapHost");
		if ("".equals(IAPHost) || IAPHost == null){
			IAPWrapper.startOnPay(productInfo, mAdapter, "alipay/intl/pay", getPayRequestParams());
		}else{
			IAPWrapper.startOnPayNew(productInfo, mAdapter, IAPHost+"alipay/intl/pay", getPayRequestParams());
		}
	}

	static class AlixOnCancelListener implements DialogInterface.OnCancelListener 
	{
		Activity mcontext;
		AlixOnCancelListener(Activity context) 
		{
			mcontext = context;
		}

		public void onCancel(DialogInterface dialog) 
		{
			mcontext.onKeyDown(KeyEvent.KEYCODE_BACK, null);
		}
	}
	
	/**
	 * SDK支付流程
	 */
	public void pay() 
	{
		Runnable payRunnable = new Runnable() {
			@Override
			public void run() {
				if(IAPWrapper.iapInfo == null) 
				{
					payResult(IAPWrapper.PAYRESULT_FAIL, MsgStringConfig.msgGetOrderFail);
					return;
				}
				// 准备订单信息
				String order_info = IAPWrapper.iapInfo.get("orderInfo");
				String sign = IAPWrapper.iapInfo.get("sign");
				// 对签名进行编码
				@SuppressWarnings("deprecation")
				String strsign = URLEncoder.encode(sign);
				// 组装好参数
				String info = order_info + "&sign=\"" +strsign+ "\"&sign_type=\"RSA\"" ;
				
				// 构造PayTask 对象
				PayTask alipay = new PayTask(mContext);
				// 调用支付接口
				/**
				 * info	app支付请求参数字符串，主要包含商户的订单信息，key=value形式，以&连接。
				 * isShowPayLoading	用户在商户app内部点击付款，是否需要一个loading做为在钱包唤起之前的过渡，
				 * 这个值设置为true，将会在调用pay接口的时候直接唤起一个loading，直到唤起H5支付页面或者唤起外部的钱包付款页面loading才消失。
				 * （建议将该值设置为true，优化点击付款到支付唤起支付页面的过渡过程。）
				 * */
				Map<String, String> result = alipay.payV2(info, true);

				Message msg = new Message();
				msg.what = 'p'; //表示是支持
				msg.obj = result;
				mHandler.sendMessage(msg);
			}
		};

		//payResult(IAPWrapper.PAYRESULT_DEFAULT_CALLBACK, MsgStringConfig.msgPayDefault);
		Thread payThread = new Thread(payRunnable);
		payThread.start();
	}

	private static void initUIHandle() 
	{
		// the handler use to receive the pay result.
		// 这里接收支付结果，支付宝手机端同步通知
		mHandler = new Handler() {
			@SuppressWarnings("unchecked")
			public void handleMessage(Message msg) {
				switch (msg.what) {
				case 'p': {
					Result resultObj = new Result((Map<String, String>) msg.obj);
					String resultStatus = resultObj.getResultStatus();

					// 判断resultStatus 为“9000”则代表支付成功，具体状态码代表含义可参考接口文档
					if (TextUtils.equals(resultStatus, "9000")) {
						payResult(IAPWrapper.PAYRESULT_SUCCESS,MsgStringConfig.msgPaySuccess );
					} else {
						// 判断resultStatus 为非“9000”则代表可能支付失败
						// “8000” 代表支付结果因为支付渠道原因或者系统原因还在等待支付结果确认，最终交易是否成功以服务端异步通知为准（小概率状态）
						if (TextUtils.equals(resultStatus, "8000")) {
							payResult(IAPWrapper.PAYRESULT_NOCALLBACK_ONLYTIPS,MsgStringConfig.msgOrdersubmited);
						} else {
							payResult(IAPWrapper.PAYRESULT_FAIL,MsgStringConfig.msgPayFail );
						}
					}
					break;
				}
				default:
					break;
				}
			};
		};
	}

	/**
	 * 支付结果回调
	 * @param ret
	 * @param msg
	 */
	private static void payResult(int ret, String msg) {
		IAPWrapper.onPayResult(mAdapter, ret, msg);
		LogD("Alipay result : " + ret + " msg : " + msg);
	}
	
	@Override
	public Hashtable<String, String> getPayRequestParams() {
		//Hashtable<String, String> requsetParams = null;
		
		try {
			//requsetParams = new Hashtable<String, String>();
			String pid = "";
			String ticket = "";
			if ("2".equals(isDanji)){
				pid = productInfo.get("danjipid");
				ticket = productInfo.get("danjiticket");
			}else{
				pid = SessionWrapper.sessionInfo.get("pid");
				ticket = SessionWrapper.sessionInfo.get("ticket");
			}
			
			String pn = SessionWrapper.gameInfo.get("PacketName");
			String boxid = productInfo.get("boxId");
			String version = PlatformWP.getInstance().getVersionName();
			String imsi = PlatformWP.getInstance().getDeviceIMSI();
			String imei = PlatformWP.getInstance().getDeviceIMEI();
			String language = productInfo.get("language");
			productInfo.put("pid", pid);
			productInfo.put("ticket", ticket);
			productInfo.put("boxid",boxid);
			productInfo.put("version", version);
			productInfo.put("pn", pn);
			productInfo.put("imei", imei);
			productInfo.put("imsi", imsi);
			
		} catch (Exception e) {
			e.printStackTrace();
			return null;
			//此地方容易出错，当hashtable键值对冲入空对象时汇会报空指针异常，建议以后插件数据结构改成hashMap存取，不过工程量较大
		}
		return productInfo;
	}
	
	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;
	}
	
	@Override
	public void setRunEnv(int env) {
		IAPWrapper.setRunEnv(env);
	}

	@Override
	public String getSDKVersion() {
		return "15.2.4";
	}

	@Override
	public String getPluginVersion() {
		return "2.0.0";
	}

}
