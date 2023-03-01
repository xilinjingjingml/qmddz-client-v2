package org.cocos2dx.utils;

import org.json.JSONObject;

public interface ResponseCallback {

	void onFailure();
	void onSuccess(JSONObject jsonObject);
}