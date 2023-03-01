package org.cocos2dx.plugin;

public interface InterfacePlatform {
	public final int PluginType = 9;
	
	public String getSDKVersion();
	public String getPluginVersion();
	public void setDebugMode(boolean debug);
}
