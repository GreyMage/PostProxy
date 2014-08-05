var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var bodyParser = require('body-parser');

var CONNECTION_PASSWORD = 'sylvane';

// Data Input
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies
app.all("/*",function(req,res,next){
	res.header('Access-Control-Allow-Origin' , "*"); // allow global posting.
	res.header('Access-Control-Allow-Headers' , "*"); // allow global posting.
	res.header('Access-Control-Allow-Headers' , "X-Requested-With, X-Broadcast-Channel, X-Connection-Password"); // allow global posting.
	res.header('Access-Control-Allow-Methods' , "GET, POST, PUT, DELETE, OPTIONS"); // allow global posting.
	next();
})

app.post('/*', function(req, res) {

	var auth = req.headers['x-connection-password'];
	if(auth != CONNECTION_PASSWORD){
		res.send('1');
		return;
	}

	var channel = req.headers['x-broadcast-channel'];
	if(!channel){
		res.send('2');
		return;
	}

	console.log("Relayed",req.body,"to",channel);
	io.to(channel).emit("data",req.body);
	res.send('0');
});


app.get('/', function(req, res) {
	res.sendfile('index.html');
});


server.listen(process.env.PORT || 3000);

io.on('connection',function(socket){
	socket.on('join',function(room){
		console.log("Socket joined "+room);
		socket.join(room);
	});
});