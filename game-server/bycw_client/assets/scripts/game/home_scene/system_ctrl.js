var ugame = require("ugame");
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
        unick: {
            default: null,
            type: cc.Label,
        },

        back: {
            default: null,
            type: cc.Node,
        },

        world_rank_prefab: {
            type: cc.Prefab,
            default: null,
        },

        main_list: {
            type: cc.Node,
            default: null,
        },

        tital_label: {
            type: cc.Label,
            default: null,
        },
    },

    // use this for initialization
    onLoad: function () {
        this.secode_ui = null;
    },

    start: function() {
        this.back.active = false;
        this.sync_info();
    },

    sync_info: function() {
        this.unick.string = ugame.unick;
    }, 

    hide_main_list: function(tital) {
        this.back.active = true;
        this.main_list.active = false;
        this.tital_label.string = tital;
    },

    show_main_list: function() {
        this.back.active = false;
        this.main_list.active = true;

        this.tital_label.string = "我";
    },

    goto_back: function() {
        if (this.secode_ui != null) {
            this.secode_ui.removeFromParent();
            this.secode_ui = null;
        }

        this.show_main_list();
    }, 
    // 拉取世界的排行榜
    on_get_world_rank_click: function() {
        if (this.secode_ui != null) {
            this.secode_ui.removeFromParent();
        }
        this.secode_ui = cc.instantiate(this.world_rank_prefab);
        this.node.addChild(this.secode_ui);

        this.hide_main_list("排行榜");
    },

    // 获取排行榜数据以后
    on_get_world_rank_data: function(my_rank, rank_data) {
        if (this.secode_ui != null) {
            var world_rank = this.secode_ui.getComponent("world_rank");
            if (world_rank) {
                world_rank.show_world_rank(my_rank, rank_data);
            }
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
