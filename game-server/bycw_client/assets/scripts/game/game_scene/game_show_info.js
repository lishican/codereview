var ulevel = require("ulevel");
var five_chess = require("five_chess");
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
            type: cc.Label,
            default: null,
        },

        uchip: {
            type: cc.Label,
            default: null,
        },

        uvip: {
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

        props_root: {
            type: cc.Node,
            default: null,
        },
    },

    // use this for initialization
    onLoad: function () {

    },

    // 显示我们的用户信息

    // end  

    close_dlg: function() {
        this.node.removeFromParent();
    },

    on_close_click: function() {
        this.close_dlg();
    },

    show_user_info: function(player_info, is_self) {
        this.unick.string = player_info.unick;
        this.uchip.string = "" + player_info.uchip;
        this.usex.spriteFrame = this.usex_sp[player_info.usex];

        this.uvip.string = "VIP" + player_info.uvip;

        var ret = ulevel.get_level(player_info.uexp);

        this.ulevel.string = "LV" + ret[0];
        this.uexp_process.progress = ret[1];

        this.is_self = is_self;
        this.sv_seatid = player_info.sv_seatid;
        // 如果是点开自己，我们就要隐藏道具
        if (is_self) {
            this.props_root.active = false;
        }
        else {
            this.props_root.active = true;
        }
        // end 
    },

    on_prop_item_click: function(e, propid) {
        if (this.is_self) {
            return;
        }

        propid = parseInt(propid);
        // 发送道具了,
        console.log("道具:", propid);
        // end 
        var to_seatid = this.sv_seatid;
        // 调用协议命令，发送这个数据
        five_chess.send_prop(to_seatid, propid);
        this.close_dlg();
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
