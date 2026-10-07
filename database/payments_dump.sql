-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: payments
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_logs`
--

DROP TABLE IF EXISTS `admin_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `admin_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `admin_logs_admin_id_f4e1f6a6_fk_users_id` (`admin_id`),
  CONSTRAINT `admin_logs_admin_id_f4e1f6a6_fk_users_id` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_logs`
--

LOCK TABLES `admin_logs` WRITE;
/*!40000 ALTER TABLE `admin_logs` DISABLE KEYS */;
INSERT INTO `admin_logs` VALUES (1,'ADMIN_LOGIN','Admin signed in','2026-09-29 05:07:23.100989',1),(2,'EXPORT_CSV','Exported 7 transactions','2026-09-29 05:07:23.239215',1),(3,'ADMIN_LOGIN','Admin signed in','2026-10-01 05:45:43.599328',1),(4,'ADMIN_LOGIN','Admin signed in','2026-10-05 04:58:47.064755',1),(5,'ADMIN_LOGIN','Admin signed in','2026-10-05 05:07:01.032966',1),(6,'ADMIN_LOGIN','Admin signed in','2026-10-05 05:18:30.736130',1),(7,'EXPORT_CSV','Exported 21 transactions','2026-10-05 05:19:45.578710',1),(8,'ADMIN_LOGIN','Admin signed in','2026-10-05 05:22:10.910421',1);
/*!40000 ALTER TABLE `admin_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add Blacklisted Token',6,'add_blacklistedtoken'),(22,'Can change Blacklisted Token',6,'change_blacklistedtoken'),(23,'Can delete Blacklisted Token',6,'delete_blacklistedtoken'),(24,'Can view Blacklisted Token',6,'view_blacklistedtoken'),(25,'Can add Outstanding Token',7,'add_outstandingtoken'),(26,'Can change Outstanding Token',7,'change_outstandingtoken'),(27,'Can delete Outstanding Token',7,'delete_outstandingtoken'),(28,'Can view Outstanding Token',7,'view_outstandingtoken'),(29,'Can add user',8,'add_user'),(30,'Can change user',8,'change_user'),(31,'Can delete user',8,'delete_user'),(32,'Can view user',8,'view_user'),(33,'Can add card',9,'add_card'),(34,'Can change card',9,'change_card'),(35,'Can delete card',9,'delete_card'),(36,'Can view card',9,'view_card'),(37,'Can add transaction',10,'add_transaction'),(38,'Can change transaction',10,'change_transaction'),(39,'Can delete transaction',10,'delete_transaction'),(40,'Can view transaction',10,'view_transaction'),(41,'Can add admin log',11,'add_adminlog'),(42,'Can change admin log',11,'change_adminlog'),(43,'Can delete admin log',11,'delete_adminlog'),(44,'Can view admin log',11,'view_adminlog');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cards`
--

DROP TABLE IF EXISTS `cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cards` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cardholder_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `masked_number` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last4` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiry_month` smallint unsigned NOT NULL,
  `expiry_year` smallint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `credit_limit` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cards_user_id_8fb8d426_fk_users_id` (`user_id`),
  CONSTRAINT `cards_user_id_8fb8d426_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `cards_chk_1` CHECK ((`expiry_month` >= 0)),
  CONSTRAINT `cards_chk_2` CHECK ((`expiry_year` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cards`
--

LOCK TABLES `cards` WRITE;
/*!40000 ALTER TABLE `cards` DISABLE KEYS */;
INSERT INTO `cards` VALUES (1,'Demo User','Visa','**** **** **** 1111','1111',12,2029,'2026-09-29 05:07:22.495525',2,10000.00),(2,'Demo User','Mastercard','**** **** **** 4444','4444',12,2029,'2026-09-29 05:07:22.565631',2,10000.00),(3,'Demo User','Amex','**** **** **** 0005','0005',12,2029,'2026-09-29 05:07:22.636501',2,10000.00),(4,'baskar','Mastercard','**** **** **** 4444','4444',1,2028,'2026-09-29 08:54:50.172433',1,10000.00),(5,'dineshkumar s','Mastercard','**** **** **** 4444','4444',1,2028,'2026-09-30 07:02:54.926694',4,10000.00),(6,'dinesh kumar s','Visa','**** **** **** 1111','1111',1,2028,'2026-09-30 07:05:17.010635',4,10000.00),(7,'dinesh kumar s','Amex','**** **** **** 0005','0005',1,2028,'2026-09-30 07:05:40.637397',4,10000.00),(8,'BASKAR','Mastercard','**** **** **** 4444','4444',3,2036,'2026-10-05 05:09:09.329639',5,10000.00),(9,'Baskar P','Visa','**** **** **** 1111','1111',1,2034,'2026-10-05 05:09:36.322361',5,10000.00),(10,'Boss','Amex','**** **** **** 0005','0005',8,2034,'2026-10-05 05:10:02.132910',5,10000.00),(11,'baskar','Visa','**** **** **** 1111','1111',3,2031,'2026-10-07 08:13:05.870673',6,10000.00),(12,'boss','Mastercard','**** **** **** 4444','4444',7,2037,'2026-10-07 08:13:43.178580',6,10000.00),(13,'Baskar P','Amex','**** **** **** 0005','0005',11,2035,'2026-10-07 08:14:13.173836',6,10000.00),(14,'baskar P','Visa','**** **** **** 1111','1111',3,2029,'2026-10-07 09:06:44.015049',7,10000.00);
/*!40000 ALTER TABLE `cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext COLLATE utf8mb4_unicode_ci,
  `object_repr` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_users_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (8,'accounts','user'),(1,'admin','logentry'),(11,'adminpanel','adminlog'),(3,'auth','group'),(2,'auth','permission'),(9,'cards','card'),(4,'contenttypes','contenttype'),(5,'sessions','session'),(6,'token_blacklist','blacklistedtoken'),(7,'token_blacklist','outstandingtoken'),(10,'transactions','transaction');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-09-29 05:06:44.766322'),(2,'contenttypes','0002_remove_content_type_name','2026-09-29 05:06:44.774612'),(3,'auth','0001_initial','2026-09-29 05:06:44.803232'),(4,'auth','0002_alter_permission_name_max_length','2026-09-29 05:06:44.809243'),(5,'auth','0003_alter_user_email_max_length','2026-09-29 05:06:44.812624'),(6,'auth','0004_alter_user_username_opts','2026-09-29 05:06:44.815994'),(7,'auth','0005_alter_user_last_login_null','2026-09-29 05:06:44.819314'),(8,'auth','0006_require_contenttypes_0002','2026-09-29 05:06:44.820235'),(9,'auth','0007_alter_validators_add_error_messages','2026-09-29 05:06:44.823846'),(10,'auth','0008_alter_user_username_max_length','2026-09-29 05:06:44.827342'),(11,'auth','0009_alter_user_last_name_max_length','2026-09-29 05:06:44.830495'),(12,'auth','0010_alter_group_name_max_length','2026-09-29 05:06:44.835215'),(13,'auth','0011_update_proxy_permissions','2026-09-29 05:06:44.838358'),(14,'auth','0012_alter_user_first_name_max_length','2026-09-29 05:06:44.841537'),(15,'accounts','0001_initial','2026-09-29 05:06:44.867921'),(16,'admin','0001_initial','2026-09-29 05:06:44.881510'),(17,'admin','0002_logentry_remove_auto_add','2026-09-29 05:06:44.887394'),(18,'admin','0003_logentry_add_action_flag_choices','2026-09-29 05:06:44.892172'),(19,'adminpanel','0001_initial','2026-09-29 05:06:44.902135'),(20,'cards','0001_initial','2026-09-29 05:06:44.912516'),(21,'sessions','0001_initial','2026-09-29 05:06:44.918211'),(22,'token_blacklist','0001_initial','2026-09-29 05:06:44.938502'),(23,'token_blacklist','0002_outstandingtoken_jti_hex','2026-09-29 05:06:44.945714'),(24,'token_blacklist','0003_auto_20171017_2007','2026-09-29 05:06:44.955127'),(25,'token_blacklist','0004_auto_20171017_2013','2026-09-29 05:06:44.965565'),(26,'token_blacklist','0005_remove_outstandingtoken_jti','2026-09-29 05:06:44.972606'),(27,'token_blacklist','0006_auto_20171017_2113','2026-09-29 05:06:44.979932'),(28,'token_blacklist','0007_auto_20171017_2214','2026-09-29 05:06:45.004085'),(29,'token_blacklist','0008_migrate_to_bigautofield','2026-09-29 05:06:45.028215'),(30,'token_blacklist','0010_fix_migrate_to_bigautofield','2026-09-29 05:06:45.035753'),(31,'token_blacklist','0011_linearizes_history','2026-09-29 05:06:45.036735'),(32,'token_blacklist','0012_alter_outstandingtoken_user','2026-09-29 05:06:45.042474'),(33,'token_blacklist','0013_alter_blacklistedtoken_options_and_more','2026-09-29 05:06:45.049893'),(34,'transactions','0001_initial','2026-09-29 05:06:45.068965'),(35,'cards','0002_card_credit_limit','2026-10-07 04:59:24.315532'),(36,'transactions','0002_transaction_user_created_idx','2026-10-07 04:59:24.357853');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('7w59lgu2a0nzphe2dfmo3vz8ty5itmzd','.eJxVjDsOwyAQBe9CHSH-sCnT-wxoYXFwEmHJ2FWUu0dILpL2zcx7s4jHXuPRyxYXYlem2eV3S5ifpQ1AD2z3lee17duS-FD4STufViqv2-n-HVTsddQqZJRA2tMMYKxXEpN0JD0IQO2VAiEyZJgdGemKScZZDDYUIIdZs88Xz1s3Wg:1xBQnk:yj6LwfwAjWYrhd28yLveR8ms80zSGyUouPvtZYftKeI','2026-10-13 05:54:52.064112');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token_blacklist_blacklistedtoken`
--

DROP TABLE IF EXISTS `token_blacklist_blacklistedtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_blacklist_blacklistedtoken` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `blacklisted_at` datetime(6) NOT NULL,
  `token_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_id` (`token_id`),
  CONSTRAINT `token_blacklist_blacklistedtoken_token_id_3cc7fe56_fk` FOREIGN KEY (`token_id`) REFERENCES `token_blacklist_outstandingtoken` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_blacklist_blacklistedtoken`
--

LOCK TABLES `token_blacklist_blacklistedtoken` WRITE;
/*!40000 ALTER TABLE `token_blacklist_blacklistedtoken` DISABLE KEYS */;
INSERT INTO `token_blacklist_blacklistedtoken` VALUES (1,'2026-09-30 08:22:30.590530',1),(2,'2026-10-01 05:44:25.160564',2),(3,'2026-10-01 05:45:38.576908',3),(4,'2026-10-05 04:59:12.446088',5),(5,'2026-10-05 05:06:53.864937',6),(6,'2026-10-05 05:07:25.760432',7),(7,'2026-10-05 05:18:26.591325',8),(8,'2026-10-05 05:22:08.102847',10),(9,'2026-10-05 05:27:33.674617',11),(10,'2026-10-05 10:29:09.379661',12),(11,'2026-10-07 05:22:21.985142',13),(12,'2026-10-07 08:01:34.654228',14),(13,'2026-10-07 08:05:52.929075',15),(14,'2026-10-07 09:05:58.043754',17);
/*!40000 ALTER TABLE `token_blacklist_blacklistedtoken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token_blacklist_outstandingtoken`
--

DROP TABLE IF EXISTS `token_blacklist_outstandingtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_blacklist_outstandingtoken` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `jti` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_uniq` (`jti`),
  KEY `token_blacklist_outstandingtoken_user_id_83bc629a_fk_users_id` (`user_id`),
  CONSTRAINT `token_blacklist_outstandingtoken_user_id_83bc629a_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_blacklist_outstandingtoken`
--

LOCK TABLES `token_blacklist_outstandingtoken` WRITE;
/*!40000 ALTER TABLE `token_blacklist_outstandingtoken` DISABLE KEYS */;
INSERT INTO `token_blacklist_outstandingtoken` VALUES (1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MDgzODEzMSwiaWF0IjoxNzkwNzUxNzMxLCJqdGkiOiJjZjFkZTM3MzZkYzU0ZmQwOWIzMjA1M2MxMDg1N2NmMiIsInVzZXJfaWQiOiI0In0.QueAl6uzy2NQjNLfXgPt_gF9rjAB92K49DTLKVdf2Kk','2026-09-30 07:02:11.399179','2026-10-01 07:02:11.000000',4,'cf1de3736dc54fd09b32053c10857cf2'),(2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MDkxODczNiwiaWF0IjoxNzkwODMyMzM2LCJqdGkiOiJiZTViMmI1YjUwYjg0NDZiYTlhYWYyNzFkNzFiZmEzYSIsInVzZXJfaWQiOiI0In0.EtVj40U34chbrMV0Ya_4rHuE-4i1SBfa5uLaSm965-M','2026-10-01 05:25:36.792659','2026-10-02 05:25:36.000000',4,'be5b2b5b50b8446ba9aaf271d71bfa3a'),(3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MDkxOTg4MywiaWF0IjoxNzkwODMzNDgzLCJqdGkiOiJjMjViNTM5NWZhMjA0MjNkYmJmMTI3NTliZmE2ZDEwNCIsInVzZXJfaWQiOiIyIn0.nWjyQfQnuPeE1cWpQYxzUkPBUbz6j7hjEB4HSl1czCE','2026-10-01 05:44:43.861728','2026-10-02 05:44:43.000000',2,'c25b5395fa20423dbbf12759bfa6d104'),(4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MDkxOTk0MywiaWF0IjoxNzkwODMzNTQzLCJqdGkiOiI5MjgyOWY5Zjg4N2I0ZmViYTk5MDJjNDc0ZTJlOTg5NyIsInVzZXJfaWQiOiIxIn0.SnlegCV-UwSOgXnY6Ytp24VNTb6vCtxNTJEjZxZBX_E','2026-10-01 05:45:43.589749','2026-10-02 05:45:43.000000',1,'92829f9f887b4feba9902c474e2e9897'),(5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTI2MjcyNywiaWF0IjoxNzkxMTc2MzI3LCJqdGkiOiJhMWYyY2JhZTFiNGY0MjA2YjM5YTcwYjE0NTkyNzQxOCIsInVzZXJfaWQiOiIxIn0.Yeiz6xA5PjzMzOeTSETfHsj_Y9nFLuLO5FfqYvDqXts','2026-10-05 04:58:47.025431','2026-10-06 04:58:47.000000',1,'a1f2cbae1b4f4206b39a70b145927418'),(6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTI2Mjg4MSwiaWF0IjoxNzkxMTc2NDgxLCJqdGkiOiI5MGM1YTMzZTk0MWY0NjI2YjUzZWI5MGQ3MGE5MWFmNiIsInVzZXJfaWQiOiIyIn0.MzGqb_6X1u2Sm0sPwbdaUvgp_yB3DNVbF1JwdusDm9w','2026-10-05 05:01:21.843707','2026-10-06 05:01:21.000000',2,'90c5a33e941f4626b53eb90d70a91af6'),(7,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTI2MzIyMSwiaWF0IjoxNzkxMTc2ODIxLCJqdGkiOiIzZDUwMGY0MmYwYjE0NGZmYjRlMWU2MTA5ZGM0ODdhZiIsInVzZXJfaWQiOiIxIn0.vslFnQEaKkAU8T_UyaIWCziPUakAutoYsTi0KolIPEI','2026-10-05 05:07:01.026749','2026-10-06 05:07:01.000000',1,'3d500f42f0b144ffb4e1e6109dc487af'),(8,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTI2MzI5NCwiaWF0IjoxNzkxMTc2ODk0LCJqdGkiOiIyNjg3NjM1ZWU1MTA0ZTI0YjBjODMxNWNiNmJjNmE2NSIsInVzZXJfaWQiOiI1In0.pU8AEXANbGcPOq_UIoVtmNyQHkqU55TkwQzgb3vD7To','2026-10-05 05:08:14.969753','2026-10-06 05:08:14.000000',5,'2687635ee5104e24b0c8315cb6bc6a65'),(9,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTI2MzU3NiwiaWF0IjoxNzkxMTc3MTc2LCJqdGkiOiJlMmViNDZiZmJjZTE0NzQ2YjVhZTlhNTMxMzE2YmJmNSIsInVzZXJfaWQiOiI1In0.XdCWXPZe4cJJT-gy-zYIye4Lnhw_iHzNHN8F-WVYV64','2026-10-05 05:12:56.027453','2026-10-06 05:12:56.000000',5,'e2eb46bfbce14746b5ae9a531316bbf5'),(10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTI2MzkxMCwiaWF0IjoxNzkxMTc3NTEwLCJqdGkiOiI0YjE0OGU5ZjIyYmQ0NWQ4YTZhYTYyZDhkOTdjOWJmMiIsInVzZXJfaWQiOiIxIn0.E_7j-nvz1DbU87mBkyGIlz5HhqYQERlxwydxv2OIWk0','2026-10-05 05:18:30.729710','2026-10-06 05:18:30.000000',1,'4b148e9f22bd45d8a6aa62d8d97c9bf2'),(11,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTI2NDEzMCwiaWF0IjoxNzkxMTc3NzMwLCJqdGkiOiI4NjgxYzc5MTVmYWM0YTBkYThhYjhjY2JjODI2YTBjNiIsInVzZXJfaWQiOiIxIn0.8eSSSaxeVhEcuswYmgjSzTnTXZ3RwOyKM0qi1A2sA4Q','2026-10-05 05:22:10.901853','2026-10-06 05:22:10.000000',1,'8681c7915fac4a0da8ab8ccbc826a0c6'),(12,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTI2NDQ1OSwiaWF0IjoxNzkxMTc4MDU5LCJqdGkiOiI0ZDNlMzY1YjM4OTU0YmI5YTNiZjliNmZhZTVmN2UyZSIsInVzZXJfaWQiOiIyIn0.V2tdZoLLP4n3TaJ_mLpeXnsOMZgOovqyDqCs0DLCH_k','2026-10-05 05:27:39.645362','2026-10-06 05:27:39.000000',2,'4d3e365b38954bb9a3bf9b6fae5f7e2e'),(13,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTQzNjU0NCwiaWF0IjoxNzkxMzUwMTQ0LCJqdGkiOiIxN2M4MDA1OTgzNGI0MzZiODdiNDIwY2M2NTAyYTRiNiIsInVzZXJfaWQiOiIyIn0.Wf1asKq8pkd1crNiuHzKLq9XZ8ua4m9XKu2TSPxoO4k','2026-10-07 05:15:44.420602','2026-10-08 05:15:44.000000',2,'17c80059834b436b87b420cc6502a4b6'),(14,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTQzNjk0NiwiaWF0IjoxNzkxMzUwNTQ2LCJqdGkiOiI5OTgxYTU4MTNmMGU0M2Q5YWJkMTIyMmM2ODI2ZTk2MyIsInVzZXJfaWQiOiI1In0.gZDfXTCOh7GHxsrx7MhP4Hzx-Qxug_0s88P_vQA9LjU','2026-10-07 05:22:26.120836','2026-10-08 05:22:26.000000',5,'9981a5813f0e43d9abd1222c6826e963'),(15,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTQ0NjQ5OCwiaWF0IjoxNzkxMzYwMDk4LCJqdGkiOiI4MzRhZTUwYmUwZmQ0YzI4YTZjM2E2NWE5NDk0Mjc0MSIsInVzZXJfaWQiOiIyIn0.9GMCwO2R2tT5qxB4KgN3Kt_s4UYquSmP2lAH7CR9DnA','2026-10-07 08:01:38.690792','2026-10-08 08:01:38.000000',2,'834ae50be0fd4c28a6c3a65a94942741'),(16,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTQ0NjczNiwiaWF0IjoxNzkxMzYwMzM2LCJqdGkiOiI4YzdlN2Q3NDU0ZTU0NzkwOTFhYmRkNzc4ZTVmY2RjNCIsInVzZXJfaWQiOiI2In0.BJe-B_eauY38WZFylCWJPj6fYwZKFA1GayxMFJ-p4Kc','2026-10-07 08:05:36.353054','2026-10-08 08:05:36.000000',6,'8c7e7d7454e5479091abdd778e5fcdc4'),(17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTQ0Njc2OCwiaWF0IjoxNzkxMzYwMzY4LCJqdGkiOiIwZjEwMmYyYmIzOTk0MjMzOTU5MjRjMWEzY2VkNTkxNiIsInVzZXJfaWQiOiI2In0.zkTZhbVTwuOfGmcUoAD8jYBLuA-oNli9R97JcJnOuFg','2026-10-07 08:06:08.974589','2026-10-08 08:06:08.000000',6,'0f102f2bb399423395924c1a3ced5916'),(18,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTQ1MDA0MCwiaWF0IjoxNzkxMzYzNjQwLCJqdGkiOiIyNzY3MmEzY2MyMWI0ODhmOGQwMjgyNTdmYzhjYzg4YyIsInVzZXJfaWQiOiI3In0.s3QvDQzcN3tby8GXAJB98qrWaHNpvopOxk-nEbTZcDY','2026-10-07 09:00:40.153012','2026-10-08 09:00:40.000000',7,'27672a3cc21b488f8d028257fc8cc88c'),(19,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTQ1MDM3MSwiaWF0IjoxNzkxMzYzOTcxLCJqdGkiOiIxZjYxZjE4YTQ0NzY0YjliYjRlNDQwZjBhNjQwN2FkNSIsInVzZXJfaWQiOiI3In0.geqM0Nj58vTDvDFZbi6T1bqcS4AGxkJerOnb4ul-_ss','2026-10-07 09:06:11.083364','2026-10-08 09:06:11.000000',7,'1f61f18a44764b9bb4e440f0a6407ad5');
/*!40000 ALTER TABLE `token_blacklist_outstandingtoken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `reference` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `card_last4` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `failure_reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `card_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `transactions_card_id_f8e89ea3_fk_cards_id` (`card_id`),
  KEY `transactions_user_id_766cc893_fk_users_id` (`user_id`),
  KEY `transaction_status_505a2f_idx` (`status`),
  KEY `transaction_created_5c02ac_idx` (`created_at`),
  KEY `tx_user_created_idx` (`user_id`,`created_at` DESC),
  CONSTRAINT `transactions_card_id_f8e89ea3_fk_cards_id` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`),
  CONSTRAINT `transactions_user_id_766cc893_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,'9cc79e86-480b-48a9-9616-da6cdb42b5e5','1111',12.50,'USD','Coffee beans','SUCCESS','','2026-09-29 05:07:22.714828','2026-09-29 05:07:22.717836',1,2),(2,'d717c9fd-eaf7-460e-a93b-a599bb567b8b','1111',249.99,'USD','Laptop stand','SUCCESS','','2026-09-29 05:07:22.722560','2026-09-29 05:07:22.723527',1,2),(3,'9e394f86-1bb4-444e-b22d-5bb4a1a80d2f','4444',79.00,'USD','Online course','FAILED','Bank did not respond in time','2026-09-29 05:07:22.727060','2026-09-29 05:07:22.727935',2,2),(4,'c6db6ae9-52a8-48a2-8f0b-b386420957d9','4444',5.25,'USD','Ebook','SUCCESS','','2026-09-29 05:07:22.731567','2026-09-29 05:07:22.732459',2,2),(5,'da382be7-10e5-41fe-a74d-51b82a54ac4f','0005',1200.00,'USD','Flight booking','FAILED','Suspected fraud - transaction blocked','2026-09-29 05:07:22.736347','2026-09-29 05:07:22.737328',3,2),(6,'b4eadf29-79bf-442e-bb50-102c3ecbc2e1','0005',39.90,'USD','Groceries','SUCCESS','','2026-09-29 05:07:22.740709','2026-09-29 05:07:22.741557',3,2),(7,'eeb443dc-32a7-47a8-bf11-1465e094beb6','1111',15.00,'USD','Taxi','SUCCESS','','2026-09-29 05:07:22.744943','2026-09-29 05:07:22.745836',1,2),(8,'8cbd5f2b-da58-4b4d-aad9-a565fd2f9e12','4444',0.12,'USD','flipcart','SUCCESS','','2026-09-29 08:55:25.455870','2026-09-29 08:55:25.497864',4,1),(9,'b1d6dd2e-31c9-4119-8c42-d852ed1c8996','0005',2.98,'USD','amazon','SUCCESS','','2026-09-30 07:05:59.437365','2026-09-30 07:05:59.446397',7,4),(10,'d23d0536-924d-42ba-86dd-067ee9681827','0005',22.00,'USD','','SUCCESS','','2026-10-01 05:30:57.261049','2026-10-01 05:30:57.284618',7,4),(11,'d8db9119-887b-4ac2-b506-9f578c444878','4444',2.00,'USD','indoplanet','FAILED','Card declined by issuer','2026-10-01 05:45:03.816810','2026-10-01 05:45:03.827018',2,2),(12,'92ab8f20-9b32-400a-8f80-54a360d274a8','1111',2311.00,'USD','amazon','FAILED','Insufficient funds','2026-10-05 05:06:10.772800','2026-10-05 05:06:10.782465',1,2),(13,'6e648e2d-4d17-4669-92ae-9f3bc1a0c975','1111',2.00,'USD','','SUCCESS','','2026-10-05 05:06:21.419843','2026-10-05 05:06:21.426199',1,2),(14,'446858b3-735f-4922-8cb3-b651ad8e98a2','0005',12.00,'USD','','SUCCESS','','2026-10-05 05:10:21.129113','2026-10-05 05:10:21.134707',10,5),(15,'97e77c58-de4f-46ca-b3fb-a476025deab0','0005',2.00,'USD','','SUCCESS','','2026-10-05 05:10:25.044318','2026-10-05 05:10:25.050820',10,5),(16,'25cb3cf5-8695-4350-ace1-0a0835b97399','0005',12121.00,'USD','','SUCCESS','','2026-10-05 05:10:28.175958','2026-10-05 05:10:28.182607',10,5),(17,'adc99581-8034-4836-8cfa-db46b5c7e99e','4444',1212.00,'USD','','SUCCESS','','2026-10-05 05:10:38.938638','2026-10-05 05:10:38.943486',8,5),(18,'028bea3d-bc04-48d0-8e86-495fbd23a2b9','1111',12121.00,'USD','','FAILED','Suspected fraud - transaction blocked','2026-10-05 05:10:49.571327','2026-10-05 05:10:49.580005',9,5),(19,'7e76ddab-4c5f-4b8d-adbd-57bc7091cb43','1111',100.00,'USD','','FAILED','Card declined by issuer','2026-10-05 05:10:58.237739','2026-10-05 05:10:58.244636',9,5),(20,'eb312e96-de9c-4631-a560-d5b7c0b134e5','1111',1.00,'USD','','SUCCESS','','2026-10-05 05:11:01.425750','2026-10-05 05:11:01.431462',9,5),(21,'e0c2f184-0a44-42ed-91d2-14d602200ccb','1111',2.00,'USD','','FAILED','Insufficient funds','2026-10-05 05:11:04.278450','2026-10-05 05:11:04.285584',9,5),(22,'52a2fe2a-c8d6-47b5-a0e9-628da6831cca','0005',23.00,'USD','indoplanet','SUCCESS','','2026-10-07 05:22:49.075439','2026-10-07 05:22:49.093925',10,5),(23,'6a871da3-82a6-4085-b876-ac080e4c20e7','4444',34.00,'USD','','SUCCESS','','2026-10-07 07:49:04.886630','2026-10-07 07:49:04.945551',8,5),(24,'efaf1152-f59b-4c18-a8ce-d5848c84a23a','0005',95.00,'USD','','SUCCESS','','2026-10-07 07:49:27.084045','2026-10-07 07:49:27.091935',10,5),(25,'2b87d389-afed-4233-af59-359ad25e072b','0005',21.00,'USD','','SUCCESS','','2026-10-07 08:28:26.134425','2026-10-07 08:28:26.143124',13,6),(26,'bfcea7bd-24ef-45ac-8e70-74113dbcf4e4','0005',10000.00,'USD','','SUCCESS','','2026-10-07 08:28:31.521343','2026-10-07 08:28:31.527985',13,6),(27,'f2cfe9ae-7c54-4fc8-a4d6-98d18028c613','0005',19000.00,'USD','','SUCCESS','','2026-10-07 08:28:48.478410','2026-10-07 08:28:48.484496',13,6),(28,'c5dfdee4-e8d8-44f7-a7e5-aeda9aa7d183','0005',979.00,'USD','','SUCCESS','','2026-10-07 08:29:03.671403','2026-10-07 08:29:03.678457',13,6),(29,'de5f1864-1393-4bbf-a0da-545aff07a313','0005',1.00,'USD','','SUCCESS','','2026-10-07 08:29:06.366177','2026-10-07 08:29:06.373942',13,6),(30,'a01a0d7d-9860-416a-ad09-42d42a3944c9','0005',2.00,'USD','','SUCCESS','','2026-10-07 08:29:12.961052','2026-10-07 08:29:12.966659',13,6),(31,'5f86f864-f73a-4c44-8063-5578cb761592','1111',4.00,'USD','','FAILED','Bank did not respond in time','2026-10-07 09:06:51.923261','2026-10-07 09:06:51.934395',14,7),(32,'56714cd5-e0ba-4f81-9ece-1e8460b73722','1111',4.00,'USD','','SUCCESS','','2026-10-07 09:06:58.820946','2026-10-07 09:06:58.829190',14,7),(33,'036fc8e1-01d4-49f7-a1fa-9666416bd5b7','1111',100.00,'USD','','SUCCESS','','2026-10-07 09:07:05.499280','2026-10-07 09:07:05.505741',14,7),(34,'2b697460-e481-4fc6-9fe2-1387784268aa','1111',89.00,'USD','','SUCCESS','','2026-10-07 09:07:11.598383','2026-10-07 09:07:11.606749',14,7);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'pbkdf2_sha256$600000$IlGgPHVNjBOnmR0Ow33v8L$87PMaripOcRk2QQRjSYXCBwfPf0sHe9gG2urxxUquYM=',NULL,1,'admin','','',1,1,'2026-09-29 05:06:45.516718','admin@example.com'),(2,'pbkdf2_sha256$600000$AF2Z1LNT6BcBpyfFMhYHaU$WVfbXDtNjc7N9x5arM6aJDPx7wa+OlYk8UJ7nzE5NWw=',NULL,0,'demo','','',0,1,'2026-09-29 05:07:22.054792','demo@example.com'),(3,'pbkdf2_sha256$600000$p7Jn4PAu0nDoQs0a2GvKhC$JhNQrqZGRqHEehK9pjxLdFNr6JvktWr5ZRJcu78qvFQ=','2026-09-29 05:54:52.054092',1,'baskar','','',1,1,'2026-09-29 05:54:36.480491','baskarperiyasamy17@gmail.com'),(4,'pbkdf2_sha256$600000$BvJOzxW0dSbVExov6kAk4q$5Qtr+pui1NczTEvILrFG/S52wBgckJnqdlynt2zYK/g=',NULL,0,'Dinesh','','',0,1,'2026-09-30 07:02:11.140954','dineshsenthilkumar@gmail.com'),(5,'pbkdf2_sha256$600000$0CvJtpM4pOpDACRzTu0Y2o$XUOSb3xM+KWJQytT0ehkiAx6tKQXQo/4zQfu+d4l9R8=',NULL,0,'baskar08','','',0,1,'2026-10-05 05:08:14.735418','baskarperiyasamy18@gmail.com'),(6,'pbkdf2_sha256$600000$vrer9FSVaunWYDR7144EmB$ePFk87+b5zDW7DOeBoELHMrrAu35i9vxzUF3Ozl7dyM=',NULL,0,'boss','baskar','P',0,1,'2026-10-07 08:05:14.103785','boss@example.com'),(7,'pbkdf2_sha256$600000$eVbWH4GpD4dOPnydxdAUvg$z00sffx4POHeZd/CAVV2kJqIXd0ij68atWRkNAHrl1A=',NULL,0,'demo2','','',0,1,'2026-10-07 09:00:21.750470','demo2@gmail.com');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_groups`
--

DROP TABLE IF EXISTS `users_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_groups_user_id_group_id_fc7788e8_uniq` (`user_id`,`group_id`),
  KEY `users_groups_group_id_2f3517aa_fk_auth_group_id` (`group_id`),
  CONSTRAINT `users_groups_group_id_2f3517aa_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `users_groups_user_id_f500bee5_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_groups`
--

LOCK TABLES `users_groups` WRITE;
/*!40000 ALTER TABLE `users_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_user_permissions`
--

DROP TABLE IF EXISTS `users_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_user_permissions_user_id_permission_id_3b86cbdf_uniq` (`user_id`,`permission_id`),
  KEY `users_user_permissio_permission_id_6d08dcd2_fk_auth_perm` (`permission_id`),
  CONSTRAINT `users_user_permissio_permission_id_6d08dcd2_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `users_user_permissions_user_id_92473840_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_user_permissions`
--

LOCK TABLES `users_user_permissions` WRITE;
/*!40000 ALTER TABLE `users_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-07 10:21:30
