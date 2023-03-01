package org.cocos2dx.plugin;

import java.lang.reflect.Method;
import java.util.Hashtable;
import java.util.Iterator;
import org.cocos2dx.config.MsgStringConfig;
import org.cocos2dx.utils.HttpsClientUtil;
import org.cocos2dx.utils.ParamerParseUtil;
import org.cocos2dx.utils.ResponseCallback;
import org.json.JSONException;
import org.json.JSONObject;
import android.content.Context;

public class ExtendWrapper { 
	public static final int EXTEND_METHOD_TAG_enterUserCenter 			= 1;//个人中心入口
	public static final int EXTEND_METHOD_TAG_showSoical     			= 2;//社区论坛入口
	public static final int EXTEND_METHOD_TAG_feedBack      			= 3;//用户反馈入口
	public static final int EXTEND_METHOD_TAG_showBBS 					= 4;//论坛入口
	public static final int EXTEND_METHOD_TAG_createToolBar 			= 5;//工具条入口
	public static final int EXTEND_METHOD_TAG_onResume 					= 6;//暂停页
	public static final int EXTEND_METHOD_TAG_onExit 					= 7;//退出页
	
	public static final int EXTEND_METHOD_TAG_boxJiangli				= 8;//宝箱奖励
	public static final int EXTENDRESULT_SUCCESS						= 10;
	public static final int EXTENDRESULT_CANCEL							= 11;
	public static final int EXTENDRESULT_FAIL			    			= 12;
	
	private static String extendName; // 调用插件的名称，c++调用xx/xx/xx/xx形式
	public static String extendJson; // 将服务器返回的json以字符串的形式存储
	public static Hashtable<String, String> extendInfo = null;//web登陆结果回调的信息

	public static void jump2ExtendMethod(InterfaceExtend obj,int tag){
		switch(tag)
		{
		case EXTEND_METHOD_TAG_enterUserCenter:
		{
			useMethodByExtObjectName(obj,"enterUserCenter");
			break;
		}
		case EXTEND_METHOD_TAG_showSoical:
		{
			useMethodByExtObjectName(obj,"showSoical");
			break;
		}
		case EXTEND_METHOD_TAG_feedBack:
		{
			useMethodByExtObjectName(obj,"feedBack");
			break;
		}
		case EXTEND_METHOD_TAG_showBBS:
		{
			useMethodByExtObjectName(obj,"showBBS");
			break;
		}
		case EXTEND_METHOD_TAG_createToolBar:
		{
			useMethodByExtObjectName(obj,"createToolBar");
			break;
		}
		case EXTEND_METHOD_TAG_onResume:
		{
			useMethodByExtObjectName(obj,"onResume");
			break;
		}
		case EXTEND_METHOD_TAG_onExit:
		{
			useMethodByExtObjectName(obj,"onExit");
			break;
		}

		default :
			useMethodByExtObjectName(obj,tag);
			break;
		}
	}
	
	/**
	 * 调用拓展对象tag对应的方法，解决游戏拓展方法不够用以及盲目增加方法名的缺陷
	 * 同时java上层没有用接口实现（目前拓展插件1-n不等不好统一接口）
	 * param obj
	 * param methodName
	 */
	private static void useMethodByExtObjectName(InterfaceExtend obj,String methodName) 
	{
		try 
		{
			String className = obj.getClass().getName();
			Class<?> iapClass = Class.forName(className);
			Object iapObj = null;
			iapObj = iapClass.getDeclaredConstructor(Context.class).newInstance(PluginWrapper.getContext());
			Method iapPay = iapClass.getMethod(methodName);
			iapPay.invoke(iapObj);//调用methodName()方法
		}
		catch (Exception e) 
		{
			e.printStackTrace();
		}
	}
	/**
	 * 增加额外的方法
	 * 同时java上层没有用接口实现（目前拓展插件1-n不等不好统一接口）
	 * param obj
	 * param methodName
	 */
	private static void useMethodByExtObjectName(InterfaceExtend obj,int tag) 
	{
		String metName = "extendMethod"+tag;
		try 
		{
			String className = obj.getClass().getName();
			Class<?> iapClass = Class.forName(className);
			Object iapObj = null;
			iapObj = iapClass.getDeclaredConstructor(Context.class).newInstance(PluginWrapper.getContext());
			Method iapPay = iapClass.getMethod(metName);
			iapPay.invoke(iapObj);//调用extendMethodx()方法
		}
		catch (Exception e) 
		{
			e.printStackTrace();
		}
	}
	
