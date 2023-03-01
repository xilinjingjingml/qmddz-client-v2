package org.cocos2dx.utils;

import android.app.AlertDialog;
import android.app.AlertDialog.Builder;
import android.content.Context;
import android.content.DialogInterface.OnClickListener;

public class UIUtils
{

	/**
	 * 提示框（单个按钮）
	 * 
	 * @param context
	 * @param title
	 * @param msg
	 * @param bText
	 * @param listener
	 */
	public static void showialog(Context context, String title, String msg, String bText,
			OnClickListener listener)
	{
		AlertDialog.Builder builder = new Builder(context);
		builder.setTitle(title);
		builder.setMessage(msg);
		builder.setNegativeButton(bText, listener);

		builder.setCancelable(false);
		builder.create().show();
	}
	
	/**
	 * 通用提示框（两个按钮）
	 * 
	 * @param context
	 * @param title
	 * @param msg
	 * @param bText1
	 * @param bText2
	 * @param listener1
	 * @param listener2
	 */
	public static void showDialog(Context context, String title, String msg, String bText1, String bText2,
			OnClickListener listener1, OnClickListener listener2)
	{
		AlertDialog.Builder builder = new Builder(context);
		builder.setTitle(title);
		builder.setMessage(msg);
		builder.setPositiveButton(bText1, listener1);
		builder.setNegativeButton(bText2, listener2);

		builder.setCancelable(false);
		builder.create().show();
	}
}
