package org.cocos2dx.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import org.apache.http.util.EncodingUtils;
import org.cocos2dx.config.MsgStringConfig;
import org.cocos2dx.plugin.PlatformWP;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.Context;
import android.content.ClipboardManager;
import android.widget.Toast;

public class BaseUtil
{
	/**
	 * 判断文件是否存在(/mnt/sdcard/目录下文件) 注意要使用绝对路径
	 * 
	 * @param fileName
	 * @return
	 */
	public static boolean exitsFile(String fileName)
	{
		File file = new File(fileName);
		if (!file.exists())
		{
			return false;
		}
		return true;
	}

	/**
	 * 写入/mnt/sdcard/目录下文件:
	 * 
	 * @param fileName
	 * @param writestr
	 * @throws IOException
	 */
	public static void writeFileToSD(String path, String fileName,
			String writestr) throws IOException
	{

		try
		{
			File file = new File(path, fileName);
			FileOutputStream fileOutputStream = new FileOutputStream(file);
			byte[] bytes = writestr.getBytes();
			fileOutputStream.write(bytes);
			fileOutputStream.close();
		}

		catch (Exception e)
		{
			e.printStackTrace();
		}
	}

	public static void writeFileToData(String fileName, String writestr,
			Context context) throws IOException
	{
		try
		{
			FileOutputStream fileOutputStream = context.openFileOutput(
					fileName, Activity.MODE_PRIVATE);
			byte[] bytes = writestr.getBytes();
			fileOutputStream.write(bytes);
			fileOutputStream.close();
		} catch (Exception e)
		{
			e.printStackTrace();
		}
	}

	/**
	 * 读取/mnt/sdcard/目录下的文件:
	 * 
	 * @param fileName
	 * @return
	 * @throws IOException
	 */
	public static String readFile(String path, String fileName)
			throws IOException
	{

		String result = "";

		try
		{
			File file = new File(path, fileName);
			FileInputStream fileInputStream = new FileInputStream(file);
			int length = fileInputStream.available();
			byte[] buffer = new byte[length];
			fileInputStream.read(buffer);
			result = EncodingUtils.getString(buffer, "UTF-8");
			fileInputStream.close();
		} 
		catch (Exception e)
		{
			e.printStackTrace();
		}

		System.out.println(result);

		return result;
	}

	/**
	 * 删除单个文件操作
	 * 
	 * @param fileName
	 * @return
	 */
	public static boolean deleteFile(String path, String fileName)
	{
		File file = new File(path, fileName);
		if (file.isFile() && file.exists())
		{
			file.delete();
			return true;
		}
		else
		{
			return false;
		}
	}

	/**
	 * 计算时间间隔
	 * 
	 * @param startTime
	 * @param endTime
	 * @param format
	 * @return
	 */
	@SuppressLint("SimpleDateFormat")
	public static long timeInterval(String startTime, String endTime,
			String format)
	{
		/* 按照传入的格式生成一个simpledateformate对象 */
		SimpleDateFormat sd = new SimpleDateFormat(format);
		long nd = 1000 * 24 * 60 * 60; // 一天的毫秒数
		long day = 0;
		long diff;
		try
		{
			/* 获得两个时间的毫秒时间差异 */
			diff = sd.parse(endTime).getTime() - sd.parse(startTime).getTime();
			day = diff / nd; // 计算差多少天
			// 输出结果
			System.out.println("时间相差：" + day + "天");
		} catch (ParseException e)
		{
			e.printStackTrace();
		}

		return day;
	}

	/**
	 * 获取当前时间
	 */
	@SuppressLint("SimpleDateFormat")
	public static String getDateTime()
	{
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date currentDate = new Date(System.currentTimeMillis());
		String time = formatter.format(currentDate);
		return time;
	}
	
	/**
	 * 适配API低于11的版本
	 * 
	 * @param context
	 * @param text
	 */
	public static void copyText(Context context, String text) 
	{
	    ClipboardManager cm = (ClipboardManager) context.getSystemService(Context.CLIPBOARD_SERVICE);
	    cm.setPrimaryClip(ClipData.newPlainText(null, text));
	    if(cm.hasPrimaryClip() && cm.getPrimaryClip().getItemAt(0).getText().equals(text))
	    {
	    	String msg = MsgStringConfig.msgCopyUidSuccess;
//			if (PlatformWP.languageinfo.get("msgCopyUidSuccess") != null){
//				msg = PlatformWP.languageinfo.get("msgCopyUidSuccess");
//			}
	    	Toast.makeText(context, msg, Toast.LENGTH_SHORT).show();
	    }
	    else
	    {
	    	String msg = MsgStringConfig.msgCopyUidFail;
//			if (PlatformWP.languageinfo.get("msgCopyUidFail") != null){
//				msg = PlatformWP.languageinfo.get("msgCopyUidFail");
//			}
	    	Toast.makeText(context, msg, Toast.LENGTH_SHORT).show();
	    }
	}

}
