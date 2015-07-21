/*
 * Sirius Mobile Application
 * Developed with Apache Cordova and Apache Thrift
 * More info at http://sirius.clarity-lab.org/
 * Written by Tim Wurman
 */

var image, audio, encodedAudioData = "", encodedImageData = "", text = "";
var mediaTimer = null;
var media = null;

function onload() {
    document.getElementById("ip").value = storage.getItem("ip");
    document.getElementById("port").value = storage.getItem("port");

    document.getElementById('toggle').addEventListener('click',function(e){
        toggleView('textMode');
    });
}
window.addEventListener("load", onload);

function toggleView(div) {
    if(document.getElementById(div).style.display == 'none') {
        document.getElementById(div).style.display = 'block';
    } else {
        document.getElementById(div).style.display = 'none';
    }
}


// -------------- Capture Functions -------------- //
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
    // var temp = (imageURI.search('tmp') > -1);
    processImage();
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
        processImage();
    }
}

function processImage() {
    $('#image_file').empty();
    $('#image_file').append("<canvas id='image_viewer' width='150' height='150'> </canvas> <br>");

    var tmpImage = new Image();
    tmpImage.onload = function() {
        var canvas = document.getElementById('image_viewer');
        var ctx = canvas.getContext('2d');
        //draw image, anchor at (0,0) with size xi, yi into canvas anchor at (0,0) within xc, yc
        ctx.drawImage(tmpImage, 0, 0, tmpImage.width, tmpImage.height,
                                0, 0, 150, 150);
        encodedImageData = canvas.toDataURL("image/jpeg", 1); //jpeg, quality 0 -> 1
        console.log(encodedImageData);
    }
    tmpImage.src = image.fullPath;
    
    $('#image_file').append("<p>");
    $('#image_file').append(image.name);
    $('#image_file').append("<input class='btnIconSmall' type='image' id='clearImage' src='img/x.png'>");
    $('#image_file').append("</p>");
    document.getElementById("clearImage").addEventListener("click",clearImage);
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
    $('#audio_file').append(audio.name);
    $('#audio_file').append("<input class='btnIconSmall' type='image' id='playAudio' src='img/play.png'>");
    $('#audio_file').append("<input class='btnIconSmall' type='image' id='clearAudio' src='img/x.png'>");
    document.getElementById("playAudio").addEventListener("click",playAudio);
    document.getElementById("clearAudio").addEventListener("click",clearAudio);
    getFS(audio, "audio", LocalFileSystem.TEMPORARY);
    updateResponseDiv("Sending...");
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
        askServer(); //immediately send audio
    };
    reader.readAsDataURL(file);
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
