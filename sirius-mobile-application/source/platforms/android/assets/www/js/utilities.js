/*
 * Sirius Mobile Application
 * Developed with Apache Cordova and Apache Thrift
 * More info at http://sirius.clarity-lab.org/
 * Written by Tim Wurman
 */

var storage = window.localStorage;

// -------------- Utility Functions -------------- //
function updateDefaults(key, value) {
    storage.setItem(key, value);
}

function updateText(value) {
    text = value;
}

function updateResponseDiv(value) {
    $('#response').empty();
    $('#response').append("<p>" + value + "</p>");
}

function clear() {
    //variables
    clearAudio();
    clearImage();
    clearText();
    console.log("all media removed");
}

function clearAudio() {
    audio = null;
    encodedAudioData = "";
    $('#audio_file').empty();
    console.log("audio cleared");
}

function clearImage() {
    image = null;
    encodedImageData = "";
    $('#image_file').empty();
    console.log("image cleared");
}

function clearText() {
    text = "";
    $('#question').value = "";
}

function playAudio() {
    if (audio == null) {
        // Nothing to play
        return;
    } 
    media = new Media(audio.fullPath, onSuccess, onError);
    // Play audio
    media.play();
}

function onSuccess() {
    console.log("playAudio():Audio Success");
}

function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

function getItem(key) {
    return document.getElementById(key).value;
}

function getAddress(ip, port, destination) {
    return 'http://' + ip + ':' + port + '/' + destination;
}