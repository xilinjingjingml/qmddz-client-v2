package org.cocos2dx.plugin;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.cocos2dx.config.MsgStringConfig;
import org.cocos2dx.utils.HttpsClientUtil;
import org.json.JSONException;
import org.json.JSONObject;
import android.annotation.SuppressLint;
import android.media.MediaRecorder;
import android.os.Handler;
import android.util.Log;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

@SuppressLint({ "DefaultLocale", "InlinedApi", "SdCardPath" })
public class RecordManager {
	
	private static final int STATE_NORMAL = 1;
	private static final int STATE_RECORDING = 2;
	private static final int STATE_WANT_TO_CANCEL = 3;
	private static final int STATE_WAIT_TO_UPLOAD = 4;
	
	private int mCurrentState = STATE_NORMAL;
	
	private MediaRecorder mRecorder;
	//private String mDirString;
	public static String mCurrentFilePathString;

	private boolean isPrepared = false;// 是否准备好了
	// 已经开始录音
	private boolean isRecording = false;
	private float mTime = 0;

	public static RecordManager mInstance;
	
	public static String uid = "";
	
	private static String mUploadURL = "http://upload.bdo.hiigame.com/upload";
	
	private ExecutorService cachedThreadPool = Executors.newCachedThreadPool();

	private RecordManager() {
		
	}

	public static RecordManager getInstance() {
		if (mInstance == null) {
			synchronized (RecordManager.class) {
				if (mInstance == null) {
					mInstance = new RecordManager();
				}
			}
		}
		return mInstance;
	}
	
	public static final int VOICE_EVENT_RECORD_START= 1;
	public static final int VOICE_EVENT_RECORDING = 2;
	public static final int VOICE_EVENT_WANT_TO_CANCEL = 3;
	public static final int VOICE_EVENT_RECORD_TOO_SHORT = 4;
	public static final int VOICE_EVENT_RECORD_OVER = 5;
	public static final int VOICE_EVENT_UPLOAD_START = 6;
	public static final int VOICE_EVENT_UPLOAD_OVER = 7;
	public static final int VOICE_EVENT_UPLOAD_FAIL = 8;
	
	public interface VoiceEventListener {
		void onEvent(int event,String param);
	}

	public VoiceEventListener mListener;

	public void setOnVoiceEventListener(VoiceEventListener listener) {
		mListener = listener;
	}

	// 准备三个常量
	private static final int MSG_VOICE_CHANGE = 0X111;
	private static final int MSG_DIALOG_DIMISS = 0X112;
	private static final int MSG_UPLOAD_OVER = 0X113;
	private static final int MSG_YUN_UPLOAD_OVER = 0X114;
	
