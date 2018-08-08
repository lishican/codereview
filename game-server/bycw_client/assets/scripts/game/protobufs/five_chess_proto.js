var proto_man = require("proto_man");
var proto_tools = require("proto_tools");
var Stype = require("Stype");
var Cmd = require("Cmd");
var Respones = require("Respones");


/*
加入游戏区间
服务号
命令号
区间号
返回:
  服务号
  命令号
  status
*/
proto_man.reg_encoder(Stype.Game5Chess, Cmd.Game5Chess.ENTER_ZONE, proto_tools.encode_status_cmd);
proto_man.reg_decoder(Stype.Game5Chess, Cmd.Game5Chess.ENTER_ZONE, proto_tools.decode_status_cmd);

/*
离开游戏服务器
服务号
命令号
返回
	服务号
	命令号
	status  
*/
proto_man.reg_encoder(Stype.Game5Chess, Cmd.Game5Chess.USER_QUIT, proto_tools.encode_empty_cmd);
proto_man.reg_decoder(Stype.Game5Chess, Cmd.Game5Chess.USER_QUIT, proto_tools.decode_status_cmd);

/*
进入房间桌子
服务号
命令号
桌子ID: 32 
返回:
   服务号
   命令号
   body: {
	0: status, (16)
	1: zid  (16)
	2: room_id; (32)
   }
*/

proto_man.reg_encoder(Stype.Game5Chess, Cmd.Game5Chess.ENTER_ROOM, proto_tools.encode_int32_cmd);

function decode_enter_room(cmd_buf) {
    var cmd = {};

    cmd[0] = proto_tools.read_int16(cmd_buf, 0);
    cmd[1] = proto_tools.read_int16(cmd_buf, 2);
    var body = {};
    cmd[2] = body;

    var offset = proto_tools.header_size;
    body[0] = proto_tools.read_int16(cmd_buf, offset);
    if (body[0] != Respones.OK) {
        return cmd;
    }
    offset += 2;
    
    body[1] = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;  

    body[2] = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;
    
    return cmd;
}

proto_man.reg_decoder(Stype.Game5Chess, Cmd.Game5Chess.ENTER_ROOM, decode_enter_room);

/*
发送道具
服务号
命令号
body {
	0: 道具号
	1: to 座位号
}
返回:
服务号
命令号
body 
{
	0: status,
	1: from_seat,
	2: to_seat,
	3: 道具类型
}
*/
