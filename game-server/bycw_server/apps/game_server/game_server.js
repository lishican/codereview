require("../../init.js");
var game_config = require("../game_config.js");
var proto_man = require("../../netbus/proto_man.js");
var netbus = require("../../netbus/netbus.js");
var service_manager = require("../../netbus/service_manager.js");
var Stype = require("../Stype.js");

var five_chess_service = require("./five_chess_service.js");
var game_server = game_config.game_server;
netbus.start_tcp_server(game_server.host, game_server.port, false);

service_manager.register_service(Stype.Game5Chess, five_chess_service);

// 连接中心redis
var center_redis_config = game_config.center_redis;
var redis_center = require("../../database/redis_center.js");
redis_center.connect(center_redis_config.host, center_redis_config.port, center_redis_config.db_index);
// end

// 连接游戏redis
var game_redis_config = game_config.game_redis;
var redis_game = require("../../database/redis_game.js");
redis_game.connect(game_redis_config.host, game_redis_config.port, game_redis_config.db_index);
// end

// 连接游戏数据库
var game_mysql_config = game_config.game_database;
var mysql_game = require("../../database/mysql_game.js");
mysql_game.connect(game_mysql_config.host, game_mysql_config.port,
	                 game_mysql_config.db_name, game_mysql_config.uname, game_mysql_config.upwd);
// end 

