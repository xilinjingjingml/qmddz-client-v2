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

import java.util.HashMap;
import java.util.Hashtable;
import java.util.Iterator;
import org.json.JSONObject;
import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.util.Log;
import com.kwai.monitor.log.TurboAgent;
import com.kwai.monitor.log.TurboConfig;

public class AnalyticsMonitor implements InterfaceAnalytics, ModuleApplication{
    
    private static Activity mContext = null;
    protected static String TAG = "AnalyticsMonitor";

    public AnalyticsMonitor()
    {
        super();
    }

    protected static void LogE(String msg, Exception e) {
        Log.e(TAG, msg, e);
        e.printStackTrace();
    }

    private static boolean isDebug = true;
    protected static void LogD(String msg) {
        if (isDebug) {
            Log.d(TAG, msg);
        }
    }

    public AnalyticsMonitor(Context context) {
        mContext = (Activity) context;
        //1.?????????????????????app???????????????
        TurboAgent.onAppActive();
    }
    
    public boolean isValid() {
        return mContext != null;
    }
    
    /**
     * ??????????????????
     * */
    public void startSession(String appKey) {
        LogD("startSession invoked!");
        TurboAgent.onPageResume(mContext);
    }

    public void stopSession() {
        LogD("stopSession invoked!");
        TurboAgent.onPagePause(mContext);
    }
    
    /**
     * ??????????????????????????????30?????????????????????????????????
     * ??????????????????????????????session(??????)???
     * ??????????????????home???????????????????????????????????????????????????????????????????????????
     * millis???????????????
     * */
    public void setSessionContinueMillis(int millis) {
        LogD("setSessionContinueMillis invoked!");
        //MobclickAgent.setSessionContinueMillis(millis);
    }
    
    /**
     * ????????????????????????????????????????????????????????????????????????
     * isEnabled???true?????????false??????
     * */
    public void setCaptureUncaughtException(boolean isEnabled) {
        LogD("setCaptureUncaughtException invoked!");
        //MobclickAgent.setCatchUncaughtExceptions(isEnabled);
    }
    
    /**
     * ????????????
     * isDebugMode???true?????????false??????
     * */
    @Override
    public void setDebugMode(boolean isDebugMode) {
        isDebug = isDebugMode;
        //MobclickAgent.setDebugMode(isDebugMode);
    }
    
    /**
     * ??????????????????????????????????????????
     * */
    public void logError(String errorId, String message) {
        LogD("logError invoked!");
        String msg = "errorId:" + errorId + ",message:" + message;
        //MobclickAgent.reportError(mContext, msg);
    }
    
    /**
     * ??????????????????
     * mContext ????????????Activity
     * eventId ????????????????????????ID
     * */
    public void logEvent(String eventId) {
        LogD("logEvent(" + eventId + ") invoked!");
        switch (eventId)
        {
            case "EVENT_NEXTDAY_STAY"://??????????????????
                TurboAgent.onNextDayStay();
                break;
            case "EVENT_WEEK_STAY"://??????????????????
                TurboAgent.onWeekStay();
                break;
            case "EVENT_REGISTER"://??????????????????
                TurboAgent.onRegister();
                break;
            case "EVENT_FORM_SUBMIT"://??????????????????
                TurboAgent.onFormSubmit();
                break;
            case "EVENT_GAME_WATCH_REWARD_VIDEO"://????????????????????????
                TurboAgent.onGameWatchRewardVideo();
                break;
        }
    }

