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
        total_time: 10,
    },

    // use this for initialization
    onLoad: function () {
        this.is_running = false;
        this.sprite = this.getComponent(cc.Sprite);
    },

    start_action_time: function(time) {
        this.total_time = time;
        this.is_running = true;
        this.now_time = 0;
        this.node.active = true;
    }, 
    
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.is_running === false) {
            return;
        }

        this.now_time += dt;
        var per = this.now_time / this.total_time;
        if (per > 1) {
            per = 1;
        }

        this.sprite.fillRange = per;

        if (this.now_time >= this.total_time) {
            this.is_running = false;
            this.node.active = false;
        }
    },
});
