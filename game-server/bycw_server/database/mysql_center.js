var mysql = require("mysql");
var util = require('util')
var Respones = require("../apps/Respones.js");
var log = require("../utils/log.js");
var utils = require("../utils/utils.js");

var conn_pool = null;
function connect_to_center(host, port, db_name, uname, upwd) {
	conn_pool = mysql.createPool({
		host: host, // 数据库服务器的IP地址
		port: port, // my.cnf指定了端口，默认的mysql的端口是3306,
		database: db_name, // 要连接的数据库
		user: uname,
		password: upwd,
	});
}


function mysql_exec(sql, callback) {
	conn_pool.getConnection(function(err, conn) {
		if (err) { // 如果有错误信息
			if(callback) {
				callback(err, null, null);
			}
			return;
		}

		conn.query(sql, function(sql_err, sql_result, fields_desic) {
			conn.release(); // 忘记加了

			if (sql_err) {
				if (callback) {
					callback(sql_err, null, null);
				}
				return;
			}

			if (callback) {
				callback(null, sql_result, fields_desic);
			}
		});
		// end 
	});
}

function get_uinfo_by_uname_upwd(uname, upwd, callback) {
	var sql = "select uid, unick, usex, uface, uvip, status from uinfo where uname = \"%s\" and upwd = \"%s\" and is_guest = 0 limit 1";
	var sql_cmd = util.format(sql, uname, upwd);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR, null);
			return;
		}
		callback(Respones.OK, sql_ret);
	});
}

function get_guest_uinfo_by_ukey(ukey, callback) {
	var sql = "select uid, unick, usex, uface, uvip, status, is_guest from uinfo where guest_key = \"%s\" limit 1";
	var sql_cmd = util.format(sql, ukey);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR, null);
			return;
		}
		callback(Respones.OK, sql_ret);
	});
}

function insert_guest_user(unick, uface, usex, ukey, callback) {
	var sql = "insert into uinfo(`guest_key`, `unick`, `uface`, `usex`, `is_guest`)values(\"%s\", \"%s\", %d, %d, 1)";
	var sql_cmd = util.format(sql, ukey, unick, uface, usex);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR);
			return;
		}
		callback(Respones.OK);
	});
}

function insert_phone_account_user(unick, uface, usex, phone, pwd_md5, callback) {
	var sql = "insert into uinfo(`uname`, `upwd`, `unick`, `uface`, `usex`, `is_guest`)values(\"%s\", \"%s\", \"%s\", %d, %d, 0)";
	var sql_cmd = util.format(sql, phone, pwd_md5, unick, uface, usex);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR);
			return;
		}
		callback(Respones.OK);
	});
}

function edit_profile(uid, unick, usex, callback) {
	var sql = "update uinfo set unick = \"%s\", usex = %d where uid = %d";
	var sql_cmd = util.format(sql, unick, usex, uid);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR);
			return;
		}
		callback(Respones.OK);
	})
}

function is_exist_guest(uid, callback) {
	var sql = "select is_guest, status from uinfo where uid = %d limit 1";
	var sql_cmd = util.format(sql, uid);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR);
			return;
		}

		if(sql_ret.length <= 0) {
			callback(Respones.INVALID_PARAMS);
			return;
		}

		if (sql_ret[0].is_guest === 1 && sql_ret[0].status === 0) {
			callback(Respones.OK);
			return;	
		}
		callback(Respones.INVALID_PARAMS);
	});
}

function check_phone_code_valid(phone, phone_code, opt_type, callback) {
	var sql = "select id from phone_chat where phone = \"%s\" and opt_type = %d and code = \"%s\" and end_time >= %d limit 1";
	var t = utils.timestamp();

	var sql_cmd = util.format(sql, phone, opt_type, phone_code, t);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR);
			return;
		}

		if(sql_ret.length <= 0) { // 找不到，才是验证码不对
			callback(Respones.PHONE_CODE_ERR);
			return;
		}
		callback(Respones.OK);
		
	});
}

