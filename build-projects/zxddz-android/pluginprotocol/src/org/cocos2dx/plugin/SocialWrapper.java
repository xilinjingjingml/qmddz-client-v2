/****************************************************************************
Copyright (c) 2012-2013 cocos2d-x.org

http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package org.cocos2dx.plugin;

import java.util.Hashtable;
import org.cocos2dx.config.MsgStringConfig;
import org.cocos2dx.config.URLConfig;
import org.cocos2dx.utils.HttpsClientUtil;
import org.cocos2dx.utils.ParamerParseUtil;
import org.cocos2dx.utils.ResponseCallback;
import org.json.JSONException;
import org.json.JSONObject;

public class SocialWrapper {
	public static final int SHARERESULT_SUCCESS 			= 0;
	public static final int SHARERESULT_FAIL    			= 1;
	public static final int SHARERESULT_CANCEL  			= 2;
	public static final int SHARERESULT_TIMEOUT 			= 3;
	public static final int SHARERESULT_DEFAULT_CALLBACK 	= 4;//默认回调，插件没有回调
	
	private static String shareName; // 调用插件的名称，c++调用xx/xx/xx/xx形式
	private static String shareRequestUrl;
	public static String shareResultJson = "";//返回给客户端的json以字符串的形式存储
//	public static Hashtable<String, String> shareInfo = null;//web分享结果回调的信息
	
	/**
	 * 处理分享结果回调
	 * @param obj,插件的对象
	 * @param ret
	 * @param msg
	 */
	public static void onShareResult(InterfaceSocial obj, int ret, String msg)
	{
		String name = obj.getClass().getName();
		name = name.replace(".", "/");
		onShareResult(name,ret, msg);
	}
	/**
	 * 处理分享结果回调
	 * @param name，插件的名称
	 * @param ret
	 * @param msg
	 */
	private static void onShareResult(String name, int ret, String msg) {
		final String curName = name;
		final int curRet = ret;
		final String curMsg = msg;
		
		PluginWrapper.runOnGLThread(new Runnable() {
			@Override
			public void run() {
				nativeOnShareResult(curName, curRet, curMsg, shareResultJson);
			}
		});
	}
	
	/**
	 * 开始把分享结果通知给服务器
	 * shareReqUrl 地址
	 * shareReqParams 分享结果信息
	 * */
	public static void StartOnShareResultToWebNew(InterfaceSocial obj, String shareReqUrl, Hashtable<String, String> shareReqParams){

		setShareName(obj);
		shareRequestUrl = shareReqUrl;
		shareRequestUrl = shareRequestUrl.replaceAll("http://", "https://");
		HttpsClientUtil.post(shareRequestUrl, shareReqParams, shareJsonHandler);
    }
	/**
	 * 开始把分享结果通知给服务器
	 * shareReqUrl 地址
	 * shareReqParams 分享结果信息
	 * */
	public static void StartOnShareResultToWeb(InterfaceSocial obj, String shareReqUrl, Hashtable<String, String> shareReqParams){

		setShareName(obj);
		setShareRequestUrl(shareReqUrl);
		shareRequestUrl = shareRequestUrl.replaceAll("http://", "https://");
		HttpsClientUtil.post(shareRequestUrl, shareReqParams, shareJsonHandler);
    }
	final static ResponseCallback shareJsonHandler = new ResponseCallback()
	{
		@Override
		public void onFailure()
		{
			onShareResult(shareName, SHARERESULT_FAIL, MsgStringConfig.msgShareFail);
		}
		
		/* 接收数成功后处理 */
		@Override
		public void onSuccess(JSONObject jsonObject)
		{
			if (jsonObject == null)
			{
				onShareResult(shareName, SHARERESULT_FAIL, MsgStringConfig.msgShareFail);
				return;
			}
			
			shareResultJson = ParamerParseUtil.parseJsonToString(jsonObject);
			if (shareResultJson.length() == 0)
			{
				onShareResult(shareName, SHARERESULT_FAIL, MsgStringConfig.msgShareFail);
				return;
			}

//			shareInfo = new Hashtable<String, String>();
			try
			{
				String ret = jsonObject.getString("ret");
				if (ret.equalsIgnoreCase("0"))
				{
					onShareResult(shareName, SHARERESULT_SUCCESS, MsgStringConfig.msgShareSuccess);
				} 
				else
				{
					onShareResult(shareName, SHARERESULT_FAIL, MsgStringConfig.msgShareFail);
				}
			} 
			catch (JSONException e)
			{
				onShareResult(shareName, SHARERESULT_FAIL, MsgStringConfig.msgShareFail);
			}
		}
	};

	/**
	 * 设置分享插件名称
	 */
	private static void setShareName(InterfaceSocial obj)
	{
		shareName = obj.getClass().getName().replace('.', '/');
	}
	
	/**
	 * 设置分享url地址
	 * 基础分享域名+插件路径
	 */
	private static void setShareRequestUrl(String postfix) 
	{
		shareRequestUrl = getServerURLPre() + postfix;
	}
	
	/**
	 * 获取分享服务器环境地址前缀
	 * 域名在URLConfig.java文件中进行配置
	 * @return serverURLPre
	 */
	private static String getServerURLPre()
	{
		String serverURLPre = URLConfig.oShareHost;

		switch (PluginWrapper.nCurrentRunEnv)
		{
			case PluginWrapper.ENV_OFFICIAL:
			{
				serverURLPre = URLConfig.oShareHost;
				break;
			}
			case PluginWrapper.ENV_TEST:
			{
				serverURLPre = URLConfig.tShareHost;
				break;
			}
			case PluginWrapper.ENV_MIRROR:
			{
				serverURLPre = URLConfig.mShareHost;
				break;
			}
			case PluginWrapper.ENV_DUFU:
			{
				serverURLPre = URLConfig.dShareHost;
				break;
			}
			default:
			{
				serverURLPre = URLConfig.oShareHost;
				break;
			}
		}

		return serverURLPre;
	}
	
	private static native void nativeOnShareResult(String className, int ret, String msg, String shareResultJson);
}
