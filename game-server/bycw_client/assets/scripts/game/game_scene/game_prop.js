var prop_skin = cc.Class({
    name: "prop_skin",
    properties: {
        icon: {
            type: cc.SpriteFrame,
            default: null,
        }, 

        anim_frames: {
            type: cc.SpriteFrame,
            default: [],
        },
    }, 
});

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

        skin_set: {
            type: prop_skin,
            default: [],
        },
    },

    // use this for initialization
    onLoad: function () {
        this.frame_anim = this.node.getChildByName("anim").getComponent("frame_anim");
        this.anim_sprite = this.node.getChildByName("anim").getComponent(cc.Sprite);
    },

    play_prop_anim: function(from, to_dst, propid) {
        if (propid <= 0 || propid > 5) {
            return;
        }

        this.anim_sprite.spriteFrame = this.skin_set[propid - 1].icon;
        this.node.setPosition(from);

        var m = cc.moveTo(0.5, to_dst).easing(cc.easeCubicActionOut());
        
        var func = cc.callFunc(function() {
            this.frame_anim.sprite_frames = this.skin_set[propid - 1].anim_frames; 
            this.frame_anim.play_once(function() {
                this.node.removeFromParent();
            }.bind(this));
        }.bind(this));

        var seq = cc.sequence([m, func]);
        this.node.runAction(seq);
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
