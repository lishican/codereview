var proto_man = require("proto_man");
var websocket = require("websocket");
var http = require("http");

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
        is_proto_json: true,
    },

    // use this for initialization
    onLoad: function () {
        this.server_info = null;
    },

    get_server_info: function() {
        http.get("http://127.0.0.1:10001", "/server_info", null, function(err, ret) {
            if (err) {
                console.log(err);
                this.scheduleOnce(this.get_server_info.bind(this), 3);
                return;
            }

            var data = JSON.parse(ret);
            this.server_info = data;

            this.connect_to_server();
        }.bind(this));
    },

    connect_to_server() {
        if (this.is_proto_json) {
            console.log("ws://" + this.server_info.host + ":" + this.server_info.ws_port + "/ws");
            websocket.connect("ws://" + this.server_info.host + ":" + this.server_info.ws_port + "/ws", proto_man.PROTO_JSON);
        }
        else {
            console.log("ws://" + this.server_info.host + ":" + this.server_info.tcp_port + "/ws");
            websocket.connect("ws://" + this.server_info.host + ":" + this.server_info.tcp_port + "/ws", proto_man.PROTO_BUF);
        }
        // 
    },

    start: function() {
        this.get_server_info();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
