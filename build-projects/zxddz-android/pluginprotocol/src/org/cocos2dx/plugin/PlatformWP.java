package org.cocos2dx.plugin;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import org.cocos2dx.config.MsgStringConfig;
import org.cocos2dx.config.URLConfig;
import org.cocos2dx.libPluginProtocol.R;
import org.cocos2dx.utils.BaseUtil;
import org.cocos2dx.utils.HttpsClientUtil;
import org.cocos2dx.utils.ParamerParseUtil;
import org.cocos2dx.utils.UploadUtil;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import com.baidu.location.BDLocation;
import com.baidu.location.BDLocationListener;
import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;
import com.baidu.location.LocationClientOption.LocationMode;
import com.meituan.android.walle.ChannelInfo;
import com.meituan.android.walle.WalleChannelReader;
import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.AlertDialog.Builder;
import android.app.AppOpsManager;
import android.content.BroadcastReceiver;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.content.res.AssetManager;
import android.content.res.Configuration;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.BitmapFactory;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Binder;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.ContactsContract;
import android.provider.MediaStore;
import android.provider.Settings;
import android.provider.Settings.System;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import android.telephony.TelephonyManager;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.widget.RelativeLayout;
import android.widget.Toast;
import okhttp3.Request;
import okhttp3.Response;

public class PlatformWP implements ActivityCompat.OnRequestPermissionsResultCallback, InterfacePlatform, ActivityResultDelegate{
	private static  BDLocation location;
	private static  float batteryLevel = -1;
	private static String ipAndregion = "";//手机IP地址和所在省份
	private static  float currentNetDBM = -1;
	private static LocationClient mLocationClient = null;
	private static BDLocationListener myListener = null;
	private static Vibrator mVibrator = null;

	//List<Hashtable<String, String>> mContactsinfos = new ArrayList<Hashtable<String, String>>();
	public static final int CONTACTRESOULT   = 110001;//获取通讯录权限结果
	//public static Hashtable<String, String> languageinfo = null;
	public static String socialurlInfo = "";
	public static View layout = null;
	public static RelativeLayout bannerContainer = null;
	public static View nativeView = null;
	public static RelativeLayout nativeContainer = null;
    //********************************************
	/**
	 * 设置banner层
	 * */
	public void InitBannerLayout(Activity activity) {
		if (layout == null) {
			layout = LayoutInflater.from(activity).inflate(R.layout.activity_banner, null);
			PluginWrapper.mFramelayout.addView(layout);
			layout.setVisibility(View.INVISIBLE);
			bannerContainer = activity.findViewById(R.id.bannerContainer);
		}
		if (nativeView == null) {
			nativeView = LayoutInflater.from(activity).inflate(R.layout.activity_native, null);
			PluginWrapper.mFramelayout.addView(nativeView);
			nativeView.setVisibility(View.INVISIBLE);
			nativeContainer = activity.findViewById(R.id.nativeContainer);
		}
	}

	/**
	 * 获取APP屏幕方向
	 * 1.竖屏
	 * 2.横屏
	 * */
	public int getAppOrientation() {
		int ori = 2;
		Configuration mConfiguration = mContext.getResources().getConfiguration(); //获取设置的配置信息
		if (mConfiguration != null) {
			ori = mConfiguration.orientation;
		}
		return ori;
	}
	/**
	 * 获取分享的Url自带的参数
	 * */
	public String getSocialURLParams()
	{
		return socialurlInfo;
	}
	public void setSocialURLParams(String info)
	{
		socialurlInfo = info;
		platformResult(PlatformWrapper.GET_SOCIALURLPARAMS, MsgStringConfig.msgURLParamsSuccess, socialurlInfo);
	}
	public void clearSocialURLParams()
	{
		socialurlInfo = "";
	}

	/**
	 * 获取终端信息 
	 */
	 
	 /**
	 * 设置登录缓存信息
	 */
	 public void setSessionInfo(Hashtable<String, String> info)
	 {
		 SessionWrapper.sessionInfo = info;
	 }

	/**
	 * 打印日志
	 * */
	public void PluginLog(String msg)
	{
		Log.i("PluginLog", msg);
	}
	/**
	 * 客户端回应插件参数列表
	 * *//*
	public void invokeResultToPlugin(Hashtable<String, String> invokeinfo)
	{
		if (languageinfo != null){
			languageinfo.clear();
		}
		languageinfo = new Hashtable<String, String>(invokeinfo);
	}*/

	/**
	 * 系统分享
	 * */
	public void SystemShare(Hashtable<String, String> shareinfo)
	{
		String title = shareinfo.get("ShareTitle");
		String text = shareinfo.get("ShareText");
		String imgurl = shareinfo.get("ShareImg");
		String url = shareinfo.get("ShareUrl");

		imgurl = null;
		Intent shareIntent = new Intent(Intent.ACTION_SEND);
		if (imgurl != null){
			Bitmap bmp = null;
			InputStream is = null;
			try {
				if (imgurl.startsWith("file:///data")) {//截图
					imgurl = imgurl.substring("file://".length(), imgurl.length());
					is = new FileInputStream(new File(imgurl));
					bmp = BitmapFactory.decodeStream(is);
					File file = saveImage(bmp);
					String uriStr = file.getAbsolutePath();
					if (uriStr != null){
						Uri uri = getPhotoUri(new File(uriStr));
						shareIntent.setType("image/*");
						shareIntent.putExtra(Intent.EXTRA_STREAM, uri);
					} else {
						shareIntent.setType("text/plain");
					}
				} else if (imgurl.startsWith("file://res")) {//本地图片
					AssetManager assetManager = PluginWrapper.getContext().getAssets();
					imgurl = imgurl.substring("file://".length(), imgurl.length());
					is = assetManager.open(imgurl);
					bmp = BitmapFactory.decodeStream(is);
					File file = saveImage(bmp);
					String uriStr = file.getAbsolutePath();
					if (uriStr != null){
						Uri uri = getPhotoUri(new File(uriStr));
						shareIntent.setType("image/*");
						shareIntent.putExtra(Intent.EXTRA_STREAM, uri);
					} else {
						shareIntent.setType("text/plain");
					}
				} else {//网络图片
					bmp = BitmapFactory.decodeStream(new URL(imgurl).openStream());
					File file = saveImage(bmp);
					String uriStr = file.getAbsolutePath();
					if (uriStr != null){
						Uri uri = getPhotoUri(new File(uriStr));
						shareIntent.setType("image/*");
						shareIntent.putExtra(Intent.EXTRA_STREAM, uri);
					} else {
						shareIntent.setType("text/plain");
					}
				}
			}catch (Exception e) {
				e.printStackTrace();
				shareIntent.setType("text/plain");
			} finally{
				try {
					if(bmp != null)
					{
						bmp.recycle();
						bmp = null;
					}
					if (is != null){
						is.close();
					}
				} catch (IOException e) {
					e.printStackTrace();
					shareIntent.setType("text/plain");
				}
			}
		} else {
			shareIntent.setType("text/plain");
		}

		if(title != null && "".equalsIgnoreCase(title) == false)
		{
			shareIntent.putExtra(Intent.EXTRA_TITLE, title);
		}

		if (text != null && "".equalsIgnoreCase(text) == false){
			if (url != null && "".equalsIgnoreCase(url) == false){
				shareIntent.putExtra(Intent.EXTRA_TEXT, text+url);
				shareIntent.putExtra("sms_body", text+url);
			} else {
				shareIntent.putExtra(Intent.EXTRA_TEXT, text);
				shareIntent.putExtra("sms_body", text);
				//shareIntent.putExtra("Kdescription", text);
			}
		} else {
			if (url != null && "".equalsIgnoreCase(url) == false){
				shareIntent.putExtra(Intent.EXTRA_TEXT, url);
			}
		}
		shareIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		if (title != null || "".equalsIgnoreCase(title) == false){
			PluginWrapper.getContext().startActivity(Intent.createChooser(shareIntent, title));
		} else {
			PluginWrapper.getContext().startActivity(shareIntent);
		}
	}
	/**
	 * 设置状态栏是否隐藏
	 */
	public void setStatusBarIsHidden(final boolean ishidden)
	{
		((Activity)PluginWrapper.getContext()).runOnUiThread(new Runnable() {
			public void run() {
				if (ishidden){
					((Activity) PluginWrapper.getContext()).getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, -1);
					Activity ac = (Activity) PluginWrapper.getContext();
					View view = ac.getWindow().getDecorView();
					view.setSystemUiVisibility(WindowManager.LayoutParams.FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
				}else {
					((Activity) PluginWrapper.getContext()).getWindow().setFlags(View.SYSTEM_UI_FLAG_IMMERSIVE
							| View.SYSTEM_UI_FLAG_LAYOUT_STABLE
							| WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS, -1);
					Activity ac = (Activity) PluginWrapper.getContext();
					View view = ac.getWindow().getDecorView();
					view.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
							| View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
				}
			}
		});
	}
	/**
	 * 获取状态栏高度
	 */
	public float getStatusBarHeight()
	{
		float height = 0;
		//获取status_bar_height资源的ID
		int resourceId = PluginWrapper.getContext().getResources().getIdentifier("status_bar_height", "dimen", "android");
		if (resourceId > 0) {
			//根据资源ID获取响应的尺寸值
			height = PluginWrapper.getContext().getResources().getDimensionPixelSize(resourceId);
		}
		return height;
	}

