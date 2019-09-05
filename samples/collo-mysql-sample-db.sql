-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        10.4.7-MariaDB - mariadb.org binary distribution
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  10.2.0.5599
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- dbtest1 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `dbtest1` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `dbtest1`;

-- 테이블 dbtest1.tb4read 구조 내보내기
CREATE TABLE IF NOT EXISTS `tb4read` (
  `sqn` int(11) NOT NULL AUTO_INCREMENT,
  `company` char(50) NOT NULL DEFAULT '0',
  `sales` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`sqn`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 dbtest1.tb4write 구조 내보내기
CREATE TABLE IF NOT EXISTS `tb4write` (
  `company` char(50) DEFAULT NULL,
  `sales` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 내보낼 데이터가 선택되어 있지 않습니다.


-- dbtest2 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `dbtest2` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `dbtest2`;

-- 테이블 dbtest2.tb4read 구조 내보내기
CREATE TABLE IF NOT EXISTS `tb4read` (
  `sqn` int(11) NOT NULL AUTO_INCREMENT,
  `company` char(50) NOT NULL DEFAULT '0',
  `sales` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`sqn`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- 내보낼 데이터가 선택되어 있지 않습니다.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
