var check_box = require("check_box");
var ugame = require("ugame");
var websocket = require("websocket");
var Stype = require("Stype");
var Cmd = require("Cmd");
var auth = require("auth");

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
        unick_input: {
            type: cc.EditBox,
            default: null,
        }, 

        man_checkbox: {
            type: check_box,
            default: null,
        },

        woman_checkbox: {
            type: check_box,
            default: null,
        },
    },

    // use this for initialization
    onLoad: function () {
        
    },

    start: function() {
        this.unick_input.string = ugame.unick;
        this.set_check_sex(ugame.usex);
    },

    set_check_sex: function(type) {
        this.usex = type;
        if(type === 0) { // male
            this.man_checkbox.set_checked(true);
            this.woman_checkbox.set_checked(false);
        }
        else { // womale
            this.man_checkbox.set_checked(false);
            this.woman_checkbox.set_checked(true);
        }
    },

    on_check_click: function(e, type) {
        type = parseInt(type);
        this.set_check_sex(type);
    },

    on_subcommit_click: function() {
        if(this.unick_input.string === "") {
            console.log("unick is not emepty!!");
            return;
        }

       auth.edit_profile(this.unick_input.string, this.usex);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
