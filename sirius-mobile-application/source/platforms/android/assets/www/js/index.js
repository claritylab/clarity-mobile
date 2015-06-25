/*
 * Sirius Mobile Application
 * Developed with Apache Cordova and Apache Thrift
 * More info at http://sirius.clarity-lab.org/
 */

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

var image, audio, encodedAudioData = "", encodedImageData = "", text = "";
var storage = window.localStorage;
var mediaTimer = null;
var media = null;

function onload() {
    document.getElementById("ip").value = storage.getItem("ip");
    document.getElementById("port").value = storage.getItem("port");
    // document.getElementById("asr").value = storage.getItem("asr");
    // document.getElementById("imm").value = storage.getItem("imm");
    // document.getElementById("qa").value = storage.getItem("qa");
    document.getElementById('V1').addEventListener('click',function(e){
        swapViews('v1','v2');
    });
    document.getElementById('V2').addEventListener('click',function(e){
        swapViews('v2','v1');
    });
}
window.addEventListener("load", onload);

function swapViews(one, two) {
    document.getElementById(one).style.display = 'block';
    document.getElementById(two).style.display = 'none';
}


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

function getPhoto() {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(getPhotoSuccess, getPhotoFail, { 
        quality: 50,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY 
    });
}
document.getElementById("getImage").addEventListener("click",getPhoto);

function getPhotoSuccess(imageURI) {
    //save as image
    imageURI = imageURI.replace('file://', '');
    console.log(imageURI);
    image = new MediaFile();
    image.fullPath = imageURI;
    image.name = imageURI.substr(imageURI.lastIndexOf('/') + 1);
    var temp = (imageURI.search('tmp') > -1);
    processImage(temp);
}

function getPhotoFail(message) {
    alert(message);
}

// Called when capture operation is finished
function captureImageSuccess(mediaFiles) {
    var i, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        image = mediaFiles[i];
        console.log(image.size);
        processImage(true); //always saves to temp so always true
    }
}

function processImage(temp) {
    $('#image_file').empty();
    $('#image_file').append("<canvas id='image_viewer' width='100' height='100'> </canvas> <br>");

    var tmpImage = new Image();
    tmpImage.onload = function() {
        var canvas = document.getElementById('image_viewer');
        var ctx = canvas.getContext('2d');
        //draw image, anchor at (0,0) with size xi, yi into canvas anchor at (0,0) within xc, yc
        ctx.drawImage(tmpImage, 0, 0, tmpImage.width, tmpImage.height,
                                0, 0, 100, 100);
        encodedImageData = canvas.toDataURL("image/jpeg", 1); //jpeg, quality 0 -> 1
        console.log(encodedImageData);
    }
    tmpImage.src = image.fullPath;
    
    // $('#image_viewer').drawImage(tmpImage, 0, 0, 100, 100);
    // $('#image_file').append("<img src='" + image.fullPath + "' style='width:80px;height:80px;'>");
    $('#image_file').append("<p>");
    $('#image_file').append(image.name);
    $('#image_file').append("<input class='btnIconSmall' type='image' id='clearImage' src='img/x.png'>");
    $('#image_file').append("</p>");
    document.getElementById("clearImage").addEventListener("click",clearImage);
    // encodedImageData = $('#image_viewer').toDataURL("image/jpeg");
    // console.log(encodedImageData);
    // if(temp) {
    //     getFS(image, "image", LocalFileSystem.TEMPORARY);    
    // } else {
    //     getFS(image, "image", LocalFileSystem.PERSISTENT);
    // }
}

function captureAudioSuccess(mediaFiles) {
    var i, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        audio = mediaFiles[i];
        processAudio();
    }
}

function processAudio() {
    $('#audio_file').empty();
    // $('#audio_file').append(audio.name);
    // $('#audio_file').append("<input class='btnIconSmall' type='image' id='playAudio' src='img/play.png'>");
    // // $('#audio_file').append("<button class='btnX' id='clearAudio' style='margin-left:5px'>X</button>");
    // $('#audio_file').append("<input class='btnIconSmall' type='image' id='clearAudio' src='img/x.png'>");
    // document.getElementById("playAudio").addEventListener("click",playAudio);
    // document.getElementById("clearAudio").addEventListener("click",clearAudio);
    getFS(audio, "audio", LocalFileSystem.TEMPORARY);
}

// Called if something bad happens.
function captureError(error) {
    var msg = 'An error occurred during capture: ' + error.code;
    if(error.code != 3) {
        navigator.notification.alert(msg, null, 'Uh oh!'); 
    }
}

// A button will call this function
function captureAudio() {
    // Launch device audio recording application, allowing user to capture up to 1 audio clips
    navigator.device.capture.captureAudio(captureAudioSuccess, captureError, { limit: 1 });
}
document.getElementById("captureAudio").addEventListener("click",captureAudio);

 // A button will call this function            
function captureImage() {
    // Launch device camera application, allowing user to capture up to 1 images
    navigator.device.capture.captureImage(captureImageSuccess, captureError, { limit: 1 });
}
document.getElementById("captureImage").addEventListener("click",captureImage);

function playAudio() {
    if (audio == null) {
        // Nothing to play
        return;
    } 
    media = new Media(audio.fullPath, onSuccess, onError);
    // Play audio
    media.play();
}

// onSuccess Callback
//
function onSuccess() {
    console.log("playAudio():Audio Success");
}

// onError Callback
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

