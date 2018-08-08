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
var QuitReason = require("./QuitReason.js");
var five_chess_model = require("./five_chess_model.js");

var INVIEW_SEAT = 20;
var GAME_SEAT = 2; // 
var DISK_SIZE = 15; // 棋盘的大小

var ChessType = {
	NONE: 0,
	BLACK: 1,
	WHITE: 2,
};

function write_err(status, ret_func) {
	var ret = {};
	ret[0] = status;
	ret_func(ret);
}

function five_chess_room(room_id, zone_conf) {
	this.zid = zone_conf.zid; // 玩家当前所在的区间
	this.room_id = room_id; // 玩家当前所在的房间ID号
	this.think_time = zone_conf.think_time;
	this.min_chip = zone_conf.min_chip; // 玩家有可能一直游戏， 
	this.bet_chip = zone_conf.one_round_chip;
	this.state = State.Ready; // 房间已经准备好，可以游戏了


	// game
	this.black_rand = true; // 随机生成黑色的玩家
	this.black_seatid = -1; // 黑色的座位 
	this.cur_seatid = -1; // 当前轮到的这个玩家
	// end 

	// 0, INVIEW_SEAT
	this.inview_players = [];
	for(var i = 0; i < INVIEW_SEAT; i ++) {
		this.inview_players.push(null);
	}
	// end

	// 游戏座位
	this.seats = [];
	for(var i = 0; i < GAME_SEAT; i ++) {
		this.seats.push(null);
	}
	// end 

	// 创建棋盘 15x15
	this.chess_disk = [];
	for(var i = 0; i < DISK_SIZE * DISK_SIZE; i ++) {
		this.chess_disk.push(ChessType.NONE);
	}
	// end 

	// 定时器对象
	this.action_timer = null;
	this.action_timeout_timestamp = 0; // 玩家这个超时的时间挫
	// end 

	// 上局回访数据
	this.prev_round_data = null;
	this.round_data = {};
	// end 
}

five_chess_room.prototype.reset_chess_disk = function() {
	for(var i = 0; i < DISK_SIZE * DISK_SIZE; i ++) {
		this.chess_disk[i] = ChessType.NONE;
	}
}

five_chess_room.prototype.search_empty_seat_inview = function() {
	for(var i = 0; i < INVIEW_SEAT; i ++) {
		if(this.inview_players[i] == null) {
			return i;
		}
	}

	return -1;
}

five_chess_room.prototype.get_user_arrived = function(other) {
	var body = {
		0: other.seatid,
			
		1: other.unick, 
		2: other.usex,
		3: other.uface,

		4: other.uchip,
		5: other.uexp,
		6: other.uvip,
		7: other.state, // 玩家当前游戏状态
	};

	return body;
}

// 玩家进入到我们的游戏房间
five_chess_room.prototype.do_enter_room = function(p) {
	var inview_seat = this.search_empty_seat_inview();
	if (inview_seat < 0) {
		log.warn("inview seat is full!!!!!");
		return;
	}

	this.inview_players[inview_seat] = p;
	p.room_id = this.room_id;
	p.enter_room(this);

	// 如果你觉得有必要，那么需要把玩家进入房间的消息，玩家的信息
	// 广播给所有的人，有玩家进来旁观了
	// 。。。。
	// end 

	// 我们要把座位上的所有的玩家，发送给进来旁观的这位同学
	for(var i = 0; i < GAME_SEAT; i ++) {
		if (!this.seats[i]) {
			continue;
		}
		var other = this.seats[i];

		/*var body = {
			0: other.seatid,
			
			1: other.unick, 
			2: other.usex,
			3: other.uface,

			4: other.uchip,
			5: other.uexp,
			6: other.uvip,
			7: other.state, // 玩家当前游戏状态
		};*/
		var body = this.get_user_arrived(other);
		p.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.USER_ARRIVED, body);
	}
	// end 

	log.info("player:", p.uid, "enter room:", this.zid, "--", this.room_id);
	var body = {
		0: Respones.OK,
		1: this.zid,
		2: this.room_id,
		// .... 房间信息
	};

	p.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.ENTER_ROOM, body);
	// 自动分配一个座位给我们的玩家，学员也可以改成发送命令手动分配
	this.do_sitdown(p);
	// end 
}
// end

