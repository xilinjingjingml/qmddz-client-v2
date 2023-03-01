package org.cocos2dx.plugin;

import java.util.Hashtable;
import java.util.List;
import org.cocos2dx.config.MsgStringConfig;
import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;
import com.baidu.gamesdk.BDGameSDK;
import com.baidu.gamesdk.BDGameSDKSetting;
import com.baidu.gamesdk.BDGameSDKSetting.Domain;
import com.baidu.gamesdk.BDGameSDKSetting.Orientation;
import com.baidu.gamesdk.BDGameSDKSetting.SDKMode;
import com.baidu.gamesdk.IResponse;
import com.baidu.gamesdk.ResultCode;
import com.baidu.platformsdk.utils.PermissionUtils;
import static com.baidu.platformsdk.utils.PermissionUtils.requestRuntimePermissions;

public class SessionBaiDu implements InterfaceSession, ModuleApplication, ModuleActivity {
	private static String[] PERMISSIONS_STORAGE = {
			"android.permission.READ_EXTERNAL_STORAGE",
			"android.permission.WRITE_EXTERNAL_STORAGE",
			"android.permission.READ_PHONE_STATE"};
	private static final String LOG_TAG = "SessionBaiDu";
	private static Activity mContext = null;
	private static boolean bDebug = false;
	static SessionBaiDu mbaidu = null;
	private static Hashtable<String, String> configInfo = null;
	private static Hashtable<String, String> loginInfo = null;
	public static String appid = "";
	private static String appkey = "";
	public static boolean islandscape = true;//islandscape是否横屏
	public static String userid = "";
	private static String access_token = "";
	private static boolean initid = false;//false:初始化失败,true:初始化成功
	private static boolean isbdsdkinit = false;
	private static int add_bdpermission = 0;//拒绝百度权限次数，3次后不再
	private static boolean isLoginInInited = false;
	private static String loginhost = "";

	public SessionBaiDu()
	{
		super();
	}

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

	public SessionBaiDu(Context context)
	{
		mContext = (Activity) context;
		mbaidu = this;
	}

	/**
	 * 配置游戏相关信息，包括pn等信息
	 */
	@Override
	public void configGameInfo(Hashtable<String, String> configGmeInfo) 
	{
		SessionWrapper.gameInfo = configGmeInfo;
	}

	/**
	 * 配置应用程序开发信息,应用程序只需加载一次
	 * 
	 * @param cpInfo
	 */
	@Override
	public void configDeveloperInfo(Hashtable<String, String> cpInfo) 
	{
		LogD("initDeveloperInfo invoked " + cpInfo.toString());
		configInfo = new Hashtable<String, String>(cpInfo);
	}
	
	@Override
	public void setDebugMode(boolean debug) 
	{
		bDebug = debug;
	}
	
	public void setRunEnv(int env)
	{
		SessionWrapper.setRunEnv(env);
	}
	
	public static void sessionResult(int ret, String msg) 
	{
		SessionWrapper.onSessionResult(mbaidu, ret, msg);
		LogD("mbaidu result : " + ret + " msg : " + msg);
	}

	/**
	 * 用户录用，先通过sdk登录，然后登录服务器
	 */
	public void userItemsLogin(Hashtable<String,String> loginItemsInfo)
	{
		LogD("start login sdk ...");
		if (loginInfo != null){
			if (!loginInfo.isEmpty()){
				loginInfo.clear();
			}
		}
		loginInfo = loginItemsInfo;
		loginhost = loginInfo.get("LoginHost");
		userLogin();
	}
	public void userLogin()
	{
		LogD("start login sdk ...");
		if(!PlatformWP.networkReachable(mContext))
		{
			sessionResult(SessionWrapper.SESSIONRESULT_FAIL, MsgStringConfig.msgNetworkError);
			return;
		}
		if (initid == false) {
			Log.d(LOG_TAG, "userLogin 初始化失败");
			isLoginInInited = true;
			initBDGameSDK(mContext);
			return;
		}
        PluginWrapper.runOnMainThread(new Runnable()
		{
			@Override
			public void run()
			{
				bdlogin();
			}
		});
	}
	private void bdlogin()
	{
		BDGameSDK.login(new IResponse<Void>() {
			@Override
			public void onResponse(int resultCode, String resultDesc, Void extraData) {
				Log.d("login", "this resultCode is " + resultCode);
				switch(resultCode){
					case ResultCode.LOGIN_SUCCESS:
						//登录成功
                        //实名认证状态查询
                        queryLoginUserAuthenticateState();
						break;
					case ResultCode.LOGIN_CANCEL:
						//取消登录
						SessionBaiDu.sessionResult(SessionWrapper.SESSIONRESULT_CANCEL,MsgStringConfig.msgLoginCancel);
						break;
					case ResultCode.LOGIN_FAIL:
					default:
						//登录失败
						SessionBaiDu.sessionResult(SessionWrapper.SESSIONRESULT_FAIL,MsgStringConfig.msgLoginFail);
						break;
				}
			}
		});
	}

