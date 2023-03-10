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
	private static String ipAndregion = "";//??????IP?????????????????????
	private static  float currentNetDBM = -1;
	private static LocationClient mLocationClient = null;
	private static BDLocationListener myListener = null;
	private static Vibrator mVibrator = null;

	//List<Hashtable<String, String>> mContactsinfos = new ArrayList<Hashtable<String, String>>();
	public static final int CONTACTRESOULT   = 110001;//???????????????????????????
	//public static Hashtable<String, String> languageinfo = null;
	public static String socialurlInfo = "";
	public static View layout = null;
	public static RelativeLayout bannerContainer = null;
	public static View nativeView = null;
	public static RelativeLayout nativeContainer = null;
    //********************************************
	/**
	 * ??????banner???
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
	 * ??????APP????????????
	 * 1.??????
	 * 2.??????
	 * */
	public int getAppOrientation() {
		int ori = 2;
		Configuration mConfiguration = mContext.getResources().getConfiguration(); //???????????????????????????
		if (mConfiguration != null) {
			ori = mConfiguration.orientation;
		}
		return ori;
	}
	/**
	 * ???????????????Url???????????????
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
	 * ?????????????????? 
	 */
	 
	 /**
	 * ????????????????????????
	 */
	 public void setSessionInfo(Hashtable<String, String> info)
	 {
		 SessionWrapper.sessionInfo = info;
	 }

	/**
	 * ????????????
	 * */
	public void PluginLog(String msg)
	{
		Log.i("PluginLog", msg);
	}
	/**
	 * ?????????????????????????????????
	 * *//*
	public void invokeResultToPlugin(Hashtable<String, String> invokeinfo)
	{
		if (languageinfo != null){
			languageinfo.clear();
		}
		languageinfo = new Hashtable<String, String>(invokeinfo);
	}*/

	/**
	 * ????????????
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
				if (imgurl.startsWith("file:///data")) {//??????
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
				} else if (imgurl.startsWith("file://res")) {//????????????
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
				} else {//????????????
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
	 * ???????????????????????????
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
	 * ?????????????????????
	 */
	public float getStatusBarHeight()
	{
		float height = 0;
		//??????status_bar_height?????????ID
		int resourceId = PluginWrapper.getContext().getResources().getIdentifier("status_bar_height", "dimen", "android");
		if (resourceId > 0) {
			//????????????ID????????????????????????
			height = PluginWrapper.getContext().getResources().getDimensionPixelSize(resourceId);
		}
		return height;
	}

	/**
	 * ????????????????????????????????????
	 * ?????????????????????;??????
	 * ??????
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
	 *?????????????????????
	 * ???????????????????????????
	 * */
	public void getSystemContactInfos() {
		requestPermission(CONTACTRESOULT, android.Manifest.permission.READ_CONTACTS, new Runnable() {
			@Override
			public void run() {
				JSONArray jsonArray = new JSONArray();
				// ?????????Uri
				Uri uri = ContactsContract.CommonDataKinds.Phone.CONTENT_URI;
				String NUMBER = ContactsContract.CommonDataKinds.Phone.NUMBER;// ??????
				String DISPLAY_NAME = ContactsContract.Contacts.DISPLAY_NAME;// ??????
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
						// ??????????????????ID
						String contactId = cursor.getString(cursor.getColumnIndex(ID));
						// ?????????????????????
						String displayname = cursor.getString(cursor.getColumnIndex(DISPLAY_NAME));
						// ???????????????????????????????????????????????????????????????0
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
		//????????????????????????","
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
	 *???????????????????????????????????????????????????+86?????????????????????-????????????
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
	 * ?????????????????????????????????????????????
	 * *//*
	private static String getSortkey(String sortKeyString){
		String key =sortKeyString.substring(0,1).toUpperCase();
		if (key.matches("[A-Z]")){
			return key;
		}else
			return "#";   //??????sort key?????????????????????????????????????????????????????????????????????#???
	}*/

	/**
	 * @param requestId            ???????????????Id???????????????
	 * @param permission           ???????????????
	 * @param allowableRunnable    ????????????????????????
	 * @param disallowableRunnable ????????????????????????
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
		//????????????
		if (Build.VERSION.SDK_INT >= 23) {
			//????????????????????????
			int checkPermission = ContextCompat.checkSelfPermission(PluginWrapper.getContext(), permission);
			if (checkPermission != PackageManager.PERMISSION_GRANTED) {
				//???????????????????????????
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
	 * ?????????????????????????????????
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
	 * ???????????????????????????????????????
	 * */
	public void openPush()
	{
		Uri packageURI = Uri.parse("package:" + getPackageName());  
        Intent intent =  new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, packageURI);
     	PluginWrapper.getContext().startActivity(intent); // ???????????????????????????????????????
	}
	/**
	 * ???????????????????????????
	 * @return
	 */
    public float getCurrentNetDBM()
    {
//    	if(currentNetDBM < -0.5f)
//    	{
//    		
//    		currentNetDBM = 5;
//    		//????????????????????????
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
//    					// 4G?????? ???????????? >-90dBm ????????????
//    					int Itedbm = Integer.parseInt(params[9]);
//    					setDBM(Itedbm);  	
//    				} else if (tm.getNetworkType() == TelephonyManager.NETWORK_TYPE_HSDPA
//    						|| tm.getNetworkType() == TelephonyManager.NETWORK_TYPE_HSPA
//    						|| tm.getNetworkType() == TelephonyManager.NETWORK_TYPE_HSUPA
//    						|| tm.getNetworkType() == TelephonyManager.NETWORK_TYPE_UMTS) {
//    					// 3G?????????????????? >-90dBm ???????????? ps:????????????3G???????????? ???????????????dbm???????????????85dbm???
//    					// ?????????????????????????????????3G????????????????????????3G????????????????????????????????????????????????
//    					// ??????????????????????????????????????????????????????
//    					String yys = getSimType();// ?????????????????????
//    					if (yys == "1") {
//    						setDBM(0);// ????????????3G??????????????????????????????0
//    					} else if (yys == "2") {
//    						int Itedbm = signalStrength.getCdmaDbm();
//    						setDBM(Itedbm);
//    					} else if (yys == "3") {
//    						int Itedbm = signalStrength.getEvdoDbm();
//    						setDBM(Itedbm);
//    					}
//    				} else {
//    					// 2G??????????????????>-90dBm ????????????
//    					int asu = signalStrength.getGsmSignalStrength();
//    					int dbm = -113 + 2 * asu;
//    					setDBM(dbm);
//    				}
//
//    			}
//    		};
//    		// ????????????
//    		tm.listen(mylistener, PhoneStateListener.LISTEN_SIGNAL_STRENGTHS);
//    		
//    	}
    	
    	return currentNetDBM;
    }
    public void setDBM(int dbm)
    {
    	//5?????????
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
     * ??????????????????
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
	 * ??????WIFI??????
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
	 * ??????????????????????????????
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
	 * ??????????????????????????????
	 * @return
	 */
	public String getDeviceType()
	{
		String deviceType = "android";
		
		return deviceType;
	}
	
	/**
	 * ??????????????????IP??????
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
	 * ??????????????????IP??????
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
//					+ data.getString("area") + "???"
//					+ data.getString("region") + data.getString("city")
//					+ data.getString("isp") + ")";
					ipAndregion = data.getString("ip") + "("
							+ data.getString("region") + ")["
							+ getSimType()
							+ "]";
					Log.e("??????", "??????IP?????????????????????" + ipAndregion);
				}
				else
				{
					Log.e("??????", "IP???????????????????????????IP?????????");
				}
			} else {
				Log.e("??????", "?????????????????????????????????IP?????????");
			}
			response.body().close();
		} catch (IOException e) {
			Log.e("??????", "??????IP??????????????????????????????????????????" + e.toString());
		} catch (JSONException e) {
			Log.e("??????", "??????IP??????????????????????????????????????????" + e.toString());
		}
		return ipAndregion;
    }
	/**
	 * ??????mac??????
	 * @return
	 */
	public String getMacAddress() 
	{  
		String macaddr = "";
		
		try
		{
			//((TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE)).getDeviceId();	
			// ???wifi????????????????????????wifi???mac???3g????????????????????????????????????3g???????????????????????????????????????3g???mac??????????????????????????????imei
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
     * ????????????IMEI
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
     * ????????????IMSI
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
     * ??????????????????
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
     * ????????????sim?????????
     * 1???????????????2???????????????3????????????
     * @return?????????2015.10.30
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
     * ??????sim?????????
     * 
     * @return sim???????????????
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
	 * ????????????????????????
	 * @return
	 */
    public float getBatteryLevel()
    {
    	if(batteryLevel < -0.5f)
    	{
    		//?????????????????????
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
    						int level = intent.getIntExtra("level", 0);//??????
    						int scale = intent.getIntExtra("scale", 0);//????????????
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
     * ??????????????????????????????
     */
    
    /**
	 * ???????????????????????????
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
	 * ??????????????????
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
	 * ??????URI????????????android????????????
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
     * ????????????????????????
     * @param strPacketName,android????????????
     * @return
     * ???????????????????????????versionCode
     * ????????????0
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
	 * ????????????
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
     * ?????????????????????????????????
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
	 * ?????????????????????
	 * strPacketName  ??????
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
     * ?????????????????????GPS 
     * @param
     */  
    public void openGPS() 
    {
        // ???????????????????????????????????????GPS
		Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
		PluginWrapper.getContext().startActivity(intent); // ???????????????????????????????????????
    } 
    
	/**
	 * ???????????????????????????
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
     * ??????????????????
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
	 * ????????????????????????
	 */
	public void startUpdatingLocation() 
	{
		LocationManager lm = (LocationManager) PluginWrapper.getContext().getSystemService(Context.LOCATION_SERVICE);
        boolean ok = lm.isProviderEnabled(LocationManager.GPS_PROVIDER);
        if (ok){
        	//showToast("?????????GPS????????????");
        	//??????????????????????????????
            if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)){
            	//showToast("?????????????????????");
            } else {
            	//showToast("?????????????????????");
            	platformResult(PlatformWrapper.LOCATION_FAIL, MsgStringConfig.msgLocationFail, "");
            	return;
            }
        }else {
        	//showToast("?????????GPS????????????");
        	platformResult(PlatformWrapper.LOCATION_FAIL, "?????????GPS????????????", "");
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
							//??????????????????
							setLocation(mlocation);
							if (location != null) {
								if (location.getLocType() == BDLocation.TypeGpsLocation
									|| location.getLocType() == BDLocation.TypeNetWorkLocation
									|| location.getLocType() == BDLocation.TypeOffLineLocation){
									// GPS????????????
									// ??????????????????
									// ??????????????????
									platformResult(PlatformWrapper.LOCATION_SUCCESS, MsgStringConfig.msgLocationSuccess, getUpdatingLocationPosition());
									ReleaseLocation();
								}else{
									//????????????
									platformResult(PlatformWrapper.LOCATION_FAIL, MsgStringConfig.msgLocationFail, "");
									ReleaseLocation();
								}
							} else {
								//????????????
								platformResult(PlatformWrapper.LOCATION_FAIL, MsgStringConfig.msgLocationFail, "");
								ReleaseLocation();
							}
						}
					};
					LocationClientOption option = new LocationClientOption();
					option.setLocationMode(LocationMode.Hight_Accuracy);//????????????????????????
					option.setCoorType("bd09ll");//bd09ll????????????????????????
					option.setScanSpan(0);//??????????????????
					option.setIsNeedAddress(true);//????????????????????????
					option.setOpenGps(true);//????????????gps
					mLocationClient.setLocOption(option);
				    //??????LocationClient???
				    mLocationClient.registerLocationListener(myListener);
				    mLocationClient.start();
				} catch (Exception e) {
			        e.printStackTrace();
			        //????????????
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
	 * ??????????????????
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
	 * ??????????????????
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
	 * ????????????????????????
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
	 * ????????????Version Code
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
	 * ????????????????????????
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
	 * ??????plist??????????????????????????????PacketName??????ChannelName
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
	 * ????????????toast
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
	 * ?????????????????????????????????????????????
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
	 * ????????????
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
	 * ?????????????????????
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
			if (imagepath.startsWith("file:///data")){//??????
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
						intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION); //???????????????????????????????????????????????????Uri??????????????????
					}
		        	intent.setData(uri);     
		        	mContext.sendBroadcast(intent);
					PlatformWP.platformResult(PlatformWrapper.SAVEIMG_SUCCESS, MsgStringConfig.msgCopyIMGSuccess, "");
		        }
			}else if (imagepath.startsWith("file://res")){//????????????
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
						intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION); //???????????????????????????????????????????????????Uri??????????????????
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
	 * ????????????
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
	 * ??????AndroidManifest.xml???meta-data???name?????????value
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
     * ?????????????????????????????????
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
	 * ??????????????????,????????????
	 */
	//*******************************????????????start*****************************************
	public static String strDirPath = null;
	public static String strFilePath = null;
	
	public static Uri photoUri = null;
	public static String imgUrl = null;
	
	public static final String IMAGE_UNSPECIFIED = "image/*";
	public static boolean isImageProcess = false;
	public static boolean isAutoUpload = true;
	
	public static final int NONE           = 0;             // ??????
    public static final int PHOTOHRAPH     = 10001;         // ??????  
    public static final int PHOTOZOOM      = 10002;         // ??????  
    public static final int PHOTORESOULT   = 10003;         // ?????? 
    
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
	 * 3.0.0?????????GPS??????
	 * 4.0.0????????????????????????
	 * 4.0.1:
	 * ??????????????????????????????????????????getIsPushOn
	 * ???????????????????????????????????????
	 * 4.0.2:
	 * ??????????????????????????????
	 * 4.0.3:??????openinstall????????????
	 * 4.0.4:?????????????????????4.0.3?????????????????????????????????????????????luaj?????????????????????
	 * 5.0.0:???????????????initheadface???????????????????????????
	 * 6.0.0:banner???????????????????????????????????????????????????
	 * 6.1.0:???????????????????????????showAds
	 * 6.1.1:1.?????????????????????????????????2.?????????????????????????????????context.
	 * 6.1.2:??????????????????????????????????????????????????????json???????????????
	 * 6.1.3:????????????????????????????????????
	 * 6.1.4:????????????????????????????????????
	 * 6.1.5:?????????????????????????????????
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
	 * ?????????????????????
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
		
		//????????????????????????
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
			        // ??????????????? 
					Builder dialog = new AlertDialog.Builder(PluginWrapper.getContext());
					//--dialog.setTitle("????????????");
					//--String item[] = {"????????????", "????????????" , "??????"}; 

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
											//????????????????????????
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
												intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION); //???????????????????????????????????????????????????Uri??????????????????
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
											//????????????????????????
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
			        // ??????????????????
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
	 * ????????????????????????????????????
	 * android7.0->24
	 * */
	public Uri getPhotoUri(File file){
		Uri imageUri = Uri.fromFile(file);
		if (Build.VERSION.SDK_INT >= 24){
			imageUri = FileProvider.getUriForFile(mContext, PluginWrapper.getContext().getPackageName() + ".fileprovider", file);//??????FileProvider????????????content?????????Uri
		}
		return imageUri;
	}
	
	@SuppressWarnings("unused")
	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) 
	{

		// ??????
		if (resultCode == NONE) 
		{
			PlatformWP.isImageProcess = true;
			return;
		}

		// ??????
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

		// ????????????????????????
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
						}, 1000);//??????????????????
						
							//??????????????????
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
			intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION); //???????????????????????????????????????????????????Uri??????????????????
		}
		intent.setDataAndType(uri, IMAGE_UNSPECIFIED);
		intent.putExtra("crop", "true");
		// aspectX aspectY ??????????????????
		intent.putExtra("aspectX", 1);
		intent.putExtra("aspectY", 1);
		if (rectWidth < 0 && rectHeight < 0){//????????????????????????
			// outputX outputY ?????????????????????
			intent.putExtra("outputX", 100);
			intent.putExtra("outputY", 100);
		}
		else if (rectWidth > 0 &&  rectHeight > 0){//???????????????????????????
			// outputX outputY ?????????????????????
			intent.putExtra("outputX", rectWidth);
			intent.putExtra("outputY", rectHeight);
		}else {//?????????
			intent.putExtra("crop", "false");
		}
		intent.putExtra("return-data", true);
		
		((ActivityResultListener)mContext).setActivityResultDelegate(mPlatformwp);

		// ??????sdcard??????????????????????????????????????????Environment.getExternalStorageDirectory()
		File cutFile = new File( mContext.getExternalCacheDir() + File.separator + "newPhoto.jpg");
        if (cutFile.exists() == false) {
            try {
                cutFile.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        // ????????????
        intent.putExtra("output", Uri.fromFile(cutFile));  // ??????????????????
        intent.putExtra("outputFormat", "JPEG"); //??????????????????

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
	 * ????????????????????????
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
					// ?????????????????????
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
					
					// ???????????????????????????url
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
						e1.printStackTrace();//??????login?????????
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
					
					// ?????????????????????
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
					// ????????????
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
	 * ??????SD?????????
	 * @return
	 */
	private boolean getSDState()
	{
		return  android.os.Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState()); 
	}
	
	/**
	 * ??????????????????
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
	 * ????????????????????????
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
	 * ????????????
	 * @param ret
	 * @param msg
	 */
	public static void platformResult(int ret, String msg, String state) 
	{
		PlatformWrapper.onPlatformResult(mPlatformwp, ret, msg, state);
		LogD("PlatformWP result : " + ret + " msg : " + msg);
	}
	//*******************************????????????end*****************************************
	
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
        LogD("?????????json??????:"+jsonresult);
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
	
	/**************************************????????????????????????******************************************/
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
