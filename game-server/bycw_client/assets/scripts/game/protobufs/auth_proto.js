var proto_man = require("proto_man");
var proto_tools = require("proto_tools");
var Stype = require("Stype");
var Cmd = require("Cmd");
var Respones = require("Respones");

/*
游客登陆:
服务号
命令号
ukey  --> string;
返回:
   服务号
   命令号
   {
		status: 状态, OK,错误,就没有后面的色数据
		uid
		unick
		usex
		uface
		uvip
		ukey
   }
*/
function decode_guest_login(cmd_buf) {
    var cmd = {};
    cmd[0] = proto_tools.read_int16(cmd_buf, 0);
    cmd[1] = proto_tools.read_int16(cmd_buf, 2);
    var body = {};
    cmd[2] = body;

    var offset = proto_tools.header_size;
    body.status = proto_tools.read_int16(cmd_buf, offset);
    if (body.status != Respones.OK) {
        return cmd;
    }
    offset += 2;

    body.uid = proto_tools.read_uint32(cmd_buf, offset);
    offset += 4;

    var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
    body.unick = ret[0];
    offset = ret[1];
    
    body.usex = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    body.uface = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    body.uvip = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;
    
    var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
    body.ukey = ret[0];
    offset = ret[1];

    return cmd;
}

proto_man.reg_encoder(Stype.Auth, Cmd.Auth.GUEST_LOGIN, proto_tools.encode_str_cmd);
proto_man.reg_decoder(Stype.Auth, Cmd.Auth.GUEST_LOGIN, decode_guest_login);
/*
重复登陆:
   服务号
   命令号
   body: null,
*/
proto_man.reg_decoder(Stype.Auth, Cmd.Auth.RELOGIN, proto_tools.decode_empty_cmd);

/*
修改用户资料:
   服务号
   命令号
   body {
		unick:
		usex:
   }
返回:
   服务号
   命令号
   body {
		status: OK or 失败
		unick
		usex
   }
*/

function decode_edit_profile(cmd_buf) {
   var cmd = {};
   cmd[0] = proto_tools.read_int16(cmd_buf, 0);
   cmd[1] = proto_tools.read_int16(cmd_buf, 2);
   var body = {};
   cmd[2] = body;

   var offset = proto_tools.header_size;
   body.status = proto_tools.read_int16(cmd_buf, offset);
   offset += 2;
   if(body.status != Respones.OK) {
       return cmd;
   }

   var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body.unick = ret[0];
   offset = ret[1];
   
   body.usex = proto_tools.read_int16(cmd_buf, offset);
   

   return cmd;
}

function encode_edit_profile(stype, ctype, body) {

   var unick_len = body.unick.utf8_byte_len();

   var total_len = proto_tools.header_size + (2 + unick_len) + 2;
   var cmd_buf = proto_tools.alloc_buffer(total_len);
   var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);


   offset = proto_tools.write_str_inbuf(cmd_buf, offset, body.unick, unick_len);
   proto_tools.write_int16(cmd_buf, offset, body.usex);
   offset += 2;

   return cmd_buf;
}

proto_man.reg_decoder(Stype.Auth, Cmd.Auth.EDIT_PROFILE, decode_edit_profile);
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.EDIT_PROFILE, encode_edit_profile);
/*
拉取用户账号升级的验证码:
   服务号
   命令号
   body {
      0: opt_code, 操作码0, 游客升级, 1手机注册, 2忘记密码
      1: phone number, 电话号码
      2: guest_key, 游客的key
   }
返回:
    服务号, 命令号, status 状态码
*/
function encode_upgrade_verify_code(stype, ctype, body) {
   var phone_len = body[1].utf8_byte_len();
   var guest_key_len = body[2].utf8_byte_len();

   var total_len = proto_tools.header_size + 2 + (2 + unick_len) + (2 + guest_key_len);
   var cmd_buf = proto_tools.alloc_buffer(total_len);
   var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);

   proto_tools.write_int16(cmd_buf, offset, body[0]);
   offset += 2;

   offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[1], phone_len);
   proto_tools.write_str_inbuf(cmd_buf, offset, body[2], guest_key_len);

   return cmd_buf;
}

proto_man.reg_encoder(Stype.Auth, Cmd.Auth.GUEST_UPGRADE_INDENTIFY, encode_upgrade_verify_code);
proto_man.reg_decoder(Stype.Auth, Cmd.Auth.GUEST_UPGRADE_INDENTIFY, proto_tools.decode_status_cmd);

/*
绑定游客账号的协议:
   服务号
   命令号
   body {
      0: phone_num,
      1: pwd_md5,
      3: phone code, 手机验证码
   }
   返回: 服务号, 命令号, status
*/
function encode_guest_bind_account(stype, ctype, body) {
    var phone_len = body[0].utf8_byte_len();
    var pwd_len = body[1].utf8_byte_len();
    var verify_code_len = body[2].utf8_byte_len();

    var total_len = proto_tools.header_size + (2 + phone_len) + (2 + pwd_len) + (2 + verify_code_len);
    var cmd_buf = proto_tools.alloc_buffer(total_len);
    var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);

    offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[0], phone_len);
    offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[1], pwd_len);
    offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[2], verify_code_len);

    return cmd_buf;
}

