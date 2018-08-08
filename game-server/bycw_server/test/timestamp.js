
// 返回当前的时间戳，单位是秒
function timestamp() {
	var date = new Date();
	var time = Date.parse(date); // 1970到现在过去的毫秒数
	time = time / 1000;
	return time;
}

// 时间戳是秒，Date是毫秒
function timestamp2date(time) {
	var date = new Date();
	date.setTime(time * 1000); // 

	return [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
}

// "2017-06-28 18:00:00"
function date2timestamp(strtime)  {
	var date = new Date(strtime.replace(/-/g, '/'));
	var time = Date.parse(date);
	return (time / 1000);
}

// 今天00:00:00的时间戳
function timestamp_today() {
	var date = new Date();
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);

	var time = Date.parse(date); // 1970到现在过去的毫秒数
	time = time / 1000;
	return time;
}

function timestamp_yesterday() {
	var time = timestamp_today();
	return (time - 24 * 60 * 60)
}

console.log(timestamp());
console.log(timestamp2date(timestamp()));

console.log(date2timestamp("2017-06-28 00:00:00"));
console.log(timestamp_today());

console.log(date2timestamp("2017-06-27 00:00:00"));
console.log(timestamp_yesterday());

