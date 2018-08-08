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
        rank_label: {
            type: cc.Label,
            default: null,
        },

        unick_label: {
            type: cc.Label,
            default: null,
        },

        uchip_label: {
            type: cc.Label,
            default: null,
        },
    },

    // use this for initialization
    onLoad: function () {

    },

    show_rank_info: function(rank, unick, usex, uface, uchip) {
        this.rank_label.string = "" + rank;
        this.unick_label.string = unick;
        this.uchip_label.string = "" + uchip;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
