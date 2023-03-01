package org.cocos2dx.plugin;

import java.util.Hashtable;

public class PluginInfo {
	private String name;
	private String type;
	
	private Hashtable<String, String> extendParam;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public Hashtable<String, String> getExtendParam() {
		return extendParam;
	}

	public void setExtendParam(Hashtable<String, String> extendParam) {
		this.extendParam = extendParam;
	}
	
	static public PluginInfo create(String pluginName,String pluginType) {
		PluginInfo inst = new PluginInfo();
		inst.setName(pluginName);
		inst.setType(pluginType);
		return inst;
	}
}
