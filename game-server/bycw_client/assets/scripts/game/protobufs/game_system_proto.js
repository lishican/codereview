var proto_man = require("proto_man");
var proto_tools = require("proto_tools");
var Stype = require("Stype");
var Cmd = require("Cmd");
var Respones = require("Respones");


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
proto_man.reg_encoder(Stype.GameSystem, Cmd.GameSystem.GET_GAME_INFO, proto_tools.encode_empty_cmd);

function decode_get_ugame_info(cmd_buf) {
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

    body[1] = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;

    body[2] = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;

    body[3] = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    return cmd;
}
proto_man.reg_decoder(Stype.GameSystem, Cmd.GameSystem.GET_GAME_INFO, decode_get_ugame_info);


/*
服务号
命令号
返回: 
服务号
命令号
{
   0: status, 16
   1: 是否有奖励, int16 
   2: id 领取的ID，int32
   3: bonues int32
   4: days: int16
},
*/
proto_man.reg_encoder(Stype.GameSystem, Cmd.GameSystem.LOGIN_BONUES_INFO, proto_tools.encode_empty_cmd);
function decode_login_bonues_info(cmd_buf) {
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

    // 是否有奖励
    body[1] = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    // 奖励的ID号
    body[2] = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;

    // 奖励的数目
    body[3] = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;

    // 登陆的天数
    body[4] = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    return cmd;
}
proto_man.reg_decoder(Stype.GameSystem, Cmd.GameSystem.LOGIN_BONUES_INFO, decode_login_bonues_info);
/* 领取今天的登陆奖励
服务号
命令号
奖励的id号(32)
{
   0: status  16
   1: bonues   32
}
*/
proto_man.reg_encoder(Stype.GameSystem, Cmd.GameSystem.RECV_LOGIN_BUNUES, proto_tools.encode_int32_cmd);
function decode_recv_login_bonues(cmd_buf) {
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
    // 奖励的数目
    body[1] = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;

   
    return cmd;
}
proto_man.reg_decoder(Stype.GameSystem, Cmd.GameSystem.RECV_LOGIN_BUNUES, decode_recv_login_bonues);


/*
获取游戏排行榜
服务号
命令号
返回
   服务号
   命令号
   body: {
           0: status, OK, 错误
           num: 排行榜记录的数目
           [
                [unick, usex, uface, uchip],
   [..],
   [..],
                .....
           ]
           3: my_rank 
    }

*/
proto_man.reg_encoder(Stype.GameSystem, Cmd.GameSystem.GET_WORLD_RANK_INFO, proto_tools.encode_empty_cmd);
function decode_world_rank_info(cmd_buf) {
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

    body[2] = [];
    for(var i = 0; i < body[1]; i ++) {
        var one_recode = [null, null, null, null];
        var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
        
        one_recode[0] = ret[0];
        offset = ret[1];

        one_recode[1] = proto_tools.read_int16(cmd_buf, offset);
        offset += 2;

        one_recode[2] = proto_tools.read_int16(cmd_buf, offset);
        offset += 2;

        one_recode[3] = proto_tools.read_int32(cmd_buf, offset);
        offset += 4;

        body[2].push(one_recode);
    }

    body[3] = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    return cmd;
}
proto_man.reg_decoder(Stype.GameSystem, Cmd.GameSystem.GET_WORLD_RANK_INFO, decode_world_rank_info);
