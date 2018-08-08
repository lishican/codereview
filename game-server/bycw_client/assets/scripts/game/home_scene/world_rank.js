var game_system = require("game_system");

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

        not_inrank: {
            type: cc.Node,
            default: null,
        },

        my_rank_label: {
            type: cc.Label,
            default: null,
        },

        rank_item_prefab: {
            type: cc.Prefab,
            default: null,
        },

        content: {
            default: null,
            type: cc.Node,
        },
    },

    // use this for initialization
    onLoad: function () {

    },

    start: function() {
        game_system.get_world_rank_info();
    },

    show_world_rank: function(my_rank, rank_data) {
        for(var i = 0; i < rank_data.length; i ++) {
            var data = rank_data[i];
            var item = cc.instantiate(this.rank_item_prefab);
            this.content.addChild(item);

            var rank_item = item.getComponent("rank_item");
            rank_item.show_rank_info(i + 1, data[0], data[1], data[2], data[3]);
        }

        // 自己的排行
        if (my_rank <= 0) {
            this.not_inrank.active = true;
            this.my_rank_label.node.active = false; 
        }
        else {
            this.not_inrank.active = false;
            this.my_rank_label.node.active = true; 
            this.my_rank_label.string = "" + my_rank;
        }
        // end 
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
