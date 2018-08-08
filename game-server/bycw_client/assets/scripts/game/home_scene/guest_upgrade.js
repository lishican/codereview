var ugame = require("ugame");
var websocket = require("websocket");
var Stype = require("Stype");
var Cmd = require("Cmd");
var md5 = require("md5");
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

        input_phone_number: {
            default: null,
            type: cc.EditBox,
        },

        input_new_pwd: {
            default: null,
            type: cc.EditBox,
        },

        input_again_pwd:  {
            default: null,
            type: cc.EditBox,
        },

        input_identifying_code: {
            default: null,
            type: cc.EditBox,
        },

        error_desic_label: {
            default: null,
            type: cc.Label,
        },
    },

    // use this for initialization
    onLoad: function () {
        this.error_desic_label.node.active = false;
    },

    show_error_tip: function(desic) {
        this.error_desic_label.node.active = true;
        this.error_desic_label.string = desic;
        this.unscheduleAllCallbacks();

        this.scheduleOnce(function() {
            this.error_desic_label.node.active = false;
        }.bind(this), 3);
    },

    // 点击获取验证码
    on_get_identifying_click: function() {
        this.error_desic_label.node.active = false;

        var phone_num = this.input_phone_number.string;
        if (!phone_num || phone_num.length !== 11) {
             this.show_error_tip("无效的电话号码!");
            return;
        }

        // 发送命令给服务器，说我们要想这个手机来发送这个验证码
        auth.get_guess_upgrade_verify_code(phone_num, ugame.guest_key);
        // end 
    },
    // end 
    
    // 游客账号升级提交
    on_guest_upgrade_click: function() {
        this.error_desic_label.node.active = false;
        

        var phone_num = this.input_phone_number.string;
        if (!phone_num || phone_num.length !== 11) {
            this.show_error_tip("无效的电话号码!");
            return;
        }
        var pwd = this.input_new_pwd.string;
        if(pwd != this.input_again_pwd.string) {
            this.show_error_tip("两次输入密码不一致!");
            return;
        }

        var identifying_code = this.input_identifying_code.string;
        if(!identifying_code || identifying_code.length !== 6) {
            this.show_error_tip("验证码错误!");
            return;
        }
        
        ugame.save_temp_uname_and_upwd(phone_num, pwd);

        pwd = md5(pwd);
        var ukey = ugame.guest_key;
        
        // 发送命令到服务器
        auth.guest_bind_phone(phone_num, pwd, identifying_code);
        // end 
        
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