	/**
	 * 调用系统短信接口发送短信
	 * 接收人号码使用;分割
	 * 内容
	 * */
	public void sendSMS(Hashtable<String, String> smsinfo){
		String phoneNumbers = smsinfo.get("phonenumbers");
		String message = smsinfo.get("message");
		Intent intent = new Intent(Intent.ACTION_SENDTO);
		intent.setData(Uri.parse("smsto:" + phoneNumbers));
		intent.putExtra("sms_body", message);
		if (intent.resolveActivity(PluginWrapper.getContext().getPackageManager()) != null)
			PluginWrapper.getContext().startActivity(intent);
	}
	/**
	 *获取通讯录内容
	 * 返回名字和电话号码
	 * */
	public void getSystemContactInfos() {
		requestPermission(CONTACTRESOULT, android.Manifest.permission.READ_CONTACTS, new Runnable() {
			@Override
			public void run() {
				JSONArray jsonArray = new JSONArray();
				// 联系人Uri
				Uri uri = ContactsContract.CommonDataKinds.Phone.CONTENT_URI;
				String NUMBER = ContactsContract.CommonDataKinds.Phone.NUMBER;// 号码
				String DISPLAY_NAME = ContactsContract.Contacts.DISPLAY_NAME;// 名字
				String HAS_PHONE_NUMBER = ContactsContract.Contacts.HAS_PHONE_NUMBER;
				String CONTACT_ID = ContactsContract.CommonDataKinds.Phone.CONTACT_ID;
				String ID = ContactsContract.Contacts._ID;
				String[] phoneprojection = new String[] {
						NUMBER
				};
				Cursor cursor = PluginWrapper.getContext().getContentResolver().query(ContactsContract.Contacts.CONTENT_URI, null, null, null, null);
				if (cursor != null && cursor.moveToFirst()) {
					//mContactsinfos.clear();
					do {
						// 获得联系人的ID
						String contactId = cursor.getString(cursor.getColumnIndex(ID));
						// 获得联系人姓名
						String displayname = cursor.getString(cursor.getColumnIndex(DISPLAY_NAME));
						// 查看联系人有多少个号码，如果没有号码，返回0
						int phoneCount = cursor.getInt(cursor.getColumnIndex(HAS_PHONE_NUMBER));
						if (phoneCount > 0){
							List<String> phoneList = new ArrayList<String>();
							Cursor phoneCursor = PluginWrapper.getContext().getContentResolver().query(uri, phoneprojection, CONTACT_ID + "=" + contactId, null, null);
							if (phoneCursor != null && phoneCursor.moveToFirst()) {
								do {
									String phoneNumber = phoneCursor.getString(phoneCursor.getColumnIndex(NUMBER));
									phoneNumber = disposePhoneNumber(phoneNumber);
									phoneList.add(phoneNumber);
								} while (phoneCursor.moveToNext());
								phoneCursor.close();
								String phoneNumbers = listToString(phoneList);
								JSONObject tmpobj = new JSONObject();
								try {
									tmpobj.put("username", displayname);
									tmpobj.put("phonenumbers", phoneNumbers);
									jsonArray.put(tmpobj);
								} catch (JSONException e) {
									e.printStackTrace();
								}
							}
						} else {
							JSONObject tmpobj = new JSONObject();
							try {
								tmpobj.put("username", displayname);
								tmpobj.put("phonenumbers", "");
								jsonArray.put(tmpobj);
							} catch (JSONException e) {
								e.printStackTrace();
							}
						}
					} while (cursor.moveToNext());
					cursor.close();
					String contactinfos = jsonArray.toString();
					JSONObject jsonObject = new JSONObject();
					try {
						jsonObject.put("contactInfos" , contactinfos);
					} catch (JSONException e) {
						e.printStackTrace();
					}
					String jsonmsg = ParamerParseUtil.parseJsonToString(jsonObject);
					platformResult(PlatformWrapper.GET_CONTACTS_SUCCESS, MsgStringConfig.msgContactsSuccess, jsonmsg);
				} else {
					JSONObject jsonObject = new JSONObject();
					try {
						jsonObject.put("contactInfos" , "{}");
					} catch (JSONException e) {
						e.printStackTrace();
					}
					String jsonmsg = ParamerParseUtil.parseJsonToString(jsonObject);
					platformResult(PlatformWrapper.GET_CONTACTS_SUCCESS, MsgStringConfig.msgContactsNone, jsonmsg);
				}
			}
		}, new Runnable() {
			@Override
			public void run() {
				platformResult(PlatformWrapper.GET_CONTACTS_FAIL, MsgStringConfig.msgContactsNoAuthority, "");
			}
		});
	}
	public static String listToString(List<String> list){
		if(list==null){
			return null;
		}
		StringBuilder result = new StringBuilder();
		boolean first = true;
		//第一个前面不拼接","
		for(String string :list) {
			if(first) {
				first=false;
			}else{
				result.append(",");
			}
			result.append(string);
		}
		return result.toString();
	}
	/**
	 *对手机号码进行预处理（去掉号码前的+86、首尾空格、“-”号等）
	 * */
	private static String disposePhoneNumber(String phonenumber){
		phonenumber = phonenumber.replaceAll("^(\\+86)", "");
		phonenumber = phonenumber.replaceAll("^(86)", "");
		phonenumber = phonenumber.replaceAll("-", "");
		phonenumber = phonenumber.replaceAll(" ", "");
		phonenumber = phonenumber.trim();
		return phonenumber;
	}
	/**
	 * 对获取到的通讯录信息进行了排序
	 * *//*
	private static String getSortkey(String sortKeyString){
		String key =sortKeyString.substring(0,1).toUpperCase();
		if (key.matches("[A-Z]")){
			return key;
		}else
			return "#";   //获取sort key的首个字符，如果是英文字母就直接返回，否则返回#。
	}*/

	/**
	 * @param requestId            请求授权的Id，唯一即可
	 * @param permission           请求的授权
	 * @param allowableRunnable    同意授权后的操作
	 * @param disallowableRunnable 禁止授权后的操作
	 **/
	protected void requestPermission(int requestId, String permission,
									 Runnable allowableRunnable, Runnable disallowableRunnable) {
		if (allowableRunnable == null) {
			throw new IllegalArgumentException("allowableRunnable == null");
		}
		allowablePermissionRunnables.put(requestId, allowableRunnable);

		if (disallowableRunnable != null) {
			disallowblePermissionRunnables.put(requestId, disallowableRunnable);
		}
		//版本判断
		if (Build.VERSION.SDK_INT >= 23) {
			//检查是否拥有权限
			int checkPermission = ContextCompat.checkSelfPermission(PluginWrapper.getContext(), permission);
			if (checkPermission != PackageManager.PERMISSION_GRANTED) {
				//弹出对话框请求授权
				ActivityCompat.requestPermissions((Activity) PluginWrapper.getContext(), new String[]{permission}, requestId);
				return;
			} else {
				allowableRunnable.run();
			}
		} else {
			allowableRunnable.run();
		}
	}
	private Hashtable<Integer, Runnable> allowablePermissionRunnables = new Hashtable<Integer, Runnable>();
	private Hashtable<Integer, Runnable> disallowblePermissionRunnables = new Hashtable<Integer, Runnable>();

