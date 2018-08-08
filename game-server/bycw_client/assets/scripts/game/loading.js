var websocket = require("websocket");
var auth = require("auth");
var Stype = require("Stype");
var Cmd = require("Cmd");
var Respones = require("Respones");
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
    },

    // use this for initialization
    onLoad: function () {
        this.account_reg = this.node.getChildByName("account_reg");
        this.account_forget_pwd = this.node.getChildByName("account_forget_pwd");
        this.account_uname_login = this.node.getChildByName("account_uname_login");
        
        var service_handlers = {};
        service_handlers[Stype.Auth] = this.on_auth_server_return.bind(this);
        service_handlers[Stype.GameSystem] = this.on_game_system_server_return.bind(this);
        websocket.register_serivces_handler(service_handlers);
    },

    guest_login_return: function(body) {
        if (body.status != Respones.OK) {
            console.log(body);
            return;
        }
        
        ugame.guest_login_success(body.unick, body.usex, body.uface, body.uvip, body.ukey);
        // 
        this.on_auth_login_success();
    },

    uname_login_return: function(body) {
        if (body.status != Respones.OK) {
            console.log(body);
            return;
        }
        
        ugame.uname_login_success(body.unick, body.usex, body.uface, body.uvip);
        // 保存本次登陆的用户和密码到本地
        ugame.save_uname_and_upwd();
        // end 
        // cc.director.loadScene("home_scene");
        this.on_auth_login_success();
    },

    // 登陆成功后，登陆到我们的游戏服务器上面
    on_auth_login_success: function() {
        game_system.get_game_info();
    },

    on_get_phone_reg_verify_return: function(status) {
        if(status != Respones.OK) {
            console.log("get verify code err! status: ", status);
            return;
        }

        console.log("get verify code success! status: ", status);
    },

    on_get_forget_pwd_verify_return: function(status) {
        if(status != Respones.OK) {
            console.log("get verify code err! status: ", status);
            return;
        }

        console.log("get verify code success! status: ", status);
    },

    on_reg_phone_account_return: function(status) {
        if(status != Respones.OK) {
            console.log("phone reg account err status: ", status);
            return;
        }

        ugame.save_uname_and_upwd();

        // 登陆上去
        auth.uname_login();
        // end 
    },

    on_reset_pwd_return: function(status) {
        if(status != Respones.OK) {
            console.log("on_reset_pwd_return err status: ", status);
            return;
        }

        ugame.save_uname_and_upwd();

        // 登陆上去
        auth.uname_login();
        // end 
    },

    on_get_game_info_return: function(body) {
        var status = body[0]
        if (status !=Respones.OK) {
            console.log("on_reset_pwd_return err status: ", status);
            return;
        }

        // 保存数据
        // {uchip, uexp, uvip}
        ugame.save_user_game_data(body);
        // end

        console.log(ugame.game_info);

        cc.director.loadScene("home_scene");
    },

    // 系统服务器返回接口
    on_game_system_server_return: function(stype, ctype, body) {
        switch(ctype) {
            case Cmd.GameSystem.GET_GAME_INFO:
                this.on_get_game_info_return(body);
            break;
        }
    },

    // 登陆验证入口函数
    on_auth_server_return: function(stype, ctype, body) {
        switch(ctype) {
            case Cmd.Auth.GUEST_LOGIN:
                this.guest_login_return(body);
            break;
            case Cmd.Auth.RELOGIN:
                console.log("Cmd.Auth.RELOGIN: 账号在其他地方登陆，请注意账号安全！！！");
            break;
            case Cmd.Auth.UNAME_LOGIN:
                this.uname_login_return(body);
            break;

            case Cmd.Auth.GET_PHONE_REG_VERIFY:
                this.on_get_phone_reg_verify_return(body);
            break;

            case Cmd.Auth.PHONE_REG_ACCOUNT:
                this.on_reg_phone_account_return(body);
            break;

            case Cmd.Auth.GET_FORGET_PWD_VERIFY:
                this.on_get_forget_pwd_verify_return(body);
            break;

            case Cmd.Auth.RESET_USER_PWD:
                this.on_reset_pwd_return(body);
            break;
        }

       
    },

    start: function() {
        
    }, 

    on_quick_login_click: function() {
        if (ugame.is_guest) {
            auth.guest_login();
        }
        else {
            auth.uname_login();
        }
    },

    on_wechat_login_click: function() {

    },
    
    on_register_account_click: function() {
        this.account_reg.active = true;
    },

    on_forget_pwd_click: function() {
        this.account_forget_pwd.active = true;
    }, 

    on_uname_login_click: function() {
        this.account_uname_login.active = true;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
