var Stype = require("../Stype.js");
var Cmd = require("../Cmd.js");
var utils = require("../../utils/utils.js");
var Respones = require("../Respones.js");
var proto_man = require("../../netbus/proto_man.js");
var proto_tools = require("../../netbus/proto_tools.js");
var log = require("../../utils/log.js");

/*
登陆到游戏服务器 Cmd.GameSytem.UGAME_LOGIN:
服务号
命令号
null,
返回:
服务号
命令号
{
	0: status, OK.
	1: uchip,
	2: uexp,
	3: game_uvip,
	 
}
*/
proto_man.reg_decoder(Stype.GameSystem, Cmd.GameSystem.GET_GAME_INFO, proto_tools.decode_empty_cmd);
function encode_get_ugame_info(stype, ctype, body) {
   if(body[0] != Respones.OK) {
      return proto_tools.encode_status_cmd(stype, ctype, body[0]);
   }

   var total_len = proto_tools.header_size + 2 + 4 + 4 + 2;
   var cmd_buf = proto_tools.alloc_buffer(total_len);

   var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
   proto_tools.write_int16(cmd_buf, offset, body[0]);
   offset += 2;

   proto_tools.write_int32(cmd_buf, offset, body[1]);
   offset += 4;

   proto_tools.write_int32(cmd_buf, offset, body[2]);
   offset += 4;

   proto_tools.write_int16(cmd_buf, offset, body[3]);
   offset += 2;

   return cmd_buf;
}
proto_man.reg_encoder(Stype.GameSystem, Cmd.GameSystem.GET_GAME_INFO, encode_get_ugame_info);


/*获得今天登陆奖励的情况
服务号
命令号
返回: 
服务号
命令号
{
   0: status, 16
   1: 是否有奖励 16 
   2: id 领取的ID，32
   3: bonues 32
   4: days: 16
},
*/
proto_man.reg_decoder(Stype.GameSystem, Cmd.GameSystem.LOGIN_BONUES_INFO, proto_tools.decode_empty_cmd);
function encode_login_bonues_info(stype, ctype, body) {
   if(body[0] != Respones.OK) {
      return proto_tools.encode_status_cmd(stype, ctype, body[0]);
   }

   var total_len = proto_tools.header_size + 2 + 2 + 4 + 4 + 2;
   var cmd_buf = proto_tools.alloc_buffer(total_len);

   var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
   proto_tools.write_int16(cmd_buf, offset, body[0]);
   offset += 2;

   proto_tools.write_int16(cmd_buf, offset, body[1]);
   offset += 2;

   proto_tools.write_int32(cmd_buf, offset, body[2]);
   offset += 4;

   proto_tools.write_int32(cmd_buf, offset, body[3]);
   offset += 4;

   proto_tools.write_int16(cmd_buf, offset, body[4]);
   offset += 2;

   return cmd_buf;
}
proto_man.reg_encoder(Stype.GameSystem, Cmd.GameSystem.LOGIN_BONUES_INFO, encode_login_bonues_info);
/* 领取今天的登陆奖励
服务号
命令号
奖励的id号(32)
{
   0: status
   1: bonues   32bit
}
*/
proto_man.reg_decoder(Stype.GameSystem, Cmd.GameSystem.RECV_LOGIN_BUNUES, proto_tools.decode_int32_cmd);

function encode_recv_login_bonues(stype, ctype, body) {
   if(body[0] != Respones.OK) {
      return proto_tools.encode_status_cmd(stype, ctype, body[0]);
   }

   var total_len = proto_tools.header_size + 2 + 4;
   var cmd_buf = proto_tools.alloc_buffer(total_len);

   var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
   proto_tools.write_int16(cmd_buf, offset, body[0]);
   offset += 2;

   proto_tools.write_int32(cmd_buf, offset, body[1]);
   offset += 4;


   return cmd_buf;
}
proto_man.reg_encoder(Stype.GameSystem, Cmd.GameSystem.RECV_LOGIN_BUNUES, encode_recv_login_bonues);

/*
获取游戏排行榜
服务号
命令号
返回
   服务号
   命令号
   body: {
           0: status, OK, 错误
           1: num: 排行榜记录的数目
           2: [
                [unick, usex, uface, uchip],
               [..],
               [..],
                .....
           ] 
           3: my_rank 
    }

*/

proto_man.reg_decoder(Stype.GameSystem, Cmd.GameSystem.GET_WORLD_RANK_INFO, proto_tools.decode_empty_cmd);

function encode_get_world_rank_info(stype, ctype, body) {
   if(body[0] != Respones.OK) {
      return proto_tools.encode_status_cmd(stype, ctype, body[0]);
   }
   
   var total_len = proto_tools.header_size + 2 + 2;

   for(var i = 0; i < body[1]; i ++) {
      var rank = body[2][i];
      var unick_len = rank[0].utf8_byte_len();
      var one_recode_len = (unick_len + 2);
      one_recode_len += (2 + 2 + 4);
      total_len += one_recode_len;
   }

   total_len += 2; // 自己的排行 

   var cmd_buf = proto_tools.alloc_buffer(total_len);

   var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
   proto_tools.write_int16(cmd_buf, offset, body[0]);
   offset += 2;

   proto_tools.write_int16(cmd_buf, offset, body[1]);
   offset += 2;

   for(var i = 0; i < body[1]; i ++) {
      var rank = body[2][i];
      var unick_len = rank[0].utf8_byte_len();
      
      offset = proto_tools.write_str_inbuf(cmd_buf, offset, rank[0], unick_len);

      proto_tools.write_int16(cmd_buf, offset, rank[1]);
      offset += 2;

      proto_tools.write_int16(cmd_buf, offset, rank[2]);
      offset += 2;

      proto_tools.write_int32(cmd_buf, offset, rank[3]);
      offset += 4;
   }

   proto_tools.write_int16(cmd_buf, offset, body[3]);
   offset += 2;

   return cmd_buf;
}
proto_man.reg_encoder(Stype.GameSystem, Cmd.GameSystem.GET_WORLD_RANK_INFO, encode_get_world_rank_info);
