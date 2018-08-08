var Respones = require("../Respones.js");
var redis_center = require("../../database/redis_center.js");
var redis_game = require("../../database/redis_game.js");
var mysql_game = require("../../database/mysql_game.js");
var utils = require("../../utils/utils.js");
var log = require("../../utils/log.js");
var Stype = require("../Stype.js");
var Cmd = require("../Cmd.js");
var proto_man = require("../../netbus/proto_man.js");
var State = require("./State.js");

function five_chess_player(uid) {
	this.uid = uid;

	this.uchip = 0;
	this.uvip = 0;
	this.uexp = 0;

	this.unick = "";
	this.usex = -1;
	this.uface = 0;

	this.zid = -1; // 玩家当前所在的区间
	this.room_id = -1; // 玩家当前所在的房间ID号
	this.seatid = -1; // 玩家当前在房间的座位号，没有坐下就是为-1;

	this.session = null;
	this.proto_type = -1;

	this.state = State.InView; // 表示玩家是旁观状态 
}

five_chess_player.prototype.init_ugame_info = function(ugame_info) {
	this.uchip = ugame_info.uchip;
	this.uvip = ugame_info.uvip;
	this.uexp = ugame_info.uexp;
} 

five_chess_player.prototype.init_uinfo = function(uinfo) {
	this.unick = uinfo.unick;
	this.usex = uinfo.usex;
	this.uface = uinfo.uface;
}

five_chess_player.prototype.init_session = function(session, proto_type) {
	this.session = session;
	this.proto_type = proto_type;
}

five_chess_player.prototype.send_cmd = function(stype, ctype, body) {
	if (!this.session) {
		return;
	}
	// console.log(stype, ctype, body);
	this.session.send_cmd(stype, ctype, body, this.uid, this.proto_type);
},

five_chess_player.prototype.enter_room = function(room) {
	this.state = State.InView;
}

five_chess_player.prototype.exit_room = function(room) {
	this.state = State.InView;
}

five_chess_player.prototype.sitdown = function(room) {
}

five_chess_player.prototype.standup = function(room) {
}

five_chess_player.prototype.do_ready = function() {
	this.state = State.Ready;
}

five_chess_player.prototype.on_round_start = function() {
	this.state = State.Playing;
}

// 如果要做机器人，那么机器人就可以继承这个chess_player, 
// 重载这个turn_to_player, 能够在这里自己思考来下棋
five_chess_player.prototype.turn_to_player = function(room) {

}

// 玩家游戏结算
// 1, 有输赢，2就是平局
five_chess_player.prototype.checkout_game = function(room, ret, is_winner) {
	this.state = State.CheckOut;
	if (ret === 2) { // 平局
		return;
	}

	// 有输赢
	var chip = room.bet_chip;
	
	// 更新数据库的金币, redis的金币
	mysql_game.add_ugame_uchip(this.uid, chip, is_winner);
	redis_game.add_ugame_uchip(this.uid, chip, is_winner);
	// end 

	if (is_winner) {
		this.uchip += chip;	
	}
	else {
		this.uchip -= chip;
	}
}
// end 

five_chess_player.prototype.on_checkout_over = function(room) {
	this.state = State.InView; // 玩家变成旁观状态, 等待下一局的开始
}

module.exports = five_chess_player;