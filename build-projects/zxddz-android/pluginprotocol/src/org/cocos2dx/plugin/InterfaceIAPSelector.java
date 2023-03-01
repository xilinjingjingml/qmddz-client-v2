package org.cocos2dx.plugin;

import java.util.Hashtable;

public interface InterfaceIAPSelector {
	
	public final int PluginType = 8;

	public void configDeveloperInfo(Hashtable<String, String> cpInfo);
	public void payForProduct(Hashtable<String, String> cpInfo);
	public void setDebugMode(boolean debug);
	public void setRunEnv(int env);
	public String getSDKVersion();
	public String getPluginVersion();

}