function check_phone_unuse(phone_num, callback) {
	var sql = "select uid from uinfo where uname = %s limit 1";
	var sql_cmd = util.format(sql, phone_num);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR);
			return;
		}

		if(sql_ret.length <= 0) {
			callback(Respones.OK);
			return;
		}

		
		callback(Respones.PHONE_IS_REG);
	});
}

function check_phone_is_reged(phone_num, callback) {
	var sql = "select uid from uinfo where uname = %s limit 1";
	var sql_cmd = util.format(sql, phone_num);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR);
			return;
		}

		if(sql_ret.length <= 0) {
			callback(Respones.PHONE_IS_NOT_REG);
			return;
		}

		
		callback(Respones.OK);
	});
}

function _is_phone_indentify_exist(phone, opt, callback) {
	var sql = "select id from phone_chat where phone = \"%s\" and opt_type = %d";
	var sql_cmd = util.format(sql, phone, opt);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(false);
			return;
		}

		if(sql_ret.length <= 0) {
			callback(false);
			return;
		}
		
		callback(true);
		
	});
}

function _update_phone_indentify_time(code, phone, opt, end_duration) {
	var end_time = utils.timestamp() + end_duration;
	var sql = "update phone_chat set code = \"%s\", end_time=%d, count=count+1 where phone = \"%s\" and opt_type = %d";
	var sql_cmd = util.format(sql, code, end_time, phone, opt);
	log.info(sql_cmd);
	
	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
	})
}

function _insert_phone_indentify(code, phone, opt, end_duration) {
	var end_time = utils.timestamp() + end_duration;
	var sql = "insert into phone_chat(`code`, `phone`, `opt_type`, `end_time`, `count`)values(\"%s\", \"%s\", %d, %d, 1)";
	var sql_cmd = util.format(sql, code, phone, opt, end_time);

	log.info(sql_cmd);
	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
	})
}	

// callback(Respons.OK)
function update_phone_indentify(code, phone, opt, end_duration, callback) {
	_is_phone_indentify_exist(phone, opt, function(b_exisit) {
		if (b_exisit) {
			// 更新时间和操作次数
			_update_phone_indentify_time(code, phone, opt, end_duration);
			// end	
		}
		else { // 插入一条记录
			_insert_phone_indentify(code, phone, opt, end_duration);
		}
		callback(Respones.OK);
	});


}

function do_upgrade_guest_account(uid, phone, pwd, callback) {
	var sql = "update uinfo set uname = \"%s\", upwd = \"%s\", is_guest = 0 where uid = %d";
	var sql_cmd = util.format(sql, phone, pwd, uid);
	log.info(sql_cmd);
	
	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR);
		}
		else {
			callback(Respones.OK);	
		}
	})
}

function reset_account_pwd(phone, pwd, callback) {
	var sql = "update uinfo set upwd = \"%s\" where uname = \"%s\"";
	var sql_cmd = util.format(sql, pwd, phone);
	log.info(sql_cmd);
	
	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR);
		}
		else {
			callback(Respones.OK);	
		}
	})
}

module.exports = {
	connect: connect_to_center,
	get_guest_uinfo_by_ukey: get_guest_uinfo_by_ukey, 
	get_uinfo_by_uname_upwd: get_uinfo_by_uname_upwd,
	insert_guest_user: insert_guest_user,
	edit_profile: edit_profile,
	is_exist_guest: is_exist_guest,
	update_phone_indentify: update_phone_indentify,
	check_phone_unuse: check_phone_unuse,
	do_upgrade_guest_account: do_upgrade_guest_account,
	check_phone_code_valid: check_phone_code_valid,
	insert_phone_account_user: insert_phone_account_user,
	check_phone_is_reged: check_phone_is_reged,
	reset_account_pwd: reset_account_pwd,
};