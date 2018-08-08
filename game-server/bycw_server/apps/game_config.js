var Stype = require("./Stype.js");

var game_config = {
	gateway_config: {
		host: "127.0.0.1",
		ports: [6080, 6081],
	},

	webserver: {
		host: "127.0.0.1",
		port: 10001,
	},

	game_system_server: {
		host: "127.0.0.1",
		port: 6087,
		stypes: [Stype.GameSystem],
	},

	game_server: {
		host: "127.0.0.1",
		port: 6088,
		stypes: [Stype.Game5Chess],
	},

	game_database: {
		host: "127.0.0.1",
		port: 3306,
		db_name: "bycw_game_node",

		uname: "root",
		upwd: "123456",
	},

	center_server: {
		host: "127.0.0.1",
		port: 6086,
		stypes: [Stype.Auth],
	},

	center_database: {
		host: "127.0.0.1",
		port: 3306,
		db_name: "bycw_center",

		uname: "root",
		upwd: "123456",
	},

	center_redis: {
		host: "127.0.0.1",
		port: 6379,
		db_index: 0,
	},

	game_redis: {
		host: "127.0.0.1",
		port: 6379,
		db_index: 1,
	},

	// 代码来生成
	gw_connect_servers: {
		/*0: {
			stype: Stype.TalkRoom,
			host: "127.0.0.1",
			port: 6084, 
		},*/

		1: {
			stype: Stype.Auth,
			host: "127.0.0.1",
			port: 6086,
		},

		2: {
			stype: Stype.GameSystem,
			host: "127.0.0.1",
			port: 6087,
		},

		3: {
			stype: Stype.Game5Chess,
			host: "127.0.0.1",
			port: 6088,
		},
	},

	// 游戏注册时候的一些数据;
	game_data: {
		first_uexp: 1000,
		first_uchip: 1000,

		login_bonues_config: {
			clear_login_straight: false, // 是否清除连续登录	
			bonues: [100, 200, 300, 400, 500], // 后面都是最多奖励500，
		},

		// 离线生成: 
		// (1)写入数据库, (2) 离线生成json文件 (3)代码加载配置文件来得到配置
		five_chess_zones: {
			0: {zid: 1, name: "新手场", vip_level: 0, min_chip: 100, one_round_chip: 3, think_time: 15},
			1: {zid: 2, name: "高手场", vip_level: 0, min_chip: 5000, one_round_chip: 10, think_time: 10},
			2: {zid: 3, name: "大师场", vip_level: 0, min_chip: 10000, one_round_chip: 16, think_time: 10},			 
		}
	},
};

module.exports = game_config;