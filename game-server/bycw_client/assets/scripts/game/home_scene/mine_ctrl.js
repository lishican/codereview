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

        back: {
            default: null,
            type: cc.Node,
        },

        edit_prefab: {
            default: null,
            type: cc.Prefab,
        },

        guest_upgrade_prefab: {
            default: null,
            type: cc.Prefab,
        },

        guest_bind_button: {
            type: cc.Node,
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

    },

    start: function() {
        this.back.active = false;
        this.unick.string = ugame.unick;

        if (ugame.is_guest) {
            this.guest_bind_button.active = true;
        }
        else {
            this.guest_bind_button.active = false;
        }
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

        this.tital_label.string = "我";
    },

    sync_info: function() {
        this.unick.string = ugame.unick;
    },

    // 修改资料
    on_edit_profile_click: function() {
        this.hide_main_list("个人信息");
        this.secode_ui = cc.instantiate(this.edit_prefab);
        this.node.addChild(this.secode_ui);
    },

    // 游客账号升级，绑定绑定手机
    on_guest_upgrade_click: function() {
        this.hide_main_list("游客升级");
        this.secode_ui = cc.instantiate(this.guest_upgrade_prefab);
        this.node.addChild(this.secode_ui);
    },
    // end 
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
