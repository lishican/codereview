var redis = require("redis");

// 创建一个client连接到了我们的redis server
var client = redis.createClient({
	host: "127.0.0.1",
	port: 6379,
	db: 0,
});

// 表
// key--->value
// set, get
client.set("my_redis_class_key", "123456");
// err, data
client.get("my_redis_class_key", function  (err, data) {
	if (err) {
		return;
	}

	console.log(data);
});
// end 

// 哈希表, 用户表
client.hmset("00015_redis_class_user", {
	uname: "blake",
	upwd: "123456",
	uemail: "1332222@qq.com",	
}, function(err) {

});


client.hgetall("00015_redis_class_user", function(err, data) {
	if (err) {
		return;
	}

	console.log(data);
});


client.hget("00015_redis_class_user", "uname", function(err, data) {
	if (err) {
		return;
	}
	console.log(data);
});

// end 


// 列表,数组
client.lpush("0000_1111_7777_data", "xiaohong");
client.rpush("0000_1111_7777_data", "xiaotian");
client.lpush("0000_1111_7777_data", "huangdong");
client.lpush("0000_1111_7777_data", "blake");

client.lrange("0000_1111_7777_data", 0, 10, function(err, data) {
	if (err) {
		return;
	}

	console.log(data);
});

client.lpop("0000_1111_7777_data", function(err, data) {
	if (err) {
		return;
	}
	console.log(data);
});
// end 

// 排行耪的有序集合
client.zadd("0000_1111_rank", 500, "blake");
client.zadd("0000_1111_rank", 400, "huangdong");
client.zadd("0000_1111_rank", 300, "xiaotian");
client.zadd("0000_1111_rank", 100, "xiaoming");

// client.zrange("0000_1111_rank", 0, 10, function(err, data) {
client.zrevrange("0000_1111_rank", 0, 10, "withscores", function(err, data) {
	if (err) {
		return;
	}
	console.log(data);
});
// end 


// 事件
// 监听我们的error事件, 当有错误的时候，不会终止我们的node.js程序
// 如果链接服务器不上，我们会触发自动重连
client.on("error", function(err) {
	console.log(err);
});

client.on("end", function() {
	
});
// end 