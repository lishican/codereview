var Stype = require("../Stype.js");
var Cmd = require("../Cmd.js");
var utils = require("../../utils/utils.js");
var Respones = require("../Respones.js");
var proto_man = require("../../netbus/proto_man.js");
var proto_tools = require("../../netbus/proto_tools.js");
var log = require("../../utils/log.js");

/*
服务号: Stype.Broadcast
命令号: Cmd.BROADCAST,
body: {
	cmd_buf: <Buffer> 要发送给用户的命令
	users: [uid1, uid2, uid3, ...], 要接收的用户, 
}
*/

function encode_broadcast(stype, ctype, body) {

	var buffer_len = body.cmd_buf.length;
	var user_num = body.users.length;

	var total_len = proto_tools.header_size + (2 + buffer_len) + (2 + user_num * 4);
	var cmd_buf = proto_tools.alloc_buffer(total_len);


	var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);

	proto_tools.write_int16(cmd_buf, offset, (2 + buffer_len));
	offset += 2;

	body.cmd_buf.copy(cmd_buf, offset, 0, buffer_len);
	offset += buffer_len;

	proto_tools.write_int16(cmd_buf, offset, user_num);
	offset += 2;

	for(var i in body.users) {
		proto_tools.write_uint32(cmd_buf, offset, body.users[i]);
		offset += 4;
	}

	return cmd_buf;
}

proto_man.reg_encoder(Stype.Broadcast, Cmd.BROADCAST, encode_broadcast);

function decode_broadcast(cmd_buf) {
	var cmd = {};
	cmd[0] = proto_tools.read_int16(cmd_buf, 0);
	cmd[1] = proto_tools.read_int16(cmd_buf, 2);
	var body = {};
	cmd[2] = body;

	var offset = proto_tools.header_size;
	// 解码cmd_buf
	var buffer_len = proto_tools.read_int16(cmd_buf, offset);
	offset += 2;
	
	body.cmd_buf = Buffer.allocUnsafe(buffer_len - 2);
	cmd_buf.copy(body.cmd_buf, 0, offset, offset + buffer_len - 2);
	offset += (buffer_len - 2);
	// end 

	body.users = [];
	var user_num = proto_tools.read_int16(cmd_buf, offset);
	offset += 2;

	for(var i = 0; i < user_num; i ++) {
		var uid = proto_tools.read_uint32(cmd_buf, offset);
		body.users.push(uid);
		offset += 4;
	}

	return cmd;
}

proto_man.reg_decoder(Stype.Broadcast, Cmd.BROADCAST, decode_broadcast);
