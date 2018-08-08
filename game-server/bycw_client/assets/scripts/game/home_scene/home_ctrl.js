var ugame = require("ugame");
var ulevel = require("ulevel");

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

        uchip: {
            type: cc.Label,
            default: null,
        },

        ulevel: {
            type: cc.Label,
            default: null,
        },

        uexp_process: {
            type: cc.ProgressBar,
            default: null,
        }, 
        usex: {
            type: cc.Sprite,
            default: null,
        },

        usex_sp: {
            type: cc.SpriteFrame,
            default: [],
        },

        uvip: {
            type: cc.Label,
            default: null,
        },

        main_list: {
            type: cc.Node,
            default: null,
        },

        back: {
            type: cc.Node,
            default: null,
        },
    },

    // use this for initialization
    onLoad: function () {
        this.secode_ui = null;
        this.back.active = false;
    },

    start: function() {
        this.sync_info();
    },

    sync_info: function() {
        this.unick.string = ugame.unick;
        var game_info = ugame.game_info;
        this.uchip.string = "" + game_info.uchip;
        this.usex.spriteFrame = this.usex_sp[ugame.usex];

        this.uvip.string = "VIP" + game_info.uvip;

        var ret = ulevel.get_level(game_info.uexp);
        console.log(game_info.uexp, ret);

        this.ulevel.string = "LV" + ret[0];
        this.uexp_process.progress = ret[1];
    }, 

    goto_back: function() {
        if(this.secode_ui != null) {
            this.secode_ui.removeFromParent();
            this.secode_ui = null;
        }
        this.show_main_list();
    },

    hide_main_list: function(tital) {
        this.back.active = true;
        this.main_list.active = false;
        this.tital_label.string = tital;
    },

    show_main_list: function() {
        this.back.active = false;
        this.main_list.active = true;

        this.tital_label.string = "BYCW";
    },

    on_enter_zone_click: function(e, zid) {
        zid = parseInt(zid);
        if (zid <= 0 || zid > 3) {
            return;
        }

        ugame.enter_zone(zid);
        cc.director.loadScene("game_scene");
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