	@SuppressLint("HandlerLeak")
	public Handler mhandler = new Handler() {
		public void handleMessage(android.os.Message msg) {
			switch (msg.what) {
			case MSG_VOICE_CHANGE:
				//mDialogManager.updateVoiceLevel(getVoiceLevel(7));
				if(mListener != null){
					int level = getVoiceLevel(7);
					mListener.onEvent(VOICE_EVENT_RECORDING, String.valueOf(level));
				}
				break;
			case MSG_DIALOG_DIMISS:
				//mDialogManager.dimissDialog();
				if(mListener != null){
					mListener.onEvent(VOICE_EVENT_RECORD_OVER, "");
					PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_OVER, MsgStringConfig.msgRecordVoiceOver, "");
				}
				break;
			case MSG_UPLOAD_OVER:
				//mDialogManager.dimissDialog();
				if(mListener != null){
					if(msg.arg1 == 1){
						JSONObject obj = (JSONObject)msg.obj;
						try
						{
							String imgUrl = obj.getString("imgUrl");
							mListener.onEvent(VOICE_EVENT_UPLOAD_OVER,imgUrl);
							//mListener.onEvent(VOICE_EVENT_UPLOAD_OVER,mCurrentFilePathString);
							PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_UPLOAD_OVER, MsgStringConfig.msgRecordVoiceUploadOver, imgUrl);
						}
						catch (JSONException e) 
						{
							mListener.onEvent(VOICE_EVENT_UPLOAD_FAIL, "");
							e.printStackTrace();
						}
						
					}else{
						mListener.onEvent(VOICE_EVENT_UPLOAD_FAIL, "");
					}	
				}
				break;
			case MSG_YUN_UPLOAD_OVER:
				if(mListener != null){
					String imgUrl = (String)msg.obj;
					mListener.onEvent(VOICE_EVENT_UPLOAD_OVER,imgUrl);
				}
				break;
			}
		};
	};
		
	private Runnable mGetVoiceLevelRunnable = new Runnable() {
		@Override
		public void run() {
			while (isRecording) {
				try {
					Thread.sleep(100);
					mInstance.mTime += 0.1f;
					
					
					//if (mInstance.mTime >= 10)
					//	mInstance.voiceOver();
					
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
		}
	};

	//开始录音
	public void prepareAudio(String playerID) {
		Log.i("prepareAudio state = ", ""+mCurrentState);
		if (mCurrentState != STATE_NORMAL || isRecording) {
			PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_FAIL, MsgStringConfig.msgRecordVoiceFail, "");
			return;
		}
		
		try {
			// 一开始应该是false的
			isPrepared = false;

			String fileNameString = generalFileName(playerID);
			String dirName = "/data/data/"+PluginWrapper.getContext().getPackageName()+"/files";
			File file = new File(dirName, fileNameString);
			//if (!file.exists()){
				file.createNewFile();		
			//}
			if (!file.exists()){
				Log.i("mCurrentFilePathString", "file not exists");				
			}
			
			uid = playerID;

			//File file = File.createTempFile(playerID,".mp3", dir);
			
			mCurrentFilePathString = file.getAbsolutePath();
			Log.i(mCurrentFilePathString, "mCurrentFilePathString");
			//mCurrentFilePathString = dir+"/"+fileNameString;

			mRecorder = new MediaRecorder();
			// 设置meidaRecorder的音频源是麦克风
			mRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
			// 设置文件音频的输出格式为amr
			//mRecorder.setOutputFormat(MediaRecorder.OutputFormat.AMR_NB);
			mRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
			// 设置音频的编码格式为amr
			
			// 设置输出文件
			mRecorder.setOutputFile(file.getAbsolutePath());
			
			mRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);

			// 严格遵守google官方api给出的mediaRecorder的状态流程图
			mRecorder.prepare();
			mRecorder.start();
			// 准备结束
			isPrepared = true;
			isRecording = true;
			//mDialogManager.showRecordingDialog();
			mTime = 0;
			//new Thread(mGetVoiceLevelRunnable).start();
			cachedThreadPool.execute(mGetVoiceLevelRunnable);
			changeState(STATE_RECORDING);
		} catch (IllegalStateException e) {
			e.printStackTrace();
			PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_FAIL, MsgStringConfig.msgRecordVoiceFail, "");
		} catch (IOException e) {
			e.printStackTrace();
			PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_FAIL, MsgStringConfig.msgRecordVoiceFail, "");
		} catch (Exception e){
			e.printStackTrace();
			PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_FAIL, MsgStringConfig.msgRecordVoiceFail, "");
		}
	}

	/**
	 * 随机生成文件的名称
	 * 
	 * @return
	 */
	@SuppressLint("DefaultLocale")
	private String generalFileName(String playerID) {
		String str = String.format("%s_%d.mp3", playerID,System.currentTimeMillis());
		return str;
	}

	// 获得声音的level
	public int getVoiceLevel(int maxLevel) {
		if (isPrepared) {
			try {
				// 取证+1，否则去不到7
				return maxLevel * mRecorder.getMaxAmplitude() / 32768 + 1;
			} catch (Exception e) {

			}
		}

		return 1;
	}

	// 释放资源
	public void release() {
	    if (mRecorder != null) {  
	        try {  
	            //下面三个参数必须加，不加的话会奔溃，在mediarecorder.stop();  
	            //报错为：RuntimeException:stop failed  
	        	mRecorder.setOnErrorListener(null);  
	        	mRecorder.setOnInfoListener(null);    
	            mRecorder.setPreviewDisplay(null);  
	            mRecorder.stop();  
	        } catch (IllegalStateException e) {  
				mRecorder = null;
				mRecorder = new MediaRecorder();
	            Log.i("Exception", Log.getStackTraceString(e));  
	        }catch (RuntimeException e) {  
	            Log.i("Exception", Log.getStackTraceString(e));  
	        }catch (Exception e) {  
	            Log.i("Exception", Log.getStackTraceString(e));  
	        }  
	        mRecorder.release();  
	        mRecorder = null;  
	    }  
	}

	// 取消,因为prepare时产生了一个文件，所以cancel方法应该要删除这个文件，
	// 这是与release的方法的区别
	public void cancel() {
		release();
		if (mCurrentFilePathString != null) {
			File file = new File(mCurrentFilePathString);
			file.delete();
			mCurrentFilePathString = null;
		}
		reset();// 恢复标志位
	}
	private void reset() {
		isRecording = false;
		changeState(STATE_NORMAL);
		mTime = 0;
	}

	public String getCurrentFilePath() {
		return mCurrentFilePathString;
	}
	public void voiceOver(Hashtable<String, String> itemsInfo){
		mUploadURL = itemsInfo.get("UpLoadURL");
		voiceOver();
	}
	public void voiceOver(){
		if (mCurrentState == STATE_WAIT_TO_UPLOAD){
			
		}
		else if (!isRecording || mTime < 0.6f) {
			isRecording = false;
			if(mListener != null){
				mListener.onEvent(VOICE_EVENT_RECORD_TOO_SHORT,"");
			}
			cancel();
			mhandler.sendEmptyMessageDelayed(MSG_DIALOG_DIMISS, 1300);// 持续1.3s
		}
		else if (mCurrentState == STATE_WANT_TO_CANCEL) {
			isRecording = false;
			cancel();
			if(mListener != null){
				mListener.onEvent(VOICE_EVENT_RECORD_OVER, "");
				PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_OVER, MsgStringConfig.msgRecordVoiceOver, "");
			}
		}
		else if (mCurrentState == STATE_RECORDING) {//正常录制结束
			isRecording = false;
			if(mListener != null){
				mListener.onEvent(VOICE_EVENT_UPLOAD_START, String.valueOf(mTime));
			}
			release();// release释放一个mediarecorder
			uploadSound();
			//uploadSoundByUpYun();
			//doUploadFileByQCloud();
			//changeState(STATE_WAIT_TO_UPLOAD);
		}
		//reset();// 恢复标志位
	}
	public void voiceWantToCancel(){
		if(mCurrentState == STATE_RECORDING){
			isRecording = false;
			//changeState(STATE_WANT_TO_CANCEL);	

			isRecording = false;
			cancel();
			mCurrentState = STATE_NORMAL;
		}
	}

	private void changeState(int state) {
		if (mCurrentState != state) {
			mCurrentState = state;
			switch (mCurrentState) {
			case STATE_NORMAL:
				break;
			case STATE_RECORDING:
				if (isRecording) {
					//mDialogManager.recording();
					if(mListener != null){
						mListener.onEvent(VOICE_EVENT_RECORD_START, "");
						PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_START, MsgStringConfig.msgRecordVoiceStart, "");
					}
				}
				break;
			case STATE_WANT_TO_CANCEL:
				//mDialogManager.wantToCancel();
				if(mListener != null){
					mListener.onEvent(VOICE_EVENT_WANT_TO_CANCEL,"");
					PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_CANCEL, MsgStringConfig.msgRecordVoiceCancel, "");
				}
				
				break;
			case STATE_WAIT_TO_UPLOAD:
				PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_UPLOAD_START, MsgStringConfig.msgRecordVoiceUploadStart, mCurrentFilePathString);
				break;
			}
		}
	}
	
	private static final String TAG = "uploadFile";
	private static final int TIME_OUT = 10 * 1000; 	// 超时时间
	private static final String CHARSET = "utf-8"; 	// 设置编码
	
	@SuppressWarnings("rawtypes")
	private static ArrayList voiceFileList = new ArrayList(); 
	@SuppressWarnings("rawtypes")
	private static ArrayList voiceLength = new ArrayList();
	
	public String uploadFile(String filepath, String RequestURL)
	{
		File file = new File(filepath);
		String filename = file.getName();
		String result = null;
		String url = RequestURL.replaceAll("http://", "https://")+"?uid="+uid;
		try {
			RequestBody requestBody = new MultipartBody.Builder()
					.setType(MultipartBody.FORM)
					.addFormDataPart("file", filename,
							RequestBody.Companion.create(file, MediaType.Companion.parse("multipart/form-data")))
					.build();
			Request request = new Request.Builder().url(url).post(requestBody).build();
			Response response = HttpsClientUtil.getClient().newCall(request).execute();
			if (response.isSuccessful()){
				result = response.body().string();
			} else {
				PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_UPLOAD_FAIL, MsgStringConfig.msgUploadHeadfaceFail, "");
			}

			response.body().close();
		} catch (IOException e) {
			e.printStackTrace();
			PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_UPLOAD_FAIL, MsgStringConfig.msgUploadHeadfaceFail, "");
		}
		return result;
	}
	@SuppressWarnings("unchecked")
	public void uploadSound()
	{	
		//final String filename = mCurrentFilePathString;
		//final File file = new File(filename);
		
		voiceFileList.add(mCurrentFilePathString);
		int time = (int) Math.ceil(mTime);//(mTime % 1 > 0 ? Math.floor(mTime) + 1 : Math.floor(mTime));
		voiceLength.add(time);
		//if (voiceFileList.size() > 0)
		//{
		//	voiceFileList.add(mCurrentFilePathString);			
		//}
		if (voiceFileList.size() <= 1)
		{
			//new Thread(new Runnable()
			cachedThreadPool.execute(new Runnable()
			{
				@Override
				public void run()
				{
					while(voiceFileList.size() > 0)
					{
						// 上传到云端
						String filename = (String) voiceFileList.get(0);
						String newFileName = uploadFile(filename, mUploadURL);
						if(newFileName != null && !"".equals(newFileName))
						{
							int time = (Integer) voiceLength.get(0);
							JSONObject json;
							try 
							{
								json = new JSONObject(newFileName);
								String imgUrl = json.getString("imgUrl");
								PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_UPLOAD_OVER, MsgStringConfig.msgRecordVoiceUploadOver, time+"|"+imgUrl);
							} 
							catch (JSONException e) 
							{
								e.printStackTrace();
								PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_UPLOAD_FAIL, MsgStringConfig.msgRecordVoiceUploadFail, "");
							}

							if (null != filename && filename.length() > 0){
								File f = new File(filename);
								if (f != null) f.delete();
							}
							//mCurrentFilePathString = null;
							
							//mCurrentState = STATE_NORMAL;
							voiceFileList.remove(0);	
							voiceLength.remove(0);
						}else{
							PlatformWP.platformResult(PlatformWrapper.RECORDVOICE_UPLOAD_FAIL, MsgStringConfig.msgRecordVoiceUploadFail, "");
							/*
							if (null != filename && filename.length() > 0){
									File f = new File(filename);
									if (f != null){
										String fileNameString = generalFileName(uid);
										String dirName = "/data/data/"+PluginWrapper.getContext().getPackageName()+"/files";
										File file = new File(dirName, fileNameString);

										f.renameTo(file);

										voiceFileList.set(0, f.getAbsolutePath());
									}
								}
								*/
						}
						try{
							Thread.sleep(200);
						}
						catch(Exception e)
						{
							e.printStackTrace();
						}
					}
				}
				
			});//, "uploadSoundChat").start();
		}
		
		mCurrentState = STATE_NORMAL;

	}
	
//    private void initEnv() {
//    }

	public interface IMkDirListener {
        public void onMkDirSuccess(String path, String accessUrl);
        public void onMkDirFailure(String path, int errcode, String errmsg);
    }


	 // 文件上传
//    private void doUploadFileByQCloud() {
//		Date d = new Date();  
//		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd",Locale.CHINA);  
//	    String dateNowStr = sdf.format(d); 
//     
//    }
}
