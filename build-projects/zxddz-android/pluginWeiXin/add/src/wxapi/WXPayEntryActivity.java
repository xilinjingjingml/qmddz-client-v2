package com.izhangxin.ddz.android.wxapi;

import org.cocos2dx.config.MsgStringConfig;
import org.cocos2dx.plugin.IAPWeiXin;
import org.cocos2dx.plugin.IAPWrapper;
import org.cocos2dx.plugin.PlatformWP;
import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

public class WXPayEntryActivity extends Activity implements IWXAPIEventHandler{
	
	private static final String TAG = "WXPayEntryActivity";
	
    private IWXAPI api;
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        String appid = PlatformWP.getMetaName("wxapiAppID");
    	api = WXAPIFactory.createWXAPI(this, appid);
    	
        api.handleIntent(getIntent(), this);
    }

	@Override
	protected void onNewIntent(Intent intent) {
		super.onNewIntent(intent);
		setIntent(intent);
        api.handleIntent(intent, this);
        
	}

	@Override
	public void onReq(BaseReq req) {
		
	}

	@Override
	public void onResp(BaseResp resp) {
		
		Log.d(TAG, "onPayFinish, errCode = " + resp.errCode);
		finish();
		if (resp.errCode == BaseResp.ErrCode.ERR_OK){
			Log.d(TAG, "支付成功");
			IAPWeiXin.payResult(IAPWrapper.PAYRESULT_SUCCESS, MsgStringConfig.msgPaySuccess);
		}else if (resp.errCode == BaseResp.ErrCode.ERR_USER_CANCEL){
			Log.d(TAG, "支付取消");
			IAPWeiXin.payResult(IAPWrapper.PAYRESULT_CANCEL, MsgStringConfig.msgPayCancel);
		}else {
			Log.d(TAG, "支付失败");
			IAPWeiXin.payResult(IAPWrapper.PAYRESULT_FAIL, MsgStringConfig.msgPayFail);
		}
	}
}