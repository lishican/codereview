var game_system = require("game_system");

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
        chip_label: {
            type: cc.Label, 
            default: [],
        },

        zw_icon: {
            type: cc.Node,
            default: [],
        },
    },

    // use this for initialization
    onLoad: function () {
        this.bonues_info = ["100", "200", "300", "400", "500"];
        for(var i = 0; i < this.bonues_info.length; i ++) {
            this.chip_label[i].string = this.bonues_info[i];
            this.chip_label[i].node.color = cc.color(0, 0, 0, 255);

            this.zw_icon[i].active = false;
        }

        // this.node.active = false;
    },

    start: function() {
    },

    show_login_bonuses: function(id, bonues, days) {
        this.node.active = true;
        this.bonues_id = id; // 领取的时候要发往服务器
        var i;

        if (days >= this.bonues_info.length) {
            days = this.bonues_info.length;
        }
        for(i = 0; i < days; i ++) {
            this.chip_label[i].node.color = new cc.Color(255, 0, 0, 255);
            this.zw_icon[i].active = false;
        }

        for(; i < this.bonues_info.length; i ++) {
            this.chip_label[i].node.color = new cc.Color(0, 0, 0, 255);
            this.zw_icon[i].active = false;
        }

        this.zw_icon[days - 1].active = true;
    },

    on_close_click: function() {
        this.node.removeFromParent();
    },

    on_recv_cmd_click: function() {
        game_system.send_recv_login_bonues(this.bonues_id);
        this.node.removeFromParent();
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
