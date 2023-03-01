
package org.cocos2dx.plugin;

import java.lang.reflect.Method;
import java.sql.Date;
import java.text.SimpleDateFormat;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map.Entry;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import org.cocos2dx.config.MsgStringConfig;
import org.cocos2dx.config.URLConfig;
import org.cocos2dx.utils.HttpsClientUtil;
import org.cocos2dx.utils.ParamerParseUtil;
import org.cocos2dx.utils.ResponseCallback;
import org.json.JSONException;
import org.json.JSONObject;
import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.AlertDialog.Builder;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.util.Log;
import android.widget.Toast;

public class IAPWrapper 
{
	public static final int PAYRESULT_SUCCESS 			  	= 0;					// 支付成功
	public static final int PAYRESULT_FAIL    			  	= 1;					// 支付失败
	public static final int PAYRESULT_CANCEL    		  	= 2;					// 支付取消
	public static final int PAYRESULT_SERVER_SUCCESS       	= 3;					// 服务器订单支付成功
	public static final int PAYRESULT_SERVER_FAIL          	= 4;					// 服务器订单支付失败
	public static final int PAYRESULT_DEFAULT_CALLBACK 	  	= 5;					// 支付默认回调
	public static final int PAYRESULT_NOCALLBACK_ONLYTIPS   = 6;                    //插件没有明确的回调，不知道支付结果
	public static final int PAYRESULT_OTHERPAY				= 7;					//走其他支付方式
	public static final int PAYRESULT_OTHERPAYTWO			= 8;					//日限月限走其他支付方式
	public static final int PAYRESULT_NOTCALL               = 9;                    //用于应用宝查询订单返回处理
	
	public static final int PAYRESULT_SHOPSTORE_DAYLIMIT 	= -9;		//商品级日限
	public static final int PAYRESULT_SHOPSTORE_MONTHLIMIT 	= -10;		//商品级月限
	public static final int PAYRESULT_QUICKPAY_DAYLIMIT 	= -11;		//支付方式级日限
	public static final int PAYRESULT_QUICKPAY_MONTHLIMIT 	= -12;		//支付方式级月限
	public static final int PAYRESULT_PLATFORM_DAYLIMIT 	= -13;		//平台级日限
	public static final int PAYRESULT_PLATFORM_MONTHLIMIT 	= -14;		//平台级月限
	
	public static InterfaceIAP thirdpay1 = null;
	public static InterfaceIAP thirdpay2 = null;
	
	public static String pluginName1 = null;
	public static String pluginName2 = null;
	
	
	public static String iapName;										//插件名称
	public static String iapJson;										//订单信息
	public static String resultJson;									//查询支付结果信息
	
	public static Hashtable<String, String> iapInfo 			= null;//订单信息，对应以前插件里面的orderInfo
	public static Hashtable<String, String> curProductInfo 		= null;//宝箱信息
	public static Hashtable<String, String> payResParams 		= null;//查询支付结果参数
	
	public static Hashtable<String, String> payReqParams 					= null;//异步请求订单参数
	
	public static String mallInfoUrl 		= null;
	public static String checkPayReqUrl 	= null;
	  
	private static long delay 		= 5;
	private static long period 		= 10;
	
	private static int checkCount 	= 0;
	private static int doNumber 	= 0;
	
	/* 查询订单进度条 */
	private static ProgressDialog progressDialog = null;
	
	/* 订单查询计划任务，线程池大小为1 */
	private static ScheduledExecutorService scheduExec = Executors.newScheduledThreadPool(1);
	
	/* 用于存储计划任务对象 */
	private static LinkedList<ScheduledFuture<?>> futureList = new LinkedList<ScheduledFuture<?>>();
	
	/* 用于存储订单号，在查询订单时从此orderList中获取 */
	private static LinkedList<String> orderList = new LinkedList<String>();
	
	/*用于无限查询*/
	private static Timer mtimer = null;
	
	//用于请求订单
	private static Timer ordertimer = null;
	private static int ordercheckCount 	= 0;
	
	//用于支付结果
	private static Timer payresulttimer = null;
	private static int payresultcheckCount 	= 0;
	
	/*当前配置的所有支付插件，不分SMS和第三方*/
	private static Hashtable<PluginInfo, InterfaceIAP> mIAPs = new Hashtable<PluginInfo, InterfaceIAP>();
	