	/**
	 * 设置切换账号事件监听（个人中心界面切换账号）
	 * */
	private void setSuspendWindowChangeAccountListener() {
		BDGameSDK.setSuspendWindowChangeAccountListener(mContext,
				new IResponse<Void>() {
					@Override
					public void onResponse(int resultCode, String resultDesc, Void extraData) {
						switch (resultCode) {
							case ResultCode.LOGIN_SUCCESS:
								//登录成功，不管之前是什么登录状态，游戏内部都要切换成新的用户
								// 切换账号成功后必须更新uid给调用支付api使用
								userid = BDGameSDK.getLoginUid();
								access_token = BDGameSDK.getLoginAccessToken();
								//设置切换账号事件监听（个人中心界面切换账号）
								setSuspendWindowChangeAccountListener();
								//设置会话失效监听
								setSessionInvalidListener();
								//设置防沉迷
								setAntiAddictionListener();
								BDGameSDK.showFloatView(mContext);
								if ("".equals(loginhost) || loginhost == null){
									SessionWrapper.startOnLogin(mbaidu, "new/gateway/baiduyd/login", getLoginParams());
								}else{
									SessionWrapper.startOnLoginNew(mbaidu, loginhost+"new/gateway/baiduyd/login", getLoginParams());
								}
								break;
							case ResultCode.LOGIN_FAIL:
								// 登录失败，游戏内部之前如果是已经登录的，要清除自己记录的登录状态，设置成未登录。如果之前未登录，不用处理。
                                SessionWrapper.clearSessionInfo();
                                SessionBaiDu.sessionResult(SessionWrapper.SESSIONRESULT_FAIL,MsgStringConfig.msgLoginFail);
								break;
							case ResultCode.LOGIN_CANCEL:
								//取消，操作前后的登录状态没变化
								break;
							default:
								// 此时当登录失败处理，参照ResultCode.LOGIN_FAIL（正常情况下不会到这个步骤，除非SDK内部异常）
								break;
						}
					}
				});
	}
	/**
	 * 监听session失效时重新登录
	 */
	private void setSessionInvalidListener() {
		BDGameSDK.setSessionInvalidListener(new IResponse<Void>() {

			@Override
			public void onResponse(int resultCode, String resultDesc,
								   Void extraData) {
				if (resultCode == ResultCode.SESSION_INVALID) {
					// 会话失效，开发者需要重新登录或者重启游戏
					bdlogin();
				}
			}

		});
	}
	/**
	 * 设置防沉迷系统回调，如果用户在线时长累计超过规定值，会触发该回调
	 * */
	private void setAntiAddictionListener() {
		BDGameSDK.setAntiAddictionListener(new IResponse<Long>() {
			@Override
			public void onResponse(int resultCode, String resultDesc, final Long extraData) {
				//Toast.makeText(getApplicationContext(), "您累计登录时长：" + extraData.toString(), Toast.LENGTH_LONG).show();
				Log.d(LOG_TAG, "您累计登录时长：" + extraData.toString());
				queryAntiAddiction();
				PlatformWrapper.onPlatformResult(PlatformWP.mPlatformwp, PlatformWrapper.SET_ANTIADDICTION, String.valueOf(extraData), "");
			}
		});
	}
	/**
	 * 查询防沉迷系统用户累计在线时长
	 * */
	private void queryAntiAddiction() {
		BDGameSDK.queryAntiAddiction(mContext, new IResponse<Long>() {
			@Override
			public void onResponse(int resultCode, String resultDesc, Long i) {
				//Toast.makeText(getApplicationContext(), "您累计登录时长：" + i, Toast.LENGTH_LONG).show();
				Log.d(LOG_TAG, "您累计登录时长：" + i);
			}
		});
	}
	/**
	 * 上报玩家游戏角色信息
	 * */
//	private void reportUserData() {
//		// 上报玩家游戏角色信息Json串，格式为：{
//		//    "nick":"昵称",
//		//    "role":"角色名",
//		//    "region":"（游戏）大区",
//		//    "server":"（游戏）服",
//		//    "level":"角色等级",
//		//    "power":"玩家战力值"
//		// }
//		JSONObject data = new JSONObject();
//		try {
//			data.put("nick", "齐天大圣");
//			data.put("role", "战士");
//			data.put("region", "中国");
//			data.put("server", "001");
//			data.put("level", 88);
//			data.put("power", 99999);
//			BDGameSDK.reportUserData(data.toString());
//		} catch (JSONException e) {
//			e.printStackTrace();
//		}
//	}
	/**
	 * 实名认证状态查询
	 * */
	public void queryLoginUserAuthenticateState()
	{
		BDGameSDK.queryLoginUserAuthenticateState(mContext, new IResponse<Integer>() {
			@Override
			public void onResponse(int resultCode, String resultDesc, Integer extraData) {
				Log.i("LoginUserAuth", "resultCode" + resultCode + "==" + extraData);
				Log.i("login", "login sucess");
				if (resultCode == 0) {
					userid = BDGameSDK.getLoginUid();
					access_token = BDGameSDK.getLoginAccessToken();
					//设置切换账号事件监听（个人中心界面切换账号）
					setSuspendWindowChangeAccountListener();
					//设置会话失效监听
					setSessionInvalidListener();
					//设置防沉迷
					setAntiAddictionListener();
					BDGameSDK.showFloatView(mContext);
					if ("".equals(loginhost) || loginhost == null){
						SessionWrapper.startOnLogin(mbaidu, "new/gateway/baiduyd/login", getLoginParams());
					}else{
						SessionWrapper.startOnLoginNew(mbaidu, loginhost+"new/gateway/baiduyd/login", getLoginParams());
					}
				} else {
					Log.i("Authenticate", "实名认证查询失败");
					SessionBaiDu.sessionResult(SessionWrapper.SESSIONRESULT_FAIL,MsgStringConfig.msgLoginFail);
				}
			}
		});
	}

