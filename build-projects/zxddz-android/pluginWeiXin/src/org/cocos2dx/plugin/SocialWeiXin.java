package org.cocos2dx.plugin;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Hashtable;
import org.cocos2dx.config.MsgStringConfig;
import org.cocos2dx.utils.MD5Util;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.modelmsg.SendMessageToWX;
import com.tencent.mm.opensdk.modelmsg.WXImageObject;
import com.tencent.mm.opensdk.modelmsg.WXMediaMessage;
import com.tencent.mm.opensdk.modelmsg.WXTextObject;
import com.tencent.mm.opensdk.modelmsg.WXWebpageObject;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap.CompressFormat;
import android.util.Log;

/**
 * 微信分享
 */
public class SocialWeiXin implements InterfaceSocial{
	
	public static boolean bDebug = false;
	private static final String LOG_TAG = "SocialWeiXin";
	public static String weixinsocial = "weixinsocial";
	public static Activity mContext;
	public static SocialWeiXin mWeiXin;
	private static String shareType = "0";//0.默认为链接  1.只分享文字 2.只分享图片
	private static boolean isInited = false;
	private static Hashtable<String, String> shareInfo = null;
	public static String appid = "";
	private static IWXAPI mWeiXinApi = null;
	private static String socialHost = "";
	private static final int TIMELINE_SUPPORTED_VERSION = 0x21020001;

//------------------------------------------------------------
	protected static void LogE(String msg, Exception e) {
		Log.e(LOG_TAG, msg, e);
		e.printStackTrace();
	}

	protected static void LogD(String msg) {
		if (bDebug) {
			Log.d(LOG_TAG, msg);
		}
	}
	
	public SocialWeiXin(Context context){
		mContext = (Activity) context;
		mWeiXin = this;
	}
	
	@Override
	public void configDeveloperInfo(Hashtable<String, String> cpInfo) {
		
		//configInfo = new Hashtable<String, String>(cpInfo);
		try 
		{
			appid = PlatformWP.getMetaName("wxapiAppID");
			if (isInited == false){
				mWeiXinApi = WXAPIFactory.createWXAPI(mContext, appid, true);
				mWeiXinApi.registerApp(appid);
				isInited = true;
				if (bDebug){
					PlatformWP.getInstance().showToast("微信分享初始化注册完成");
				}
			}
		} 
		catch (Exception e) 
		{
			LogE("sdk init error", e);
			if (bDebug){
				PlatformWP.getInstance().showToast("微信分享初始化失败");
			}
		}
	}

