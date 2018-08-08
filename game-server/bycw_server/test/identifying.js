var http = require("http");
var util = require("util");

function send_phone_chat(phone_num,  content) {
	var cmd_url = "http://api.cnsms.cn/?ac=send&uid=117000&pwd=9A27BF288337541C87D3EE9FE3A18ACA&mobile=%s&content=%s&encode=utf8";
	content = encodeURI(content);

	var url = util.format(cmd_url, phone_num, content);
	console.log(url);

	http.get(url, function(incoming_msg) {
		console.log("respones status " + incoming_msg.statusCode);
		incoming_msg.on("data", function(data) {
			if (incoming_msg.statusCode === 200) {
				console.log(data.toString());
			}
			else {

			}
		});
	})
}

// 只有这个模板的短信收起来比较快和及时，所以我们后面都使用这个模板 + 验证码
send_phone_chat("18175133532", "你通过手机号码注册<<鱼乐圈>>账号，验证码为7778,如果不是本人操作，可以不用理会。");