five_chess_room.prototype.do_sitdown = function(p) {
	if (p.seatid !== -1) {
		return;
	}

	// 搜索一个可用的空位
	var sv_seat = this.search_empty_seat();
	if (sv_seat === -1) { // 只能旁观
		return;
	}
	// end
	log.info(p.uid, "sitdown at seat: ", sv_seat);
	this.seats[sv_seat] = p;
	p.seatid = sv_seat;
	p.sitdown(this);

	// 发送消息给客户端，这个玩家已经坐下来了
	var body = {
		0: Respones.OK,
		1: sv_seat,
	};
	p.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.SITDOWN, body);
	// end

	// 广播给所有的其他玩家(旁观的玩家),玩家坐下,
	/*var body = {
		0: p.seatid,
		
		1: p.unick, 
		2: p.usex,
		3: p.uface,

		4: p.uchip,
		5: p.uexp,
		6: p.uvip,
		7: p.state, // 当前玩家的状态
	};*/

	var body = this.get_user_arrived(p);
	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.USER_ARRIVED, body, p.uid);
	// end  
}

five_chess_room.prototype.do_exit_room = function(p, quit_reason) {
	// 短线重连的流程
	if (quit_reason == QuitReason.UserLostConn && 
		this.state == State.Playing && 
		p.state == State.Playing) { // 短线重连的流程
		return false;
	}
	// end

	var winner = null;
	// ....
	if (p.seatid != -1) { // 当前玩家在座位上
		if (p.state == State.Playing) { // 当前正在游戏，逃跑，对家赢
			var winner_seatid = GAME_SEAT - p.seatid - 1;
			winner = this.seats[winner_seatid];
			if (winner) {
				this.checkout_game(1, winner);
			}
		}
		// end 
		var seatid = p.seatid;
		log.info(p.uid, "standup at seat: ", p.seatid);
		p.standup(this);
		this.seats[p.seatid] = null;
		p.seatid = -1;

		// 广播给所有的玩家(旁观的玩家),玩家站起,
		var body = {
			0: Respones.OK,
			1: seatid,
		};
		this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.STANDUP, body, null);
		// end 


	}
	// end 
	log.info("player:", p.uid, "exit room:", this.zid, "--", this.room_id);
	// 把玩家从旁观列表里面删除
	for(var i = 0; i < INVIEW_SEAT; i ++) {
		if (this.inview_players[i] == p) {
			this.inview_players[i] = null;
		}
	}
	// end
	p.exit_room(this);
	p.room_id = -1;

	// 广播给所有的玩家(旁观的玩家), 玩家离开了房间,(如果有必要)
	// 。。。。
	// end 

	return true;
}

five_chess_room.prototype.search_empty_seat = function() {
	// for(var i in this.seats) { // bug
	for(var i = 0; i < GAME_SEAT; i ++) {
		if (this.seats[i] === null) {
			return i;
		}
	}

	return -1;
}

five_chess_room.prototype.empty_seat = function() {
	var num = 0;
	for(var i in this.seats) {
		if (this.seats[i] === null) {
			num ++;
		}
	}
	return num;
}

// 基于旁观列表来广播
// 我们是分了json, buf协议的
five_chess_room.prototype.room_broadcast = function(stype, ctype, body, not_to_uid) {
	var json_uid = [];
	var buf_uid = [];

	var cmd_json = null;
	var cmd_buf = null;

	var gw_session = null;

	for(var i = 0; i < this.inview_players.length; i ++) {
		if (!this.inview_players[i] || 
			this.inview_players[i].session === null ||
			this.inview_players[i].uid == not_to_uid) {
			continue;
		}
		
		gw_session = this.inview_players[i].session;

		if (this.inview_players[i].proto_type == proto_man.PROTO_JSON) {
			json_uid.push(this.inview_players[i].uid);
			if (!cmd_json) {
				cmd_json = proto_man.encode_cmd(0, proto_man.PROTO_JSON, stype, ctype, body);
			}
		}
		else {
			buf_uid.push(this.inview_players[i].uid);
			if (!cmd_buf) {
				cmd_buf = proto_man.encode_cmd(0, proto_man.PROTO_BUF, stype, ctype, body);
			}
		}		
	}

	if (json_uid.length > 0) {
		var body = {
			cmd_buf: cmd_json,
			users: json_uid,
		};
		// 网关的session
		gw_session.send_cmd(Stype.Broadcast, Cmd.BROADCAST, body, 0,  proto_man.PROTO_BUF);
		// end 
	}

	if (buf_uid.length > 0) {
		var body = {
			cmd_buf: cmd_buf,
			users: buf_uid,
		};
		// 网关的session
		gw_session.send_cmd(Stype.Broadcast, Cmd.BROADCAST, body, 0,  proto_man.PROTO_BUF);
	}
}

