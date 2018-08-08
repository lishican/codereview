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


-- 导出 bycw_game_node 的数据库结构
CREATE DATABASE IF NOT EXISTS `bycw_game_node` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `bycw_game_node`;

-- 导出  表 bycw_game_node.login_bonues 结构
CREATE TABLE IF NOT EXISTS `login_bonues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL DEFAULT '0' COMMENT '用户uid',
  `bonues` int(11) NOT NULL DEFAULT '0' COMMENT '奖励的多少？',
  `status` int(11) NOT NULL DEFAULT '0' COMMENT '表示是否领取过了，0表示未领取,1就表示领取了',
  `bunues_time` int(11) NOT NULL DEFAULT '0' COMMENT '上一次发放登陆奖励的时间',
  `days` int(11) NOT NULL DEFAULT '0' COMMENT '连续登录的天数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='每日登录奖励';

-- 数据导出被取消选择。
-- 导出  表 bycw_game_node.ugame 结构
CREATE TABLE IF NOT EXISTS `ugame` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ugame表唯一ID',
  `uid` int(11) NOT NULL COMMENT '用户的ID号',
  `uexp` int(11) NOT NULL COMMENT '用户的经验值',
  `status` int(11) NOT NULL DEFAULT '0' COMMENT '0为正常，1为非发的数据记录',
  `uchip` int(11) NOT NULL COMMENT '主金币值',
  `udata` int(11) NOT NULL DEFAULT '0' COMMENT '游戏的一些统计数据等',
  `uvip` int(11) NOT NULL DEFAULT '0' COMMENT '游戏的uvip',
  `uvip_endtime` int(11) NOT NULL DEFAULT '0' COMMENT '游戏VIP结束的时间戳',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='存放我们的玩家的游戏数据';

-- 数据导出被取消选择。
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
