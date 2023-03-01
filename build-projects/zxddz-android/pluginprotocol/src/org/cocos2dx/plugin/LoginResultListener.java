package org.cocos2dx.plugin;

import org.json.JSONObject;

public interface LoginResultListener {
	
	public void loginResult(int ret,String msg,JSONObject json);

}