five_chess_room.prototype.send_prop = function(p, to_seatid, propid, ret_func) {
	if (p.seatid === -1) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	if (p != this.seats[p.seatid]) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	if (!this.seats[to_seatid]) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	if (propid <= 0 || propid > 5) {
		write_err(Respones.INVALID_PARAMS, ret_func);
		return;
	}

	// 在房间里面广播，发送道具也能收到
	var body = {
		0: Respones.OK,
		1: p.seatid,
		2: to_seatid,
		3: propid,
	};
	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.SEND_PROP, body, null);
	// end 
}

five_chess_room.prototype.next_seat = function(cur_seatid) {
	var i = cur_seatid;
	for(i = cur_seatid + 1; i < GAME_SEAT; i ++) {
		if (this.seats[i] && this.seats[i].state == State.Playing) {
			return i;
		}
	}

	for(var i = 0; i < cur_seatid; i ++) {
		if (this.seats[i] && this.seats[i].state == State.Playing) {
			return i;
		}
	}

	return -1;
}

five_chess_room.prototype.get_round_start_info = function() {
	var wait_client_time = 3000; // 单位是ms
	var body = {
		0: this.think_time,
		1: wait_client_time, // 给客户端3秒, 3, 2, 1,
		2: this.black_seatid, 
	};

	return body;
}

five_chess_room.prototype.game_start = function() {
	// 改变房间的状态
	this.state = State.Playing;
	// end 

	// 清理我们的棋盘
	this.reset_chess_disk();
	// end

	// 通知所有的玩家
	for(var i = 0; i < GAME_SEAT; i ++) {
		if (!this.seats[i] || this.seats[i].state != State.Ready) {
			continue;
		}

		this.seats[i].on_round_start();
	}
	// end 

	// 到底是谁先开始，谁执黑棋
	// (1)第一局游戏，我们随机，后面我们轮着来;
	// (2)一旦玩家变化了，重新开始随机
	if (this.black_rand) {
		this.black_rand = false;
		this.black_seatid = Math.random() * 2; // [0, 2)
		this.black_seatid = Math.floor(this.black_seatid);
	}
	else {
		this.black_seatid = this.next_seat(this.black_seatid);
	}
	// end 

	// 广播给所有的人，游戏马上要开始了
	/*var wait_client_time = 3000; // 单位是ms
	var body = {
		0: this.think_time,
		1: wait_client_time, // 给客户端3秒, 3, 2, 1,
		2: this.black_seatid, 
	};*/
	var body = this.get_round_start_info();
	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.ROUND_START, body, null);
	// end 

	this.cur_seatid = -1; // 在这个游戏已经开始了，但是还要等3秒这个时间段，当前操作的玩家为-1
	// wait_client_time 轮到当前的执黑的玩家开始
	setTimeout(this.turn_to_player.bind(this), body[1]/*wait_client_time*/, this.black_seatid);
	// end 

	// 保存一下当前的开局信息
	var seats_data = [];
	for(var i = 0; i < GAME_SEAT; i ++) {
		if(!this.seats[i] || this.seats[i].state != State.Playing) {
			continue;
		}

		var data = this.get_user_arrived(this.seats[i]);
		seats_data.push(data);
	}
	this.round_data[0] = seats_data;
	this.round_data[1] = []; // 保存操作民命令
	var action_cmd = [utils.timestamp(), Stype.Game5Chess, Cmd.Game5Chess.ROUND_START, body];
	this.round_data[1].push(action_cmd);
	// end 
}

five_chess_room.prototype.do_player_action_timeout = function(seatid) {
	this.action_timer = null;
	/*
	// 结算
	var winner_seatid = GAME_SEAT - seatid - 1;
	var winner = this.seats[winner_seatid];
	this.checkout_game(1, winner)
	// end 
	*/

	this.turn_to_next();
}

