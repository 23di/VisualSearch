var express = require('express');
var fs = require('fs');
var url = require('url');
var app = express();
var path = require('path');
var unirest = require('unirest');
var bodyParser = require('body-parser');
var qs = require('querystring');
var crypto = require('crypto');
var token = "";
var name = "";

app.use(bodyParser.urlencoded({
    limit: '5mb',
    extended: false
}));

app.use('/pages', express.static(__dirname + '/pages'));


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/js.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/js.js'));
});
app.get('/style.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/style.css'));
});
app.get('/favicon.ico', function(req, res) {
    res.sendFile(path.join(__dirname + '/favicon.ico'));
});


app.post('/api/photo', function(req, res) {
    name = "";
    var base64Data = req.body;
    var fileName = "img/" + crypto.randomBytes(20).toString('hex') + ".jpg";
    var b64 = decodeURIComponent(qs.stringify(base64Data)).replace(/^data:image\/jpeg;base64,/, "").replace(/\s/gm, "+").replace(/(\r\n|\n|\r)/gm, "");
    require("fs").writeFileSync(fileName, b64, "base64");
    console.log("Image saved");
    uploadImage(fileName);

});


function uploadImage(fileName) {
    unirest.post("https://camfind.p.mashape.com/image_requests")
        .header("X-Mashape-Key", "CP2KW30gmZmshk3lyzoXoXXtFzOPp1rO4wBjsnCTGIBGntiyi3")
        .attach("image_request[image]", fs.createReadStream(fileName))
        .attach("focus[x]=150")
        .attach("focus[y]=80")
        .field("image_request[language]", "en")
        .field("image_request[locale]", "en_US")
        .end(function(result) {
            console.log("Token is " + result.body.token);
            token = result.body.token;
            // checkStatus(token);
        })
};

function checkStatus(token) {
    console.log("Using: " + token);
    unirest.get("https://camfind.p.mashape.com/image_responses/" + token)
        .header("X-Mashape-Key", "CP2KW30gmZmshk3lyzoXoXXtFzOPp1rO4wBjsnCTGIBGntiyi3")
        .header("Accept", "application/json")
        .end(function(result) {
            console.log("Result is " + result.body.status);
            name = result.body.name;
            console.log(name);
        })
};

app.get('/api/status', function(req, res) {

    res.json({
        token: token
    })
});


function delay(ms) {
    ms += new Date().getTime();
    while (new Date() < ms) {}
}


var server = app.listen(80, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});