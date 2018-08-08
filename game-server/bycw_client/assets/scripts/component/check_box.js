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
        normal: {
            default: null,
            type: cc.SpriteFrame,
        },

        select: {
            default: null,
            type: cc.SpriteFrame,
        },

        b_checked: false,
    },

    // use this for initialization
    onLoad: function () {
        this.sp = this.node.getComponent(cc.Sprite);
        this.set_checked(this.b_checked);
    },

    set_checked: function(b_checked) {
        this.b_checked = b_checked;
        if(this.b_checked) {
            this.sp.spriteFrame = this.select;
        }
        else {
            this.sp.spriteFrame = this.normal;
        }
    },

    is_checked: function() {
        return this.b_checked;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
