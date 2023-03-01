package org.cocos2dx.plugin;

import org.cocos2dx.config.URLConfig;

public class PlatformWrapper {
	
	public static final int INIT_HEADFACE_SUCCESS 	  	 = 0;
	public static final int INIT_HEADFACE_FAIL 	 		 = 1;
	public static final int UPLOAD_HEADFACE_SUCCESS      = 2;
	public static final int UPLOAD_HEADFACE_FAIL 	     = 3;
	
	public static final int PLAYSOUND_START				 = 4;
	public static final int PLAYSOUND_PAUSE				 = 5;
	public static final int PLAYSOUND_RESUME			 = 6;
	public static final int PLAYSOUND_STOP				 = 7;
	public static final int PLAYSOUND_OVER				 = 8;
	public static final int PLAYSOUND_ERROR				 = 9;
	
	public static final int RECORDVOICE_START			 = 10;
	public static final int RECORDVOICE_CANCEL			 = 11;
	public static final int RECORDVOICE_OVER			 = 12;
	public static final int RECORDVOICE_UPLOAD_START     = 13;
	public static final int RECORDVOICE_UPLOAD_OVER   	 = 14;
	public static final int RECORDVOICE_UPLOAD_FAIL		 = 15;
	public static final int RECORDVOICE_FAIL			 = 16;
	public static final int SAVEIMG_SUCCESS				 = 17;//保存到相册成功
	public static final int SAVEIMG_FAIL			 	 = 18;//保存到相册失败
	public static final int LOCATION_SUCCESS			 = 19;//定位成功
	public static final int LOCATION_FAIL				 = 20;//定位失败
	public static final int GET_CLIPBOARD_SUCCESS		 = 21;//获取剪切板内容成功
	public static final int GET_USERUID_SUCCESS			 = 22;//获取私人房用户座椅号 
	public static final int LOGINWAWAJIROOM_SUCCESS		 = 23;//进入娃娃机房间成功
	public static final int WAWAJIROOM_ONPLAY_SUCCESS	 = 24;//娃娃机拉流成功

	public static final int GET_CONTACTS_SUCCESS		 = 25;//获取通讯录内容成功
	public static final int GET_CONTACTS_FAIL			 = 26;//获取通讯录内容失败
	
	public static final int GET_KEFU_FAIL				 = 27;//当前客服服务不可用
	
	public static final int UPLOAD_EXTRAPARAM_SUCCESS	 = 28;//上传图片成功
	public static final int UPLOAD_EXTRAPARAM_FAIL	 	 = 29;//上传图片失败
	public static final int GET_SOCIALURLPARAMS		 	 = 30;//获取url跳转app透传的参数
	public static final int GET_OPEN_URL_FAILED		 	 = 31;//打开url失败
	
	public static final int GET_OPENINSTALL_PARAMS		 = 50;//获取openinstall透传的参数
	public static final int SET_ANTIADDICTION		 	 = 51;//弹出防沉迷窗口（百度渠道）
	/**
	 * 处理返回结果
	 * @param obj
	 * @param ret
	 * @param msg
	 */
	public static void onPlatformResult(InterfacePlatform obj, int ret, String msg, String state) {
		final int curRet = ret;
		final String curMsg = msg;
		final String curState = state;
		final InterfacePlatform curObj = obj;
		PluginWrapper.runOnGLThread(new Runnable() {
			@Override
			public void run() {
				String name = curObj.getClass().getName();
				name = name.replace('.', '/');
				nativeOnPlatformResult(name, curRet, curMsg, curState);
			}
		});
		
	}
	
	private static native void nativeOnPlatformResult(String className, int ret, String msg, String state);

	/**
	 * 处理返回结果
	 * @param obj
	 * @param ret
	 * @param msg
	 */
	public static void PlatformInvoke(InterfacePlatform obj, String jsonstr) {
		final String invokejson = jsonstr;
		final InterfacePlatform curObj = obj;
		PluginWrapper.runOnGLThread(new Runnable() {
			@Override
			public void run() {
				String name = curObj.getClass().getName();
				name = name.replace('.', '/');
				nativePlatformInvoke(name, invokejson);
			}
		});
	}
	private static native void nativePlatformInvoke(String className, String invokejson);

	/**
	 * 设置头像处理环境（正式->O、测试->T、镜像->M）
	 * 
	 * @param env
	 */
	public static void setRunEnv(int env)
	{
		PluginWrapper.nCurrentRunEnv = env;
	}
	
	/**
	 * 获取服务器环境地址前缀
	 * 域名在URLConfig.java文件中进行配置
	 * 
	 * @return serverURLPre
	 */
	public static String getServerURLPre()
	{
		String serverURLPre = URLConfig.oModifyUserInfoUrl;

		switch (PluginWrapper.nCurrentRunEnv)
		{
			case PluginWrapper.ENV_OFFICIAL:
			{
				serverURLPre = URLConfig.oModifyUserInfoUrl;
				break;
			}
			case PluginWrapper.ENV_TEST:
			{
				serverURLPre = URLConfig.tModifyUserInfoUrl;
				break;
			}
			case PluginWrapper.ENV_MIRROR:
			{
				serverURLPre = URLConfig.mModifyUserInfoUrl;
				break;
			}
			case PluginWrapper.ENV_DUFU:
			{
				serverURLPre = URLConfig.dModifyUserInfoUrl;
				break;
			}
			default:
			{
				serverURLPre = URLConfig.oModifyUserInfoUrl;
				break;
			}
		}

		return serverURLPre;
	}

}
