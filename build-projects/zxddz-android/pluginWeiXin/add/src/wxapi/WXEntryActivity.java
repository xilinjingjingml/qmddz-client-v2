package com.izhangxin.ddz.android.wxapi;

import org.cocos2dx.config.MsgStringConfig;
import org.cocos2dx.plugin.PlatformWP;
import org.cocos2dx.plugin.SessionWeiXin;
import org.cocos2dx.plugin.SessionWrapper;
import org.cocos2dx.plugin.SocialWeiXin;
import org.cocos2dx.plugin.ExtendWeiXin;
import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

public class WXEntryActivity extends Activity implements IWXAPIEventHandler{
	
	private static final String TAG = "WXEntryActivity";
	// IWXAPI
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
		//发送到微信请求的响应结果回调
		/**
		 * 根据需求，选择是否注释下面的回调
		 * */
		Log.d(TAG, "onloginFinish, errCode = " + resp.errCode);
		finish();
		if ((SocialWeiXin.weixinsocial).equalsIgnoreCase(resp.transaction)){
			//分享回调
			SocialWeiXin.ShareResult(resp.errCode);
		}else if ("ExtendWeiXin".equalsIgnoreCase(resp.transaction)){
			//授权回调
			if (resp.errCode == BaseResp.ErrCode.ERR_OK){
				SendAuth.Resp sresp = new SendAuth.Resp();
				sresp = (SendAuth.Resp)resp;
				ExtendWeiXin.code = sresp.code;
				ExtendWeiXin.extendweixin();
			}else if (resp.errCode == BaseResp.ErrCode.ERR_USER_CANCEL){
				
			}else {
				
			}
		}else {
			//登录回调
			if (resp.errCode == BaseResp.ErrCode.ERR_OK){
				Log.d(TAG, "登录成功");
				SendAuth.Resp sresp = new SendAuth.Resp();
				sresp = (SendAuth.Resp)resp;
				SessionWeiXin.code = sresp.code;
				SessionWeiXin.SetLoginSuccess(true);
				SessionWeiXin.loginweixin();
			}else if (resp.errCode == BaseResp.ErrCode.ERR_USER_CANCEL){
				Log.d(TAG, "登录取消");
				SessionWeiXin.sessionResult(SessionWrapper.SESSIONRESULT_CANCEL, MsgStringConfig.msgLoginCancel);
			}else {
				Log.d(TAG, "登录失败");
				SessionWeiXin.sessionResult(SessionWrapper.SESSIONRESULT_FAIL, MsgStringConfig.msgLoginFail);
			}
		}
	}
	
}