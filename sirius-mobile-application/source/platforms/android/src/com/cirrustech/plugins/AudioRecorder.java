package com.cirrustech.plugins;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;
import android.media.MediaPlayer;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.Environment;

public class AudioRecorder extends CordovaPlugin {

  private MediaRecorder myRecorder;
  private String outputFile;

  @Override
  public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
    outputFile = Environment.getExternalStorageDirectory().
        getAbsolutePath() + "/NSTURecording.m4a";


    // TODO here you could check if the action equals "record", to distinguish various API calls for you plugin
    myRecorder = new MediaRecorder();
    myRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
    myRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
    myRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
    myRecorder.setAudioSamplingRate(44100);
    myRecorder.setAudioChannels(1);
    myRecorder.setAudioEncodingBitRate(32000);
    myRecorder.setOutputFile(outputFile);

    try
    {
      myRecorder.prepare();
      myRecorder.start();
    }
    catch (final Exception e) {
      cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                callbackContext.error(e.getMessage());
            }
        });
      
      return false;
    }

    CountDownTimer countDowntimer = new CountDownTimer(7000, 1000) {
      public void onTick(long millisUntilFinished) {}

      public void onFinish() {
        myRecorder.stop();
        myRecorder.release();
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, outputFile));
            }
        });
        //return true;
      }
    };

    countDowntimer.start();

    return true;

  }

}
