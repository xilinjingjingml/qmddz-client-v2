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
        //1.活跃事件，进入app首页时调用
        TurboAgent.onAppActive();
    }
    
    public boolean isValid() {
        return mContext != null;
    }
    
    /**
     * 统计应用时长
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
     * 当应用在后台运行超过30秒（默认）再回到前端，
     * 将被认为是两个独立的session(启动)，
     * 例如用户回到home，或进入其他程序，经过一段时间后再返回之前的应用。
     * millis单位为毫秒
     * */
    public void setSessionContinueMillis(int millis) {
        LogD("setSessionContinueMillis invoked!");
        //MobclickAgent.setSessionContinueMillis(millis);
    }
    
    /**
     * 捕获程序崩溃日志，并在程序下次启动时发送到服务器
     * isEnabled：true打开，false关闭
     * */
    public void setCaptureUncaughtException(boolean isEnabled) {
        LogD("setCaptureUncaughtException invoked!");
        //MobclickAgent.setCatchUncaughtExceptions(isEnabled);
    }
    
    /**
     * 调试模式
     * isDebugMode：true打开，false关闭
     * */
    @Override
    public void setDebugMode(boolean isDebugMode) {
        isDebug = isDebugMode;
        //MobclickAgent.setDebugMode(isDebugMode);
    }
    
    /**
     * 自己捕获了错误，上传到服务器
     * */
    public void logError(String errorId, String message) {
        LogD("logError invoked!");
        String msg = "errorId:" + errorId + ",message:" + message;
        //MobclickAgent.reportError(mContext, msg);
    }
    
    /**
     * 统计发生次数
     * mContext 指当前的Activity
     * eventId 为当前统计的事件ID
     * */
    public void logEvent(String eventId) {
        LogD("logEvent(" + eventId + ") invoked!");
        switch (eventId)
        {
            case "EVENT_NEXTDAY_STAY"://次日留存事件
                TurboAgent.onNextDayStay();
                break;
            case "EVENT_WEEK_STAY"://七日留存事件
                TurboAgent.onWeekStay();
                break;
            case "EVENT_REGISTER"://注册账号事件
                TurboAgent.onRegister();
                break;
            case "EVENT_FORM_SUBMIT"://提交表单事件
                TurboAgent.onFormSubmit();
                break;
            case "EVENT_GAME_WATCH_REWARD_VIDEO"://观看激励视频事件
                TurboAgent.onGameWatchRewardVideo();
                break;
        }
    }

    /**
     * 统计点击行为各属性被触发的次数
     * mContext 指当前的Activity
     * eventId 为当前统计的事件ID
     * curParam 为当前事件的属性和取值（Key-Value键值对）
     * */
    public void logEvent(String eventId, Hashtable<String, String> paramMap) {
        LogD("logEvent(" + eventId + "," + paramMap.toString() + ") invoked!");
        try{
            switch (eventId)
            {
                case "EVENT_PAY"://付费事件
                    //付费成功时调用，参数为价格，单位：元
                    if (paramMap != null && paramMap.size() > 0) {
                        String money = paramMap.get("PayAmount");
                        TurboAgent.onPay(Double.valueOf(money).doubleValue());
                    }
                    break;
                case "EVENT_GAME_CONSUMPTION"://游戏消费事件，参数为价格，单位：元
                    //只上报用人民币兑换出来的虚拟游戏币（比如钻石）产生的消费行为，上报金额需将虚拟游戏币换算成等额人民币、单位元
                    if (paramMap != null && paramMap.size() > 0) {
                        String money = paramMap.get("PayAmount");
                        TurboAgent.onGameConsumption(Double.valueOf(money).doubleValue());
                    }
                    break;
                case "EVENT_GAME_UPGRADE_ROLE"://升级事件
                    //升级时调用，参数为int类型，表示级别
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
     * 获取在线参数
     * key表示要获取的在线参数
     * value表示返回的在线参数值
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
     * 请求在线参数
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
     * 统计点击行为各属性被触发的次数
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
     * 统计数值型变量的值的分布
     * eventId  为事件ID
     * curMap  为当前事件的属性和取值
     * duration  为当前事件的数值为当前事件的数值，
     * 取值范围是-2,147,483,648 到 +2,147,483,647 之间的有符号整数，
     * 即int 32类型，如果数据超出了该范围，会造成数据丢包，影响数据统计的准确性
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
     * 统计KV事件使用时长
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
