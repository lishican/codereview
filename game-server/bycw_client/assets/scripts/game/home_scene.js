var websocket = require("websocket");
var auth = require("auth");
var Stype = require("Stype");
var Cmd = require("Cmd");
var Respones = require("Respones");
var ugame = require("ugame");
var mine_ctrl = require("mine_ctrl");
var home_ctrl = require("home_ctrl");
var system_ctrl = require("system_ctrl");
var friend_ctrl = require("friend_ctrl");
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
        tab_buttons: {
            default: [],
            type: cc.Button,
        },

        tab_content: {
            default: [],
            type: cc.Node,
        },

        mine: {
            default: null,
            type: mine_ctrl,
        },

        home: {
            default: null,
            type: home_ctrl,
        },

        system: {
            default: null,
            type: system_ctrl,
        },

        friend: {
            default: null,
            type: friend_ctrl
        },

        login_bonues_prefab: {
            default: null,
            type: cc.Prefab,
        },
    },

    // use this for initialization
    onLoad: function () {
        this.tab_button_com_set = [];
        for(var i = 0; i < this.tab_buttons.length; i ++) {
            var com = this.tab_buttons[i].getComponent("tab_button");
            this.tab_button_com_set.push(com);
        }

        var service_handlers = {};
        service_handlers[Stype.Auth] = this.on_auth_server_return.bind(this);
        service_handlers[Stype.GameSystem] = this.on_system_server_return.bind(this);

        websocket.register_serivces_handler(service_handlers);
    },

    on_edit_profile_server_return: function(body) {
        if(body.status != Respones.OK) {
            console.log("edit profile err:", body.status);
            return;
        }

        ugame.edit_profile_success(body.unick, body.usex);
        
        this.mine.goto_back();

        this.mine.sync_info();
        this.home.sync_info();
        this.system.sync_info();
        this.friend.sync_info();
    },

    on_get_upgrade_indentify_return: function(body) {
        var status = body;
        if (status != Respones.OK) {
            console.log("get upgrade_indentify errr: status = ", status);
            return;
        }
        console.log("get upgrade_indentify success: status = ", status);
    },

    on_guest_bind_phone_return: function(body) {
        var status = body;
        if (status != Respones.OK) {
            console.log("guest bind phone err:", status);
            return;
        }

        console.log("guest bind phone success!!!!!!");
        ugame.guest_bind_phone_success();
    },
    
    // 登陆验证入口函数
    on_auth_server_return: function(stype, ctype, body) {
        switch(ctype) {
            /*case Cmd.Auth.GUEST_LOGIN:
                this.guest_login_return(body);
            break;*/
            case Cmd.Auth.RELOGIN:
                console.log("Cmd.Auth.RELOGIN: 账号在其他地方登陆，请注意账号安全！！！");
            break;

            case Cmd.Auth.EDIT_PROFILE:
                this.on_edit_profile_server_return(body);
            break;

            case Cmd.Auth.GUEST_UPGRADE_INDENTIFY:
                this.on_get_upgrade_indentify_return(body);
            break;

            case Cmd.Auth.BIND_PHONE_NUM:
                this.on_guest_bind_phone_return(body);
            break;
        }

       
    },

    on_get_login_bonues_today_return: function(body) {
        console.log("on_get_login_bonues_today_return called", body);
        if(body[0] != Respones.OK) {
            console.log("status err:", body);
            return;
        }
        if (body[1] !== 1) {
            console.log("has no bunues", body);
            return;
        }

        var bonues_id = body[2];
        var bonues = body[3];
        var days = body[4];

        // 弹出登录奖励的界面
        var node = cc.instantiate(this.login_bonues_prefab);
        var login_bonues = node.getComponent("login_bonues");
        login_bonues.node.active = true;
        this.node.addChild(node);

        login_bonues.show_login_bonuses(bonues_id, bonues, days);
        // end 
    },

    on_recv_login_bonues_return: function(body) {
        console.log("on_recv_login_bonues_return called", body);
        if(body[0] != Respones.OK) {
            console.log("status err:", body);
            return;
        }
        
        // 领取登陆奖励成功
        console.log("你成功领取了:", body[1]);
        // end 

        ugame.game_info.uchip += body[1];
        this.home.sync_info();
    },
    
    on_get_world_rank_info_return: function(body) {
        if(body[0] != Respones.OK) {
            console.log("on_get_world_rank_info_return: status err:", body);
            return;
        }

        console.log("on_get_world_rank_info_return:", body);
        this.system.on_get_world_rank_data(body[3], body[2]);
    }, 

    on_system_server_return: function(stype, ctype, body) {
        switch(ctype) {
            case Cmd.GameSystem.LOGIN_BONUES_INFO:
                this.on_get_login_bonues_today_return(body);
            break;
            case Cmd.GameSystem.RECV_LOGIN_BUNUES:
                this.on_recv_login_bonues_return(body);
            break;

            case Cmd.GameSystem.GET_WORLD_RANK_INFO:
                this.on_get_world_rank_info_return(body);
            break;
        }
    },

    get_login_bonues_today: function() {
        game_system.get_login_bonues_today();
    },

    start: function() {
        this.on_tab_button_click(null, "0"); // 初始让它显示哪个tab

        // 获取今天的登陆奖励
        this.get_login_bonues_today();
        // end 
    },

    disable_tab: function(index) {
        this.tab_button_com_set[index].set_actived(false);
        this.tab_buttons[index].interactable = true;
        this.tab_content[index].active = false;
    },

    enable_tab: function(index) {
        this.tab_button_com_set[index].set_actived(true);
        this.tab_buttons[index].interactable = false;
        this.tab_content[index].active = true;
    },

    on_tab_button_click: function(e, index) {
        index = parseInt(index);
        for(var i = 0; i < this.tab_buttons.length; i ++) {
            if (i == index) {
                this.enable_tab(i);
            }
            else {
                this.disable_tab(i);
            }
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
