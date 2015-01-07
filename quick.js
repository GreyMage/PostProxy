var require = function(modules,callback,wait){ // Lets modules Require other modules.

	// Growing delay
	if(!wait) wait = 10; else wait = Math.floor(wait * 1.1);
	if(wait > 10000) wait = 10000;

	// Ensure defined modules
	var pass = true;
	for(var i in modules){
		if(!(modules[i] in window) || typeof window[modules[i]] == "undefined" || !window[modules[i]]){
			pass = false;
			break;
		}
	}

	// Check and fire callbacks if true.
	if(pass){
		callback();
	} else {
		setTimeout(function(){
			require(modules,callback,wait);
		},wait);
	}

}

var ppConnect = function(host,channel){

	var s = document.createElement("script"); 
	s.type = "text/javascript"; 
	s.src = "//"+host+"/socket.io/socket.io.js"; 
	document.head.appendChild(s);
	
	require(["io"],function(){
		var socket = io.connect(host);
		socket.emit('join',channel);
		window.socket = socket;
	});
	
};

var ppListen = function(callback){
	require(["socket"],function(){
		socket.on('data',function(data){
			callback(data);
		});
	});
}