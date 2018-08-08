var Respones = require("../Respones.js");
var mysql_center = require("../../database/mysql_center.js");
var redis_center = require("../../database/redis_center.js");
var utils = require("../../utils/utils.js");
var log = require("../../utils/log.js");
var phone_msg = require("../phone_msg.js");


function guest_login_success(guest_key, data, ret_func) {
	var ret = {};
	// 登陆成功了
	ret.status = Respones.OK;
	ret.uid = data.uid;
	ret.unick = data.unick;
	ret.usex = data.usex;
	ret.uface = data.uface;
	ret.uvip = data.uvip;
	ret.ukey = guest_key;

	redis_center.set_uinfo_inredis(data.uid, {
		unick: data.unick,
		uface: data.uface,
		usex: data.usex,
		uvip: data.uvip,
		is_guest: 1,
	});
	ret_func(ret);
}

function uname_login_success(data, ret_func) {
	var ret = {};
	// 登陆成功了
	ret.status = Respones.OK;
	ret.uid = data.uid;
	ret.unick = data.unick;
	ret.usex = data.usex;
	ret.uface = data.uface;
	ret.uvip = data.uvip;

	redis_center.set_uinfo_inredis(data.uid, {
		unick: data.unick,
		uface: data.uface,
		usex: data.usex,
		uvip: data.uvip,
		is_guest: 0,
	});

	ret_func(ret);
}

function write_err(status, ret_func) {
	var ret = {};
	ret.status = status;
	ret_func(ret);
}

function guest_login(ukey, ret_func) {

	var unick = "游客" + utils.random_int_str(4); // 游客9527
	var usex = utils.random_int(0, 1); // 性别
	var uface = 0; // 系统只有一个默认的uface,要么就是自定义face;

	// 查询数据库有无用户, 数据库
	mysql_center.get_guest_uinfo_by_ukey(ukey, function(status, data) {
		if (status != Respones.OK) {
			write_err(status, ret_func);
			return;
		}
		if (data.length <= 0) { // 没有这样的key, 注册一个
			mysql_center.insert_guest_user(unick, uface, usex, ukey, function(status) {
				if (status != Respones.OK) {
					write_err(status, ret_func);
					return;
				}

				guest_login(ukey, ret_func);
			});
		}
		else {
			var sql_uinfo = data[0];
			
			if (sql_uinfo.status != 0) { // 游客账号被封
				write_err(Respones.ILLEGAL_ACCOUNT, ret_func);
				return;
			}

			if (!sql_uinfo.is_guest) { // 不是游客不能用游客登陆;
				write_err(Respones.INVALIDI_OPT, ret_func);
				return;
			}

			guest_login_success(ukey, sql_uinfo, ret_func);
		}
		
	});
	// end 
}

function _do_reg_phone_account(phone, pwd_md5, unick, ret_func) {
	var usex = utils.random_int(0, 1); // 性别
	var uface = 0; // 系统只有一个默认的uface,要么就是自定义face;

	mysql_center.insert_phone_account_user(unick, uface, usex, phone, pwd_md5, function(status) {
		ret_func(status);
	});
}

function _do_account_reset_pwd(phone, pwd_md5, ret_func) {
	mysql_center.reset_account_pwd(phone, pwd_md5, function(status) {
		ret_func(status);
	});
}

function uname_login(uname, upwd, ret_func) {
	// 查询数据库有无用户, 数据库
	mysql_center.get_uinfo_by_uname_upwd(uname, upwd, function(status, data) {
		if (status != Respones.OK) {
			write_err(status, ret_func);
			return;
		}
		if (data.length <= 0) { // 没有这样的uname, upwd
			write_err(Respones.UNAME_OR_UPWD_ERR, ret_func);
		}
		else {
			var sql_uinfo = data[0];
			
			if (sql_uinfo.status != 0) { // 账号被封
				write_err(Respones.ILLEGAL_ACCOUNT, ret_func);
				return;
			}

			uname_login_success(sql_uinfo, ret_func);
		}
		
	});
	// end 
}

function edit_profile(uid, unick, usex, ret_func) {
	mysql_center.edit_profile(uid, unick, usex, function(status) {
		if (status != Respones.OK) {
			write_err(status, ret_func);
			return;
		}

		var body = {
			status: status,
			unick: unick,
			usex: usex,
		};
		
		ret_func(body);
	});
}

// end_duration 单位是秒
function _send_indentify_code(phone_num, opt, end_duration, ret_func) {
	var code = utils.random_int_str(6);
	

	// 把code 插入到数据库
	mysql_center.update_phone_indentify(code, phone_num, opt, end_duration, function(status) {
		if(status == Respones.OK) {
			// 发送短信
			phone_msg.send_indentify_code(phone_num, code);
			// end 
		}
		ret_func(status);
	});
	// end 
}

