var utils = require("utils");
var websocket = require("websocket");
var Stype = require("Stype");
var Cmd = require("Cmd");
var ugame = require("ugame");
var md5 = require("md5");
require("auth_proto"); 

function guest_login() {
   
    var key = ugame.guest_key; // 从本地获取
    websocket.send_cmd(Stype.Auth, Cmd.Auth.GUEST_LOGIN, key);
} 

function uname_login() {
    var pwd = md5(ugame.upwd);
    var body = {
        0: ugame.uname,
        1: pwd,
    };

    websocket.send_cmd(Stype.Auth, Cmd.Auth.UNAME_LOGIN, body);
}

function edit_profile(unick, usex)  {
    var body = {
        unick: unick,
        usex: usex,
    };
    websocket.send_cmd(Stype.Auth, Cmd.Auth.EDIT_PROFILE, body);
}

function get_guess_upgrade_verify_code(phone_num, guest_key) {
     var body = {
        0: 0,
        1: phone_num,
        2: guest_key, 
    };
    websocket.send_cmd(Stype.Auth, Cmd.Auth.GUEST_UPGRADE_INDENTIFY, body);
}

function guest_bind_phone(phone_num, pwd, identifying_code) {
    var body = {
        0: phone_num,
        1: pwd, 
        2: identifying_code,
    };
    websocket.send_cmd(Stype.Auth, Cmd.Auth.BIND_PHONE_NUM, body);
}

function get_phone_reg_verify_code(phone) {
    var body = {
        0: 1, // 注册的时候拉取得验证码
        1: phone, // 发送的手机号
    };

    websocket.send_cmd(Stype.Auth, Cmd.Auth.GET_PHONE_REG_VERIFY, body);
}

function get_forget_pwd_verify_code(phone) {
    var body = {
        0: 2, // 注册的时候拉取得验证码
        1: phone, // 发送的手机号
    };

    websocket.send_cmd(Stype.Auth, Cmd.Auth.GET_FORGET_PWD_VERIFY, body);
}

function reg_phone_account(unick, phone, pwd, verify_code) {
    var body = {
        0: phone,
        1: pwd,
        2: verify_code,
        3: unick,
    };

    websocket.send_cmd(Stype.Auth, Cmd.Auth.PHONE_REG_ACCOUNT, body);
}

function reset_user_pwd(phone, pwd, verify_code) {
    var body = {
        0: phone,
        1: pwd,
        2: verify_code,
    };

    websocket.send_cmd(Stype.Auth, Cmd.Auth.RESET_USER_PWD, body);
}

module.exports = {
    guest_login: guest_login,
    uname_login: uname_login,
    edit_profile: edit_profile,
    get_guess_upgrade_verify_code: get_guess_upgrade_verify_code,
    guest_bind_phone: guest_bind_phone,
    get_phone_reg_verify_code: get_phone_reg_verify_code,
    reg_phone_account: reg_phone_account,
    get_forget_pwd_verify_code: get_forget_pwd_verify_code,
    reset_user_pwd: reset_user_pwd,
};
