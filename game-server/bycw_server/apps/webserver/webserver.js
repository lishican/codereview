var game_config = require("../game_config.js");
var express = require("express");
var path = require("path");
var fs = require("fs");

var log = require("../../utils/log.js");
var Cmd = require("../Cmd.js");
var Stype = require("../Stype.js");

/*
if (process.argv.length < 3) {
	console.log("node webserver.js port");
	return;
}
*/
var app = express();
var host = game_config.webserver.host;
var port = game_config.webserver.port;

// process.chdir("./apps/webserver");
// console.log(process.cwd());

if (fs.existsSync("www_root")) {
	app.use(express.static(path.join(process.cwd(), "www_root")));	
}
else {
	log.warn("www_root is not exists!!!!!!!!!!!");
}



log.info("webserver started at port ", host, port);

// 获取客户端连接的服务器信息, 
// http://127.0.0.1:10001/server_info
app.get("/server_info", function (request, respones) {
	var data = {
		host: game_config.gateway_config.host,
		tcp_port: game_config.gateway_config.ports[0],
		ws_port: game_config.gateway_config.ports[1],
	};

	var str_data = JSON.stringify(data);
	respones.send(str_data);
});

app.listen(port);


