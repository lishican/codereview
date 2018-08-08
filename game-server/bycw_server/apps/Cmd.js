var Cmd = {
	// 全局的命令号，当我们的用户丢失链接的时候，
	// 所有的服务都会收到网关转发过来的这个时间这个消息
	USER_DISCONNECT: 10000, 
	BROADCAST: 10001, 
	
	Auth: {
		GUEST_LOGIN: 1, // 游客登陆
		RELOGIN: 2, // 账号在另外的地方登陆
		EDIT_PROFILE: 3, // 修改用户资料
		GUEST_UPGRADE_INDENTIFY: 4, // 游客升级验证码拉取
		BIND_PHONE_NUM: 5, // 游客绑定手机账号
		UNAME_LOGIN: 6, // 账号密码登录

		GET_PHONE_REG_VERIFY: 7, // 获取手机注册的验证码
		PHONE_REG_ACCOUNT: 8, // 手机注册我们的账号,

		GET_FORGET_PWD_VERIFY: 9, // 获取修改密码的手机验证码
		RESET_USER_PWD: 10, // 重置用户密码
	},
	
	// 系统服务支持的命令
	GameSystem: {
		GET_GAME_INFO: 1, // 获取游戏信息,
		LOGIN_BONUES_INFO: 2, // 获取登陆奖励信息
		RECV_LOGIN_BUNUES: 3, // 领取登陆奖励
		GET_WORLD_RANK_INFO: 4, // 获取世界全局的排行榜信息
	}, 
	
	// 五子棋游戏命令
	Game5Chess: {
		ENTER_ZONE: 1, // 进入游戏区间
		USER_QUIT: 2, // 玩家离开游戏服务器

		ENTER_ROOM: 3, // 玩家进入房间的桌子
		EXIT_ROOM: 4, // 玩家离开房间的桌子;

		SITDOWN: 5, // 玩家坐下
		STANDUP: 6, // 玩家站起,
		USER_ARRIVED: 7, // 玩家抵达,
		SEND_PROP: 8, // 发送道具
		SEND_DO_READY: 9, // 发送准备好了的请求 
		ROUND_START: 10, // 游戏开始了
		TURN_TO_PLAYER: 11, // 轮到哪个玩家
		PUT_CHESS: 12, // 下棋
		CHECKOUT: 13, // 游戏结算
		CHECKOUT_OVER: 14, // 游戏结算结束
		RECONNECT: 15, // 玩家断线重连
		GET_PREV_ROUND: 16, // 获取上局回顾
	}, 
};


module.exports = Cmd;