	public static void startOnExtend(InterfaceExtend obj, String postfix, Hashtable<String, String> extendReqParams)
	{
		setExtendName(obj);

		if (extendReqParams == null){//登录时传入的参数有误，返回失败
			onExtendResult(extendName, EXTENDRESULT_FAIL, MsgStringConfig.msgLoginParamsError);
			return;
		}

		onExtend(postfix, extendReqParams);
	}
	
	/**
	 * 异步处理拓展服务器返回的结果
	 * 
	 * param loginReqUrl
	 * param loginReqParams
	 * @return
	 */
	private static void onExtend(String extendReqUrl, Hashtable<String, String> extendReqParams)
	{
		extendReqUrl = extendReqUrl.replaceAll("http://", "https://");
		ParamerParseUtil.printfUrl(extendReqUrl, extendReqParams);
		HttpsClientUtil.post(extendReqUrl, extendReqParams, extendJsonHandler);
	}
	
	/**
	 * 拓展结果处理回调
	 * 
	 * 在处理请求时重写JsonHttpResponseHandler中的onFailure方法和onSuccess方法
	 * 在游戏完善过程中可以重写onStart和onFinishe方法，进行UI更新通知
	 */
	final static ResponseCallback extendJsonHandler = new ResponseCallback()
	{

		@Override
		public void onFailure() {
			onExtendResult(extendName, EXTENDRESULT_FAIL, "");
		}
		
		/* 接收数成功后处理 */
		@Override
		public void onSuccess(JSONObject jsonObject) {
			if (jsonObject == null)
			{
				onExtendResult(extendName, EXTENDRESULT_FAIL, "");
				return;
			}
			
			extendJson = ParamerParseUtil.parseJsonToString(jsonObject);
			if (extendJson.length() == 0)
			{
				onExtendResult(extendName, EXTENDRESULT_FAIL, "");
				return;
			}

			extendInfo = new Hashtable<String, String>();
			try
			{
				String ret = jsonObject.getString("ret");
				String msg = jsonObject.getString("msg");
				if (ret.equalsIgnoreCase("0"))
				{
					Iterator<?> iterator = jsonObject.keys();
					while (iterator.hasNext())
					{
						String key = (String) iterator.next();
						extendInfo.put(key, jsonObject.getString(key));
					}
					onExtendResult(extendName, EXTENDRESULT_SUCCESS, msg);
				}
				else
				{
					onExtendResult(extendName, EXTENDRESULT_FAIL, msg);
				}
			} catch (JSONException e) {
				onExtendResult(extendName, EXTENDRESULT_FAIL, "");
			}
		}
	};

	/**
	 * 设置拓展插件名称
	 */
	private static void setExtendName(InterfaceExtend obj)
	{
		extendName = obj.getClass().getName().replace('.', '/');
	}
	
	/**
	 * 处理拓展结果回调
	 * 
	 * param obj,插件的对象
	 * param ret
	 * param msg
	 */
	public static void onExtendResult(InterfaceExtend obj, int ret, String msg)
	{
		String name = obj.getClass().getName();
		name = name.replace(".", "/");
		onExtendResult(name,ret, msg);
	}
	
	/**
	 * 处理拓展结果回调
	 * 
	 * param name，插件的名称
	 * param ret
	 * param msg
	 */
	public static void onExtendResult(String name, int ret, String msg)
	{
		final String curName = name;
		final int curRet = ret;
		final String curMsg = msg;
		
		PluginWrapper.runOnGLThread(new Runnable()
		{
			@Override
			public void run()
			{
				nativeOnExtendResult(curName, curRet, curMsg, extendJson);
			}
		});
	}
	
	/**
	 * 处理拓展结果，将结果通过jni回调给游戏逻辑
	 * 
	 * param className
	 * param ret
	 * param msg
	 * param sessionMap
	 */
	private static native void nativeOnExtendResult(String className, int ret, String msg, String extendJson);
    
}
