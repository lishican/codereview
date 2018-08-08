var auth = require("auth");
var md5 = require("md5");
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

        phone_input: {
            type: cc.EditBox,
            default: null,
        },
        
        pwd_input: {
            type: cc.EditBox,
            default: null,
        },

        again_pwd_input: {
            type: cc.EditBox,
            default: null,
        },

        verify_code_input: {
            type: cc.EditBox,
            default: null,
        },
    },

    // use this for initialization
    onLoad: function () {
        this.node.active = false;
    },

    on_close_click: function() {
        this.node.active = false;
    },

    on_get_forget_pwd_verify_code_click: function() {
        if(!this.phone_input.string || this.phone_input.string.length != 11) {
            return;
        }

        auth.get_forget_pwd_verify_code(this.phone_input.string);
    },

    on_forget_pwd_commit_click: function() {
        if(!this.phone_input.string || this.phone_input.string.length != 11) {
            return;
        }

        if(!this.pwd_input.string || this.pwd_input.string.length <= 0) {
            return;
        }

        if(this.pwd_input.string != this.again_pwd_input.string) {
            return;
        }

        if(!this.verify_code_input.string || this.verify_code_input.string.length != 6) {
            return;
        }

        ugame.save_temp_uname_and_upwd(this.phone_input.string, this.pwd_input.string);
        var pwd = md5(this.pwd_input.string);
        auth.reset_user_pwd(this.phone_input.string, pwd, this.verify_code_input.string);
        
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
