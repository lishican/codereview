var Stype = require("../Stype.js");
var Cmd = require("../Cmd.js");
var utils = require("../../utils/utils.js");
var Respones = require("../Respones.js");
var proto_man = require("../../netbus/proto_man.js");
var proto_tools = require("../../netbus/proto_tools.js");
var log = require("../../utils/log.js");

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
function encode_guest_login(stype, ctype, body) {
   if(body.status != Respones.OK) {
      return proto_tools.encode_status_cmd(stype, ctype, body.status);
   }

   var unick_len = body.unick.utf8_byte_len();
   var ukey_len = body.ukey.utf8_byte_len();

   var total_len = proto_tools.header_size + 2 + 4 + (2 + unick_len) + 2 + 2 + 2 + (2 + ukey_len);
   var cmd_buf = proto_tools.alloc_buffer(total_len);
   var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
   proto_tools.write_int16(cmd_buf, offset, body.status);
   offset += 2;

   proto_tools.write_uint32(cmd_buf, offset, body.uid);
   offset += 4;

   offset = proto_tools.write_str_inbuf(cmd_buf, offset, body.unick, unick_len);

   proto_tools.write_int16(cmd_buf, offset, body.usex);
   offset += 2;

   proto_tools.write_int16(cmd_buf, offset, body.uface);
   offset += 2;

   proto_tools.write_int16(cmd_buf, offset, body.uvip);
   offset += 2;

   offset = proto_tools.write_str_inbuf(cmd_buf, offset, body.ukey, ukey_len);

   return cmd_buf;
}

proto_man.reg_decoder(Stype.Auth, Cmd.Auth.GUEST_LOGIN, proto_tools.decode_str_cmd);
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.GUEST_LOGIN, encode_guest_login);
/*
重复登陆:
   服务号
   命令号
   body: null,
*/
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.RELOGIN, proto_tools.encode_empty_cmd);
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

   var ret = proto_tools.read_str_inbuf(cmd_buf, proto_tools.header_size);
   body.unick = ret[0];
   var offset = ret[1];
   body.usex = proto_tools.read_int16(cmd_buf, offset);
   cmd[2] = body;

   return cmd;
}

function encode_edit_profile(stype, ctype, body) {
   if(body.status != Respones.OK) {
      return proto_tools.encode_status_cmd(stype, ctype, body.status);
   }

   var unick_len = body.unick.utf8_byte_len();

   var total_len = proto_tools.header_size + 2 + (2 + unick_len) + 2;
   var cmd_buf = proto_tools.alloc_buffer(total_len);

   var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
   proto_tools.write_int16(cmd_buf, offset, body.status);
   offset += 2;

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

function decode_upgrade_verify_code(cmd_buf) {
   var cmd = {};
   cmd[0] = proto_tools.read_int16(cmd_buf, 0);
   cmd[1] = proto_tools.read_int16(cmd_buf, 2);
   var body = {};

   var offset = proto_tools.header_size;
   body[0] = proto_tools.read_int16(cmd_buf, offset);
   offset += 2;

   var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[1] = ret[0];
   offset = ret[1];

   ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[2] = ret[0];
   offset = ret[1];

   cmd[2] = body;
   return cmd;
}
proto_man.reg_decoder(Stype.Auth, Cmd.Auth.GUEST_UPGRADE_INDENTIFY, decode_upgrade_verify_code);
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.GUEST_UPGRADE_INDENTIFY, proto_tools.encode_status_cmd);
/*
绑定游客账号的协议:
   服务号
   命令号
   body {
      0: phone_num,
      1: pwd_md5,
      2: phone code, 手机验证码
   }
   返回: status
*/
function decode_bind_phone(cmd_buf) {
   var cmd = {};
   cmd[0] = proto_tools.read_int16(cmd_buf, 0);
   cmd[1] = proto_tools.read_int16(cmd_buf, 2);
   var body = {};

   var offset = proto_tools.header_size;
   var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[0] = ret[0];
   offset = ret[1];

   ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[1] = ret[0];
   offset = ret[1];

   ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[2] = ret[0];
   offset = ret[1];

   cmd[2] = body;
   return cmd;
}

proto_man.reg_decoder(Stype.Auth, Cmd.Auth.BIND_PHONE_NUM, decode_bind_phone);
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.BIND_PHONE_NUM, proto_tools.encode_status_cmd);

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

