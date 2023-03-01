package org.cocos2dx.plugin;

import java.util.Hashtable;
import android.app.Activity;
import android.content.Context;
import android.util.Log;
import com.baidu.gamesdk.BDGameSDK;
import com.baidu.gamesdk.IResponse;
import com.baidu.gamesdk.ResultCode;
import com.baidu.platformsdk.PayOrderInfo;
import org.cocos2dx.config.MsgStringConfig;

public class IAPBaiDu implements InterfaceIAP{
	
	private static final String LOG_TAG = "IAPBaiDu";
	private static Activity mContext = null;
	static IAPBaiDu mbaidu = null;
	private static boolean bDebug = false;
	private static String order = "";
	private static Hashtable<String, String> configInfo = null;
	private static Hashtable<String, String> productInfo = null;
	private static String IAPHost = "";
	
	public IAPBaiDu(Context context) {
		mContext = (Activity)context;
        mbaidu = this;
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
	public void configDeveloperInfo(Hashtable<String, String> cpInfo) {
		configInfo = cpInfo;
	}

	@Override
	public void payForProduct(Hashtable<String, String> cpInfo) {
		LogD("payForProduct invoked " + cpInfo.toString());
		
		if (! PlatformWP.networkReachable(mContext)) {
			payResult(IAPWrapper.PAYRESULT_FAIL, MsgStringConfig.msgNetworkError);
			return;
		}
		
		productInfo = new Hashtable<String, String>(cpInfo);
		IAPHost = productInfo.get("IapHost");
		if ("".equals(IAPHost) || IAPHost == null){
			IAPWrapper.startOnPay(productInfo, mbaidu, "baiduyd/intl/pay", getPayRequestParams());
		}else{
			IAPWrapper.startOnPayNew(productInfo, mbaidu, IAPHost+"baiduyd/intl/pay", getPayRequestParams());
		}
	}

    @Override
    public void pay() {
        PluginWrapper.runOnMainThread(new Runnable(){
            @Override
            public void run() {
                try{
                    PayOrderInfo payOrderInfo = buildOrderInfo();
                    if(payOrderInfo == null){
                        payResult(IAPWrapper.PAYRESULT_FAIL, MsgStringConfig.msgProductInfoError);
                        return;
                    }

                    BDGameSDK.pay(mContext, payOrderInfo, null, new IResponse<PayOrderInfo>(){

                                @Override
                                public void onResponse(int resultCode, String resultDesc, PayOrderInfo extraData) {
                                    //String resultStr = "";
                                    switch(resultCode){
                                        case ResultCode.PAY_SUCCESS://支付成功
                                            //resultStr = "支付成功:" + resultDesc;
                                            payResult(IAPWrapper.PAYRESULT_SUCCESS, MsgStringConfig.msgPaySuccess);
                                            break;
                                        case ResultCode.PAY_CANCEL://订单支付取消
                                            //resultStr = "取消支付";
                                            payResult(IAPWrapper.PAYRESULT_CANCEL, MsgStringConfig.msgPayCancel);
                                            break;
                                        case ResultCode.PAY_FAIL://订单支付失败
                                            //resultStr = "支付失败：" + resultDesc;
                                            payResult(IAPWrapper.PAYRESULT_FAIL, MsgStringConfig.msgPayFail);
                                            break;
                                        case ResultCode.PAY_SUBMIT_ORDER://订单已经提交，支付结果未知（比如：已经请求了，但是查询超时）
                                        default:
                                            //resultStr = "订单已经提交，支付结果未知";
                                            payResult(IAPWrapper.PAYRESULT_NOCALLBACK_ONLYTIPS, MsgStringConfig.msgOrdersubmited);
                                            break;
                                    }
                                }
                            });
                }catch(Exception e){
                    payResult(IAPWrapper.PAYRESULT_FAIL, "商品信息有误，暂时不能支付");
                }
            }
        });
    }
    /**
     * 构建订单信息
     */
    private PayOrderInfo buildOrderInfo(){
        String productName = productInfo.get("goodsName");
        String strPrice = productInfo.get("saleMoney");
        order = IAPWrapper.iapInfo.get("order");
        int money = Math.round(Float.parseFloat(strPrice)*100);
        String totalAmount = String.valueOf(money);//支付总金额 （以分为单位）
        String pid = SessionWrapper.sessionInfo.get("pid");

        PayOrderInfo payOrderInfo = new PayOrderInfo();
        payOrderInfo.setCooperatorOrderSerial(order);
        payOrderInfo.setProductName(productName);
        long p = Long.parseLong(totalAmount);
        payOrderInfo.setTotalPriceCent(p);//以分为单位
        //商品兑换比例，如：兑换比例为5时，表示100分钱可兑换5个商品；（该字段只在非定额支付时生效，定额支付不生效）
        payOrderInfo.setRatio(1);
        payOrderInfo.setExtInfo(pid);//该字段将会在支付成功后原样返回给CP(不超过500个字符)
        payOrderInfo.setCpUid(SessionBaiDu.userid); // 必传字段，需要验证uid是否合法,此字段必须是登陆后或者切换账号后保存的uid
        return payOrderInfo;
    }

    @Override
    public Hashtable<String, String> getPayRequestParams() {
        try {
            String uid = SessionWrapper.sessionInfo.get("pid");
            String ticket = SessionWrapper.sessionInfo.get("ticket");
            String boxid = productInfo.get("boxId");
            String imei = PlatformWP.getInstance().getDeviceIMEI();
            String version = PlatformWP.getInstance().getVersionName();
            String pn = SessionWrapper.gameInfo.get("PacketName");

            productInfo.put("pid", uid);
            productInfo.put("pn", pn);
            productInfo.put("ticket", ticket);
            productInfo.put("boxid",boxid);
            productInfo.put("version", version);
            productInfo.put("imei", imei);

        } catch (Exception e) {
            e.printStackTrace();
            return null;
            //此地方容易出错，当hashtable键值对冲入空对象时汇会报空指针异常，建议以后插件数据结构改成hashMap存取，不过工程量较大
        }
        return productInfo;
    }

    public static void payResult(int ret, String msg) {
		IAPWrapper.onPayResult(mbaidu, ret, msg);
		LogD("mbaidu result : " + ret + " msg : " + msg);
	}
	
	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;
	}

	@Override
	public String getSDKVersion() {
		return "1.3.0";
	}

	@Override
	public String getPluginVersion() {
		return "1.0.0";
	}

	@Override
	public void setRunEnv(int env) {
		IAPWrapper.setRunEnv(env);
	}
	
}