	/**
	 * 用户登录注销，切换账户
	 */
	public void userLogout() 
	{
		if (BDGameSDK.isLogined()){
			userid = "";
			BDGameSDK.logout();
			sessionResult(SessionWrapper.SESSIONRESULT_SWITCH_ACCOUNT, MsgStringConfig.msgLogoutSuccess);
		}
	}

	@Override
	public String getSDKVersion() 
	{
		return "1.3.0";
	}

	@Override
	public String getPluginVersion() 
	{
		return "1.0.0";
	}
	/**
	 * 设置登录参数
	 * 在接入SDK时根据需要设置登录参数
	 * 
	 * @return loginParams
	 */
	@Override
	public Hashtable<String, String> getLoginRequestParams() {
		Hashtable<String, String> loginParams = new Hashtable<String, String>();
		
		return loginParams;
	}
	
	public static Hashtable<String, String> getLoginParams() {
		if (loginInfo == null){
			loginInfo = new Hashtable<String, String>();
		}
		try
		{
			loginInfo.put("AppID",     		appid);
			loginInfo.put("AccessToken", 	access_token);
			loginInfo.put("symbol", 		"1");//新版本
			loginInfo.put("pn", 			SessionWrapper.gameInfo.get("PacketName"));
			loginInfo.put("version", 		PlatformWP.getInstance().getVersionName());
			loginInfo.put("imei",    		PlatformWP.getInstance().getDeviceIMEI());
			loginInfo.put("name",    		PlatformWP.getInstance().getDeviceName());
		}
		catch(Exception e)
		{
			e.printStackTrace();
			LogE("params error !!!", e);
			loginInfo = null;
		}
		return loginInfo;
	}

