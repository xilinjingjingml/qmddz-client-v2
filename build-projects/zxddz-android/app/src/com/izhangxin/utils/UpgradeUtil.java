package com.izhangxin.utils;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import org.cocos2dx.lib.Cocos2dxActivity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.AlertDialog.Builder;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.Intent;
import android.net.Uri;
import android.os.*;
import androidx.core.content.FileProvider;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ProgressBar;
import com.izhangxin.zxddz.android.R;

public class UpgradeUtil {
	 /* 下载中 */
    private static final int DOWNLOAD = 1;
    /* 下载结束 */
    private static final int DOWNLOAD_FINISH = 2;
    /* url */
    private String mUrl;

    /* 下载保存路径 */
    private String mSavePath;
    /* 记录进度条数量 */
    private int progress;
    /* 是否取消更新 */
    private boolean cancelUpdate = false;

    private static Cocos2dxActivity mContext;
    /* 更新进度条 */
    private ProgressBar mProgress;
    private Dialog mDownloadDialog;

    private String mTitle;
    private String mMsg;

    static int m_luaUpgradeCallbackFunction;

    private Handler mHandler = new Handler()
    {
        public void handleMessage(Message msg)
        {
            switch (msg.what)
            {
            // 正在下载
            case DOWNLOAD:
                // 设置进度条位置
                mProgress.setProgress(progress);
                break;
            case DOWNLOAD_FINISH:
                // 安装文件
                installApk();
                break;
            default:
                break;
            }
        };
    };
	private String mName;

    public UpgradeUtil(Context context,String url,String title,String msg,String name,final int luaCallbackFunction)
    {
    	m_luaUpgradeCallbackFunction = luaCallbackFunction;

        this.mContext = (Cocos2dxActivity) context;
        this.mUrl = url;
        this.mName = name;
        this.mTitle = title;
        this.mMsg = msg;
    }

    public void reinit(Context context,String url,String title,String msg,String name,final int luaCallbackFunction)
    {
    	m_luaUpgradeCallbackFunction = luaCallbackFunction;

        this.mContext = (Cocos2dxActivity) context;
        this.mUrl = url;
        this.mName = name;
        this.mTitle = title;
        this.mMsg = msg;
    }

    public void showNoticeDialog()
    {
        // 构造对话框
        AlertDialog.Builder builder = new Builder(mContext);
        builder.setTitle(this.mTitle);
        builder.setMessage(this.mMsg);

        builder.setPositiveButton(R.string.soft_update_updatebtn, new OnClickListener()
        {
            @Override
            public void onClick(DialogInterface dialog, int which)
            {
                dialog.dismiss();
                // 显示下载对话框
                showDownloadDialog();
            }
        });

        builder.setNegativeButton(R.string.soft_update_later, new OnClickListener()
        {
            @Override
            public void onClick(DialogInterface dialog, int which)
            {
                dialog.dismiss();
            }
        });
        Dialog noticeDialog = builder.create();
        noticeDialog.show();
    }

    /**
     * 显示软件下载对话框
     */
    public void showDownloadDialog()
    {
    	if (mDownloadDialog!=null) {
    		mDownloadDialog = null;
    	}
    	cancelUpdate = false;
        // 构造软件下载对话框
        AlertDialog.Builder builder = new Builder(mContext);
        builder.setTitle(R.string.soft_updating);
        // 给下载对话框增加进度条
        final LayoutInflater inflater = LayoutInflater.from(mContext);
        View v = inflater.inflate(R.layout.softupdate_progress, null);
        mProgress = (ProgressBar) v.findViewById(R.id.update_progress);
        builder.setView(v);
        // 取消更新
        builder.setNegativeButton(R.string.soft_update_cancel, new OnClickListener()
        {
            @Override
            public void onClick(DialogInterface dialog, int which)
            {
            	dialog.dismiss();
                mDownloadDialog = null ;
                // 设置取消状态
                cancelUpdate = true;
                luaj.callFunctionWithParam("UpgradeUtil","{\"ret\":-1,\"event\":\"cancelDownload\"}");
            }
        });
        mDownloadDialog = builder.create();
        mDownloadDialog.show();
        mDownloadDialog.setCancelable(false);
        // 现在文件
        downloadApk();
    }

    /**
     * 下载apk文件
     */
    private void downloadApk()
    {
        // 启动新线程下载软件
        new downloadApkThread().start();
    }
    /**
     * 下载文件线程
     *
     * @author coolszy
     *@date 2012-4-26
     *@blog http://blog.92coding.com
     */
    private class downloadApkThread extends Thread
    {
        @Override
        public void run()
        {
            try
            {
                // 获得存储卡的路径
                String sdpath = mContext.getCacheDir() + "/";
                mSavePath = sdpath + "download";
                URL url = new URL(mUrl);
                // 创建连接
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.connect();
                // 获取文件大小
                int length = conn.getContentLength();
                // 创建输入流
                InputStream is = conn.getInputStream();

                File file = new File(mSavePath);
                // 判断文件目录是否存在
                if (!file.exists())
                {
                    file.mkdir();
                }
                File apkFile = new File(mSavePath, mName);
                FileOutputStream fos = new FileOutputStream(apkFile);
                int count = 0;
                // 缓存
                byte buf[] = new byte[1024];
                // 写入到文件中
                do
                {
                    int numread = is.read(buf);
                    count += numread;
                    // 计算进度条位置
                    progress = (int) (((float) count / length) * 100);
                    // 更新进度
                    mHandler.sendEmptyMessage(DOWNLOAD);
                    if (numread <= 0)
                    {
                        // 下载完成
                        mHandler.sendEmptyMessage(DOWNLOAD_FINISH);
                        break;
                    }
                    // 写入文件
                    fos.write(buf, 0, numread);
                } while (!cancelUpdate);// 点击取消就停止下载.
                fos.close();
                is.close();
            } catch (MalformedURLException e)
            {
                e.printStackTrace();
            } catch (IOException e)
            {
                e.printStackTrace();
            }
            // 取消下载对话框显示
            if (mDownloadDialog!=null) {
            	 mDownloadDialog.dismiss();
            	 mDownloadDialog = null ;
                 // 设置取消状态
                 luaj.callFunctionWithParam("UpgradeUtil","{\"ret\":-2,\"event\":\"failDownload\"}");
            }
        }
    };

    /**
     * 安装APK文件
     */
    private void installApk()
    {
        File apkfile = new File(mSavePath, mName);
        if (!apkfile.exists())
        {
            return;
        }

        // 通过Intent安装APK文件
        Intent intent = new Intent(Intent.ACTION_VIEW);
        Uri uri;
        if(Build.VERSION.SDK_INT >= 24){
            intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            //第二个参数需要与<provider>标签中的android:authorities属性相同
            uri = FileProvider.getUriForFile(mContext,mContext.getApplicationContext().getPackageName() + ".fileprovider", apkfile);
        }else{
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            uri = Uri.fromFile(apkfile);
        }
        intent.setDataAndType(uri ,"application/vnd.android.package-archive");
        mContext.startActivity(intent);
    }
}
