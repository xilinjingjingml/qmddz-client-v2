package org.cocos2dx.plugin;

import android.content.Intent;

public interface ActivityResultDelegate
{
	void onActivityResult(int requestCode, int resultCode, Intent data);
}
