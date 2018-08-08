var ugame = require("ugame");

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

        this.tital_label.string = "好友";
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
