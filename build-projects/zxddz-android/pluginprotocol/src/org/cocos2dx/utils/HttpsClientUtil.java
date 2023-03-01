package org.cocos2dx.utils;

//import android.os.Handler;
//import android.os.Looper;
import org.cocos2dx.plugin.PluginWrapper;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.IOException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Arrays;
import java.util.Hashtable;
import java.util.Iterator;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.FormBody;
//import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class HttpsClientUtil implements X509TrustManager
{
	//public static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");
	//private static Handler okHttpHandler;
	private static OkHttpClient okclient = new OkHttpClient();

	public static SSLSocketFactory createSSLSocketFactory() {
		SSLSocketFactory sSLSocketFactory = null;
		try {
			SSLContext sc = SSLContext.getInstance("TLS");
			sc.init(null, new TrustManager[]{new HttpsClientUtil()},
					new SecureRandom());
			sSLSocketFactory = sc.getSocketFactory();
		} catch (Exception e) {
		}
		return sSLSocketFactory;
	}
	static
	{
		try {
			TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(
					TrustManagerFactory.getDefaultAlgorithm());
			trustManagerFactory.init((KeyStore) null);
			TrustManager[] trustManagers = trustManagerFactory.getTrustManagers();
			if (trustManagers.length != 1 || !(trustManagers[0] instanceof X509TrustManager)) {
				throw new IllegalStateException("Unexpected default trust managers:"
						+ Arrays.toString(trustManagers));
			}
			X509TrustManager trustManager = (X509TrustManager) trustManagers[0];

			okclient = okclient.newBuilder()
					.sslSocketFactory(HttpsClientUtil.createSSLSocketFactory(), trustManager)
					.hostnameVerifier(new HttpsClientUtil.TrustAllHostnameVerifier())
					.build();
			//okHttpHandler = new Handler(Looper.getMainLooper());
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		} catch (KeyStoreException e) {
			e.printStackTrace();
		}
	}

	public static class TrustAllHostnameVerifier implements HostnameVerifier
	{
		@Override
		public boolean verify(String s, SSLSession sslSession) {
			return true;
		}
	}
	
	public static void get(String url, Hashtable<String, String> params, Callback responseHandler)
	{
		//json数据提交
//		JSONArray jsonArray = new JSONArray();
//		JSONObject jsonObject = parseTableToJson(params);
//		jsonArray.put(jsonObject);
//		String json = jsonArray.toString();
//		RequestBody body = RequestBody.Companion.create(json, MediaType.Companion.parse("application/json;charset=utf-8"));
//		Request request = new Request.Builder()
//				.url(url)
//				.post(body)
//				.build();

		//表单提交
		FormBody.Builder builder = new FormBody.Builder();
		for (String key : params.keySet()){
			builder.add(key, params.get(key));
		}
		RequestBody formBody = builder.build();
		Request request = new Request.Builder().url(url).method("GET",formBody).build();

		Call call = okclient.newCall(request);
		call.enqueue(responseHandler);
	}
	
	public static void post(String url, Hashtable<String, String> params, Callback responseHandler)
    {
		//json数据提交
//		JSONArray jsonArray = new JSONArray();
//		JSONObject jsonObject = parseTableToJson(params);
//		jsonArray.put(jsonObject);
//		String json = jsonArray.toString();
//		RequestBody body = RequestBody.Companion.create(json, MediaType.Companion.parse("application/json;charset=utf-8"));
//		Request request = new Request.Builder()
//				.url(url)
//				.post(body)
//				.build();

		//表单提交
		FormBody.Builder builder = new FormBody.Builder();
		for (String key : params.keySet()){
			builder.add(key, params.get(key));
		}
		RequestBody formBody = builder.build();
		Request request = new Request.Builder().url(url).post(formBody).build();

		Call call = okclient.newCall(request);
		call.enqueue(responseHandler);
    }

	public static void post(String url, Hashtable<String, String> params, final ResponseCallback mCallback)
	{
		//json数据提交
//		JSONArray jsonArray = new JSONArray();
//		JSONObject jsonObject = parseTableToJson(params);
//		jsonArray.put(jsonObject);
//		String json = jsonArray.toString();
//		RequestBody body = RequestBody.Companion.create(json, MediaType.Companion.parse("application/json;charset=utf-8"));
//		Request request = new Request.Builder()
//				.url(url)
//				.post(body)
//				.build();

		//表单提交
		FormBody.Builder builder = new FormBody.Builder();
		for (String key : params.keySet()){
			builder.add(key, params.get(key));
		}
		RequestBody formBody = builder.build();
		Request request = new Request.Builder().url(url).post(formBody).build();

		Call call = okclient.newCall(request);
		call.enqueue(new Callback() {
			@Override
			public void onFailure(Call call, IOException e) {
                PluginWrapper.runOnGLThread(new Runnable() {
					@Override
					public void run() {
						if (mCallback != null){
							mCallback.onFailure();
						}
					}
				});
			}

			@Override
			public void onResponse(Call call, final Response response) throws IOException {
				PluginWrapper.runOnGLThread(new Runnable() {
					@Override
					public void run() {
						if (mCallback != null){
							try {
								String body = response.body().string();
								JSONObject jsonObject = new JSONObject(body);
								mCallback.onSuccess(jsonObject);
							} catch (JSONException e) {
								e.printStackTrace();
								mCallback.onFailure();
							} catch (IOException e) {
								e.printStackTrace();
								mCallback.onFailure();
							}
						}
					}
				});
			}
		});
	}
	  
	public static OkHttpClient getClient()
	{
		return okclient;
	}

	@Override
	public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {

	}

	@Override
	public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {

	}

	@Override
	public X509Certificate[] getAcceptedIssuers() {
		return new X509Certificate[0];
	}

	public static JSONObject parseTableToJson(
			Hashtable<String, String> params)
	{
		JSONObject json = new JSONObject();

		if ((params != null) && (params.size()!=0))
		{
			for (Iterator<String> it = params.keySet().iterator(); it.hasNext();)
			{
				String key = (String) it.next();
				String value = params.get(key);
				try {
					json.put(key, value);
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}
		}
		return json;
	}
}