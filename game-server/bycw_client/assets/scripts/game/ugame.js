var utils = require("utils");

var ugame = {
    unick: "",
    usex: -1,
    uface: 0,
    uvip: 0,

    is_guest: false, // 是否为游客账号
    guest_key: null,

    uname: null,
    upwd: null,

    game_info: null, // 玩家的游戏数据;

    zid: 0, // 玩家的区间信息

    guest_login_success: function (unick, usex, uface, uvip, ukey) {
        this.unick = unick;
        this.usex = usex;
        this.uface = uface;
        this.uvip = uvip;
        this.is_guest = true;
        
        if (this.guest_key != ukey) {
            this.guest_key = ukey;
            cc.sys.localStorage.setItem("guest_key", ukey);
        }
    }, 

    _save_uname_and_upwd: function() {
        // 保存一下我们本地的用户名 + 密码的密文;
        var body = {uname: this.uname, upwd: this.upwd};
        var body_json = JSON.stringify(body);
        // str 加密
        // end 
        cc.sys.localStorage.setItem("uname_upwd", body_json);
        // end 
    }, 

    uname_login_success: function(unick, usex, uface, uvip) {
        this.unick = unick;
        this.usex = usex;
        this.uface = uface;
        this.uvip = uvip;
        this.is_guest = false;

        this._save_uname_and_upwd();
    },

    edit_profile_success: function(unick, usex) {
        this.unick = unick;
        this.usex = usex;
    },

    save_temp_uname_and_upwd: function(uname, upwd) {
        this.uname = uname;
        this.upwd = upwd;
    },

    save_uname_and_upwd: function() {
        ugame.is_guest = false; 
        this._save_uname_and_upwd(); 
    },

    save_user_game_data: function(data) {
        ugame.game_info = {
            uchip: data[1],
            uexp: data[2],
            uvip: data[3],
        };
    }, 

    enter_zone: function(zid) {
        this.zid = zid;
    },
};
 
var uname_and_upwd_json = cc.sys.localStorage.getItem("uname_upwd");
if (!uname_and_upwd_json) {
    ugame.is_guest = true;
    ugame.guest_key = cc.sys.localStorage.getItem("guest_key");
     if (!ugame.guest_key) {
        ugame.guest_key = utils.random_string(32);
    }
}
else {
    var body = JSON.parse(uname_and_upwd_json);
    ugame.is_guest = false;
    ugame.uname = body.uname;
    ugame.upwd = body.upwd;
}

module.exports = ugame;
