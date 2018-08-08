var log = require("../../utils/log.js");
var Cmd = require("../Cmd.js");
var auth_model = require("./auth_model.js");
var Respones = require("../Respones.js");
var Stype = require("../Stype.js");
var Cmd = require("../Cmd.js");
var utils = require("../../utils/utils.js");
require("./auth_proto.js");

function guest_login(session, utag, proto_type, body) {
	// 验证数据合法性
	if(!body) {
		session.send_cmd(Stype.Auth, Cmd.Auth.GUEST_LOGIN, Respones.INVALID_PARAMS, utag, proto_type);
		return;
	}
	// end 

	var ukey = body;
	auth_model.guest_login(ukey, function(ret) {
		session.send_cmd(Stype.Auth, Cmd.Auth.GUEST_LOGIN, ret, utag, proto_type);
	});
}

function uname_login(session, utag, proto_type, body) {
	// 验证数据合法性
	if(!body || !body[0] || !body[1]) {
		session.send_cmd(Stype.Auth, Cmd.Auth.GUEST_LOGIN, Respones.INVALID_PARAMS, utag, proto_type);
		return;
	}
	// end 

	var uname = body[0];
	var upwd = body[1];
	auth_model.uname_login(uname, upwd, function(ret) {
		session.send_cmd(Stype.Auth, Cmd.Auth.UNAME_LOGIN, ret, utag, proto_type);
	});
}

function edit_profile(session, uid, proto_type, body) {
	// 验证数据合法性
	if (!body || !body.unick || (body.usex != 0 && body.usex != 1)) {
		session.send_cmd(Stype.Auth, Cmd.Auth.EDIT_PROFILE, Respones.INVALID_PARAMS, uid, proto_type);
		return;
	}
	// end 

	auth_model.edit_profile(uid, body.unick, body.usex, function(body) {
		session.send_cmd(Stype.Auth, Cmd.Auth.EDIT_PROFILE, body, uid, proto_type);
	});
}

function is_phone_number(num) {
	if (num.length != 11) {
		return false;
	}

	for(var i = 0; i < num.length; i ++) {
		var ch = num.charAt(i);
		if (ch < '0' || ch > '9') {

			return false;
		}
	}

	return true;
}

function get_guest_upgrade_indentify(session, uid, proto_type, body) {
	if(!body || typeof(body[0]) == "undefined" || 
		typeof(body[1]) == "undefined" || !is_phone_number(body[1]) || 
		typeof(body[2]) == "undefined")  {
		session.send_cmd(Stype.Auth, Cmd.Auth.GUEST_UPGRADE_INDENTIFY, Respones.INVALID_PARAMS, uid, proto_type);
		return;
	} 

	auth_model.get_upgrade_indentify(uid, body[2], body[1], body[0], function(body) {
		session.send_cmd(Stype.Auth, Cmd.Auth.GUEST_UPGRADE_INDENTIFY, body, uid, proto_type);
	});
}

function get_phone_reg_verify_code(session, utag, proto_type, body) {
	if(!body || typeof(body[0]) == "undefined" || 
		typeof(body[1]) == "undefined")  {
		session.send_cmd(Stype.Auth, Cmd.Auth.GET_PHONE_REG_VERIFY, Respones.INVALID_PARAMS, utag, proto_type);
		return;
	} 

	auth_model.get_phone_reg_verify_code(body[1], function(body) {
		session.send_cmd(Stype.Auth, Cmd.Auth.GET_PHONE_REG_VERIFY, body, utag, proto_type);
	});
}

function get_forget_pwd_verify_code(session, utag, proto_type, body) {
	if(!body || typeof(body[0]) == "undefined" || 
		typeof(body[1]) == "undefined")  {
		session.send_cmd(Stype.Auth, Cmd.Auth.GET_FORGET_PWD_VERIFY, Respones.INVALID_PARAMS, utag, proto_type);
		return;
	} 

	auth_model.get_forget_pwd_verify_code(body[1], function(body) {
		session.send_cmd(Stype.Auth, Cmd.Auth.GET_FORGET_PWD_VERIFY, body, utag, proto_type);
	});
}

function guest_bind_phone_num(session, uid, proto_type, body) {
	if(!body || !body[0] || !body[1] || !body[2]) {
		session.send_cmd(Stype.Auth, Cmd.Auth.BIND_PHONE_NUM, Respones.INVALID_PARAMS, uid, proto_type);
		return;
	}

	auth_model.guest_bind_phone_number(uid, body[0], body[1], body[2], function(body) {
		session.send_cmd(Stype.Auth, Cmd.Auth.BIND_PHONE_NUM, body, uid, proto_type);
	})
}

function reg_phone_account(session, utag, proto_type, body) {
	if(!body || !body[0] || !body[1] || !body[2] || !body[3]) {
		session.send_cmd(Stype.Auth, Cmd.Auth.PHONE_REG_ACCOUNT, Respones.INVALID_PARAMS, utag, proto_type);
		return;
	}
	
	auth_model.reg_phone_account(body[0], body[1], body[2], body[3], function(body) {
		session.send_cmd(Stype.Auth, Cmd.Auth.PHONE_REG_ACCOUNT, body, utag, proto_type);
	})
}

function reset_user_pwd(session, utag, proto_type, body) {
	if(!body || !body[0] || !body[1] || !body[2]) {
		session.send_cmd(Stype.Auth, Cmd.Auth.RESET_USER_PWD, Respones.INVALID_PARAMS, utag, proto_type);
		return;
	}

	auth_model.reset_user_pwd(body[0], body[1], body[2], function(body) {
		session.send_cmd(Stype.Auth, Cmd.Auth.RESET_USER_PWD, body, utag, proto_type);
	})
}

var service = {
	name: "auth_service", // 服务名称
	is_transfer: false, // 是否为转发模块,

	// 收到客户端给我们发来的数据
	on_recv_player_cmd: function(session, stype, ctype, body, utag, proto_type, raw_cmd) {
		log.info(stype, ctype, body);
		switch(ctype) {
			case Cmd.Auth.GUEST_LOGIN:
				guest_login(session, utag, proto_type, body);
			break;
			case Cmd.Auth.EDIT_PROFILE:
				edit_profile(session, utag, proto_type, body);
			break;
			case Cmd.Auth.GUEST_UPGRADE_INDENTIFY:
				get_guest_upgrade_indentify(session, utag, proto_type, body);
			break;
			case Cmd.Auth.BIND_PHONE_NUM:
				guest_bind_phone_num(session, utag, proto_type, body);
			break;
			case Cmd.Auth.UNAME_LOGIN:
				uname_login(session, utag, proto_type, body);
			break;
			case Cmd.Auth.GET_PHONE_REG_VERIFY:
				get_phone_reg_verify_code(session, utag, proto_type, body);
			break;
			
			case Cmd.Auth.GET_FORGET_PWD_VERIFY:
				get_forget_pwd_verify_code(session, utag, proto_type, body);
			break;

			case Cmd.Auth.PHONE_REG_ACCOUNT:
				reg_phone_account(session, utag, proto_type, body);
			break;

			case Cmd.Auth.RESET_USER_PWD:
				reset_user_pwd(session, utag, proto_type, body);
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
