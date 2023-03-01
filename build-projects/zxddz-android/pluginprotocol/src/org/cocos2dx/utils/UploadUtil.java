package org.cocos2dx.utils;

import java.io.File;
import java.io.IOException;
import org.cocos2dx.config.MsgStringConfig;
import org.cocos2dx.plugin.PlatformWP;
import org.cocos2dx.plugin.PlatformWrapper;
import org.json.JSONException;
import org.json.JSONObject;
import okhttp3.FormBody;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class UploadUtil 
{
//	private static final String TAG = "uploadFile";
//	private static final int TIME_OUT = 10 * 1000; 	// 超时时间
//	private static final String CHARSET = "utf-8"; 	// 设置编码

	/**
	 * android              上传文件到服务器
	 * 
	 * @param file 		       需要上传的文件
	 * 
	 * @param RequestURL 	请求的rul
	 *  
	 * @return   		      返回响应的内容
	 */
	public static String uploadFile(File file, String RequestURL)
	{
	    String filename = file.getName();
		String result = null;
		String url = RequestURL.replaceAll("http://", "https://");
		try {
            RequestBody requestBody = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("file", filename,
                            RequestBody.Companion.create(file, MediaType.Companion.parse("multipart/form-data")))
                    .build();
			Request request = new Request.Builder()
					.url(url)
					.post(requestBody)
					.build();
			Response response = HttpsClientUtil.getClient().newCall(request).execute();
			if (response.isSuccessful()){
				result = response.body().string();
			} else {
				//PlatformWP.platformResult(PlatformWrapper.UPLOAD_HEADFACE_FAIL, MsgStringConfig.msgUploadHeadfaceFail, "");
			}

			response.body().close();
		} catch (IOException e) {
			e.printStackTrace();
			//PlatformWP.platformResult(PlatformWrapper.UPLOAD_HEADFACE_FAIL, MsgStringConfig.msgUploadHeadfaceFail, "");
		}
		return result;
	}
	
	public static JSONObject modifyImgUrl(String url, String pid, String ticket, String face)
	{
		JSONObject jsonResult = null;
		try {
			//表单提交
			FormBody.Builder builder = new FormBody.Builder();
			builder.add("pid", pid);
			builder.add("ticket", ticket);
			builder.add("face", face);
			//20160115设置头像任务的标识
			builder.add("taskversion", "20160115");
			RequestBody formBody = builder.build();
			Request request = new Request.Builder().url(url).post(formBody).build();
			Response response = HttpsClientUtil.getClient().newCall(request).execute();
			if (response.isSuccessful()){
				String result = response.body().string();
				jsonResult = new JSONObject(result);
			}
			response.body().close();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return jsonResult;	
	}
	
	public static JSONObject modifyNickName(String url, String pid, String ticket, String nickname)
	{
		JSONObject jsonResult = null;
		try {
			//表单提交
			FormBody.Builder builder = new FormBody.Builder();
			builder.add("pid", pid);
			builder.add("ticket", ticket);
			builder.add("nickname", nickname);
			RequestBody formBody = builder.build();
			Request request = new Request.Builder().url(url).post(formBody).build();
			Response response = HttpsClientUtil.getClient().newCall(request).execute();
			if (response.isSuccessful()){
				String result = response.body().string();
				jsonResult = new JSONObject(result);
			}
			response.body().close();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return jsonResult;	
	}
}
