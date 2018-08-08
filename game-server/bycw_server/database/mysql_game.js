var mysql = require("mysql");
var util = require('util')
var Respones = require("../apps/Respones.js");
var log = require("../utils/log.js");
var utils = require("../utils/utils.js");

var conn_pool = null;
function connect_to_gserver(host, port, db_name, uname, upwd) {
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

function get_login_bonues_info(uid, callback) {
	var sql = "select days, bunues_time, id, bonues, status from login_bonues where uid = %d limit 1";
	var sql_cmd = util.format(sql, uid);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR, null);
			return;
		}
		callback(Respones.OK, sql_ret);
	});
}

function insert_user_login_bonues(uid, bonues, callback) {
	var time = utils.timestamp();
	var sql = "insert into login_bonues(`days`, `bunues_time`, `bonues`, `uid`)values(%d, %d, %d, %d)";
	var sql_cmd = util.format(sql, 1, time, bonues, uid);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR);
			return;
		}
		callback(Respones.OK);
	});
}

function update_user_login_bunues(uid, bonues, days, callback) {
	var time = utils.timestamp();
	var sql = "update login_bonues set days = %d, bunues_time = %d, status = 0, bonues = %d where uid = %d";
	var sql_cmd = util.format(sql, days, time, bonues, uid);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR);
			return;
		}
		callback(Respones.OK);
	})
}

function get_ugame_info_by_uid(uid, callback) {
	var sql = "select uexp, uid, uchip, uvip, status from ugame where uid = %d limit 1";
	var sql_cmd = util.format(sql, uid);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR, null);
			return;
		}
		callback(Respones.OK, sql_ret);
	});
}

function insert_ugame_user(uid, uexp, uchip, callback) {
	var sql = "insert into ugame(`uid`, `uexp`, `uchip`)values(%d, %d, %d)";
	var sql_cmd = util.format(sql, uid, uexp, uchip);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			callback(Respones.SYSTEM_ERR);
			return;
		}
		callback(Respones.OK);
	});
}

// 有增加，也减少
function add_ugame_uchip(uid, uchip, is_add) {
	if (!is_add) { // 扣除
		uchip = -uchip; // 负数
	}

	var sql = "update ugame set uchip = uchip + %d where uid = %d";
	var sql_cmd = util.format(sql, uchip, uid);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			// callback(Respones.SYSTEM_ERR);
			log.error(err);
			return;
		}
	})
}

function update_login_bonues_recved(bonues_id) {
	var sql = "update login_bonues set status = 1 where id = %d";
	var sql_cmd = util.format(sql, bonues_id);
	log.info(sql_cmd);

	mysql_exec(sql_cmd, function(err, sql_ret, fields_desic) {
		if (err) {
			// callback(Respones.SYSTEM_ERR);
			log.error(err);
			return;
		}
	})
}

module.exports = {
	connect: connect_to_gserver,
	get_ugame_info_by_uid: get_ugame_info_by_uid,
	insert_ugame_user: insert_ugame_user,

	get_login_bonues_info: get_login_bonues_info,
	insert_user_login_bonues: insert_user_login_bonues,
	update_user_login_bunues: update_user_login_bunues,

	update_login_bonues_recved: update_login_bonues_recved, // 更新登陆奖励为领取状态
	add_ugame_uchip: add_ugame_uchip, // 更新玩家的金币
}