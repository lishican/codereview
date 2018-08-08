var websocket = require("websocket");
var Stype = require("Stype");
var Cmd = require("Cmd");
var Respones = require("Respones");
var ugame = require("ugame");
var five_chess = require("five_chess");
var game_seat = require("game_seat");
var State = require("State");

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...

        seatA: {
            type: game_seat,
            default: null,
        },

        seatB: {
            type: game_seat,
            default: null,
        },

        prop_prefab: {
            type: cc.Prefab,
            default: null,
        },

        do_ready_button: {
            type: cc.Node,
            default: null,
        },
    },

    // use this for initialization
    onLoad: function () {
        this.disk = this.node.getChildByName("chessbox").getComponent("chess_disk");
        this.checkout = this.node.getChildByName("checkout").getComponent("checkout");

        this.do_ready_button.active = true;
        var service_handlers = {};
        service_handlers[Stype.Game5Chess] = this.on_five_chess_server_return.bind(this);

        websocket.register_serivces_handler(service_handlers);
    },

    enter_zone_return: function(status) {
        console.log(status);
    },

    user_quit_return: function(status) {
        if (status != Respones.OK) {
            return;
        }

        cc.director.loadScene("home_scene");
    },

    enter_room_return: function(body) {
        if (body[0] != Respones.OK) {
            return;
        }

        console.log("you enter zone:", body[1], " in room:", body[2]);
    },

    on_sitdown_return: function(body) {
        var status = body[0]
        if (status != Respones.OK) {
            return;
        }

        var sv_seatid = body[1];
        console.log("you sitdown in seat: ", sv_seatid);

        var player_info = {
            unick: ugame.unick,
            usex: ugame.usex,
            uface: ugame.uface,

            uvip: ugame.game_info.uvip,
            uchip: ugame.game_info.uchip,
            uexp: ugame.game_info.uexp,

            sv_seatid: sv_seatid, 

            state: State.InView,
        };

        this.seatA.on_sitdown(player_info, true);
    },

    on_user_arrived_return: function(body) {
        console.log("user arrived in seat: ", body[0]);
        var player_info = {
            sv_seatid: body[0], 
            unick: body[1],
            usex: body[2],
            uface: body[3],

            uchip: body[4],
            uexp: body[5],
            uvip: body[6],
            state: body[7],
        };
        
        this.seatB.on_sitdown(player_info, false);
    },

    on_standup_return: function(body) {
        if (body[0] != Respones.OK) {
            return;
        }

        var seatid = body[1];
        if (this.seatA.get_sv_seatid() == seatid) { // 座位A起身离开
            this.seatA.on_standup();
        }
        else if(this.seatB.get_sv_seatid() == seatid) { // 座位b起身离开
            this.seatB.on_standup();
        }
    },

    on_send_prop_return: function(body) {
        if (body[0] != Respones.OK) {
            return;
        }

        // 发送道具成功
        console.log("from saet:", body[1], "to seat:", body[2], "prop type:", body[3]);
        // end 

        // 创建一个道具,
        var prop = cc.instantiate(this.prop_prefab);
        this.node.addChild(prop);
        var game_prop = prop.getComponent("game_prop");

        var src_pos;
        var dst_pos
        if (body[1] === this.seatA.get_sv_seatid()) { // 自己发给别人
            src_pos = this.seatA.node.getPosition();
            dst_pos = this.seatB.node.getPosition();
        }
        else { // 别人发给自己
            src_pos = this.seatB.node.getPosition();
            dst_pos = this.seatA.node.getPosition();
        }
        game_prop.play_prop_anim(src_pos, dst_pos, body[3]);
        // end 
    },

    on_player_do_ready_return: function(body) {
        if (body[0] != Respones.OK) {
            this.do_ready_button.active = true; // 显示出来再次准备
            return;
        }

        // 有玩家已经准备好
        if (this.seatA.get_sv_seatid() == body[1]) { // 自己
            this.seatA.on_do_ready();
        } 
        else { // 对家
            this.seatB.on_do_ready();
        }
        // end 
    },

    on_game_start: function(body) {
        // 开始前清理
        // end 

        this.seatA.on_game_start(body);
        this.seatB.on_game_start(body);
    },

    turn_to_player: function(body) {
        var action_time = body[0];
        var sv_seatid = body[1];

        if (sv_seatid == this.seatA.get_sv_seatid()) { // 自己
            this.seatA.turn_to_player(action_time);
            this.disk.set_your_turn(true);
        }
        else { // 对家
            this.seatB.turn_to_player(action_time);
            this.disk.set_your_turn(false);
        }
    },

    player_put_chess: function(body) {
        if(body[0] != Respones.OK) {
            return;
        }

        var block_x = body[1];
        var block_y = body[2];
        var chess_type = body[3];
        this.disk.put_chess_at(chess_type, block_x, block_y);  

        // 进度条应该隐藏掉
        this.seatA.hide_timebar();
        this.seatB.hide_timebar();
        // end 
    },

    on_checkout_game: function(body) {
        console.log("on_checkout_game called");
        
        var win_seatid = body[0] // -1, 平局
        var score = body[1];

        if (win_seatid === -1) {
            this.checkout.show_checkout_result(2, 0);
        }
        else if(win_seatid === this.seatA.get_sv_seatid()) { // 赢了
            this.checkout.show_checkout_result(1, score);
            ugame.game_info.uchip += score; 
        }
        else { // 输了
            this.checkout.show_checkout_result(0, score);
            ugame.game_info.uchip -= score;
        }
    },

    on_checkout_over: function() {
        // 隐藏掉结算界面
        this.checkout.hide_checkout_result();
        // end

        // 让每个座位清理一下
        this.seatA.on_checkout_over();
        this.seatB.on_checkout_over();
        // end  

        // 棋盘清理下
        this.disk.clear_disk();
        // end 

        // 准备的好了的按钮，要重新显示出来
        this.do_ready_button.active = true;
        // end 
    },

    do_reconnect: function(body) {
        var sv_seatid = body[0]; // 自己的座位信息
        console.log(body[1]);
        
        var seat_b_data = body[1][0];
        var round_start_info = body[2];
        var chess_data = body[3];
        var game_ctrl = body[4];

        this.do_ready_button.active = false;
        // 玩家自己坐下
        this.on_sitdown_return({
            0: Respones.OK,
            1: sv_seatid,
        });
        // end 

        // 对家抵达
        this.on_user_arrived_return(seat_b_data);
        // end 

        // 开局信息
        this.on_game_start(round_start_info);
        // end

        // 棋牌数据, x = j, y = i
        for(var i = 0; i < 15; i ++) { // 行
            for(var j = 0; j < 15; j ++) { // 列
                if(chess_data[i * 15 + j] !== 0) {
                    this.disk.put_chess_at(chess_data[i * 15 + j], j, i);
                }
            }
        }
        // end  

        // 游戏进度
        var cur_seatid = game_ctrl[0];
        var left_time = game_ctrl[1]; 
        if (cur_seatid === -1) {
            return;
        }

        if (cur_seatid == this.seatA.get_sv_seatid()) {
            this.seatA.turn_to_player(left_time);
            this.disk.set_your_turn(true);
        }
        else {
            this.seatB.turn_to_player(left_time);
            this.disk.set_your_turn(false);
        }
        // end 
    }, 

    on_get_prev_round: function(body) {
        if (body[0] != Respones.OK) {
            return;
        }

        // 先离开房间，再观看
        this.on_user_quit();
        // end 

        websocket.register_serivces_handler(null);
        // 

        ugame.prev_round_data = body[1];
        cc.director.loadScene("replay_scene");
        // end 
    },

    on_five_chess_server_return: function(stype, ctype, body) {
        console.log(stype, ctype, body);
    
        switch(ctype) {
            case Cmd.Game5Chess.ENTER_ZONE:
                this.enter_zone_return(body);
            break;
            
            case Cmd.Game5Chess.USER_QUIT:
                this.user_quit_return(body);
            break;
            
            case Cmd.Game5Chess.ENTER_ROOM:
                this.enter_room_return(body);
            break;
            
            case Cmd.Game5Chess.EXIT_ROOM:
            break;
            
            case Cmd.Game5Chess.SITDOWN:
                this.on_sitdown_return(body);
            break;
            
            case Cmd.Game5Chess.STANDUP:
                this.on_standup_return(body);
            break;

            case Cmd.Game5Chess.USER_ARRIVED:
                this.on_user_arrived_return(body);
            break;
            case Cmd.Game5Chess.SEND_PROP:
                this.on_send_prop_return(body);
            break;
            case Cmd.Game5Chess.SEND_DO_READY:
                this.on_player_do_ready_return(body);
            break;
            case Cmd.Game5Chess.ROUND_START:
                this.on_game_start(body);
            break;
            case Cmd.Game5Chess.TURN_TO_PLAYER:
                this.turn_to_player(body);
            break;
            case Cmd.Game5Chess.PUT_CHESS:
                this.player_put_chess(body);
            break;
            case Cmd.Game5Chess.CHECKOUT:
                this.on_checkout_game(body);
            break;
            case Cmd.Game5Chess.CHECKOUT_OVER:
                this.on_checkout_over();
            break;
            case Cmd.Game5Chess.RECONNECT:
                this.do_reconnect(body);
            break;
            case Cmd.Game5Chess.GET_PREV_ROUND:
                this.on_get_prev_round(body);
            break;
        }
    },

    start: function() {
        five_chess.enter_zone(ugame.zid);
    },

    on_user_quit: function() {
        five_chess.user_quit();
    },
    
    on_do_ready_click: function() {
        this.do_ready_button.active = false;
        five_chess.send_do_ready();
    },

    on_do_prev_round_click: function() {
        five_chess.send_get_prev_round();
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