five_chess_room.prototype.turn_to_player = function(seatid) {
	if(this.action_timer !== null) {
		clearTimeout(this.action_timer);
		this.action_timer = null;
	} 

	if(!this.seats[seatid] || this.seats[seatid].state != State.Playing) {
		log.warn("turn_to_player: ", seatid, "seat is invalid!!!!");
		return;
	}

	// 启动一个定时器, 定时器如果触发了以后调用我们超时处理函数
	this.action_timer = setTimeout(this.do_player_action_timeout.bind(this), this.think_time * 1000, seatid);
	this.action_timeout_timestamp = utils.timestamp() + this.think_time;
	// end 

	var p = this.seats[seatid];
	p.turn_to_player(room);

	this.cur_seatid = seatid;

	var body = {
		0: this.think_time,
		1: seatid,
	};

	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.TURN_TO_PLAYER, body, null);
	var action_cmd = [utils.timestamp(), Stype.Game5Chess, Cmd.Game5Chess.TURN_TO_PLAYER, body];
	this.round_data[1].push(action_cmd);
}

five_chess_room.prototype.check_game_start = function() {
	var ready_num = 0;
	for(var i = 0; i < GAME_SEAT; i ++) {
		if (!this.seats[i] || this.seats[i].state != State.Ready) {
			continue;
		}

		ready_num ++;
	}

	if (ready_num >= 2) {
		this.game_start();
	}
}

five_chess_room.prototype.do_player_get_prev_round_data = function(p, ret_func) {
	if (!this.prev_round_data || p.state == State.Playing || p.state == State.Ready) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}
	
	var body = {
	 	0: Respones.OK,
		1: this.prev_round_data,
	};

	ret_func(body);
}

five_chess_room.prototype.do_player_ready = function(p, ret_func) {
	// 玩家是否已经是坐下在房间里面的
	if (p != this.seats[p.seatid]) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}
	// end 

	// 当前房间是否为准备好了，
	if (this.state != State.Ready || p.state != State.InView) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}
	// end 

	p.do_ready();

	// 广播给所有的人，这个玩家准备好了
	// 所有旁观的人应该都能看到这个玩家准备好了;
	var body = {
		0: Respones.OK,
		1: p.seatid
	};
	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.SEND_DO_READY, body, null);
	// end 

	this.check_game_start();
}

five_chess_room.prototype.get_next_seat = function() {
	// 从当前的 seatid开始，往后遍历
	for(var i = this.cur_seatid + 1; i < GAME_SEAT; i ++) {
		if (!this.seats[i] || this.seats[i].state != State.Playing) {
			continue;
		}

		return i;
	}
	// end 

	for(var i = 0; i < this.cur_seatid; i ++) {
		if (!this.seats[i] || this.seats[i].state != State.Playing) {
			continue;
		}

		return i;
	}

	return -1;
}