	@Override
	public void onCreate(Application application) {
		ApplicationInfo info = null;
		try {
			info = application.getPackageManager().getApplicationInfo(
					application.getPackageName(),
					PackageManager.GET_META_DATA);
			if (info.metaData != null) {
				appid = String.valueOf(info.metaData.get("baidu_appid"));
				appid = appid.replaceAll("baidu_", "");
				appkey = String.valueOf(info.metaData.get("baidu_appkey"));
			}
		} catch (PackageManager.NameNotFoundException e) {
			e.printStackTrace();
		}
		com.baidu.gamesdk.BDGameSDK.initApplication(application);
	}

	@Override
	public void onCreate(final Activity activity) {
		Log.d(LOG_TAG, "onCreate");
		mContext = activity;
		if (Build.VERSION.SDK_INT >= 23) { // 判断当前系统是不是Android6.0
			// 请求三项权限，如果不申请权限SDK也能兼容运行，建议初始化前申请权限
			requestRuntimePermissions(activity, PERMISSIONS_STORAGE, bdpermissionlist);
		} else {
			initBDGameSDK(activity);
		}
	}
	private PermissionUtils.PermissionListener bdpermissionlist = new PermissionUtils.PermissionListener() {

		@Override
		public void granted() {
			// 权限申请通过
			initBDGameSDK(mContext);
		}

		@Override
		public void denied(List<String> list) {
			Log.d(LOG_TAG, "PermissionListener"+list);
			//PlatformWP.getInstance().openPush();
		}
	};
	private void initBDGameSDK(final Activity activity) { // 初始化游戏SDK
		if (isbdsdkinit) {
			return;
		}
		isbdsdkinit = true;
		Log.d(LOG_TAG, "initBDGameSDK");
		BDGameSDKSetting mBDGameSDKSetting = new BDGameSDKSetting();
		mBDGameSDKSetting.setAppID(Integer.parseInt(appid));//APPID设置
		mBDGameSDKSetting.setAppKey(appkey);//APPKEY设置
		mBDGameSDKSetting.setMode(SDKMode.ONLINE);// ONLINE:必须有网才能登录  WEAK_LINE:无网也能登录
		mBDGameSDKSetting.setEnableAds(false); // 广告开关
		mBDGameSDKSetting.setDomain(Domain.RELEASE);//设置为正式模式
		if (islandscape){
			mBDGameSDKSetting.setOrientation(Orientation.LANDSCAPE);//设置为横屏
		}else {
			mBDGameSDKSetting.setOrientation(Orientation.PORTRAIT);//设置为竖屏
		}

		BDGameSDK.init(activity, mBDGameSDKSetting, new IResponse<Void>(){

			@Override
			public void onResponse(int resultCode, String resultDesc,
								   Void extraData) {
				switch(resultCode){
					case ResultCode.INIT_SUCCESS:
						//初始化成功
						initid = true;
						//应用升级更新接口
						BDGameSDK.queryGameUpdateInfo(activity);
						if (isLoginInInited) {
							isLoginInInited = false;
							userLogin();
						}
						break;
					case ResultCode.INIT_FAIL:
					default:
						//初始化失败
						initid = false;
						isbdsdkinit = false;
						break;
				}
			}
		});
	}

	public static void OnPluginResume(){
		if (BDGameSDK.isLogined()) {
			BDGameSDK.showFloatView(mContext);
		}
		BDGameSDK.onResume(mContext);
	}
	public static void OnPluginPause(){
		if (BDGameSDK.isLogined()) {
			BDGameSDK.closeFloatView(mContext);
		}
		BDGameSDK.onPause(mContext);
	}
	public static void OnPluginDestroy(){
		//关闭悬浮窗
		if (BDGameSDK.isLogined()) {
			BDGameSDK.closeFloatView(mContext);
		}
	}

}