function decode_uname_login(cmd_buf) {
   var cmd = {};
   cmd[0] = proto_tools.read_int16(cmd_buf, 0);
   cmd[1] = proto_tools.read_int16(cmd_buf, 2);
   var body = {};

   var offset = proto_tools.header_size;
   var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[0] = ret[0];
   offset = ret[1];

   ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[1] = ret[0];
   offset = ret[1];

   cmd[2] = body;
   return cmd;
}

function encode_uname_login(stype, ctype, body) {
   if(body.status != Respones.OK) {
      return proto_tools.encode_status_cmd(stype, ctype, body.status);
   }

   var unick_len = body.unick.utf8_byte_len();
   
   var total_len = proto_tools.header_size + 2 + 4 + (2 + unick_len) + 2 + 2 + 2;
   var cmd_buf = proto_tools.alloc_buffer(total_len);
   var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
   proto_tools.write_int16(cmd_buf, offset, body.status);
   offset += 2;

   proto_tools.write_uint32(cmd_buf, offset, body.uid);
   offset += 4;

   offset = proto_tools.write_str_inbuf(cmd_buf, offset, body.unick, unick_len);

   proto_tools.write_int16(cmd_buf, offset, body.usex);
   offset += 2;

   proto_tools.write_int16(cmd_buf, offset, body.uface);
   offset += 2;

   proto_tools.write_int16(cmd_buf, offset, body.uvip);
   offset += 2;

   return cmd_buf;
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
function decode_phone_reg_verify_code(cmd_buf) {
   var cmd = {};
   cmd[0] = proto_tools.read_int16(cmd_buf, 0);
   cmd[1] = proto_tools.read_int16(cmd_buf, 2);
   var body = {};

   var offset = proto_tools.header_size;
   body[0] = proto_tools.read_int16(cmd_buf, offset);
   offset += 2;

   var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[1] = ret[0];
   offset = ret[1];


   cmd[2] = body;
   return cmd;
}
proto_man.reg_decoder(Stype.Auth, Cmd.Auth.GET_PHONE_REG_VERIFY, decode_phone_reg_verify_code);
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.GET_PHONE_REG_VERIFY, proto_tools.encode_status_cmd);

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
function decode_phone_reg_account(cmd_buf) {
   var cmd = {};
   cmd[0] = proto_tools.read_int16(cmd_buf, 0);
   cmd[1] = proto_tools.read_int16(cmd_buf, 2);
   var body = {};

   var offset = proto_tools.header_size;
   var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[0] = ret[0];
   offset = ret[1];

   ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[1] = ret[0];
   offset = ret[1];

   ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[2] = ret[0];
   offset = ret[1];

   ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[3] = ret[0];
   offset = ret[1];

   cmd[2] = body;
   return cmd;
}

proto_man.reg_decoder(Stype.Auth, Cmd.Auth.PHONE_REG_ACCOUNT, decode_phone_reg_account);
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.PHONE_REG_ACCOUNT, proto_tools.encode_status_cmd);

/*
修改用户密码:
   服务号
   命令号
   body {
      0: opt_code, 操作码0, 游客升级, 1手机注册, 2忘记密码
      1: phone number, 电话号码
   }
返回:
    服务号, 命令号, status 状态码
*/
proto_man.reg_decoder(Stype.Auth, Cmd.Auth.GET_FORGET_PWD_VERIFY, decode_phone_reg_verify_code);
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.GET_FORGET_PWD_VERIFY, proto_tools.encode_status_cmd);

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
function decode_reset_upwd(cmd_buf) {
   var cmd = {};
   cmd[0] = proto_tools.read_int16(cmd_buf, 0);
   cmd[1] = proto_tools.read_int16(cmd_buf, 2);
   var body = {};

   var offset = proto_tools.header_size;
   var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[0] = ret[0];
   offset = ret[1];

   ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[1] = ret[0];
   offset = ret[1];

   ret = proto_tools.read_str_inbuf(cmd_buf, offset);
   body[2] = ret[0];
   offset = ret[1];


   cmd[2] = body;
   return cmd;
}

proto_man.reg_decoder(Stype.Auth, Cmd.Auth.RESET_USER_PWD, decode_reset_upwd);
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.RESET_USER_PWD, proto_tools.encode_status_cmd);

