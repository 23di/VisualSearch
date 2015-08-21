var interval = "";
var intervalTimer = 1000;
var tokenG = "";
var video_source = "";
// Put event listeners into place

window.addEventListener("DOMContentLoaded", function() {
    // Grab elements, create settings, etc.
    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d"),
        video = document.getElementById("video"),


        errBack = function(error) {
            console.log("Video capture error: ", error.code);
        };

    var video_source;

    MediaStreamTrack.getSources(function(media_sources) {
        for (var i = 0; i < media_sources.length; i++) {
            video_source = media_sources[i].id;
        }
        console.log("Using device id: " + video_source);
        videoObj = {

            video: {
                optional: [{
                    sourceId: video_source
                }]
            }
        }

        // Put video listeners into place
        if (navigator.getUserMedia) { // Standard
            navigator.getUserMedia(videoObj, function(stream) {
                video.src = stream;
                video.play();
            }, errBack);
        } else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
            navigator.webkitGetUserMedia(videoObj, function(stream) {
                video.src = window.URL.createObjectURL(stream);
                video.play();
            }, errBack);
        } else if (navigator.mozGetUserMedia) { // WebKit-prefixed
            navigator.mozGetUserMedia(videoObj, function(stream) {
                video.src = window.URL.createObjectURL(stream);
                video.play();
            }, errBack);
        }
    });

    // Trigger photo take
    document.getElementById("snap").addEventListener("click", function() {
        context.drawImage(video, 0, 0, 300, 180);
        saveImage();
    });
}, false);

function saveImage() {
    var dataURL = canvas.toDataURL('image/jpeg');
    var data = dataURL;
    var ajax = new XMLHttpRequest();
    ajax.open('POST', 'api/photo', true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.onreadystatechange = function() {
        console.log(ajax.responseText);
    }
    ajax.send(data);
    interval = setInterval('checkStatus()', intervalTimer);
}

function checkStatus() {
    tokenG = "";
    var ajaxStatus = new XMLHttpRequest();
    ajaxStatus.open('GET', "/api/status", false);
    ajaxStatus.setRequestHeader('Content-Type', 'application/javascript');
    ajaxStatus.onreadystatechange = function() {
        var responseToken = JSON.parse(ajaxStatus.responseText);

        if (responseToken.token == "") {
            console.log("Getting token");
        } else {
            document.getElementById("response").innerHTML = responseToken.token;
            tokenG = responseToken.token;
            console.log("Token is: " + responseToken.token);
            clearInterval(interval);
            interval = setInterval('getResult()', intervalTimer);
        }
    }
    ajaxStatus.send();
}

function getResult() {
    var ajaxResult = new XMLHttpRequest();
    ajaxResult.open('GET', "https://camfind.p.mashape.com/image_responses/" + tokenG, false);
    ajaxResult.setRequestHeader('Accept', 'application/json');
    ajaxResult.setRequestHeader('X-Mashape-Key', 'CP2KW30gmZmshk3lyzoXoXXtFzOPp1rO4wBjsnCTGIBGntiyi3');
    ajaxResult.onreadystatechange = function() {
        var response = JSON.parse(ajaxResult.responseText)
        if (response.status == "completed") {
            clearInterval(interval);
            console.log(response.name);
            document.getElementById("response").innerHTML = response.name;
            console.log("Result is here");
            var xheck = response.name.toLowerCase();
            //alert(xheck);
            if (xheck.indexOf("mouse") != -1) {

                window.open('/pages/mouse.html', '_self');
            } else if (xheck.indexOf("device") != -1) {

                window.open('/pages/mouse.html', '_self');
            } else if (xheck.indexOf("laptop") != -1) {
                window.open('/pages/macbook.html', '_self')
            } else if (xheck.indexOf("macbook") != -1) {

                window.open('/pages/macbook.html', '_self')
            } else if (xheck.indexOf("computer") != -1) {

                window.open('/pages/macbook.html', '_self')
            } else {
                alert(xheck);
                window.open('http://yandex.ru/search/?text=' + xheck, '_self')
            }

        } else {
            console.log(response.status);
        }
    }
    ajaxResult.send();
}