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
        result: {
            type: cc.Label,
            default: null,
        },

        score: {
            type: cc.Label,
            default: null,
        },
    },

    // use this for initialization
    onLoad: function () {

    },

    start: function() {
        this.node.active = false;
    },

    // 1, 赢了，2表示平局, 0就是表示输了
    show_checkout_result: function(ret, score) {
        this.node.active = true;
        if (ret === 2) { // 平局
            this.result.string = "平局";
            this.score.string = "本次得分为(0)!!!";
            return;   
        }
        else if (ret === 1) { // 胜利
            this.result.string = "胜利";
            this.score.string = "本次赢得了" + score + "分!!!!!!";
            return;
        }
        else  {
            this.result.string = "失败";
            this.score.string = "本次输了" + score + "分!!!!!!";
            return;
        }
    },

    hide_checkout_result: function() {
        this.node.active = false;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

