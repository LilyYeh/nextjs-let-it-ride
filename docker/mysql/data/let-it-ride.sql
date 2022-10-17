-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- 主機： mysql:3306
-- 產生時間： 2022 年 10 月 17 日 02:33
-- 伺服器版本： 8.0.30
-- PHP 版本： 8.0.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `let-it-ride`
--

-- --------------------------------------------------------

--
-- 資料表結構 `banker`
--

CREATE TABLE `banker` (
  `id` int NOT NULL,
  `money` int DEFAULT '0',
  `deletedTime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `cards`
--

CREATE TABLE `cards` (
  `cardId` int NOT NULL,
  `number` int NOT NULL,
  `type` varchar(1) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'a=黑桃, b=愛心, c=菱形, d=梅花',
  `isDeleted` tinyint NOT NULL DEFAULT '0' COMMENT '1=刪除',
  `socketId` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `cards`
--

INSERT INTO `cards` (`cardId`, `number`, `type`, `isDeleted`, `socketId`) VALUES
(1, 1, 'a', 1, NULL),
(2, 1, 'b', 1, NULL),
(3, 1, 'c', 1, NULL),
(4, 1, 'd', 1, NULL),
(5, 2, 'a', 1, NULL),
(6, 2, 'b', 1, NULL),
(7, 2, 'c', 1, NULL),
(8, 2, 'd', 1, NULL),
(9, 3, 'a', 1, NULL),
(10, 3, 'b', 1, NULL),
(11, 3, 'c', 1, NULL),
(12, 3, 'd', 1, NULL),
(13, 4, 'a', 1, NULL),
(14, 4, 'b', 1, NULL),
(15, 4, 'c', 1, NULL),
(16, 4, 'd', 1, NULL),
(17, 5, 'a', 1, NULL),
(18, 5, 'b', 1, NULL),
(19, 5, 'c', 1, NULL),
(20, 5, 'd', 1, NULL),
(21, 6, 'a', 1, NULL),
(22, 6, 'b', 1, NULL),
(23, 6, 'c', 1, NULL),
(24, 6, 'd', 1, NULL),
(25, 7, 'a', 1, NULL),
(26, 7, 'b', 1, NULL),
(27, 7, 'c', 1, NULL),
(28, 7, 'd', 1, NULL),
(29, 8, 'a', 1, NULL),
(30, 8, 'b', 1, NULL),
(31, 8, 'c', 1, NULL),
(32, 8, 'd', 1, NULL),
(33, 9, 'a', 1, NULL),
(34, 9, 'b', 1, NULL),
(35, 9, 'c', 1, NULL),
(36, 9, 'd', 1, NULL),
(37, 10, 'a', 1, NULL),
(38, 10, 'b', 1, NULL),
(39, 10, 'c', 1, NULL),
(40, 10, 'd', 1, NULL),
(41, 11, 'a', 1, NULL),
(42, 11, 'b', 1, NULL),
(43, 11, 'c', 1, NULL),
(44, 11, 'd', 1, NULL),
(45, 12, 'a', 1, NULL),
(46, 12, 'b', 1, NULL),
(47, 12, 'c', 1, NULL),
(48, 12, 'd', 1, NULL),
(49, 13, 'a', 1, NULL),
(50, 13, 'b', 1, NULL),
(51, 13, 'c', 1, NULL),
(52, 13, 'd', 1, NULL),
(53, 1, 'a', 1, NULL),
(54, 1, 'b', 1, NULL),
(55, 1, 'c', 1, NULL),
(56, 1, 'd', 0, NULL),
(57, 2, 'a', 1, NULL),
(58, 2, 'b', 1, NULL),
(59, 2, 'c', 1, NULL),
(60, 2, 'd', 1, NULL),
(61, 3, 'a', 1, NULL),
(62, 3, 'b', 1, NULL),
(63, 3, 'c', 1, NULL),
(64, 3, 'd', 1, NULL),
(65, 4, 'a', 1, NULL),
(66, 4, 'b', 1, NULL),
(67, 4, 'c', 1, NULL),
(68, 4, 'd', 1, NULL),
(69, 5, 'a', 1, NULL),
(70, 5, 'b', 1, NULL),
(71, 5, 'c', 1, NULL),
(72, 5, 'd', 1, NULL),
(73, 6, 'a', 1, NULL),
(74, 6, 'b', 1, NULL),
(75, 6, 'c', 1, NULL),
(76, 6, 'd', 1, NULL),
(77, 7, 'a', 1, NULL),
(78, 7, 'b', 1, NULL),
(79, 7, 'c', 1, NULL),
(80, 7, 'd', 1, NULL),
(81, 8, 'a', 1, NULL),
(82, 8, 'b', 1, NULL),
(83, 8, 'c', 1, NULL),
(84, 8, 'd', 1, NULL),
(85, 9, 'a', 1, NULL),
(86, 9, 'b', 1, NULL),
(87, 9, 'c', 1, NULL),
(88, 9, 'd', 1, NULL),
(89, 10, 'a', 1, NULL),
(90, 10, 'b', 1, NULL),
(91, 10, 'c', 1, NULL),
(92, 10, 'd', 1, NULL),
(93, 11, 'a', 1, NULL),
(94, 11, 'b', 1, NULL),
(95, 11, 'c', 1, NULL),
(96, 11, 'd', 1, NULL),
(97, 12, 'a', 1, NULL),
(98, 12, 'b', 1, NULL),
(99, 12, 'c', 1, NULL),
(100, 12, 'd', 1, NULL),
(101, 13, 'a', 1, NULL),
(102, 13, 'b', 1, NULL),
(103, 13, 'c', 1, NULL),
(104, 13, 'd', 1, NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `players`
--

CREATE TABLE `players` (
  `playerId` int NOT NULL,
  `socketId` varchar(100) NOT NULL,
  `name` varchar(20) NOT NULL,
  `isCurrentPlayer` tinyint NOT NULL DEFAULT '0',
  `money` mediumint NOT NULL DEFAULT '2000',
  `bankerId` int DEFAULT NULL,
  `deletedTime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `banker`
--
ALTER TABLE `banker`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `cards`
--
ALTER TABLE `cards`
  ADD PRIMARY KEY (`cardId`),
  ADD KEY `cardId` (`cardId`);

--
-- 資料表索引 `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`playerId`),
  ADD UNIQUE KEY `socketId` (`socketId`),
  ADD KEY `playerId` (`playerId`,`socketId`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `banker`
--
ALTER TABLE `banker`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `cards`
--
ALTER TABLE `cards`
  MODIFY `cardId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `players`
--
ALTER TABLE `players`
  MODIFY `playerId` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
