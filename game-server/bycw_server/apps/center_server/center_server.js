require("../../init.js");
var game_config = require("../game_config.js");
var proto_man = require("../../netbus/proto_man.js");
var netbus = require("../../netbus/netbus.js");
var service_manager = require("../../netbus/service_manager.js");
var Stype = require("../Stype.js");

var auth_service = require("./auth_service.js");

var center = game_config.center_server;
netbus.start_tcp_server(center.host, center.port, false);

service_manager.register_service(Stype.Auth, auth_service);


// 连接中心数据库
var center_mysql_config = game_config.center_database;
var mysql_center = require("../../database/mysql_center.js");
mysql_center.connect(center_mysql_config.host, center_mysql_config.port,
	                 center_mysql_config.db_name, center_mysql_config.uname, center_mysql_config.upwd);
// end 


// 连接中心服务器的redis
var center_redis_config = game_config.center_redis;
var redis_center = require("../../database/redis_center.js");
redis_center.connect(center_redis_config.host, center_redis_config.port, center_redis_config.db_index);
// end