function get_upgrade_indentify(uid, ukey, phone, opt, ret_func) {
	// 判断账号的合法性
	mysql_center.is_exist_guest(uid, function(status) {
		if(status != Respones.OK) {
			ret_func(Respones.INVALIDI_OPT);
			return;
		}

		_send_indentify_code(phone, opt, 60, ret_func);
	})
	// end 
}

function get_phone_reg_verify_code(phone, ret_func) {
	mysql_center.check_phone_unuse(phone, function(status) {
		if(status != Respones.OK) {
			ret_func(Respones.PHONE_IS_REG);
			return;
		}
		_send_indentify_code(phone, 1, 60, ret_func); 
	})
	
}

function get_forget_pwd_verify_code(phone, ret_func) {
	mysql_center.check_phone_is_reged(phone, function(status) {
		if(status != Respones.OK) {
			ret_func(Respones.PHONE_IS_NOT_REG);
			return;
		}
		_send_indentify_code(phone, 2, 60, ret_func); 
	})
}

function _do_bind_guest_account(uid, phone_num, pwd_md5, phone_code, ret_func) {
	mysql_center.do_upgrade_guest_account(uid, phone_num, pwd_md5, function(status) {
		ret_func(status);
	})
}

function _check_guest_upgrade_phone_code_valid(uid, phone_num, pwd_md5, phone_code, ret_func) {
	mysql_center.check_phone_code_valid(phone_num, phone_code, 0, function(status) {
		if (status != Respones.OK) {
			ret_func(Respones.PHONE_CODE_ERR);
			return;
		}

		// 账号升级, 更新数据库，返回结果
		_do_bind_guest_account(uid, phone_num, pwd_md5, phone_code, ret_func);
		// end 
	})
}

function _check_reg_phone_account_verify_code(phone, pwd_md5, verify_code, unick, ret_func) {
	mysql_center.check_phone_code_valid(phone, verify_code, 1, function(status) {
		if (status != Respones.OK) {
			ret_func(Respones.PHONE_CODE_ERR);
			return;
		}

		// 新建一个手机注册的账号
		_do_reg_phone_account(phone, pwd_md5, unick, ret_func);
		// end 
	})
}

function _check_reset_pwd_verify_code(phone, pwd_md5, verify_code, ret_func) {
	mysql_center.check_phone_code_valid(phone, verify_code, 2, function(status) {
		if (status != Respones.OK) {
			ret_func(Respones.PHONE_CODE_ERR);
			return;
		}

		// 新建一个手机注册的账号
		_do_account_reset_pwd(phone, pwd_md5, ret_func);
		// end 
	})
}

function _check_phone_is_binded(uid, phone_num, pwd_md5, phone_code, ret_func) {
	mysql_center.check_phone_unuse(phone_num, function(status) {
		if(status != Respones.OK) {
			ret_func(Respones.PHONE_IS_REG);
			return;
		}

		// 手机绑定, 检查验证码
		_check_guest_upgrade_phone_code_valid(uid, phone_num, pwd_md5, phone_code, ret_func);
		// end 
	})
}

// uid 用户ID， phone_num手机号 pwd_md5密码, ukey 是游客的ukey, 验证码
function guest_bind_phone_number(uid, phone_num, pwd_md5, phone_code, ret_func) {
	// 判断账号的合法性
	mysql_center.is_exist_guest(uid, function(status) {
		if(status != Respones.OK) {
			ret_func(Respones.INVALIDI_OPT);
			return;
		}

		_check_phone_is_binded(uid, phone_num, pwd_md5, phone_code, ret_func);
	})
	// end
}

function reg_phone_account(phone, pwd_md5, verify_code, unick, ret_func) {
	mysql_center.check_phone_unuse(phone, function(status) {
		if(status != Respones.OK) {
			ret_func(Respones.PHONE_IS_REG);
			return;
		}

		// 检查验证码
		_check_reg_phone_account_verify_code(phone, pwd_md5, verify_code, unick, ret_func);
		// end 
	})
}

function reset_user_pwd(phone, pwd_md5, verify_code, ret_func) {
	mysql_center.check_phone_is_reged(phone, function(status) {
		if(status != Respones.OK) {
			ret_func(Respones.PHONE_IS_NOT_REG);
			return;
		}

		// 检查验证码
		_check_reset_pwd_verify_code(phone, pwd_md5, verify_code, ret_func);
		// end 
	})
}

module.exports = {
	guest_login: guest_login,
	uname_login: uname_login,
	edit_profile: edit_profile, 
	get_upgrade_indentify: get_upgrade_indentify, // 游客升级，拉去手机验证码
	guest_bind_phone_number: guest_bind_phone_number, // 游客绑定手机号码;
	get_phone_reg_verify_code: get_phone_reg_verify_code,
	reg_phone_account: reg_phone_account, // 手机注册,
	get_forget_pwd_verify_code: get_forget_pwd_verify_code, // 忘记密码的手机验证码
	reset_user_pwd: reset_user_pwd, // 重置密码
};