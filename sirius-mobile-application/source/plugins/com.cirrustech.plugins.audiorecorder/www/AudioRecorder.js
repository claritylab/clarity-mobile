function AudioRecorder() {
}

AudioRecorder.prototype.record = function (successCallback, errorCallback) {
  cordova.exec(successCallback, errorCallback, "AudioRecorder", "record", []);
};

AudioRecorder.install = function () {
  if (!window.plugins) {
    window.plugins = {};
  }

  window.plugins.audiorecorder = new AudioRecorder();
  return window.plugins.audiorecorder;
};

cordova.addConstructor(AudioRecorder.install);