five_chess_room.prototype.check_game_over = function(chess_type) {
	// 横向检查
	for(var i = 0; i < 15; i ++) {
		for(var j = 0; j <= (15 - 5); j ++) {
			if (this.chess_disk[i * 15 + j + 0] == chess_type && 
				this.chess_disk[i * 15 + j + 1] == chess_type && 
				this.chess_disk[i * 15 + j + 2] == chess_type && 
				this.chess_disk[i * 15 + j + 3] == chess_type && 
				this.chess_disk[i * 15 + j + 4] == chess_type) {
				return 1;
			}
		}
	}
	// end 	

	// 竖向检查
	for(var i = 0; i < 15; i ++) {
		for(var j = 0; j <= (15 - 5); j ++) {
			if (this.chess_disk[(j + 0) * 15 + i] == chess_type && 
				this.chess_disk[(j + 1) * 15 + i] == chess_type && 
				this.chess_disk[(j + 2) * 15 + i] == chess_type && 
				this.chess_disk[(j + 3) * 15 + i] == chess_type && 
				this.chess_disk[(j + 4) * 15 + i] == chess_type) {
				return 1;
			}
		}
	}
	// end

	// 右上角
	var line_total = 15;
	for(var i = 0; i <= (15 - 5); i ++) {
		for(var j = 0; j < (line_total - 4); j ++) {
			if (this.chess_disk[(i + j + 0) * 15 + j + 0] == chess_type && 
				this.chess_disk[(i + j + 1) * 15 + j + 1] == chess_type && 
				this.chess_disk[(i + j + 2) * 15 + j + 2] == chess_type && 
				this.chess_disk[(i + j + 3) * 15 + j + 3] == chess_type && 
				this.chess_disk[(i + j + 4) * 15 + j + 4] == chess_type) {
				return 1;
			}
		}
		line_total --;
	}

	line_total = 15 - 1;
	for(var i = 1; i <= (15 - 5); i ++) {
		for(var j = 0; j < (line_total - 4); j ++) {
			if (this.chess_disk[(j + 0) * 15 + i + j + 0] == chess_type && 
				this.chess_disk[(j + 1) * 15 + i + j + 1] == chess_type && 
				this.chess_disk[(j + 2) * 15 + i + j + 2] == chess_type && 
				this.chess_disk[(j + 3) * 15 + i + j + 3] == chess_type && 
				this.chess_disk[(j + 4) * 15 + i + j + 4] == chess_type) {
				return 1;
			}
		}
		line_total --;
	}
	// end  

	// 左下角
	line_total = 15;
	for(var i = 14; i >= 4; i --) {
		for(var j = 0; j < (line_total - 4); j ++) {
			if (this.chess_disk[(i - j - 0) * 15 + j + 0] == chess_type && 
				this.chess_disk[(i - j - 1) * 15 + j + 1] == chess_type && 
				this.chess_disk[(i - j - 2) * 15 + j + 2] == chess_type && 
				this.chess_disk[(i - j - 3) * 15 + j + 3] == chess_type && 
				this.chess_disk[(i - j - 4) * 15 + j + 4] == chess_type) {
				return 1;
			}
		}
		line_total --;
	}

	line_total = 1;
	var offset = 0;
	for(var i = 1; i <= (15 - 5); i ++) {
		offset = 0;
		for(var j = 14; j >= (line_total + 4); j --) {
			if (this.chess_disk[(j - 0) * 15 + i + offset + 0] == chess_type && 
				this.chess_disk[(j - 1) * 15 + i + offset + 1] == chess_type && 
				this.chess_disk[(j - 2) * 15 + i + offset + 2] == chess_type && 
				this.chess_disk[(j - 3) * 15 + i + offset + 3] == chess_type && 
				this.chess_disk[(j - 4) * 15 + i + offset + 4] == chess_type) {
				return 1;
			}
			offset ++;
		}
		line_total ++;
	}
	// end 

	// 检查棋盘是否全部满了，如果没有满，表示游戏可以继续
	for(var i = 0; i < DISK_SIZE * DISK_SIZE; i ++) {
		if (this.chess_disk[i] == ChessType.NONE) {
			return 0;
		}
	}
	// end 

	return 2; // 返回平局
}

five_chess_room.prototype.checkout_game = function(ret, winner) {
	if(this.action_timer !== null) {
		clearTimeout(this.action_timer);
		this.action_timer = null;
	} 

	this.state = State.CheckOut; // 更新房间的状态为结算状态
	// 遍历所有的在游戏的玩家，结算
	for(var i = 0; i < GAME_SEAT; i ++) {
		if(this.seats[i] === null || this.seats[i].state != State.Playing) {
			continue;
		}

		this.seats[i].checkout_game(this, ret, this.seats[i] === winner);
	}
	// end 

	var winner_score = this.bet_chip;
	var winner_seat = winner.seatid;
	if (ret === 2) {
		winner_seat = -1; // 没有赢家
	}
	// 广播给所有的玩家游戏结算
	var body = {
		0: winner_seat, // -1, 表示平局，其他的就是赢家的座位号
		1: winner_score,
		// ...自己加入其他的数据 
	};
	// end 

	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.CHECKOUT, body, null);
	var action_cmd = [utils.timestamp(), Stype.Game5Chess, Cmd.Game5Chess.CHECKOUT, body];
	this.round_data[1].push(action_cmd);

	this.prev_round_data = this.round_data;
	this.round_data = {}; // 清空

	// 踢掉离线的玩家
	for(var i = 0; i < GAME_SEAT; i ++) {
		if (!this.seats[i]) {
			continue;
		}

		if (this.seats[i].session === null) {
			five_chess_model.kick_offline_player(this.seats[i]);
			continue;
		}
	}
	// end 

	// 4秒以后结算结束
	var check_time = 4000;
	setTimeout(this.on_checkout_over.bind(this), check_time);
}

