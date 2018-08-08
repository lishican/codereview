var BLOCK_WIDTH = 41;
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
        chess_prefab: {
            default: [],
            type: cc.Prefab,
        }
    },

    // use this for initialization
    onLoad: function () {
        this.your_turn = false;

        this.node.on(cc.Node.EventType.TOUCH_START, function(e) {
            if (!this.your_turn) {
                return;
            }


            var w_pos = e.getLocation();
            var pos = this.node.convertToNodeSpaceAR(w_pos);
            pos.x += BLOCK_WIDTH * 7;
            pos.y += BLOCK_WIDTH * 7;

            var block_x = Math.floor((pos.x + BLOCK_WIDTH * 0.5) / BLOCK_WIDTH);
            var block_y = Math.floor((pos.y + BLOCK_WIDTH * 0.5) / BLOCK_WIDTH);
            if (block_x < 0 || block_x > 14 || block_y < 0 || block_y > 14) {
                return;
            }
            
            // 发往服务器验证
            five_chess.send_put_chess(block_x, block_y);
            // end  
        }.bind(this), this);
    },

    set_your_turn: function(your_turn) {
        this.your_turn = your_turn;
    },

    // 1 black 2, white
    put_chess_at: function(chess_type, block_x, block_y) {
        var chess = cc.instantiate(this.chess_prefab[chess_type - 1]);
        this.node.addChild(chess);

        var xpos = block_x * BLOCK_WIDTH - BLOCK_WIDTH * 7;
        var ypos = block_y * BLOCK_WIDTH - BLOCK_WIDTH * 7;

        chess.setPosition(cc.p(xpos, ypos));
    },

    clear_disk: function() {
        this.node.removeAllChildren();
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
