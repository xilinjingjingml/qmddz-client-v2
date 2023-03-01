package org.cocos2dx.plugin;

import java.io.File;
import java.io.IOException;
import org.cocos2dx.config.MsgStringConfig;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnBufferingUpdateListener;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnErrorListener;
import android.media.MediaPlayer.OnPreparedListener;

public class PlayerManager implements OnCompletionListener,  
OnErrorListener, OnBufferingUpdateListener, OnPreparedListener{

	private static PlayerManager mInstance;

	private MediaPlayer mPlayer;
	private boolean isPause;
	
	private static String mFilePath;
	
	private PlayerManager() {
		
	}
	public static PlayerManager getInstance() {
		if (mInstance == null) {
			synchronized (RecordManager.class) {
				if (mInstance == null) {
					mInstance = new PlayerManager();
				}
			}
		}
		return mInstance;
	}
	public static final int PLAY_EVENT_BUFFER= 1;
	public static final int PLAY_EVENT_PLAYING = 2;
	public static final int PLAY_EVENT_PAUSE = 3;
	public static final int PLAY_EVENT_RESUME = 4;
	public static final int PLAY_EVENT_PLAY_OVER = 5;
	public static final int PLAY_EVENT_ERROR = 6;
	
	public interface VoicePlayEventListener {
		void onEvent(int event,int param);
	}

	public VoicePlayEventListener mListener;

	public void setOnVoicePlayEventListener(VoicePlayEventListener listener) {
		mListener = listener;
	}

	public void playSound(String filePathString) {
		if(filePathString.endsWith("!p300") == true)
		{
			filePathString = filePathString.replace("!p300", "!bac");
		}
		if (mPlayer==null) {
			mPlayer=new MediaPlayer();
		}else {
			//mPlayer.stop();
			mPlayer.reset();//就回复
		}
		
		try {
			mFilePath = filePathString;
			
			if (mFilePath.startsWith("http://")) {
				//mPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
				mPlayer.setAudioAttributes(new AudioAttributes.Builder()
						.setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
						.setLegacyStreamType(AudioManager.STREAM_ALARM)
						.setUsage(AudioAttributes.USAGE_ALARM)
						.setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
						.build());
			}
			mPlayer.setOnCompletionListener(this);  
			mPlayer.setOnErrorListener(this);  
			mPlayer.setOnBufferingUpdateListener(this);  
			mPlayer.setOnPreparedListener(this);  
	        
			mPlayer.setDataSource(filePathString);
			mPlayer.prepareAsync();
			//mPlayer.start();
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
		} catch (SecurityException e) {
			e.printStackTrace();
		} catch (IllegalStateException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * 当MediaPlayer正在缓冲时，将调用该Activity的onBufferingUpdate方法。
	 */
	@Override
	public void onBufferingUpdate(MediaPlayer mp, int percent) {
		if(mListener != null){
			mListener.onEvent(PLAY_EVENT_BUFFER, percent);
		}
	}

	/**
	 * 当完成prepareAsync方法时，将调用onPrepared方法，表明音频准备播放。
	 */
	@Override
	public void onPrepared(MediaPlayer mp) {
		mPlayer.start();
		if(mListener != null){
			mListener.onEvent(PLAY_EVENT_PLAYING, 0);			
		}
		//Cocos2dxLuaJavaBridge.callLuaFunctionWithString(m_luaPlayVoiceCallbackFunction, "error");
		//Cocos2dxLuaJavaBridge.releaseLuaFunction(m_luaPlayVoiceCallbackFunction);
		PlatformWP.platformResult(PlatformWrapper.PLAYSOUND_START, MsgStringConfig.msgPlaySoundStart, "");
	}

	@Override
	public void onCompletion(MediaPlayer mp) {
		if(mListener != null){
			mListener.onEvent(PLAY_EVENT_PLAY_OVER, 0);
		}
		if (!mFilePath.startsWith("http://"))
			new File(mFilePath).delete();
		PlatformWP.platformResult(PlatformWrapper.PLAYSOUND_OVER, MsgStringConfig.msgPlaySoundOver, "");
	}
	@Override
	public boolean onError(MediaPlayer mp, int what, int extra) { 
		switch(what){
		case MediaPlayer.MEDIA_ERROR_NOT_VALID_FOR_PROGRESSIVE_PLAYBACK:
			break;
		default:
			break;		
		}
		mp.reset();
		if(mListener != null){
			mListener.onEvent(PLAY_EVENT_ERROR, 0);			
		}
		PlatformWP.platformResult(PlatformWrapper.PLAYSOUND_ERROR, MsgStringConfig.msgPlaySoundError, "");
		if (!mFilePath.startsWith("http://"))
			new File(mFilePath).delete();
		return false;
	}
	//停止函数
	public void pause(){
		if (mPlayer!=null&&mPlayer.isPlaying()) {
			mPlayer.pause();
			isPause=true;
			if(mListener != null){
				mListener.onEvent(PLAY_EVENT_PAUSE, 0);
				PlatformWP.platformResult(PlatformWrapper.PLAYSOUND_PAUSE, MsgStringConfig.msgPlaySoundPause, "");
			}
		}
	}
	//继续
	public void resume()
	{
		if (mPlayer!=null&&isPause) {
			mPlayer.start();
			isPause=false;
			if(mListener != null){
				mListener.onEvent(PLAY_EVENT_RESUME, 0);
				PlatformWP.platformResult(PlatformWrapper.PLAYSOUND_RESUME, MsgStringConfig.msgPlaySoundResume, "");
			}
		}
	}
	public void reset()
	{
		if (mPlayer!=null) {
			mPlayer.reset();
		}
	}
	public void release()
	{
		if (mPlayer!=null) {
			mPlayer.release();
			mPlayer=null;
		}
	}
	
	public void stopSound() {
		if ( mPlayer != null && mPlayer.isPlaying() ){
			try{
				mPlayer.stop();
				
				if (!mFilePath.startsWith("http://"))
					new File(mFilePath).delete();
				
				PlatformWP.platformResult(PlatformWrapper.PLAYSOUND_STOP, MsgStringConfig.msgPlaySoundStop, "");
			} catch (IllegalArgumentException e) {
				e.printStackTrace();
			} catch (SecurityException e) {
				e.printStackTrace();
			} catch (IllegalStateException e) {
				e.printStackTrace();
			}
		}
	}
	
}