five_chess_room.prototype.on_checkout_over = function() {
	// 更新一下房间的状态
	this.state = State.Ready;
	// end 

	for(var i = 0; i < GAME_SEAT; i ++) {
		if(!this.seats[i] || this.seats[i].state != State.CheckOut) {
			continue;
		}

		// 通知玩家，游戏结算完成了
		this.seats[i].on_checkout_over(this);
		// end 
	}

	// 广播给所有的人，结算结束
	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.CHECKOUT_OVER, null, null);
	// end 

	
	// 踢掉不满足要求的玩家
	for(var i = 0; i < GAME_SEAT; i ++) {
		if (!this.seats[i]) {
			continue;
		}

		// 玩家金币数目
		if (this.seats[i].uchip < this.min_chip) {
			five_chess_model.kick_player_chip_not_enough(this.seats[i]);
			continue;
		}
		// end 

		// 超时间很多
		// end 
		// ......
	}
	// end 
}

five_chess_room.prototype.do_player_put_chess = function(p, block_x, block_y, ret_func) {
	// 玩家是否已经是坐下在房间里面的
	if (p != this.seats[p.seatid]) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}
	// end 

	// 当前轮到不是你这个玩家
	if (p.seatid != this.cur_seatid) {
		write_err(Respones.NOT_YOUR_TURN, ret_func);
		return;
	}

	// 当前房间或玩家不是游戏状态，
	if (this.state != State.Playing || p.state != State.Playing) {
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}
	// end 

	// 块的参数的合法性
	if (block_x < 0 || block_x > 14 || block_y < 0 || block_y > 14) {
		write_err(Respones.INVALID_PARAMS, ret_func);
		return;
	}

	var index = block_y * 15 + block_x;
	if (this.chess_disk[index] != ChessType.NONE) { // 如果你已经下了这个棋了，
		write_err(Respones.INVALIDI_OPT, ret_func);
		return;
	}

	if(p.seatid == this.black_seatid) { // 黑
		this.chess_disk[index] = ChessType.BLACK;
	}
	else {
		this.chess_disk[index] = ChessType.WHITE;
	}

	// 广播给所有的人
	var body = {
		0: Respones.OK,
		1: block_x,
		2: block_y,
		3: this.chess_disk[index],
	};
	this.room_broadcast(Stype.Game5Chess, Cmd.Game5Chess.PUT_CHESS, body, null);
	var action_cmd = [utils.timestamp(), Stype.Game5Chess, Cmd.Game5Chess.PUT_CHESS, body];
	this.round_data[1].push(action_cmd);
	// end 

	// 取消超时定时器
	if(this.action_timer !== null) {
		clearTimeout(this.action_timer);
		this.action_timer = null;
	}
	
	// end 

	// 结算, 下黑棋，那么就看黑棋是否赢了，下白棋，就看白棋是否赢
	// 下满了，那么就是平局, 还可以继续，那么就进入下一个
	var check_ret = this.check_game_over(this.chess_disk[index]);
	if (check_ret != 0) { // 1 win, 2 平局
		log.info("game over !!!!", this.chess_disk[index], " result", check_ret);
		this.checkout_game(check_ret, p);
		return;
	}
	// end 

	this.turn_to_next();
}

five_chess_room.prototype.turn_to_next = function() {
	// 进入到下一个玩家
	var next_seat = this.get_next_seat();
	if (next_seat === -1) {
		log.error("cannot find next_seat !!!!");
		return;
	}
	// end 

	this.turn_to_player(next_seat);
}

// 断线重连
five_chess_room.prototype.do_reconnect = function(p) {
	if(room.state != State.Playing && p.state != State.Playing) {
		return;
	}

	// 其他玩家的座位数据
	var seats_data = [];
	for(var i = 0; i < GAME_SEAT; i ++) {
		if (!this.seats[i] || this.seats[i] == p || 
			this.seats[i].state != State.Playing) {
			continue;
		}

		var arrived_data = this.get_user_arrived(this.seats[i]);
		seats_data.push(arrived_data);
	}
	// end 

	// 获取开局信息
	var round_start_info = this.get_round_start_info();
	// end 

	// 游戏数据数据
	// end 

	// 当前游戏进度的游戏信息
	var game_ctrl = [
		this.cur_seatid,
		this.action_timeout_timestamp - utils.timestamp(), // 剩余的处理时间
	];
	// end 

	// 传玩家自己的数据
	var body = {
		0: p.seatid, // 玩家自己的数据，供玩家坐下使用,
		1: seats_data, // 其他玩家的座位数据
		2: round_start_info, // 开局信息
		3: this.chess_disk, // 棋盘信息
		4: game_ctrl, // 游戏控制进度信息
	};
	p.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.RECONNECT, body);
	// end 
}

module.exports = five_chess_room;

