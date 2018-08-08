var utils = require("utils");
var websocket = require("websocket");
var Stype = require("Stype");
var Cmd = require("Cmd");
var ugame = require("ugame");
var md5 = require("md5");
require("game_system_proto"); 

function get_game_info() {
    websocket.send_cmd(Stype.GameSystem, Cmd.GameSystem.GET_GAME_INFO, null);
}

function get_login_bonues_today() {
    websocket.send_cmd(Stype.GameSystem, Cmd.GameSystem.LOGIN_BONUES_INFO, null);
}

function send_recv_login_bonues(bonues_id) {
    websocket.send_cmd(Stype.GameSystem, Cmd.GameSystem.RECV_LOGIN_BUNUES, bonues_id);
}

function get_world_rank_info() {
    websocket.send_cmd(Stype.GameSystem, Cmd.GameSystem.GET_WORLD_RANK_INFO, null);
}

module.exports = {
    get_game_info: get_game_info,
    get_login_bonues_today: get_login_bonues_today,
    send_recv_login_bonues: send_recv_login_bonues,
    get_world_rank_info: get_world_rank_info,
};
