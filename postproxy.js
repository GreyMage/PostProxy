var express = require('express');
var bodyParser = require('body-parser');
var io = require('socket.io')(process.env.EMITPORT || 3001);

// Data Input
var app = express();
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies
app.post('/*', function(req, res) {
	res.header('Access-Control-Allow-Origin' , "*");
	io.sockets.emit("data",req.body);
	res.send('captured');
});
app.get('/penis', function(req, res) {
	res.send('lewd');
});
app.get('/*', function(req, res) {
	res.sendfile('index.html');
});

app.listen(process.env.RECVPORT || 3000);
