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
        icon_normal: {
            default: null,
            type: cc.SpriteFrame,
        },

        icon_seleced: {
            default: null,
            type: cc.SpriteFrame,
        },


    },

    // use this for initialization
    onLoad: function () {
        this.icon = this.node.getChildByName("icon").getComponent(cc.Sprite);
        this.label = this.node.getChildByName("name");

        this.is_active = false;
    },

    set_actived(is_active) {
        this.is_active = is_active;
        if (this.is_active) {
            this.icon.spriteFrame = this.icon_seleced;
            this.label.color = new cc.Color(64, 155, 226, 255);
        }
        else {
            this.icon.spriteFrame = this.icon_normal;
            this.label.color = new cc.Color(118, 118, 118, 255);
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
