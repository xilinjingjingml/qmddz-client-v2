package org.cocos2dx.plugin;

import java.util.Hashtable;
import com.netease.nimlib.sdk.RequestCallback;
import com.netease.nimlib.sdk.StatusBarNotificationConfig;
import com.qiyukf.unicorn.api.ConsultSource;
import com.qiyukf.unicorn.api.Unicorn;
import com.qiyukf.unicorn.api.YSFOptions;
import com.qiyukf.unicorn.api.YSFUserInfo;
import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.util.Log;
import org.cocos2dx.config.MsgStringConfig;

public class ExtendQIYUKF implements InterfaceExtend, ModuleApplication {

	private static final String LOG_TAG = "ExtendQIYUKF";
	private static Activity mContext = null;
	private static boolean bDebug = false;
	public static boolean isAppForeground = true;
	private static String title = "";
	private static String remarks = "";

	protected static void LogE(String msg, Exception e) {
		Log.e(LOG_TAG, msg, e);
		e.printStackTrace();
	}

	protected static void LogD(String msg) {
		if (bDebug) {
			Log.d(LOG_TAG, msg);
		}
	}

	public ExtendQIYUKF()
	{
		super();
	}

	public ExtendQIYUKF(Context context) {
		mContext = (Activity) context;
	}
	
	public void jumpToExtend(int tag)
	{
		jumpToExtend(tag, null);
	}

	public void jumpToExtend(int tag, final Hashtable<String, String> extendInfo) {
		switch(tag)
		{
		case 3://七鱼客服入口
			if (extendInfo == null){
				title = "在线客服欢迎您的光临！";
				remarks = PlatformWP.getMetaName("ChannelName");
			}else{
				String titlestr = extendInfo.get("title");
				remarks = extendInfo.get("remarks");//备注，默认传pn
				if (titlestr != null && !"".equalsIgnoreCase(titlestr)){
					title = titlestr;
				}else{
					title = "在线客服欢迎您的光临！";
				}
				if (remarks == null || "".equalsIgnoreCase(remarks)){
					remarks = PlatformWP.getMetaName("ChannelName");
				}
			}
			if (SessionWrapper.sessionInfo != null){
				String uid = SessionWrapper.sessionInfo.get("pid");
				YSFUserInfo userInfo = new YSFUserInfo();
				userInfo.userId = uid;
				userInfo.data = "[{\"key\":\"real_name\", \"value\":uid}]";
				Unicorn.setUserInfo(userInfo, new RequestCallback<Void>() {

					@Override
					public void onSuccess(Void aVoid) {
						/**
						 * 设置访客来源，标识访客是从哪个页面发起咨询的，
						 * 用于客服了解用户是从什么页面进入三个参数分别为
						 * 来源页面的url，来源页面标题，来源页面额外信息（可自由定义）。
						 * 设置来源后，在客服会话界面的"用户资料"栏的页面项，可以看到这里设置的值。
						 */
						ConsultSource source = new ConsultSource(null, null, remarks);
						/**
						 * 请注意： 调用该接口前，应先检查Unicorn.isServiceAvailable()，
						 * 如果返回为false，该接口不会有任何动作
						 *
						 * @param context 上下文
						 * @param title   聊天窗口的标题
						 * @param source  咨询的发起来源，包括发起咨询的url，title，描述信息等
						 */
						Unicorn.openServiceActivity(mContext, title, source);
					}

					@Override
					public void onFailed(int code) {
						LogD("onFailed code = %d"+code);
						PlatformWP.platformResult(PlatformWrapper.GET_KEFU_FAIL, MsgStringConfig.msgKeFuFail, "");
					}

					@Override
					public void onException(Throwable exception) {
						LogD("onException exception = %s"+exception);
						PlatformWP.platformResult(PlatformWrapper.GET_KEFU_FAIL, MsgStringConfig.msgKeFuFail, "");
					}
				});
			} else {
				/**
				 * 设置访客来源，标识访客是从哪个页面发起咨询的，
				 * 用于客服了解用户是从什么页面进入三个参数分别为
				 * 来源页面的url，来源页面标题，来源页面额外信息（可自由定义）。
				 * 设置来源后，在客服会话界面的"用户资料"栏的页面项，可以看到这里设置的值。
				 */
				ConsultSource source = new ConsultSource(null, null, remarks);
				/**
				 * 请注意： 调用该接口前，应先检查Unicorn.isServiceAvailable()，
				 * 如果返回为false，该接口不会有任何动作
				 *
				 * @param context 上下文
				 * @param title   聊天窗口的标题
				 * @param source  咨询的发起来源，包括发起咨询的url，title，描述信息等
				 */
				Unicorn.openServiceActivity(mContext, title, source);
			}
			break;
		default:
			break;
		}
	}
	
	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;
	}

	@Override
	public String getSDKVersion() {
		return "5.13.0";
	}

	@Override
	public String getPluginVersion() {
		return "5.13.0";
	}

    // 如果返回值为null，则全部使用默认参数。
    private YSFOptions options() {
        YSFOptions options = new YSFOptions();
        options.statusBarNotificationConfig = new StatusBarNotificationConfig();
        return options;
    }

	@Override
	public void onCreate(Application application) {
		boolean isinit = Unicorn.init(application.getApplicationContext(), "35bf08235e3c168b979e0e661ace0bf1", options(), new PicassoImageLoader(application.getApplicationContext()));
	}
}
