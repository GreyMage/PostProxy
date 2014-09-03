var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var winston = require('winston');
var bodyParser = require('body-parser');
var fs = require('fs');

// configure 
winston.add(winston.transports.File, { filename: 'postproxy.log' });
var CONNECTION_PASSWORD = 'sylvane';
var headers = [
	'X-Requested-With', 
	'X-Broadcast-Channel',
	'X-Connection-Password'
];

// Data Input
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies
app.all("/*",function(req,res,next){
	res.header('Access-Control-Allow-Origin' , "*"); // allow global posting.
	res.header('Access-Control-Allow-Headers' , "*"); // allow global posting.
	res.header('Access-Control-Allow-Headers' , headers.join(', ')); // allow global posting.
	res.header('Access-Control-Allow-Methods' , "GET, POST, PUT, DELETE, OPTIONS"); // allow global posting.
	next();
});

app.post('/*', function(req, res) {

	var auth = req.headers['x-connection-password'];
	if(auth != CONNECTION_PASSWORD){
		winston.log('error', 'Bad Password',{ip:req.ip,attempt:auth});
		res.status(401);
		res.send('incorrect x-connection-password');
		return;
	}

	var channel = req.headers['x-broadcast-channel'];
	if(!channel){
		winston.log('error', 'No Channel',{ip:req.ip});
		res.status(400);
		res.send('Must specify x-broadcast-channel');
		return;
	}

	winston.log('info', 'Relayed',{ip:req.ip,channel:channel,body:req.body});
	io.to(channel).emit("data",req.body);
	res.status(200);
	res.send('OK');
});


app.get('/', function(req, res) {
	res.sendfile('index.html');
});

app.get('/listen/:channel', function(req, res) {
	res.header('Content-Type' , "application/x-javascript");
	fs.readFile('quick.js', 'utf8', function (err,data) {
		if (err) {
			winston.log('error', 'Server Error',err);
			res.status(500).end();
		}

		var output = [
			data,
			'ppConnect("'+req.headers.host+'","'+req.params.channel+'");'
		];

		res.send(output.join("\n"));
	});
});

server.listen(process.env.PORT || 3000);

io.on('connection',function(socket){
	socket.on('join',function(room){
		console.log("Socket joined "+room);
		socket.join(room);
	});
});

winston.log('info', 'Server Started');