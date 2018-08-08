var Stype = require("../Stype.js");
var Cmd = require("../Cmd.js");
var utils = require("../../utils/utils.js");
var Respones = require("../Respones.js");
var proto_man = require("../../netbus/proto_man.js");
var proto_tools = require("../../netbus/proto_tools.js");
var log = require("../../utils/log.js");

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
proto_man.reg_decoder(Stype.Auth, Cmd.Auth.GUEST_LOGIN, decode_guest_login);

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
proto_man.reg_encoder(Stype.Auth, Cmd.Auth.GUEST_LOGIN, encode_guest_login);

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

proto_man.reg_encoder(Stype.Auth, Cmd.Auth.UNAME_LOGIN, encode_uname_login);
