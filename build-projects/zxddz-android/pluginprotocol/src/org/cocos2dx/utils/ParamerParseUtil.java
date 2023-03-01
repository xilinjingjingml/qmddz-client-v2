package org.cocos2dx.utils;

import java.util.Hashtable;
import java.util.Iterator;
import org.json.JSONObject;

/*
 * ParamerTransformUtil
 *
 * Version information V1.0
 *
 * Date 2014/02/18
 *
 * Copyright MicroBeam
 */
public class ParamerParseUtil
{
	private static boolean printFlag = false;
	
	//设置url是否打印
	public static void setPrintFlag(boolean isPrintf){
		printFlag= isPrintf;
	}
	
	/**
	 * 打印url
	 * 
	 * @param params
	 * @return RequestParams
	 */
	public static String printfUrl(String loginReqUrl,Hashtable<String, String> params)
	{
		String urlParams = "";

		if(printFlag){
			if ((params != null) && (params.size()!=0))
			{
				for (Iterator<String> it = params.keySet().iterator(); it.hasNext();)
				{
					String key = (String) it.next();
					String value = params.get(key);
					urlParams += "&"+key+"="+value;
				}
			}
			
			if(urlParams.length()>1){
				urlParams = loginReqUrl+"?"+urlParams.substring(1);
			}else{
				urlParams = loginReqUrl;
			}
			System.out.println("url::"+urlParams);
		}
		
		return urlParams;
	}
	
	/**
	 * 转换参数（HashTable to RequestParams）
	 * 
	 * @param params
	 * @return RequestParams
	 */
//	public static RequestParams parseTableToParams(
//			Hashtable<String, String> params)
//	{
//		RequestParams requestParams = new RequestParams();
//
//		if ((params != null) && (params.size()!=0))
//		{
//			for (Iterator<String> it = params.keySet().iterator(); it.hasNext();)
//			{
//				String key = (String) it.next();
//				String value = params.get(key);
//				requestParams.put(key, value);
//			}
//		}
//
//		return requestParams;
//	}
	
	/**
	 * 将jsonObject装换成string
	 * 
	 * @param jsonObject
	 * @return
	 */
	public static String parseJsonToString(JSONObject jsonObject)
	{
		String jsonString = "";
		if(jsonObject != null)
		{
			jsonString = jsonObject.toString();
		}
		else
		{
			System.out.println("JsonObject Error !!!");
		}
		
		return jsonString;
	}

}
