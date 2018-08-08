module.exports = {
	enter_zone: enter_zone,
	user_quit: user_quit,
	user_lost_connect: user_lost_connect,
	send_prop: send_prop,
	do_player_ready: do_player_ready,
	do_player_put_chess: do_player_put_chess,
	kick_player_chip_not_enough: kick_player_chip_not_enough,
	kick_offline_player: kick_offline_player,
	do_player_get_prev_round_data: do_player_get_prev_round_data,
};

var Respones = require("../Respones.js");
var redis_center = require("../../database/redis_center.js");
var redis_game = require("../../database/redis_game.js");
var mysql_game = require("../../database/mysql_game.js");
var utils = require("../../utils/utils.js");
var log = require("../../utils/log.js");
var game_config = require("../game_config.js");

var five_chess_player = require("./five_chess_player.js");
var five_chess_room = require("./five_chess_room.js");
// zid --> zone对象的表
var zones = {};
var player_set = {}; // uid --> player对应表


var QuitReason = require("./QuitReason.js");

function get_player(uid) {
	if (player_set[uid]) {
		return player_set[uid];
	}

	return null;
}

function alloc_player(uid, session, proto_type) {
	if (player_set[uid]) {
		log.warn("alloc_player: user is exist!!!!");
		return player_set[uid];
	}
	var p = new five_chess_player(uid);
	p.init_session(session, proto_type);

	return p;
}

function delete_player(uid) {
	if (player_set[uid]) {
		player_set[uid].init_session(null, -1);

		player_set[uid] = null;
		delete player_set[uid];
	}
	else {
		log.warn("delete_player:", uid, "is not in game server!!!!");
	}
}

function zone(config) {
	this.config = config;
	this.wait_list = {}; // 链表来做，玩家的等待列表;
	this.room_list = {}; // 房间ID-->房间;
	this.autoinc_roomid = 1; // 自增房间ID，来生成唯一的ID
	// ...
}

function init_zones() {
	var zones_config = game_config.game_data.five_chess_zones;
	for(var i in zones_config) {
		var zid = zones_config[i].zid;
		var z = new zone(zones_config[i]);
		zones[zid] = z;
	}
}

init_zones();

function write_err(status, ret_func) {
	var ret = {};
	ret[0] = status;
	ret_func(ret);
}


function player_enter_zone(player, zid, ret_func) {
	var zone = zones[zid];
	// 判断ZID的合法性
	if (!zones[zid]) {
		ret_func(Respones.INVALID_ZONE);
		return;
	}

	// .... 
	// end 

	// 玩家是否能进入这个区间
	if (player.uchip < zone.config.min_chip) {
		ret_func(Respones.CHIP_IS_NOT_ENOUGH);
		return;
	}
	// end 

	// 玩家的VIP等级是否能够进入
	if (player.uvip < zone.config.vip_level) {
		ret_func(Respones.VIP_IS_NOT_ENOUGH);
		return;
	}

	player.zid = zid;
	player.room_id = -1;
	zone.wait_list[player.uid] = player;
	ret_func(Respones.OK);
	log.info("player:", player.uid, "etner zone and add to waitlist", zid);
}

function get_uinfo_inredis(uid, player, zid, ret_func) {
	redis_center.get_uinfo_inredis(uid, function(status, data) {
		if (status != Respones.OK) {
			ret_func(status);
			return;
		}

		player.init_uinfo(data);
		player_set[uid] = player;

		// end 
		player_enter_zone(player, zid, ret_func);
	});
}

function enter_zone(uid, zid, session, proto_type, ret_func) {
	var player = get_player(uid);

	if (!player) {
		player = alloc_player(uid, session, proto_type);
		// 获取我们的用户信息, 数据库里面读取
		mysql_game.get_ugame_info_by_uid(uid, function(status, data) {
			if (status != Respones.OK) {
				ret_func(status);
				return;
			}

			if (data.length < 0) {
				ret_func(Respones.ILLEGAL_ACCOUNT);
				return;
			}

			var ugame_info = data[0];
			if (ugame_info.status != 0) {
				ret_func(Respones.ILLEGAL_ACCOUNT);
				return;
			}
			player.init_ugame_info(ugame_info);

			get_uinfo_inredis(uid, player, zid, ret_func);
		});
		// end 
	}
	else {
		// player已经在特定的房间了
		if (player.zid != -1 && player.room_id != -1) {
			var zone = zones[player.zid];
			var room = zone.room_list[player.room_id];

			// 把这个玩家对象的session恢复一下
			player.init_session(session, proto_type);
			// end 
			// 当前房间的游戏进度数据传递给我们的客户端，让它能回到游戏
			room.do_reconnect(player);
		}
		else {
			player_enter_zone(player, zid, ret_func);	
		}
		
	}
}

