var ugame = require("ugame");
var auth = require("auth");

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
         phone_input: {
            type: cc.EditBox,
            default: null,
        },
        
        pwd_input: {
            type: cc.EditBox,
            default: null,
        },
    },

    // use this for initialization
    onLoad: function () {
        this.node.active = false;
    },

    start: function() {
        if(!ugame.is_guest) {
            this.phone_input.string = ugame.uname;
            this.pwd_input.string = ugame.upwd;
        }
    },

    on_close_click: function() {
        this.node.active = false;
    },

    on_uname_upwd_login_click: function() {
        if(!this.phone_input.string || this.phone_input.string.length != 11) {
            return;
        }

        if(!this.pwd_input.string || this.pwd_input.string.length <= 0) {
            return;
        }

        ugame.save_temp_uname_and_upwd(this.phone_input.string, this.pwd_input.string);
        auth.uname_login();
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
