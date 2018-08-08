-- --------------------------------------------------------
-- 主机:                           127.0.0.1
-- 服务器版本:                        5.7.15-log - MySQL Community Server (GPL)
-- 服务器操作系统:                      Win64
-- HeidiSQL 版本:                  9.4.0.5138
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- 导出 bycw_center 的数据库结构
CREATE DATABASE IF NOT EXISTS `bycw_center` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `bycw_center`;

-- 导出  表 bycw_center.phone_chat 结构
CREATE TABLE IF NOT EXISTS `phone_chat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phone` varchar(16) NOT NULL DEFAULT '""',
  `code` varchar(8) NOT NULL DEFAULT '""' COMMENT '用户验证码',
  `opt_type` int(11) NOT NULL DEFAULT '0' COMMENT '操作类型0, 游客升级 1 修改密码 2 手机注册拉取验证码',
  `end_time` int(11) NOT NULL DEFAULT '0' COMMENT '验证码结束的时间戳',
  `count` int(11) NOT NULL DEFAULT '0' COMMENT '拉取验证码的次数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8 COMMENT='手机短信验证码';

-- 数据导出被取消选择。
-- 导出  表 bycw_center.uinfo 结构
CREATE TABLE IF NOT EXISTS `uinfo` (
  `uid` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户唯一的id号',
  `unick` varchar(32) NOT NULL DEFAULT '""' COMMENT '用户的昵称',
  `uname` varchar(32) NOT NULL DEFAULT '""' COMMENT '用户名,全局唯一的 ',
  `upwd` varchar(32) NOT NULL DEFAULT '""' COMMENT '用户密码,32位md5值',
  `usex` int(11) NOT NULL DEFAULT '0' COMMENT '用户的性别0，男，1女',
  `uface` int(11) NOT NULL DEFAULT '0' COMMENT '用户图像',
  `uphone` varchar(32) NOT NULL DEFAULT '""' COMMENT '用户联系方式',
  `uemail` varchar(32) NOT NULL DEFAULT '""' COMMENT '绑定用户的邮箱',
  `ucity` varchar(32) NOT NULL DEFAULT '""' COMMENT '用户所在的城市',
  `uvip` int(11) NOT NULL DEFAULT '0' COMMENT '用户VIP的等级',
  `vip_endtime` int(11) NOT NULL DEFAULT '0' COMMENT 'vip结束的时间搓',
  `guest_key` varchar(32) NOT NULL DEFAULT '""' COMMENT '游客注册的时候使用的key',
  `is_guest` int(11) NOT NULL DEFAULT '0' COMMENT '是否为游客账号',
  `status` int(11) NOT NULL DEFAULT '0' COMMENT '0为有效,1为封号',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8 COMMENT='存储用户信息的表';

-- 数据导出被取消选择。
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