//temporary determine which function gets called back
//fix this an template the functions
function getFS(file, type, fs){
    if(file){
        if(type == "audio") {
            console.log("audio file lookup");
            window.requestFileSystem(fs, 0, gotFSAudio, fail);
        } else {
            console.log("image file lookup");
            window.requestFileSystem(fs, 0, gotFSImage, fail);
        }
    } else {
        console.log("No file recorded!");
    }
}

function gotFSAudio(fileSystem) {
    fileSystem.root.getFile(audio.name, null, gotAudioEntry, fail);
}

function gotFSImage(fileSystem) {
    fileSystem.root.getFile(image.name, null, gotImageEntry, fail);
}

function gotAudioEntry(fileEntry) {
    fileEntry.file(readDataUrlAudio, fail);
}

function gotImageEntry(fileEntry) {
    fileEntry.file(readDataUrlImage, fail);
}

function readDataUrlAudio(file) {
    var reader = new FileReader();
    reader.onloadend = function(evt) {
        console.log("Read as data URL");
        console.log(evt.target.result);
        encodedAudioData = String(evt.target.result);
        askServer();
    };
    reader.readAsDataURL(file);
    //adding immediate send
}

function readDataUrlImage(file) {
    var reader = new FileReader();
    reader.onloadend = function(evt) {
        console.log("Read as data URL");
        encodedImageData = String(evt.target.result);
        
        console.log(encodedImageData);
    };
    reader.readAsDataURL(file);
}

function fail(evt) {
    console.log(evt.target.error.code);
}

function sendFile(){
    console.log("Sending file");
    
    try {
        var addr = getAddress(getItem('port'), 'fts');
        var transport = new Thrift.TXHRTransport(addr);
        var protocol  = new Thrift.TJSONProtocol(transport);
        var client = new FileTransferSvcClient(protocol);

        var audioFormat = "", imageFormat = "";
        if(encodedAudioData) {
            var substr = encodedAudioData.substr(0, encodedAudioData.indexOf(",") + 1);
            var audioFormat = substr.substr(substr.indexOf("/") + 1, substr.indexOf(";")  - substr.indexOf("/") - 1);
            encodedAudioData = encodedAudioData.replace(substr, "");
        } if(encodedImageData) {
            var substr = encodedImageData.substr(0, encodedImageData.indexOf(",") + 1);
            var imageFormat = substr.substr(substr.indexOf("/") + 1, substr.indexOf(";") - substr.indexOf("/") - 1);
            encodedImageData = encodedImageData.replace(substr, "");
        }

        var qData = new QueryData();
        qData.audioData = encodedAudioData;
        qData.audioFormat = audioFormat;
        qData.audioB64Encoding = true;
        qData.imgData = encodedImageData;
        qData.imgFormat = imageFormat;
        qData.imgB64Encoding = true;
        qData.textData = text;

        var d = new Date();
        var uuid = window.device.uuid + d.getTime();
        console.log(qData);
        client.send_file(qData, uuid);
    } catch(err) {
        console.log(err);
        //could not connect to server
        if(err.name == "NETWORK_ERR" || err.name == "TIMEOUT_ERR") {
            navigator.notification.alert('There was a problem connecting to the server', null, 'Connection Error');
            updateResponseDiv("Error");
            return;
        }
        //otherwise ignore the error
    }    

     getResponse(uuid);
}

var timeoutFunc;

function getResponse(uuid) {
    // var msg = "Waiting for response...";
    var msg = "Waiting for response...    <input class='btnIconSmall' type='image' id='cancelRequest' src='img/x.png'>";
    updateResponseDiv(msg);
    document.getElementById("cancelRequest").addEventListener("click",cancelRequest);

    var response = "processing";
    var addr = getAddress(getItem('port'), 'fts');
    var transport = new Thrift.TXHRTransport(addr);
    var protocol  = new Thrift.TJSONProtocol(transport);
    var client = new FileTransferSvcClient(protocol);
    try{
        response = client.get_response(uuid); 
        console.log(response);
    } catch(err) {
        console.log(err);
        if(err.name == "NETWORK_ERR" || err.name == "TIMEOUT_ERR") {
            navigator.notification.alert('There was a problem connecting to the server', null, 'Connection Error');
            updateResponseDiv("Error");
            return;
        } 
    }

    //poll for response once a second
    if(response == "processing") {
        timeoutFunc = setTimeout(function() { 
            getResponse(uuid); 
        }, 1000);
    } else {
        processResponse(response);
    }
}

function cancelRequest() {
    clearTimeout(timeoutFunc);
    updateResponseDiv("Request Canceled");
}
// document.getElementById("getResponse").addEventListener("click",getResponse);

function askServer() {
    if(audio || image || text) {
        updateResponseDiv("Sending...");
        sendFile();
    } else {
        console.log("Nothing to send!");
        navigator.notification.alert('Nothing to send!', null, 'Oops!');
    }
}
document.getElementById("askServer").addEventListener("click",askServer);

function getItem(key) {
    return document.getElementById(key).value;
}

function getAddress(port, destination) {
    return 'http://' + getItem('ip') + ':' + port + '/' + destination;
}

function processResponse(data) {
    if(data) {
        updateResponseDiv(data);
        TTS.speak({
            text: String(data),
            locale: 'en-GB',
            rate: 0.75
        }, function () {
            //do nothing
        }, function (reason) {
            navigator.notification.alert(reason, null, 'Uh oh!');
        });
    } else {
        updateResponseDiv("Response is empty");
    }
}

