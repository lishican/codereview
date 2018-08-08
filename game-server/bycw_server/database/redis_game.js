var redis = require("redis");
var util = require('util')
var Respones = require("../apps/Respones.js");
var log = require("../utils/log.js");
var utils = require("../utils/utils.js");

var game_redis = null;

function connect_to_game(host, port, db_index) {
	game_redis = redis.createClient({
		host: host,
		port: port,
		db: db_index,
	});

	game_redis.on("error", function(err) {
		log.error(err);
	});
}

/* key, --> value
bycw_center_user_uid_8791
uinfo : {
	unick: string,
	uface: 图像ID，
	usex: 性别,
	uvip: VIP等级
	is_guest: 是否为游客
}
*/
function set_ugame_info_inredis(uid, ugame_info) {
	if (game_redis === null) {
		return;
	}

	var key = "bycw_game_user_uid_" + uid;
	ugame_info.uchip = ugame_info.uchip.toString();
	ugame_info.uexp = ugame_info.uexp.toString();
	ugame_info.uvip = ugame_info.uvip.toString();
	
	log.info("redis game hmset " + key);
	game_redis.hmset(key, ugame_info, function(err) {
		if(err) {
			log.error(err);
		}
	});
}

// callback(status, body)
function get_ugame_info_inredis(uid, callback) {
	if (game_redis === null) {
		callback(Respones.SYSTEM_ERR, null);
		return;
	}

	var key = "bycw_game_user_uid_" + uid;
	log.info("hgetall ", key);

	game_redis.hgetall(key, function(err, data) {
		if (err) {
			callback(Respones.SYSTEM_ERR, null);
			return;
		}

		var ugame_info = data;
		ugame_info.uchip = parseInt(ugame_info.uchip);
		ugame_info.uexp = parseInt(ugame_info.uexp);
		ugame_info.uvip = parseInt(ugame_info.uvip);
		callback(Respones.OK, ugame_info);
	});
}

function add_ugame_uchip(uid, uchip, is_add) {
	get_ugame_info_inredis(uid, function(status, ugame_info) {
		if(status != Respones.OK) {
			return;
		}

		if (!is_add) {
			uchip = -uchip;
		}

		ugame_info.uchip += uchip;
		set_ugame_info_inredis(uid, ugame_info);
	})
}

function update_game_world_rank(rank_name, uid, uchip) {
	game_redis.zadd(rank_name, uchip, "" + uid);
}

function get_world_rank_info(rank_name, rank_num, callback) {
	// 由大到小
	game_redis.zrevrange(rank_name, 0, rank_num, "withscores", function(err, data) {
		if (err) {
			callback(Respones.SYSTEM_ERR, null);
			return;
		}
		
		if (!data || data.length <= 0) {
			callback(Respones.RANK_IS_EMPTY, null);
			return;
		}

		// uid, uchip --> 整数redis 字符串，
		// [uid, uchip, uid, uchip, uid, uchip ...]
		for(var i = 0; i < data.length; i ++) {
			data[i] = parseInt(data[i]);
		}
		callback(Respones.OK, data);
	});
}

module.exports = {
	connect: connect_to_game,
	set_ugame_info_inredis: set_ugame_info_inredis,
	get_ugame_info_inredis: get_ugame_info_inredis,
	update_game_world_rank: update_game_world_rank,
	get_world_rank_info: get_world_rank_info,
	add_ugame_uchip: add_ugame_uchip,
};