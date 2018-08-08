var websocket = require("websocket");
var utils = require("utils");

var STYPE_TALKROOM = 1;
var TalkCmd = {
	Enter: 1, // 用户进来
	Exit: 2, // 用户离开ia
	UserArrived: 3, // 别人进来;
	UserExit: 4, // 别人离开

	SendMsg: 5, // 自己发送消息,
	UserMsg: 6, // 收到别人的消息
};

var Respones = {
	OK: 1,
	IS_IN_TALKROOM: -100, // 玩家已经在聊天室
	NOT_IN_TALKROOM: -101, // 玩家不在聊天室
	INVALD_OPT: -102, // 玩家非法操作
	INVALID_PARAMS: -103, // 命令格式不对
};

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

        input: {
            default: null,
            type: cc.EditBox,
        },

        scroll_content: {
            default: null,
            type: cc.ScrollView,
        },

        desic_prefab: {
            default: null,
            type: cc.Prefab,
        },

        selftalk_prefab: {
            default: null,
            type: cc.Prefab,
        },

        othertalk_prefab: {
            default: null,
            type: cc.Prefab,
        },
    },

    // use this for initialization
    onLoad: function () {
        websocket.register_serivces_handler({
            1: this.on_talk_room_service_return.bind(this),
        });

        // 游客xxxx
        this.random_uname = "游客" + utils.random_int_str(4);
        this.random_sex = utils.random_int(1, 2); // 1 man, 2 woman
    },

    show_tip_msg: function(str) {
        var node = cc.instantiate(this.desic_prefab);
        var label = node.getChildByName("desic").getComponent(cc.Label);
        label.string = str;

        this.scroll_content.content.addChild(node);

        this.scroll_content.scrollToBottom(0.1);
    },

    show_self_talk: function(uname, msg) {
        var node = cc.instantiate(this.selftalk_prefab);
        var label = node.getChildByName("uname").getComponent(cc.Label);
        label.string = uname;

        label = node.getChildByName("msg").getComponent(cc.Label);
        label.string = msg;

        this.scroll_content.content.addChild(node);
        this.scroll_content.scrollToBottom(0.1);
    },

    show_other_talk: function(uname, msg) {
        var node = cc.instantiate(this.othertalk_prefab);
        var label = node.getChildByName("uname").getComponent(cc.Label);
        label.string = uname;

        label = node.getChildByName("msg").getComponent(cc.Label);
        label.string = msg;

        this.scroll_content.content.addChild(node);
        this.scroll_content.scrollToBottom(0.1);
    },

    on_talk_room_service_return: function(stype, cmd, body) {
        switch(cmd) {
            case TalkCmd.Enter:
            {
                if (body == Respones.OK) {
                    this.show_tip_msg("你已经成功进入聊天室");
                }
            }
            break;
            case TalkCmd.Exit:
            {
                if (body == Respones.OK) {
                    this.show_tip_msg("你已经离开聊天室");
                }
            }
            break;
            case TalkCmd.UserArrived:
            {
                this.show_tip_msg(body.uname + "进入聊天室");
            }
            break;
            case TalkCmd.UserExit:
            {
                this.show_tip_msg(body.uname + "离开聊天室");
            }
            break;
            case TalkCmd.SendMsg:
            {
                if(body[0] == Respones.OK) {
                    this.show_self_talk(body[1], body[3]);
                }
             }
            break;
            case TalkCmd.UserMsg:
            {
                this.show_other_talk(body[0], body[2]);
            }
            break;
        }
    },

    start: function() {
    },


    connect_to_talkroom: function() {
        console.log("connect_to_talkroom");
        websocket.send_cmd(STYPE_TALKROOM, TalkCmd.Enter, {
            uname: this.random_uname,
            usex: this.random_sex,
        });
    },

    disconnect_from_talkroom: function() {
        console.log("disconnect_from_talkroom");
        websocket.send_cmd(STYPE_TALKROOM, TalkCmd.Exit, null);
    },

    send_msg_to_talkroom: function() {
        var str = this.input.string;
        if (!str || str.length <= 0) {
            return;
        }

        console.log(str);
        websocket.send_cmd(STYPE_TALKROOM, TalkCmd.SendMsg, str);
        this.input.string = "";
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
