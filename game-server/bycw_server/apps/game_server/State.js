var State = {
	InView: 1, // 玩家旁观
	Ready: 2, // 准备好了，可以开始, 
	Playing: 3, // 正在游戏
	CheckOut: 4, // 结算状态
};

module.exports = State;
