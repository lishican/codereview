var State = require("State");
var action_time = require("action_time");

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
        unick: {
            type: cc.Label,
            default: null,
        },

        timebar: {
            type: action_time,
            default: null,
        }, 

        show_uinfo_prefab: {
            type: cc.Prefab,
            default: null,
        }, 

        ready_icon: {
            type: cc.Node,
            default: null,
        },

        black_chess: {
            type: cc.Node,
            default: null,
        },

        white_chess: {
            type: cc.Node,
            default: null,
        },
    },

    // use this for initialization
    onLoad: function () {
        this.ready_icon.active = false;
        this.timebar.node.active = false;
        this.node.active = false;
        this.is_self = false;
        
        this.black_chess.active = false;
        this.white_chess.active = false;

        this.state = State.InView;
    },

    on_sitdown: function(player_info, is_self) {
        this.black_chess.active = false;
        this.white_chess.active = false;

        this.node.active = true;
        this.ready_icon.active = false;
        this.state = State.InView;
        this.player_info = player_info;
        this.unick.string = player_info.unick;
        this.is_self = is_self;

        if (player_info.state == State.Ready) {
            this.on_do_ready();
        }
    },

    on_standup: function() {
        this.state = State.InView;
        this.timebar.node.active = false;
        this.ready_icon.active = false;

        this.node.active = false;
        this.player_info = null;
    },

    get_sv_seatid: function() {
        return this.player_info.sv_seatid;
    },

    on_show_info_click: function() {
        var dlg = cc.instantiate(this.show_uinfo_prefab);
        this.node.parent.addChild(dlg);

        var game_info = dlg.getComponent("game_show_info");
        game_info.show_user_info(this.player_info, this.is_self);
    },

    on_do_ready: function() {
        this.ready_icon.active = true;
    },

    on_game_start: function(round_data) {
        this.black_seat = round_data[2];
        this.action_time = round_data[0];
        this.ready_icon.active = false;
        this.timebar.node.active = false;
        this.state = State.Playing;

        if (this.black_seat == this.player_info.sv_seatid) {
            this.black_chess.active = true;
            this.white_chess.active = false;
        }
        else {
            this.black_chess.active = false;
            this.white_chess.active = true;
        }
    },

    turn_to_player: function(action_time) {
        // 时间进度条走起来
        this.timebar.node.active = true;
        this.timebar.start_action_time(action_time);
        // end 

        // ...
    },

    hide_timebar: function() {
        this.timebar.node.active = false;
    },

    on_checkout_over: function() {
        this.timebar.node.active = false;
        this.black_chess.active = false;
        this.white_chess.active = false;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
