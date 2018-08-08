var log = require("../../utils/log.js");
var Cmd = require("../Cmd.js");
var Respones = require("../Respones.js");
var Stype = require("../Stype.js");
var Cmd = require("../Cmd.js");
var utils = require("../../utils/utils.js");

require("./five_chess_proto.js");
require("../gateway/bc_proto.js");

var five_chess_model = require("./five_chess_model.js");

function enter_zone(session, uid, proto_type, body) {
	if (!body) { // 最后加一下
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.ENTER_ZONE, Respones.INVALID_PARAMS, uid, proto_type);
		return;
	}

	var zid = body;
	five_chess_model.enter_zone(uid, zid, session, proto_type, function(body) {
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.ENTER_ZONE, body, uid, proto_type);
	})
}

function user_quit(session, uid, proto_type, body) {
	five_chess_model.user_quit(uid, function(body) {
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.USER_QUIT, body, uid, proto_type);
	})
}

function send_prop(session, uid, proto_type, body) {
	if (!body) { // 最后加一下
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.SEND_PROP, Respones.INVALID_PARAMS, uid, proto_type);
		return;
	}

	var propid = body[0];
	var to_seatid = body[1];
	five_chess_model.send_prop(uid, to_seatid, propid, function(body) {
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.SEND_PROP, body, uid, proto_type);
	});
}

function do_player_ready(session, uid, proto_type, body) {
	five_chess_model.do_player_ready(uid, function(body) {
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.SEND_DO_READY, body, uid, proto_type);
	});
}

function do_player_put_chess(session, uid, proto_type, body) {
	if (!body) { // 最后加一下
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.PUT_CHESS, Respones.INVALID_PARAMS, uid, proto_type);
		return;
	}

	var block_x = body[0];
	var block_y = body[1];
	five_chess_model.do_player_put_chess(uid, block_x, block_y, function(body) {
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.PUT_CHESS, body, uid, proto_type);
	});
}

function do_player_get_prev_round_data(session, uid, proto_type, body) {
	five_chess_model.do_player_get_prev_round_data(uid, function(body) {
		session.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.GET_PREV_ROUND, body, uid, proto_type);
	});
}

var service = {
	name: "five_chess_service", // 服务名称
	is_transfer: false, // 是否为转发模块,

	// 收到客户端给我们发来的数据
	on_recv_player_cmd: function(session, stype, ctype, body, utag, proto_type, raw_cmd) {
		log.info(stype, ctype, body);
		switch(ctype) {
			case Cmd.Game5Chess.ENTER_ZONE:
				enter_zone(session, utag, proto_type, body);
			break;
			case Cmd.Game5Chess.USER_QUIT:
				user_quit(session, utag, proto_type, body);
			break;
			case Cmd.Game5Chess.SEND_PROP:
				send_prop(session, utag, proto_type, body);
			break;
			case Cmd.Game5Chess.SEND_DO_READY:
				do_player_ready(session, utag, proto_type, body);
			break;
			case Cmd.Game5Chess.PUT_CHESS:
				do_player_put_chess(session, utag, proto_type, body);
			break;
			case Cmd.Game5Chess.GET_PREV_ROUND:
				do_player_get_prev_round_data(session, utag, proto_type, body);
			break;

			case Cmd.USER_DISCONNECT:
				five_chess_model.user_lost_connect(utag);
			break;
		}
	},

	// 收到我们连接的服务给我们发过来的数据;
	on_recv_server_return: function (session, stype, ctype, body, utag, proto_type, raw_cmd) {

	}, 

	// 收到客户端断开连接;
	on_player_disconnect: function(stype, session) {
	},
};

module.exports = service;