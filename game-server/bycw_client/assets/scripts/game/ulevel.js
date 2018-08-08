// 上一级到本级所需要的经验;
var level_exp = [0, 1500, 2000, 2000, 3000, 3000, 4000, 4000, 5000, 5000, 8000, 8000, 8000, 9000, 9000, 9000];

// 等级, 百分比
function get_level(exp) {
    var ret = [0, 0];

    var last_exp = exp;
    var level = 0;

    for(var i = 1; i < level_exp.length; i ++) {
        if (last_exp < level_exp[i]) {
            ret[0] = level;
            ret[1] = last_exp / level_exp[i];
            return ret;
        }
        last_exp -= level_exp[i];
        level = i;
    }

    // 已经是最高等级了
    ret[0] = level;
    ret[1] = 1;
    return ret;
    // end 
}

module.exports = {
    get_level: get_level,
};