proto_man.reg_encoder(Stype.Auth, Cmd.Auth.BIND_PHONE_NUM, encode_guest_bind_account);
proto_man.reg_decoder(Stype.Auth, Cmd.Auth.BIND_PHONE_NUM, proto_tools.decode_status_cmd);
/*
账号密码登录:
   服务号
   命令号
   body {
      0: uname,
      1: upwd,
   }
   返回: 
   服务号
   命令号
   body
   {
      status: = Respones.OK;
      uid: = data.uid;
      unick: = data.unick;
      usex: = data.usex;
      uface: = data.uface;
      uvip: = data.uvip;
   }
*/
function encode_uname_login(stype, ctype, body) {
    var uname_len = body[0].utf8_byte_len();
    var upwd_len = body[1].utf8_byte_len();

    var total_len = proto_tools.header_size + (2 + uname_len) + (2 + upwd_len);
    var cmd_buf = proto_tools.alloc_buffer(total_len);
    var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);

    offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[0], uname_len);
    offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[1], upwd_len);

    return cmd_buf;
}

function decode_uname_login(cmd_buf) {
    var cmd = {};
    cmd[0] = proto_tools.read_int16(cmd_buf, 0);
    cmd[1] = proto_tools.read_int16(cmd_buf, 2);
    var body = {};
    cmd[2] = body;

    var offset = proto_tools.header_size;
    body.status = proto_tools.read_int16(cmd_buf, offset);
    if (body.status != Respones.OK) {
        return cmd;
    }
    offset += 2;

    body.uid = proto_tools.read_uint32(cmd_buf, offset);
    offset += 4;

    var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
    body.unick = ret[0];
    offset = ret[1];
    
    body.usex = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    body.uface = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    body.uvip = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    return cmd;
}

proto_man.reg_decoder(Stype.Auth, Cmd.Auth.UNAME_LOGIN, decode_uname_login);
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.UNAME_LOGIN, encode_uname_login);
/*
获取手机注册的验证码:
   服务号
   命令号
   body {
      0: opt_code, 操作码0, 游客升级, 1手机注册, 2忘记密码
      1: phone number, 电话号码
   }
返回:
    服务号, 命令号, status 状态码
*/
function encode_phone_reg_verify_code(stype, ctype, body) {
   var phone_len = body[1].utf8_byte_len();

   var total_len = proto_tools.header_size + 2 + (2 + phone_len);
   var cmd_buf = proto_tools.alloc_buffer(total_len);
   var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);

   proto_tools.write_int16(cmd_buf, offset, body[0]);
   offset += 2;

   offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[1], phone_len);

   return cmd_buf;
}

proto_man.reg_encoder(Stype.Auth, Cmd.Auth.GET_PHONE_REG_VERIFY, encode_phone_reg_verify_code);
proto_man.reg_decoder(Stype.Auth, Cmd.Auth.GET_PHONE_REG_VERIFY, proto_tools.decode_status_cmd);
/*
手机注册账号
   服务号
   命令号
   body {
      0: phone,
      1: pwd,
      2: verify_code,
      3: unick,
   }
返回:
   服务号
   命令号
   status
*/

function encode_phone_reg_account(stype, ctype, body) {
    var phone_len = body[0].utf8_byte_len();
    var pwd_len = body[1].utf8_byte_len();
    var verify_code_len = body[2].utf8_byte_len();
    var unick_len = body[3].utf8_byte_len();

    
    var total_len = proto_tools.header_size + (2 + phone_len) + (2 + pwd_len) + (2 + verify_code_len) + (2 + unick_len);
    var cmd_buf = proto_tools.alloc_buffer(total_len);

    var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
    offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[0], phone_len);
    offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[1], pwd_len);
    offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[2], verify_code_len);
    offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[3], unick_len);

    return cmd_buf;
}
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.PHONE_REG_ACCOUNT, encode_phone_reg_account);
proto_man.reg_decoder(Stype.Auth, Cmd.Auth.PHONE_REG_ACCOUNT, proto_tools.decode_status_cmd);
/*
修改用户密码获取验证码:
   服务号
   命令号
   body {
      0: opt_code, 操作码0, 游客升级, 1手机注册, 2忘记密码
      1: phone number, 电话号码
   }
返回:
    服务号, 命令号, status 状态码
*/
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.GET_FORGET_PWD_VERIFY, encode_phone_reg_verify_code);
proto_man.reg_decoder(Stype.Auth, Cmd.Auth.GET_FORGET_PWD_VERIFY, proto_tools.decode_status_cmd);
/*
找回密码
   服务号
   命令号
   body {
      0: phone,
      1: pwd,
      2: verify_code,
   }
返回:
   服务号
   命令号
   status
*/
function encode_reset_upwd(stype, ctype, body) {
    var phone_len = body[0].utf8_byte_len();
    var pwd_len = body[1].utf8_byte_len();
    var verify_code_len = body[2].utf8_byte_len();

    
    var total_len = proto_tools.header_size + (2 + phone_len) + (2 + pwd_len) + (2 + verify_code_len);
    var cmd_buf = proto_tools.alloc_buffer(total_len);

    var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
    offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[0], phone_len);
    offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[1], pwd_len);
    offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[2], verify_code_len);

    return cmd_buf;
}
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.RESET_USER_PWD, encode_reset_upwd);
proto_man.reg_decoder(Stype.Auth, Cmd.Auth.RESET_USER_PWD, proto_tools.decode_status_cmd);

