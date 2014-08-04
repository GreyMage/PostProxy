var express = require('express');
var bodyParser = require('body-parser');
var io = require('socket.io')(process.env.EMITPORT || 3001);

// Data Input
var app = express();
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies
app.all("/*",function(req,res,next){
	res.header('Access-Control-Allow-Origin' , "*"); // allow global posting.
	res.header('Access-Control-Allow-Headers' , "*"); // allow global posting.
	res.header('Access-Control-Allow-Headers' , "X-Requested-With, X-Broadcast-Channel"); // allow global posting.
	res.header('Access-Control-Allow-Methods' , "GET, POST, PUT, DELETE, OPTIONS"); // allow global posting.
	next();
})

app.post('/*', function(req, res) {
	console.log(req.headers);
	var channel = req.headers['x-broadcast-channel'];
	if(channel){
		io.to(channel).emit("data",req.body);
	} else {
		io.sockets.emit("data",req.body);	
	}
	res.send('captured');
});

app.get('/*', function(req, res) {
	res.sendfile('index.html');
});

app.listen(process.env.RECVPORT || 3000);

io.on('connection',function(socket){
	socket.on('join',function(room){
		console.log("Socket joined "+room);
		socket.join(room);
	});
});