    /**
     * ?????????????????????????????????????????????
     * mContext ????????????Activity
     * eventId ????????????????????????ID
     * curParam ????????????????????????????????????Key-Value????????????
     * */
    public void logEvent(String eventId, Hashtable<String, String> paramMap) {
        LogD("logEvent(" + eventId + "," + paramMap.toString() + ") invoked!");
        try{
            switch (eventId)
            {
                case "EVENT_PAY"://????????????
                    //??????????????????????????????????????????????????????
                    if (paramMap != null && paramMap.size() > 0) {
                        String money = paramMap.get("PayAmount");
                        TurboAgent.onPay(Double.valueOf(money).doubleValue());
                    }
                    break;
                case "EVENT_GAME_CONSUMPTION"://???????????????????????????????????????????????????
                    //??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                    if (paramMap != null && paramMap.size() > 0) {
                        String money = paramMap.get("PayAmount");
                        TurboAgent.onGameConsumption(Double.valueOf(money).doubleValue());
                    }
                    break;
                case "EVENT_GAME_UPGRADE_ROLE"://????????????
                    //???????????????????????????int?????????????????????
                    if (paramMap != null && paramMap.size() > 0) {
                        String lv = paramMap.get("VIPLV");
                        TurboAgent.onGameUpgradeRole(Integer.valueOf(lv).intValue());
                    }
                    break;
            }
        } catch(Exception e){
            LogE("Exception in logEvent", e);
        }
    }

    @Override
    public String getSDKVersion() {
        LogD("getSDKVersion invoked!");
        return "1.0.4";
    }
    
    /**
     * ??????????????????
     * key??????????????????????????????
     * value??????????????????????????????
     * */
    protected String getConfigParams(String key) {
        LogD("getConfigParams(" + key + ") invoked!");
        if (!isValid()) 
        	return null;
        String value = "";
//        try{
//        	value = OnlineConfigAgent.getInstance().getConfigParams(mContext, key);
//        } catch(Exception e){
//            LogE("Exception in logTimedEventBegin", e);
//        }
        LogD("get config : " + value);
        return value;
    }
    
    /**
     * ??????????????????
     * */
    protected void updateOnlineConfig() {
        LogD("updateOnlineConfig invoked!");
        if (!isValid()) 
        	return;
//        try{
//            OnlineConfigAgent.getInstance().updateOnlineConfig(mContext);
//        } catch(Exception e){
//            LogE("Exception in updateOnlineConfig", e);
//        }
    }
    
    /**
     * ?????????????????????????????????????????????
     * */
    protected void logEventWithLabel(JSONObject eventInfo) {
        LogD("logEventWithLabel invoked! event : " + eventInfo.toString());
        if (!isValid()) return;
//        try{
//            String eventId = eventInfo.getString("Param1");
//            String label = eventInfo.getString("Param2");
//            //MobclickAgent.onEvent(mContext, eventId, label);
//        } catch(Exception e){
//            LogE("Exception in logEventWithLabel", e);
//        }
    }
    
    /**
     * ????????????????????????????????????
     * eventId  ?????????ID
     * curMap  ?????????????????????????????????
     * duration  ???????????????????????????????????????????????????
     * ???????????????-2,147,483,648 ??? +2,147,483,647 ???????????????????????????
     * ???int 32????????????????????????????????????????????????????????????????????????????????????????????????
     * */
    protected void logEventWithDurationLabel(JSONObject eventInfo) {
        LogD("logEventWithDurationLabel invoked! event : " + eventInfo.toString());
        if (!isValid()) return;
//        try {
//            String eventId = eventInfo.getString("Param1");
//            int duration = eventInfo.getInt("Param2");
//            if (eventInfo.has("Param3")) {
//                HashMap<String, String> curMap = new HashMap<String, String>();
//                curMap.put("Param3", eventInfo.getString("Param3"));
//                //MobclickAgent.onEventValue(mContext, eventId, curMap, duration);
//            } else {
//                //MobclickAgent.onEventValue(mContext, eventId, null, duration);
//            }
//        } catch (Exception e) {
//            LogE("Exception in logEventWithDurationLabel", e);
//        }
    }

    protected void logEventWithDurationParams(JSONObject eventInfo) {
        LogD("logEventWithDurationParams invoked! event : " + eventInfo.toString());
        if (!isValid()) return;
//        try {
//            String eventId = eventInfo.getString("Param1");
//            int duration = eventInfo.getInt("Param2");
//            if (eventInfo.has("Param3")) {
//            	HashMap<String, String> curMap = new HashMap<String, String>();
//                curMap.put("Param3", eventInfo.getString("Param3"));
//                //MobclickAgent.onEventValue(mContext, eventId, curMap, duration);
//            } else {
//                //MobclickAgent.onEventValue(mContext, eventId, null, duration);
//            }
//        } catch (Exception e) {
//            LogE("Exception in logEventWithDurationParams", e);
//        }
    }

    protected void logEventWithDuration(JSONObject eventInfo) {
        LogD("logEventWithDuration invoked! event : " + eventInfo.toString());
        if (!isValid()) return;
//        try{
//            String eventId = eventInfo.getString("Param1");
//            int duration = eventInfo.getInt("Param2");
//            //MobclickAgent.onEventValue(mContext, eventId, null, duration);
//        } catch(Exception e){
//            LogE("Exception in logEventWithDuration", e);
//        }
    }

    protected void logTimedEventWithLabelBegin(JSONObject eventInfo) {
        LogD("logTimedEventWithLabelBegin invoked! event : " + eventInfo.toString());
        if (!isValid()) return;
//        try{
//            String eventId = eventInfo.getString("Param1");
//            String label = eventInfo.getString("Param2");
//            //MobclickAgent.onEventBegin(mContext, eventId, label);
//        } catch(Exception e){
//            LogE("Exception in logTimedEventWithLabelBegin", e);
//        }
    }
    
    protected void logTimedEventWithLabelEnd(JSONObject eventInfo) {
        LogD("logTimedEventWithLabelEnd invoked! event : " + eventInfo.toString());
        if (!isValid()) return;
//        try{
//            String eventId = eventInfo.getString("Param1");
//            String label = eventInfo.getString("Param2");
//            //MobclickAgent.onEventEnd(mContext, eventId, label);
//        } catch(Exception e){
//            LogE("Exception in logTimedEventWithLabelEnd", e);
//        }
    }
    
    /**
     * ??????KV??????????????????
     * */
    protected void logTimedKVEventBegin(JSONObject eventInfo) {
        LogD("logTimedKVEventBegin invoked! event : " + eventInfo.toString());
        if (!isValid()) return;
//        try{
//            String eventId = eventInfo.getString("Param1");
//            String label = eventInfo.getString("Param2");
//            if (eventInfo.has("Param3")){
//            	HashMap<String, String> curMap = new HashMap<String, String>();
//                curMap.put("Param3", eventInfo.getString("Param3"));
//                //MobclickAgent.onKVEventBegin(mContext, eventId, curMap, label);
//            }else {
//            	//MobclickAgent.onKVEventBegin(mContext, eventId, null, label);
//            }
//        } catch(Exception e){
//            LogE("Exception in logTimedKVEventBegin", e);
//        }
    }
    
    protected void logTimedKVEventEnd(JSONObject eventInfo) {
        LogD("logTimedKVEventEnd invoked! event : " + eventInfo.toString());
        if (!isValid()) return;
//        try{
//            String eventId = eventInfo.getString("Param1");
//            String label = eventInfo.getString("Param2");
//            //MobclickAgent.onKVEventEnd(mContext, eventId, label);
//        } catch(Exception e){
//            LogE("Exception in logTimedKVEventEnd", e);
//        }
    }

    private HashMap<String, String> changeTableToMap(Hashtable<String, String> param) {
        HashMap<String, String> retParam = new HashMap<String, String>();
        for(Iterator<String> it = param.keySet().iterator(); it.hasNext(); ) {   
            String key = it.next();
            String value = param.get(key);

            retParam.put(key, value);
        }

        return retParam;
    }

    private HashMap<String, String> getMapFromJson(JSONObject json) {
        HashMap<String, String> curMap = new HashMap<String, String>();
        try {
            @SuppressWarnings("rawtypes")
            Iterator it = json.keys();
            while (it.hasNext()) {
                String key = (String) it.next();
                String value = json.getString(key);
                curMap.put(key, value);
            }
        } catch (Exception e) {
            LogE("Error when get HashMap from JSONObject", e);
        }

        return curMap;
    }

    @Override
    public String getPluginVersion() {
        return "2.0.0";
    }

    @Override
    public void onCreate(Application application) {
        ApplicationInfo info = null;
        try {
            info = application.getPackageManager().getApplicationInfo(
                    application.getPackageName(),
                    PackageManager.GET_META_DATA);
            if (info.metaData != null) {
                String appid = String.valueOf(info.metaData.get("kuaishou_appid"));
                appid = appid.replaceAll("kuaishou_", "");
                String appname = String.valueOf(info.metaData.get("kuaishou_appname"));
                String channelName = PlatformWP.getMetaInfoChannel();
                if (channelName == null) {
                    channelName = String.valueOf(info.metaData.get("ChannelName"));
                }
                TurboAgent.init(TurboConfig.TurboConfigBuilder.create(application)
                        .setAppId(appid)
                        .setAppName(appname)
                        .setAppChannel(channelName)
                        .setEnableDebug(isDebug)
                        .build());
            }
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
    }

    public void OnPluginResume(){
        TurboAgent.onPageResume(mContext);
    }

    public void OnPluginPause(){
        TurboAgent.onPagePause(mContext);
    }

    public void OnPluginDestroy(){
        TurboAgent.unRegisterOAIDListener();
    }
}
