var http = require("http");
var util = require("util");
var log = require("../utils/log.js");

function send_phone_chat(phone_num,  content) {
	var cmd_url = "http://api.cnsms.cn/?ac=send&uid=117000&pwd=9A27BF288337541C87D3EE9FE3A18ACA&mobile=%s&content=%s&encode=utf8";
	content = encodeURI(content);

	var url = util.format(cmd_url, phone_num, content);
	log.info(url);

	http.get(url, function(incoming_msg) {
		log.info("respones status " + incoming_msg.statusCode);
		incoming_msg.on("data", function(data) {
			if (incoming_msg.statusCode === 200) {
				log.info(data.toString());
			}
			else {

			}
		});
	})
}

// code is string
function send_indentify_code(phone_num, code) {
	var content = "你通过手机号码注册<<鱼乐圈>>账号，验证码为%s,如果不是本人操作，可以不用理会。";
	content = util.format(content, code);
	send_phone_chat(phone_num, content);
}

module.exports = {
	send_indentify_code: send_indentify_code,
};