	//-----------------------------------------支付流程开始----------------------------------------------------------------------------------
	/**
	 * 开始请求订单
	 */
	public static void startOnPayNew(Hashtable<String, String> productInfo, InterfaceIAP obj, String postfix, Hashtable<String, String> params){
		setCurProductInfo(productInfo);
		setIapName(obj);
		mallInfoUrl = postfix;
		mallInfoUrl = mallInfoUrl.replaceAll("http://", "https://");
		
		if (params == null)
		{
			setPayRequestParams();
			if (payReqParams == null){//请求订单的参数有误时，插件传过来的是null
				nativeOnPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgPayParamerError, iapJson);
				return;
			}
			onPay(mallInfoUrl, payReqParams);
		}
		else
		{
			if(params.get("version") != null && !"".equalsIgnoreCase(params.get("version"))){
				//插件自己搜集的version规则自己处理，上层不覆盖
			}else{
				params.put("version", PlatformWP.getInstance().getVersionName());
			}
			if(params.get("pn") != null && !"".equalsIgnoreCase(params.get("pn"))){
				//插件自己搜集的version规则自己处理，上层不覆盖
			}else{
				params.put("pn", SessionWrapper.gameInfo.get("PacketName"));
			}
			if(params.get("imei") != null && !"".equalsIgnoreCase(params.get("imei"))){
				//插件自己搜集的version规则自己处理，上层不覆盖
			}else{
				params.put("imei", PlatformWP.getInstance().getDeviceIMEI());
			}
			if(params.get("pid") != null && !"".equalsIgnoreCase(params.get("pid"))){
				//插件自己搜集的pid规则自己处理，上层不覆盖
			}else{
				params.put("pid", SessionWrapper.sessionInfo.get("pid"));
			}
			if(params.get("ticket") != null && !"".equalsIgnoreCase(params.get("ticket"))){
				//插件自己搜集的ticket规则自己处理，上层不覆盖
			}else{
				params.put("ticket", SessionWrapper.sessionInfo.get("ticket"));
			}
			if(params.get("boxid") != null && !"".equalsIgnoreCase(params.get("boxid"))){
				//插件自己搜集的boxid规则自己处理，上层不覆盖
			}else{
				params.put("boxid", curProductInfo.get("boxId"));
			}
			
			ParamerParseUtil.printfUrl(mallInfoUrl, params);
			onPay(mallInfoUrl, params);
		}
	}
	
	/**
	 * 开始请求订单
	 */
	public static void startOnPay(Hashtable<String, String> productInfo, InterfaceIAP obj, String postfix)
	{
		setCurProductInfo(productInfo);
		setIapName(obj);
		setMallInfoUrl(postfix);
		
		setPayRequestParams();
		if (payReqParams == null){//请求订单的参数有误时，插件传过来的是null
			nativeOnPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgPayParamerError, iapJson);
			return;
		}
		onPay(mallInfoUrl, payReqParams);
	}
	
	/**
	 * 开始投币请求订单，拓展自定义参数
	 */
	public static void startPressOnPay(Hashtable<String, String> productInfo, InterfaceIAP obj, String postfix, Hashtable<String, String> params)
	{
		setCurProductInfo(productInfo);
		setIapName(obj);
		setMallInfoUrl(postfix);

		if (params == null){//请求订单的参数有误时，插件传过来的是null
			nativeOnPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgPayParamerError, iapJson);
			return;
		}
			
		if(params.get("version") != null && !"".equalsIgnoreCase(params.get("version"))){
			//插件自己搜集的version规则自己处理，上层不覆盖
		}else{
			params.put("version", PlatformWP.getInstance().getVersionName());
		}
		if(params.get("pn") != null && !"".equalsIgnoreCase(params.get("pn"))){
			//插件自己搜集的version规则自己处理，上层不覆盖
		}else{
			params.put("pn", SessionWrapper.gameInfo.get("PacketName"));
		}
		if(params.get("imei") != null && !"".equalsIgnoreCase(params.get("imei"))){
			//插件自己搜集的version规则自己处理，上层不覆盖
		}else{
			params.put("imei", PlatformWP.getInstance().getDeviceIMEI());
		}
		if(params.get("pid") != null && !"".equalsIgnoreCase(params.get("pid"))){
			//插件自己搜集的pid规则自己处理，上层不覆盖
		}else{
			params.put("pid", SessionWrapper.sessionInfo.get("pid"));
		}
		if(params.get("ticket") != null && !"".equalsIgnoreCase(params.get("ticket"))){
			//插件自己搜集的ticket规则自己处理，上层不覆盖
		}else{
			params.put("ticket", SessionWrapper.sessionInfo.get("ticket"));
		}
		if(params.get("boxid") != null && !"".equalsIgnoreCase(params.get("boxid"))){
			//插件自己搜集的boxid规则自己处理，上层不覆盖
		}else{
			params.put("boxid", curProductInfo.get("boxId"));
		}

		ParamerParseUtil.printfUrl(mallInfoUrl, params);
		PressonPay(mallInfoUrl, params);
	}
	
	/**
	 * 开始请求订单，拓展自定义参数
	 */
	public static void startOnPay(Hashtable<String, String> productInfo, InterfaceIAP obj, String postfix, Hashtable<String, String> params)
	{
		setCurProductInfo(productInfo);
		setIapName(obj);
		setMallInfoUrl(postfix);

		if (params == null){//请求订单的参数有误时，插件传过来的是null
			nativeOnPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgPayParamerError, iapJson);
			return;
		}
		
		if(params.get("version") != null && !"".equalsIgnoreCase(params.get("version"))){
			//插件自己搜集的version规则自己处理，上层不覆盖
		}else{
			params.put("version", PlatformWP.getInstance().getVersionName());
		}
		if(params.get("pn") != null && !"".equalsIgnoreCase(params.get("pn"))){
			//插件自己搜集的version规则自己处理，上层不覆盖
		}else{
			params.put("pn", SessionWrapper.gameInfo.get("PacketName"));
		}
		if(params.get("imei") != null && !"".equalsIgnoreCase(params.get("imei"))){
			//插件自己搜集的version规则自己处理，上层不覆盖
		}else{
			params.put("imei", PlatformWP.getInstance().getDeviceIMEI());
		}
		if(params.get("pid") != null && !"".equalsIgnoreCase(params.get("pid"))){
			//插件自己搜集的pid规则自己处理，上层不覆盖
		}else{
			params.put("pid", SessionWrapper.sessionInfo.get("pid"));
		}
		if(params.get("ticket") != null && !"".equalsIgnoreCase(params.get("ticket"))){
			//插件自己搜集的ticket规则自己处理，上层不覆盖
		}else{
			params.put("ticket", SessionWrapper.sessionInfo.get("ticket"));
		}
		if(params.get("boxid") != null && !"".equalsIgnoreCase(params.get("boxid"))){
			//插件自己搜集的boxid规则自己处理，上层不覆盖
		}else{
			params.put("boxid", curProductInfo.get("boxId"));
		}

		ParamerParseUtil.printfUrl(mallInfoUrl, params);
		onPay(mallInfoUrl, params);
	}
	
	/**
	 * 开始请求订单，拓展自定义参数
	 */
	public static void startAllOnPay(Hashtable<String, String> productInfo, InterfaceIAP obj, String postfix, Hashtable<String, String> params)
	{
		setCurProductInfo(productInfo);
		setIapName(obj);
		setMallInfoUrl(postfix);

		if (params == null){//请求订单的参数有误时，插件传过来的是null
			nativeOnPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgPayParamerError, iapJson);
			return;
		}
		
		if(params.get("version") != null && !"".equalsIgnoreCase(params.get("version"))){
			//插件自己搜集的version规则自己处理，上层不覆盖
		}else{
			params.put("version", PlatformWP.getInstance().getVersionName());
		}
		if(params.get("pn") != null && !"".equalsIgnoreCase(params.get("pn"))){
			//插件自己搜集的pn规则自己处理，上层不覆盖
		}else{
			params.put("pn", SessionWrapper.gameInfo.get("PacketName"));
		}
		if(params.get("imei") != null && !"".equalsIgnoreCase(params.get("imei"))){
			//插件自己搜集的imei规则自己处理，上层不覆盖
		}else{
			params.put("imei", PlatformWP.getInstance().getDeviceIMEI());
		}
		if(params.get("pid") != null && !"".equalsIgnoreCase(params.get("pid"))){
			//插件自己搜集的pid规则自己处理，上层不覆盖
		}else{
			params.put("pid", SessionWrapper.sessionInfo.get("pid"));
		}
		if(params.get("ticket") != null && !"".equalsIgnoreCase(params.get("ticket"))){
			//插件自己搜集的ticket规则自己处理，上层不覆盖
		}else{
			params.put("ticket", SessionWrapper.sessionInfo.get("ticket"));
		}
		if(params.get("boxid") != null && !"".equalsIgnoreCase(params.get("boxid"))){
			//插件自己搜集的boxid规则自己处理，上层不覆盖
		}else{
			params.put("boxid", curProductInfo.get("boxId"));
		}

		ParamerParseUtil.printfUrl(mallInfoUrl, params);
		onAllPay(mallInfoUrl, params);
	}
	
	 /**
	  * 设置商品信息
	  * param curp
	  */
	 public static void setCurProductInfo(Hashtable<String, String> productInfo)
	 {
		curProductInfo = productInfo;
	 }
 
	/**
	 * 设置支付插件名称
	 * @param obj
	 */
	public static void setIapName(InterfaceIAP obj) 
	{
		iapName = obj.getClass().getName().replace('.', '/');
	}
	
	/**
	* 设置初始化订单url
	* @param postfix
	* @return
	*/
	public static void setMallInfoUrl(String postfix) 
	{
		mallInfoUrl = getServerURLPre() + postfix;
		mallInfoUrl = mallInfoUrl.replaceAll("http://", "https://");
	}
	
	 /**
	  * 设置订单初始化基本参数
	  * return payReqParams
	  */
	 public static void setPayRequestParams()
	 {
		 payReqParams = new Hashtable<String, String>();
		 
		 try
		 {
			 payReqParams.put("pid",    	SessionWrapper.sessionInfo.get("pid"));
			 payReqParams.put("ticket", 	SessionWrapper.sessionInfo.get("ticket"));
			 payReqParams.put("boxid",  	curProductInfo.get("boxId"));
			 payReqParams.put("imei", 		PlatformWP.getInstance().getDeviceIMEI());
			 payReqParams.put("imsi", 		PlatformWP.getInstance().getDeviceIMSI());
			 payReqParams.put("pn", 		SessionWrapper.gameInfo.get("PacketName"));
			 payReqParams.put("version", 	PlatformWP.getInstance().getVersionName());
		 }
		 catch(NullPointerException e)
		 {
			 payReqParams = null;
		 }
	 }
	
	/**
	 * 投币向服务器发送订单请求参数
	 * */
	public static void PressonPay(final String payReqUrl, final Hashtable<String, String> params)
	{
    	HttpsClientUtil.post(payReqUrl, params, iapJsonHandler);
	}
	 /**
	 * 停止请求订单
	 * */
	private static void StopOrderTimer(){
		if (ordertimer != null){
			ordertimer.cancel();
			ordertimer = null;
		}
	}
	/**
	 * 向服务器发送订单请求并处理返回结果
	 * 
	 * param payReqUrl
	 * param payReqParam
	 */
	public static void onPay(final String payReqUrl, final Hashtable<String, String> params)
	{
		StopOrderTimer();
		ordercheckCount = 0;
		ordertimer = new Timer();
		ordertimer.schedule(new TimerTask() {  
            @SuppressLint("LongLogTag")
			public void run() {
            	Log.i("IAPWrapper startOnPay onPay", "ordercheckCount="+ordercheckCount);
            	if (ordercheckCount > 5){
            		ordercheckCount = 0;
            		StopOrderTimer();
            		
            		onPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgGetOrderTimeout);
            		return;
            	}
            	HttpsClientUtil.post(payReqUrl, params, iapJsonHandler);
            	ordercheckCount ++;
            }
        }, 0, 5*1000);//5s 定时任务
	}
	
	public static void onAllPay(final String payReqUrl, final Hashtable<String, String> params)
	{
		StopOrderTimer();
		ordercheckCount = 0;
		ordertimer = new Timer();
		ordertimer.schedule(new TimerTask() {  
            public void run() { 
            	if (ordercheckCount > 5){
            		ordercheckCount = 0;
            		StopOrderTimer();
            		
            		onPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgGetOrderTimeout);
            		return;
            	}
            	HttpsClientUtil.post(payReqUrl, params, iapAllJsonHandler);
            	ordercheckCount ++;
            }
        }, 0, 5*1000);//5s 定时任务
	}

	/**
	 * 设置通知web支付结果的信息
	 */
	public static Hashtable<String, String> getPayResultPost(String payResult) {

		Hashtable<String, String> requsetParams = null;
		try
		 {
			requsetParams = new Hashtable<String, String>();
			String pid = SessionWrapper.sessionInfo.get("pid");
			String ticket = SessionWrapper.sessionInfo.get("ticket");
			String pn = SessionWrapper.gameInfo.get("PacketName");
			String order = iapInfo.get("order");
			SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");        
			Date curDate = new Date(System.currentTimeMillis());//获取当前时间
			String randomno = formatter.format(curDate);
			
			requsetParams.put("ticket", ticket);
			requsetParams.put("pid", pid);
			requsetParams.put("pn", pn);
			requsetParams.put("order", order);
			requsetParams.put("payResult", payResult);
			requsetParams.put("randomno", randomno);
		 }
		 catch(NullPointerException e)
		 {
			 requsetParams = null;
			 e.printStackTrace();
		 }
		

		return requsetParams;
	}
	/**
	 * 停止发送支付结果
	 * */
	private static void StopPayResultTimer(){
		if (payresulttimer != null){
			payresulttimer.cancel();
			payresulttimer = null;
			payresultcheckCount = 0;
		}
	}
	/**
	 * sdk支付结果，通知web，一直post直到web通知处理了，才停止。
	 * */
	public static void StartPayResultPost(final Hashtable<String, String> params)
	{
		String payReqUrl = "client/pay/result";
		
		if (params == null){
			nativeOnPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgPayResultError, iapJson);
			return;
		}
		
		setMallInfoUrl(payReqUrl);
		
		StopPayResultTimer();
		payresulttimer = new Timer();
		payresulttimer.schedule(new TimerTask() {  
            public void run() {  
//            	if (payresultcheckCount > 5){
//            		payresultcheckCount = 0;
//            		StopPayResultTimer();
//            		return;
//            	}
            	HttpsClientUtil.post(mallInfoUrl, params, iapPayResultJsonHandler);
            	payresultcheckCount ++;
            }
        }, 0, 5*1000);// 定时任务
	
	}
	final static ResponseCallback iapPayResultJsonHandler = new ResponseCallback()
	{

		@Override
		public void onFailure()
		{
			//onPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgGetOrderTimeout);
		}

		@Override
		public void onSuccess(JSONObject jsonObject)
		{
			try 
			{
				String ret = jsonObject.getString("ret");
				
				if(ret.equalsIgnoreCase("0"))
				{	
					StopPayResultTimer();
				}
			} 
			catch (JSONException e) 
			{
				StopPayResultTimer();
			}
		}
	
	};
	
	/**
	 * 支付失败时，通知web，一直post直到web通知处理了，才停止。
	 * */
	public static void StartFailOnPay(String payReqUrl, final Hashtable<String, String> params)
	{
		if (params == null){
			nativeOnPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgPayResultError, iapJson);
			return;
		}
		
		setMallInfoUrl(payReqUrl);
		
		StopInfiniteTimer();
		mtimer = new Timer();
        mtimer.schedule(new TimerTask() {  
            public void run() {  
            	HttpsClientUtil.post(mallInfoUrl, params, iapFailJsonHandler);
            	checkCount++;
            }
        }, 0, 5*1000);// 定时任务
	
	}
	final static ResponseCallback iapFailJsonHandler = new ResponseCallback()
	{

		@Override
		public void onFailure()
		{
			//onPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgGetOrderTimeout);
		}

		@Override
		public void onSuccess(JSONObject jsonObject)
		{
			try 
			{
				String ret = jsonObject.getString("ret");
				
				if(ret.equalsIgnoreCase("0"))
				{	
					StopInfiniteTimer();
				}
			} 
			catch (JSONException e) 
			{
				//onPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgGetOrderFail);
			}
		}
	
	};
	
	/**
	 * 请求订单回调
	 * 
	 * 在处理请求时重写JsonHttpResponseHandler中的onFailure方法和onSuccess方法
	 * 在游戏完善过程中可以重写onStart和onFinishe方法，进行UI更新通知
	 */
	final static ResponseCallback iapAllJsonHandler = new ResponseCallback()
	{

		@Override
		public void onFailure()
		{
			StopOrderTimer();
			onPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgGetOrderTimeout);
		}

		@Override
		public void onSuccess(JSONObject jsonObject)
		{
			StopOrderTimer();
			
			iapJson = ParamerParseUtil.parseJsonToString(jsonObject);
			
			iapInfo = new Hashtable<String, String>();
			
			try 
			{
				Iterator<?> iterator = jsonObject.keys();
				while(iterator.hasNext()) 
				{
					String key = (String) iterator.next();
					iapInfo.put(key, jsonObject.getString(key));
				}
				
				usePayByIapObjectName(iapName);
			} 
			catch (JSONException e) 
			{
				StopOrderTimer();
				onPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgGetOrderFail);
			}
		}
	
	};
	
	/**
	 * 请求订单回调
	 * 
	 * 在处理请求时重写JsonHttpResponseHandler中的onFailure方法和onSuccess方法
	 * 在游戏完善过程中可以重写onStart和onFinishe方法，进行UI更新通知
	 */
	final static ResponseCallback iapJsonHandler = new ResponseCallback()
	{

		@Override
		public void onFailure()
		{
			StopOrderTimer();
			onPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgGetOrderTimeout);
		}

		@Override
		public void onSuccess(JSONObject jsonObject)
		{
			StopOrderTimer();
			
			iapJson = ParamerParseUtil.parseJsonToString(jsonObject);
			
			iapInfo = new Hashtable<String, String>();
			try 
			{
				String ret = jsonObject.getString("ret");
				String msg = jsonObject.getString("msg");
				
				if(ret.equalsIgnoreCase("0"))
				{	
					Iterator<?> iterator = jsonObject.keys();
					while(iterator.hasNext()) 
					{
						String key = (String) iterator.next();
						iapInfo.put(key, jsonObject.getString(key));
					}
					
					usePayByIapObjectName(iapName);
				}
				else
				{
					judgeLimit(ret, msg);
				}
			} 
			catch (JSONException e) 
			{
				StopOrderTimer();
				onPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgGetOrderFail);
			}
		}
	
	};
	
	/**
	 * 获取支付插件对象，并调用pay（）方法
	 * @param iapName
	 */
	private static void usePayByIapObjectName(String iapName) 
	{
		try 
		{
			String className = iapName.replace('/', '.');
			Class<?> iapClass = Class.forName(className);
			Object iapObj = null;//iapClass.newInstance();
			iapObj = iapClass.getDeclaredConstructor(Context.class).newInstance(PluginWrapper.getContext());
			Method iapPay = iapClass.getMethod("pay");
			iapPay.invoke(iapObj);//调用pay方法
		}
		catch (Exception e) 
		{
			e.printStackTrace();
		}
	}
	
	/**
	 * 日限月限的判断
	 * param obj
	 * param ret
	 * param msg
	 */
	 public static void judgeLimit(String result, String resultMsg)
	 {
		 final int curRet = Integer.parseInt(result);
		 final String curMsg = resultMsg;
		 
		 iapInfo = null;//对iapInfo做内存释放
		 
		 switch (curRet)
		 {
			case PAYRESULT_PLATFORM_DAYLIMIT:
			case PAYRESULT_PLATFORM_MONTHLIMIT:
				PluginWrapper.runOnMainThread(new Runnable() 
				{
					@Override
					public void run() 
					{
						Builder alertdialog = new AlertDialog.Builder(PluginWrapper.getContext())
						.setTitle("提示")
						.setMessage(curMsg)
						.setPositiveButton("确定", new DialogInterface.OnClickListener() 
						{
							@Override
							public void onClick(DialogInterface dialog, int which) 
							{
								onPayResult(iapName, PAYRESULT_CANCEL, curMsg);
							}
						});
						alertdialog.setCancelable(false);
						alertdialog.show();
					}
				});
				break;
			case PAYRESULT_QUICKPAY_DAYLIMIT:
			case PAYRESULT_QUICKPAY_MONTHLIMIT:
				PluginWrapper.runOnMainThread(new Runnable() 
				{
					@Override
					public void run() 
					{
						Builder alertdialog = new AlertDialog.Builder(PluginWrapper.getContext())
						.setTitle("提示")
						.setMessage(curMsg)
						.setPositiveButton("确定", new DialogInterface.OnClickListener()
						{
							@Override
							public void onClick(DialogInterface dialog, int which)
							{
								if ("0".equals(curProductInfo.get("isSmsQuickPay")))
								{
									onPayResult(iapName, PAYRESULT_CANCEL, curMsg);
								}
								else
								{
//									if (pluginName1 == pluginName2 || pluginName2 == null)
//									{
//										onPayResult(iapName, PAYRESULT_CANCEL, curMsg);
//									}
//									else
//									{
//										curProductInfo.put("isSmsQuickPay", "0");
//										//thirdpay2.payForProduct(curProductInfo);
//										getThirdPay().payForProduct(curProductInfo);	
//									}
									onPayResult(iapName, PAYRESULT_OTHERPAY, "短信支付失败，暂时无法购买！要不咱们换种方式购买吧。");
								}
							}
						});
						alertdialog.setCancelable(false);
						alertdialog.show();
					}
				});
				break;
			case PAYRESULT_SHOPSTORE_DAYLIMIT:
			case PAYRESULT_SHOPSTORE_MONTHLIMIT:
				PluginWrapper.runOnMainThread(new Runnable() 
				{
					@Override
					public void run() {
						Builder alertdialog = new AlertDialog.Builder(PluginWrapper.getContext())
							.setTitle("提示")
							.setMessage(curMsg)
							.setPositiveButton("确定", new DialogInterface.OnClickListener() 
							{
								@Override
								public void onClick(DialogInterface dialog, int which) 
								{
									onPayResult(iapName, PAYRESULT_CANCEL, curMsg);
								}
						});
						alertdialog.setCancelable(false);
						alertdialog.show();
					}
				});
				break;
			default:
				onPayResult(iapName, PAYRESULT_CANCEL, curMsg);
				break;
		 }
	 }
	 
	 public static InterfaceIAP getThirdPay(){
		 InterfaceIAP obj = null;
		 
		 for(Entry<PluginInfo, InterfaceIAP> var:mIAPs.entrySet()){
			 if(var.getKey().getType().equals(""+InterfaceIAP.PluginType)) {
				 obj = var.getValue();
				 break;
			 }
		 }
		 return obj;
	 }
	 
	 public static void addIAPPlugin(PluginInfo key, InterfaceIAP value) {
		 if (key == null)
			 return;
		 mIAPs.put(key, value);
	 }
	 /**
	  * PluginWrapper initPlugin(String classFullName)调用
	  *  设置当前支付渠道名称
	  */
	 public static void setIAPName(Object obj, String name)
	 {
		 
		 name = name.replace("org/cocos2dx/plugin/", "");

		 if (name.startsWith("IAP"))
		 {
			 
			 if(pluginName1 == null)
			 {
				 pluginName1 = name;
				 thirdpay1 = (InterfaceIAP)obj;
				 thirdpay2 = thirdpay1;
			 }
			 else
			 {
				 pluginName2 = name;
				 if(pluginName1.equals("IAPSky"))
				 {
					 thirdpay2 = (InterfaceIAP)obj;
				 }
				 else
				 {
					 thirdpay2 = thirdpay1;
				 }
			 }
		 }
	 }
	 
	//-----------------------------------------支付流程结束-----------------------------------------------------------
	 
	 
	
	 
	 
	//-----------------------------------------查询订单流程开始-----------------------------------------------------------
	/**
	 * 开始查询订单
	 */
	public static void startCheckPay(Context ctx, String postfix)
	{
		showProcessDialog(ctx);
		setCheckPayReqUrl(postfix);

		setQueryOrderParams();
		startCheckPayService(checkPayReqUrl, payResParams);
	}
	
	/**
	 * 开始查询订单,拓展自定义参数
	 */
	public static void startCheckPay(Context ctx, String postfix,Hashtable<String, String> params)
	{
		showProcessDialog(ctx);
		setCheckPayReqUrl(postfix);

		startCheckPayService(checkPayReqUrl, params);
	}
	
	/**
	 * 开始查询订单,拓展自定义参数
	 */
	public static void startCheckPay(String postfix,Hashtable<String, String> params)
	{
		setCheckPayReqUrl(postfix);
		
		startCheckPayService(checkPayReqUrl, params);
	}

	/**
	 * 开始查询订单,拓展自定义参数
	 */
	public static void startCheckPayNew(String postfix,Hashtable<String, String> params)
	{
		checkPayReqUrl = postfix;
		
		startCheckPayService(checkPayReqUrl, params);
	}
	
	/**
	 * 开启无限定时查询订单信息服务
	 * 
	 * @param postfix
	 * @param params
	 * */
	public static boolean handingpay = true;//订单处理中的状态设置
	public static void startInfiniteCheckPay(String postfix, final Hashtable<String, String> params)
	{
		setCheckPayReqUrl(postfix);
		
		StopInfiniteTimer();
		mtimer = new Timer();
        mtimer.schedule(new TimerTask() {  
            public void run() {  
            	InfiniteCheckPayResult(checkPayReqUrl, params);
            	checkCount++;
            }
        }, 0, 10*1000);// 定时任务
	}
	/**
	 * 停止无限查询
	 * */
	private static void StopInfiniteTimer(){
		if (mtimer != null){
			mtimer.cancel();
			mtimer = null;
		}
	}
	/**
	 * 无限查询的支付结果
	 * 在SDK支付成功后调用此方法进行订单查询
	 * 除了web返回0,1,2状态，否则继续post请求
	 * param checkPayUrl
	 * param checkPayReqParams
	 */
	public static void InfiniteCheckPayResult(final String checkPayUrl, final Hashtable<String, String> params) 
	{	
		System.out.println("支付结果第" + (checkCount+1 )+ "次查询");

		HttpsClientUtil.post(checkPayUrl, params, infiniteCheckPayJsonHandler);
	}
	final static ResponseCallback infiniteCheckPayJsonHandler = new ResponseCallback()
	{

		@Override
		public void onFailure() {

//				String failret = params.get("failret");
//				if ("7".equals(failret)){
//					onPayResult(iapName, PAYRESULT_OTHERPAY, MsgStringConfig.msgVerifyOrderTimeout);
//				}
//				else if ("9".equals(failret)){
//					//应用宝不返回
//				}
//				else{
//					onPayResult(iapName, PAYRESULT_SERVER_FAIL, MsgStringConfig.msgVerifyOrderTimeout);
//				}
		}

		@Override
		public void onSuccess(JSONObject jsonObject) {
			if(jsonObject == null)
			{
//					String failret = params.get("failret");
//					if ("7".equals(failret)){
//						onPayResult(iapName, PAYRESULT_OTHERPAY, MsgStringConfig.msgVerifyOrderError);
//					}
//					else if ("9".equals(failret)){
//						//应用宝不返回
//					}
//					else{
//						onPayResult(iapName, PAYRESULT_SERVER_FAIL, MsgStringConfig.msgVerifyOrderError);
//					}
			}
			resultJson = ParamerParseUtil.parseJsonToString(jsonObject);
			try
			{
				String ret = jsonObject.getString("ret");
				String msg = jsonObject.getString("msg");
				if(ret.equalsIgnoreCase("0"))
				{
					//stopCheckPayService(futureList.getFirst());
					StopInfiniteTimer();

					/* 到服务器查询订单支付情况，如有需求需要开启该过程 */

						/*String message = jsonObject.getString("desc");

						showToast(message);
						*/

					// onPayResult(iapName, PAYRESULT_SERVER_SUCCESS, MsgStringConfig.msgVerifyOrderSuccess);

					//hideProcessDialog();

					onPayResult(iapName, PAYRESULT_SUCCESS, msg);

				}
				else if(ret.equalsIgnoreCase("1"))//订单处理中
				{
					//StopInfiniteTimer();

					if (!handingpay)
					{
						handingpay = true;
						onPayResult(iapName, PAYRESULT_NOCALLBACK_ONLYTIPS, msg);
					}

					//订单处理中后，开启无限查询
					//startInfiniteCheckPay(getCheckPayReqUrl(), params);
				}
				else if(ret.equalsIgnoreCase("2"))//订单超时失败
				{
					System.out.println("pay check result: ret = " + ret);

					StopInfiniteTimer();

//						String failret = params.get("failret");
//						if ("7".equals(failret)){
//							onPayResult(iapName, PAYRESULT_OTHERPAY, MsgStringConfig.msgPayFail);
//						}
//						else if ("9".equals(failret)){
//							//应用宝不返回
//
//						}else{
//							onPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgPayFail);
//						}
					onPayResult(iapName, PAYRESULT_FAIL, msg);
				}
			}
			catch (JSONException e)
			{
//					if(checkCount >= 4)
//					{
//						stopCheckPayService(futureList.getFirst());
//					}
//					String failret = params.get("failret");
//					if ("7".equals(failret)){
//						onPayResult(iapName, PAYRESULT_OTHERPAY, MsgStringConfig.msgVerifyOrderFail);
//
//					}
//					else if ("9".equals(failret)){
//						//应用宝不返回
//					}
//					else{
//						onPayResult(iapName, PAYRESULT_SERVER_FAIL, MsgStringConfig.msgVerifyOrderFail);
//					}
			}
		}
	};
	
	/**
	 * 显示进度条
	 * @param ctx
	 */
	private static void showProcessDialog(final Context ctx)
	{
		PluginWrapper.runOnMainThread(new Runnable()
		{
			@Override
			public void run()
			{
				initProcessDialog(ctx);
				progressDialog.show();
				
			}
		});
	}
	
	private static void hideProcessDialog()
	{
		if(progressDialog != null)
		{
			progressDialog.dismiss();
		}
	}
	
	/**
	 * 初始化查询订单进度条
	 * @param context
	 */
	@SuppressWarnings("deprecation")
	private static void initProcessDialog(Context context)
	{
		progressDialog = new ProgressDialog(context);
		progressDialog.setMessage(MsgStringConfig.msgProcessDialg);
		progressDialog.setProgress(100);
		
		progressDialog.setButton("关闭", new DialogInterface.OnClickListener()
		{
			@Override
			public void onClick(DialogInterface dialog, int which)
			{
				hideProcessDialog();
				
				onPayResult(iapName, PAYRESULT_DEFAULT_CALLBACK, MsgStringConfig.msgPayDefault);
			}
		});

		progressDialog.setCancelable(false);
	}
	
	/**
	* 设置查询订单url
	* @param postfix
	* @return
	*/
	private static void setCheckPayReqUrl(String postfix) 
	{
		checkPayReqUrl = getServerURLPre() + postfix;
		checkPayReqUrl = checkPayReqUrl.replaceAll("http://", "https://");
	}
	
	/**
	 * 
	 * */
	private static String getCheckPayReqUrl()
	{
		String url = "";
		
		url = checkPayReqUrl.replace(getServerURLPre(), "");
		
		return url;
	}
	
	/**
	* 设置查询订单参数
	*/
	private static void setQueryOrderParams()
	{
		payResParams = new Hashtable<String, String>();
		try
		{
			payResParams.put("pid",   SessionWrapper.sessionInfo.get("pid"));
			payResParams.put("order", iapInfo.get("order"));
		}
		catch(Exception e)
		{
			e.printStackTrace();
		}
	}
	
	//-----------------------------------------------------------------------------------------------------------------
	
	/**
	 * 开启定时查询订单信息服务
	 * 
	 * param checkPayUrl
	 * param checkPayReqPrams
	 */
	public static void startCheckPayService(final String checkPayUrl, final Hashtable<String, String> checkPayReqParams) 
	{
		doNumber++;
		orderList.add(checkPayReqParams.get("order"));
	
		System.out.println("startCheckPayService.............");
		System.out.println("start check pay service count ::" + doNumber );
		
		if(orderList.isEmpty())
		{
			System.out.print("order list error !!!");
			return;
		}
		
		Runnable task = new Runnable()
		{
			@Override
			public void run() 
			{	
				Hashtable<String, String> params = checkPayReqParams;
				
				params.put("order", orderList.getFirst());
				
				checkPayResult(checkPayUrl, params);
				checkCount++;
				
				System.out.println("checkPayReqParams::" + checkPayReqParams.get("pid") + "*******" + params.get("order"));
			}
		};
		
		ScheduledFuture<?> future =  scheduExec.scheduleAtFixedRate(task, delay, period, TimeUnit.SECONDS);
		
		futureList.add(future);
	}
	
	/**
	 * 关闭定时查询订单信息服务
	 */
	private static void stopCheckPayService(ScheduledFuture<?> future) 
	{
		System.out.println("stopCheckPayService.............");
		
		future.cancel(true);
		/* 移出存储在list中的future和order对象 */
		futureList.remove(future);
		orderList.removeFirst();
		clearIapInfo(iapInfo);
        checkCount = 0;
    }
	
	/**
	 * 清除商品信息
	 * @param hashtable
	 */
	private static void clearIapInfo(Hashtable<String, String> hashtable)
	{
		hashtable.clear();
	}
	
	/**
	 * 查询支付结果
	 * 在SDK支付成功后调用此方法进行订单查询
	 * param checkPayUrl
	 * param checkPayReqParams
	 */
	public static void checkPayResult(final String checkPayUrl, final Hashtable<String, String> params) 
	{	
		System.out.println("支付结果第" + (checkCount+1 )+ "次查询");

		HttpsClientUtil.post(checkPayUrl, params, new ResponseCallback()
		{
			@Override
			public void onFailure()
			{
				if(checkCount >= 4)
				{
					stopCheckPayService(futureList.getFirst());

					String failret = params.get("failret");
					if ("7".equals(failret)){
						onPayResult(iapName, PAYRESULT_OTHERPAY, MsgStringConfig.msgVerifyOrderTimeout);
					}
					else if ("9".equals(failret)){
						//应用宝不返回
					}
					else{
						onPayResult(iapName, PAYRESULT_SERVER_FAIL, MsgStringConfig.msgVerifyOrderTimeout);
					}
				}
			}

			@Override
			public void onSuccess(JSONObject jsonObject)
			{
				if(jsonObject == null)
				{
					String failret = params.get("failret");
					if ("7".equals(failret)){
						onPayResult(iapName, PAYRESULT_OTHERPAY, MsgStringConfig.msgVerifyOrderError);
					}
					else if ("9".equals(failret)){
						//应用宝不返回
					}
					else{
						onPayResult(iapName, PAYRESULT_SERVER_FAIL, MsgStringConfig.msgVerifyOrderError);
					}
					return;
				}
				
				resultJson = ParamerParseUtil.parseJsonToString(jsonObject);
				try 
				{
					String ret = jsonObject.getString("ret");
					
					if(ret.equalsIgnoreCase("0")) 
					{
						stopCheckPayService(futureList.getFirst());
						
						/* 到服务器查询订单支付情况，如有需求需要开启该过程 */
						
						/*String message = jsonObject.getString("desc");
						
						showToast(message);
						*/
						
						// onPayResult(iapName, PAYRESULT_SERVER_SUCCESS, MsgStringConfig.msgVerifyOrderSuccess);
						
						hideProcessDialog();
						
						onPayResult(iapName, PAYRESULT_SUCCESS, MsgStringConfig.msgPaySuccess);
						
					}
					else if(!ret.equalsIgnoreCase("0") && checkCount>=4)
					{
						System.out.println("stop check pay service :: ret!=0 && checkCount>=4");
						stopCheckPayService(futureList.getFirst());
						
						//onPayResult(iapName, PAYRESULT_SERVER_FAIL, MsgStringConfig.msgVerifyOrderFail);
						
						hideProcessDialog();
						
						String failret = params.get("failret");
						if ("7".equals(failret)){
							onPayResult(iapName, PAYRESULT_OTHERPAY, MsgStringConfig.msgPayFail);
						}
						else if ("9".equals(failret)){
							//应用宝不返回
						
						}else{
							onPayResult(iapName, PAYRESULT_FAIL, MsgStringConfig.msgPayFail);
						}
					}
				} 
				catch (JSONException e) 
				{
					if(checkCount >= 4)
					{
						stopCheckPayService(futureList.getFirst());
					}
					
					String failret = params.get("failret");
					if ("7".equals(failret)){
						onPayResult(iapName, PAYRESULT_OTHERPAY, MsgStringConfig.msgVerifyOrderFail);
						
					}
					else if ("9".equals(failret)){
						//应用宝不返回
					}
					else{
						onPayResult(iapName, PAYRESULT_SERVER_FAIL, MsgStringConfig.msgVerifyOrderFail);
					}
				}
			}
		});
	}

	/**
	 * 显示结果toast
	 * @param message
	 */
	private static void showToast(final String message) 
	{
		PluginWrapper.runOnMainThread(new Runnable() 
		{
			@Override
			public void run() 
			{
				Toast.makeText(PluginWrapper.getContext(), message, Toast.LENGTH_SHORT).show();
			}
		});
	}

	//-------------------------------------查询订单流程结束-------------------------------------------------------

	/**
	 * 设置购买环境（正式、测试、镜像）
	 * @param env
	 */
    public static void setRunEnv(int env)
	{
		PluginWrapper.nCurrentRunEnv = env;
	}
	
	/**
	 * 获取服务器环境地址前缀
	 * 
	 * @return serverURLPre
	 */
	public static String getServerURLPre()
	{
		
		String serverURLPre = URLConfig.oMallHost;
		
		switch(PluginWrapper.nCurrentRunEnv)
		{
			case PluginWrapper.ENV_OFFICIAL:
			{
				serverURLPre = URLConfig.oMallHost;
				break;
			}
			case PluginWrapper.ENV_TEST:
			{
				serverURLPre = URLConfig.tMallHost;
				break;
			}
			case PluginWrapper.ENV_MIRROR:
			{
				serverURLPre = URLConfig.mMallHost;
				break;
			}
			case PluginWrapper.ENV_DUFU:
			{
				serverURLPre = URLConfig.dMallHost;
				break;
			}
			default:
			{
				serverURLPre = URLConfig.oMallHost;
				break;
			}
		}
		
		return serverURLPre;
	}
	
	//----------------------------------------回调游戏接口开始--------------------------------------------
	/**
	 * 处理支付结果
	 * 
	 * @param obj，插件对象
	 * @param ret
	 * @param msg
	 */
	public static void onPayResult(InterfaceIAP obj, int ret, String msg) 
	{
		String name = obj.getClass().getName();
		name = name.replace('.', '/');
		onPayResult(name , ret , msg);
	}
	
	/**
	 * 处理支付结果，插件名称
	 * @param name
	 * @param ret
	 * @param msg
	 */
	public static void onPayResult(String name, int ret, String msg)
	{
		final int curRet = ret;
		final String curMsg = msg;
		final String curName = name;
		PluginWrapper.runOnGLThread(new Runnable()
		{
			@Override
			public void run()
			{
				nativeOnPayResult(curName, curRet, curMsg, iapJson);
			}
		});
		
		//通知web服务器支付结果消息
		//StartPayResultPost(getPayResultPost(curMsg));
	}
	
	/**
	 * 处理支付结果，将结果通过jni回调给游戏逻辑
	 * @param className
	 * @param ret
	 * @param msg
	 * @param iapJson 订单信息（存储为json串形式）
	 */
	private static native void nativeOnPayResult(String className, int ret, String msg, String iapJson);
	//---------------------------------------回调游戏接口结束---------------------------------------------
}