// 执行玩家离开的动作
// is_force: 玩家是主动离开，还是被动离开
function do_user_quit(uid, quit_reason) {
	var player = get_player(uid);
	if (!player) {
		return;
	}

	if (quit_reason == QuitReason.UserLostConn) { // 断线离开要清理一下;
		player.init_session(null, -1);
	}

	log.info("player uid=", uid, "quit game_server reason:", quit_reason);
	if (player.zid != -1 && zones[player.zid]) { // 玩家已经在游戏区间里面了,从区间里面离开
		var zone = zones[player.zid];
		if (player.room_id != -1) { // 玩家已经在房间里面了，从房间里面退出
			var room = zone.room_list[player.room_id];
			if (room) {
				// 如果玩家正在房间游戏，就不允许退出,
				if (!room.do_exit_room(player, quit_reason)) {
					return;
				}
			}
			else {
				player.room_id = -1;	
			}	
			player.zid = -1;		
			log.info("player uid:", uid, "exit zone:", player.zid, "at room:", player.room_id);
		}
		else { // 从等待列表里面退出
			if (zone.wait_list[uid]) {
				log.info("player uid", uid, "remove from waitlist at zone:", player.zid);
				player.zid = -1;
				player.room_id = -1;
				zone.wait_list[uid] = null;
				delete zone.wait_list[uid];
			}
		}
	}

	delete_player(uid);
}

function user_quit(uid, ret_func) {
	do_user_quit(uid, QuitReason.UserQuit);
	ret_func(Respones.OK);
}

function user_lost_connect(uid) {
	do_user_quit(uid, QuitReason.UserLostConn);
}

function kick_player_chip_not_enough(uid) {
	do_user_quit(uid, QuitReason.CHIP_IS_NOT_ENOUGH);
}

function kick_offline_player() {
	do_user_quit(uid, QuitReason.SystemKick);
}

// 自动配桌
function alloc_room(zone) {
	var room = new five_chess_room(zone.autoinc_roomid ++, zone.config);
	zone.room_list[room.room_id] = room;

	return room;
}

function do_search_room(zone) {
	var min_empty = 1000000;
	var min_room = null;
	for(var key in zone.room_list) {
		room = zone.room_list[key];
		var empty_num = room.empty_seat();
		// 说明，有可能你有三个人一桌，那么你可能需要先找2个人的桌子
		if (room && empty_num >= 1) {
			if (empty_num < min_empty) {
				min_room = room;
				min_empty = empty_num;
			}
		}
	}
	if (min_room) {
		return min_room;
	}
	// 没有找到合适的房间, 创建一个;
	
	min_room = alloc_room(zone);
	return min_room;
}

function do_assign_room() {
	for(var i in zones) { // 遍历所有的区间
		// 查询等待列表，看有么有玩家
		var zone = zones[i];
		for(var key in zone.wait_list) { // 遍历区间的等待列表
			var p = zone.wait_list[key];

			var room = do_search_room(zone);
			if (room) {
				// 玩家加入到房间
				room.do_enter_room(p);
				
				zone.wait_list[key] = null;
				delete zone.wait_list[key];
			}			
		}

	}
	
}
// end 
setInterval(do_assign_room, 500);

function send_prop(uid, to_seatid, propid, ret_func) {
	var player = get_player(uid);
	if (!player) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	if (player.zid === -1 || player.room_id === -1) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	var zone = zones[player.zid];
	if (!zone) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	var room = zone.room_list[player.room_id];
	if (!room) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	room.send_prop(player, to_seatid, propid, ret_func);
}

function do_player_get_prev_round_data(uid, ret_func) {
	var player = get_player(uid);
	if (!player) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	if (player.zid === -1 || player.room_id === -1) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	var zone = zones[player.zid];
	if (!zone) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	var room = zone.room_list[player.room_id];
	if (!room) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	room.do_player_get_prev_round_data(player, ret_func);
}

function do_player_ready(uid, ret_func) {
	var player = get_player(uid);
	if (!player) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	if (player.zid === -1 || player.room_id === -1) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	var zone = zones[player.zid];
	if (!zone) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	var room = zone.room_list[player.room_id];
	if (!room) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	room.do_player_ready(player, ret_func);
}

function do_player_put_chess(uid, block_x, block_y, ret_func) {
	var player = get_player(uid);
	if (!player) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	if (player.zid === -1 || player.room_id === -1) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	var zone = zones[player.zid];
	if (!zone) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	var room = zone.room_list[player.room_id];
	if (!room) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	room.do_player_put_chess(player, block_x, block_y, ret_func);
}



