package com.izhangxin.utils;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import org.cocos2dx.plugin.PlatformWP;
import org.cocos2dx.plugin.PlatformWrapper;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences.Editor;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Rect;
import android.net.Uri;
import android.os.Build;
import android.os.Vibrator;
import android.provider.Settings;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.util.Log;
import android.view.DisplayCutout;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;

import com.fm.openinstall.OpenInstall;
import com.fm.openinstall.listener.AppInstallAdapter;
import com.fm.openinstall.model.AppData;
import com.tencent.mmkv.MMKV;
import com.izhangxin.zxddz.android.AppActivity;
import com.izhangxin.zxddz.android.R;

public class luaj {
    private static final String SHARE_TAG = "NotifyInfo";

    private static AppActivity s_context;
    private static Vibrator m_vibrator;
    private static UpgradeUtil m_upgradeUtil = null;
    private static ImageView s_SplashBgImageView = null;
    private static boolean s_SplashReady1 = false;
    private static boolean s_SplashReady2 = false;
    public static String privateRoomCode = null;
    public static String[] s_permissions = null;
    public static String[] s_permission_names = null;
    public static Runnable s_permission_callback = null;

    // ?????????
    public static void init(AppActivity context) {
        s_context = context;
        m_vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        showSplash();
    }

    // ??????
    public static void showAlertDialog(final String title, final String message, final int luaCallbackFunction) {
        s_context.runOnUiThread(new Runnable() {
            @SuppressWarnings("deprecation")
            @Override
            public void run() {
                AlertDialog alertDialog = new AlertDialog.Builder(s_context).create();
                alertDialog.setTitle(title);
                alertDialog.setMessage(message);
                alertDialog.setButton("OK", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int which) {
                        s_context.runOnGLThread(new Runnable() {
                            @Override
                            public void run() {
                                callFunctionWithParam("AlertDialog", "CLICKED");
                            }
                        });
                    }
                });
                alertDialog.show();
            }
        });
    }

    // ??????
    public static void vibrate(long time) {
        if (m_vibrator == null) {
            return;
        }
        m_vibrator.vibrate(time);
    }

    // ??????????????????????????????
    public static String getStartData() {
        JSONObject startdata = new JSONObject();
        try {
            startdata.put("music", false);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return startdata.toString();
    }

    // ??????????????????
    public static void showUpgradeDialog(final String url, final String title, final String msg, final String name, final int luaCallbackFunction) {
        s_context.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (m_upgradeUtil == null) {
                    m_upgradeUtil = new UpgradeUtil(s_context, url, title, msg, name, luaCallbackFunction);
                } else {
                    m_upgradeUtil.reinit(s_context, url, title, msg, name, luaCallbackFunction);
                }
                m_upgradeUtil.showDownloadDialog();
            }
        });
    }

    // ????????????
    public static void deleteNotifyByTS(final int ts) {
        long targetTime = ts * 1000;
        //SharedPreferences notifyInfo = s_context.getSharedPreferences(SHARE_TAG, Context.MODE_MULTI_PROCESS);
        MMKV notifyInfo = MMKV.mmkvWithID(SHARE_TAG);
        // ???????????????
        {
            SharedPreferences old_man = s_context.getSharedPreferences(SHARE_TAG, Context.MODE_MULTI_PROCESS);
            notifyInfo.importFromSharedPreferences(old_man);
            old_man.edit().clear().commit();
        }
        String sNotifyList = notifyInfo.getString("notifyTitleList", "{}");
        try {
            JSONObject jsonObj = new JSONObject(sNotifyList);
            jsonObj.remove(targetTime + "");

            Editor editor = notifyInfo.edit();
            editor.putString("notifyTitleList", jsonObj.toString());
            //editor.commit();
        } catch (JSONException e) {
            System.out.println("Json parse error");
            e.printStackTrace();
        }
    }

    // ???????????? ?????????
    public static void sendNotifyByTS(final String title, final String info, final int ts) {
        Log.i("push_service", "sendNotifyByTS called!! as " + ts + ":" + title + "," + info);
        long targetTime = (long) ts * 1000;
        Log.i("push_service", "targetTime" + targetTime);
        //SharedPreferences notifyInfo = s_context.getSharedPreferences(SHARE_TAG, Context.MODE_MULTI_PROCESS);
        MMKV notifyInfo = MMKV.mmkvWithID(SHARE_TAG);
        // ???????????????
        {
            SharedPreferences old_man = s_context.getSharedPreferences(SHARE_TAG, Context.MODE_MULTI_PROCESS);
            notifyInfo.importFromSharedPreferences(old_man);
            old_man.edit().clear().commit();
        }
        String sNotifyList = notifyInfo.getString("notifyTitleList", "{}");
        try {
            JSONObject jsonObj = new JSONObject(sNotifyList);
            JSONObject jsonObjDetail = new JSONObject();
            jsonObjDetail.put("title", title);
            jsonObjDetail.put("info", info);
            jsonObjDetail.put("type", 0);
            jsonObj.put(targetTime + "", jsonObjDetail);

            Log.i("push_service", jsonObj.toString());
            Editor editor = notifyInfo.edit();
            editor.putString("notifyTitleList", jsonObj.toString());
            //editor.commit();

        } catch (JSONException e) {
            System.out.println("Json parse error");
            e.printStackTrace();
        }
    }

    // ???????????? ???????????????
    @SuppressLint({"WorldReadableFiles", "WorldWriteableFiles"})
    public static void sendNotifyByAfter(final String title, final String info, final int time) {
        Date date = new Date();
        int ts = (int) (date.getTime() / 1000 + time);
        sendNotifyByTS(title, info, ts);
    }

    // ???????????????????????????
    public static void sendNotifyByTSAndType(final String jsonStr) {
        Log.i("push_service", "sendNotifyByTS called!! as " + jsonStr);

        //SharedPreferences notifyInfo = s_context.getSharedPreferences(SHARE_TAG, Context.MODE_MULTI_PROCESS);
        MMKV notifyInfo = MMKV.mmkvWithID(SHARE_TAG);
        // ???????????????
        {
            SharedPreferences old_man = s_context.getSharedPreferences(SHARE_TAG, Context.MODE_MULTI_PROCESS);
            notifyInfo.importFromSharedPreferences(old_man);
            old_man.edit().clear().commit();
        }
        try {
            JSONObject jsonObj = new JSONObject();
            JSONObject jsonList = new JSONObject(jsonStr);
            JSONArray jsonItems = jsonList.getJSONArray("apppush");
            int length = jsonItems.length();
            for (int i = 0; i < length; i++) {
                JSONObject jsonItem = jsonItems.getJSONObject(i);
                String title = jsonItem.getString("title");
                String info = jsonItem.getString("content");
                int type = jsonItem.getInt("pushType");
                long time = jsonItem.getLong("pushTime") * 1000;
                JSONObject jsonObjDetail = new JSONObject();
                jsonObjDetail.put("title", title);
                jsonObjDetail.put("info", info);
                jsonObjDetail.put("type", type);
                jsonObj.put(time + "", jsonObjDetail);
            }

            Log.i("push_service", jsonObj.toString());
            Editor editor = notifyInfo.edit();
            editor.putString("notifyTitleList", jsonObj.toString());
            //editor.commit();

        } catch (JSONException e) {
            System.out.println("Json parse error");
            Editor editor = notifyInfo.edit();
            editor.putString("notifyTitleList", "{}");
            //editor.commit();
            e.printStackTrace();
        }
    }

    // ????????????
    public static String getChannelName() {
        return PlatformWP.getMetaName("ChannelName");
    }

    // ????????????
    public static void exit() {
        System.exit(0);
    }

    // ??????????????????
    public static int changeOrientation(int orientation) {
        Log.i("changeOrientation", "changeOrientation called!! as " + orientation);

        int innerOrientation;
        if (orientation == 0) {
            innerOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_PORTRAIT;
        } else {
            innerOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE;
        }

        s_context.setRequestedOrientation(innerOrientation);
        if (s_context.getRequestedOrientation() == innerOrientation) {
            Log.i("changeOrientation", "changeOrientation called!! return 1 success");
            return 1;
        }
        Log.i("changeOrientation", "changeOrientation called!! return 0 failed");
        return 0;
    }

    // ??????
    public static String getVersion() {
        // 1.0.1 ????????????????????????
        // 1.0.2 ????????????APP?????????param
        // 1.0.3 loadPluginFinish
        return "1.0.3";
    }

    // java => JavaScript
    static public void callFunctionWithParam(final String funcName, final String param) {
        s_context.runOnGLThread(new Runnable() {
            @Override
            public void run() {
                Cocos2dxJavascriptJavaBridge.evalString("cc.game.emit(\"" + funcName + "\", " + param + ");");
            }
        });
    }

    // ???????????????
    private static void showSplash() {
        s_SplashBgImageView = new ImageView(s_context);
        s_SplashBgImageView.setImageResource(R.drawable.splash_portrait);
        s_SplashBgImageView.setScaleType(ImageView.ScaleType.FIT_XY);
        s_context.addContentView(s_SplashBgImageView, new WindowManager.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        s_SplashReady1 = false;
        s_SplashReady2 = false;
        s_SplashReady1 = true;
//        TimerTask task = new TimerTask() {
//            @Override
//            public void run() {
//                s_SplashReady1 = true;
//                checkSplash();
//            }
//        };
//        Timer timer = new Timer();
//        timer.schedule(task, 2000);
    }

    // ??????????????????????????????
    public static void hideSplash() {
        s_SplashReady2 = true;
        checkSplash();
    }

    // ????????????????????????
    public static void checkSplash() {
        if (s_SplashReady1 == false || s_SplashReady2 == false) {
            return;
        }

        s_SplashReady1 = false;
        s_SplashReady2 = false;
        s_context.runOnUiThread(() -> {
            if (s_SplashBgImageView != null) {
                s_SplashBgImageView.setVisibility(View.GONE);
            }
        });
    }

    public static void loadPluginFinish() {
        requestPermissions(new String[]{Manifest.permission.READ_PHONE_STATE}, new String[]{"??????????????????"}, () -> {
            checkSplash();
        });
    }

    // ??????OpenInstall????????????
    public static void getOpenInstallParms() {
        OpenInstall.getInstall(new AppInstallAdapter() {
            @Override
            public void onInstall(AppData appData) {
                // ??????????????????
                // String channelCode = appData.getChannel();
                // ?????????????????????
                String bindData = appData.getData();
                Log.i("OpenInstall", "getInstall : installData = " + appData.toString());
                PlatformWrapper.onPlatformResult(PlatformWP.mPlatformwp, PlatformWrapper.GET_OPENINSTALL_PARAMS,
                        "??????app????????????", bindData);
            }
        });
    }

    // ????????????????????????
    public static String getPrivateRoomCode() {
        String code = "";
        if (privateRoomCode != null) {
            code = privateRoomCode;
            privateRoomCode = null;
        }
        return code;
    }

    public static void requestPermissions(String[] permissions, String[] names, Runnable callback) {
        // ????????????????????????APP
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            callback.run();
            return;
        }

        s_permissions = permissions;
        s_permission_names = names;
        s_permission_callback = callback;

        checkPermissions(true);
    }

    public static void checkPermissions(boolean first) {
        // ??????????????????????????????
        List<String> req_permissions = new ArrayList();
        List<String> req_names = new ArrayList();
        List<String> stop_names = new ArrayList();
        for (int i = 0; i < s_permissions.length; i++) {
            if (ContextCompat.checkSelfPermission(s_context, s_permissions[i]) != PackageManager.PERMISSION_GRANTED) {
                if (first || ActivityCompat.shouldShowRequestPermissionRationale(s_context, s_permissions[i])) {
                    req_permissions.add(s_permissions[i]);
                    req_names.add(s_permission_names[i]);
                } else {
                    stop_names.add(s_permission_names[i]);
                }
            }
        }

        if (!req_permissions.isEmpty()) {
            if (first) {
                ActivityCompat.requestPermissions(s_context, req_permissions.toArray(new String[req_permissions.size()]), s_permissions.length);
                return;
            }

            String msg = "????????????????????????????????????????????????\n";
            for (int i = 0; i < req_names.size(); i++) {
                msg += "\n" + req_names.get(i);
            }
            AlertDialog.Builder builder = new AlertDialog.Builder(s_context);
            builder.setTitle("????????????");
            builder.setMessage(msg);
            builder.setPositiveButton("??????", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    if (s_permissions == null) {
                        return;
                    }
                    ActivityCompat.requestPermissions(s_context, req_permissions.toArray(new String[req_permissions.size()]), s_permissions.length);
                }
            });
            builder.setCancelable(false);
            builder.show();
        } else if (!stop_names.isEmpty()) {
            String msg = "?????? [??????] - [????????????] ????????????????????????????????????????????????\n";
            for (int i = 0; i < stop_names.size(); i++) {
                msg += "\n" + stop_names.get(i);
            }
            AlertDialog.Builder builder = new AlertDialog.Builder(s_context);
            builder.setTitle("????????????");
            builder.setMessage(msg);
            builder.setPositiveButton("??????", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    if (s_permissions == null) {
                        return;
                    }
                    Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    intent.setData(Uri.fromParts("package", s_context.getPackageName(), null));
                    s_context.startActivityForResult(intent, s_permissions.length);
                }
            });
            builder.setCancelable(false);
            builder.show();
        } else {
            if (s_permission_callback != null) {
                s_permission_callback.run();
            };
            s_permissions = null;
            s_permission_names = null;
            s_permission_callback = null;
        }
    }

    public static void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (s_permissions == null || requestCode != s_permissions.length) {
            return;
        }
        checkPermissions(false);
    }

    public static void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (s_permissions == null || requestCode != s_permissions.length) {
            return;
        }
        checkPermissions(false);
    }
}
