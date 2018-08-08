var utils = require("utils");
var websocket = require("websocket");
var Stype = require("Stype");
var Cmd = require("Cmd");
var ugame = require("ugame");
var md5 = require("md5");
require("five_chess_proto"); 

function enter_zone(zid) {
    websocket.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.ENTER_ZONE, zid);
}

function user_quit() {
    websocket.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.USER_QUIT, null);
}

function send_prop(to_seatid, propid) {
    var body = {
        0: propid, 
        1: to_seatid, 
    };

    websocket.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.SEND_PROP, body);
}

function send_do_ready() {
    websocket.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.SEND_DO_READY, null);
}

function send_put_chess(block_x, block_y) {
    var body = {
        0: block_x,
        1: block_y,
    };
    websocket.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.PUT_CHESS, body);
}

function send_get_prev_round() {
    websocket.send_cmd(Stype.Game5Chess, Cmd.Game5Chess.GET_PREV_ROUND, null);
}

module.exports = {
    enter_zone: enter_zone,
    user_quit: user_quit,
    send_prop: send_prop,
    send_do_ready: send_do_ready, 
    send_put_chess: send_put_chess,
    send_get_prev_round: send_get_prev_round,
};
