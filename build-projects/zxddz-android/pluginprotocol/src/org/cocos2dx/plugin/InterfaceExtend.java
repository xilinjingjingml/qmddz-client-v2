package org.cocos2dx.plugin;


public interface InterfaceExtend {
	public final int PluginType = 6;
	
	public String getSDKVersion();
	public String getPluginVersion();
	public void setDebugMode(boolean debug);
	
//	/**
//	 * 个人中心入口
//	 */
//	public void enterUserCenter();
//
//	/**
//	 * 社区入口
//	 */
//	public void showSoical();
//
//	/**
//	 * 用户反馈入口
//	 */
//	public void feedBack();
//
//	/**
//	 * 论坛入口
//	 */
//	public void showBBS();
//	
//	/**
//	 * 工具条
//	 */
//	public void createToolBar();

//	/**
//	 * 拓展统一接口
//	 */
//	public void jumpToExtend(int tag);
}