	@SuppressLint("NewApi")
	@Override
	public void share(Hashtable<String, String> cpInfo) {
		shareInfo = cpInfo;
		socialHost = shareInfo.get("SocialHost");
		
		if (!mWeiXinApi.isWXAppInstalled()){
			socialResult(SocialWrapper.SHARERESULT_FAIL, MsgStringConfig.msgWeiXinUninstall);
			return;
		}
		int wxSdkVersion = mWeiXinApi.getWXAppSupportAPI();
		if (wxSdkVersion < TIMELINE_SUPPORTED_VERSION) {
			socialResult(SocialWrapper.SHARERESULT_FAIL, MsgStringConfig.msgWeiXinUpgrade);
			return;
		}
		socialResult(SocialWrapper.SHARERESULT_DEFAULT_CALLBACK, MsgStringConfig.msgPayDefault);
//		StrictMode.setThreadPolicy(new StrictMode.ThreadPolicy.Builder()  
//        	.detectDiskReads().detectDiskWrites().detectNetwork()  
//        	.penaltyLog().build());  
//		StrictMode.setVmPolicy(new StrictMode.VmPolicy.Builder()  
//        	.detectLeakedSqlLiteObjects().detectLeakedClosableObjects()  
//        	.penaltyLog().penaltyDeath().build());  
		mContext.runOnUiThread(new Runnable()
		{
			@Override
			public void run()
			{
				//ShareWay：1004分享朋友圈，1005分享好友
				String shareway = "";
				//SharedImg：图片
				String shareimg = "";
				//ShareText：文本
				String sharetext = "";
				//标题
				String sharetitle = "";
				//ShareUrl：链接地址
				String shareurl = "";
				//ShareType：0.默认为链接  1.只分享文字 2.只分享图片
				shareType = "0";
				try{
					//ShareWay：1004分享朋友圈，1005分享好友
					shareway = shareInfo.get("ShareWay");
					//SharedImg：图片
					shareimg = shareInfo.get("SharedImg");
					//ShareText：文本
					sharetext = shareInfo.get("ShareText");
					//标题
					sharetitle = shareInfo.get("ShareTitle");
					//ShareUrl：链接地址
					shareurl = shareInfo.get("ShareUrl");
					//ShareType：0.默认为链接  1.只分享文字 2.只分享图片
					shareType = shareInfo.get("ShareType");
				} catch(Exception e) {
					e.printStackTrace();
				}
				System.out.println("share invoked " + shareInfo.toString());
				System.out.println("imageurl : " + shareimg);
				System.out.println("sharetext : " + sharetext);
				System.out.println("shareway:"+shareway);
				System.out.println("shareType:"+shareType);
				
				//设定分享内容
				//1.只分享文字
				if("1".equals(shareType))
				{
					if ((sharetext != null) && (!"".equals(sharetext))){
						WXTextObject textObj = new WXTextObject();
						textObj.text = sharetext;
						
						WXMediaMessage msg = new WXMediaMessage();
						msg.mediaObject = textObj;
						// msg.title = "Will be ignored";
						msg.description = sharetext;
						
						SendMessageToWX.Req req = new SendMessageToWX.Req();
						req.transaction = weixinsocial;
						req.message = msg;
						if ("1004".equals(shareway)){
							req.scene = SendMessageToWX.Req.WXSceneTimeline;
						}else {
							req.scene = SendMessageToWX.Req.WXSceneSession;
						}
						mWeiXinApi.sendReq(req);
						if (bDebug){
							PlatformWP.getInstance().showToast("微信分享文本");
						}
					}
				}
				//2.只分享图片
				else if("2".equals(shareType))
				{
					if ((shareimg != null) && (!"".equals(shareimg))){
						String url = shareimg;
						Bitmap bmp = null;
						InputStream is =  null;
						try{
							WXMediaMessage msg = new WXMediaMessage();
							
							if (url.startsWith("file:///data")){//截图
								String imgurl = url.substring("file://".length(), url.length());
								is = new FileInputStream(new File(imgurl));
								bmp = BitmapFactory.decodeStream(is);
								
								WXImageObject imgObj = new WXImageObject(bmp);
								msg.mediaObject = imgObj;
								////////////////////////压缩图片到指定大小32K//////////////////
								double size = bmp.getWidth() * bmp.getHeight();
								double scale = (8*1024) / size;
								Bitmap thumbBmp = Bitmap.createScaledBitmap(bmp, 
										(int)(bmp.getWidth() * Math.sqrt(scale)), 
										(int)(bmp.getHeight() * Math.sqrt(scale)), true);
								msg.thumbData = bmpToByteArray(thumbBmp, true);
								//////////////////////////////////////////////////////
								if (msg.thumbData == null){
									socialResult(SocialWrapper.SHARERESULT_FAIL, MsgStringConfig.msgWeiXinIMGFail);
									return;
								}
							} else if (url.startsWith("file://res")){//本地图片
								AssetManager assetManager = mContext.getAssets();
								String imgurl = url.substring("file://".length(), url.length());
							    is = assetManager.open(imgurl);
								bmp = BitmapFactory.decodeStream(is);
								
								WXImageObject imgObj = new WXImageObject(bmp);
								msg.mediaObject = imgObj;
								
								double size = bmp.getWidth() * bmp.getHeight();
								if (size > 8*1024){
									////////////////////////压缩图片到指定大小32K//////////////////
									double scale = (8*1024) / size;
									Bitmap thumbBmp = Bitmap.createScaledBitmap(bmp, 
											(int)(bmp.getWidth() * Math.sqrt(scale)), 
											(int)(bmp.getHeight() * Math.sqrt(scale)), true);
									msg.thumbData = bmpToByteArray(thumbBmp, true);
									//////////////////////////////////////////////////////
								}else {
									Bitmap thumbBmp = Bitmap.createScaledBitmap(bmp,
											bmp.getWidth(), bmp.getHeight(), true);
									msg.thumbData = bmpToByteArray(thumbBmp, true);
								}
								if (msg.thumbData == null){
									socialResult(SocialWrapper.SHARERESULT_FAIL, MsgStringConfig.msgWeiXinIMGFail);
									return;
								}
							}else {//网络图片
								//WXImageObject imgObj = new WXImageObject();
								//imgObj.imageUrl = url;
								//msg.mediaObject = imgObj;
								bmp = BitmapFactory.decodeStream(new URL(url).openStream());
								
								double size = bmp.getWidth() * bmp.getHeight();
								if (size > 8*1024){
									////////////////////////压缩图片到指定大小32K//////////////////
									double scale = (8*1024) / size;
									Bitmap thumbBmp = Bitmap.createScaledBitmap(bmp, 
											(int)(bmp.getWidth() * Math.sqrt(scale)), 
											(int)(bmp.getHeight() * Math.sqrt(scale)), true);
									WXImageObject imgObj = new WXImageObject(thumbBmp);
									msg.mediaObject = imgObj;
									msg.thumbData = bmpToByteArray(thumbBmp, true);
									//////////////////////////////////////////////////////
								}else{
									Bitmap thumbBmp = Bitmap.createScaledBitmap(bmp,
											bmp.getWidth(), bmp.getHeight(), true);
									WXImageObject imgObj = new WXImageObject(thumbBmp);
									msg.mediaObject = imgObj;
									msg.thumbData = bmpToByteArray(thumbBmp, true);
								}
								if (msg.thumbData == null){
									socialResult(SocialWrapper.SHARERESULT_FAIL, MsgStringConfig.msgWeiXinIMGFail);
									return;
								}
							}
							SendMessageToWX.Req req = new SendMessageToWX.Req();
							req.transaction = weixinsocial;
							req.message = msg;
							if ("1004".equals(shareway)){
								req.scene = SendMessageToWX.Req.WXSceneTimeline;
							}else {
								req.scene = SendMessageToWX.Req.WXSceneSession;
							}
							mWeiXinApi.sendReq(req);
						} catch(Exception e) {
							e.printStackTrace();
						}finally{
							if(bmp != null && !bmp.isRecycled()) {
								bmp.recycle();
								bmp = null;
							}
							try {
								is.close();
							} catch (IOException e) {
								e.printStackTrace();
							}
					    }
					}
				}
				//0. 默认为链接
				else
				{
					if ((shareimg != null) && (!"".equals(shareimg))
						&& (sharetext != null) && (!"".equals(sharetext))){
						String url = shareimg;
						Bitmap bmp = null;
						InputStream is =  null;
						try {
							WXWebpageObject webpage = new WXWebpageObject();
							if (!"".equals(shareurl)){
								webpage.webpageUrl = shareurl;
							}else {
								webpage.webpageUrl = "http://www.baidu.com";
							}
							WXMediaMessage msg = new WXMediaMessage(webpage);
							if (!"".equals(sharetitle)){
								msg.title = sharetitle;
							}else {
								msg.title = "WebPage Title";
							}
							if (!"".equals(sharetext)){
								msg.description = sharetext;
							}else {
								msg.description = "WebPage Description";
							}
							
							if (url.startsWith("file:///data")){//截图
								String imgurl = url.substring("file://".length(), url.length());
								is = new FileInputStream(new File(imgurl));
								bmp = BitmapFactory.decodeStream(is);
								
								////////////////////////压缩图片到指定大小32K//////////////////
								double size = bmp.getWidth() * bmp.getHeight();
								double scale = (8*1024) / size;
								Bitmap thumbBmp = Bitmap.createScaledBitmap(bmp, 
										(int)(bmp.getWidth() * Math.sqrt(scale)), 
										(int)(bmp.getHeight() * Math.sqrt(scale)), true);
								msg.thumbData = bmpToByteArray(thumbBmp, true);
								//////////////////////////////////////////////////////
								if (msg.thumbData == null){
									socialResult(SocialWrapper.SHARERESULT_FAIL, MsgStringConfig.msgWeiXinIMGFail);
									return;
								}
							} else if (url.startsWith("file://")){//本地图片
								AssetManager assetManager = mContext.getAssets();
								String imgurl = url.substring("file://".length(), url.length());
							    is = assetManager.open(imgurl);
								bmp = BitmapFactory.decodeStream(is);
								
								Bitmap thumbBmp = Bitmap.createScaledBitmap(bmp,
										bmp.getWidth(), bmp.getHeight(), true);
								msg.thumbData = bmpToByteArray(thumbBmp, true);
								if (msg.thumbData == null){
									socialResult(SocialWrapper.SHARERESULT_FAIL, MsgStringConfig.msgWeiXinIMGFail);
									return;
								}
							}else {//网络图片
								bmp = BitmapFactory.decodeStream(new URL(shareimg).openStream());
								
								double size = bmp.getWidth() * bmp.getHeight();
								if (size > 8*1024){
									////////////////////////压缩图片到指定大小32K//////////////////
									double scale = (8*1024) / size;
									Bitmap thumbBmp = Bitmap.createScaledBitmap(bmp, 
											(int)(bmp.getWidth() * Math.sqrt(scale)), 
											(int)(bmp.getHeight() * Math.sqrt(scale)), true);
									msg.thumbData = bmpToByteArray(thumbBmp, true);
									//////////////////////////////////////////////////////
								}else{
									Bitmap thumbBmp = Bitmap.createScaledBitmap(bmp,
											bmp.getWidth(), bmp.getHeight(), true);
									msg.thumbData = bmpToByteArray(thumbBmp, true);
								}
								if (msg.thumbData == null){
									socialResult(SocialWrapper.SHARERESULT_FAIL, MsgStringConfig.msgWeiXinIMGFail);
									return;
								}
							}
							SendMessageToWX.Req req = new SendMessageToWX.Req();
							req.transaction = weixinsocial;
							req.message = msg;
							if ("1004".equals(shareway)){
								req.scene = SendMessageToWX.Req.WXSceneTimeline;
							}else {
								req.scene = SendMessageToWX.Req.WXSceneSession;
							}
							mWeiXinApi.sendReq(req);
						} catch (MalformedURLException e) {
							e.printStackTrace();
						} catch (IOException e) {
							e.printStackTrace();
						}finally{
							if(bmp != null && !bmp.isRecycled()) {
								bmp.recycle();
								bmp = null;
							}
							try {
								is.close();
							} catch (IOException e) {
								e.printStackTrace();
							}
					    }
					}
				}
			}
		});
		
	}

	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;
	}

	@Override
	public String getSDKVersion() {
		return "1.0.0";
	}

	@Override
	public String getPluginVersion() {
		return "1.1.0";
	}
	
	public static void socialResult(int ret, String msg) 
	{
		SocialWrapper.onShareResult(mWeiXin, ret, msg);
		LogD("mWeiXin Social result : " + ret + " msg : " + msg);
	}
	
	private byte[] bmpToByteArray(final Bitmap bmp, final boolean needRecycle) {
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		bmp.compress(CompressFormat.PNG, 100, output);
		if (needRecycle) {
			bmp.recycle();
		}
		
		byte[] result = output.toByteArray();
		try {
			output.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		if (result.length > 32*1024){
			result = null;
		}
		
		return result;
	}
	/////////////////////////////////////////////////////////////////////
	/**
	 * 分享结果通知WEB服务器
	 * */
	public static void ShareResult(int ret){
		
		switch(ret){
		case BaseResp.ErrCode.ERR_OK:
			// isNotifyWeb 不通知WEB服务器
			String isNotifyWeb = shareInfo.get("isNotifyWeb");
			if (isNotifyWeb != null && isNotifyWeb.equals("false")) {
				Log.i("ShareResult","ShareResult SUCCESS");
				socialResult(SocialWrapper.SHARERESULT_SUCCESS, MsgStringConfig.msgShareSuccess);
			} else {
				if ("".equals(socialHost) || socialHost == null){
					SocialWrapper.StartOnShareResultToWeb(mWeiXin, "", getSocialParams());
				}else{
					SocialWrapper.StartOnShareResultToWebNew(mWeiXin, socialHost, getSocialParams());
				}
			}
			break;
		case BaseResp.ErrCode.ERR_USER_CANCEL:
			socialResult(SocialWrapper.SHARERESULT_CANCEL, MsgStringConfig.msgShareCancel);
			break;
		default:
			socialResult(SocialWrapper.SHARERESULT_FAIL, MsgStringConfig.msgShareFail);
			break;
		}
	}
	public static Hashtable<String, String> getSocialParams() {
		//Hashtable<String, String> socialParams = new Hashtable<String, String>();
		
		try
		{
			String pid = SessionWrapper.sessionInfo.get("pid");
			String gameid = shareInfo.get("gameid");
			String taskInd = shareInfo.get("ShareWay");
			String taskType = shareInfo.get("ShareTaskType");//日常任务、成就任务的类型区分
			String ticket = SessionWrapper.sessionInfo.get("ticket");
			String sign = "";
			//加密验签规则
			String key = "abcd123321efgh";
			StringBuffer buf = new StringBuffer();
			buf.append("pid=").append(pid).append("&gameid=").append(gameid).append("&key=").append(key);
			sign = MD5Util.md5Digest(buf.toString());
			
			shareInfo.put("pid",     	pid);
			shareInfo.put("gameid", 		gameid);
			shareInfo.put("ticket", 		ticket);
			shareInfo.put("taskInd", 	taskInd);
			shareInfo.put("taskType", 	taskType);
			shareInfo.put("sign",    	sign);
		}
		catch(Exception e)
		{
			e.printStackTrace();
			LogE("params error !!!", e);
			return null;
		}
		return shareInfo;
	}
	
}