	@Override
	public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
		if (grantResults[0] == PackageManager.PERMISSION_GRANTED){
			Runnable allowRun = allowablePermissionRunnables.get(requestCode);
			allowRun.run();
		}else {
			Runnable disallowRun = disallowblePermissionRunnables.get(requestCode);
			disallowRun.run();
		}
	}

	/**
	 * 获取通知栏权限是否开启
	 * */
	public boolean getIsPushOn()
	{
		String CHECK_OP_NO_THROW = "checkOpNoThrow";  
	    String OP_POST_NOTIFICATION = "OP_POST_NOTIFICATION";  
	  
	    AppOpsManager mAppOps = (AppOpsManager) PluginWrapper.getContext().getSystemService(PluginWrapper.getContext().APP_OPS_SERVICE);  
	    ApplicationInfo appInfo = PluginWrapper.getContext().getApplicationInfo();  
	    String pkg = PluginWrapper.getContext().getApplicationContext().getPackageName();  
	    int uid = appInfo.uid;
	  
	    Class appOpsClass = null; 
	    try {  
	    	appOpsClass = Class.forName(AppOpsManager.class.getName());  
	    	Method checkOpNoThrowMethod = appOpsClass.getMethod(CHECK_OP_NO_THROW, Integer.TYPE, Integer.TYPE,  
                 String.class);  
	    	Field opPostNotificationValue = appOpsClass.getDeclaredField(OP_POST_NOTIFICATION);  
  
	    	int value = (Integer) opPostNotificationValue.get(Integer.class);  
	    	return ((Integer) checkOpNoThrowMethod.invoke(mAppOps, value, uid, pkg) == AppOpsManager.MODE_ALLOWED);  
  
	    } catch (Exception e) {  
	    	e.printStackTrace();  
	    }   
	    return false;
	}
	
	/**
	 * 打开应用管理的权限设置页面
	 * */
	public void openPush()
	{
		Uri packageURI = Uri.parse("package:" + getPackageName());  
        Intent intent =  new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, packageURI);
     	PluginWrapper.getContext().startActivity(intent); // 设置完成后返回到原来的界面
	}
	/**
	 * 获取设备蜂窝网信号
	 * @return
	 */
    public float getCurrentNetDBM()
    {
//    	if(currentNetDBM < -0.5f)
//    	{
//    		
//    		currentNetDBM = 5;
//    		//初始化设备蜂窝网
//    		final TelephonyManager tm = (TelephonyManager) PluginWrapper
//    				.getContext().getSystemService(Context.TELEPHONY_SERVICE);
//
//    		PhoneStateListener mylistener = new PhoneStateListener() {
//    			@Override
//    			public void onSignalStrengthsChanged(SignalStrength signalStrength) {
//    				super.onSignalStrengthsChanged(signalStrength);
//    				String signalInfo = signalStrength.toString();
//    				String[] params = signalInfo.split(" ");
//
//    				if (tm.getNetworkType() == TelephonyManager.NETWORK_TYPE_LTE) {
//    					// 4G网络 最佳范围 >-90dBm 越大越好
//    					int Itedbm = Integer.parseInt(params[9]);
//    					setDBM(Itedbm);  	
//    				} else if (tm.getNetworkType() == TelephonyManager.NETWORK_TYPE_HSDPA
//    						|| tm.getNetworkType() == TelephonyManager.NETWORK_TYPE_HSPA
//    						|| tm.getNetworkType() == TelephonyManager.NETWORK_TYPE_HSUPA
//    						|| tm.getNetworkType() == TelephonyManager.NETWORK_TYPE_UMTS) {
//    					// 3G网络最佳范围 >-90dBm 越大越好 ps:中国移动3G获取不到 返回的无效dbm值是正数（85dbm）
//    					// 在这个范围的已经确定是3G，但不同运营商的3G有不同的获取方法，故在此需做判断
//    					// 判断运营商与网络类型的工具类在最下方
//    					String yys = getSimType();// 获取当前运营商
//    					if (yys == "1") {
//    						setDBM(0);// 中国移动3G不可获取，故在此返回0
//    					} else if (yys == "2") {
//    						int Itedbm = signalStrength.getCdmaDbm();
//    						setDBM(Itedbm);
//    					} else if (yys == "3") {
//    						int Itedbm = signalStrength.getEvdoDbm();
//    						setDBM(Itedbm);
//    					}
//    				} else {
//    					// 2G网络最佳范围>-90dBm 越大越好
//    					int asu = signalStrength.getGsmSignalStrength();
//    					int dbm = -113 + 2 * asu;
//    					setDBM(dbm);
//    				}
//
//    			}
//    		};
//    		// 开始监听
//    		tm.listen(mylistener, PhoneStateListener.LISTEN_SIGNAL_STRENGTHS);
//    		
//    	}
    	
    	return currentNetDBM;
    }
    public void setDBM(int dbm)
    {
    	//5个级别
    	if(dbm <= -90 )
		{
    		currentNetDBM = 1;
		}
		else if(dbm < -70)
		{
			currentNetDBM = 2;
		}
		else if(dbm < -50)
		{
			currentNetDBM = 3;
		}
		else if(dbm < -30)
		{
			currentNetDBM = 4;
		}
		else if(dbm < -10)
		{
			currentNetDBM = 5;
		}
		else
		{
			currentNetDBM = 5;
		}
    }
    
    /**
     * 手机开始振动
     * */
    public void StartPhoneVibrate(Hashtable<String, String> phoneInfo)
    {
    	if (mContext.checkCallingOrSelfPermission(android.Manifest.permission.VIBRATE)
                == PackageManager.PERMISSION_GRANTED)
    	{
    		String vibrate = phoneInfo.get("vibrate");
        	String type = phoneInfo.get("type");
        	if ("YES".equalsIgnoreCase(vibrate))
        	{
        		if (mVibrator != null){
        			mVibrator.cancel();
        		}else{
        			mVibrator = (Vibrator)PluginWrapper.getContext().getSystemService(Context.VIBRATOR_SERVICE);
        		}
        		if ("2".equalsIgnoreCase(type)){
					VibrationEffect vibrationEffect = VibrationEffect.createWaveform(new long[]{100,100,100,100}, -1);
        			mVibrator.vibrate(vibrationEffect);
        		}else{
					VibrationEffect vibrationEffect = VibrationEffect.createWaveform(new long[]{100,100,100,1000}, -1);
        			mVibrator.vibrate(vibrationEffect);
        		}
        	}
    	}
    }
    
    /**
	 * 获取WIFI信号
	 * @return
	 */
	public float getWIFILevel()
    {    
		WifiManager wifiManager = (WifiManager) PluginWrapper.getContext().getApplicationContext()
				.getSystemService(Context.WIFI_SERVICE);
		WifiInfo wifiInfo = wifiManager.getConnectionInfo();
		if (wifiInfo.getBSSID() == null) {
			return 0;
		} else {
			int level = WifiManager.calculateSignalLevel(wifiInfo.getRssi(), 3);
			return level;
		}
    }
	/**
	 * 获取设备名称（型号）
	 * @return
	 */
	public String getDeviceName()
	{
		String deviceName;
		
		deviceName = Build.MODEL;
		
		if(deviceName == null || "".equalsIgnoreCase(deviceName))
		{
			deviceName = "Device";
		}
		
		return deviceName;
	}
	
	/**
	 * 获取设备名称（型号）
	 * @return
	 */
	public String getDeviceType()
	{
		String deviceType = "android";
		
		return deviceType;
	}
	
	/**
	 * 获取手机内网IP地址
	 * @return
	 * */
	public String getLocalIpAddress() {
		try 
		{
			for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en.hasMoreElements();){
				NetworkInterface intf = en.nextElement();
				for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses();enumIpAddr.hasMoreElements();) {
					InetAddress inetAddress = enumIpAddr.nextElement();
					if (!inetAddress.isLoopbackAddress()
						//&& InetAddressUtils.isIPv4Address(inetAddress.getHostAddress())){
							&& inetAddress instanceof Inet4Address){
						ipAndregion = inetAddress.getHostAddress().toString();
						return ipAndregion;
					}
				}
			}
		}
		catch(SocketException ex)
		{
			Log.e(LOG_TAG, ex.toString());
		}
	
		return ipAndregion; 
	}
	/**
	 * 获取手机外网IP地址
	 * @return
	 * */
	public String getNetIp() {

		try {
			String address = "http://ip.taobao.com/service/getIpInfo.php?ip=myip";
			Request request = new Request.Builder().url(address).post(null).build();
			Response response = HttpsClientUtil.getClient().newCall(request).execute();
			if (response.isSuccessful()){
				String result = response.body().string();
				JSONObject jsonObject = new JSONObject(result);
				String code = jsonObject.getString("code");
				if (code.equals("0"))
				{
					JSONObject data = jsonObject.getJSONObject("data");
//					IP = data.getString("ip") + "(" + data.getString("country")
//					+ data.getString("area") + "区"
//					+ data.getString("region") + data.getString("city")
//					+ data.getString("isp") + ")";
					ipAndregion = data.getString("ip") + "("
							+ data.getString("region") + ")["
							+ getSimType()
							+ "]";
					Log.e("提示", "您的IP地址和省份是：" + ipAndregion);
				}
				else
				{
					Log.e("提示", "IP接口异常，无法获取IP地址！");
				}
			} else {
				Log.e("提示", "网络连接异常，无法获取IP地址！");
			}
			response.body().close();
		} catch (IOException e) {
			Log.e("提示", "获取IP地址时出现异常，异常信息是：" + e.toString());
		} catch (JSONException e) {
			Log.e("提示", "获取IP地址时出现异常，异常信息是：" + e.toString());
		}
		return ipAndregion;
    }
	/**
	 * 获取mac地址
	 * @return
	 */
	public String getMacAddress() 
	{  
		String macaddr = "";
		
		try
		{
			//((TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE)).getDeviceId();	
			// 当wifi关闭时，不能取得wifi的mac，3g的情况没有测试，但是如果3g关闭的话，是不是也取得不了3g的mac呢？所以这里直接返回imei
			TelephonyManager tm = (TelephonyManager) PluginWrapper.getContext().getSystemService(Context.TELEPHONY_SERVICE);
			macaddr = tm.getDeviceId();
		}
		catch(Exception e)
		{
			e.printStackTrace();
			macaddr = "";
		}
		
		if("".equals(macaddr) || macaddr == null)
		{
			try
			{
				@SuppressWarnings("deprecation")
				String androidId = System.getString(PluginWrapper.getContext().getContentResolver(), System.ANDROID_ID);
				macaddr = androidId;
			}
			catch (Exception e)
			{
				e.printStackTrace();
				macaddr = "";
			}
		}
		
		return macaddr;
    }  
	
    /**
     * 获取设备IMEI
     * @return
     */
    public String getDeviceIMEI()
    {
    	String imei = null;
		TelephonyManager tm = null;
		try
		{
			tm = (TelephonyManager) PluginWrapper.getContext().getSystemService(Context.TELEPHONY_SERVICE);
			imei = tm.getDeviceId();
		}
		catch (Exception e)
		{
			e.printStackTrace();
			tm = null;
		}

    	if(imei == null)
    	{
    		imei = getMacAddress();
    	}
    	
    	return imei;
    }
    
    /**
     * 获取设备IMSI
     * @return
     */
    public String getDeviceIMSI()
    {
    	String imsi = null;

    	try
		{
			TelephonyManager tm = (TelephonyManager)PluginWrapper.getContext().getSystemService(Context.TELEPHONY_SERVICE);

			imsi = tm.getSubscriberId();
		}
		catch (Exception e)
		{
			e.printStackTrace();
			imsi = null;
		}

    	
    	if(imsi == null)
    	{
    		imsi = "";
    	}
    	
    	return imsi;
    }
    
    /**
     * 获取设备号码
     * @return
     */
    public String getTelNumber()
    {
    	String telNumber = null;
    	try
		{
			TelephonyManager tm = (TelephonyManager)PluginWrapper.getContext().getSystemService(Context.TELEPHONY_SERVICE);

			telNumber = tm.getLine1Number();
		}
		catch (Exception e)
		{
			e.printStackTrace();
			telNumber = null;
		}

    	
    	if(telNumber == null)
    	{
    		telNumber = "";
    	}
    	else
    	{
    		if (telNumber.length() > 11){
    			telNumber = telNumber.replace("+86", "");
    		}
    	}
    	
    	return telNumber;
    }
    
    /**
     * 获取设备sim卡类型
     * 1代表移动，2代表联通，3代表电信
     * @return修改于2015.10.30
     */
    public String getSimType()
    {  	
    	String imsi = getDeviceIMSI();
    	String simType = "";
    	
    	if(imsi!=null)
    	{
    		if(imsi.startsWith("46000") || imsi.startsWith("46002") 
    				|| imsi.startsWith("46007")
    				|| imsi.startsWith("46020"))
    		{
    			simType = "1";
    		}
    		else if(imsi.startsWith("46001")|| imsi.startsWith("46006"))
    		{
    			simType = "2";
    		}
    		else if(imsi.startsWith("46003")|| imsi.startsWith("46005")
    				|| imsi.startsWith("46011"))
    		{
    			simType = "3";
    		}
    		else 
    		{
				simType = "";
			}
    	}
    	
    	return simType;
    }
    
    /**
     * 获取sim卡状态
     * 
     * @return sim卡是否可用
     */
    public boolean getSimState()
    {
    	boolean simAvailable = false;
    	try
		{
			TelephonyManager tm = (TelephonyManager)PluginWrapper.getContext().getSystemService(Context.TELEPHONY_SERVICE);
			int simState = tm.getSimState();

			switch (simState)
			{
				case TelephonyManager.SIM_STATE_READY:
					simAvailable = true;
					break;
				default:
					simAvailable = false;
					break;
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
			simAvailable = false;
		}

    	return simAvailable;
    }
    
    /**
	 * 获取设备电量情况
	 * @return
	 */
    public float getBatteryLevel()
    {
    	if(batteryLevel < -0.5f)
    	{
    		//初始化电池监听
    		IntentFilter intentFilter = new IntentFilter();
    		intentFilter.addAction(Intent.ACTION_BATTERY_CHANGED);
    		batteryLevel = 0;
    		PluginWrapper.getContext().registerReceiver(new BroadcastReceiver() 
    			{
    				@Override
    				public void onReceive(Context context, Intent intent)
    				{
    					String action = intent.getAction();
    					if (action.equals(Intent.ACTION_BATTERY_CHANGED)) 
    					{        
    						int level = intent.getIntExtra("level", 0);//电量
    						int scale = intent.getIntExtra("scale", 0);//最大电量
    						Log.d(LOG_TAG, level+" --- " + scale);
    						if(scale != 0)
    						{
    							batteryLevel = ((float)level) / scale;
    							if(batteryLevel < 0 )
    							{
    								batteryLevel = 0;
    							}
    							else if(batteryLevel > 1)
    							{
    								batteryLevel = 1;
    							}
    						}
    						else
    						{
    							batteryLevel = 0;
    						}
    					}
    				}
    			} , intentFilter);
    	}
    	
    	return batteryLevel;
    }
    
    public void exitApp()
    {
    	android.os.Process.killProcess(android.os.Process.myPid());
    }
    
    //**********************************************************************************
    /**
     * 获取应用环境相关信息
     */
    
    /**
	 * 获取网络状况的类别
	 * @return
	 */
	public int getReachability()  
    {    
        ConnectivityManager manager = (ConnectivityManager) PluginWrapper.getContext().getSystemService(Context.CONNECTIVITY_SERVICE);      
        NetworkInfo networkInfo = manager.getActiveNetworkInfo();
        
        Log.d(LOG_TAG, "NetworkInfo:" + (networkInfo == null));

        if (networkInfo == null || !networkInfo.isConnected())
        {
        	networkInfo = manager.getNetworkInfo(ConnectivityManager.TYPE_WIFI);
        	if (networkInfo == null)
        	{
        		return 0;
            }
        	else
            {
            	 Log.d(LOG_TAG, "networkInfo.isConnected():" + networkInfo.isConnected());
            	if(!networkInfo.isConnected())
            	{
            		return 0;
            	}
            	else
            	{
            		return 1;
            	}
            }
        }
        
        if(networkInfo.getType() == ConnectivityManager.TYPE_WIFI)
        {
        	return 1;
        }
        
        return 2;
    }
	
	/**
	 * 获取网络状态
	 * @return boolean
	 */
	public static boolean networkReachable(Context ctx) 
    {
        boolean bRet = false;
        
        try 
        {
            ConnectivityManager conn = (ConnectivityManager)ctx.getSystemService(Context.CONNECTIVITY_SERVICE);
            NetworkInfo netInfo = conn.getActiveNetworkInfo();
            bRet = (null == netInfo) ? false : netInfo.isConnected();
        } 
        catch (Exception e) 
        {
            e.printStackTrace();
        }

        return bRet;
    }
	
	/**
	 * 通过URI直接操作android系统行为
	 * 
	 * @param addr
	 */
	public void openURL(String addr)
	{
		try {
			Uri uri = Uri.parse(addr);
			PluginWrapper.getContext().startActivity(new Intent(Intent.ACTION_VIEW,uri));
		} catch (Exception e) {
			platformResult(PlatformWrapper.GET_OPEN_URL_FAILED, MsgStringConfig.msgOpenUrlFailed, e.getMessage());
		}
	} 
	
    /**
     * 判断应用是否安装
     * @param strPacketName,android安装包名
     * @return
     * 如果安装返回安装的versionCode
     * 否则返回0
     * 
     */
    public int isAppExist(String strPacketName)
    {
		PackageInfo pinfo = null;
		try 
		{
			pinfo = PluginWrapper.getContext().getPackageManager().getPackageInfo(strPacketName, 0);
			if(pinfo != null)
			{
				Log.d(LOG_TAG, "packet:" + pinfo.packageName + ", versionName:" + pinfo.versionName + ", version:" + pinfo.versionCode);
				return pinfo.versionCode;	
			}
		} catch (NameNotFoundException e) 
		{
			return 0;
		}
		return 0;
	}
    
	/**
	 * 安装应用
	 * @param strPacketName
	 * @return
	 */
	public boolean installApp(String strPacketName)
	{
		Log.d("install", Uri.parse(strPacketName).toString());
		
		Intent intent = new Intent();
		
		intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		intent.setAction(android.content.Intent.ACTION_VIEW);
		intent.setDataAndType(Uri.parse(strPacketName), "application/vnd.android.package-archive");
		
		PluginWrapper.getContext().startActivity(intent);
		
		return true;
	}	
	
    /**
     * 判断应用程序是否在运行
     * @param nBDOPID
     * @param strTicket
     * @param strPacketName
     * @param strAccount
     * @param strPassword
     * @param strDomain
     * @param nGameID
     * @param strLoginAddr
     * @param nLoginPort
     * @param strServerAddr
     * @param nServerPort
     * @param nChannel
     * @return
     */
	public boolean openApp(int nBDOPID, String strTicket, String strPacketName, String strAccount, String strPassword, String strDomain, 
		int nGameID, String strLoginAddr, int nLoginPort, String strServerAddr, int nServerPort, int nChannel)
	{	
		Intent intent = PluginWrapper.getContext().getPackageManager().getLaunchIntentForPackage(strPacketName);
		Bundle bundle = new Bundle();
		
		bundle.putInt("bdo_pid", nBDOPID);
		bundle.putString("ticket", strTicket);
		bundle.putString("account", strAccount);
		bundle.putString("password", strPassword);
		bundle.putString("domain", strDomain);
		bundle.putInt("gameid", nGameID);
		bundle.putString("login_addr", strLoginAddr);
		bundle.putInt("login_port", nLoginPort);
		bundle.putString("server_addr", strServerAddr);
		bundle.putInt("server_port", nServerPort);
		bundle.putInt("channle", nChannel);
		
		intent.putExtras(bundle);
		PluginWrapper.getContext().startActivity(intent);
		return true;
	}
	
	/**
	 * 打开另一个应用
	 * strPacketName  包名
	 * */
	public boolean openApp(String strPacketName)
	{	
		if (isAppExist(strPacketName) != 0){
			Intent intent = PluginWrapper.getContext().getPackageManager().getLaunchIntentForPackage(strPacketName);
			PluginWrapper.getContext().startActivity(intent);
			return true;
		}
		return false;
	}
	
	/** 
     * 强制帮用户打开GPS 
     * @param
     */  
    public void openGPS() 
    {
        // 转到手机设置界面，用户设置GPS
		Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
		PluginWrapper.getContext().startActivity(intent); // 设置完成后返回到原来的界面
    } 
    
	/**
	 * 获取位置经维度信息
	 * @return
	 */
	public String getUpdatingLocationPosition() 
	{
		String locationp = "";
		if(location != null)
		{
			try{
				Hashtable<String, String> positionInfo = new Hashtable<String, String>();
				String longitude = String.valueOf(location.getLongitude());
				String latitude = String.valueOf(location.getLatitude());
				String addr = location.getAddrStr();
				if (longitude != null && !"".equals(longitude)){
					positionInfo.put("longitude", longitude);
				}
				if (latitude != null && !"".equals(latitude)){
					positionInfo.put("latitude", latitude);
				}
				if (addr != null && !"".equals(addr)){
					positionInfo.put("addr", addr);
				}
				locationp = hashtableToJsonStr(positionInfo);
			} catch (Exception e) {
		        e.printStackTrace();
		        locationp = "";
		    }
		}
		return locationp;
	}
	
	/**
     * 检查权限列表
     */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	@SuppressLint("InlinedApi")
	public boolean checkSelfPermission(String permission) {
	    try {
	        Object object = PluginWrapper.getContext().getSystemService(Context.APP_OPS_SERVICE);
	        if (object == null) {
	            return false;
	        }
	        Class localClass = object.getClass();
	        Class[] arrayOfClass = new Class[3];
	        arrayOfClass[0] = Integer.TYPE;
	        arrayOfClass[1] = Integer.TYPE;
	        arrayOfClass[2] = String.class;
	        Method method = localClass.getMethod("checkOp", arrayOfClass);
	        if (method == null) {
	            return false;
	        }
	        
	        int op = 0;
	        if (mContext.checkPermission(permission, Binder.getCallingPid(),
	        		Binder.getCallingUid()) == PackageManager.PERMISSION_GRANTED) {
	            op = 2;
	        } /*else if (mContext.checkPermission(android.Manifest.permission.ACCESS_COARSE_LOCATION,
	        		Binder.getCallingPid(), Binder.getCallingUid()) == PackageManager.PERMISSION_GRANTED) {
	            op = 1;
	        } */else {
	            op = 0;
	        }

	        Object[] arrayOfObject = new Object[3];
	        arrayOfObject[0] = op;
	        arrayOfObject[1] = Integer.valueOf(Binder.getCallingUid());
	        arrayOfObject[2] = getPackageName();
	        int m = ((Integer) method.invoke(object, arrayOfObject)).intValue();
	        return m == AppOpsManager.MODE_ALLOWED;
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	    return false;
	    
//	    AppOpsManager mAppOps = (AppOpsManager) PluginWrapper.getContext().getSystemService(PluginWrapper.getContext().APP_OPS_SERVICE);  
//	    ApplicationInfo appInfo = PluginWrapper.getContext().getApplicationInfo();  
//	    String pkg = PluginWrapper.getContext().getApplicationContext().getPackageName();  
//	    int uid = appInfo.uid;
//
//	    Class appOpsClass = null;
//	    try {  
//	    	appOpsClass = Class.forName(AppOpsManager.class.getName());  
//	    	Method checkOpNoThrowMethod = appOpsClass.getMethod("checkOpNoThrow", Integer.TYPE, Integer.TYPE,  
//                 String.class);  
//	    	Field opPostNotificationValue = appOpsClass.getDeclaredField("OP_GPS");  
//  
//	    	int value = (Integer) opPostNotificationValue.get(Integer.class);  
//	    	return ((Integer) checkOpNoThrowMethod.invoke(mAppOps, value, uid, pkg) == AppOpsManager.MODE_ALLOWED);  
//  
//	    } catch (Exception e) {  
//	    	e.printStackTrace();  
//	    }   
//	    return false;
	}
	/**
	 * <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
	 * <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
	 * 开始上传位置信息
	 */
	public void startUpdatingLocation() 
	{
		LocationManager lm = (LocationManager) PluginWrapper.getContext().getSystemService(Context.LOCATION_SERVICE);
        boolean ok = lm.isProviderEnabled(LocationManager.GPS_PROVIDER);
        if (ok){
        	//showToast("开启了GPS定位服务");
        	//检测定位权限是否开启
            if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)){
            	//showToast("开启了定位权限");
            } else {
            	//showToast("未开启定位权限");
            	platformResult(PlatformWrapper.LOCATION_FAIL, MsgStringConfig.msgLocationFail, "");
            	return;
            }
        }else {
        	//showToast("未开启GPS定位服务");
        	platformResult(PlatformWrapper.LOCATION_FAIL, "未开启GPS定位服务", "");
        	return;
        }
        
		((Activity)PluginWrapper.getContext()).runOnUiThread(new Runnable()
		{
			public void run()
			{
				try {
					mLocationClient = new LocationClient(PluginWrapper.getContext());
					myListener = new BDLocationListener()
					{
						@Override
						public void onConnectHotSpotMessage(String arg0,
								int arg1) {
							
						}

						@Override
						public void onReceiveLocation(BDLocation mlocation) {
							//获取定位结果
							setLocation(mlocation);
							if (location != null) {
								if (location.getLocType() == BDLocation.TypeGpsLocation
									|| location.getLocType() == BDLocation.TypeNetWorkLocation
									|| location.getLocType() == BDLocation.TypeOffLineLocation){
									// GPS定位结果
									// 网络定位结果
									// 离线定位结果
									platformResult(PlatformWrapper.LOCATION_SUCCESS, MsgStringConfig.msgLocationSuccess, getUpdatingLocationPosition());
									ReleaseLocation();
								}else{
									//定位失败
									platformResult(PlatformWrapper.LOCATION_FAIL, MsgStringConfig.msgLocationFail, "");
									ReleaseLocation();
								}
							} else {
								//定位失败
								platformResult(PlatformWrapper.LOCATION_FAIL, MsgStringConfig.msgLocationFail, "");
								ReleaseLocation();
							}
						}
					};
					LocationClientOption option = new LocationClientOption();
					option.setLocationMode(LocationMode.Hight_Accuracy);//定位模式，高精度
					option.setCoorType("bd09ll");//bd09ll：百度经纬度坐标
					option.setScanSpan(0);//即仅定位一次
					option.setIsNeedAddress(true);//是否需要地址信息
					option.setOpenGps(true);//是否使用gps
					mLocationClient.setLocOption(option);
				    //声明LocationClient类
				    mLocationClient.registerLocationListener(myListener);
				    mLocationClient.start();
				} catch (Exception e) {
			        e.printStackTrace();
			        //定位失败
					platformResult(PlatformWrapper.LOCATION_FAIL, MsgStringConfig.msgLocationFail, "");
					ReleaseLocation();
			    }
			}
		});
	}  
	
	private void ReleaseLocation() 
	{
		if (location != null)
			location = null;
		if (myListener != null)
			myListener = null;
		if (mLocationClient != null) {
			mLocationClient.stop();
			mLocationClient = null;
		}
	}
	
	/**
	 * 设置位置信息
	 * @param newLoc
	 */
	public synchronized void setLocation(BDLocation newLoc) 
	{
		Log.d(LOG_TAG, "setLocation : " + newLoc);
		
		if(newLoc != null)
		{
			location = newLoc;
		}
	}
	
	/**
	 * 获取应用包名
	 * 
	 * @return
	 */
	public String getPackageName()
	{
		String packageName = "";
		
		packageName = PluginWrapper.getContext().getPackageName();
		
		if(packageName == null || packageName == "")
		{
			Log.e(LOG_TAG, "getPackageName error !!!");
		}
		
		return packageName;
	}
	
	/**
	 * 获取应用版本信息
	 * @return
	 */
	public String getVersionName()
	{
		String versionName = "";

		try 
		{
			String packageName = getPackageName();
			PackageManager pm = PluginWrapper.getContext().getPackageManager();
			PackageInfo packageInfo = pm.getPackageInfo(packageName, 0);
			versionName = packageInfo.versionName;
		}
		catch (Exception e)
		{
			e.printStackTrace();
			versionName = "";
		}
		
		return versionName;
	}
	
	/**
	 * 获取应用Version Code
	 * @return
	 */
	public String getVersionCode()
	{
		String versionCode = "";
		
		String packageName = getPackageName();
		
		PackageManager pm = PluginWrapper.getContext().getPackageManager();
		
		try 
		{
			PackageInfo packageInfo = pm.getPackageInfo(packageName, 0);
			
			versionCode = String.valueOf(packageInfo.versionCode);
			
		} 
		catch (NameNotFoundException e) 
		{
			Log.e(LOG_TAG, "getVersionName error !!!");
		}
		
		return versionCode;
	}
	
	/**
	 * 获取应用程序名称
	 * @return
	 */
	public String getApplicationName()
	{
		String applicationName = "";
		ApplicationInfo applicationInfo = null; 
		PackageManager pm = PluginWrapper.getContext().getPackageManager();
		try 
		{
			applicationInfo = pm.getApplicationInfo(getPackageName(), 0);
		} 
		catch (Exception e) 
		{
			e.printStackTrace();
		}
		
		applicationName = (String) pm.getApplicationLabel(applicationInfo);
		
		return applicationName;
	}
	
	/**
	 * 获取plist里面配置的商品列表的PacketName，即ChannelName
	 * @return
	 */
	public String getChannelName()
	{
		String channelName = "";
		if(SessionWrapper.gameInfo != null){
			String PacketName = SessionWrapper.gameInfo.get("PacketName");
			if(PacketName != null && !"".equals(PacketName)){
				channelName = PacketName;
			}else{
				channelName = "";
			}
		}else{
			channelName = "";
		}
		
		
		return channelName;
	}
	
	/**
	 * 显示结果toast
	 * @param message
	 */
	public void showToast(final String message)
	{
		((Activity) mContext).runOnUiThread(new Runnable() 
		{
			@Override
			public void run() 
			{
				Toast.makeText(PluginWrapper.getContext(), message, Toast.LENGTH_SHORT).show();
			}
		});
	}

	/**
	 * 获取剪切板内容，并返回给客户端
	 * */
	public void getClipBoardContent()  
    {
    	((Activity) mContext).runOnUiThread(new Runnable() {
            @Override
            public void run() {
            	ClipboardManager clipboardManager = (ClipboardManager)mContext.getSystemService(Context.CLIPBOARD_SERVICE);  
                if(clipboardManager != null)  
                {  
                	if(clipboardManager.getPrimaryClip() != null)  
                    {
						CharSequence text = clipboardManager.getPrimaryClip().getItemAt(0).getText();
                        String tempStr = "";
                        if (text != null){
                        	tempStr = text.toString();
						}
                        PlatformWP.platformResult(PlatformWrapper.GET_CLIPBOARD_SUCCESS, MsgStringConfig.msgGetClipBoardSuccess, tempStr);
                    }
                }
            }
    	});
    }  
	//******************************************************************************
	/**
	 * 附加功能
	 */
	public void copyToClipboard(final String text)
	{
		((Activity) mContext).runOnUiThread(new Runnable()
        {
			@SuppressLint("NewApi")
			@Override
			public void run()
			{
				if((Build.VERSION.SDK_INT < 11))//if((android.os.Build.VERSION.SDK_INT < 11))
				{
					BaseUtil.copyText(PluginWrapper.getContext(), text);
				}
				else
				{
					ClipboardManager clipboard = (ClipboardManager)PluginWrapper.getContext().getSystemService(Context.CLIPBOARD_SERVICE);
					ClipData textCd = ClipData.newPlainText("text", text);
					clipboard.setPrimaryClip(textCd);
					
					if(text.length() > 0)
					{
						if(clipboard.hasPrimaryClip())
						{
							String msg = MsgStringConfig.msgCopyUidSuccess;
//							if (languageinfo.get("msgCopyUidSuccess") != null){
//								msg = languageinfo.get("msgCopyUidSuccess");
//							}
							showToast(msg);
						}
						else
						{
							String msg = MsgStringConfig.msgCopyUidFail;
//							if (languageinfo.get("msgCopyUidFail") != null){
//								msg = languageinfo.get("msgCopyUidFail");
//							}
							showToast(msg);
						}
					}
				}
			}
		});
	}
	
	/**
	 * 保存图片至相册
	 * */
	public static File saveImage(Bitmap bmp) {
	    File appDir = new File(Environment.getExternalStoragePublicDirectory("DIRECTORY_DCIM"), "");
	    if (!appDir.exists()) {
	        appDir.mkdir();
	    }
	    String fileName = new Date().getTime() + ".jpg";
	    File file = new File(appDir, fileName);
	    try {
	        FileOutputStream fos = new FileOutputStream(file);
	        bmp.compress(CompressFormat.JPEG, 100, fos);
	        fos.flush();
	        fos.close();
	    } catch (FileNotFoundException e) {
	        e.printStackTrace();
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	    
	    return file;
	}
	
	public void loadImageFinished(String imagepath)
	{
		String imgurl = "";
		Bitmap bmp = null;
		InputStream is =  null;
		
		try{
			if (imagepath.startsWith("file:///data")){//截图
				imgurl = imagepath.substring("file://".length(), imagepath.length());
				
				is = new FileInputStream(new File(imgurl));
				bmp = BitmapFactory.decodeStream(is);
				File file = saveImage(bmp);
				String uriStr = file.getAbsolutePath();
		        if(uriStr == null)
		        {
					PlatformWP.platformResult(PlatformWrapper.SAVEIMG_FAIL, MsgStringConfig.msgCopyIMGFail, "");
		        }
		        else
		        {
		        	Intent intent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
		        	Uri uri = getPhotoUri(new File(uriStr));
					if (Build.VERSION.SDK_INT >= 24) {
						intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION); //添加这一句表示对目标应用临时授权该Uri所代表的文件
					}
		        	intent.setData(uri);     
		        	mContext.sendBroadcast(intent);
					PlatformWP.platformResult(PlatformWrapper.SAVEIMG_SUCCESS, MsgStringConfig.msgCopyIMGSuccess, "");
		        }
			}else if (imagepath.startsWith("file://res")){//本地图片
				AssetManager assetManager = mContext.getAssets();
				imgurl = imagepath.substring("file://".length(), imagepath.length());
				
				is = assetManager.open(imgurl);
				bmp = BitmapFactory.decodeStream(is);
				File file = saveImage(bmp);
				String uriStr = file.getAbsolutePath();
		        if(uriStr == null)
		        {
					PlatformWP.platformResult(PlatformWrapper.SAVEIMG_FAIL, MsgStringConfig.msgCopyIMGFail, "");
		        }
		        else
		        {
		        	Intent intent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);     
		        	Uri uri = getPhotoUri(new File(uriStr));
					if (Build.VERSION.SDK_INT >= 24) {
						intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION); //添加这一句表示对目标应用临时授权该Uri所代表的文件
					}
		        	intent.setData(uri);     
		        	mContext.sendBroadcast(intent);
					PlatformWP.platformResult(PlatformWrapper.SAVEIMG_SUCCESS, MsgStringConfig.msgCopyIMGSuccess, "");
		        }
			}
		}catch (Exception e) {
			e.printStackTrace();
			PlatformWP.platformResult(PlatformWrapper.SAVEIMG_FAIL, MsgStringConfig.msgCopyIMGFail, "");
		} finally{
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
	
	/**
	 * 拨打电话
	 * */
	@SuppressLint("MissingPermission")
	public void callPhone(String phonenum){
		
		try {
			if(!"".equals(phonenum) && phonenum != null){  
	            Intent intent = new Intent(Intent.ACTION_CALL, Uri.parse("tel:" + phonenum));  
	            PluginWrapper.getContext().startActivity(intent);  
	        }else{
	        	Log.d(LOG_TAG, "phonenumber is wrong");
	        }
			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * 获取AndroidManifest.xml中meta-data的name对应的value
	 * */
	public static String getMetaName(String MetaName){
        String result = "";
        if ("ChannelName".equals(MetaName)){
        	result = getMetaInfoChannel();
        	if (!"".equals(result)){
        		return result;
        	}
        }
    	ApplicationInfo appInfo = null;
		try {
			appInfo = PluginWrapper.getContext().getPackageManager().getApplicationInfo(
					PluginWrapper.getContext().getPackageName(), 
					PackageManager.GET_META_DATA);
			if (appInfo.metaData != null) {
				result = appInfo.metaData.get(MetaName).toString();
			}
		} catch (NameNotFoundException e) {
			e.printStackTrace();
		}
		return result;
		
	}
	
	/**
     * 获取美团插件里的渠道名
     * @param
     * @return
     */
    public static String getMetaInfoChannel() {
    	String channel = "";
		final ChannelInfo channelInfo = WalleChannelReader.getChannelInfo(PluginWrapper.getContext().getApplicationContext());
		if (channelInfo != null) {
			channel = channelInfo.getChannel();
			if (channel != null) {
				Log.d("channelInfo channel", channel);
				return channel;
			}
		}
        return channel;
    }
	
	/**
	 * 应用平台相关,上传图像
	 */
	//*******************************上传图像start*****************************************
	public static String strDirPath = null;
	public static String strFilePath = null;
	
	public static Uri photoUri = null;
	public static String imgUrl = null;
	
	public static final String IMAGE_UNSPECIFIED = "image/*";
	public static boolean isImageProcess = false;
	public static boolean isAutoUpload = true;
	
	public static final int NONE           = 0;             // 返回
    public static final int PHOTOHRAPH     = 10001;         // 拍照  
    public static final int PHOTOZOOM      = 10002;         // 缩放  
    public static final int PHOTORESOULT   = 10003;         // 结果 
    
	private final static String LOG_TAG = "platformwp";
	private static boolean bDebug = false;
	
	private static Context mContext ;
	public static  PlatformWP mPlatformwp;
	
    public PlatformWP(Context context) 
	{
		mContext = context;
		mPlatformwp = this;
	}
	
	public void configDeveloperInfo()
	{
		//((ActivityResultListener)mContext).setActivityResultDelegate(mPlatformwp);
	}
	
	@Override
	public String getSDKVersion() 
	{
		return "1.0.0";
	}

	/**
	 * 3.0.0：添加GPS功能
	 * 4.0.0：添加娃娃机功能
	 * 4.0.1:
	 * 添加获取是否开启推送权限接口getIsPushOn
	 * 添加跳转到应用通知设置界面
	 * 4.0.2:
	 * 添加对定位服务的判断
	 * 4.0.3:添加openinstall安装参数
	 * 4.0.4:针对掌心麻将圈4.0.3已出的包做处理，当时没有在工程luaj中添加相应函数
	 * 5.0.0:上传名片，initheadface透传裁剪区域参数。
	 * 6.0.0:banner广告渲染成功后，返回宽高到客户端。
	 * 6.1.0:广告插件添加新接口showAds
	 * 6.1.1:1.插屏广告增加关闭状态；2.广告插件初始化对象使用context.
	 * 6.1.2:广告插件增加信息流广告，广告回调增加json参数返回。
	 * 6.1.3:关闭信息流广告增加判断。
	 * 6.1.4:信息流广告处理优化更新。
	 * 6.1.5:增加信息流自渲染广告。
	 * */
	@Override
	public String getPluginVersion() 
	{
		return "6.1.5";
	}

	@Override
	public void setDebugMode(boolean debug) 
	{
		bDebug = debug;
	}
	
	public void setRunEnv(int env)
	{
		PlatformWrapper.setRunEnv(env);
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
	
	public static PlatformWP getInstance()
	{
		if(mPlatformwp == null)
		{
			mPlatformwp = new PlatformWP(mContext);
		}
		
		return mPlatformwp;
	}
	
	/**
	 * 初始化用户头像
	 * @param path
	 */
	private static Hashtable<String, String> headfaceinfo = null;
	private static String headFaceCloudUrl = "";
	private static String modifyUserInfoUrl = "";
	private static String extraParam = "";
	private static int rectWidth = -1;
	private static int rectHeight = -1;
	public void initHeadFace(Hashtable<String, String> faceReqParams)
	{
		headfaceinfo = new Hashtable<String, String>(faceReqParams);
		headFaceCloudUrl = headfaceinfo.get("UpLoadURL");
		modifyUserInfoUrl = headfaceinfo.get("ModifyUserInfoUrl");
		extraParam = headfaceinfo.get("extraParam");
		if (headfaceinfo.get("rectWidth") != null){
			rectWidth = Integer.valueOf(headfaceinfo.get("rectWidth"));
		}
		if (headfaceinfo.get("rectHeight") != null){
			rectHeight = Integer.valueOf(headfaceinfo.get("rectHeight"));
		}
		initHeadFace();
	}
	public void initHeadFace()
	{
		if(getSDState()){
		
			//strDirPath = mContext.getFilesDir().getPath().toString() + "/";
			strDirPath = /*Environment.getExternalStorageDirectory()*/mContext.getExternalCacheDir().getPath() + "/com.bdo/";
		}else{
			((Activity)PluginWrapper.getContext()).runOnUiThread(new Runnable(){
					@Override
					public void run()
					{
						String msg = MsgStringConfig.msgInsertSdCard;
//						if (languageinfo.get("msgInsertSdCard") != null){
//							msg = languageinfo.get("msgInsertSdCard");
//						}
						Toast.makeText(PluginWrapper.getContext(), msg, Toast.LENGTH_SHORT).show();
					}
				});
			
			return;
		}
		
		//设置上传头像代理
		//((ActivityResultListener)mContext).setActivityResultDelegate(mPlatformwp);
		
		strFilePath = null;
		
		File destDir = new File(strDirPath);
		if (!destDir.exists()) 
		{
			Log.i("platform_wp", "strDirPath is not exists1");
			destDir.mkdirs();
		}
		
		if (!destDir.exists()) 
		{
			Log.i("platform_wp", "strDirPath is not exists2");
			destDir.mkdirs();
		}
		
		((Activity)PluginWrapper.getContext()).runOnUiThread(new Runnable(){
		
			@SuppressLint("UnsupportedChromeOsCameraSystemFeature")
			public void run(){

			    if(PluginWrapper.getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA))
			    {
			        // 摄像头存在 
					Builder dialog = new AlertDialog.Builder(PluginWrapper.getContext());
					//--dialog.setTitle("选择头像");
					//--String item[] = {"相机拍摄", "手机相册" , "取消"}; 

					String title = MsgStringConfig.msgInitHeadTitle;
					String Camera = MsgStringConfig.msgInitHeadItemsCamera;
					String Photograph = MsgStringConfig.msgInitHeadItemsPhotograph;
					String Cancel = MsgStringConfig.msgInitHeadItemsCancel;
//					if (languageinfo.get("msgInitHeadTitle") != null){
//						title = languageinfo.get("msgInitHeadTitle");
//					}
//					if (languageinfo.get("msgInitHeadItemsCamera") != null){
//						Camera = languageinfo.get("msgInitHeadItemsCamera");
//					}
//					if (languageinfo.get("msgInitHeadItemsPhotograph") != null){
//						Photograph = languageinfo.get("msgInitHeadItemsPhotograph");
//					}
//					if (languageinfo.get("msgInitHeadItemsCancel") != null){
//						Cancel = languageinfo.get("msgInitHeadItemsCancel");
//					}

					dialog.setTitle(title);		
					String item[] = {Camera, Photograph , Cancel}; 
					dialog.setItems(item, new OnClickListener() 
					{
						@Override
						public void onClick(DialogInterface dialog, int which)
						{
							Log.i("onClick", "dialog: "+dialog.toString()+" which: "+which);
							
							switch(which)
							{
								case 0://camera
								{
									((Activity)PluginWrapper.getContext()).runOnUiThread(new Runnable() 
									{
										@Override
										public void run() 
										{
											//设置上传头像代理
											((ActivityResultListener)mContext).setActivityResultDelegate(mPlatformwp);
											
											Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
											strFilePath = strDirPath + String.valueOf(java.lang.System.currentTimeMillis())+".png";
											try
											{
												BaseUtil.writeFileToSD(strDirPath, "path.txt", strFilePath);
											}
											catch (IOException e)
											{
												e.printStackTrace();
											}
											Uri imageUri = getPhotoUri(new File(strFilePath));
											if (Build.VERSION.SDK_INT >= 24) {
												intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION); //添加这一句表示对目标应用临时授权该Uri所代表的文件
											}
											intent.putExtra(MediaStore.EXTRA_OUTPUT, imageUri);
											((Activity)PluginWrapper.getContext()).startActivityForResult(intent, PHOTOHRAPH);
										}
									} );
									break;
								}
								case 1://gallery
								{
									((Activity)PluginWrapper.getContext()).runOnUiThread(new Runnable() 
									{
										@Override
										public void run() 
										{
											//设置上传头像代理
											((ActivityResultListener)mContext).setActivityResultDelegate(mPlatformwp);
											
											Intent intent = new Intent(Intent.ACTION_PICK, null);
											intent.setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, IMAGE_UNSPECIFIED);    
											((Activity)PluginWrapper.getContext()).startActivityForResult(intent, PHOTOZOOM);
										}
									});
									break;
								}
								case 2://cancel
								{
									break;
								}
							}
							
						}
					});
					
					dialog.show();
			    }
			    
			    else
			    { 
			        // 摄像头不存在
			    	((Activity)PluginWrapper.getContext()).runOnUiThread(new Runnable() 
			    	{
						@Override
						public void run() 
						{
							Intent intent = new Intent(Intent.ACTION_PICK, null);    
							intent.setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, IMAGE_UNSPECIFIED);    
							((Activity)PluginWrapper.getContext()).startActivityForResult(intent, PHOTOZOOM);
						}
					});
			    }
			    
			}
		});
	}

	/**
	 * 获取系统相机拍照后的文件
	 * android7.0->24
	 * */
	public Uri getPhotoUri(File file){
		Uri imageUri = Uri.fromFile(file);
		if (Build.VERSION.SDK_INT >= 24){
			imageUri = FileProvider.getUriForFile(mContext, PluginWrapper.getContext().getPackageName() + ".fileprovider", file);//通过FileProvider创建一个content类型的Uri
		}
		return imageUri;
	}
	
	@SuppressWarnings("unused")
	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) 
	{

		// 返回
		if (resultCode == NONE) 
		{
			PlatformWP.isImageProcess = true;
			return;
		}

		// 拍照
		else if (requestCode == PHOTOHRAPH) 
		{
			PlatformWP.isImageProcess = true;
        	
        	if(PlatformWP.strFilePath == null || "".equalsIgnoreCase(PlatformWP.strFilePath))
        	{
        		try 
        		{
        			PlatformWP.strFilePath = BaseUtil.readFile(strDirPath, "path.txt");
				} 
        		catch (IOException e) 
        		{
        			PlatformWP.platformResult(PlatformWrapper.INIT_HEADFACE_FAIL, MsgStringConfig.msgInitHeadfaceFail, "");
					e.printStackTrace();
					return;
				}
        	}
        	
			File picture = new File(PlatformWP.strFilePath);

			if (picture != null && picture.exists()) 
			{
				photoUri = getPhotoUri(picture);
				new Handler().postDelayed(new Runnable() 
				{
					public void run() {
						startPhotoZoom(photoUri);
					}
				}, 100);
			} 
			else 
			{
				PlatformWP.platformResult(PlatformWrapper.INIT_HEADFACE_FAIL, MsgStringConfig.msgInitHeadfaceFail, "");
			}
		}

		// 读取相册缩放图片
		else if (requestCode == PHOTOZOOM) 
		{
			PlatformWP.isImageProcess = true;

			photoUri = data.getData();
			new Handler().postDelayed(new Runnable() 
			{
				public void run() {
					startPhotoZoom(photoUri);
				}
			}, 100);
		} 
		else if (requestCode == PHOTORESOULT) 
		{
			isImageProcess = true;
			//Bundle extras = data.getExtras();
			File cutFile = new File(/*Environment.getExternalStorageDirectory()*/mContext.getExternalCacheDir() + File.separator + "newPhoto.jpg");
			if (cutFile != null) 
			{
				try
				{
					FileInputStream is = new FileInputStream(cutFile);
					Bitmap photo = BitmapFactory.decodeStream(is);//extras.getParcelable("data");
				
					if (null == photo)
					{
						PlatformWP.strDirPath = null;
						PlatformWP.platformResult(PlatformWrapper.INIT_HEADFACE_FAIL, MsgStringConfig.msgInitHeadfaceFail, "");						
					}
					else if (saveFile(photo)) 
					{
						new Handler().postDelayed(new Runnable() 
						{
							public void run() {
								PlatformWP.platformResult(PlatformWrapper.INIT_HEADFACE_SUCCESS, MsgStringConfig.msgInitHeadfaceSuccess, PlatformWP.strFilePath);
							}
						}, 1000);//黑屏延迟处理
						
							//自动上传图像
						if(isAutoUpload){
							PlatformWP.uploadHeadFace();
						}
					} 
					else 
					{
						PlatformWP.strDirPath = null;
						PlatformWP.platformResult(PlatformWrapper.INIT_HEADFACE_FAIL, MsgStringConfig.msgInitHeadfaceFail, "");
					}
				}
				catch(Exception e)
				{
					PlatformWP.strDirPath = null;
					PlatformWP.platformResult(PlatformWrapper.INIT_HEADFACE_FAIL, MsgStringConfig.msgInitHeadfaceFail, "");
				}
			} 
			else
			{
				PlatformWP.strDirPath = null;
				PlatformWP.platformResult(PlatformWrapper.INIT_HEADFACE_FAIL, MsgStringConfig.msgInitHeadfaceFail, "");
				Log.i("tag", "extra is NULL");
			}
		}
	}
	
	private void startPhotoZoom(Uri uri) 
	{
		Intent intent = new Intent("com.android.camera.action.CROP");
		if (Build.VERSION.SDK_INT >= 24) {
			intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION); //添加这一句表示对目标应用临时授权该Uri所代表的文件
		}
		intent.setDataAndType(uri, IMAGE_UNSPECIFIED);
		intent.putExtra("crop", "true");
		// aspectX aspectY 是宽高的比例
		intent.putExtra("aspectX", 1);
		intent.putExtra("aspectY", 1);
		if (rectWidth < 0 && rectHeight < 0){//使用默认裁剪宽高
			// outputX outputY 是裁剪图片宽高
			intent.putExtra("outputX", 100);
			intent.putExtra("outputY", 100);
		}
		else if (rectWidth > 0 &&  rectHeight > 0){//使用设定的裁剪宽高
			// outputX outputY 是裁剪图片宽高
			intent.putExtra("outputX", rectWidth);
			intent.putExtra("outputY", rectHeight);
		}else {//不裁剪
			intent.putExtra("crop", "false");
		}
		intent.putExtra("return-data", true);
		
		((ActivityResultListener)mContext).setActivityResultDelegate(mPlatformwp);

		// 注意sdcard读写权限，也可以使用其他目录Environment.getExternalStorageDirectory()
		File cutFile = new File( mContext.getExternalCacheDir() + File.separator + "newPhoto.jpg");
        if (cutFile.exists() == false) {
            try {
                cutFile.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        // 解决方法
        intent.putExtra("output", Uri.fromFile(cutFile));  // 指定目标文件
        intent.putExtra("outputFormat", "JPEG"); //输出文件格式

		((Activity) (PluginWrapper.getContext())).startActivityForResult(intent, PHOTORESOULT);
	}

	public boolean saveFile(Bitmap bm) 
	{
		boolean ret = false;

		if (PlatformWP.strFilePath == null) 
		{
			PlatformWP.strFilePath = PlatformWP.strDirPath + String.valueOf(java.lang.System.currentTimeMillis()) + ".png";
		}

		File myCaptureFile = new File(PlatformWP.strFilePath);
		if (myCaptureFile.exists())
		{
			myCaptureFile.delete();
		}
		try 
		{
			myCaptureFile.createNewFile();
		}
		catch (IOException e1) 
		{
			e1.printStackTrace();
		}

		BufferedOutputStream bos = null;
		try 
		{
			bos = new BufferedOutputStream(new FileOutputStream(myCaptureFile));
			bm.compress(Bitmap.CompressFormat.PNG, 80, bos);
//			bos.flush();
//			bos.close();
			ret = true;
		} 
		catch (Exception e) 
		{
			e.printStackTrace();
			Log.i("tag", "compress error");
		} 
		finally 
		{
			try 
			{
				BaseUtil.deleteFile(PlatformWP.strDirPath, "path.txt");
				bos.flush();
				bos.close();
			} 
			catch (IOException e) 
			{
				e.printStackTrace();
			}
		}
		return ret;
	}
	
	/**
	 * 上传头像到服务器
	 * @return
	 */
	public static String uploadHeadFace()
	{	
		String filename = strFilePath;
		final String url_path = "";
		final File file = new File(filename);
		
		new Thread(new Runnable()
		{
			@Override
			public void run()
			{
				if ("".equalsIgnoreCase(extraParam) || extraParam == null){
					if(!networkReachable())
					{
						platformResult(PlatformWrapper.UPLOAD_HEADFACE_FAIL, MsgStringConfig.msgUploadHeadfaceFail, "");
						return;
					}
					// 上传头像到云端
					String newFileName = "";
					if ("".equals(headFaceCloudUrl) || headFaceCloudUrl == null){
						newFileName = UploadUtil.uploadFile(file, URLConfig.headFaceCloudUrl);
					}else{
						newFileName = UploadUtil.uploadFile(file, headFaceCloudUrl);
					}
					
					if(newFileName != null && !"".equals(newFileName))
					{
						JSONObject json;
						try 
						{
							json = new JSONObject(newFileName);
							imgUrl = json.getString("imgUrl");
							
							Log.i("tag","start uploadHeadFaceDidFinish ok");
						} 
						catch (JSONException e) 
						{
							e.printStackTrace();
							platformResult(PlatformWrapper.UPLOAD_HEADFACE_FAIL, MsgStringConfig.msgUploadHeadfaceFail, "");
							return;
						}
						PlatformWP.strDirPath = null;
					} else {
						platformResult(PlatformWrapper.UPLOAD_HEADFACE_FAIL, MsgStringConfig.msgUploadHeadfaceFail, "");
						return;
					}
					
					// 通知服务器修改头像url
					String url = "";
					if ("".equals(modifyUserInfoUrl) || modifyUserInfoUrl == null){
						url = PlatformWrapper.getServerURLPre();
					}else{
						url = modifyUserInfoUrl;
					}
					String pid = null;
					String ticket = null;
					try {
						pid = SessionWrapper.sessionInfo.get("pid");
						ticket = SessionWrapper.sessionInfo.get("ticket");
					} catch (Exception e1) {
						e1.printStackTrace();//没有login的情况
						platformResult(PlatformWrapper.UPLOAD_HEADFACE_FAIL, MsgStringConfig.msgUploadHeadfaceFail, "");
						return;
					}
					String face = imgUrl;
					
					if(!networkReachable())
					{
						platformResult(PlatformWrapper.UPLOAD_HEADFACE_FAIL, MsgStringConfig.msgUploadHeadfaceFail, "");
						return;
					}

					JSONObject imgResult = UploadUtil.modifyImgUrl(url, pid, ticket, face);
					
					// 回调到游戏内部
					try 
					{
						String ret = imgResult.getString("ret");
						if(ret.equalsIgnoreCase("0"))
						{
							platformResult(PlatformWrapper.UPLOAD_HEADFACE_SUCCESS, MsgStringConfig.msgUploadHeadfaceSuccess, imgUrl);
						}
						else
						{
							platformResult(PlatformWrapper.UPLOAD_HEADFACE_FAIL, MsgStringConfig.msgUploadHeadfaceFail, "");
						}
					} 
					catch (JSONException e) 
					{
						e.printStackTrace();
						platformResult(PlatformWrapper.UPLOAD_HEADFACE_FAIL, MsgStringConfig.msgUploadHeadfaceFail, "");
					}
				} else {
					if(!networkReachable())
					{
						platformResult(PlatformWrapper.UPLOAD_EXTRAPARAM_FAIL, MsgStringConfig.msgUploadExtraparamFail, "");
						return;
					}
					// 上传图片
					String newFileName = "";
					String url = "";
					try {
						JSONObject jsonObject = new JSONObject(extraParam);
						Iterator<?> iterator = jsonObject.keys();
						while (iterator.hasNext())
						{
							String key = (String) iterator.next();
							if ("".equalsIgnoreCase(url)){
								url = "?" + key + "=" + jsonObject.getString(key);
							} else {
								url = "&" + key + "=" + jsonObject.getString(key);
							}
						}
					} catch (JSONException e1) {
						e1.printStackTrace();
						platformResult(PlatformWrapper.UPLOAD_EXTRAPARAM_FAIL, MsgStringConfig.msgUploadExtraparamFail, "");
						return;
					}
					if ("".equals(headFaceCloudUrl) || headFaceCloudUrl == null){
						url = URLConfig.headFaceCloudUrl + url;
					}else{
						url = headFaceCloudUrl + url;
					}
					newFileName = UploadUtil.uploadFile(file, url);
					
					if(newFileName != null && !"".equals(newFileName))
					{
						JSONObject json;
						try 
						{
							json = new JSONObject(newFileName);
							imgUrl = json.getString("imgUrl");
							
							Log.i("tag","start uploadIMGDidFinish ok");
							platformResult(PlatformWrapper.UPLOAD_EXTRAPARAM_SUCCESS, MsgStringConfig.msgUploadExtraparamSuccess, imgUrl);
						} 
						catch (JSONException e) 
						{
							e.printStackTrace();
							platformResult(PlatformWrapper.UPLOAD_EXTRAPARAM_FAIL, MsgStringConfig.msgUploadExtraparamFail, "");
							return;
						}
						PlatformWP.strDirPath = null;
					} else {
						platformResult(PlatformWrapper.UPLOAD_EXTRAPARAM_FAIL, MsgStringConfig.msgUploadExtraparamFail, "");
						return;
					}
				}
			}
			
		}, "uploadHeadFace").start();
		
		return url_path;
	}
	
	public static void setAutoUpload(boolean flag){
		isAutoUpload = flag;
	}
	
	//111
	/**
	 * 获取SD卡状态
	 * @return
	 */
	private boolean getSDState()
	{
		return  android.os.Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState()); 
	}
	
	/**
	 * 获取网络状态
	 * @return
	 */
	private static boolean networkReachable() 
	{
		boolean bRet = false;
		
		try 
		{
			ConnectivityManager conn = (ConnectivityManager) mContext.getSystemService(Context.CONNECTIVITY_SERVICE);
			NetworkInfo netInfo = conn.getActiveNetworkInfo();
			bRet = (null == netInfo) ? false : netInfo.isConnected();
		}
		catch (Exception e) 
		{
			LogE("Fail to check network status", e);
		}
		LogD("NetWork reachable : " + bRet);
		
		return bRet;
	}
	
	/**
	 * 上传图片到服务器
	 * @return
	 */
	public static String uploadShareImg(String ImgPath)
	{
		File file = new File(ImgPath);
		String imgUrl = ""; 
		String newFileName = "";
		if ("".equals(headFaceCloudUrl) || headFaceCloudUrl == null){
			newFileName = UploadUtil.uploadFile(file, URLConfig.headFaceCloudUrl);
		}else{
			newFileName = UploadUtil.uploadFile(file, headFaceCloudUrl);
		}
		if(newFileName != null && !"".equals(newFileName))
		{
			JSONObject json;
			try 
			{
				Log.i("tag","start uploadShareImg finish");
				json = new JSONObject(newFileName);
				imgUrl = json.getString("imgUrl");
				
				Log.i("tag","start uploadShareImg ok");
			} catch (JSONException e) 
			{
				e.printStackTrace();
				Log.i("tag","start uploadShareImg error");
			}
		}
		return imgUrl;
	}
	//222
	
	/**
	 * 处理结果
	 * @param ret
	 * @param msg
	 */
	public static void platformResult(int ret, String msg, String state) 
	{
		PlatformWrapper.onPlatformResult(mPlatformwp, ret, msg, state);
		LogD("PlatformWP result : " + ret + " msg : " + msg);
	}
	//*******************************上传图像end*****************************************
	
	public static String hashtableToJsonStr( Hashtable<String, String> ht) 
	{
		String jsonresult = ""; 
	    JSONObject object = new JSONObject();
        try {  
        	
        	Enumeration<String> e2 = ht.keys(); 
			while (e2.hasMoreElements()) { 
				String key = (String) e2.nextElement(); 
				LogD(key +"---"+ht.get(key)); 
			    object.put(key, ht.get(key));
			} 

            jsonresult = object.toString();
        } catch (JSONException e) {  
            e.printStackTrace();  
        }  
        LogD("生成的json串为:"+jsonresult);
        return jsonresult;
	}
	
	public static boolean isMIUIRom(){
		String property = getSystemProperty("ro.miui.ui.version.name");
		return !TextUtils.isEmpty(property);
	}
	
	public static String getSystemProperty(String propName) {
		String line;
		BufferedReader input = null;
		try {
			Process p = Runtime.getRuntime().exec("getprop " + propName);
			input = new BufferedReader(new InputStreamReader(p.getInputStream()), 1024);
			line = input.readLine();
			input.close();
		} catch (IOException ex) {
			return null;
		} finally {
			if (input != null) {
				try {
					input.close();
				} catch (IOException e) {
				}
			}
		}
		return line;
	}
	
	/**************************************音频文件播放录制******************************************/
	public void playSound(String filePathString){
		final String filepathstr = filePathString;
		((Activity) mContext).runOnUiThread(new Runnable() 
		{
			@Override
			public void run() 
			{
				PlayerManager.getInstance().playSound(filepathstr);
			}
		});
		
	}
	
	public void stopSound() {
		((Activity) mContext).runOnUiThread(new Runnable() 
		{
			@Override
			public void run() 
			{
				PlayerManager.getInstance().stopSound();
			}
		});
		
	}
	
	public void prepareAudio(String playerID) {
		final String playerid = playerID;
		((Activity) mContext).runOnUiThread(new Runnable() 
		{
			@Override
			public void run() 
			{
				RecordManager.getInstance().prepareAudio(playerid);
			}
		});
		
	}
	
	public void voiceOver(final Hashtable<String, String> itemsInfo){
		((Activity) mContext).runOnUiThread(new Runnable() 
		{
			@Override
			public void run() 
			{
				RecordManager.getInstance().voiceOver(itemsInfo);
			}
		});
	}
	public void voiceOver(){
		((Activity) mContext).runOnUiThread(new Runnable() 
		{
			@Override
			public void run() 
			{
				RecordManager.getInstance().voiceOver();
			}
		});
		
	}
	
	public void voiceWantToCancel(){
		((Activity) mContext).runOnUiThread(new Runnable() 
		{
			@Override
			public void run() 
			{
				RecordManager.getInstance().voiceWantToCancel();
			}
		});
		
	}
	
}
