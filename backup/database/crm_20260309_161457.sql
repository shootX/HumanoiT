/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.10-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: crm
-- ------------------------------------------------------
-- Server version	10.11.10-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `asset_attachments`
--

DROP TABLE IF EXISTS `asset_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asset_attachments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `asset_id` bigint(20) unsigned NOT NULL,
  `media_item_id` bigint(20) unsigned NOT NULL,
  `uploaded_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `asset_attachments_media_item_id_foreign` (`media_item_id`),
  KEY `asset_attachments_uploaded_by_foreign` (`uploaded_by`),
  KEY `asset_attachments_workspace_id_asset_id_created_at_index` (`workspace_id`,`asset_id`,`created_at`),
  KEY `asset_attachments_asset_id_created_at_index` (`asset_id`,`created_at`),
  CONSTRAINT `asset_attachments_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_attachments_media_item_id_foreign` FOREIGN KEY (`media_item_id`) REFERENCES `media_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_attachments_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_attachments_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_attachments`
--

LOCK TABLES `asset_attachments` WRITE;
/*!40000 ALTER TABLE `asset_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `asset_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_categories`
--

DROP TABLE IF EXISTS `asset_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asset_categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(255) NOT NULL DEFAULT '#3B82F6',
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `asset_categories_workspace_id_order_index` (`workspace_id`,`order`),
  CONSTRAINT `asset_categories_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_categories`
--

LOCK TABLES `asset_categories` WRITE;
/*!40000 ALTER TABLE `asset_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `asset_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_task`
--

DROP TABLE IF EXISTS `asset_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asset_task` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) unsigned NOT NULL,
  `asset_id` bigint(20) unsigned NOT NULL,
  `quantity` int(10) unsigned NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_task_task_id_asset_id_unique` (`task_id`,`asset_id`),
  KEY `asset_task_asset_id_foreign` (`asset_id`),
  CONSTRAINT `asset_task_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_task_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_task`
--

LOCK TABLES `asset_task` WRITE;
/*!40000 ALTER TABLE `asset_task` DISABLE KEYS */;
INSERT INTO `asset_task` VALUES
(1,1,1,4,'2026-03-09 13:36:49','2026-03-09 13:36:49');
/*!40000 ALTER TABLE `asset_task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_warranty_cases`
--

DROP TABLE IF EXISTS `asset_warranty_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asset_warranty_cases` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `asset_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'open',
  `opened_at` date DEFAULT NULL,
  `closed_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `asset_warranty_cases_asset_id_foreign` (`asset_id`),
  KEY `asset_warranty_cases_workspace_id_asset_id_index` (`workspace_id`,`asset_id`),
  CONSTRAINT `asset_warranty_cases_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_warranty_cases_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_warranty_cases`
--

LOCK TABLES `asset_warranty_cases` WRITE;
/*!40000 ALTER TABLE `asset_warranty_cases` DISABLE KEYS */;
/*!40000 ALTER TABLE `asset_warranty_cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `asset_category_id` bigint(20) unsigned DEFAULT NULL,
  `project_id` bigint(20) unsigned DEFAULT NULL,
  `invoice_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(10) unsigned NOT NULL DEFAULT 1,
  `asset_code` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `warranty_until` date DEFAULT NULL,
  `status` enum('active','used','maintenance','retired') DEFAULT 'active',
  `value` decimal(15,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assets_invoice_id_foreign` (`invoice_id`),
  KEY `assets_workspace_id_status_index` (`workspace_id`,`status`),
  KEY `assets_project_id_index` (`project_id`),
  KEY `assets_asset_category_id_foreign` (`asset_category_id`),
  CONSTRAINT `assets_asset_category_id_foreign` FOREIGN KEY (`asset_category_id`) REFERENCES `asset_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES
(1,2,NULL,3,1,'AL94 პეტლი SM 11',4,NULL,NULL,'ისანი ნავთლუღის 6ა','2026-03-09',NULL,'used',24.12,'From invoice INV-2026-0001','2026-03-09 13:36:25','2026-03-09 13:36:49');
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budget_categories`
--

DROP TABLE IF EXISTS `budget_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `budget_categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_budget_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `allocated_amount` decimal(15,2) NOT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#3B82F6',
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `budget_categories_project_budget_id_sort_order_index` (`project_budget_id`,`sort_order`),
  CONSTRAINT `budget_categories_project_budget_id_foreign` FOREIGN KEY (`project_budget_id`) REFERENCES `project_budgets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budget_categories`
--

LOCK TABLES `budget_categories` WRITE;
/*!40000 ALTER TABLE `budget_categories` DISABLE KEYS */;
INSERT INTO `budget_categories` VALUES
(1,1,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:28','2026-03-09 13:53:28'),
(2,1,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:28','2026-03-09 13:53:28'),
(3,1,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:28','2026-03-09 13:53:28'),
(4,1,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:28','2026-03-09 13:53:28'),
(5,2,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:28','2026-03-09 13:53:28'),
(6,2,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:28','2026-03-09 13:53:28'),
(7,2,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:28','2026-03-09 13:53:28'),
(8,2,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:28','2026-03-09 13:53:28'),
(9,3,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:28','2026-03-09 13:53:28'),
(10,3,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:28','2026-03-09 13:53:28'),
(11,3,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(12,3,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(13,4,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(14,4,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(15,4,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(16,4,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(17,5,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(18,5,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(19,5,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(20,5,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(21,6,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(22,6,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(23,6,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(24,6,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(25,7,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(26,7,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(27,7,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(28,7,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(29,8,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(30,8,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(31,8,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(32,8,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(33,9,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(34,9,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(35,9,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(36,9,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(37,10,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(38,10,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(39,10,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(40,10,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(41,11,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(42,11,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(43,11,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(44,11,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(45,12,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(46,12,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(47,12,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(48,12,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(49,13,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(50,13,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(51,13,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(52,13,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(53,14,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(54,14,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(55,14,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(56,14,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(57,15,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(58,15,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(59,15,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(60,15,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(61,16,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(62,16,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(63,16,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(64,16,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(65,17,'რემონტი',0.00,'#3B82F6',NULL,1,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(66,17,'დამ.საშუალების შეძენა',0.00,'#8B5CF6',NULL,2,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(67,17,'ავეჯი',0.00,'#10B981',NULL,3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(68,17,'დეკორაცია',0.00,'#F59E0B',NULL,4,'2026-03-09 13:53:29','2026-03-09 13:53:29');
/*!40000 ALTER TABLE `budget_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budget_revision_approvals`
--

DROP TABLE IF EXISTS `budget_revision_approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `budget_revision_approvals` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `budget_revision_id` bigint(20) unsigned NOT NULL,
  `approver_id` bigint(20) unsigned NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL,
  `notes` text DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `budget_revision_approvals_budget_revision_id_status_index` (`budget_revision_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budget_revision_approvals`
--

LOCK TABLES `budget_revision_approvals` WRITE;
/*!40000 ALTER TABLE `budget_revision_approvals` DISABLE KEYS */;
/*!40000 ALTER TABLE `budget_revision_approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budget_revisions`
--

DROP TABLE IF EXISTS `budget_revisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `budget_revisions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_budget_id` bigint(20) unsigned NOT NULL,
  `revised_by` bigint(20) unsigned NOT NULL,
  `previous_amount` decimal(15,2) NOT NULL,
  `new_amount` decimal(15,2) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `budget_revisions_project_budget_id_status_index` (`project_budget_id`,`status`),
  KEY `budget_revisions_revised_by_foreign` (`revised_by`),
  KEY `budget_revisions_approved_by_foreign` (`approved_by`),
  CONSTRAINT `budget_revisions_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `budget_revisions_project_budget_id_foreign` FOREIGN KEY (`project_budget_id`) REFERENCES `project_budgets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `budget_revisions_revised_by_foreign` FOREIGN KEY (`revised_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budget_revisions`
--

LOCK TABLES `budget_revisions` WRITE;
/*!40000 ALTER TABLE `budget_revisions` DISABLE KEYS */;
/*!40000 ALTER TABLE `budget_revisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bug_attachments`
--

DROP TABLE IF EXISTS `bug_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bug_attachments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `bug_id` bigint(20) unsigned NOT NULL,
  `media_item_id` bigint(20) unsigned NOT NULL,
  `uploaded_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bug_attachments_media_item_id_foreign` (`media_item_id`),
  KEY `bug_attachments_uploaded_by_foreign` (`uploaded_by`),
  KEY `bug_attachments_bug_id_created_at_index` (`bug_id`,`created_at`),
  CONSTRAINT `bug_attachments_bug_id_foreign` FOREIGN KEY (`bug_id`) REFERENCES `bugs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bug_attachments_media_item_id_foreign` FOREIGN KEY (`media_item_id`) REFERENCES `media_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bug_attachments_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bug_attachments`
--

LOCK TABLES `bug_attachments` WRITE;
/*!40000 ALTER TABLE `bug_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `bug_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bug_comments`
--

DROP TABLE IF EXISTS `bug_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bug_comments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `bug_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `comment` text NOT NULL,
  `mentions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mentions`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bug_comments_user_id_foreign` (`user_id`),
  KEY `bug_comments_bug_id_created_at_index` (`bug_id`,`created_at`),
  CONSTRAINT `bug_comments_bug_id_foreign` FOREIGN KEY (`bug_id`) REFERENCES `bugs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bug_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bug_comments`
--

LOCK TABLES `bug_comments` WRITE;
/*!40000 ALTER TABLE `bug_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `bug_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bug_statuses`
--

DROP TABLE IF EXISTS `bug_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bug_statuses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(255) NOT NULL DEFAULT '#ef4444',
  `order` int(11) NOT NULL DEFAULT 0,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bug_statuses_workspace_id_order_index` (`workspace_id`,`order`),
  CONSTRAINT `bug_statuses_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bug_statuses`
--

LOCK TABLES `bug_statuses` WRITE;
/*!40000 ALTER TABLE `bug_statuses` DISABLE KEYS */;
/*!40000 ALTER TABLE `bug_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bugs`
--

DROP TABLE IF EXISTS `bugs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bugs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) unsigned NOT NULL,
  `bug_status_id` bigint(20) unsigned NOT NULL,
  `milestone_id` bigint(20) unsigned DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `severity` enum('minor','major','critical','blocker') NOT NULL DEFAULT 'major',
  `steps_to_reproduce` text DEFAULT NULL,
  `expected_behavior` text DEFAULT NULL,
  `actual_behavior` text DEFAULT NULL,
  `environment` varchar(255) DEFAULT NULL,
  `assigned_to` bigint(20) unsigned DEFAULT NULL,
  `reported_by` bigint(20) unsigned NOT NULL,
  `resolved_by` bigint(20) unsigned DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bugs_bug_status_id_foreign` (`bug_status_id`),
  KEY `bugs_reported_by_foreign` (`reported_by`),
  KEY `bugs_milestone_id_foreign` (`milestone_id`),
  KEY `bugs_resolved_by_foreign` (`resolved_by`),
  KEY `bugs_project_id_bug_status_id_index` (`project_id`,`bug_status_id`),
  KEY `bugs_assigned_to_reported_by_index` (`assigned_to`,`reported_by`),
  CONSTRAINT `bugs_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bugs_bug_status_id_foreign` FOREIGN KEY (`bug_status_id`) REFERENCES `bug_statuses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bugs_milestone_id_foreign` FOREIGN KEY (`milestone_id`) REFERENCES `project_milestones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bugs_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bugs_reported_by_foreign` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bugs_resolved_by_foreign` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bugs`
--

LOCK TABLES `bugs` WRITE;
/*!40000 ALTER TABLE `bugs` DISABLE KEYS */;
/*!40000 ALTER TABLE `bugs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contacts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied','closed') NOT NULL DEFAULT 'new',
  `admin_notes` text DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contacts_status_created_at_index` (`status`,`created_at`),
  KEY `contacts_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contracts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `contract_type_id` bigint(20) unsigned NOT NULL,
  `contract_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('pending','sent','accept','decline','expired') NOT NULL DEFAULT 'pending',
  `client_id` bigint(20) unsigned NOT NULL,
  `project_id` bigint(20) unsigned DEFAULT NULL,
  `assigned_users` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`assigned_users`)),
  `terms_conditions` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `workspace_id` bigint(20) unsigned NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `signed_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `company_signature` longtext DEFAULT NULL,
  `client_signature` longtext DEFAULT NULL,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `declined_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contracts_contract_id_unique` (`contract_id`),
  KEY `contracts_contract_type_id_foreign` (`contract_type_id`),
  KEY `contracts_project_id_foreign` (`project_id`),
  KEY `contracts_created_by_foreign` (`created_by`),
  KEY `contracts_workspace_id_status_index` (`workspace_id`,`status`),
  KEY `contracts_client_id_status_index` (`client_id`,`status`),
  KEY `contracts_start_date_end_date_index` (`start_date`,`end_date`),
  CONSTRAINT `contracts_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_contract_type_id_foreign` FOREIGN KEY (`contract_type_id`) REFERENCES `contracts_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `contracts_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts_attachments`
--

DROP TABLE IF EXISTS `contracts_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contracts_attachments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `contract_id` bigint(20) unsigned NOT NULL,
  `files` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contracts_attachments_workspace_id_contract_id_index` (`workspace_id`,`contract_id`),
  KEY `contracts_attachments_contract_id_index` (`contract_id`),
  CONSTRAINT `contracts_attachments_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_attachments_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts_attachments`
--

LOCK TABLES `contracts_attachments` WRITE;
/*!40000 ALTER TABLE `contracts_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `contracts_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts_comments`
--

DROP TABLE IF EXISTS `contracts_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contracts_comments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `comment` text NOT NULL,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `is_internal` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contracts_comments_parent_id_foreign` (`parent_id`),
  KEY `contracts_comments_created_by_foreign` (`created_by`),
  KEY `contracts_comments_contract_id_parent_id_index` (`contract_id`,`parent_id`),
  CONSTRAINT `contracts_comments_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_comments_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_comments_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `contracts_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts_comments`
--

LOCK TABLES `contracts_comments` WRITE;
/*!40000 ALTER TABLE `contracts_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `contracts_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts_notes`
--

DROP TABLE IF EXISTS `contracts_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contracts_notes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `note` text NOT NULL,
  `is_pinned` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contracts_notes_contract_id_foreign` (`contract_id`),
  KEY `contracts_notes_created_by_foreign` (`created_by`),
  CONSTRAINT `contracts_notes_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_notes_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts_notes`
--

LOCK TABLES `contracts_notes` WRITE;
/*!40000 ALTER TABLE `contracts_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `contracts_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts_types`
--

DROP TABLE IF EXISTS `contracts_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contracts_types` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#007bff',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contracts_types_created_by_foreign` (`created_by`),
  KEY `contracts_types_workspace_id_is_active_index` (`workspace_id`,`is_active`),
  CONSTRAINT `contracts_types_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_types_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts_types`
--

LOCK TABLES `contracts_types` WRITE;
/*!40000 ALTER TABLE `contracts_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `contracts_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_contacts`
--

DROP TABLE IF EXISTS `crm_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crm_contacts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `type` enum('individual','legal') NOT NULL DEFAULT 'individual',
  `name` varchar(255) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `brand_name` varchar(255) DEFAULT NULL,
  `identification_code` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `crm_contacts_created_by_foreign` (`created_by`),
  KEY `crm_contacts_workspace_id_type_index` (`workspace_id`,`type`),
  KEY `crm_contacts_workspace_id_created_at_index` (`workspace_id`,`created_at`),
  CONSTRAINT `crm_contacts_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `crm_contacts_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_contacts`
--

LOCK TABLES `crm_contacts` WRITE;
/*!40000 ALTER TABLE `crm_contacts` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `currencies`
--

DROP TABLE IF EXISTS `currencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `currencies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(10) NOT NULL,
  `symbol` varchar(10) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `currencies_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `currencies`
--

LOCK TABLES `currencies` WRITE;
/*!40000 ALTER TABLE `currencies` DISABLE KEYS */;
INSERT INTO `currencies` VALUES
(1,'US Dollar','USD','$','United States Dollar',1,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(2,'Euro','EUR','€','Euro',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(3,'British Pound','GBP','£','British Pound Sterling',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(4,'Japanese Yen','JPY','¥','Japanese Yen',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(5,'Canadian Dollar','CAD','C$','Canadian Dollar',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(6,'Australian Dollar','AUD','A$','Australian Dollar',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(7,'Swiss Franc','CHF','CHF','Swiss Franc',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(8,'Chinese Yuan','CNY','¥','Chinese Yuan',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(9,'Swedish Krona','SEK','kr','Swedish Krona',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(10,'New Zealand Dollar','NZD','NZ$','New Zealand Dollar',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(11,'Mexican Peso','MXN','$','Mexican Peso',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(12,'Singapore Dollar','SGD','S$','Singapore Dollar',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(13,'Hong Kong Dollar','HKD','HK$','Hong Kong Dollar',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(14,'Norwegian Krone','NOK','kr','Norwegian Krone',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(15,'South Korean Won','KRW','₩','South Korean Won',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(16,'Turkish Lira','TRY','₺','Turkish Lira',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(17,'Russian Ruble','RUB','₽','Russian Ruble',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(18,'Indian Rupee','INR','₹','Indian Rupee',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(19,'Brazilian Real','BRL','R$','Brazilian Real',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(20,'South African Rand','ZAR','R','South African Rand',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(21,'Polish Zloty','PLN','zł','Polish Zloty',0,'2026-03-09 13:00:38','2026-03-09 13:00:38'),
(22,'Israeli Shekel','ILS','₪','Israeli Shekel',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(23,'Danish Krone','DKK','kr','Danish Krone',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(24,'Czech Koruna','CZK','Kč','Czech Koruna',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(25,'Hungarian Forint','HUF','Ft','Hungarian Forint',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(26,'Romanian Leu','RON','lei','Romanian Leu',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(27,'Croatian Kuna','HRK','kn','Croatian Kuna',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(28,'Bulgarian Lev','BGN','лв','Bulgarian Lev',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(29,'Thai Baht','THB','฿','Thai Baht',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(30,'Malaysian Ringgit','MYR','RM','Malaysian Ringgit',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(31,'Indonesian Rupiah','IDR','Rp','Indonesian Rupiah',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(32,'Philippine Peso','PHP','₱','Philippine Peso',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(33,'Vietnamese Dong','VND','₫','Vietnamese Dong',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(34,'Argentine Peso','ARS','$','Argentine Peso',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(35,'Chilean Peso','CLP','$','Chilean Peso',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(36,'Colombian Peso','COP','$','Colombian Peso',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(37,'Peruvian Sol','PEN','S/','Peruvian Sol',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(38,'Uruguayan Peso','UYU','$U','Uruguayan Peso',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(39,'Egyptian Pound','EGP','£','Egyptian Pound',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(40,'Nigerian Naira','NGN','₦','Nigerian Naira',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(41,'Kenyan Shilling','KES','KSh','Kenyan Shilling',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(42,'Moroccan Dirham','MAD','DH','Moroccan Dirham',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(43,'Tunisian Dinar','TND','د.ت','Tunisian Dinar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(44,'UAE Dirham','AED','د.إ','UAE Dirham',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(45,'Saudi Riyal','SAR','﷼','Saudi Riyal',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(46,'Qatari Riyal','QAR','﷼','Qatari Riyal',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(47,'Kuwaiti Dinar','KWD','د.ك','Kuwaiti Dinar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(48,'Bahraini Dinar','BHD','.د.ب','Bahraini Dinar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(49,'Omani Rial','OMR','﷼','Omani Rial',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(50,'Jordanian Dinar','JOD','د.ا','Jordanian Dinar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(51,'Lebanese Pound','LBP','£','Lebanese Pound',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(52,'Pakistani Rupee','PKR','₨','Pakistani Rupee',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(53,'Bangladeshi Taka','BDT','৳','Bangladeshi Taka',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(54,'Sri Lankan Rupee','LKR','₨','Sri Lankan Rupee',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(55,'Nepalese Rupee','NPR','₨','Nepalese Rupee',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(56,'Myanmar Kyat','MMK','K','Myanmar Kyat',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(57,'Cambodian Riel','KHR','៛','Cambodian Riel',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(58,'Laotian Kip','LAK','₭','Laotian Kip',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(59,'Mongolian Tugrik','MNT','₮','Mongolian Tugrik',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(60,'Kazakhstani Tenge','KZT','₸','Kazakhstani Tenge',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(61,'Uzbekistani Som','UZS','лв','Uzbekistani Som',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(62,'Ukrainian Hryvnia','UAH','₴','Ukrainian Hryvnia',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(63,'Belarusian Ruble','BYN','Br','Belarusian Ruble',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(64,'Moldovan Leu','MDL','L','Moldovan Leu',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(65,'Georgian Lari','GEL','₾','Georgian Lari',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(66,'Armenian Dram','AMD','֏','Armenian Dram',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(67,'Azerbaijani Manat','AZN','₼','Azerbaijani Manat',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(68,'Icelandic Krona','ISK','kr','Icelandic Krona',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(69,'Albanian Lek','ALL','L','Albanian Lek',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(70,'Serbian Dinar','RSD','дин','Serbian Dinar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(71,'Bosnian Mark','BAM','KM','Bosnian Mark',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(72,'North Macedonian Denar','MKD','ден','North Macedonian Denar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(73,'Ethiopian Birr','ETB','Br','Ethiopian Birr',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(74,'Ghanaian Cedi','GHS','₵','Ghanaian Cedi',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(75,'Tanzanian Shilling','TZS','TSh','Tanzanian Shilling',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(76,'Ugandan Shilling','UGX','USh','Ugandan Shilling',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(77,'Zambian Kwacha','ZMW','ZK','Zambian Kwacha',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(78,'Botswana Pula','BWP','P','Botswana Pula',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(79,'Namibian Dollar','NAD','N$','Namibian Dollar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(80,'Mauritian Rupee','MUR','₨','Mauritian Rupee',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(81,'Seychellois Rupee','SCR','₨','Seychellois Rupee',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(82,'Maldivian Rufiyaa','MVR','.ރ','Maldivian Rufiyaa',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(83,'Fijian Dollar','FJD','FJ$','Fijian Dollar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(84,'Papua New Guinean Kina','PGK','K','Papua New Guinean Kina',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(85,'Tongan Paʻanga','TOP','T$','Tongan Paʻanga',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(86,'Samoan Tala','WST','T','Samoan Tala',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(87,'Vanuatu Vatu','VUV','VT','Vanuatu Vatu',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(88,'Solomon Islands Dollar','SBD','SI$','Solomon Islands Dollar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(89,'Brunei Dollar','BND','B$','Brunei Dollar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(90,'East Caribbean Dollar','XCD','EC$','East Caribbean Dollar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(91,'Barbadian Dollar','BBD','Bds$','Barbadian Dollar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(92,'Jamaican Dollar','JMD','J$','Jamaican Dollar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(93,'Trinidad and Tobago Dollar','TTD','TT$','Trinidad and Tobago Dollar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(94,'Bahamian Dollar','BSD','B$','Bahamian Dollar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(95,'Belize Dollar','BZD','BZ$','Belize Dollar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(96,'Costa Rican Colon','CRC','₡','Costa Rican Colon',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(97,'Guatemalan Quetzal','GTQ','Q','Guatemalan Quetzal',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(98,'Honduran Lempira','HNL','L','Honduran Lempira',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(99,'Nicaraguan Cordoba','NIO','C$','Nicaraguan Cordoba',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(100,'Panamanian Balboa','PAB','B/.','Panamanian Balboa',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(101,'Dominican Peso','DOP','RD$','Dominican Peso',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(102,'Haitian Gourde','HTG','G','Haitian Gourde',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(103,'Cuban Peso','CUP','₱','Cuban Peso',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(104,'Bolivian Boliviano','BOB','$b','Bolivian Boliviano',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(105,'Paraguayan Guarani','PYG','Gs','Paraguayan Guarani',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(106,'Guyanese Dollar','GYD','G$','Guyanese Dollar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(107,'Surinamese Dollar','SRD','Sr$','Surinamese Dollar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(108,'Venezuelan Bolivar','VES','Bs.S','Venezuelan Bolivar',0,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(109,'Ecuadorian Sucre','ECS','S/.','Ecuadorian Sucre',0,'2026-03-09 13:00:39','2026-03-09 13:00:39');
/*!40000 ALTER TABLE `currencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_template_langs`
--

DROP TABLE IF EXISTS `email_template_langs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_template_langs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint(20) unsigned NOT NULL,
  `lang` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `email_template_langs_parent_id_foreign` (`parent_id`),
  CONSTRAINT `email_template_langs_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `email_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=145 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_template_langs`
--

LOCK TABLES `email_template_langs` WRITE;
/*!40000 ALTER TABLE `email_template_langs` DISABLE KEYS */;
INSERT INTO `email_template_langs` VALUES
(1,1,'en','You have been invited to join {workspace_name}','<h2>You have been invited to a workspace!</h2><p>Hello <strong>{user_name}</strong>,</p><p>You have been invited by <strong>{invited_by_name}</strong> to join the workspace \"<strong>{workspace_name}</strong>\".</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Invited by:</strong> {invited_by_name}</p><p><strong>Role:</strong> {role}</p><p>Click the button below to accept the invitation:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">Accept Invitation</a></p><p>After accepting, you can start collaborating with your team members in this workspace.</p><p>Best regards,<br><strong>The {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(2,1,'es','Has sido invitado a unirte a {workspace_name}','<h2>¡Has sido invitado a un espacio de trabajo!</h2><p>Hola <strong>{user_name}</strong>,</p><p>Has sido invitado por <strong>{invited_by_name}</strong> a unirte al espacio de trabajo \"<strong>{workspace_name}</strong>\".</p><p><strong>Espacio de trabajo:</strong> {workspace_name}</p><p><strong>Invitado por:</strong> {invited_by_name}</p><p><strong>Rol:</strong> {role}</p><p>Haz clic en el botón de abajo para aceptar la invitación:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">Aceptar Invitación</a></p><p>Después de aceptar, puedes comenzar a colaborar con los miembros de tu equipo en este espacio de trabajo.</p><p>Saludos cordiales,<br><strong>El equipo de {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(3,1,'ar','تمت دعوتك للانضمام إلى {workspace_name}','<h2>تمت دعوتك إلى مساحة عمل!</h2><p>مرحباً <strong>{user_name}</strong>،</p><p>تمت دعوتك من قبل <strong>{invited_by_name}</strong> للانضمام إلى مساحة العمل \"<strong>{workspace_name}</strong>\".</p><p><strong>مساحة العمل:</strong> {workspace_name}</p><p><strong>دعوة من:</strong> {invited_by_name}</p><p><strong>الدور:</strong> {role}</p><p>انقر على الزر أدناه لقبول الدعوة:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">قبول الدعوة</a></p><p>بعد القبول، يمكنك البدء في التعاون مع أعضاء فريقك في مساحة العمل هذه.</p><p>أطيب التحيات،<br><strong>فريق {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(4,1,'da','Du er blevet inviteret til at deltage i {workspace_name}','<h2>Du er blevet inviteret til et arbejdsområde!</h2><p>Hej <strong>{user_name}</strong>,</p><p>Du er blevet inviteret af <strong>{invited_by_name}</strong> til at deltage i arbejdsområdet \"<strong>{workspace_name}</strong>\".</p><p><strong>Arbejdsområde:</strong> {workspace_name}</p><p><strong>Inviteret af:</strong> {invited_by_name}</p><p><strong>Rolle:</strong> {role}</p><p>Klik på knappen nedenfor for at acceptere invitationen:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">Accepter invitation</a></p><p>Efter at have accepteret kan du begynde at samarbejde med dine teammedlemmer i dette arbejdsområde.</p><p>Med venlig hilsen,<br><strong>{app_name} Teamet</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(5,1,'de','Sie wurden eingeladen, {workspace_name} beizutreten','<h2>Sie wurden zu einem Arbeitsbereich eingeladen!</h2><p>Hallo <strong>{user_name}</strong>,</p><p>Sie wurden von <strong>{invited_by_name}</strong> eingeladen, dem Arbeitsbereich \"<strong>{workspace_name}</strong>\" beizutreten.</p><p><strong>Arbeitsbereich:</strong> {workspace_name}</p><p><strong>Eingeladen von:</strong> {invited_by_name}</p><p><strong>Rolle:</strong> {role}</p><p>Klicken Sie auf die Schaltfläche unten, um die Einladung anzunehmen:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">Einladung annehmen</a></p><p>Nach der Annahme können Sie mit der Zusammenarbeit mit Ihren Teammitgliedern in diesem Arbeitsbereich beginnen.</p><p>Mit freundlichen Grüßen,<br><strong>Das {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(6,1,'fr','Vous avez été invité à rejoindre {workspace_name}','<h2>Vous avez été invité à un espace de travail!</h2><p>Bonjour <strong>{user_name}</strong>,</p><p>Vous avez été invité par <strong>{invited_by_name}</strong> à rejoindre l\'espace de travail \"<strong>{workspace_name}</strong>\".</p><p><strong>Espace de travail:</strong> {workspace_name}</p><p><strong>Invité par:</strong> {invited_by_name}</p><p><strong>Rôle:</strong> {role}</p><p>Cliquez sur le bouton ci-dessous pour accepter l\'invitation:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">Accepter l\'invitation</a></p><p>Après avoir accepté, vous pouvez commencer à collaborer avec les membres de votre équipe dans cet espace de travail.</p><p>Cordialement,<br><strong>L\'équipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(7,1,'he','הוזמנת להצטרף ל-{workspace_name}','<h2>הוזמנת לסביבת עבודה!</h2><p>שלום <strong>{user_name}</strong>,</p><p>הוזמנת על ידי <strong>{invited_by_name}</strong> להצטרף לסביבת העבודה \"<strong>{workspace_name}</strong>\".</p><p><strong>סביבת עבודה:</strong> {workspace_name}</p><p><strong>הוזמן על ידי:</strong> {invited_by_name}</p><p><strong>תפקיד:</strong> {role}</p><p>לחץ על הכפתור למטה כדי לקבל את ההזמנה:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">קבל הזמנה</a></p><p>לאחר הקבלה, תוכל להתחיל לשתף פעולה עם חברי הצוות שלך בסביבת העבודה הזו.</p><p>בברכה,<br><strong>צוות {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(8,1,'it','Sei stato invitato a unirti a {workspace_name}','<h2>Sei stato invitato a un workspace!</h2><p>Ciao <strong>{user_name}</strong>,</p><p>Sei stato invitato da <strong>{invited_by_name}</strong> a unirti al workspace \"<strong>{workspace_name}</strong>\".</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Invitato da:</strong> {invited_by_name}</p><p><strong>Ruolo:</strong> {role}</p><p>Clicca sul pulsante qui sotto per accettare l\'invito:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">Accetta invito</a></p><p>Dopo aver accettato, puoi iniziare a collaborare con i membri del tuo team in questo workspace.</p><p>Cordiali saluti,<br><strong>Il team di {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(9,1,'ja','{workspace_name}への参加招待','<h2>ワークスペースに招待されました！</h2><p>こんにちは <strong>{user_name}</strong> さん、</p><p><strong>{invited_by_name}</strong> さんからワークスペース \"<strong>{workspace_name}</strong>\" への参加招待を受けました。</p><p><strong>ワークスペース:</strong> {workspace_name}</p><p><strong>招待者:</strong> {invited_by_name}</p><p><strong>役割:</strong> {role}</p><p>下のボタンをクリックして招待を受け入れてください:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">招待を受け入れる</a></p><p>受け入れ後、このワークスペースでチームメンバーとの協力を開始できます。</p><p>よろしくお願いいたします、<br><strong>{app_name} チーム</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(10,1,'nl','Je bent uitgenodigd om lid te worden van {workspace_name}','<h2>Je bent uitgenodigd voor een werkruimte!</h2><p>Hallo <strong>{user_name}</strong>,</p><p>Je bent uitgenodigd door <strong>{invited_by_name}</strong> om lid te worden van de werkruimte \"<strong>{workspace_name}</strong>\".</p><p><strong>Werkruimte:</strong> {workspace_name}</p><p><strong>Uitgenodigd door:</strong> {invited_by_name}</p><p><strong>Rol:</strong> {role}</p><p>Klik op de knop hieronder om de uitnodiging te accepteren:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">Uitnodiging accepteren</a></p><p>Na acceptatie kun je beginnen met samenwerken met je teamleden in deze werkruimte.</p><p>Met vriendelijke groet,<br><strong>Het {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(11,1,'pl','Zostałeś zaproszony do dołączenia do {workspace_name}','<h2>Zostałeś zaproszony do przestrzeni roboczej!</h2><p>Cześć <strong>{user_name}</strong>,</p><p>Zostałeś zaproszony przez <strong>{invited_by_name}</strong> do dołączenia do przestrzeni roboczej \"<strong>{workspace_name}</strong>\".</p><p><strong>Przestrzeń robocza:</strong> {workspace_name}</p><p><strong>Zaproszony przez:</strong> {invited_by_name}</p><p><strong>Rola:</strong> {role}</p><p>Kliknij przycisk poniżej, aby zaakceptować zaproszenie:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">Zaakceptuj zaproszenie</a></p><p>Po zaakceptowaniu możesz rozpocząć współpracę z członkami zespołu w tej przestrzeni roboczej.</p><p>Z poważaniem,<br><strong>Zespół {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(12,1,'pt','Você foi convidado para se juntar a {workspace_name}','<h2>Você foi convidado para um espaço de trabalho!</h2><p>Olá <strong>{user_name}</strong>,</p><p>Você foi convidado por <strong>{invited_by_name}</strong> para se juntar ao espaço de trabalho \"<strong>{workspace_name}</strong>\".</p><p><strong>Espaço de trabalho:</strong> {workspace_name}</p><p><strong>Convidado por:</strong> {invited_by_name}</p><p><strong>Função:</strong> {role}</p><p>Clique no botão abaixo para aceitar o convite:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">Aceitar convite</a></p><p>Após aceitar, você pode começar a colaborar com os membros da sua equipe neste espaço de trabalho.</p><p>Atenciosamente,<br><strong>A equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(13,1,'pt-BR','Você foi convidado para se juntar a {workspace_name}','<h2>Você foi convidado para um espaço de trabalho!</h2><p>Olá <strong>{user_name}</strong>,</p><p>Você foi convidado por <strong>{invited_by_name}</strong> para se juntar ao espaço de trabalho \"<strong>{workspace_name}</strong>\".</p><p><strong>Espaço de trabalho:</strong> {workspace_name}</p><p><strong>Convidado por:</strong> {invited_by_name}</p><p><strong>Função:</strong> {role}</p><p>Clique no botão abaixo para aceitar o convite:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">Aceitar convite</a></p><p>Após aceitar, você pode começar a colaborar com os membros da sua equipe neste espaço de trabalho.</p><p>Atenciosamente,<br><strong>A equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(14,1,'ru','Вас пригласили присоединиться к {workspace_name}','<h2>Вас пригласили в рабочее пространство!</h2><p>Привет <strong>{user_name}</strong>,</p><p>Вас пригласил <strong>{invited_by_name}</strong> присоединиться к рабочему пространству \"<strong>{workspace_name}</strong>\".</p><p><strong>Рабочее пространство:</strong> {workspace_name}</p><p><strong>Пригласил:</strong> {invited_by_name}</p><p><strong>Роль:</strong> {role}</p><p>Нажмите кнопку ниже, чтобы принять приглашение:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">Принять приглашение</a></p><p>После принятия вы сможете начать сотрудничество с членами вашей команды в этом рабочем пространстве.</p><p>С наилучшими пожеланиями,<br><strong>Команда {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(15,1,'tr','{workspace_name} çalışma alanına katılmaya davet edildiniz','<h2>Bir çalışma alanına davet edildiniz!</h2><p>Merhaba <strong>{user_name}</strong>,</p><p><strong>{invited_by_name}</strong> tarafından \"<strong>{workspace_name}</strong>\" çalışma alanına katılmaya davet edildiniz.</p><p><strong>Çalışma alanı:</strong> {workspace_name}</p><p><strong>Davet eden:</strong> {invited_by_name}</p><p><strong>Rol:</strong> {role}</p><p>Daveti kabul etmek için aşağıdaki düğmeye tıklayın:</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">Daveti Kabul Et</a></p><p>Kabul ettikten sonra, bu çalışma alanında ekip üyelerinizle işbirliği yapmaya başlayabilirsiniz.</p><p>Saygılarımızla,<br><strong>{app_name} Ekibi</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(16,1,'zh','您被邀请加入 {workspace_name}','<h2>您被邀请加入工作空间！</h2><p>您好 <strong>{user_name}</strong>，</p><p><strong>{invited_by_name}</strong> 邀请您加入工作空间 \"<strong>{workspace_name}</strong>\"。</p><p><strong>工作空间：</strong> {workspace_name}</p><p><strong>邀请人：</strong> {invited_by_name}</p><p><strong>角色：</strong> {role}</p><p>点击下面的按钮接受邀请：</p><p><a href=\"{invitation_link}\" style=\"background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">接受邀请</a></p><p>接受后，您可以开始与团队成员在此工作空间中协作。</p><p>此致敬礼，<br><strong>{app_name} 团队</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(17,2,'en','You have been assigned to project {project_name} in {workspace_name}','<h2>You have been assigned to a project!</h2><p>Hello <strong>{assigned_user_name}</strong>,</p><p>You have been assigned by <strong>{assigned_by_name}</strong> to the project \"<strong>{project_name}</strong>\" as a <strong>{role}</strong>.</p><p><strong>Project:</strong> {project_name}</p><p><strong>Your Role:</strong> {role}</p><p><strong>Assigned By:</strong> {assigned_by_name}</p><p><strong>Description:</strong> {project_description}</p><p>You can now access this project and start collaborating with your team.</p><p>Best regards,<br><strong>The {company_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(18,2,'es','Se le ha asignado al proyecto {project_name} en {workspace_name}','<h2>¡Se le ha asignado a un proyecto!</h2><p>Hola <strong>{user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> le ha asignado al proyecto \"<strong>{project_name}</strong>\" como <strong>{role}</strong>.</p><p><strong>Proyecto:</strong> {project_name}</p><p><strong>Espacio de trabajo:</strong> {workspace_name}</p><p><strong>Su rol:</strong> {role}</p><p><strong>Asignado por:</strong> {assigned_by_name}</p><p><strong>Descripción:</strong> {project_description}</p><p>Ahora puede acceder a este proyecto y comenzar a colaborar con su equipo.</p><p>Saludos cordiales,<br><strong>El equipo de {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(19,2,'ar','تم تعيينك إلى المشروع {project_name} في {workspace_name}','<h2>تم تعيينك إلى مشروع!</h2><p>مرحباً <strong>{user_name}</strong>,</p><p>لقد قام <strong>{assigned_by_name}</strong> بتعيينك في المشروع \"<strong>{project_name}</strong>\" كـ<strong>{role}</strong>.</p><p><strong>المشروع:</strong> {project_name}</p><p><strong>مساحة العمل:</strong> {workspace_name}</p><p><strong>دورك:</strong> {role}</p><p><strong>المعين بواسطة:</strong> {assigned_by_name}</p><p><strong>الوصف:</strong> {project_description}</p><p>يمكنك الآن الوصول إلى هذا المشروع والبدء في التعاون مع فريقك.</p><p>مع أطيب التحيات,<br><strong>فريق {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(20,2,'da','Du er blevet tildelt projektet {project_name} i {workspace_name}','<h2>Du er blevet tildelt et projekt!</h2><p>Hej <strong>{user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> har tildelt dig til projektet \"<strong>{project_name}</strong>\" som <strong>{role}</strong>.</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Arbejdsområde:</strong> {workspace_name}</p><p><strong>Din rolle:</strong> {role}</p><p><strong>Tildelt af:</strong> {assigned_by_name}</p><p><strong>Beskrivelse:</strong> {project_description}</p><p>Du kan nu få adgang til dette projekt og begynde at samarbejde med dit team.</p><p>Venlig hilsen,<br><strong>{app_name} Teamet</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(21,2,'de','Sie wurden dem Projekt {project_name} in {workspace_name} zugewiesen','<h2>Ihnen wurde ein Projekt zugewiesen!</h2><p>Hallo <strong>{user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> hat Sie dem Projekt \"<strong>{project_name}</strong>\" als <strong>{role}</strong> zugewiesen.</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Arbeitsbereich:</strong> {workspace_name}</p><p><strong>Ihre Rolle:</strong> {role}</p><p><strong>Zugewiesen von:</strong> {assigned_by_name}</p><p><strong>Beschreibung:</strong> {project_description}</p><p>Sie können nun auf dieses Projekt zugreifen und mit Ihrem Team zusammenarbeiten.</p><p>Mit freundlichen Grüßen,<br><strong>Das {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(22,2,'fr','Vous avez été assigné au projet {project_name} dans {workspace_name}','<h2>Vous avez été assigné à un projet !</h2><p>Bonjour <strong>{user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> vous a assigné au projet \"<strong>{project_name}</strong>\" en tant que <strong>{role}</strong>.</p><p><strong>Projet :</strong> {project_name}</p><p><strong>Espace de travail :</strong> {workspace_name}</p><p><strong>Votre rôle :</strong> {role}</p><p><strong>Assigné par :</strong> {assigned_by_name}</p><p><strong>Description :</strong> {project_description}</p><p>Vous pouvez maintenant accéder à ce projet et commencer à collaborer avec votre équipe.</p><p>Cordialement,<br><strong>L\'équipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(23,2,'he','הוקצתה לך לפרויקט {project_name} ב-{workspace_name}','<h2>הוקצתה לך לפרויקט!</h2><p>שלום <strong>{user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> הקצה אותך לפרויקט \"<strong>{project_name}</strong>\" בתפקיד <strong>{role}</strong>.</p><p><strong>פרויקט:</strong> {project_name}</p><p><strong>סביבת עבודה:</strong> {workspace_name}</p><p><strong>תפקידך:</strong> {role}</p><p><strong>הוקצה על ידי:</strong> {assigned_by_name}</p><p><strong>תיאור:</strong> {project_description}</p><p>כעת תוכל לגשת לפרויקט זה ולהתחיל לשתף פעולה עם הצוות שלך.</p><p>בברכה,<br><strong>צוות {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(24,2,'it','Sei stato assegnato al progetto {project_name} in {workspace_name}','<h2>Sei stato assegnato a un progetto!</h2><p>Ciao <strong>{user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> ti ha assegnato al progetto \"<strong>{project_name}</strong>\" come <strong>{role}</strong>.</p><p><strong>Progetto:</strong> {project_name}</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Il tuo ruolo:</strong> {role}</p><p><strong>Assegnato da:</strong> {assigned_by_name}</p><p><strong>Descrizione:</strong> {project_description}</p><p>Ora puoi accedere a questo progetto e iniziare a collaborare con il tuo team.</p><p>Cordiali saluti,<br><strong>Il team di {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(25,2,'ja','{workspace_name}でプロジェクト {project_name} に割り当てられました','<h2>プロジェクトが割り当てられました！</h2><p>こんにちは <strong>{user_name}</strong> さん、</p><p><strong>{assigned_by_name}</strong> があなたをプロジェクト \"<strong>{project_name}</strong>\" に <strong>{role}</strong> として割り当てました。</p><p><strong>プロジェクト:</strong> {project_name}</p><p><strong>ワークスペース:</strong> {workspace_name}</p><p><strong>あなたの役割:</strong> {role}</p><p><strong>割り当て者:</strong> {assigned_by_name}</p><p><strong>説明:</strong> {project_description}</p><p>このプロジェクトにアクセスして、チームと協力を開始できます。</p><p>よろしくお願いいたします,<br><strong>{app_name} チーム</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(26,2,'nl','U bent toegewezen aan project {project_name} in {workspace_name}','<h2>U bent toegewezen aan een project!</h2><p>Hallo <strong>{user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> heeft u toegewezen aan het project \"<strong>{project_name}</strong>\" als <strong>{role}</strong>.</p><p><strong>Project:</strong> {project_name}</p><p><strong>Werkruimte:</strong> {workspace_name}</p><p><strong>Uw rol:</strong> {role}</p><p><strong>Toegewezen door:</strong> {assigned_by_name}</p><p><strong>Beschrijving:</strong> {project_description}</p><p>U kunt nu toegang krijgen tot dit project en beginnen samen te werken met uw team.</p><p>Met vriendelijke groet,<br><strong>Het {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(27,2,'pl','Zostałeś przypisany do projektu {project_name} w {workspace_name}','<h2>Zostałeś przypisany do projektu!</h2><p>Cześć <strong>{user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> przypisał Cię do projektu \"<strong>{project_name}</strong>\" jako <strong>{role}</strong>.</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Twoja rola:</strong> {role}</p><p><strong>Przypisane przez:</strong> {assigned_by_name}</p><p><strong>Opis:</strong> {project_description}</p><p>Możesz teraz uzyskać dostęp do tego projektu i rozpocząć współpracę z zespołem.</p><p>Z poważaniem,<br><strong>Zespół {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(28,2,'pt','Você foi designado ao projeto {project_name} em {workspace_name}','<h2>Você foi designado a um projeto!</h2><p>Olá <strong>{user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> designou você ao projeto \"<strong>{project_name}</strong>\" como <strong>{role}</strong>.</p><p><strong>Projeto:</strong> {project_name}</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Seu papel:</strong> {role}</p><p><strong>Designado por:</strong> {assigned_by_name}</p><p><strong>Descrição:</strong> {project_description}</p><p>Agora você pode acessar este projeto e começar a colaborar com sua equipe.</p><p>Atenciosamente,<br><strong>A equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(29,2,'pt-BR','Você foi designado ao projeto {project_name} em {workspace_name}','<h2>Você foi designado a um projeto!</h2><p>Olá <strong>{user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> designou você ao projeto \"<strong>{project_name}</strong>\" como <strong>{role}</strong>.</p><p><strong>Projeto:</strong> {project_name}</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Seu papel:</strong> {role}</p><p><strong>Designado por:</strong> {assigned_by_name}</p><p><strong>Descrição:</strong> {project_description}</p><p>Agora você pode acessar este projeto e começar a colaborar com sua equipe.</p><p>Atenciosamente,<br><strong>A equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(30,2,'ru','Вам назначен проект {project_name} в {workspace_name}','<h2>Вам назначен проект!</h2><p>Здравствуйте <strong>{user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> назначил вас в проект \"<strong>{project_name}</strong>\" как <strong>{role}</strong>.</p><p><strong>Проект:</strong> {project_name}</p><p><strong>Рабочее пространство:</strong> {workspace_name}</p><p><strong>Ваша роль:</strong> {role}</p><p><strong>Назначено:</strong> {assigned_by_name}</p><p><strong>Описание:</strong> {project_description}</p><p>Теперь вы можете получить доступ к этому проекту и начать сотрудничество с вашей командой.</p><p>С уважением,<br><strong>Команда {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(31,2,'tr','{workspace_name} içinde {project_name} projesine atandınız','<h2>Bir projeye atandınız!</h2><p>Merhaba <strong>{user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> sizi \"<strong>{project_name}</strong>\" projesine <strong>{role}</strong> olarak atadı.</p><p><strong>Proje:</strong> {project_name}</p><p><strong>Çalışma Alanı:</strong> {workspace_name}</p><p><strong>Rolünüz:</strong> {role}</p><p><strong>Atayan:</strong> {assigned_by_name}</p><p><strong>Açıklama:</strong> {project_description}</p><p>Artık bu projeye erişebilir ve ekibinizle iş birliğine başlayabilirsiniz.</p><p>Saygılarımızla,<br><strong>{app_name} Ekibi</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(32,2,'zh','您已被分配到 {workspace_name} 中的项目 {project_name}','<h2>您已被分配到一个项目！</h2><p>您好 <strong>{user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> 已将您分配到项目 \"<strong>{project_name}</strong>\"，角色为 <strong>{role}</strong>。</p><p><strong>项目:</strong> {project_name}</p><p><strong>工作区:</strong> {workspace_name}</p><p><strong>您的角色:</strong> {role}</p><p><strong>分配人:</strong> {assigned_by_name}</p><p><strong>描述:</strong> {project_description}</p><p>您现在可以访问该项目并开始与团队合作。</p><p>此致敬礼,<br><strong>{app_name} 团队</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(33,3,'en','You have been assigned to a task in {project_name}','<h2>You have been assigned to a task!</h2><p>Hello <strong>{assigned_user_name}</strong>,</p><p>You have been assigned by <strong>{assigned_by_name}</strong> to the task \"<strong>{task_title}</strong>\" in project <strong>{project_name}</strong>.</p><p><strong>Task:</strong> {task_title}</p><p><strong>Project:</strong> {project_name}</p><p><strong>Priority:</strong> {task_priority}</p><p><strong>Start Date:</strong> {start_date}</p><p><strong>End Date:</strong> {end_date}</p><p><strong>Assigned By:</strong> {assigned_by_name}</p><p><strong>Description:</strong> {task_description}</p><p>You can now access this task and start working on it. Please log in to your account to view the task details.</p><p>Best regards,<br><strong>The {company_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(34,3,'es','Se le ha asignado una tarea en {project_name}','<h2>¡Se le ha asignado una tarea!</h2><p>Hola <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> le ha asignado la tarea \"<strong>{task_title}</strong>\" en el proyecto <strong>{project_name}</strong>.</p><p><strong>Tarea:</strong> {task_title}</p><p><strong>Proyecto:</strong> {project_name}</p><p><strong>Espacio de trabajo:</strong> {project_name}</p><p><strong>Prioridad:</strong> {task_priority}</p><p><strong>Fecha de inicio:</strong> {start_date}</p><p><strong>Fecha de finalización:</strong> {end_date}</p><p><strong>Asignado por:</strong> {assigned_by_name}</p><p><strong>Descripción:</strong> {task_description}</p><p>Ahora puede acceder a esta tarea y comenzar a trabajar en ella. Inicie sesión en su cuenta para ver los detalles.</p><p>Saludos cordiales,<br><strong>El equipo de {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(35,3,'ar','تم تعيينك لمهمة في {project_name}','<h2>تم تعيينك لمهمة!</h2><p>مرحباً <strong>{assigned_user_name}</strong>,</p><p>لقد تم تعيينك من قبل <strong>{assigned_by_name}</strong> للمهمة \"<strong>{task_title}</strong>\" في المشروع <strong>{project_name}</strong>.</p><p><strong>المهمة:</strong> {task_title}</p><p><strong>المشروع:</strong> {project_name}</p><p><strong>مساحة العمل:</strong> {project_name}</p><p><strong>الأولوية:</strong> {task_priority}</p><p><strong>تاريخ البدء:</strong> {start_date}</p><p><strong>تاريخ الانتهاء:</strong> {end_date}</p><p><strong>المُعين بواسطة:</strong> {assigned_by_name}</p><p><strong>الوصف:</strong> {task_description}</p><p>يمكنك الآن الوصول إلى هذه المهمة والبدء بالعمل عليها. يرجى تسجيل الدخول إلى حسابك لعرض التفاصيل.</p><p>مع أطيب التحيات,<br><strong>فريق {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(36,3,'da','Du er blevet tildelt en opgave i {project_name}','<h2>Du er blevet tildelt en opgave!</h2><p>Hej <strong>{assigned_user_name}</strong>,</p><p>Du er blevet tildelt af <strong>{assigned_by_name}</strong> til opgaven \"<strong>{task_title}</strong>\" i projektet <strong>{project_name}</strong>.</p><p><strong>Opgave:</strong> {task_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Arbejdsområde:</strong> {project_name}</p><p><strong>Prioritet:</strong> {task_priority}</p><p><strong>Startdato:</strong> {start_date}</p><p><strong>Slutdato:</strong> {end_date}</p><p><strong>Tildelt af:</strong> {assigned_by_name}</p><p><strong>Beskrivelse:</strong> {task_description}</p><p>Du kan nu få adgang til denne opgave og begynde at arbejde på den. Log ind for at se detaljerne.</p><p>Venlig hilsen,<br><strong>{company_name} Teamet</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(37,3,'de','Ihnen wurde eine Aufgabe in {project_name} zugewiesen','<h2>Ihnen wurde eine Aufgabe zugewiesen!</h2><p>Hallo <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> hat Ihnen die Aufgabe \"<strong>{task_title}</strong>\" im Projekt <strong>{project_name}</strong> zugewiesen.</p><p><strong>Aufgabe:</strong> {task_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Arbeitsbereich:</strong> {project_name}</p><p><strong>Priorität:</strong> {task_priority}</p><p><strong>Startdatum:</strong> {start_date}</p><p><strong>Enddatum:</strong> {end_date}</p><p><strong>Zugewiesen von:</strong> {assigned_by_name}</p><p><strong>Beschreibung:</strong> {task_description}</p><p>Sie können nun auf diese Aufgabe zugreifen und mit der Arbeit beginnen. Bitte melden Sie sich an, um die Details zu sehen.</p><p>Mit freundlichen Grüßen,<br><strong>Das {company_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(38,3,'fr','Une tâche vous a été assignée dans {project_name}','<h2>Une tâche vous a été assignée !</h2><p>Bonjour <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> vous a assigné la tâche \"<strong>{task_title}</strong>\" dans le projet <strong>{project_name}</strong>.</p><p><strong>Tâche :</strong> {task_title}</p><p><strong>Projet :</strong> {project_name}</p><p><strong>Espace de travail :</strong> {project_name}</p><p><strong>Priorité :</strong> {task_priority}</p><p><strong>Date de début :</strong> {start_date}</p><p><strong>Date de fin :</strong> {end_date}</p><p><strong>Assigné par :</strong> {assigned_by_name}</p><p><strong>Description :</strong> {task_description}</p><p>Vous pouvez maintenant accéder à cette tâche et commencer à travailler dessus. Connectez-vous à votre compte pour voir les détails.</p><p>Cordialement,<br><strong>L\'équipe {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(39,3,'he','הוקצתה לך משימה ב-{project_name}','<h2>הוקצתה לך משימה!</h2><p>שלום <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> הקצה לך את המשימה \"<strong>{task_title}</strong>\" בפרויקט <strong>{project_name}</strong>.</p><p><strong>משימה:</strong> {task_title}</p><p><strong>פרויקט:</strong> {project_name}</p><p><strong>סביבת עבודה:</strong> {project_name}</p><p><strong>עדיפות:</strong> {task_priority}</p><p><strong>תאריך התחלה:</strong> {start_date}</p><p><strong>תאריך סיום:</strong> {end_date}</p><p><strong>הוקצה על ידי:</strong> {assigned_by_name}</p><p><strong>תיאור:</strong> {task_description}</p><p>כעת תוכל לגשת למשימה זו ולהתחיל לעבוד עליה. אנא היכנס לחשבונך כדי לצפות בפרטי המשימה.</p><p>בברכה,<br><strong>צוות {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(40,3,'it','Ti è stato assegnato un compito in {project_name}','<h2>Ti è stato assegnato un compito!</h2><p>Ciao <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> ti ha assegnato il compito \"<strong>{task_title}</strong>\" nel progetto <strong>{project_name}</strong>.</p><p><strong>Compito:</strong> {task_title}</p><p><strong>Progetto:</strong> {project_name}</p><p><strong>Workspace:</strong> {project_name}</p><p><strong>Priorità:</strong> {task_priority}</p><p><strong>Data di inizio:</strong> {start_date}</p><p><strong>Data di fine:</strong> {end_date}</p><p><strong>Assegnato da:</strong> {assigned_by_name}</p><p><strong>Descrizione:</strong> {task_description}</p><p>Ora puoi accedere a questo compito e iniziare a lavorarci. Accedi al tuo account per vedere i dettagli.</p><p>Cordiali saluti,<br><strong>Il team di {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(41,3,'ja','{project_name}でタスクが割り当てられました','<h2>タスクが割り当てられました！</h2><p>こんにちは <strong>{assigned_user_name}</strong> さん、</p><p><strong>{assigned_by_name}</strong> がプロジェクト <strong>{project_name}</strong> 内のタスク \"<strong>{task_title}</strong>\" をあなたに割り当てました。</p><p><strong>タスク:</strong> {task_title}</p><p><strong>プロジェクト:</strong> {project_name}</p><p><strong>ワークスペース:</strong> {project_name}</p><p><strong>優先度:</strong> {task_priority}</p><p><strong>開始日:</strong> {start_date}</p><p><strong>終了日:</strong> {end_date}</p><p><strong>割り当て者:</strong> {assigned_by_name}</p><p><strong>説明:</strong> {task_description}</p><p>このタスクにアクセスして作業を開始できます。詳細を見るにはアカウントにログインしてください。</p><p>よろしくお願いいたします,<br><strong>{company_name} チーム</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(42,3,'nl','U bent toegewezen aan een taak in {project_name}','<h2>U bent toegewezen aan een taak!</h2><p>Hallo <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> heeft u toegewezen aan de taak \"<strong>{task_title}</strong>\" in het project <strong>{project_name}</strong>.</p><p><strong>Taak:</strong> {task_title}</p><p><strong>Project:</strong> {project_name}</p><p><strong>Werkruimte:</strong> {project_name}</p><p><strong>Prioriteit:</strong> {task_priority}</p><p><strong>Startdatum:</strong> {start_date}</p><p><strong>Einddatum:</strong> {end_date}</p><p><strong>Toegewezen door:</strong> {assigned_by_name}</p><p><strong>Beschrijving:</strong> {task_description}</p><p>U kunt nu toegang krijgen tot deze taak en ermee aan de slag gaan. Log in om de details te bekijken.</p><p>Met vriendelijke groet,<br><strong>Het {company_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(43,3,'pl','Przypisano Ci zadanie w {project_name}','<h2>Przypisano Ci zadanie!</h2><p>Cześć <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> przypisał Ci zadanie \"<strong>{task_title}</strong>\" w projekcie <strong>{project_name}</strong>.</p><p><strong>Zadanie:</strong> {task_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Workspace:</strong> {project_name}</p><p><strong>Priorytet:</strong> {task_priority}</p><p><strong>Data rozpoczęcia:</strong> {start_date}</p><p><strong>Data zakończenia:</strong> {end_date}</p><p><strong>Przypisane przez:</strong> {assigned_by_name}</p><p><strong>Opis:</strong> {task_description}</p><p>Możesz teraz uzyskać dostęp do tego zadania i rozpocząć pracę nad nim. Zaloguj się, aby zobaczyć szczegóły.</p><p>Z poważaniem,<br><strong>Zespół {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(44,3,'pt','Você foi designado para uma tarefa em {project_name}','<h2>Você foi designado para uma tarefa!</h2><p>Olá <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> atribuiu a você a tarefa \"<strong>{task_title}</strong>\" no projeto <strong>{project_name}</strong>.</p><p><strong>Tarefa:</strong> {task_title}</p><p><strong>Projeto:</strong> {project_name}</p><p><strong>Workspace:</strong> {project_name}</p><p><strong>Prioridade:</strong> {task_priority}</p><p><strong>Data de início:</strong> {start_date}</p><p><strong>Data de término:</strong> {end_date}</p><p><strong>Atribuído por:</strong> {assigned_by_name}</p><p><strong>Descrição:</strong> {task_description}</p><p>Agora você pode acessar esta tarefa e começar a trabalhar nela. Faça login para ver os detalhes.</p><p>Atenciosamente,<br><strong>A equipe {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(45,3,'pt-BR','Você foi designado para uma tarefa em {project_name}','<h2>Você foi designado para uma tarefa!</h2><p>Olá <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> atribuiu a você a tarefa \"<strong>{task_title}</strong>\" no projeto <strong>{project_name}</strong>.</p><p><strong>Tarefa:</strong> {task_title}</p><p><strong>Projeto:</strong> {project_name}</p><p><strong>Workspace:</strong> {project_name}</p><p><strong>Prioridade:</strong> {task_priority}</p><p><strong>Data de início:</strong> {start_date}</p><p><strong>Data de término:</strong> {end_date}</p><p><strong>Atribuído por:</strong> {assigned_by_name}</p><p><strong>Descrição:</strong> {task_description}</p><p>Agora você pode acessar esta tarefa e começar a trabalhar nela. Faça login para ver os detalhes.</p><p>Atenciosamente,<br><strong>A equipe {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(46,3,'ru','Вам назначено задание в {project_name}','<h2>Вам назначено задание!</h2><p>Здравствуйте <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> назначил вам задание \"<strong>{task_title}</strong>\" в проекте <strong>{project_name}</strong>.</p><p><strong>Задание:</strong> {task_title}</p><p><strong>Проект:</strong> {project_name}</p><p><strong>Рабочее пространство:</strong> {project_name}</p><p><strong>Приоритет:</strong> {task_priority}</p><p><strong>Дата начала:</strong> {start_date}</p><p><strong>Дата окончания:</strong> {end_date}</p><p><strong>Назначено:</strong> {assigned_by_name}</p><p><strong>Описание:</strong> {task_description}</p><p>Теперь вы можете получить доступ к этому заданию и начать работу над ним. Войдите в свой аккаунт, чтобы просмотреть детали.</p><p>С уважением,<br><strong>Команда {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(47,3,'tr','{project_name} içinde size bir görev atandı','<h2>Size bir görev atandı!</h2><p>Merhaba <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> size \"<strong>{task_title}</strong>\" görevini <strong>{project_name}</strong> projesinde atadı.</p><p><strong>Görev:</strong> {task_title}</p><p><strong>Proje:</strong> {project_name}</p><p><strong>Çalışma Alanı:</strong> {project_name}</p><p><strong>Öncelik:</strong> {task_priority}</p><p><strong>Başlangıç Tarihi:</strong> {start_date}</p><p><strong>Bitiş Tarihi:</strong> {end_date}</p><p><strong>Atayan:</strong> {assigned_by_name}</p><p><strong>Açıklama:</strong> {task_description}</p><p>Artık bu göreve erişebilir ve çalışmaya başlayabilirsiniz. Ayrıntıları görmek için hesabınıza giriş yapın.</p><p>Saygılarımızla,<br><strong>{company_name} Ekibi</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(48,3,'zh','您已被分配任务于 {project_name}','<h2>您已被分配任务！</h2><p>您好 <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> 已将任务 \"<strong>{task_title}</strong>\" 分配给您，所在项目为 <strong>{project_name}</strong>。</p><p><strong>任务:</strong> {task_title}</p><p><strong>项目:</strong> {project_name}</p><p><strong>工作区:</strong> {project_name}</p><p><strong>优先级:</strong> {task_priority}</p><p><strong>开始日期:</strong> {start_date}</p><p><strong>结束日期:</strong> {end_date}</p><p><strong>分配人:</strong> {assigned_by_name}</p><p><strong>描述:</strong> {task_description}</p><p>您现在可以访问此任务并开始工作。请登录您的账户查看详情。</p><p>此致敬礼,<br><strong>{company_name} 团队</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(49,4,'en','You have been assigned to a bug in {workspace_name}','<h2>You have been assigned to a bug!</h2><p>Hello <strong>{assigned_user_name}</strong>,</p><p>You have been assigned by <strong>{assigned_by_name}</strong> to the bug \"<strong>{bug_title}</strong>\" in project <strong>{project_name}</strong>.</p><p><strong>Bug:</strong> {bug_title}</p><p><strong>Project:</strong> {project_name}</p><p><strong>Priority:</strong> {bug_priority}</p><p><strong>Severity:</strong> {bug_severity}</p><p><strong>Start Date:</strong> {start_date}</p><p><strong>End Date:</strong> {end_date}</p><p><strong>Assigned By:</strong> {assigned_by_name}</p><p><strong>Description:</strong> {bug_description}</p><p>You can now access this bug and start working on it. Please log in to your account to view the bug details.</p><p>Best regards,<br><strong>The {company_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(50,4,'es','Se le ha asignado un error en {workspace_name}','<h2>¡Se le ha asignado un error!</h2><p>Hola <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> le ha asignado al error \"<strong>{bug_title}</strong>\" en el proyecto <strong>{project_name}</strong>.</p><p><strong>Error:</strong> {bug_title}</p><p><strong>Proyecto:</strong> {project_name}</p><p><strong>Espacio de trabajo:</strong> {workspace_name}</p><p><strong>Prioridad:</strong> {bug_priority}</p><p><strong>Severidad:</strong> {bug_severity}</p><p><strong>Fecha de inicio:</strong> {start_date}</p><p><strong>Fecha de finalización:</strong> {end_date}</p><p><strong>Asignado por:</strong> {assigned_by_name}</p><p><strong>Descripción:</strong> {bug_description}</p><p>Ahora puede acceder a este error y comenzar a trabajar en él. Por favor, inicie sesión en su cuenta para ver los detalles del error.</p><p>Saludos cordiales,<br><strong>El equipo de {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(51,4,'ar','تم تعيينك على خطأ في {workspace_name}','<h2>تم تعيينك على خطأ!</h2><p>مرحباً <strong>{assigned_user_name}</strong>,</p><p>لقد قام <strong>{assigned_by_name}</strong> بتعيينك على الخطأ \"<strong>{bug_title}</strong>\" في المشروع <strong>{project_name}</strong>.</p><p><strong>الخطأ:</strong> {bug_title}</p><p><strong>المشروع:</strong> {project_name}</p><p><strong>مساحة العمل:</strong> {workspace_name}</p><p><strong>الأولوية:</strong> {bug_priority}</p><p><strong>الخطورة:</strong> {bug_severity}</p><p><strong>تاريخ البداية:</strong> {start_date}</p><p><strong>تاريخ الانتهاء:</strong> {end_date}</p><p><strong>المعين بواسطة:</strong> {assigned_by_name}</p><p><strong>الوصف:</strong> {bug_description}</p><p>يمكنك الآن الوصول إلى هذا الخطأ وبدء العمل عليه. الرجاء تسجيل الدخول لمشاهدة تفاصيل الخطأ.</p><p>مع أطيب التحيات,<br><strong>فريق {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(52,4,'da','Du er blevet tildelt en fejl i {workspace_name}','<h2>Du er blevet tildelt en fejl!</h2><p>Hej <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> har tildelt dig fejlen \"<strong>{bug_title}</strong>\" i projektet <strong>{project_name}</strong>.</p><p><strong>Fejl:</strong> {bug_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Arbejdsområde:</strong> {workspace_name}</p><p><strong>Prioritet:</strong> {bug_priority}</p><p><strong>Alvorlighed:</strong> {bug_severity}</p><p><strong>Startdato:</strong> {start_date}</p><p><strong>Slutdato:</strong> {end_date}</p><p><strong>Tildelt af:</strong> {assigned_by_name}</p><p><strong>Beskrivelse:</strong> {bug_description}</p><p>Du kan nu få adgang til denne fejl og begynde at arbejde på den. Log ind på din konto for at se fejlens detaljer.</p><p>Venlig hilsen,<br><strong>{company_name} Teamet</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(53,4,'de','Sie wurden einem Fehler in {workspace_name} zugewiesen','<h2>Sie wurden einem Fehler zugewiesen!</h2><p>Hallo <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> hat Sie dem Fehler \"<strong>{bug_title}</strong>\" im Projekt <strong>{project_name}</strong> zugewiesen.</p><p><strong>Fehler:</strong> {bug_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Arbeitsbereich:</strong> {workspace_name}</p><p><strong>Priorität:</strong> {bug_priority}</p><p><strong>Schwere:</strong> {bug_severity}</p><p><strong>Startdatum:</strong> {start_date}</p><p><strong>Enddatum:</strong> {end_date}</p><p><strong>Zugewiesen von:</strong> {assigned_by_name}</p><p><strong>Beschreibung:</strong> {bug_description}</p><p>Sie können nun auf diesen Fehler zugreifen und daran arbeiten. Bitte melden Sie sich an, um die Fehlerdetails anzuzeigen.</p><p>Mit freundlichen Grüßen,<br><strong>Das {company_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(54,4,'fr','Vous avez été assigné à un bug dans {workspace_name}','<h2>Vous avez été assigné à un bug !</h2><p>Bonjour <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> vous a assigné au bug \"<strong>{bug_title}</strong>\" dans le projet <strong>{project_name}</strong>.</p><p><strong>Bug :</strong> {bug_title}</p><p><strong>Projet :</strong> {project_name}</p><p><strong>Espace de travail :</strong> {workspace_name}</p><p><strong>Priorité :</strong> {bug_priority}</p><p><strong>Gravité :</strong> {bug_severity}</p><p><strong>Date de début :</strong> {start_date}</p><p><strong>Date de fin :</strong> {end_date}</p><p><strong>Assigné par :</strong> {assigned_by_name}</p><p><strong>Description :</strong> {bug_description}</p><p>Vous pouvez maintenant accéder à ce bug et commencer à travailler dessus. Veuillez vous connecter pour voir les détails du bug.</p><p>Cordialement,<br><strong>L\'équipe {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(55,4,'he','הוקצתה לך תקלה ב-{workspace_name}','<h2>הוקצתה לך תקלה!</h2><p>שלום <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> הקצה אותך לתקלה \"<strong>{bug_title}</strong>\" בפרויקט <strong>{project_name}</strong>.</p><p><strong>תקלה:</strong> {bug_title}</p><p><strong>פרויקט:</strong> {project_name}</p><p><strong>סביבת עבודה:</strong> {workspace_name}</p><p><strong>עדיפות:</strong> {bug_priority}</p><p><strong>חומרה:</strong> {bug_severity}</p><p><strong>תאריך התחלה:</strong> {start_date}</p><p><strong>תאריך סיום:</strong> {end_date}</p><p><strong>הוקצה על ידי:</strong> {assigned_by_name}</p><p><strong>תיאור:</strong> {bug_description}</p><p>כעת תוכל לגשת לתקלה זו ולהתחיל לעבוד עליה. אנא היכנס לחשבונך כדי לראות את פרטי התקלה.</p><p>בברכה,<br><strong>צוות {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(56,4,'it','Sei stato assegnato a un bug in {workspace_name}','<h2>Sei stato assegnato a un bug!</h2><p>Ciao <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> ti ha assegnato al bug \"<strong>{bug_title}</strong>\" nel progetto <strong>{project_name}</strong>.</p><p><strong>Bug:</strong> {bug_title}</p><p><strong>Progetto:</strong> {project_name}</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Priorità:</strong> {bug_priority}</p><p><strong>Gravità:</strong> {bug_severity}</p><p><strong>Data inizio:</strong> {start_date}</p><p><strong>Data fine:</strong> {end_date}</p><p><strong>Assegnato da:</strong> {assigned_by_name}</p><p><strong>Descrizione:</strong> {bug_description}</p><p>Ora puoi accedere a questo bug e iniziare a lavorarci. Effettua il login per visualizzare i dettagli del bug.</p><p>Cordiali saluti,<br><strong>Il team {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(57,4,'ja','{workspace_name} のバグに割り当てられました','<h2>バグに割り当てられました！</h2><p>こんにちは <strong>{assigned_user_name}</strong> さん、</p><p><strong>{assigned_by_name}</strong> がプロジェクト <strong>{project_name}</strong> のバグ \"<strong>{bug_title}</strong>\" に割り当てました。</p><p><strong>バグ:</strong> {bug_title}</p><p><strong>プロジェクト:</strong> {project_name}</p><p><strong>ワークスペース:</strong> {workspace_name}</p><p><strong>優先度:</strong> {bug_priority}</p><p><strong>重大度:</strong> {bug_severity}</p><p><strong>開始日:</strong> {start_date}</p><p><strong>終了日:</strong> {end_date}</p><p><strong>割り当て者:</strong> {assigned_by_name}</p><p><strong>説明:</strong> {bug_description}</p><p>このバグにアクセスして作業を開始できます。詳細を見るにはログインしてください。</p><p>よろしくお願いいたします,<br><strong>{company_name} チーム</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(58,4,'nl','U bent toegewezen aan een bug in {workspace_name}','<h2>U bent toegewezen aan een bug!</h2><p>Hallo <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> heeft u toegewezen aan de bug \"<strong>{bug_title}</strong>\" in project <strong>{project_name}</strong>.</p><p><strong>Bug:</strong> {bug_title}</p><p><strong>Project:</strong> {project_name}</p><p><strong>Werkruimte:</strong> {workspace_name}</p><p><strong>Prioriteit:</strong> {bug_priority}</p><p><strong>Ernst:</strong> {bug_severity}</p><p><strong>Startdatum:</strong> {start_date}</p><p><strong>Einddatum:</strong> {end_date}</p><p><strong>Toegewezen door:</strong> {assigned_by_name}</p><p><strong>Beschrijving:</strong> {bug_description}</p><p>U kunt nu toegang krijgen tot deze bug en eraan werken. Log in om de bugdetails te bekijken.</p><p>Met vriendelijke groet,<br><strong>Het {company_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(59,4,'pl','Zostałeś przypisany do błędu w {workspace_name}','<h2>Zostałeś przypisany do błędu!</h2><p>Cześć <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> przypisał Cię do błędu \"<strong>{bug_title}</strong>\" w projekcie <strong>{project_name}</strong>.</p><p><strong>Błąd:</strong> {bug_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Priorytet:</strong> {bug_priority}</p><p><strong>Waga:</strong> {bug_severity}</p><p><strong>Data rozpoczęcia:</strong> {start_date}</p><p><strong>Data zakończenia:</strong> {end_date}</p><p><strong>Przypisane przez:</strong> {assigned_by_name}</p><p><strong>Opis:</strong> {bug_description}</p><p>Możesz teraz uzyskać dostęp do tego błędu i rozpocząć nad nim pracę. Zaloguj się, aby zobaczyć szczegóły błędu.</p><p>Z poważaniem,<br><strong>Zespół {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(60,4,'pt','Você foi designado para um bug em {workspace_name}','<h2>Você foi designado a um bug!</h2><p>Olá <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> designou você para o bug \"<strong>{bug_title}</strong>\" no projeto <strong>{project_name}</strong>.</p><p><strong>Bug:</strong> {bug_title}</p><p><strong>Projeto:</strong> {project_name}</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Prioridade:</strong> {bug_priority}</p><p><strong>Severidade:</strong> {bug_severity}</p><p><strong>Data de início:</strong> {start_date}</p><p><strong>Data de término:</strong> {end_date}</p><p><strong>Designado por:</strong> {assigned_by_name}</p><p><strong>Descrição:</strong> {bug_description}</p><p>Agora você pode acessar este bug e começar a trabalhar nele. Faça login para ver os detalhes do bug.</p><p>Atenciosamente,<br><strong>Equipe {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(61,4,'pt-BR','Você foi designado para um bug em {workspace_name}','<h2>Você foi designado a um bug!</h2><p>Olá <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> designou você para o bug \"<strong>{bug_title}</strong>\" no projeto <strong>{project_name}</strong>.</p><p><strong>Bug:</strong> {bug_title}</p><p><strong>Projeto:</strong> {project_name}</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Prioridade:</strong> {bug_priority}</p><p><strong>Severidade:</strong> {bug_severity}</p><p><strong>Data de início:</strong> {start_date}</p><p><strong>Data de término:</strong> {end_date}</p><p><strong>Designado por:</strong> {assigned_by_name}</p><p><strong>Descrição:</strong> {bug_description}</p><p>Agora você pode acessar este bug e começar a trabalhar nele. Faça login para ver os detalhes do bug.</p><p>Atenciosamente,<br><strong>Equipe {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(62,4,'ru','Вам назначен баг в {workspace_name}','<h2>Вам назначен баг!</h2><p>Здравствуйте <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> назначил вас на баг \"<strong>{bug_title}</strong>\" в проекте <strong>{project_name}</strong>.</p><p><strong>Баг:</strong> {bug_title}</p><p><strong>Проект:</strong> {project_name}</p><p><strong>Рабочее пространство:</strong> {workspace_name}</p><p><strong>Приоритет:</strong> {bug_priority}</p><p><strong>Серьезность:</strong> {bug_severity}</p><p><strong>Дата начала:</strong> {start_date}</p><p><strong>Дата окончания:</strong> {end_date}</p><p><strong>Назначено:</strong> {assigned_by_name}</p><p><strong>Описание:</strong> {bug_description}</p><p>Теперь вы можете получить доступ к этому багу и начать работать над ним. Пожалуйста, войдите в систему, чтобы просмотреть детали бага.</p><p>С уважением,<br><strong>Команда {company_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(63,4,'tr','{workspace_name} içinde bir hataya atandınız','<h2>Bir hataya atandınız!</h2><p>Merhaba <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> sizi proje <strong>{project_name}</strong> içindeki \"<strong>{bug_title}</strong>\" hatasına atadı.</p><p><strong>Hata:</strong> {bug_title}</p><p><strong>Proje:</strong> {project_name}</p><p><strong>Çalışma Alanı:</strong> {workspace_name}</p><p><strong>Öncelik:</strong> {bug_priority}</p><p><strong>Ciddiyet:</strong> {bug_severity}</p><p><strong>Başlangıç Tarihi:</strong> {start_date}</p><p><strong>Bitiş Tarihi:</strong> {end_date}</p><p><strong>Atayan:</strong> {assigned_by_name}</p><p><strong>Açıklama:</strong> {bug_description}</p><p>Artık bu hataya erişebilir ve üzerinde çalışmaya başlayabilirsiniz. Hata detaylarını görmek için hesabınıza giriş yapın.</p><p>Saygılarımızla,<br><strong>{company_name} Ekibi</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(64,4,'zh','您已被分配到 {workspace_name} 中的一个错误','<h2>您已被分配到一个错误！</h2><p>您好 <strong>{assigned_user_name}</strong>,</p><p><strong>{assigned_by_name}</strong> 已将您分配到项目 <strong>{project_name}</strong> 中的错误 \"<strong>{bug_title}</strong>\"。</p><p><strong>错误:</strong> {bug_title}</p><p><strong>项目:</strong> {project_name}</p><p><strong>工作区:</strong> {workspace_name}</p><p><strong>优先级:</strong> {bug_priority}</p><p><strong>严重性:</strong> {bug_severity}</p><p><strong>开始日期:</strong> {start_date}</p><p><strong>结束日期:</strong> {end_date}</p><p><strong>分配人:</strong> {assigned_by_name}</p><p><strong>描述:</strong> {bug_description}</p><p>您现在可以访问此错误并开始处理。请登录您的账户查看错误详情。</p><p>此致敬礼,<br><strong>{company_name} 团队</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(65,5,'en','New Expense Created: {expense_title}','<h2>New Expense Created</h2><p>Hello,</p><p>A new expense has been created in project <strong>{project_name}</strong>.</p><p><strong>Expense:</strong> {expense_title}</p><p><strong>Amount:</strong> {expense_amount}</p><p><strong>Category:</strong> {expense_category}</p><p><strong>Date:</strong> {expense_date}</p><p><strong>Created by:</strong> {created_by_name}</p><p><strong>Description:</strong> {expense_description}</p><p>Best regards,<br><strong>The {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(66,5,'es','Nuevo gasto creado: {expense_title}','<h2>Nuevo gasto creado</h2><p>Hola,</p><p>Se ha creado un nuevo gasto en el proyecto <strong>{project_name}</strong>.</p><p><strong>Gasto:</strong> {expense_title}</p><p><strong>Monto:</strong> {expense_amount}</p><p><strong>Categoría:</strong> {expense_category}</p><p><strong>Fecha:</strong> {expense_date}</p><p><strong>Creado por:</strong> {created_by_name}</p><p><strong>Descripción:</strong> {expense_description}</p><p>Saludos cordiales,<br><strong>El equipo de {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(67,5,'ar','تم إنشاء مصروف جديد: {expense_title}','<h2>تم إنشاء مصروف جديد</h2><p>مرحباً،</p><p>تم إنشاء مصروف جديد في المشروع <strong>{project_name}</strong>.</p><p><strong>المصروف:</strong> {expense_title}</p><p><strong>المبلغ:</strong> {expense_amount}</p><p><strong>الفئة:</strong> {expense_category}</p><p><strong>التاريخ:</strong> {expense_date}</p><p><strong>تم الإنشاء بواسطة:</strong> {created_by_name}</p><p><strong>الوصف:</strong> {expense_description}</p><p>مع أطيب التحيات,<br><strong>فريق {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(68,5,'da','Ny udgift oprettet: {expense_title}','<h2>Ny udgift oprettet</h2><p>Hej,</p><p>En ny udgift er oprettet i projektet <strong>{project_name}</strong>.</p><p><strong>Udgift:</strong> {expense_title}</p><p><strong>Beløb:</strong> {expense_amount}</p><p><strong>Kategori:</strong> {expense_category}</p><p><strong>Dato:</strong> {expense_date}</p><p><strong>Oprettet af:</strong> {created_by_name}</p><p><strong>Beskrivelse:</strong> {expense_description}</p><p>Venlig hilsen,<br><strong>{app_name} Teamet</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(69,5,'de','Neue Ausgabe erstellt: {expense_title}','<h2>Neue Ausgabe erstellt</h2><p>Hallo,</p><p>Es wurde eine neue Ausgabe im Projekt <strong>{project_name}</strong> erstellt.</p><p><strong>Ausgabe:</strong> {expense_title}</p><p><strong>Betrag:</strong> {expense_amount}</p><p><strong>Kategorie:</strong> {expense_category}</p><p><strong>Datum:</strong> {expense_date}</p><p><strong>Erstellt von:</strong> {created_by_name}</p><p><strong>Beschreibung:</strong> {expense_description}</p><p>Mit freundlichen Grüßen,<br><strong>Das {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(70,5,'fr','Nouvelle dépense créée : {expense_title}','<h2>Nouvelle dépense créée</h2><p>Bonjour,</p><p>Une nouvelle dépense a été créée dans le projet <strong>{project_name}</strong>.</p><p><strong>Dépense :</strong> {expense_title}</p><p><strong>Montant :</strong> {expense_amount}</p><p><strong>Catégorie :</strong> {expense_category}</p><p><strong>Date :</strong> {expense_date}</p><p><strong>Créé par :</strong> {created_by_name}</p><p><strong>Description :</strong> {expense_description}</p><p>Cordialement,<br><strong>L\'équipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(71,5,'he','הוצאה חדשה נוצרה: {expense_title}','<h2>הוצאה חדשה נוצרה</h2><p>שלום,</p><p>נוצרה הוצאה חדשה בפרויקט <strong>{project_name}</strong>.</p><p><strong>הוצאה:</strong> {expense_title}</p><p><strong>סכום:</strong> {expense_amount}</p><p><strong>קטגוריה:</strong> {expense_category}</p><p><strong>תאריך:</strong> {expense_date}</p><p><strong>נוצר על ידי:</strong> {created_by_name}</p><p><strong>תיאור:</strong> {expense_description}</p><p>בברכה,<br><strong>צוות {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(72,5,'it','Nuova spesa creata: {expense_title}','<h2>Nuova spesa creata</h2><p>Ciao,</p><p>È stata creata una nuova spesa nel progetto <strong>{project_name}</strong>.</p><p><strong>Spesa:</strong> {expense_title}</p><p><strong>Importo:</strong> {expense_amount}</p><p><strong>Categoria:</strong> {expense_category}</p><p><strong>Data:</strong> {expense_date}</p><p><strong>Creato da:</strong> {created_by_name}</p><p><strong>Descrizione:</strong> {expense_description}</p><p>Cordiali saluti,<br><strong>Il team {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(73,5,'ja','新しい経費が作成されました: {expense_title}','<h2>新しい経費が作成されました</h2><p>こんにちは、</p><p>プロジェクト <strong>{project_name}</strong> に新しい経費が作成されました。</p><p><strong>経費:</strong> {expense_title}</p><p><strong>金額:</strong> {expense_amount}</p><p><strong>カテゴリ:</strong> {expense_category}</p><p><strong>日付:</strong> {expense_date}</p><p><strong>作成者:</strong> {created_by_name}</p><p><strong>説明:</strong> {expense_description}</p><p>よろしくお願いします,<br><strong>{app_name} チーム</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(74,5,'nl','Nieuwe uitgave aangemaakt: {expense_title}','<h2>Nieuwe uitgave aangemaakt</h2><p>Hallo,</p><p>Er is een nieuwe uitgave aangemaakt in project <strong>{project_name}</strong>.</p><p><strong>Uitgave:</strong> {expense_title}</p><p><strong>Bedrag:</strong> {expense_amount}</p><p><strong>Categorie:</strong> {expense_category}</p><p><strong>Datum:</strong> {expense_date}</p><p><strong>Aangemaakt door:</strong> {created_by_name}</p><p><strong>Beschrijving:</strong> {expense_description}</p><p>Met vriendelijke groet,<br><strong>{app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(75,5,'pl','Nowy wydatek utworzony: {expense_title}','<h2>Nowy wydatek utworzony</h2><p>Witaj,</p><p>Nowy wydatek został utworzony w projekcie <strong>{project_name}</strong>.</p><p><strong>Wydatek:</strong> {expense_title}</p><p><strong>Kwota:</strong> {expense_amount}</p><p><strong>Kategoria:</strong> {expense_category}</p><p><strong>Data:</strong> {expense_date}</p><p><strong>Utworzono przez:</strong> {created_by_name}</p><p><strong>Opis:</strong> {expense_description}</p><p>Pozdrawiamy,<br><strong>Zespół {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(76,5,'pt','Nova despesa criada: {expense_title}','<h2>Nova despesa criada</h2><p>Olá,</p><p>Uma nova despesa foi criada no projeto <strong>{project_name}</strong>.</p><p><strong>Despesa:</strong> {expense_title}</p><p><strong>Valor:</strong> {expense_amount}</p><p><strong>Categoria:</strong> {expense_category}</p><p><strong>Data:</strong> {expense_date}</p><p><strong>Criado por:</strong> {created_by_name}</p><p><strong>Descrição:</strong> {expense_description}</p><p>Atenciosamente,<br><strong>Equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(77,5,'pt-BR','Nova despesa criada: {expense_title}','<h2>Nova despesa criada</h2><p>Olá,</p><p>Uma nova despesa foi criada no projeto <strong>{project_name}</strong>.</p><p><strong>Despesa:</strong> {expense_title}</p><p><strong>Valor:</strong> {expense_amount}</p><p><strong>Categoria:</strong> {expense_category}</p><p><strong>Data:</strong> {expense_date}</p><p><strong>Criado por:</strong> {created_by_name}</p><p><strong>Descrição:</strong> {expense_description}</p><p>Atenciosamente,<br><strong>Equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(78,5,'ru','Создан новый расход: {expense_title}','<h2>Создан новый расход</h2><p>Здравствуйте,</p><p>В проекте <strong>{project_name}</strong> был создан новый расход.</p><p><strong>Расход:</strong> {expense_title}</p><p><strong>Сумма:</strong> {expense_amount}</p><p><strong>Категория:</strong> {expense_category}</p><p><strong>Дата:</strong> {expense_date}</p><p><strong>Создано:</strong> {created_by_name}</p><p><strong>Описание:</strong> {expense_description}</p><p>С уважением,<br><strong>Команда {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(79,5,'tr','Yeni gider oluşturuldu: {expense_title}','<h2>Yeni gider oluşturuldu</h2><p>Merhaba,</p><p><strong>{project_name}</strong> projesinde yeni bir gider oluşturuldu.</p><p><strong>Gider:</strong> {expense_title}</p><p><strong>Tutar:</strong> {expense_amount}</p><p><strong>Kategori:</strong> {expense_category}</p><p><strong>Tarih:</strong> {expense_date}</p><p><strong>Oluşturan:</strong> {created_by_name}</p><p><strong>Açıklama:</strong> {expense_description}</p><p>Saygılarımızla,<br><strong>{app_name} Ekibi</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(80,5,'zh','已创建新费用: {expense_title}','<h2>已创建新费用</h2><p>您好，</p><p>在项目 <strong>{project_name}</strong> 中已创建新费用。</p><p><strong>费用:</strong> {expense_title}</p><p><strong>金额:</strong> {expense_amount}</p><p><strong>类别:</strong> {expense_category}</p><p><strong>日期:</strong> {expense_date}</p><p><strong>创建者:</strong> {created_by_name}</p><p><strong>描述:</strong> {expense_description}</p><p>此致敬礼,<br><strong>{app_name} 团队</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(81,6,'en','New Invoice Created: {invoice_number}','<h2>New Invoice Created</h2><p>Hello <strong>{client_name}</strong>,</p><p>A new invoice has been created for you.</p><p><strong>Invoice Number:</strong> {invoice_number}</p><p><strong>Invoice Title:</strong> {invoice_title}</p><p><strong>Project:</strong> {project_name}</p><p><strong>Total Amount:</strong> {total_amount} {currency}</p><p><strong>Due Date:</strong> {due_date}</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Created by:</strong> {creator_name}</p><p>Best regards,<br><strong>The {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(82,6,'es','Nueva factura creada: {invoice_number}','<h2>Nueva factura creada</h2><p>Hola <strong>{client_name}</strong>,</p><p>Se ha creado una nueva factura para ti.</p><p><strong>Número de factura:</strong> {invoice_number}</p><p><strong>Título de la factura:</strong> {invoice_title}</p><p><strong>Proyecto:</strong> {project_name}</p><p><strong>Importe total:</strong> {total_amount} {currency}</p><p><strong>Fecha de vencimiento:</strong> {due_date}</p><p><strong>Espacio de trabajo:</strong> {workspace_name}</p><p><strong>Creado por:</strong> {creator_name}</p><p>Saludos cordiales,<br><strong>El equipo de {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(83,6,'ar','تم إنشاء فاتورة جديدة: {invoice_number}','<h2>تم إنشاء فاتورة جديدة</h2><p>مرحباً <strong>{client_name}</strong>،</p><p>تم إنشاء فاتورة جديدة لك.</p><p><strong>رقم الفاتورة:</strong> {invoice_number}</p><p><strong>عنوان الفاتورة:</strong> {invoice_title}</p><p><strong>المشروع:</strong> {project_name}</p><p><strong>المبلغ الإجمالي:</strong> {total_amount} {currency}</p><p><strong>تاريخ الاستحقاق:</strong> {due_date}</p><p><strong>مساحة العمل:</strong> {workspace_name}</p><p><strong>تم الإنشاء بواسطة:</strong> {creator_name}</p><p>مع أطيب التحيات,<br><strong>فريق {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(84,6,'da','Ny faktura oprettet: {invoice_number}','<h2>Ny faktura oprettet</h2><p>Hej <strong>{client_name}</strong>,</p><p>Der er oprettet en ny faktura til dig.</p><p><strong>Fakturanummer:</strong> {invoice_number}</p><p><strong>Fakturatitel:</strong> {invoice_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Samlet beløb:</strong> {total_amount} {currency}</p><p><strong>Forfaldsdato:</strong> {due_date}</p><p><strong>Arbejdsområde:</strong> {workspace_name}</p><p><strong>Oprettet af:</strong> {creator_name}</p><p>Venlig hilsen,<br><strong>{app_name} Teamet</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(85,6,'de','Neue Rechnung erstellt: {invoice_number}','<h2>Neue Rechnung erstellt</h2><p>Hallo <strong>{client_name}</strong>,</p><p>Es wurde eine neue Rechnung für Sie erstellt.</p><p><strong>Rechnungsnummer:</strong> {invoice_number}</p><p><strong>Rechnungstitel:</strong> {invoice_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Gesamtbetrag:</strong> {total_amount} {currency}</p><p><strong>Fälligkeitsdatum:</strong> {due_date}</p><p><strong>Arbeitsbereich:</strong> {workspace_name}</p><p><strong>Erstellt von:</strong> {creator_name}</p><p>Mit freundlichen Grüßen,<br><strong>Das {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(86,6,'fr','Nouvelle facture créée : {invoice_number}','<h2>Nouvelle facture créée</h2><p>Bonjour <strong>{client_name}</strong>,</p><p>Une nouvelle facture a été créée pour vous.</p><p><strong>Numéro de facture :</strong> {invoice_number}</p><p><strong>Titre de la facture :</strong> {invoice_title}</p><p><strong>Projet :</strong> {project_name}</p><p><strong>Montant total :</strong> {total_amount} {currency}</p><p><strong>Date d\'échéance :</strong> {due_date}</p><p><strong>Espace de travail :</strong> {workspace_name}</p><p><strong>Créé par :</strong> {creator_name}</p><p>Cordialement,<br><strong>L\'équipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(87,6,'he','חשבונית חדשה נוצרה: {invoice_number}','<h2>חשבונית חדשה נוצרה</h2><p>שלום <strong>{client_name}</strong>,</p><p>נוצרה עבורך חשבונית חדשה.</p><p><strong>מספר חשבונית:</strong> {invoice_number}</p><p><strong>כותרת החשבונית:</strong> {invoice_title}</p><p><strong>פרויקט:</strong> {project_name}</p><p><strong>סכום כולל:</strong> {total_amount} {currency}</p><p><strong>תאריך אחרון לתשלום:</strong> {due_date}</p><p><strong>מרחב עבודה:</strong> {workspace_name}</p><p><strong>נוצר על ידי:</strong> {creator_name}</p><p>בברכה,<br><strong>צוות {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(88,6,'it','Nuova fattura creata: {invoice_number}','<h2>Nuova fattura creata</h2><p>Ciao <strong>{client_name}</strong>,</p><p>È stata creata una nuova fattura per te.</p><p><strong>Numero fattura:</strong> {invoice_number}</p><p><strong>Titolo fattura:</strong> {invoice_title}</p><p><strong>Progetto:</strong> {project_name}</p><p><strong>Importo totale:</strong> {total_amount} {currency}</p><p><strong>Data di scadenza:</strong> {due_date}</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Creato da:</strong> {creator_name}</p><p>Cordiali saluti,<br><strong>Team {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(89,6,'ja','新しい請求書が作成されました: {invoice_number}','<h2>新しい請求書が作成されました</h2><p>こんにちは <strong>{client_name}</strong> さん、</p><p>新しい請求書が作成されました。</p><p><strong>請求書番号:</strong> {invoice_number}</p><p><strong>請求書タイトル:</strong> {invoice_title}</p><p><strong>プロジェクト:</strong> {project_name}</p><p><strong>合計金額:</strong> {total_amount} {currency}</p><p><strong>支払期限:</strong> {due_date}</p><p><strong>ワークスペース:</strong> {workspace_name}</p><p><strong>作成者:</strong> {creator_name}</p><p>よろしくお願いします,<br><strong>{app_name} チーム</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(90,6,'nl','Nieuwe factuur aangemaakt: {invoice_number}','<h2>Nieuwe factuur aangemaakt</h2><p>Hallo <strong>{client_name}</strong>,</p><p>Er is een nieuwe factuur voor je aangemaakt.</p><p><strong>Factuurnummer:</strong> {invoice_number}</p><p><strong>Factuurtitel:</strong> {invoice_title}</p><p><strong>Project:</strong> {project_name}</p><p><strong>Totaalbedrag:</strong> {total_amount} {currency}</p><p><strong>Vervaldatum:</strong> {due_date}</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Gemaakt door:</strong> {creator_name}</p><p>Met vriendelijke groet,<br><strong>{app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(91,6,'pl','Nowa faktura utworzona: {invoice_number}','<h2>Nowa faktura utworzona</h2><p>Witaj <strong>{client_name}</strong>,</p><p>Utworzono dla Ciebie nową fakturę.</p><p><strong>Numer faktury:</strong> {invoice_number}</p><p><strong>Tytuł faktury:</strong> {invoice_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Kwota całkowita:</strong> {total_amount} {currency}</p><p><strong>Data płatności:</strong> {due_date}</p><p><strong>Workspace:</strong> {workspace_name}</p><p><strong>Utworzono przez:</strong> {creator_name}</p><p>Pozdrawiamy,<br><strong>Zespół {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(92,6,'pt','Nova fatura criada: {invoice_number}','<h2>Nova fatura criada</h2><p>Olá <strong>{client_name}</strong>,</p><p>Uma nova fatura foi criada para você.</p><p><strong>Número da fatura:</strong> {invoice_number}</p><p><strong>Título da fatura:</strong> {invoice_title}</p><p><strong>Projeto:</strong> {project_name}</p><p><strong>Valor total:</strong> {total_amount} {currency}</p><p><strong>Data de vencimento:</strong> {due_date}</p><p><strong>Espaço de trabalho:</strong> {workspace_name}</p><p><strong>Criado por:</strong> {creator_name}</p><p>Atenciosamente,<br><strong>Equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(93,6,'pt-BR','Nova fatura criada: {invoice_number}','<h2>Nova fatura criada</h2><p>Olá <strong>{client_name}</strong>,</p><p>Uma nova fatura foi criada para você.</p><p><strong>Número da fatura:</strong> {invoice_number}</p><p><strong>Título da fatura:</strong> {invoice_title}</p><p><strong>Projeto:</strong> {project_name}</p><p><strong>Valor total:</strong> {total_amount} {currency}</p><p><strong>Data de vencimento:</strong> {due_date}</p><p><strong>Espaço de trabalho:</strong> {workspace_name}</p><p><strong>Criado por:</strong> {creator_name}</p><p>Atenciosamente,<br><strong>Equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(94,6,'ru','Создан новый счет: {invoice_number}','<h2>Создан новый счет</h2><p>Здравствуйте <strong>{client_name}</strong>,</p><p>Для вас создан новый счет.</p><p><strong>Номер счета:</strong> {invoice_number}</p><p><strong>Название счета:</strong> {invoice_title}</p><p><strong>Проект:</strong> {project_name}</p><p><strong>Общая сумма:</strong> {total_amount} {currency}</p><p><strong>Срок оплаты:</strong> {due_date}</p><p><strong>Рабочее пространство:</strong> {workspace_name}</p><p><strong>Создано:</strong> {creator_name}</p><p>С уважением,<br><strong>Команда {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(95,6,'tr','Yeni fatura oluşturuldu: {invoice_number}','<h2>Yeni fatura oluşturuldu</h2><p>Merhaba <strong>{client_name}</strong>,</p><p>Sizin için yeni bir fatura oluşturuldu.</p><p><strong>Fatura Numarası:</strong> {invoice_number}</p><p><strong>Fatura Başlığı:</strong> {invoice_title}</p><p><strong>Proje:</strong> {project_name}</p><p><strong>Toplam Tutar:</strong> {total_amount} {currency}</p><p><strong>Son Tarih:</strong> {due_date}</p><p><strong>Çalışma Alanı:</strong> {workspace_name}</p><p><strong>Oluşturan:</strong> {creator_name}</p><p>Saygılarımızla,<br><strong>{app_name} Ekibi</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(96,6,'zh','已创建新发票: {invoice_number}','<h2>已创建新发票</h2><p>您好 <strong>{client_name}</strong>,</p><p>已为您创建新发票。</p><p><strong>发票号码:</strong> {invoice_number}</p><p><strong>发票标题:</strong> {invoice_title}</p><p><strong>项目:</strong> {project_name}</p><p><strong>总金额:</strong> {total_amount} {currency}</p><p><strong>到期日期:</strong> {due_date}</p><p><strong>工作区:</strong> {workspace_name}</p><p><strong>创建者:</strong> {creator_name}</p><p>此致敬礼,<br><strong>{app_name} 团队</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(97,7,'en','New Contract Created: {contract_subject}','<h2>New Contract Created</h2><p>Hello <strong>{client_name}</strong>,</p><p>A new contract has been created for you.</p><p><strong>Contract ID:</strong> {contract_id}</p><p><strong>Subject:</strong> {contract_subject}</p><p><strong>Contract Type:</strong> {contract_type}</p><p><strong>Description:</strong> {contract_description}</p><p><strong>Contract Value:</strong> {contract_value} {currency}</p><p><strong>Start Date:</strong> {start_date}</p><p><strong>End Date:</strong> {end_date}</p><p><strong>Status:</strong> {status}</p><p><strong>Created by:</strong> {creator_name}</p><p>Best regards,<br><strong>The {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(98,7,'es','Nuevo contrato creado: {contract_subject}','<h2>Nuevo contrato creado</h2><p>Hola <strong>{client_name}</strong>,</p><p>Se ha creado un nuevo contrato para ti.</p><p><strong>ID del contrato:</strong> {contract_id}</p><p><strong>Asunto:</strong> {contract_subject}</p><p><strong>Tipo de contrato:</strong> {contract_type}</p><p><strong>Descripción:</strong> {contract_description}</p><p><strong>Valor del contrato:</strong> {contract_value} {currency}</p><p><strong>Fecha de inicio:</strong> {start_date}</p><p><strong>Fecha de finalización:</strong> {end_date}</p><p><strong>Estado:</strong> {status}</p><p><strong>Creado por:</strong> {creator_name}</p><p>Saludos cordiales,<br><strong>El equipo de {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(99,7,'ar','تم إنشاء عقد جديد: {contract_subject}','<h2>تم إنشاء عقد جديد</h2><p>مرحباً <strong>{client_name}</strong>،</p><p>تم إنشاء عقد جديد لك.</p><p><strong>معرف العقد:</strong> {contract_id}</p><p><strong>الموضوع:</strong> {contract_subject}</p><p><strong>نوع العقد:</strong> {contract_type}</p><p><strong>الوصف:</strong> {contract_description}</p><p><strong>قيمة العقد:</strong> {contract_value} {currency}</p><p><strong>تاريخ البداية:</strong> {start_date}</p><p><strong>تاريخ الانتهاء:</strong> {end_date}</p><p><strong>الحالة:</strong> {status}</p><p><strong>تم الإنشاء بواسطة:</strong> {creator_name}</p><p>مع أطيب التحيات,<br><strong>فريق {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(100,7,'da','Ny kontrakt oprettet: {contract_subject}','<h2>Ny kontrakt oprettet</h2><p>Hej <strong>{client_name}</strong>,</p><p>Der er oprettet en ny kontrakt til dig.</p><p><strong>Kontrakt ID:</strong> {contract_id}</p><p><strong>Emne:</strong> {contract_subject}</p><p><strong>Kontrakttype:</strong> {contract_type}</p><p><strong>Beskrivelse:</strong> {contract_description}</p><p><strong>Kontraktværdi:</strong> {contract_value} {currency}</p><p><strong>Startdato:</strong> {start_date}</p><p><strong>Slutdato:</strong> {end_date}</p><p><strong>Status:</strong> {status}</p><p><strong>Oprettet af:</strong> {creator_name}</p><p>Venlig hilsen,<br><strong>{app_name} Teamet</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(101,7,'de','Neuer Vertrag erstellt: {contract_subject}','<h2>Neuer Vertrag erstellt</h2><p>Hallo <strong>{client_name}</strong>,</p><p>Ein neuer Vertrag wurde für Sie erstellt.</p><p><strong>Vertrags-ID:</strong> {contract_id}</p><p><strong>Betreff:</strong> {contract_subject}</p><p><strong>Vertragstyp:</strong> {contract_type}</p><p><strong>Beschreibung:</strong> {contract_description}</p><p><strong>Vertragswert:</strong> {contract_value} {currency}</p><p><strong>Startdatum:</strong> {start_date}</p><p><strong>Enddatum:</strong> {end_date}</p><p><strong>Status:</strong> {status}</p><p><strong>Erstellt von:</strong> {creator_name}</p><p>Mit freundlichen Grüßen,<br><strong>Das {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(102,7,'fr','Nouveau contrat créé : {contract_subject}','<h2>Nouveau contrat créé</h2><p>Bonjour <strong>{client_name}</strong>,</p><p>Un nouveau contrat a été créé pour vous.</p><p><strong>ID du contrat :</strong> {contract_id}</p><p><strong>Sujet :</strong> {contract_subject}</p><p><strong>Type de contrat :</strong> {contract_type}</p><p><strong>Description :</strong> {contract_description}</p><p><strong>Valeur du contrat :</strong> {contract_value} {currency}</p><p><strong>Date de début :</strong> {start_date}</p><p><strong>Date de fin :</strong> {end_date}</p><p><strong>Statut :</strong> {status}</p><p><strong>Créé par :</strong> {creator_name}</p><p>Cordialement,<br><strong>L\'équipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(103,7,'he','חוזה חדש נוצר: {contract_subject}','<h2>חוזה חדש נוצר</h2><p>שלום <strong>{client_name}</strong>,</p><p>נוצר עבורך חוזה חדש.</p><p><strong>מזהה חוזה:</strong> {contract_id}</p><p><strong>נושא:</strong> {contract_subject}</p><p><strong>ערך החוזה:</strong> {contract_value} {currency}</p><p><strong>תאריך התחלה:</strong> {start_date}</p><p><strong>תאריך סיום:</strong> {end_date}</p><p><strong>סטטוס:</strong> {status}</p><p><strong>נוצר על ידי:</strong> {creator_name}</p><p>בברכה,<br><strong>צוות {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(104,7,'it','Nuovo contratto creato: {contract_subject}','<h2>Nuovo contratto creato</h2><p>Ciao <strong>{client_name}</strong>,</p><p>È stato creato un nuovo contratto per te.</p><p><strong>ID contratto:</strong> {contract_id}</p><p><strong>Oggetto:</strong> {contract_subject}</p><p><strong>Tipo contratto:</strong> {contract_type}</p><p><strong>Descrizione:</strong> {contract_description}</p><p><strong>Valore contratto:</strong> {contract_value} {currency}</p><p><strong>Data inizio:</strong> {start_date}</p><p><strong>Data fine:</strong> {end_date}</p><p><strong>Stato:</strong> {status}</p><p><strong>Creato da:</strong> {creator_name}</p><p>Cordiali saluti,<br><strong>Team {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(105,7,'ja','新しい契約が作成されました: {contract_subject}','<h2>新しい契約が作成されました</h2><p>こんにちは <strong>{client_name}</strong> さん、</p><p>新しい契約が作成されました。</p><p><strong>契約ID:</strong> {contract_id}</p><p><strong>件名:</strong> {contract_subject}</p><p><strong>契約金額:</strong> {contract_value} {currency}</p><p><strong>開始日:</strong> {start_date}</p><p><strong>終了日:</strong> {end_date}</p><p><strong>ステータス:</strong> {status}</p><p><strong>作成者:</strong> {creator_name}</p><p>よろしくお願いします,<br><strong>{app_name} チーム</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(106,7,'nl','Nieuw contract aangemaakt: {contract_subject}','<h2>Nieuw contract aangemaakt</h2><p>Hallo <strong>{client_name}</strong>,</p><p>Er is een nieuw contract voor je aangemaakt.</p><p><strong>Contract ID:</strong> {contract_id}</p><p><strong>Onderwerp:</strong> {contract_subject}</p><p><strong>Contracttype:</strong> {contract_type}</p><p><strong>Beschrijving:</strong> {contract_description}</p><p><strong>Contractwaarde:</strong> {contract_value} {currency}</p><p><strong>Startdatum:</strong> {start_date}</p><p><strong>Einddatum:</strong> {end_date}</p><p><strong>Status:</strong> {status}</p><p><strong>Gemaakt door:</strong> {creator_name}</p><p>Met vriendelijke groet,<br><strong>{app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(107,7,'pl','Nowa umowa utworzona: {contract_subject}','<h2>Nowa umowa utworzona</h2><p>Witaj <strong>{client_name}</strong>,</p><p>Utworzono dla Ciebie nową umowę.</p><p><strong>ID umowy:</strong> {contract_id}</p><p><strong>Temat:</strong> {contract_subject}</p><p><strong>Typ umowy:</strong> {contract_type}</p><p><strong>Opis:</strong> {contract_description}</p><p><strong>Wartość umowy:</strong> {contract_value} {currency}</p><p><strong>Data rozpoczęcia:</strong> {start_date}</p><p><strong>Data zakończenia:</strong> {end_date}</p><p><strong>Status:</strong> {status}</p><p><strong>Utworzono przez:</strong> {creator_name}</p><p>Pozdrawiamy,<br><strong>Zespół {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(108,7,'pt','Novo contrato criado: {contract_subject}','<h2>Novo contrato criado</h2><p>Olá <strong>{client_name}</strong>,</p><p>Um novo contrato foi criado para você.</p><p><strong>ID do contrato:</strong> {contract_id}</p><p><strong>Assunto:</strong> {contract_subject}</p><p><strong>Tipo de contrato:</strong> {contract_type}</p><p><strong>Descrição:</strong> {contract_description}</p><p><strong>Valor do contrato:</strong> {contract_value} {currency}</p><p><strong>Data de início:</strong> {start_date}</p><p><strong>Data de término:</strong> {end_date}</p><p><strong>Status:</strong> {status}</p><p><strong>Criado por:</strong> {creator_name}</p><p>Atenciosamente,<br><strong>Equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(109,7,'pt-BR','Novo contrato criado: {contract_subject}','<h2>Novo contrato criado</h2><p>Olá <strong>{client_name}</strong>,</p><p>Um novo contrato foi criado para você.</p><p><strong>ID do contrato:</strong> {contract_id}</p><p><strong>Assunto:</strong> {contract_subject}</p><p><strong>Tipo de contrato:</strong> {contract_type}</p><p><strong>Descrição:</strong> {contract_description}</p><p><strong>Valor do contrato:</strong> {contract_value} {currency}</p><p><strong>Data de início:</strong> {start_date}</p><p><strong>Data de término:</strong> {end_date}</p><p><strong>Status:</strong> {status}</p><p><strong>Criado por:</strong> {creator_name}</p><p>Atenciosamente,<br><strong>Equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(110,7,'ru','Создан новый контракт: {contract_subject}','<h2>Создан новый контракт</h2><p>Здравствуйте <strong>{client_name}</strong>,</p><p>Для вас создан новый контракт.</p><p><strong>ID контракта:</strong> {contract_id}</p><p><strong>Тема:</strong> {contract_subject}</p><p><strong>Тип контракта:</strong> {contract_type}</p><p><strong>Описание:</strong> {contract_description}</p><p><strong>Стоимость контракта:</strong> {contract_value} {currency}</p><p><strong>Дата начала:</strong> {start_date}</p><p><strong>Дата окончания:</strong> {end_date}</p><p><strong>Статус:</strong> {status}</p><p><strong>Создано:</strong> {creator_name}</p><p>С уважением,<br><strong>Команда {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(111,7,'tr','Yeni sözleşme oluşturuldu: {contract_subject}','<h2>Yeni sözleşme oluşturuldu</h2><p>Merhaba <strong>{client_name}</strong>,</p><p>Sizin için yeni bir sözleşme oluşturuldu.</p><p><strong>Sözleşme ID:</strong> {contract_id}</p><p><strong>Konu:</strong> {contract_subject}</p><p><strong>Sözleşme Türü:</strong> {contract_type}</p><p><strong>Açıklama:</strong> {contract_description}</p><p><strong>Sözleşme Değeri:</strong> {contract_value} {currency}</p><p><strong>Başlangıç Tarihi:</strong> {start_date}</p><p><strong>Bitiş Tarihi:</strong> {end_date}</p><p><strong>Durum:</strong> {status}</p><p><strong>Oluşturan:</strong> {creator_name}</p><p>Saygılarımızla,<br><strong>{app_name} Ekibi</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(112,7,'zh','已创建新合同: {contract_subject}','<h2>已创建新合同</h2><p>您好 <strong>{client_name}</strong>,</p><p>已为您创建新合同。</p><p><strong>合同ID:</strong> {contract_id}</p><p><strong>主题:</strong> {contract_subject}</p><p><strong>合同类型:</strong> {contract_type}</p><p><strong>描述:</strong> {contract_description}</p><p><strong>合同价值:</strong> {contract_value} {currency}</p><p><strong>开始日期:</strong> {start_date}</p><p><strong>结束日期:</strong> {end_date}</p><p><strong>状态:</strong> {status}</p><p><strong>创建者:</strong> {creator_name}</p><p>此致敬礼,<br><strong>{app_name} 团队</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(113,8,'en','Zoom Meeting Invitation: {meeting_title}','<h2>You have been invited to a Zoom meeting!</h2><p>Hello <strong>{member_name}</strong>,</p><p>You have been invited to join the Zoom meeting \"<strong>{meeting_title}</strong>\".</p><p><strong>Meeting:</strong> {meeting_title}</p><p><strong>Project:</strong> {project_name}</p><p><strong>Start Time:</strong> {start_time}</p><p><strong>Duration:</strong> {duration} minutes</p><p><strong>Organizer:</strong> {organizer_name}</p><p><strong>Description:</strong> {meeting_description}</p><p><strong>Join URL:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Best regards,<br><strong>The {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(114,8,'es','Invitación a reunión de Zoom: {meeting_title}','<h2>¡Has sido invitado a una reunión de Zoom!</h2><p>Hola <strong>{member_name}</strong>,</p><p>Has sido invitado a unirte a la reunión de Zoom \"<strong>{meeting_title}</strong>\".</p><p><strong>Reunión:</strong> {meeting_title}</p><p><strong>Proyecto:</strong> {project_name}</p><p><strong>Hora de inicio:</strong> {start_time}</p><p><strong>Duración:</strong> {duration} minutos</p><p><strong>Organizador:</strong> {organizer_name}</p><p><strong>Descripción:</strong> {meeting_description}</p><p><strong>URL de unión:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Saludos cordiales,<br><strong>El equipo de {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(115,8,'ar','دعوة لاجتماع Zoom: {meeting_title}','<h2>تمت دعوتك لاجتماع Zoom!</h2><p>مرحباً <strong>{member_name}</strong>،</p><p>تمت دعوتك للانضمام إلى اجتماع Zoom \"<strong>{meeting_title}</strong>\".</p><p><strong>الاجتماع:</strong> {meeting_title}</p><p><strong>المشروع:</strong> {project_name}</p><p><strong>وقت البداية:</strong> {start_time}</p><p><strong>المدة:</strong> {duration} دقيقة</p><p><strong>المنظم:</strong> {organizer_name}</p><p><strong>الوصف:</strong> {meeting_description}</p><p><strong>رابط الانضمام:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>مع أطيب التحيات,<br><strong>فريق {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(116,8,'da','Zoom møde invitation: {meeting_title}','<h2>Du er blevet inviteret til et Zoom møde!</h2><p>Hej <strong>{member_name}</strong>,</p><p>Du er blevet inviteret til at deltage i Zoom mødet \"<strong>{meeting_title}</strong>\".</p><p><strong>Møde:</strong> {meeting_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Starttid:</strong> {start_time}</p><p><strong>Varighed:</strong> {duration} minutter</p><p><strong>Arrangør:</strong> {organizer_name}</p><p><strong>Beskrivelse:</strong> {meeting_description}</p><p><strong>Deltag URL:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Venlig hilsen,<br><strong>{app_name} Teamet</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(117,8,'de','Zoom Meeting Einladung: {meeting_title}','<h2>Sie wurden zu einem Zoom Meeting eingeladen!</h2><p>Hallo <strong>{member_name}</strong>,</p><p>Sie wurden eingeladen, am Zoom Meeting \"<strong>{meeting_title}</strong>\" teilzunehmen.</p><p><strong>Meeting:</strong> {meeting_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Startzeit:</strong> {start_time}</p><p><strong>Dauer:</strong> {duration} Minuten</p><p><strong>Organisator:</strong> {organizer_name}</p><p><strong>Beschreibung:</strong> {meeting_description}</p><p><strong>Beitritts-URL:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Mit freundlichen Grüßen,<br><strong>Das {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(118,8,'fr','Invitation à une réunion Zoom : {meeting_title}','<h2>Vous avez été invité à une réunion Zoom !</h2><p>Bonjour <strong>{member_name}</strong>,</p><p>Vous avez été invité à rejoindre la réunion Zoom \"<strong>{meeting_title}</strong>\".</p><p><strong>Réunion :</strong> {meeting_title}</p><p><strong>Projet :</strong> {project_name}</p><p><strong>Heure de début :</strong> {start_time}</p><p><strong>Durée :</strong> {duration} minutes</p><p><strong>Organisateur :</strong> {organizer_name}</p><p><strong>Description :</strong> {meeting_description}</p><p><strong>URL de participation :</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Cordialement,<br><strong>L\'équipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(119,8,'he','הזמנה לפגישת Zoom: {meeting_title}','<h2>הוזמנת לפגישת Zoom!</h2><p>שלום <strong>{member_name}</strong>,</p><p>הוזמנת להצטרף לפגישת Zoom \"<strong>{meeting_title}</strong>\".</p><p><strong>פגישה:</strong> {meeting_title}</p><p><strong>פרויקט:</strong> {project_name}</p><p><strong>שעת התחלה:</strong> {start_time}</p><p><strong>משך:</strong> {duration} דקות</p><p><strong>מארגן:</strong> {organizer_name}</p><p><strong>תיאור:</strong> {meeting_description}</p><p><strong>קישור הצטרפות:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>בברכה,<br><strong>צוות {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(120,8,'it','Invito riunione Zoom: {meeting_title}','<h2>Sei stato invitato a una riunione Zoom!</h2><p>Ciao <strong>{member_name}</strong>,</p><p>Sei stato invitato a partecipare alla riunione Zoom \"<strong>{meeting_title}</strong>\".</p><p><strong>Riunione:</strong> {meeting_title}</p><p><strong>Progetto:</strong> {project_name}</p><p><strong>Ora di inizio:</strong> {start_time}</p><p><strong>Durata:</strong> {duration} minuti</p><p><strong>Organizzatore:</strong> {organizer_name}</p><p><strong>Descrizione:</strong> {meeting_description}</p><p><strong>URL di partecipazione:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Cordiali saluti,<br><strong>Il team {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(121,8,'ja','Zoom会議への招待: {meeting_title}','<h2>Zoom会議に招待されました！</h2><p>こんにちは <strong>{member_name}</strong> さん、</p><p>Zoom会議 \"<strong>{meeting_title}</strong>\" に招待されました。</p><p><strong>会議:</strong> {meeting_title}</p><p><strong>プロジェクト:</strong> {project_name}</p><p><strong>開始時間:</strong> {start_time}</p><p><strong>時間:</strong> {duration} 分</p><p><strong>主催者:</strong> {organizer_name}</p><p><strong>説明:</strong> {meeting_description}</p><p><strong>参加URL:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>よろしくお願いします,<br><strong>{app_name} チーム</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(122,8,'nl','Zoom Meeting uitnodiging: {meeting_title}','<h2>Je bent uitgenodigd voor een Zoom meeting!</h2><p>Hallo <strong>{member_name}</strong>,</p><p>Je bent uitgenodigd om deel te nemen aan de Zoom meeting \"<strong>{meeting_title}</strong>\".</p><p><strong>Meeting:</strong> {meeting_title}</p><p><strong>Project:</strong> {project_name}</p><p><strong>Starttijd:</strong> {start_time}</p><p><strong>Duur:</strong> {duration} minuten</p><p><strong>Organisator:</strong> {organizer_name}</p><p><strong>Beschrijving:</strong> {meeting_description}</p><p><strong>Deelname URL:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Met vriendelijke groet,<br><strong>{app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(123,8,'pl','Zaproszenie na spotkanie Zoom: {meeting_title}','<h2>Zostałeś zaproszony na spotkanie Zoom!</h2><p>Cześć <strong>{member_name}</strong>,</p><p>Zostałeś zaproszony do udziału w spotkaniu Zoom \"<strong>{meeting_title}</strong>\".</p><p><strong>Spotkanie:</strong> {meeting_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Czas rozpoczęcia:</strong> {start_time}</p><p><strong>Czas trwania:</strong> {duration} minut</p><p><strong>Organizator:</strong> {organizer_name}</p><p><strong>Opis:</strong> {meeting_description}</p><p><strong>URL dołączenia:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Z poważaniem,<br><strong>Zespół {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(124,8,'pt','Convite para reunião Zoom: {meeting_title}','<h2>Você foi convidado para uma reunião Zoom!</h2><p>Olá <strong>{member_name}</strong>,</p><p>Você foi convidado para participar da reunião Zoom \"<strong>{meeting_title}</strong>\".</p><p><strong>Reunião:</strong> {meeting_title}</p><p><strong>Projeto:</strong> {project_name}</p><p><strong>Horário de início:</strong> {start_time}</p><p><strong>Duração:</strong> {duration} minutos</p><p><strong>Organizador:</strong> {organizer_name}</p><p><strong>Descrição:</strong> {meeting_description}</p><p><strong>URL de participação:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Atenciosamente,<br><strong>Equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(125,8,'pt-BR','Convite para reunião Zoom: {meeting_title}','<h2>Você foi convidado para uma reunião Zoom!</h2><p>Olá <strong>{member_name}</strong>,</p><p>Você foi convidado para participar da reunião Zoom \"<strong>{meeting_title}</strong>\".</p><p><strong>Reunião:</strong> {meeting_title}</p><p><strong>Projeto:</strong> {project_name}</p><p><strong>Horário de início:</strong> {start_time}</p><p><strong>Duração:</strong> {duration} minutos</p><p><strong>Organizador:</strong> {organizer_name}</p><p><strong>Descrição:</strong> {meeting_description}</p><p><strong>URL de participação:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Atenciosamente,<br><strong>Equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(126,8,'ru','Приглашение на встречу Zoom: {meeting_title}','<h2>Вас пригласили на встречу Zoom!</h2><p>Здравствуйте <strong>{member_name}</strong>,</p><p>Вас пригласили присоединиться к встрече Zoom \"<strong>{meeting_title}</strong>\".</p><p><strong>Встреча:</strong> {meeting_title}</p><p><strong>Проект:</strong> {project_name}</p><p><strong>Время начала:</strong> {start_time}</p><p><strong>Продолжительность:</strong> {duration} минут</p><p><strong>Организатор:</strong> {organizer_name}</p><p><strong>Описание:</strong> {meeting_description}</p><p><strong>Ссылка для подключения:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>С уважением,<br><strong>Команда {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(127,8,'tr','Zoom Toplantı Daveti: {meeting_title}','<h2>Zoom toplantısına davet edildiniz!</h2><p>Merhaba <strong>{member_name}</strong>,</p><p>\"<strong>{meeting_title}</strong>\" Zoom toplantısına katılmaya davet edildiniz.</p><p><strong>Toplantı:</strong> {meeting_title}</p><p><strong>Proje:</strong> {project_name}</p><p><strong>Başlangıç Saati:</strong> {start_time}</p><p><strong>Süre:</strong> {duration} dakika</p><p><strong>Düzenleyen:</strong> {organizer_name}</p><p><strong>Açıklama:</strong> {meeting_description}</p><p><strong>Katılım URL:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Saygılarımızla,<br><strong>{app_name} Ekibi</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(128,8,'zh','Zoom会议邀请: {meeting_title}','<h2>您被邀请参加Zoom会议！</h2><p>您好 <strong>{member_name}</strong>,</p><p>您被邀请参加Zoom会议 \"<strong>{meeting_title}</strong>\"。</p><p><strong>会议:</strong> {meeting_title}</p><p><strong>项目:</strong> {project_name}</p><p><strong>开始时间:</strong> {start_time}</p><p><strong>时长:</strong> {duration} 分钟</p><p><strong>组织者:</strong> {organizer_name}</p><p><strong>描述:</strong> {meeting_description}</p><p><strong>加入链接:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>此致敬礼,<br><strong>{app_name} 团队</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(129,9,'en','Google Meet Invitation: {meeting_title}','<h2>You have been invited to a Google Meet!</h2><p>Hello <strong>{member_name}</strong>,</p><p>You have been invited to join the Google Meet \"<strong>{meeting_title}</strong>\".</p><p><strong>Meeting:</strong> {meeting_title}</p><p><strong>Project:</strong> {project_name}</p><p><strong>Start Time:</strong> {start_time}</p><p><strong>Duration:</strong> {duration} minutes</p><p><strong>Organizer:</strong> {organizer_name}</p><p><strong>Description:</strong> {meeting_description}</p><p><strong>Join URL:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Best regards,<br><strong>The {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(130,9,'es','Invitación a Google Meet: {meeting_title}','<h2>¡Has sido invitado a Google Meet!</h2><p>Hola <strong>{member_name}</strong>,</p><p>Has sido invitado a unirte a Google Meet \"<strong>{meeting_title}</strong>\".</p><p><strong>Reunión:</strong> {meeting_title}</p><p><strong>Proyecto:</strong> {project_name}</p><p><strong>Hora de inicio:</strong> {start_time}</p><p><strong>Duración:</strong> {duration} minutos</p><p><strong>Organizador:</strong> {organizer_name}</p><p><strong>Descripción:</strong> {meeting_description}</p><p><strong>URL de unión:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Saludos cordiales,<br><strong>El equipo de {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(131,9,'ar','دعوة لـ Google Meet: {meeting_title}','<h2>تمت دعوتك إلى Google Meet!</h2><p>مرحباً <strong>{member_name}</strong>،</p><p>تمت دعوتك للانضمام إلى Google Meet \"<strong>{meeting_title}</strong>\".</p><p><strong>الاجتماع:</strong> {meeting_title}</p><p><strong>المشروع:</strong> {project_name}</p><p><strong>وقت البداية:</strong> {start_time}</p><p><strong>المدة:</strong> {duration} دقيقة</p><p><strong>المنظم:</strong> {organizer_name}</p><p><strong>الوصف:</strong> {meeting_description}</p><p><strong>رابط الانضمام:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>مع أطيب التحيات,<br><strong>فريق {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(132,9,'da','Google Meet invitation: {meeting_title}','<h2>Du er blevet inviteret til Google Meet!</h2><p>Hej <strong>{member_name}</strong>,</p><p>Du er blevet inviteret til at deltage i Google Meet \"<strong>{meeting_title}</strong>\".</p><p><strong>Møde:</strong> {meeting_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Starttid:</strong> {start_time}</p><p><strong>Varighed:</strong> {duration} minutter</p><p><strong>Arrangør:</strong> {organizer_name}</p><p><strong>Beskrivelse:</strong> {meeting_description}</p><p><strong>Deltag URL:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Venlig hilsen,<br><strong>{app_name} Teamet</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(133,9,'de','Google Meet Einladung: {meeting_title}','<h2>Sie wurden zu Google Meet eingeladen!</h2><p>Hallo <strong>{member_name}</strong>,</p><p>Sie wurden eingeladen, an Google Meet \"<strong>{meeting_title}</strong>\" teilzunehmen.</p><p><strong>Meeting:</strong> {meeting_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Startzeit:</strong> {start_time}</p><p><strong>Dauer:</strong> {duration} Minuten</p><p><strong>Organisator:</strong> {organizer_name}</p><p><strong>Beschreibung:</strong> {meeting_description}</p><p><strong>Beitritts-URL:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Mit freundlichen Grüßen,<br><strong>Das {app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(134,9,'fr','Invitation Google Meet : {meeting_title}','<h2>Vous avez été invité à Google Meet !</h2><p>Bonjour <strong>{member_name}</strong>,</p><p>Vous avez été invité à rejoindre Google Meet \"<strong>{meeting_title}</strong>\".</p><p><strong>Réunion :</strong> {meeting_title}</p><p><strong>Projet :</strong> {project_name}</p><p><strong>Heure de début :</strong> {start_time}</p><p><strong>Durée :</strong> {duration} minutes</p><p><strong>Organisateur :</strong> {organizer_name}</p><p><strong>Description :</strong> {meeting_description}</p><p><strong>URL de participation :</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Cordialement,<br><strong>L\'équipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(135,9,'he','הזמנה ל-Google Meet: {meeting_title}','<h2>הוזמנת ל-Google Meet!</h2><p>שלום <strong>{member_name}</strong>,</p><p>הוזמנת להצטרף ל-Google Meet \"<strong>{meeting_title}</strong>\".</p><p><strong>פגישה:</strong> {meeting_title}</p><p><strong>פרויקט:</strong> {project_name}</p><p><strong>שעת התחלה:</strong> {start_time}</p><p><strong>משך:</strong> {duration} דקות</p><p><strong>מארגן:</strong> {organizer_name}</p><p><strong>תיאור:</strong> {meeting_description}</p><p><strong>קישור הצטרפות:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>בברכה,<br><strong>צוות {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(136,9,'it','Invito Google Meet: {meeting_title}','<h2>Sei stato invitato a Google Meet!</h2><p>Ciao <strong>{member_name}</strong>,</p><p>Sei stato invitato a partecipare a Google Meet \"<strong>{meeting_title}</strong>\".</p><p><strong>Riunione:</strong> {meeting_title}</p><p><strong>Progetto:</strong> {project_name}</p><p><strong>Ora di inizio:</strong> {start_time}</p><p><strong>Durata:</strong> {duration} minuti</p><p><strong>Organizzatore:</strong> {organizer_name}</p><p><strong>Descrizione:</strong> {meeting_description}</p><p><strong>URL di partecipazione:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Cordiali saluti,<br><strong>Il team {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(137,9,'ja','Google Meet への招待: {meeting_title}','<h2>Google Meet に招待されました！</h2><p>こんにちは <strong>{member_name}</strong> さん、</p><p>Google Meet \"<strong>{meeting_title}</strong>\" に招待されました。</p><p><strong>会議:</strong> {meeting_title}</p><p><strong>プロジェクト:</strong> {project_name}</p><p><strong>開始時間:</strong> {start_time}</p><p><strong>時間:</strong> {duration} 分</p><p><strong>主催者:</strong> {organizer_name}</p><p><strong>説明:</strong> {meeting_description}</p><p><strong>参加URL:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>よろしくお願いします,<br><strong>{app_name} チーム</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(138,9,'nl','Google Meet uitnodiging: {meeting_title}','<h2>Je bent uitgenodigd voor Google Meet!</h2><p>Hallo <strong>{member_name}</strong>,</p><p>Je bent uitgenodigd om deel te nemen aan Google Meet \"<strong>{meeting_title}</strong>\".</p><p><strong>Meeting:</strong> {meeting_title}</p><p><strong>Project:</strong> {project_name}</p><p><strong>Starttijd:</strong> {start_time}</p><p><strong>Duur:</strong> {duration} minuten</p><p><strong>Organisator:</strong> {organizer_name}</p><p><strong>Beschrijving:</strong> {meeting_description}</p><p><strong>Deelname URL:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Met vriendelijke groet,<br><strong>{app_name} Team</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(139,9,'pl','Zaproszenie na Google Meet: {meeting_title}','<h2>Zostałeś zaproszony na Google Meet!</h2><p>Cześć <strong>{member_name}</strong>,</p><p>Zostałeś zaproszony do udziału w Google Meet \"<strong>{meeting_title}</strong>\".</p><p><strong>Spotkanie:</strong> {meeting_title}</p><p><strong>Projekt:</strong> {project_name}</p><p><strong>Czas rozpoczęcia:</strong> {start_time}</p><p><strong>Czas trwania:</strong> {duration} minut</p><p><strong>Organizator:</strong> {organizer_name}</p><p><strong>Opis:</strong> {meeting_description}</p><p><strong>URL dołączenia:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Z poważaniem,<br><strong>Zespół {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(140,9,'pt','Convite para Google Meet: {meeting_title}','<h2>Você foi convidado para Google Meet!</h2><p>Olá <strong>{member_name}</strong>,</p><p>Você foi convidado para participar do Google Meet \"<strong>{meeting_title}</strong>\".</p><p><strong>Reunião:</strong> {meeting_title}</p><p><strong>Projeto:</strong> {project_name}</p><p><strong>Horário de início:</strong> {start_time}</p><p><strong>Duração:</strong> {duration} minutos</p><p><strong>Organizador:</strong> {organizer_name}</p><p><strong>Descrição:</strong> {meeting_description}</p><p><strong>URL de participação:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Atenciosamente,<br><strong>Equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(141,9,'pt-BR','Convite para Google Meet: {meeting_title}','<h2>Você foi convidado para Google Meet!</h2><p>Olá <strong>{member_name}</strong>,</p><p>Você foi convidado para participar do Google Meet \"<strong>{meeting_title}</strong>\".</p><p><strong>Reunião:</strong> {meeting_title}</p><p><strong>Projeto:</strong> {project_name}</p><p><strong>Horário de início:</strong> {start_time}</p><p><strong>Duração:</strong> {duration} minutos</p><p><strong>Organizador:</strong> {organizer_name}</p><p><strong>Descrição:</strong> {meeting_description}</p><p><strong>URL de participação:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Atenciosamente,<br><strong>Equipe {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(142,9,'ru','Приглашение на Google Meet: {meeting_title}','<h2>Вас пригласили на Google Meet!</h2><p>Здравствуйте <strong>{member_name}</strong>,</p><p>Вас пригласили присоединиться к Google Meet \"<strong>{meeting_title}</strong>\".</p><p><strong>Встреча:</strong> {meeting_title}</p><p><strong>Проект:</strong> {project_name}</p><p><strong>Время начала:</strong> {start_time}</p><p><strong>Продолжительность:</strong> {duration} минут</p><p><strong>Организатор:</strong> {organizer_name}</p><p><strong>Описание:</strong> {meeting_description}</p><p><strong>Ссылка для подключения:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>С уважением,<br><strong>Команда {app_name}</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(143,9,'tr','Google Meet Daveti: {meeting_title}','<h2>Google Meet\'e davet edildiniz!</h2><p>Merhaba <strong>{member_name}</strong>,</p><p>\"<strong>{meeting_title}</strong>\" Google Meet toplantısına katılmaya davet edildiniz.</p><p><strong>Toplantı:</strong> {meeting_title}</p><p><strong>Proje:</strong> {project_name}</p><p><strong>Başlangıç Saati:</strong> {start_time}</p><p><strong>Süre:</strong> {duration} dakika</p><p><strong>Düzenleyen:</strong> {organizer_name}</p><p><strong>Açıklama:</strong> {meeting_description}</p><p><strong>Katılım URL:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>Saygılarımızla,<br><strong>{app_name} Ekibi</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39'),
(144,9,'zh','Google Meet 邀请: {meeting_title}','<h2>您被邀请参加Google Meet！</h2><p>您好 <strong>{member_name}</strong>,</p><p>您被邀请参加Google Meet \"<strong>{meeting_title}</strong>\"。</p><p><strong>会议:</strong> {meeting_title}</p><p><strong>项目:</strong> {project_name}</p><p><strong>开始时间:</strong> {start_time}</p><p><strong>时长:</strong> {duration} 分钟</p><p><strong>组织者:</strong> {organizer_name}</p><p><strong>描述:</strong> {meeting_description}</p><p><strong>加入链接:</strong> <a href=\"{join_url}\">{join_url}</a></p><p>此致敬礼,<br><strong>{app_name} 团队</strong></p>','2026-03-09 13:00:39','2026-03-09 13:00:39');
/*!40000 ALTER TABLE `email_template_langs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_templates`
--

DROP TABLE IF EXISTS `email_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_templates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `from` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) unsigned NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_templates`
--

LOCK TABLES `email_templates` WRITE;
/*!40000 ALTER TABLE `email_templates` DISABLE KEYS */;
INSERT INTO `email_templates` VALUES
(1,'Workspace Invitation','Support Team',1,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(2,'Project Assignment','Support Team',1,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(3,'Task Assignment','Support Team',1,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(4,'Bug Assignment','Support Team',1,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(5,'Expense Notification','Finance Team',1,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(6,'Invoice Notification','Billing Team',1,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(7,'New Contract','Support Team',1,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(8,'Zoom Meeting Notification','Support Team',1,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(9,'Google Meeting Notification','Support Team',1,'2026-03-09 13:00:39','2026-03-09 13:00:39');
/*!40000 ALTER TABLE `email_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipment`
--

DROP TABLE IF EXISTS `equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `equipment` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `project_id` bigint(20) unsigned NOT NULL,
  `equipment_type_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(32) NOT NULL,
  `qr_token` varchar(64) DEFAULT NULL,
  `installation_date` date DEFAULT NULL,
  `last_service_date` date DEFAULT NULL,
  `health_status` enum('green','yellow','red') NOT NULL DEFAULT 'green',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `equipment_code_unique` (`code`),
  UNIQUE KEY `equipment_qr_token_unique` (`qr_token`),
  KEY `equipment_workspace_id_index` (`workspace_id`),
  KEY `equipment_project_id_index` (`project_id`),
  KEY `equipment_equipment_type_id_index` (`equipment_type_id`),
  KEY `equipment_qr_token_index` (`qr_token`),
  CONSTRAINT `equipment_equipment_type_id_foreign` FOREIGN KEY (`equipment_type_id`) REFERENCES `equipment_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `equipment_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `equipment_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment`
--

LOCK TABLES `equipment` WRITE;
/*!40000 ALTER TABLE `equipment` DISABLE KEYS */;
INSERT INTO `equipment` VALUES
(38,2,16,1,'HYUNDAI EFJ2-48ARN1 BAT02','EQ-0001','hDOtU2O4pAadYFXzJ8pJUyplwFbImfKC','2026-02-01',NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(39,2,16,1,'HYUNDAI EFJ2-48ARN1 BAT01','EQ-0002','OB05oRkbEn0gGepcUrso3u7tPMNncO3l','2026-02-01',NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(40,2,14,1,'HYUNDAI EFJ2-48ARN1 ZU01','EQ-0003','8YnGn3DrtpCluFrOEjonFQo2ayfTaVTp','2025-11-01','2026-01-30','green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(41,2,13,1,'Midea Textile','EQ-0004','kuapdVj0dXpOS7ohysZDmvqNlXCzsX1Y',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(42,2,13,1,'კოლონური კონდიციონერი MFM-60ARN1-RB6 Flor 2','EQ-0005','BAKoycDLg0iK0xw1IWpqODLCcRhzmnpq',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(43,2,13,1,'კოლონური კონდიციონერი MFM-60ARN1-RB6','EQ-0006','WbSs5FzmpJ76VOVR8aPwJXiRayZNJkUX',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(44,2,10,1,'Midea Cashier','EQ-0007','yOtWAA7D4Yjw21vrUEQHBMcsnfYtDqya',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(45,2,10,1,'Midea BA01','EQ-0008','MADzFyFYDLZUXvbA6M0clBTvSaFz8JRh',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(46,2,6,1,'Aux VA08','EQ-0009','BIxQL4QWmrSuXPcIQTUnhxtD8dTaL5pw',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(47,2,6,1,'Aux VA07','EQ-0010','mAhYiuev06xURtr3MG16inGBv8PHboAa',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(48,2,6,1,'Kt-tech VA06','EQ-0011','snbSzaIDIhyKrsDO8NPwsG35LW93kbaT',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(49,2,6,1,'Kt-tech VA05','EQ-0012','TeUCnzwymen7F8u0Uy2sneYL1D4MaowT',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(50,2,6,1,'Aux VA04','EQ-0013','QYK1mlf56GdaIIlCyYapgWn17sIFVfJv',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(51,2,6,1,'Hisense VA03','EQ-0014','bHADxirbMlMbyODk1T1DDNGZ0Yfpdruu',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(52,2,6,1,'Kt-tech VA02','EQ-0015','sptBBnWt1DdanXU7si4BWISQphbFkT63',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(53,2,6,1,'Midea VA01','EQ-0016','WdpfxzrdGTlqSdtQQJuCGtIEyLw8iPV5',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(54,2,5,1,'Samsung RU03','EQ-0017','c472KwubQepW0CjzRhp9QoeL0kShg6wU',NULL,NULL,'yellow','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(55,2,5,1,'Samsung RU04','EQ-0018','BZSUVQPoVNbiSV23WMCwhUG36ewDykHu',NULL,NULL,'yellow','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(56,2,5,1,'Samsung RU05','EQ-0019','wX1bsTJKE3TPXBcwssYNyVIUcJH4v0HD',NULL,NULL,'yellow','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(57,2,5,1,'Samsung RU06','EQ-0020','qoAg928iqONeW17rTcWqRMGgigfoJbVH',NULL,NULL,'red','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(58,2,5,1,'Samsung RU07','EQ-0021','Fu037jXYlHf2ZKuSOCrRU198ZSndv323',NULL,NULL,'red','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(59,2,5,1,'Samsung RU08','EQ-0022','JlrkMjj2oj45XnLfFqIDiRjS5DmYMkkx',NULL,NULL,'red','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(60,2,2,1,'Midea System','EQ-0023','zzusehfsT0mS8X4j4vD7dMcWdTxtyKwQ',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(61,2,2,1,'Midea PL02','EQ-0024','SZAv1CuCg3sxEmvJbpkO0mn1H5E7z8Oh',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(62,2,2,1,'Midea curtain PL01','EQ-0025','xqWN69cPKvwxVrhjuSXbxvfTZD9MRtpd',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(63,2,7,1,'Midea GL01','EQ-0026','qzZZAPlYfDAG7ZuQ5pp1ZLmW1bSl6i6z',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(64,2,7,1,'Midea GL02','EQ-0027','VzjjVAjJpu1LSil0SqZntCqLgcDGU8d1',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(65,2,7,1,'Midea GL03','EQ-0028','GQq9qOcMwPfgdvVv3f4EOboDFHQvkw6p',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(66,2,7,1,'Midea GL04','EQ-0029','OGASxF7FNwJUAGYaIufyukkUlsTey8xW',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(67,2,7,1,'Midea GL05','EQ-0030','fLMUnlxu2VRWKs7SELW5rKEJnrsfcJRW',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(68,2,7,1,'Midea GL06','EQ-0031','JwOS2zGqxP0b0DNr9oSDfBtqI7AxVTL6',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(69,2,7,1,'Midea GL07','EQ-0032','4dCBDUPDpcueygieON9WblO4D5ueOqSJ',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(70,2,7,1,'Midea GL08','EQ-0033','zXe08DjGu6oh4ToiBDloWiTp1Ugyel5Y',NULL,NULL,'red','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(71,2,7,1,'Midea GL09','EQ-0034','1kr0sWpdlxC9xYRB4jYhRqxhcNH6kDOw',NULL,NULL,'red','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(72,2,12,1,'CH 01','EQ-0035','irfSs4fdlmd2CaoTOlYTkaaX6NGoUbrE',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(73,2,12,1,'CH 02','EQ-0036','dTVWC1KKycITYYlJnDQRjPnwTyPDE4gw',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(74,2,12,1,'CH 03','EQ-0037','nE0LmwKxZNDwYrKrGDb7h85Odr72RdKd',NULL,NULL,'green','xN','2026-03-09 13:49:55','2026-03-09 13:49:55'),
(75,2,3,1,'Midea IS01','EQ-0038','OBBGiekQpNCoRbmggpkcupsbLW49YlTE',NULL,NULL,'green','xN','2026-03-09 13:51:21','2026-03-09 13:51:21'),
(76,2,3,1,'Midea IS02','EQ-0039','S5P5PSTiJ0jjsdoW0I5azL9bdlHxBsKI',NULL,NULL,'green','xN','2026-03-09 13:51:21','2026-03-09 13:51:21'),
(77,2,3,1,'Midea IS03','EQ-0040','lLw4si9Eml1Os9YOVSnWrW9MIIG4h4Cv',NULL,NULL,'red','xN','2026-03-09 13:51:21','2026-03-09 13:51:21'),
(78,2,3,1,'Midea IS04','EQ-0041','NqH68eShYx6nnGQp1mCRflgCLbDaHTRh',NULL,NULL,'green','xN','2026-03-09 13:51:21','2026-03-09 13:51:21'),
(79,2,3,1,'HYUNDAI  IS05','EQ-0042','mYUnCo4tlWbdirlwjkrxG7xHZ1FhlOb3',NULL,NULL,'green','xN','2026-03-09 13:51:21','2026-03-09 13:51:21');
/*!40000 ALTER TABLE `equipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipment_consumable_limits`
--

DROP TABLE IF EXISTS `equipment_consumable_limits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `equipment_consumable_limits` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `equipment_type_id` bigint(20) unsigned NOT NULL,
  `consumable_type` varchar(255) NOT NULL,
  `max_quantity` decimal(12,4) NOT NULL,
  `unit` varchar(20) NOT NULL DEFAULT 'kg',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `eq_consumable_type_unique` (`equipment_type_id`,`consumable_type`),
  KEY `equipment_consumable_limits_equipment_type_id_index` (`equipment_type_id`),
  CONSTRAINT `equipment_consumable_limits_equipment_type_id_foreign` FOREIGN KEY (`equipment_type_id`) REFERENCES `equipment_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment_consumable_limits`
--

LOCK TABLES `equipment_consumable_limits` WRITE;
/*!40000 ALTER TABLE `equipment_consumable_limits` DISABLE KEYS */;
/*!40000 ALTER TABLE `equipment_consumable_limits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipment_schedules`
--

DROP TABLE IF EXISTS `equipment_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `equipment_schedules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `equipment_id` bigint(20) unsigned NOT NULL,
  `service_type_id` bigint(20) unsigned NOT NULL,
  `interval_days` int(11) NOT NULL,
  `advance_days` int(11) NOT NULL DEFAULT 5,
  `last_service_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `equipment_schedules_equipment_id_service_type_id_unique` (`equipment_id`,`service_type_id`),
  KEY `equipment_schedules_equipment_id_index` (`equipment_id`),
  KEY `equipment_schedules_service_type_id_index` (`service_type_id`),
  CONSTRAINT `equipment_schedules_equipment_id_foreign` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `equipment_schedules_service_type_id_foreign` FOREIGN KEY (`service_type_id`) REFERENCES `service_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment_schedules`
--

LOCK TABLES `equipment_schedules` WRITE;
/*!40000 ALTER TABLE `equipment_schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `equipment_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipment_service_photos`
--

DROP TABLE IF EXISTS `equipment_service_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `equipment_service_photos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) unsigned NOT NULL,
  `media_item_id` bigint(20) unsigned DEFAULT NULL,
  `type` enum('before','after') NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `equipment_service_photos_task_id_index` (`task_id`),
  KEY `equipment_service_photos_task_id_type_index` (`task_id`,`type`),
  KEY `equipment_service_photos_media_item_id_foreign` (`media_item_id`),
  CONSTRAINT `equipment_service_photos_media_item_id_foreign` FOREIGN KEY (`media_item_id`) REFERENCES `media_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `equipment_service_photos_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment_service_photos`
--

LOCK TABLES `equipment_service_photos` WRITE;
/*!40000 ALTER TABLE `equipment_service_photos` DISABLE KEYS */;
/*!40000 ALTER TABLE `equipment_service_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipment_types`
--

DROP TABLE IF EXISTS `equipment_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `equipment_types` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `equipment_types_workspace_id_index` (`workspace_id`),
  CONSTRAINT `equipment_types_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment_types`
--

LOCK TABLES `equipment_types` WRITE;
/*!40000 ALTER TABLE `equipment_types` DISABLE KEYS */;
INSERT INTO `equipment_types` VALUES
(1,2,'კონდიციონერი',1,'2026-03-09 13:37:49','2026-03-09 13:37:49'),
(2,2,'გენერატორი',2,'2026-03-09 13:37:56','2026-03-09 13:37:56');
/*!40000 ALTER TABLE `equipment_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_approvals`
--

DROP TABLE IF EXISTS `expense_approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `expense_approvals` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_expense_id` bigint(20) unsigned NOT NULL,
  `approver_id` bigint(20) unsigned NOT NULL,
  `status` enum('pending','approved','rejected','requires_info') NOT NULL,
  `notes` text DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approval_level` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expense_approvals_project_expense_id_status_index` (`project_expense_id`,`status`),
  KEY `expense_approvals_approver_id_status_index` (`approver_id`,`status`),
  CONSTRAINT `expense_approvals_approver_id_foreign` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `expense_approvals_project_expense_id_foreign` FOREIGN KEY (`project_expense_id`) REFERENCES `project_expenses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_approvals`
--

LOCK TABLES `expense_approvals` WRITE;
/*!40000 ALTER TABLE `expense_approvals` DISABLE KEYS */;
/*!40000 ALTER TABLE `expense_approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_attachments`
--

DROP TABLE IF EXISTS `expense_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `expense_attachments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_expense_id` bigint(20) unsigned NOT NULL,
  `media_item_id` bigint(20) unsigned NOT NULL,
  `uploaded_by` bigint(20) unsigned NOT NULL,
  `attachment_type` varchar(255) NOT NULL DEFAULT 'receipt',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expense_attachments_project_expense_id_index` (`project_expense_id`),
  KEY `expense_attachments_media_item_id_foreign` (`media_item_id`),
  KEY `expense_attachments_uploaded_by_foreign` (`uploaded_by`),
  CONSTRAINT `expense_attachments_media_item_id_foreign` FOREIGN KEY (`media_item_id`) REFERENCES `media_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `expense_attachments_project_expense_id_foreign` FOREIGN KEY (`project_expense_id`) REFERENCES `project_expenses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `expense_attachments_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_attachments`
--

LOCK TABLES `expense_attachments` WRITE;
/*!40000 ALTER TABLE `expense_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `expense_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_recurring`
--

DROP TABLE IF EXISTS `expense_recurring`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `expense_recurring` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) unsigned NOT NULL,
  `budget_category_id` bigint(20) unsigned DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `vendor` varchar(255) DEFAULT NULL,
  `frequency` enum('weekly','monthly','quarterly','yearly') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `next_occurrence` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expense_recurring_project_id_is_active_index` (`project_id`,`is_active`),
  KEY `expense_recurring_next_occurrence_index` (`next_occurrence`),
  KEY `expense_recurring_budget_category_id_foreign` (`budget_category_id`),
  KEY `expense_recurring_created_by_foreign` (`created_by`),
  CONSTRAINT `expense_recurring_budget_category_id_foreign` FOREIGN KEY (`budget_category_id`) REFERENCES `budget_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expense_recurring_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `expense_recurring_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_recurring`
--

LOCK TABLES `expense_recurring` WRITE;
/*!40000 ALTER TABLE `expense_recurring` DISABLE KEYS */;
/*!40000 ALTER TABLE `expense_recurring` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_workflows`
--

DROP TABLE IF EXISTS `expense_workflows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `expense_workflows` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_expense_id` bigint(20) unsigned NOT NULL,
  `step` int(11) NOT NULL,
  `approver_id` bigint(20) unsigned NOT NULL,
  `status` enum('pending','approved','rejected','waiting','cancelled') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expense_workflows_project_expense_id_step_index` (`project_expense_id`,`step`),
  KEY `expense_workflows_approver_id_status_index` (`approver_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_workflows`
--

LOCK TABLES `expense_workflows` WRITE;
/*!40000 ALTER TABLE `expense_workflows` DISABLE KEYS */;
/*!40000 ALTER TABLE `expense_workflows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `google_meeting_members`
--

DROP TABLE IF EXISTS `google_meeting_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `google_meeting_members` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `google_meeting_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `google_meeting_members_google_meeting_id_user_id_unique` (`google_meeting_id`,`user_id`),
  KEY `google_meeting_members_user_id_foreign` (`user_id`),
  CONSTRAINT `google_meeting_members_google_meeting_id_foreign` FOREIGN KEY (`google_meeting_id`) REFERENCES `google_meetings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `google_meeting_members_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `google_meeting_members`
--

LOCK TABLES `google_meeting_members` WRITE;
/*!40000 ALTER TABLE `google_meeting_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `google_meeting_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `google_meetings`
--

DROP TABLE IF EXISTS `google_meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `google_meetings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `duration` int(11) NOT NULL,
  `join_url` text DEFAULT NULL,
  `start_url` text DEFAULT NULL,
  `status` enum('scheduled','started','ended','cancelled') NOT NULL DEFAULT 'scheduled',
  `type` enum('instant','scheduled','recurring') NOT NULL DEFAULT 'scheduled',
  `user_id` bigint(20) unsigned NOT NULL,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `project_id` bigint(20) unsigned DEFAULT NULL,
  `google_calendar_event_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `google_meetings_user_id_start_time_index` (`user_id`,`start_time`),
  KEY `google_meetings_workspace_id_start_time_index` (`workspace_id`,`start_time`),
  KEY `google_meetings_project_id_start_time_index` (`project_id`,`start_time`),
  KEY `google_meetings_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `google_meetings`
--

LOCK TABLES `google_meetings` WRITE;
/*!40000 ALTER TABLE `google_meetings` DISABLE KEYS */;
/*!40000 ALTER TABLE `google_meetings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_item_task`
--

DROP TABLE IF EXISTS `invoice_item_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invoice_item_task` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `invoice_item_id` bigint(20) unsigned NOT NULL,
  `task_id` bigint(20) unsigned NOT NULL,
  `quantity` decimal(15,4) NOT NULL DEFAULT 1.0000,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_item_task_invoice_item_id_task_id_unique` (`invoice_item_id`,`task_id`),
  KEY `invoice_item_task_task_id_foreign` (`task_id`),
  CONSTRAINT `invoice_item_task_invoice_item_id_foreign` FOREIGN KEY (`invoice_item_id`) REFERENCES `invoice_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoice_item_task_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_item_task`
--

LOCK TABLES `invoice_item_task` WRITE;
/*!40000 ALTER TABLE `invoice_item_task` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice_item_task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invoice_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint(20) unsigned NOT NULL,
  `task_id` bigint(20) unsigned DEFAULT NULL,
  `expense_id` bigint(20) unsigned DEFAULT NULL,
  `timesheet_entry_id` bigint(20) unsigned DEFAULT NULL,
  `asset_category_id` bigint(20) unsigned DEFAULT NULL,
  `asset_id` bigint(20) unsigned DEFAULT NULL,
  `asset_name` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'custom',
  `description` varchar(255) NOT NULL,
  `quantity` decimal(12,4) NOT NULL DEFAULT 1.0000,
  `rate` decimal(15,2) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `tax_id` bigint(20) unsigned DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `equipment_id` bigint(20) unsigned DEFAULT NULL,
  `service_type_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_items_invoice_id_sort_order_index` (`invoice_id`,`sort_order`),
  KEY `invoice_items_task_id_index` (`task_id`),
  KEY `invoice_items_expense_id_index` (`expense_id`),
  KEY `invoice_items_timesheet_entry_id_foreign` (`timesheet_entry_id`),
  KEY `invoice_items_asset_category_id_foreign` (`asset_category_id`),
  KEY `invoice_items_tax_id_foreign` (`tax_id`),
  KEY `invoice_items_asset_id_foreign` (`asset_id`),
  KEY `invoice_items_equipment_id_foreign` (`equipment_id`),
  KEY `invoice_items_service_type_id_foreign` (`service_type_id`),
  CONSTRAINT `invoice_items_asset_category_id_foreign` FOREIGN KEY (`asset_category_id`) REFERENCES `asset_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_items_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_items_equipment_id_foreign` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_items_expense_id_foreign` FOREIGN KEY (`expense_id`) REFERENCES `project_expenses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_items_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoice_items_service_type_id_foreign` FOREIGN KEY (`service_type_id`) REFERENCES `service_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_items_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_items_tax_id_foreign` FOREIGN KEY (`tax_id`) REFERENCES `taxes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_items_timesheet_entry_id_foreign` FOREIGN KEY (`timesheet_entry_id`) REFERENCES `timesheet_entries` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
INSERT INTO `invoice_items` VALUES
(1,1,1,NULL,NULL,NULL,1,'AL94 პეტლი SM 11','asset','AL94 პეტლი SM 11',4.0000,6.03,24.12,1,1,'2026-03-09 13:36:15','2026-03-09 13:36:25',NULL,NULL);
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_project`
--

DROP TABLE IF EXISTS `invoice_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invoice_project` (
  `invoice_id` bigint(20) unsigned NOT NULL,
  `project_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`invoice_id`,`project_id`),
  KEY `invoice_project_project_id_foreign` (`project_id`),
  CONSTRAINT `invoice_project_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoice_project_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_project`
--

LOCK TABLES `invoice_project` WRITE;
/*!40000 ALTER TABLE `invoice_project` DISABLE KEYS */;
INSERT INTO `invoice_project` VALUES
(1,3);
/*!40000 ALTER TABLE `invoice_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_task`
--

DROP TABLE IF EXISTS `invoice_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invoice_task` (
  `invoice_id` bigint(20) unsigned NOT NULL,
  `task_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`invoice_id`,`task_id`),
  KEY `invoice_task_task_id_foreign` (`task_id`),
  CONSTRAINT `invoice_task_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoice_task_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_task`
--

LOCK TABLES `invoice_task` WRITE;
/*!40000 ALTER TABLE `invoice_task` DISABLE KEYS */;
INSERT INTO `invoice_task` VALUES
(1,1);
/*!40000 ALTER TABLE `invoice_task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invoices` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(255) NOT NULL,
  `project_id` bigint(20) unsigned NOT NULL,
  `task_id` bigint(20) unsigned DEFAULT NULL,
  `budget_category_id` bigint(20) unsigned DEFAULT NULL,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `client_id` bigint(20) unsigned DEFAULT NULL,
  `crm_contact_id` bigint(20) unsigned DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `subtotal` decimal(15,2) NOT NULL DEFAULT 0.00,
  `tax_rate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`tax_rate`)),
  `tax_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(15,2) NOT NULL,
  `status` enum('draft','sent','viewed','paid','PartialPaid','overdue','cancelled') NOT NULL DEFAULT 'draft',
  `paid_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `sent_at` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `viewed_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `assets_processed_at` timestamp NULL DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `payment_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payment_details`)),
  `client_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`client_details`)),
  `notes` text DEFAULT NULL,
  `terms` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `payment_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoices_invoice_number_unique` (`invoice_number`),
  KEY `invoices_project_id_status_index` (`project_id`,`status`),
  KEY `invoices_workspace_id_status_index` (`workspace_id`,`status`),
  KEY `invoices_client_id_status_index` (`client_id`,`status`),
  KEY `invoices_status_due_date_index` (`status`,`due_date`),
  KEY `invoices_invoice_date_index` (`invoice_date`),
  KEY `invoices_created_by_foreign` (`created_by`),
  KEY `invoices_budget_category_id_foreign` (`budget_category_id`),
  KEY `invoices_approved_by_foreign` (`approved_by`),
  KEY `invoices_task_id_foreign` (`task_id`),
  KEY `invoices_crm_contact_id_foreign` (`crm_contact_id`),
  CONSTRAINT `invoices_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_budget_category_id_foreign` FOREIGN KEY (`budget_category_id`) REFERENCES `budget_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoices_crm_contact_id_foreign` FOREIGN KEY (`crm_contact_id`) REFERENCES `crm_contacts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoices_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES
(1,'INV-2026-0001',3,1,NULL,2,NULL,NULL,3,'INV 09.03',NULL,'2026-03-09',NULL,20.44,'[{\"id\":1,\"name\":\"\\u10d3.\\u10e6.\\u10d2\",\"rate\":18,\"is_inclusive\":true,\"amount\":3.6793220338983055}]',3.68,24.12,'paid',24.12,NULL,'2026-03-09 13:36:18',3,NULL,'2026-03-09 13:36:25',NULL,'company_card',NULL,NULL,NULL,NULL,NULL,'2026-03-09 13:36:15','2026-03-09 13:50:50','QMNf8w4wJml8JMw3TlH65d5lmhH1OV3T');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `landing_page_custom_pages`
--

DROP TABLE IF EXISTS `landing_page_custom_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `landing_page_custom_pages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `landing_page_custom_pages_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `landing_page_custom_pages`
--

LOCK TABLES `landing_page_custom_pages` WRITE;
/*!40000 ALTER TABLE `landing_page_custom_pages` DISABLE KEYS */;
INSERT INTO `landing_page_custom_pages` VALUES
(1,'About Us','about-us','About Our Project Management Platform: Empowering teams to <b>work smarter, collaborate better, and deliver faster</b>.<br>We are dedicated to helping organizations streamline project workflows, optimize team productivity, and achieve project success with ease.<br>Our Humana Tasks platform centralizes project data, automates repetitive tasks, and provides actionable insights to drive team performance.<br>Whether you\'re a startup or an enterprise, our platform adapts to your project needs—from planning to delivery—ensuring transparency, collaboration, and measurable results.<br><b>Stats:</b> &bull; 4+ Years Industry Experience &bull; 10K+ Active Teams &bull; 50+ Countries Served<br><b>Our Mission:</b> Transform the way teams work by providing scalable, intelligent, and user-friendly project management solutions.<br><b>Our Values:</b> Innovation, transparency, and team success are at the heart of everything we build.<br><b>Our Commitment:</b> Deliver secure, scalable, and reliable project solutions with world-class support.<br><b>Our Vision:</b> A future where every team maximizes its potential through automation, data-driven decisions, and seamless collaboration.','About Humana Tasks - Project Management & Team Collaboration Platform','Learn about Humana Tasks, the comprehensive project management platform with task management, time tracking, budgeting, and team collaboration features.',1,1,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(2,'Privacy Policy','privacy-policy','Privacy Policy for Humana Tasks Project Management Platform: We are committed to <b>protecting your privacy and securing your data</b>.<br>This policy explains how we collect, use, and safeguard your information when using our project management services.<br>We collect only necessary data to provide excellent project management experiences and never sell your personal information.<br><b>Information We Collect:</b> &bull; Account details (name, email, company) &bull; Project data (tasks, files, timesheets) &bull; Usage analytics &bull; Communication within workspaces<br><b>How We Use Data:</b> &bull; Provide project management services &bull; Process payments and subscriptions &bull; Send project notifications &bull; Improve platform functionality<br><b>Data Security:</b> Enterprise-grade encryption, secure backups, and strict access controls protect your information.<br><b>Data Sharing:</b> We never sell your data. Information is only shared within your team and approved integrations.<br><b>Your Rights:</b> Access, update, or delete your data anytime. Contact privacy@taskly.com for assistance.<br><b>Contact:</b> For privacy questions, reach us at privacy@taskly.com or through our support center.','Privacy Policy - Humana Tasks','Read our privacy policy to understand how Humana Tasks collects, uses, and protects your personal information.',1,2,'2026-03-09 13:00:39','2026-03-09 13:00:39'),
(3,'Help & Support','help-support','Help & Support for Humana Tasks: Get the most out of our platform with <b>comprehensive support resources and expert guidance</b>.<br>We provide extensive documentation, tutorials, and 24/7 support to ensure your team\'s success with project management.<br>Our support team is dedicated to helping you maximize productivity and achieve your project goals efficiently.<br><b>Quick Start Guide:</b> &bull; Create workspace and invite team members &bull; Set up your first project with milestones &bull; Create and assign tasks &bull; Start time tracking and budget management &bull; Generate progress reports<br><b>Key Features Help:</b> &bull; Projects: Create, organize, and track progress &bull; Tasks: Break down work with deadlines &bull; Timesheets: Track time spent on activities &bull; Budgets: Manage project finances &bull; Reports: Monitor team performance<br><b>Support Channels:</b> &bull; Live chat support (24/7) &bull; Email support: support@taskly.com &bull; Knowledge base and tutorials &bull; Video training sessions &bull; Community forums<br><b>Common Questions:</b> How to invite team members, set up integrations, manage permissions, export data, and customize workflows.<br><b>Training Resources:</b> Free onboarding sessions, webinars, and certification programs available for all users.','Help & Support - Humana Tasks Project Management','Get help with Humana Tasks project management features. Find guides, documentation, and contact support.',1,4,'2026-03-09 13:00:39','2026-03-09 13:00:39');
/*!40000 ALTER TABLE `landing_page_custom_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `landing_page_settings`
--

DROP TABLE IF EXISTS `landing_page_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `landing_page_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) DEFAULT 'Humana Tasks',
  `contact_email` varchar(255) DEFAULT 'support@taskly.com',
  `contact_phone` varchar(255) DEFAULT '+1 (555) 123-4567',
  `contact_address` varchar(255) DEFAULT 'San Francisco, CA',
  `config_sections` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`config_sections`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `landing_page_settings`
--

LOCK TABLES `landing_page_settings` WRITE;
/*!40000 ALTER TABLE `landing_page_settings` DISABLE KEYS */;
INSERT INTO `landing_page_settings` VALUES
(1,'Humana Tasks','support@taskly.com','+1 (555) 123-4567','San Francisco, CA','{\"sections\":[{\"key\":\"header\",\"transparent\":false,\"background_color\":\"#ffffff\",\"text_color\":\"#1f2937\",\"button_style\":\"gradient\"},{\"key\":\"hero\",\"title\":\"Humana Tasks - Project Management & Team Collaboration\",\"subtitle\":\"Transform your team productivity with our comprehensive project management platform.\",\"announcement_text\":\"\\ud83d\\ude80 New: Advanced Analytics Dashboard\",\"primary_button_text\":\"Get Started\",\"secondary_button_text\":\"Login\",\"image\":\"\",\"background_color\":\"#f8fafc\",\"text_color\":\"#1f2937\",\"layout\":\"image-right\",\"height\":600,\"stats\":[{\"value\":\"10K+\",\"label\":\"Active Users\"},{\"value\":\"50+\",\"label\":\"Countries\"},{\"value\":\"99%\",\"label\":\"Satisfaction\"}],\"card\":{\"name\":\"John Doe\",\"title\":\"Senior Developer\",\"company\":\"Tech Solutions Inc.\",\"initials\":\"JD\"}},{\"key\":\"features\",\"title\":\"Powerful Features for Modern Teams\",\"description\":\"Everything you need to manage projects, tasks, and team collaboration.\",\"background_color\":\"#ffffff\",\"layout\":\"grid\",\"columns\":3,\"image\":\"\",\"show_icons\":true,\"features_list\":[{\"title\":\"Project Management\",\"description\":\"Create projects, assign tasks, and track progress with intuitive dashboards.\",\"icon\":\"folder\"},{\"title\":\"Team Collaboration\",\"description\":\"Real-time collaboration with comments, file sharing, and notifications.\",\"icon\":\"users\"},{\"title\":\"Time Tracking\",\"description\":\"Track time spent on tasks and generate detailed reports.\",\"icon\":\"clock\"}]},{\"key\":\"screenshots\",\"title\":\"See Humana Tasks in Action\",\"subtitle\":\"Explore our intuitive interface and powerful features designed to streamline your project management.\",\"screenshots_list\":[{\"src\":\"\\/screenshots\\/non-saas\\/dashboard.png\",\"alt\":\"Workspace Management\",\"title\":\"Workspace Management\",\"description\":\"; multiple workspaces with role-based permissions, team member invitations, and customizable workspace settings for different projects and departments\"},{\"src\":\"\\/screenshots\\/non-saas\\/projects.png\",\"alt\":\"Project Dashboard\",\"title\":\"Project Dashboard\",\"description\":\"Comprehensive project overview with real-time progress tracking, milestone management, team performance metrics, and interactive charts for project analytics\"},{\"src\":\"\\/screenshots\\/non-saas\\/tasks.png\",\"alt\":\"Task Management\",\"title\":\"Task Management\",\"description\":\"Advanced task management with Kanban boards, priority levels, due dates, task dependencies, file attachments, and collaborative comments for seamless team coordination\"},{\"src\":\"\\/screenshots\\/non-saas\\/budget.png\",\"alt\":\"Budget Management\",\"title\":\"Budget Management\",\"description\":\"Complete financial oversight with budget allocation, expense tracking, cost analysis, budget vs actual reporting, and automated alerts for budget thresholds\"},{\"src\":\"\\/screenshots\\/non-saas\\/invoices.png\",\"alt\":\"Invoice Management\",\"title\":\"Invoice Management\",\"description\":\"Professional invoice creation with customizable templates, automated billing cycles, payment tracking, client management, and integration with popular payment gateways\"},{\"src\":\"\\/screenshots\\/non-saas\\/timesheet.png\",\"alt\":\"Time Tracking\",\"title\":\"Time Tracking\",\"description\":\"Comprehensive time tracking with start\\/stop timers, manual time entry, project-based time logging, detailed timesheets, and productivity analytics accessible from any device\"}]},{\"key\":\"why_choose_us\",\"title\":\"Why Choose Humana Tasks?\",\"subtitle\":\"We\'re not just another project management platform.\",\"reasons\":[{\"title\":\"Quick Setup\",\"description\":\"Get your team organized and productive in under 5 minutes.\",\"icon\":\"clock\"},{\"title\":\"Team Network\",\"description\":\"Join thousands of teams using our platform.\",\"icon\":\"users\"}],\"stats\":[{\"value\":\"10K+\",\"label\":\"Active Users\",\"color\":\"blue\"},{\"value\":\"99%\",\"label\":\"Satisfaction\",\"color\":\"green\"}]},{\"key\":\"about\",\"title\":\"About Humana Tasks,\",\"description\":\"We are passionate about transforming how teams collaborate and manage projects.\",\"story_title\":\"Empowering Team Productivity Since 2020\",\"story_content\":\"Founded by a team of project management enthusiasts and technology experts, Humana Tasks was born from the frustration of scattered tools and inefficient workflows.\",\"image\":\"\",\"background_color\":\"#f9fafb\",\"layout\":\"image-right\",\"stats\":[{\"value\":\"4+ Years\",\"label\":\"Experience\",\"color\":\"blue\"},{\"value\":\"10K+\",\"label\":\"Happy Teams\",\"color\":\"green\"},{\"value\":\"50+\",\"label\":\"Countries\",\"color\":\"purple\"}]},{\"key\":\"team\",\"title\":\"Meet Our Team\",\"subtitle\":\"We\'re a diverse team of innovators and problem-solvers.\",\"cta_title\":\"Want to Join Our Team?\",\"cta_description\":\"We\'re always looking for talented individuals.\",\"cta_button_text\":\"View Open Positions\",\"members\":[{\"name\":\"Sarah Johnson\",\"role\":\"CEO & Founder\",\"bio\":\"Former tech executive with 15+ years experience.\",\"image\":\"\",\"linkedin\":\"#\",\"email\":\"sarah@taskly.com\"},{\"name\":\"Michael Chen\",\"role\":\"CTO\",\"bio\":\"Software architect with expertise in cloud solutions.\",\"image\":\"\",\"linkedin\":\"#\",\"email\":\"michael@taskly.com\"},{\"name\":\"Emily Rodriguez\",\"role\":\"Head of Product\",\"bio\":\"Product strategist focused on user experience.\",\"image\":\"\",\"linkedin\":\"#\",\"email\":\"emily@taskly.com\"},{\"name\":\"David Kim\",\"role\":\"Lead Developer\",\"bio\":\"Full-stack developer specializing in scalable applications.\",\"image\":\"\",\"linkedin\":\"#\",\"email\":\"david@taskly.com\"}]},{\"key\":\"testimonials\",\"title\":\"What Our Clients Say\",\"subtitle\":\"Don\'t just take our word for it.\",\"trust_title\":\"Trusted by Teams Worldwide\",\"trust_stats\":[{\"value\":\"4.9\\/5\",\"label\":\"Average Rating\",\"color\":\"blue\"},{\"value\":\"10K+\",\"label\":\"Happy Teams\",\"color\":\"green\"}],\"testimonials\":[{\"name\":\"Alex Thompson\",\"role\":\"Project Manager\",\"company\":\"TechCorp Inc.\",\"content\":\"Humana Tasks has revolutionized how we manage projects and collaborate as a team.\",\"rating\":5},{\"name\":\"Sarah Miller\",\"role\":\"Product Owner\",\"company\":\"Digital Solutions Ltd\",\"content\":\"The intuitive interface and powerful features have made project tracking a breeze.\",\"rating\":5},{\"name\":\"Michael Chen\",\"role\":\"Team Lead\",\"company\":\"InnovateTech\",\"content\":\"Outstanding collaboration tools that have significantly improved our team productivity.\",\"rating\":5}]},{\"key\":\"faq\",\"title\":\"Frequently Asked Questions\",\"subtitle\":\"Got questions? We\'ve got answers.\",\"cta_text\":\"Still have questions?\",\"button_text\":\"Contact Support\",\"faqs\":[{\"question\":\"How does Humana Tasks work?\",\"answer\":\"Humana Tasks helps teams organize, track, and complete tasks efficiently. Create projects, assign tasks, set deadlines, and collaborate in real-time.\"},{\"question\":\"Is my data secure?\",\"answer\":\"Yes, we use enterprise-grade security with end-to-end encryption. Your data is stored securely and backed up regularly.\"},{\"question\":\"Can I customize workflows?\",\"answer\":\"Absolutely! Create custom task stages, set up automation rules, and configure workflows that match your team\'s process.\"},{\"question\":\"Do you offer integrations?\",\"answer\":\"Yes, we integrate with popular tools like Slack, Google Workspace, Microsoft Teams, and many more.\"},{\"question\":\"What support do you provide?\",\"answer\":\"24\\/7 customer support via chat and email, plus comprehensive documentation and video tutorials.\"}]},{\"key\":\"newsletter\",\"title\":\"Stay Updated with Humana Tasks,\",\"subtitle\":\"Get the latest updates and project management tips.\",\"privacy_text\":\"No spam, unsubscribe at any time.\",\"benefits\":[{\"icon\":\"\\ud83d\\udce7\",\"title\":\"Product Updates\",\"description\":\"Latest features and improvements\"},{\"icon\":\"\\ud83d\\udca1\",\"title\":\"Productivity Tips\",\"description\":\"Expert advice and best practices\"},{\"icon\":\"\\ud83c\\udf81\",\"title\":\"Exclusive Access\",\"description\":\"Early access to new features\"}]},{\"key\":\"contact\",\"title\":\"Get in Touch\",\"subtitle\":\"Have questions about Humana Tasks? We\'d love to hear from you.\",\"form_title\":\"Send us a Message\",\"info_title\":\"Contact Information\",\"info_description\":\"We\'re here to help and answer any question you might have.\",\"layout\":\"split\",\"background_color\":\"#f9fafb\"},{\"key\":\"footer\",\"description\":\"Transforming team productivity with innovative project management solutions.\",\"newsletter_title\":\"Stay Updated\",\"newsletter_subtitle\":\"Join our newsletter for updates\",\"links\":{\"product\":[{\"name\":\"Features\",\"href\":\"#features\"},{\"name\":\"Pricing\",\"href\":\"#pricing\"}],\"company\":[{\"name\":\"About Us\",\"href\":\"#about\"},{\"name\":\"Contact\",\"href\":\"#contact\"}],\"support\":[{\"name\":\"Help Center\",\"href\":\"#help\"},{\"name\":\"Terms of Service\",\"href\":\"#terms\"}],\"legal\":[{\"name\":\"Privacy Policy\",\"href\":\"#privacy\"},{\"name\":\"Terms of Service\",\"href\":\"#terms\"}]},\"social_links\":[{\"name\":\"Facebook\",\"icon\":\"Facebook\",\"href\":\"#\"},{\"name\":\"Twitter\",\"icon\":\"Twitter\",\"href\":\"#\"}],\"section_titles\":{\"product\":\"Product\",\"company\":\"Company\",\"support\":\"Support\",\"legal\":\"Legal\"}}],\"theme\":{\"primary_color\":\"#10B77F\",\"secondary_color\":\"#ffffff\",\"accent_color\":\"#f7f7f7\",\"logo_light\":\"\",\"logo_dark\":\"\",\"favicon\":\"\"},\"seo\":{\"meta_title\":\"Humana Tasks - Project Management & Team Collaboration\",\"meta_description\":\"Streamline your team productivity with our comprehensive project management platform.\",\"meta_keywords\":\"project management, team collaboration, task management, productivity, workflow\"},\"custom_css\":\"\",\"custom_js\":\"\",\"section_order\":[\"header\",\"hero\",\"features\",\"screenshots\",\"why_choose_us\",\"about\",\"team\",\"testimonials\",\"faq\",\"newsletter\",\"contact\",\"footer\"],\"section_visibility\":{\"header\":true,\"hero\":true,\"features\":true,\"screenshots\":true,\"why_choose_us\":true,\"about\":true,\"team\":true,\"testimonials\":true,\"faq\":true,\"newsletter\":true,\"contact\":true,\"footer\":true}}','2026-03-09 13:00:39','2026-03-09 13:00:39');
/*!40000 ALTER TABLE `landing_page_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_histories`
--

DROP TABLE IF EXISTS `login_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `login_histories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip` varchar(45) NOT NULL,
  `date` date NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`details`)),
  `type` varchar(50) NOT NULL DEFAULT 'login',
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `login_histories_user_id_index` (`user_id`),
  KEY `login_histories_created_by_index` (`created_by`),
  CONSTRAINT `login_histories_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `login_histories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_histories`
--

LOCK TABLES `login_histories` WRITE;
/*!40000 ALTER TABLE `login_histories` DISABLE KEYS */;
INSERT INTO `login_histories` VALUES
(1,3,'149.3.102.36','2026-03-09','{\"country\":\"Georgia\",\"countryCode\":\"GE\",\"region\":\"TB\",\"regionName\":\"Tbilisi\",\"city\":\"Tbilisi\",\"zip\":\"\",\"lat\":41.6959,\"lon\":44.832,\"timezone\":\"Asia\\/Tbilisi\",\"isp\":\"JSC \\\"Silknet\\\"\",\"org\":\"JSC \\\"Silknet\\\"\",\"as\":\"AS35805 JSC \\\"Silknet\\\"\",\"query\":\"149.3.102.36\",\"status\":\"success\",\"browser_name\":\"Chrome\",\"os_name\":\"macOS\",\"browser_language\":\"en\",\"device_type\":\"desktop\",\"referrer_host\":\"crm.inexia.cc\",\"referrer_path\":\"\\/login\"}','company',3,'2026-03-09 13:08:38','2026-03-09 13:08:38');
/*!40000 ALTER TABLE `login_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `media` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) unsigned NOT NULL,
  `uuid` char(36) DEFAULT NULL,
  `collection_name` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `disk` varchar(255) NOT NULL,
  `conversions_disk` varchar(255) DEFAULT NULL,
  `size` bigint(20) unsigned NOT NULL,
  `manipulations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`manipulations`)),
  `custom_properties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`custom_properties`)),
  `generated_conversions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`generated_conversions`)),
  `responsive_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`responsive_images`)),
  `order_column` int(10) unsigned DEFAULT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `media_uuid_unique` (`uuid`),
  KEY `media_model_type_model_id_index` (`model_type`,`model_id`),
  KEY `media_user_id_foreign` (`user_id`),
  KEY `media_order_column_index` (`order_column`),
  CONSTRAINT `media_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_items`
--

DROP TABLE IF EXISTS `media_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `media_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_items`
--

LOCK TABLES `media_items` WRITE;
/*!40000 ALTER TABLE `media_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES
(1,'0001_01_01_000000_create_users_table',1),
(2,'0001_01_01_000001_create_cache_table',1),
(3,'0001_01_01_000002_create_jobs_table',1),
(4,'2025_01_06_000001_create_login_histories_table',1),
(5,'2025_01_07_000001_create_payments_table',1),
(6,'2025_01_20_000001_create_notification_templates_table',1),
(7,'2025_01_20_000002_create_notification_template_langs_table',1),
(8,'2025_01_27_084150_create_landing_page_settings_table',1),
(9,'2025_01_28_000001_create_webhooks_table',1),
(10,'2025_01_30_000001_create_newsletters_table',1),
(11,'2025_01_30_000001_create_zoom_meetings_table',1),
(12,'2025_01_30_000002_create_contacts_table',1),
(13,'2025_01_30_000002_create_google_meetings_table',1),
(14,'2025_01_30_000002_create_zoom_meeting_members_table',1),
(15,'2025_01_30_000003_create_google_meeting_members_table',1),
(16,'2025_01_30_000003_create_notes_table',1),
(17,'2025_02_01_000001_create_workspaces_table',1),
(18,'2025_02_01_000002_create_workspace_members_table',1),
(19,'2025_02_01_000003_create_workspace_invitations_table',1),
(20,'2025_02_02_000001_create_projects_table',1),
(21,'2025_02_02_000002_create_project_members_table',1),
(22,'2025_02_02_000003_create_project_milestones_table',1),
(23,'2025_02_02_000004_create_project_notes_table',1),
(24,'2025_02_02_000005_create_project_activities_table',1),
(25,'2025_02_03_000001_create_task_stages_table',1),
(26,'2025_02_03_000002_create_tasks_table',1),
(27,'2025_02_03_000003_create_task_comments_table',1),
(28,'2025_02_03_000004_create_task_checklists_table',1),
(29,'2025_02_03_000005_create_task_attachments_table',1),
(30,'2025_02_03_000006_create_task_members_table',1),
(31,'2025_02_04_000001_create_timesheets_table',1),
(32,'2025_02_04_000002_create_timesheet_entries_table',1),
(33,'2025_02_04_000003_create_timesheet_approvals_table',1),
(34,'2025_02_05_000001_create_bug_statuses_table',1),
(35,'2025_02_05_000002_create_bugs_table',1),
(36,'2025_02_05_000003_create_bug_comments_table',1),
(37,'2025_02_10_000001_create_taxes_table',1),
(38,'2025_03_31_000001_create_slack_settings_table',1),
(39,'2025_03_31_000002_create_telegram_settings_table',1),
(40,'2025_05_25_000000_create_permission_tables',1),
(41,'2025_06_18_000001_create_plans_table',1),
(42,'2025_06_18_105755_create_settings_table',1),
(43,'2025_06_19_051735_create_coupons_table',1),
(44,'2025_06_19_084856_create_plan_requests_table',1),
(45,'2025_06_19_085023_create_plan_orders_table',1),
(46,'2025_06_20_044143_create_referral_settings_table',1),
(47,'2025_06_20_044158_create_referrals_table',1),
(48,'2025_06_20_044206_create_payout_requests_table',1),
(49,'2025_06_24_044208_create_currencies_table',1),
(50,'2025_06_26_100501_create_payment_settings_table',1),
(51,'2025_06_27_053245_create_media_table',1),
(52,'2025_06_27_060535_create_media_items_table',1),
(53,'2025_06_27_060536_create_project_attachments_table',1),
(54,'2025_06_27_060537_create_bug_attachments_table',1),
(55,'2025_06_27_115807_create_email_templates_table',1),
(56,'2025_06_27_115820_create_email_template_langs_table',1),
(57,'2025_06_27_115828_create_user_email_templates_table',1),
(58,'2025_07_02_094334_create_landing_page_custom_pages_table',1),
(59,'2025_07_26_000001_create_project_budgets_table',1),
(60,'2025_07_26_000002_create_budget_categories_table',1),
(61,'2025_07_26_000003_create_project_expenses_table',1),
(62,'2025_07_26_000004_create_expense_approvals_table',1),
(63,'2025_07_26_000005_create_expense_attachments_table',1),
(64,'2025_07_26_000006_create_budget_revisions_table',1),
(65,'2025_07_26_000007_create_expense_recurring_table',1),
(66,'2025_07_26_000009_create_budget_revision_approvals_table',1),
(67,'2025_07_26_000011_create_expense_workflows_table',1),
(68,'2025_07_27_000001_create_invoices_table',1),
(69,'2025_07_27_000002_create_invoice_items_table',1),
(70,'2025_07_28_000001_add_payment_token_to_invoices_table',1),
(71,'2025_07_28_000001_update_invoices_table_remove_discount_add_multiple_taxes',1),
(72,'2025_07_28_000002_add_is_googlecalendar_sync_to_tasks_table',1),
(73,'2025_07_28_000003_add_is_googlecalendar_sync_to_zoom_meetings_table',1),
(74,'2025_08_10_000001_create_contracts_types_table',1),
(75,'2025_08_10_000002_create_contracts_table',1),
(76,'2025_08_10_000003_create_contracts_notes_table',1),
(77,'2025_08_10_000004_create_contracts_comments_table',1),
(78,'2025_08_10_000005_create_contracts_attachments_table',1),
(79,'2025_08_20_000002_drop_slack_telegram_settings_tables',1),
(80,'2025_10_20_000003_create_user_notification_templates_table',1),
(81,'2025_12_17_000001_add_shared_settings_to_projects_table',1),
(82,'2025_12_30_000003_add_created_by_to_notification_template_langs_table',1),
(83,'2026_01_05_000002_remove_user_id_from_notification_templates_table',1),
(84,'2026_02_06_141937_add_address_remove_estimated_hours_from_projects',1),
(85,'2026_02_06_150541_add_quantity_to_invoice_items_table',1),
(86,'2026_02_06_151856_make_due_date_nullable_in_invoices_table',1),
(87,'2026_02_06_161052_add_is_inclusive_to_taxes_table',1),
(88,'2026_02_07_000001_add_invoice_id_to_project_expenses_table',1),
(89,'2026_02_07_000002_add_default_categories_to_all_budgets',1),
(90,'2026_02_07_000003_create_budget_3000_for_all_projects',1),
(91,'2026_02_07_000004_add_budget_category_id_to_invoices_table',1),
(92,'2026_02_10_000001_add_google_sheet_sync_key_to_tasks_table',1),
(93,'2026_02_14_000001_create_asset_categories_table',1),
(94,'2026_02_14_000001_create_assets_table',1),
(95,'2026_02_14_000002_add_asset_category_id_to_assets_table',1),
(96,'2026_02_14_000003_add_approved_fields_to_invoices_table',1),
(97,'2026_02_14_000004_add_asset_fields_to_invoice_items_table',1),
(98,'2026_02_14_000005_add_tax_id_to_invoice_items_table',1),
(99,'2026_02_14_000006_add_task_id_to_invoices_table',1),
(100,'2026_02_14_000007_create_crm_contacts_table',1),
(101,'2026_02_14_000008_add_identification_code_to_crm_contacts_table',1),
(102,'2026_02_14_150000_revert_invoice_project_id_to_required',1),
(103,'2026_02_19_100000_add_quantity_to_assets_table',1),
(104,'2026_02_19_110000_create_asset_task_table',1),
(105,'2026_02_19_120000_add_asset_id_to_invoice_items_table',1),
(106,'2026_02_19_130000_change_invoice_items_quantity_to_decimal',1),
(107,'2026_02_21_000001_add_used_status_to_assets_table',1),
(108,'2026_02_21_000001_create_invoice_task_table',1),
(109,'2026_02_23_000001_remove_russian_language_from_users',1),
(110,'2026_02_23_100000_create_invoice_project_table',1),
(111,'2026_02_23_100001_create_invoice_item_task_table',1),
(112,'2026_02_25_000001_create_asset_attachments_table',1),
(113,'2026_02_25_000002_create_asset_warranty_cases_table',1),
(114,'2026_02_25_200644_add_assets_processed_at_to_invoices_table',1),
(115,'2026_02_27_000001_create_equipment_types_table',1),
(116,'2026_02_27_000001_drop_invoice_id_unique_from_project_expenses',1),
(117,'2026_02_27_000002_create_service_types_table',1),
(118,'2026_02_27_000003_create_equipment_table',1),
(119,'2026_02_27_000004_create_equipment_schedules_table',1),
(120,'2026_02_27_000005_create_equipment_consumable_limits_table',1),
(121,'2026_02_27_000006_create_equipment_service_photos_table',1),
(122,'2026_02_27_000007_add_equipment_fields_to_tasks_table',1),
(123,'2026_02_27_000008_add_equipment_fields_to_project_expenses_table',1),
(124,'2026_02_27_000009_add_equipment_fields_to_invoice_items_table',1),
(125,'2026_02_27_000010_add_media_item_id_to_equipment_service_photos',1),
(126,'2026_03_03_000001_add_code_to_equipment_table',1),
(127,'2026_03_09_000001_add_crm_contact_id_to_invoices_table',2),
(128,'2026_03_09_145309_set_budget_3000_and_expense_categories_for_all_projects',2),
(129,'2026_03_09_145527_remove_allocated_amount_from_budget_categories',3);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_has_permissions`
--

DROP TABLE IF EXISTS `model_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_has_permissions`
--

LOCK TABLES `model_has_permissions` WRITE;
/*!40000 ALTER TABLE `model_has_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `model_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_has_roles`
--

DROP TABLE IF EXISTS `model_has_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) unsigned NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_has_roles`
--

LOCK TABLES `model_has_roles` WRITE;
/*!40000 ALTER TABLE `model_has_roles` DISABLE KEYS */;
INSERT INTO `model_has_roles` VALUES
(1,'App\\Models\\User',3),
(6,'App\\Models\\User',2);
/*!40000 ALTER TABLE `model_has_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletters`
--

DROP TABLE IF EXISTS `newsletters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `newsletters` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `subscribed_at` timestamp NULL DEFAULT NULL,
  `unsubscribed_at` timestamp NULL DEFAULT NULL,
  `status` enum('subscribed','unsubscribed') NOT NULL DEFAULT 'subscribed',
  `source` varchar(255) NOT NULL DEFAULT 'landing_page',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `newsletters_email_unique` (`email`),
  KEY `newsletters_status_created_at_index` (`status`,`created_at`),
  KEY `newsletters_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletters`
--

LOCK TABLES `newsletters` WRITE;
/*!40000 ALTER TABLE `newsletters` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `text` text NOT NULL,
  `color` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'personal',
  `assign_to` varchar(255) DEFAULT NULL,
  `workspace` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_template_langs`
--

DROP TABLE IF EXISTS `notification_template_langs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_template_langs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint(20) unsigned NOT NULL,
  `lang` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notification_template_langs_parent_id_foreign` (`parent_id`),
  KEY `notification_template_langs_created_by_foreign` (`created_by`),
  CONSTRAINT `notification_template_langs_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notification_template_langs_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `notification_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=321 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_template_langs`
--

LOCK TABLES `notification_template_langs` WRITE;
/*!40000 ALTER TABLE `notification_template_langs` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_template_langs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_templates`
--

DROP TABLE IF EXISTS `notification_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_templates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'info',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_templates`
--

LOCK TABLES `notification_templates` WRITE;
/*!40000 ALTER TABLE `notification_templates` DISABLE KEYS */;
INSERT INTO `notification_templates` VALUES
(1,'New Task','slack','2026-03-09 13:00:40','2026-03-09 13:00:40'),
(2,'New Milestone','slack','2026-03-09 13:00:40','2026-03-09 13:00:40'),
(3,'New Task Comment','slack','2026-03-09 13:00:40','2026-03-09 13:00:40'),
(4,'New Task','telegram','2026-03-09 13:00:40','2026-03-09 13:00:40'),
(5,'New Milestone','telegram','2026-03-09 13:00:40','2026-03-09 13:00:40'),
(6,'New Task Comment','telegram','2026-03-09 13:00:40','2026-03-09 13:00:40'),
(7,'Milestone Status Updated','slack','2026-03-09 13:00:40','2026-03-09 13:00:40'),
(8,'Milestone Status Updated','telegram','2026-03-09 13:00:40','2026-03-09 13:00:40'),
(9,'New Project','slack','2026-03-09 13:00:40','2026-03-09 13:00:40'),
(10,'New Project','telegram','2026-03-09 13:00:40','2026-03-09 13:00:40'),
(11,'Task Stage Updated','slack','2026-03-09 13:00:40','2026-03-09 13:00:40'),
(12,'Task Stage Updated','telegram','2026-03-09 13:00:40','2026-03-09 13:00:40'),
(13,'New Invoice','slack','2026-03-09 13:00:41','2026-03-09 13:00:41'),
(14,'New Invoice','telegram','2026-03-09 13:00:41','2026-03-09 13:00:41'),
(15,'Invoice Status Updated','slack','2026-03-09 13:00:41','2026-03-09 13:00:41'),
(16,'Invoice Status Updated','telegram','2026-03-09 13:00:41','2026-03-09 13:00:41'),
(17,'Expense Approval','slack','2026-03-09 13:00:41','2026-03-09 13:00:41'),
(18,'Expense Approval','telegram','2026-03-09 13:00:41','2026-03-09 13:00:41'),
(19,'New Budget','slack','2026-03-09 13:00:41','2026-03-09 13:00:41'),
(20,'New Budget','telegram','2026-03-09 13:00:41','2026-03-09 13:00:41');
/*!40000 ALTER TABLE `notification_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_settings`
--

DROP TABLE IF EXISTS `payment_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `workspace_id` bigint(20) unsigned DEFAULT NULL,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_settings_user_id_workspace_id_key_unique` (`user_id`,`workspace_id`,`key`),
  KEY `payment_settings_workspace_id_foreign` (`workspace_id`),
  KEY `payment_settings_user_id_workspace_id_key_index` (`user_id`,`workspace_id`,`key`),
  CONSTRAINT `payment_settings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_settings_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_settings`
--

LOCK TABLES `payment_settings` WRITE;
/*!40000 ALTER TABLE `payment_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `created_by` bigint(20) unsigned NOT NULL,
  `invoice_id` bigint(20) unsigned NOT NULL,
  `workspace_id` bigint(20) unsigned DEFAULT NULL,
  `payment_method` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'completed',
  `gateway_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gateway_response`)),
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_created_by_payment_date_index` (`created_by`,`payment_date`),
  CONSTRAINT `payments_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `module` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB AUTO_INCREMENT=348 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES
(1,'dashboards','dashboard_view','web','View Dashboard','Access dashboard metrics','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(2,'dashboards','dashboard_manage','web','Manage Dashboard','Manage dashboard widgets and layout','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(3,'workspace','workspace_view_any','web','View All Workspaces','View all accessible workspaces','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(4,'workspace','workspace_view','web','View Workspace','View workspace information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(5,'workspace','workspace_create','web','Create Workspace','Create new workspace','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(6,'workspace','workspace_update','web','Update Workspace','Modify workspace information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(7,'workspace','workspace_delete','web','Delete Workspace','Remove workspace','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(8,'workspace','workspace_assign','web','Assign Workspace','Set workspace owner','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(9,'workspace','workspace_manage_members','web','Manage Workspace Members','Add/remove/manage members','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(10,'workspace','workspace_manage_settings','web','Manage Workspace Settings','Configure workspace options','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(11,'workspace','workspace_switch','web','Switch Workspace','Change active workspace','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(12,'workspace','workspace_leave','web','Leave Workspace','Leave workspace as member','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(13,'workspace','workspace_view_activity','web','View Workspace Activity','View workspace activity log','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(14,'workspace','workspace_invite_members','web','Invite Workspace Members','Send workspace invitations','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(15,'projects','project_view_any','web','View All Branches','View all branches in workspace','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(16,'projects','project_view','web','View Branch','View individual branch information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(17,'projects','project_create','web','Create Branch','Create new branch','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(18,'projects','project_update','web','Update Branch','Modify branch information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(19,'projects','project_delete','web','Delete Branch','Remove branch','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(20,'projects','project_assign_members','web','Assign Branch Members','Add/remove branch team members','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(21,'projects','project_assign_clients','web','Assign Branch Clients','Add/remove branch clients','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(22,'projects','project_assign','web','Assign Branch','Move branch between workspaces','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(23,'projects','project_manage_budget','web','Manage Branch Budget','Create/edit branch budget','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(24,'projects','project_manage_milestones','web','Manage Branch Milestones','Add/edit branch milestones','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(25,'projects','project_manage_attachments','web','Manage Branch Attachments','Upload/delete branch files','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(26,'projects','project_generate_reports','web','Generate Branch Reports','Create branch analytics','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(27,'projects','project_track_progress','web','Track Branch Progress','Monitor branch completion','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(28,'projects','project_manage_notes','web','Manage Branch Notes','Add/edit branch notes','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(29,'projects','project_view_activity','web','View Branch Activity','View branch activity log','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(30,'projects','project_manage_shared_settings','web','Manage Branch Shared Settings','Configure branch sharing and password protection','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(31,'projects','project_view_gantt','web','View Gantt Chart','Access branch Gantt chart view','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(32,'projects','project_manage_permissions','web','Manage Branch Permissions','Manage individual user permissions for branch','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(33,'tasks','task_view_any','web','View All Tasks','View all tasks in workspace','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(34,'tasks','task_view','web','View Task','View individual task information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(35,'tasks','task_create','web','Create Task','Create new task','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(36,'tasks','task_update','web','Update Task','Modify task information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(37,'tasks','task_delete','web','Delete Task','Remove task','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(38,'tasks','task_assign_users','web','Assign Users to Task','Assign/unassign users to task','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(39,'tasks','task_assign','web','Assign Task','Move task between projects/milestones','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(40,'tasks','task_change_status','web','Change Task Status','Move task between stages','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(41,'tasks','task_manage_stages','web','Manage Task Stages','Create/edit/delete task stages','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(42,'tasks','task_duplicate','web','Duplicate Task','Create copy of existing task','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(43,'tasks','task_add_comments','web','Add Task Comments','Add comments to task','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(44,'tasks','task_add_attachments','web','Add Task Attachments','Upload files to task','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(45,'tasks','task_manage_checklists','web','Manage Task Checklists','Add checklist items to task','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(46,'tasks','task_track_progress','web','Track Task Progress','Monitor task completion','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(47,'budget','budget_view_any','web','View All Budgets','View all budgets in workspace','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(48,'budget','budget_view','web','View Budget','View individual budget','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(49,'budget','budget_dashboard_view','web','View Budget Dashboard','Access budget dashboard (company and manager only)','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(50,'budget','budget_create','web','Create Budget','Create new budget','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(51,'budget','budget_update','web','Update Budget','Modify budget information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(52,'budget','budget_delete','web','Delete Budget','Remove budget','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(53,'budget','budget_assign','web','Assign Budget','Link budget to project','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(54,'budget','budget_manage_categories','web','Manage Budget Categories','Set budget category allocations','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(55,'budget','budget_approve','web','Approve Budget','Review and approve budget changes','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(56,'budget','budget_track_expenses','web','Track Budget Expenses','Monitor budget utilization','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(57,'budget','budget_generate_reports','web','Generate Budget Reports','Create budget analytics','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(58,'budget','budget_manage_workflows','web','Manage Budget Workflows','Control budget approval process','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(59,'budget','budget_view_history','web','View Budget History','View budget change history','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(60,'budget','budget_manage_alerts','web','Manage Budget Alerts','Receive budget notifications','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(61,'expense','expense_view_any','web','View All Expenses','View all expenses in workspace','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(62,'expense','expense_view','web','View Expense','View individual expense','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(63,'expense','expense_create','web','Create Expense','Add new expense','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(64,'expense','expense_update','web','Update Expense','Modify expense information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(65,'expense','expense_delete','web','Delete Expense','Remove expense','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(66,'expense','expense_assign','web','Assign Expense','Link expense to project/budget/approver','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(67,'expense','expense_add_attachments','web','Add Expense Attachments','Upload receipts/documents','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(68,'expense','expense_generate_reports','web','Generate Expense Reports','Create expense analytics','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(69,'expense','expense_manage_recurring','web','Manage Recurring Expenses','Set up automatic expenses','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(70,'expense','expense_manage_workflows','web','Manage Expense Workflows','Control approval process','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(71,'expense_approval','expense_approval_view_any','web','View All Expense Approvals','View all pending expense approvals','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(72,'expense_approval','expense_approval_view','web','View Expense Approval','View individual expense approval','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(73,'expense_approval','expense_approval_approve','web','Approve Expense','Approve expense requests','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(74,'expense_approval','expense_approval_reject','web','Reject Expense','Reject expense requests','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(75,'expense_approval','expense_approval_request_info','web','Request Additional Info','Request more information for expense','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(76,'expense_approval','expense_approval_bulk_approve','web','Bulk Approve Expenses','Approve multiple expenses at once','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(77,'expense_approval','expense_approval_view_stats','web','View Approval Statistics','View expense approval metrics','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(78,'expense_approval','expense_approval_budget_summary','web','View Budget Summary','View budget impact of approvals','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(79,'invoice','invoice_view_any','web','View All Invoices','View all invoices in workspace','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(80,'invoice','invoice_view','web','View Invoice','View individual invoice','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(81,'invoice','invoice_create','web','Create Invoice','Create new invoice','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(82,'invoice','invoice_update','web','Update Invoice','Modify invoice information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(83,'invoice','invoice_delete','web','Delete Invoice','Remove invoice','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(84,'invoice','invoice_assign','web','Assign Invoice','Link invoice to client/project','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(85,'invoice','invoice_send','web','Send Invoice','Email invoice to client','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(86,'invoice','invoice_manage_payments','web','Manage Invoice Payments','Monitor/record payment status','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(87,'invoice','invoice_generate_reports','web','Generate Invoice Reports','Create invoice analytics','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(88,'invoice','invoice_manage_templates','web','Manage Invoice Templates','Create/edit invoice layouts','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(89,'invoice','invoice_manage_items','web','Manage Invoice Items','Add/edit invoice line items','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(90,'invoice','invoice_approve','web','Approve Invoice','Approve invoice before payment (required for asset creation)','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(91,'media','media_view_any','web','View All Media','Access file library','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(92,'media','media_view','web','View Media','View file details','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(93,'media','media_upload','web','Upload Media','Add new files','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(94,'media','media_create','web','Create Media','Create media files','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(95,'media','media_update','web','Update Media','Modify media files','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(96,'media','media_delete','web','Delete Media','Remove files','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(97,'media','media_download','web','Download Media','Download media files','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(98,'media','media_manage','web','Manage Media','Organize file structure','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(99,'media','manage-any-media','web','Manage Any Media','Full media management access','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(100,'plan','plan_view_any','web','View All Plans','View all subscription plans','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(101,'plan','plan_view','web','View Plan','View individual plan','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(102,'plan','plan_create','web','Create Plan','Add new plan','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(103,'plan','plan_update','web','Update Plan','Modify plan information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(104,'plan','plan_delete','web','Delete Plan','Remove plan','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(105,'plan','plan_assign','web','Assign Plan','Set user subscription','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(106,'plan','plan_manage_orders','web','Manage Plan Orders','Handle plan purchases','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(107,'plan','plan_manage_requests','web','Manage Plan Requests','Process plan change requests','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(108,'plan','plan_request','web','Request Plan','Request plan changes','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(109,'plan','plan_trial','web','Start Trial','Start plan trial','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(110,'plan','plan_subscribe','web','Subscribe Plan','Subscribe to plan','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(111,'plan','plan_approve_orders','web','Approve Plan Orders','Approve plan orders','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(112,'plan','plan_reject_orders','web','Reject Plan Orders','Reject plan orders','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(113,'plan','plan_view_my_requests','web','View My Plan Requests','View own plan requests','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(114,'plan','plan_view_my_orders','web','View My Plan Orders','View own plan orders','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(115,'report','report_view_any','web','View All Reports','View all available reports','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(116,'report','report_view','web','View Report','Access specific report','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(117,'report','report_create','web','Create Report','Build custom reports','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(118,'report','report_export','web','Export Report','Download reports','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(119,'report','report_assign','web','Assign Report','Grant report permissions','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(120,'report','report_schedule','web','Schedule Report','Setup automatic reports','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(121,'report','report_expense','web','Expense Reports','Generate expense reports','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(122,'report','report_customer','web','Customer Reports','Generate customer reports','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(123,'report','report_budget_vs_actual','web','Budget vs Actual Reports','Generate budget comparison reports','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(124,'report','report_category','web','Category Reports','Generate category-wise reports','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(125,'report','report_team','web','Team Reports','Generate team performance reports','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(126,'report','report_dashboard_widgets','web','Dashboard Widgets','View dashboard report widgets','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(127,'user','user_view_any','web','View All Users','View all users in system','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(128,'user','user_view','web','View User','View individual user profile','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(129,'user','user_create','web','Create User','Add new user','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(130,'user','user_update','web','Update User','Modify user information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(131,'user','user_delete','web','Delete User','Remove user','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(132,'user','user_assign','web','Assign User','Add user to workspace/role','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(133,'user','user_invite','web','Invite User','Send workspace invitations','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(134,'user','user_manage_roles','web','Manage User Roles','Create/edit user roles','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(135,'user','user_manage_permissions','web','Manage User Permissions','Grant specific permissions','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(136,'user','user_reset_password','web','Reset User Password','Reset user login credentials','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(137,'user','user_toggle_status','web','Toggle User Status','Activate/deactivate users','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(138,'user','user_impersonate','web','Impersonate User','Login as another user','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(139,'user','user_manage_profile','web','Manage Profile','Manage own profile','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(140,'user','user_view_logs','web','View User Logs','View user login history and activity logs','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(141,'role','role_view_any','web','View All Roles','View all system roles','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(142,'role','role_view','web','View Role','View individual role','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(143,'role','role_create','web','Create Role','Add new role','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(144,'role','role_update','web','Update Role','Modify role information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(145,'role','role_delete','web','Delete Role','Remove role','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(146,'role','role_assign','web','Assign Role','Grant role to user','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(147,'permission','permission_view_any','web','View All Permissions','See all permissions','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(148,'permission','permission_assign','web','Assign Permissions','Set role permissions','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(149,'permission','permission_manage','web','Manage Permissions','Manage access system','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(150,'company','company_view_any','web','View All Companies','View all companies','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(151,'company','company_view','web','View Company','View individual company','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(152,'company','company_create','web','Create Company','Add new company','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(153,'company','company_update','web','Update Company','Modify company information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(154,'company','company_delete','web','Delete Company','Remove company','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(155,'company','company_reset_password','web','Reset Company Password','Reset company password','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(156,'company','company_toggle_status','web','Toggle Company Status','Enable/disable company','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(157,'company','company_manage_plans','web','Manage Company Plans','Manage company plans','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(158,'company','company_upgrade_plan','web','Upgrade Company Plan','Upgrade company plan','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(159,'payment','payment_view_any','web','View All Payments','View all payment transactions','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(160,'payment','payment_view','web','View Payment','View individual payment','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(161,'payment','payment_process','web','Process Payment','Handle payment transactions','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(162,'payment','payment_refund','web','Process Refund','Issue payment refunds','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(163,'payment','payment_manage_gateways','web','Manage Payment Gateways','Configure payment methods','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(164,'coupon','coupon_view_any','web','View All Coupons','View all discount coupons','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(165,'coupon','coupon_view','web','View Coupon','View individual coupon','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(166,'coupon','coupon_create','web','Create Coupon','Add new coupon','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(167,'coupon','coupon_update','web','Update Coupon','Modify coupon information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(168,'coupon','coupon_delete','web','Delete Coupon','Remove coupon','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(169,'coupon','coupon_assign','web','Assign Coupon','Grant coupon to user/plan','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(170,'coupon','coupon_toggle_status','web','Toggle Coupon Status','Enable/disable coupon','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(171,'currency','currency_view_any','web','View All Currencies','View all currencies','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(172,'currency','currency_view','web','View Currency','View individual currency','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(173,'currency','currency_create','web','Create Currency','Add new currency','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(174,'currency','currency_update','web','Update Currency','Modify currency information','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(175,'currency','currency_delete','web','Delete Currency','Remove currency','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(176,'referral','referral_view_any','web','View All Referrals','View all referral records','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(177,'referral','referral_view','web','View Referral','View individual referral','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(178,'referral','referral_create','web','Create Referral','Generate referral links','2026-03-09 13:00:37','2026-03-09 13:00:37'),
(179,'referral','referral_manage','web','Manage Referral','Configure referral settings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(180,'referral','referral_payout','web','Manage Referral Payout','Handle referral payments','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(181,'referral','referral_approve_payout','web','Approve Referral Payout','Approve payout requests','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(182,'referral','referral_reject_payout','web','Reject Referral Payout','Reject payout requests','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(183,'landing_page','landing_page_view','web','View Landing Page','Access public page','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(184,'landing_page','landing_page_update','web','Update Landing Page','Modify page content','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(185,'landing_page','landing_page_manage','web','Manage Landing Page','Configure page options','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(186,'custom_page','custom_page_view_any','web','View All Custom Pages','View all custom pages in admin','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(187,'custom_page','custom_page_view','web','View Custom Page','View individual custom page','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(188,'custom_page','custom_page_create','web','Create Custom Page','Create new custom page','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(189,'custom_page','custom_page_update','web','Update Custom Page','Modify custom page content','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(190,'custom_page','custom_page_delete','web','Delete Custom Page','Remove custom page','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(191,'custom_page','custom_page_manage_seo','web','Manage Page SEO','Manage meta titles and descriptions','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(192,'custom_page','custom_page_manage_order','web','Manage Page Order','Change page sort order','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(193,'custom_page','custom_page_toggle_status','web','Toggle Page Status','Activate/deactivate custom pages','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(194,'email_template','email_template_view_any','web','View All Email Templates','View all email templates','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(195,'email_template','email_template_view','web','View Email Template','View individual template','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(196,'email_template','email_template_create','web','Create Email Template','Add new template','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(197,'email_template','email_template_update','web','Update Email Template','Modify template','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(198,'email_template','email_template_delete','web','Delete Email Template','Remove template','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(199,'email_template','email_template_assign','web','Assign Email Template','Link template to trigger','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(200,'notification_template','notification_template_view_any','web','View All Notification Templates','View all notification templates','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(201,'notification_template','notification_template_view','web','View Notification Template','View individual template','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(202,'notification_template','notification_template_create','web','Create Notification Template','Add new template','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(203,'notification_template','notification_template_update','web','Update Notification Template','Modify template','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(204,'notification_template','notification_template_delete','web','Delete Notification Template','Remove template','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(205,'webhook','webhook_view_any','web','View All Webhooks','View all webhook endpoints','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(206,'webhook','webhook_view','web','View Webhook','View individual webhook','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(207,'webhook','webhook_create','web','Create Webhook','Add new webhook','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(208,'webhook','webhook_update','web','Update Webhook','Modify webhook settings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(209,'webhook','webhook_delete','web','Delete Webhook','Remove webhook','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(210,'webhook','webhook_test','web','Test Webhook','Verify webhook functionality','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(211,'language','language_view','web','View Language','View language settings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(212,'language','language_create','web','Create Language','Create new language','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(213,'language','language_update','web','Update Language','Modify language translations','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(214,'language','language_delete','web','Delete Language','Delete language','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(215,'language','language_manage','web','Manage Language','Manage language system','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(216,'newsletter','newsletter_view_any','web','View All Newsletters','View all newsletter subscriptions','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(217,'newsletter','newsletter_view','web','View Newsletter','View individual newsletter subscription','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(218,'newsletter','newsletter_create','web','Create Newsletter','Add new newsletter subscription','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(219,'newsletter','newsletter_update','web','Update Newsletter','Modify newsletter subscription','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(220,'newsletter','newsletter_delete','web','Delete Newsletter','Remove newsletter subscription','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(221,'newsletter','newsletter_toggle_status','web','Toggle Newsletter Status','Subscribe/unsubscribe newsletter','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(222,'newsletter','newsletter_bulk_operations','web','Newsletter Bulk Operations','Perform bulk operations on newsletters','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(223,'newsletter','newsletter_export','web','Export Newsletter','Export newsletter data','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(224,'crm_contact','crm_contact_view_any','web','View All CRM Contacts','View all CRM contacts in workspace','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(225,'crm_contact','crm_contact_create','web','Create CRM Contact','Add new CRM contact','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(226,'crm_contact','crm_contact_update','web','Update CRM Contact','Modify CRM contact','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(227,'crm_contact','crm_contact_delete','web','Delete CRM Contact','Remove CRM contact','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(228,'crm_contact','crm_contact_export','web','Export CRM Contacts','Export CRM contact data','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(229,'contact','contact_view_any','web','View All Contacts','View all contact submissions','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(230,'contact','contact_view','web','View Contact','View individual contact submission','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(231,'contact','contact_create','web','Create Contact','Add new contact submission','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(232,'contact','contact_update','web','Update Contact','Modify contact submission','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(233,'contact','contact_delete','web','Delete Contact','Remove contact submission','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(234,'contact','contact_update_status','web','Update Contact Status','Change contact status','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(235,'contact','contact_bulk_operations','web','Contact Bulk Operations','Perform bulk operations on contacts','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(236,'contact','contact_export','web','Export Contact','Export contact data','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(237,'settings','settings_view','web','View Settings','Access settings panel','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(238,'settings','settings_update','web','Update Settings','Modify basic settings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(239,'settings','settings_system','web','Manage System Settings','Set system timezone/language','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(240,'settings','settings_brand','web','Manage Brand Settings','Update logos, colors, themes','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(241,'settings','settings_email','web','Manage Email Settings','Setup email configuration','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(242,'settings','settings_email_notification','web','Manage Email Notification Settings','Configure email notification preferences','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(243,'settings','settings_payment','web','Manage Payment Settings','Configure payment methods','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(244,'settings','settings_storage','web','Manage Storage Settings','Setup file storage','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(245,'settings','settings_currency','web','Manage Currency Settings','Set currency options','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(246,'settings','settings_recaptcha','web','Manage ReCaptcha Settings','Configure ReCaptcha','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(247,'settings','settings_chatgpt','web','Manage ChatGPT Settings','Configure ChatGPT integration','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(248,'settings','settings_cookie','web','Manage Cookie Settings','Configure GDPR cookie settings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(249,'settings','settings_seo','web','Manage SEO Settings','Configure SEO options','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(250,'settings','settings_cache','web','Manage Cache Settings','Configure cache settings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(251,'settings','settings_slack','web','Manage Slack Settings','Configure Slack integration settings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(252,'settings','settings_telegram','web','Manage Telegram Settings','Configure Telegram integration settings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(253,'settings','settings_webhook','web','Manage Webhook Settings','Configure webhook settings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(254,'settings','settings_zoom','web','Manage Zoom Settings','Configure Zoom integration settings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(255,'settings','settings_tax','web','Manage Tax Settings','Configure tax rates and settings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(256,'settings','settings_manage','web','Manage Settings','Manage general settings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(257,'zoom_meeting','zoom_meeting_view_any','web','View All Zoom Meetings','View all Zoom meetings in workspace','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(258,'zoom_meeting','zoom_meeting_view','web','View Zoom Meeting','View individual Zoom meeting','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(259,'zoom_meeting','zoom_meeting_create','web','Create Zoom Meeting','Create new Zoom meeting','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(260,'zoom_meeting','zoom_meeting_update','web','Update Zoom Meeting','Modify Zoom meeting information','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(261,'zoom_meeting','zoom_meeting_delete','web','Delete Zoom Meeting','Remove Zoom meeting','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(262,'zoom_meeting','zoom_meeting_join','web','Join Zoom Meeting','Join Zoom meeting as participant','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(263,'zoom_meeting','zoom_meeting_start','web','Start Zoom Meeting','Start Zoom meeting as host','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(264,'zoom_meeting','zoom_meeting_manage_attendees','web','Manage Meeting Attendees','Add/remove meeting attendees','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(265,'zoom_meeting','zoom_meeting_assign_project','web','Assign Meeting to Branch','Link meeting to branch','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(266,'zoom_meeting','zoom_meeting_view_calendar','web','View Meeting Calendar','Access meeting calendar view','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(267,'google_meeting','google_meeting_view_any','web','View All Google Meetings','View all Google meetings in workspace','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(268,'google_meeting','google_meeting_view','web','View Google Meeting','View individual Google meeting','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(269,'google_meeting','google_meeting_create','web','Create Google Meeting','Create new Google meeting','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(270,'google_meeting','google_meeting_update','web','Update Google Meeting','Modify Google meeting information','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(271,'google_meeting','google_meeting_delete','web','Delete Google Meeting','Remove Google meeting','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(272,'google_meeting','google_meeting_join','web','Join Google Meeting','Join Google meeting as participant','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(273,'google_meeting','google_meeting_start','web','Start Google Meeting','Start Google meeting as host','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(274,'google_meeting','google_meeting_manage_attendees','web','Manage Meeting Attendees','Add/remove meeting attendees','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(275,'google_meeting','google_meeting_assign_project','web','Assign Meeting to Branch','Link meeting to branch','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(276,'google_meeting','google_meeting_view_calendar','web','View Meeting Calendar','Access meeting calendar view','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(277,'tax','tax_view_any','web','View All Taxes','View all tax configurations','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(278,'tax','tax_view','web','View Tax','View individual tax configuration','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(279,'tax','tax_create','web','Create Tax','Add new tax configuration','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(280,'tax','tax_update','web','Update Tax','Modify tax configuration','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(281,'tax','tax_delete','web','Delete Tax','Remove tax configuration','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(282,'settings','settings_invoice','web','Manage Invoice Settings','Configure invoice templates, QR codes, and colors','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(283,'settings','settings_google_calendar','web','Manage Google Calendar Settings','Configure Google Calendar integration (company only)','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(284,'settings','settings_google_meet','web','Manage Google Meet Settings','Configure Google Meet integration settings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(285,'calendar','calendar_view','web','View Calendar','Access calendar view','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(286,'calendar','calendar_view_local','web','View Local Calendar','View local calendar events','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(287,'calendar','calendar_view_google','web','View Google Calendar','View Google Calendar events','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(288,'calendar','calendar_sync_google','web','Sync Google Calendar','Synchronize with Google Calendar','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(289,'notes','note_view_any','web','View All Notes','View all notes in workspace','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(290,'notes','note_view','web','View Note','View individual note','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(291,'notes','note_create','web','Create Note','Create new note','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(292,'notes','note_update','web','Update Note','Modify note information','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(293,'notes','note_delete','web','Delete Note','Remove note','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(294,'task_calendar','task_calendar_view','web','View Task Calendar','Access task calendar view with tasks and meetings','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(295,'task_calendar','task_calendar_view_tasks','web','View Tasks in Calendar','View task events in calendar','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(296,'task_calendar','task_calendar_view_meetings','web','View Meetings in Calendar','View meeting events in calendar','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(297,'task_calendar','task_calendar_manage_events','web','Manage Calendar Events','Create and manage calendar events','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(298,'assets','asset_view_any','web','View All Assets','View all assets in workspace','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(299,'assets','asset_view','web','View Asset','View individual asset','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(300,'assets','asset_create','web','Create Asset','Create new asset','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(301,'assets','asset_update','web','Update Asset','Modify asset information','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(302,'assets','asset_delete','web','Delete Asset','Remove asset','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(303,'assets','asset_manage_categories','web','Manage Asset Categories','Create/edit/delete asset categories','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(304,'equipment','equipment_view_any','web','View All Equipment','View all equipment in workspace','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(305,'equipment','equipment_view','web','View Equipment','View individual equipment','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(306,'equipment','equipment_create','web','Create Equipment','Create new equipment','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(307,'equipment','equipment_update','web','Update Equipment','Modify equipment information','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(308,'equipment','equipment_delete','web','Delete Equipment','Remove equipment','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(309,'equipment','equipment_type_manage','web','Manage Equipment Types','Create/edit/delete equipment types','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(310,'equipment','service_type_manage','web','Manage Service Types','Create/edit/delete service types','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(311,'contract_types','contract_type_view_any','web','View All Contract Types','View all contract types in workspace','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(312,'contract_types','contract_type_view','web','View Contract Type','View individual contract type','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(313,'contract_types','contract_type_create','web','Create Contract Type','Create new contract type','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(314,'contract_types','contract_type_update','web','Update Contract Type','Modify contract type information','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(315,'contract_types','contract_type_delete','web','Delete Contract Type','Remove contract type','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(316,'contracts','contract_view_any','web','View All Contracts','View all contracts in workspace','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(317,'contracts','contract_view','web','View Contract','View individual contract','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(318,'contracts','contract_create','web','Create Contract','Create new contract','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(319,'contracts','contract_update','web','Update Contract','Modify contract information','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(320,'contracts','contract_delete','web','Delete Contract','Remove contract','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(321,'contracts','contract_duplicate','web','Duplicate Contract','Create copy of existing contract','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(322,'contracts','contract_send_email','web','Send Contract Email','Send contract via email','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(323,'contracts','contract_download','web','Download Contract','Download contract as PDF','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(324,'contracts','contract_preview','web','Preview Contract','Preview contract before sending','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(325,'contracts','contract_change_status','web','Change Contract Status','Update contract status','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(326,'contracts_signature','contract_signature','web','Add Contract Signature','Add digital signature to contract','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(327,'contract_notes','contract_note_view_any','web','View All Contract Notes','View all contract notes','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(328,'contract_notes','contract_note_view','web','View Contract Note','View individual contract note','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(329,'contract_notes','contract_note_create','web','Create Contract Note','Add notes to contract','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(330,'contract_notes','contract_note_update','web','Update Contract Note','Modify contract notes','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(331,'contract_notes','contract_note_delete','web','Delete Contract Note','Remove contract notes','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(332,'contract_comments','contract_comment_view_any','web','View All Contract Comments','View all contract comments','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(333,'contract_comments','contract_comment_view','web','View Contract Comment','View individual contract comment','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(334,'contract_comments','contract_comment_create','web','Create Contract Comment','Add comments to contract','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(335,'contract_comments','contract_comment_update','web','Update Contract Comment','Modify contract comments','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(336,'contract_comments','contract_comment_delete','web','Delete Contract Comment','Remove contract comments','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(337,'contract_attachments','contract_attachment_view_any','web','View All Contract Attachments','View all contract attachments','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(338,'contract_attachments','contract_attachment_view','web','View Contract Attachment','View individual contract attachment','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(339,'contract_attachments','contract_attachment_create','web','Create Contract Attachment','Upload files to contract','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(340,'contract_attachments','contract_attachment_update','web','Update Contract Attachment','Modify contract attachments','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(341,'contract_attachments','contract_attachment_delete','web','Delete Contract Attachment','Remove contract attachments','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(342,'contract_attachments','contract_attachment_download','web','Download Contract Attachment','Download contract files','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(343,'project_report','project_report_view_any','web','View All Branch Reports','View all branch reports in workspace','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(344,'project_report','project_report_view','web','View Branch Report','View individual branch report','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(345,'project_report','project_report_create','web','Create Branch Report','Generate branch reports','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(346,'project_report','project_report_export','web','Export Branch Report','Export branch reports to various formats','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(347,'project_report','project_report_dashboard','web','View Branch Report Dashboard','Access branch report dashboard with analytics','2026-03-09 13:00:38','2026-03-09 13:00:38');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plans` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` float(30,2) DEFAULT 0.00,
  `yearly_price` float(30,2) DEFAULT NULL,
  `duration` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `max_users_per_workspace` int(11) DEFAULT 10,
  `max_clients_per_workspace` int(11) DEFAULT 5,
  `max_managers_per_workspace` int(11) DEFAULT 2,
  `max_projects_per_workspace` int(11) DEFAULT 10,
  `workspace_limit` int(11) DEFAULT 1,
  `storage_limit` float(15,2) DEFAULT 0.00,
  `enable_chatgpt` varchar(255) DEFAULT 'on',
  `is_trial` varchar(255) DEFAULT NULL,
  `trial_day` int(11) DEFAULT 0,
  `is_plan_enable` varchar(255) DEFAULT 'on',
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plans_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES
(1,'Free',0.00,0.00,'monthly','Basic plan for small businesses just getting started.',20,20,10,30,10,120000.00,'on','off',0,'on',1,'2026-03-09 13:05:36','2026-03-09 13:07:15');
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_activities`
--

DROP TABLE IF EXISTS `project_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_activities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `action` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_activities_project_id_foreign` (`project_id`),
  KEY `project_activities_user_id_foreign` (`user_id`),
  CONSTRAINT `project_activities_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_activities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_activities`
--

LOCK TABLES `project_activities` WRITE;
/*!40000 ALTER TABLE `project_activities` DISABLE KEYS */;
INSERT INTO `project_activities` VALUES
(1,3,3,'task_created','Task \"ცენტრალური კარის პეტლი\" was created','{\"model_type\":\"App\\\\Models\\\\Task\",\"model_id\":1,\"changes\":[]}','2026-03-09 13:26:40','2026-03-09 13:26:40'),
(2,3,3,'task_updated','Task \"ცენტრალური კარის პეტლი\" was updated','{\"model_type\":\"App\\\\Models\\\\Task\",\"model_id\":1,\"changes\":{\"task_stage_id\":10,\"updated_at\":\"2026-03-09 14:26:50\"}}','2026-03-09 13:26:50','2026-03-09 13:26:50'),
(3,3,3,'task_stage_changed','Task \"ცენტრალური კარის პეტლი\" moved from To Do to Done','{\"model_type\":\"App\\\\Models\\\\Task\",\"model_id\":1,\"changes\":{\"task_stage_id\":10,\"updated_at\":\"2026-03-09 14:26:50\"},\"old_stage\":\"To Do\",\"new_stage\":\"Done\"}','2026-03-09 13:26:50','2026-03-09 13:26:50'),
(4,17,3,'task_created','Task \"ცენტრალური კარის გაფართოება\" was created','{\"model_type\":\"App\\\\Models\\\\Task\",\"model_id\":2,\"changes\":[]}','2026-03-09 13:27:24','2026-03-09 13:27:24'),
(5,17,3,'task_updated','Task \"ცენტრალური კარის გაფართოება\" was updated','{\"model_type\":\"App\\\\Models\\\\Task\",\"model_id\":2,\"changes\":{\"task_stage_id\":7,\"updated_at\":\"2026-03-09 14:27:29\"}}','2026-03-09 13:27:29','2026-03-09 13:27:29'),
(6,17,3,'task_stage_changed','Task \"ცენტრალური კარის გაფართოება\" moved from To Do to In Progress','{\"model_type\":\"App\\\\Models\\\\Task\",\"model_id\":2,\"changes\":{\"task_stage_id\":7,\"updated_at\":\"2026-03-09 14:27:29\"},\"old_stage\":\"To Do\",\"new_stage\":\"In Progress\"}','2026-03-09 13:27:29','2026-03-09 13:27:29'),
(7,3,3,'invoice_created','Invoice \'INV-2026-0001\' was created for 0.00','{\"model_type\":\"App\\\\Models\\\\Invoice\",\"model_id\":1,\"changes\":[]}','2026-03-09 13:36:15','2026-03-09 13:36:15'),
(8,3,3,'invoice_updated','Invoice \'INV-2026-0001\' was updated','{\"model_type\":\"App\\\\Models\\\\Invoice\",\"model_id\":1,\"changes\":{\"subtotal\":20.440677966101696,\"tax_rate\":\"[{\\\"id\\\":1,\\\"name\\\":\\\"\\\\u10d3.\\\\u10e6.\\\\u10d2\\\",\\\"rate\\\":18,\\\"is_inclusive\\\":true,\\\"amount\\\":3.6793220338983055}]\",\"tax_amount\":3.6793220338983055,\"total_amount\":24.12}}','2026-03-09 13:36:15','2026-03-09 13:36:15'),
(9,3,3,'invoice_updated','Invoice \'INV-2026-0001\' was updated','{\"model_type\":\"App\\\\Models\\\\Invoice\",\"model_id\":1,\"changes\":{\"tax_rate\":\"[{\\\"id\\\":1,\\\"name\\\":\\\"\\\\u10d3.\\\\u10e6.\\\\u10d2\\\",\\\"rate\\\":18,\\\"is_inclusive\\\":true,\\\"amount\\\":3.6793220338983055}]\",\"subtotal\":20.440677966101696,\"tax_amount\":3.6793220338983055,\"total_amount\":24.12}}','2026-03-09 13:36:15','2026-03-09 13:36:15'),
(10,3,3,'invoice_updated','Invoice \'INV-2026-0001\' was updated','{\"model_type\":\"App\\\\Models\\\\Invoice\",\"model_id\":1,\"changes\":{\"approved_at\":\"2026-03-09 14:36:18\",\"approved_by\":3,\"updated_at\":\"2026-03-09 14:36:18\"}}','2026-03-09 13:36:18','2026-03-09 13:36:18'),
(11,3,3,'invoice_updated','Invoice \'INV-2026-0001\' was updated','{\"model_type\":\"App\\\\Models\\\\Invoice\",\"model_id\":1,\"changes\":{\"status\":\"paid\",\"paid_amount\":\"24.12\",\"paid_at\":\"2026-03-09 14:36:25\",\"payment_method\":\"company_card\",\"updated_at\":\"2026-03-09 14:36:25\"}}','2026-03-09 13:36:25','2026-03-09 13:36:25'),
(12,3,3,'projectexpense_created','Expense \'INV 09.03\' was submitted for 24.12 GEL','{\"model_type\":\"App\\\\Models\\\\ProjectExpense\",\"model_id\":1,\"changes\":[]}','2026-03-09 13:36:25','2026-03-09 13:36:25'),
(13,3,3,'task_updated','Task \"ცენტრალური კარის პეტლი\" was updated','{\"model_type\":\"App\\\\Models\\\\Task\",\"model_id\":1,\"changes\":{\"task_stage_id\":8,\"updated_at\":\"2026-03-09 14:37:14\"}}','2026-03-09 13:37:14','2026-03-09 13:37:14'),
(14,3,3,'task_stage_changed','Task \"ცენტრალური კარის პეტლი\" moved from Done to Review','{\"model_type\":\"App\\\\Models\\\\Task\",\"model_id\":1,\"changes\":{\"task_stage_id\":8,\"updated_at\":\"2026-03-09 14:37:14\"},\"old_stage\":\"Done\",\"new_stage\":\"Review\"}','2026-03-09 13:37:14','2026-03-09 13:37:14'),
(15,3,3,'task_updated','Task \"ცენტრალური კარის პეტლი\" was updated','{\"model_type\":\"App\\\\Models\\\\Task\",\"model_id\":1,\"changes\":{\"task_stage_id\":10,\"updated_at\":\"2026-03-09 14:37:18\"}}','2026-03-09 13:37:18','2026-03-09 13:37:18'),
(16,3,3,'task_stage_changed','Task \"ცენტრალური კარის პეტლი\" moved from Review to Done','{\"model_type\":\"App\\\\Models\\\\Task\",\"model_id\":1,\"changes\":{\"task_stage_id\":10,\"updated_at\":\"2026-03-09 14:37:18\"},\"old_stage\":\"Review\",\"new_stage\":\"Done\"}','2026-03-09 13:37:18','2026-03-09 13:37:18'),
(17,3,3,'updated','Project \'ისნის ფილიალი\' was updated','[]','2026-03-09 13:50:49','2026-03-09 13:50:49');
/*!40000 ALTER TABLE `project_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_attachments`
--

DROP TABLE IF EXISTS `project_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_attachments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `project_id` bigint(20) unsigned NOT NULL,
  `media_item_id` bigint(20) unsigned NOT NULL,
  `uploaded_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_attachments_media_item_id_foreign` (`media_item_id`),
  KEY `project_attachments_uploaded_by_foreign` (`uploaded_by`),
  KEY `project_attachments_workspace_id_project_id_created_at_index` (`workspace_id`,`project_id`,`created_at`),
  KEY `project_attachments_project_id_created_at_index` (`project_id`,`created_at`),
  CONSTRAINT `project_attachments_media_item_id_foreign` FOREIGN KEY (`media_item_id`) REFERENCES `media_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_attachments_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_attachments_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_attachments_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_attachments`
--

LOCK TABLES `project_attachments` WRITE;
/*!40000 ALTER TABLE `project_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_budgets`
--

DROP TABLE IF EXISTS `project_budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_budgets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) unsigned NOT NULL,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `total_budget` decimal(15,2) NOT NULL,
  `period_type` enum('project','monthly','quarterly') NOT NULL DEFAULT 'project',
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_budgets_project_id_status_index` (`project_id`,`status`),
  KEY `project_budgets_workspace_id_status_index` (`workspace_id`,`status`),
  KEY `project_budgets_created_by_foreign` (`created_by`),
  CONSTRAINT `project_budgets_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_budgets_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_budgets_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_budgets`
--

LOCK TABLES `project_budgets` WRITE;
/*!40000 ALTER TABLE `project_budgets` DISABLE KEYS */;
INSERT INTO `project_budgets` VALUES
(1,1,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:28','2026-03-09 13:53:28'),
(2,2,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:28','2026-03-09 13:53:28'),
(3,3,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:28','2026-03-09 13:53:28'),
(4,4,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(5,5,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(6,6,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(7,7,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(8,8,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(9,9,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(10,10,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(11,11,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(12,12,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(13,13,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(14,14,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(15,15,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(16,16,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29'),
(17,17,2,3000.00,'project','2026-03-09',NULL,NULL,'active',3,'2026-03-09 13:53:29','2026-03-09 13:53:29');
/*!40000 ALTER TABLE `project_budgets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_clients`
--

DROP TABLE IF EXISTS `project_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_clients` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_clients_project_id_user_id_unique` (`project_id`,`user_id`),
  KEY `project_clients_user_id_foreign` (`user_id`),
  KEY `project_clients_assigned_by_foreign` (`assigned_by`),
  CONSTRAINT `project_clients_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`),
  CONSTRAINT `project_clients_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_clients_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_clients`
--

LOCK TABLES `project_clients` WRITE;
/*!40000 ALTER TABLE `project_clients` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_expenses`
--

DROP TABLE IF EXISTS `project_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_expenses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) unsigned NOT NULL,
  `budget_category_id` bigint(20) unsigned DEFAULT NULL,
  `task_id` bigint(20) unsigned DEFAULT NULL,
  `invoice_id` bigint(20) unsigned DEFAULT NULL,
  `submitted_by` bigint(20) unsigned NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `approved_amount` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `expense_date` date NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected','requires_info') NOT NULL DEFAULT 'pending',
  `is_recurring` tinyint(1) NOT NULL DEFAULT 0,
  `receipt_required` tinyint(1) NOT NULL DEFAULT 0,
  `receipt_threshold` decimal(10,2) DEFAULT NULL,
  `approval_workflow` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`approval_workflow`)),
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `equipment_id` bigint(20) unsigned DEFAULT NULL,
  `service_type_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_project_status` (`project_id`,`status`),
  KEY `project_expenses_budget_category_id_status_index` (`budget_category_id`,`status`),
  KEY `project_expenses_submitted_by_status_index` (`submitted_by`,`status`),
  KEY `idx_status_created_at` (`status`,`created_at`),
  KEY `project_expenses_expense_date_index` (`expense_date`),
  KEY `project_expenses_task_id_foreign` (`task_id`),
  KEY `project_expenses_approved_by_foreign` (`approved_by`),
  KEY `project_expenses_invoice_id_foreign` (`invoice_id`),
  KEY `project_expenses_equipment_id_foreign` (`equipment_id`),
  KEY `project_expenses_service_type_id_foreign` (`service_type_id`),
  CONSTRAINT `project_expenses_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `project_expenses_budget_category_id_foreign` FOREIGN KEY (`budget_category_id`) REFERENCES `budget_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `project_expenses_equipment_id_foreign` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE SET NULL,
  CONSTRAINT `project_expenses_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `project_expenses_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_expenses_service_type_id_foreign` FOREIGN KEY (`service_type_id`) REFERENCES `service_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `project_expenses_submitted_by_foreign` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_expenses_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_expenses`
--

LOCK TABLES `project_expenses` WRITE;
/*!40000 ALTER TABLE `project_expenses` DISABLE KEYS */;
INSERT INTO `project_expenses` VALUES
(1,3,NULL,1,1,3,24.12,24.12,'GEL','2026-03-09','INV 09.03','From invoice INV-2026-0001',NULL,'approved',0,0,NULL,NULL,'2026-03-09 13:36:25',3,'2026-03-09 13:36:25','2026-03-09 13:36:25',NULL,NULL);
/*!40000 ALTER TABLE `project_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_members`
--

DROP TABLE IF EXISTS `project_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_members` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `role` enum('owner','manager','member','client') NOT NULL DEFAULT 'member',
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_members_project_id_user_id_unique` (`project_id`,`user_id`),
  KEY `project_members_user_id_foreign` (`user_id`),
  KEY `project_members_assigned_by_foreign` (`assigned_by`),
  CONSTRAINT `project_members_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`),
  CONSTRAINT `project_members_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_members_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_members`
--

LOCK TABLES `project_members` WRITE;
/*!40000 ALTER TABLE `project_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_milestones`
--

DROP TABLE IF EXISTS `project_milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_milestones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('pending','in_progress','completed','overdue') NOT NULL DEFAULT 'pending',
  `progress` int(11) NOT NULL DEFAULT 0,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_by` bigint(20) unsigned NOT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `completed_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_milestones_project_id_foreign` (`project_id`),
  KEY `project_milestones_created_by_foreign` (`created_by`),
  KEY `project_milestones_completed_by_foreign` (`completed_by`),
  CONSTRAINT `project_milestones_completed_by_foreign` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`),
  CONSTRAINT `project_milestones_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `project_milestones_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_milestones`
--

LOCK TABLES `project_milestones` WRITE;
/*!40000 ALTER TABLE `project_milestones` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_notes`
--

DROP TABLE IF EXISTS `project_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_notes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `is_pinned` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) unsigned NOT NULL,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_notes_project_id_foreign` (`project_id`),
  KEY `project_notes_created_by_foreign` (`created_by`),
  KEY `project_notes_updated_by_foreign` (`updated_by`),
  CONSTRAINT `project_notes_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `project_notes_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_notes_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_notes`
--

LOCK TABLES `project_notes` WRITE;
/*!40000 ALTER TABLE `project_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `projects` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `status` enum('planning','active','on_hold','completed','cancelled') NOT NULL DEFAULT 'planning',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `start_date` date DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `actual_hours` int(11) NOT NULL DEFAULT 0,
  `budget` decimal(10,2) DEFAULT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `shared_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`shared_settings`)),
  `password` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `projects_workspace_id_foreign` (`workspace_id`),
  KEY `projects_created_by_foreign` (`created_by`),
  KEY `projects_updated_by_foreign` (`updated_by`),
  CONSTRAINT `projects_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `projects_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `projects_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES
(1,2,'სათაო ოფისი','აღმაშენებლის გამზირი 50','აღმაშენებლის გამზირი 50','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(2,2,'პლეხანოვის ფილიალი','აღმაშენებლის გამზირი 51','აღმაშენებლის გამზირი 51','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(3,2,'ისნის ფილიალი','ისანი ნავთლუღის 6ა','ისანი ნავთლუღის 6ა','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,3,'2026-03-09 13:21:08','2026-03-09 13:50:49',NULL),
(4,2,'პუშკინის ფილიალი','პუშკინის 9','პუშკინის 9','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(5,2,'რუსთაველის ფილიალი','რუსთაველის 36','რუსთაველის 36','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(6,2,'ვარკეთილის ფილიალი','ჯავახეთის 46','ჯავახეთის 46','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(7,2,'გლდანის ფილიალი','ვეკუაას 17ა','ვეკუაას 17ა','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(8,2,'დიდუბის ფილიალი','ერისთავის 13','ერისთავის 13','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(9,2,'დიდი დიღმის ფილიალი','მირიან მეფის 43','მირიან მეფის 43','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(10,2,'ბახტრიონის ფილიალი','ბახტრიონის 7','ბახტრიონის 7','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(11,2,'ქავთარაძის ფილიალი','ქავთარაძის 5','ქავთარაძის 5','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(12,2,'ვაკის ფილიალი','ჭავჭავაძის 12','ჭავჭავაძის 12','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(13,2,'რუსთავის ფილიალი','რუსთავი, შარტავას 9','რუსთავი, შარტავას 9','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(14,2,'ზუგდიდის ფილიალი','ზუგდიდი, კოსტავას 9','ზუგდიდი, კოსტავას 9','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(15,2,'ქუთაისის ფილიალი','ქუთაისი, ფალიაშვილის 11','ქუთაისი, ფალიაშვილის 11','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(16,2,'ბათუმის ფილიალი','ბათუმი, ბაგრატიონის 156','ბათუმი, ბაგრატიონის 156','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL),
(17,2,'მთავარი საწყობი','თბილისი, გრიგოლ ლორთქიფანიძის ქუჩა','თბილისი, გრიგოლ ლორთქიფანიძის ქუჩა','active','high','2026-03-09',NULL,0,NULL,0,0,NULL,NULL,3,NULL,'2026-03-09 13:21:08','2026-03-09 13:21:08',NULL);
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_has_permissions`
--

DROP TABLE IF EXISTS `role_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `role_has_permissions_role_id_foreign` (`role_id`),
  CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_has_permissions`
--

LOCK TABLES `role_has_permissions` WRITE;
/*!40000 ALTER TABLE `role_has_permissions` DISABLE KEYS */;
INSERT INTO `role_has_permissions` VALUES
(1,1),
(1,2),
(1,3),
(1,4),
(1,5),
(1,6),
(2,1),
(2,2),
(2,3),
(2,6),
(3,1),
(3,2),
(4,1),
(4,2),
(5,1),
(5,2),
(6,1),
(6,2),
(7,1),
(7,2),
(8,1),
(8,2),
(9,1),
(9,2),
(10,1),
(10,2),
(11,1),
(11,2),
(11,3),
(11,4),
(11,5),
(12,1),
(12,2),
(12,3),
(12,4),
(12,5),
(13,1),
(13,2),
(14,1),
(14,2),
(15,1),
(15,2),
(15,3),
(15,4),
(15,5),
(16,1),
(16,2),
(16,3),
(16,4),
(16,5),
(17,1),
(17,2),
(17,3),
(18,1),
(18,2),
(18,3),
(19,1),
(19,2),
(19,3),
(20,1),
(20,2),
(20,3),
(21,1),
(21,2),
(21,3),
(22,1),
(22,2),
(22,3),
(23,1),
(23,2),
(23,3),
(24,1),
(24,2),
(24,3),
(25,1),
(25,2),
(25,3),
(26,1),
(26,2),
(26,3),
(27,1),
(27,2),
(27,3),
(28,1),
(28,2),
(28,3),
(29,1),
(29,2),
(29,3),
(30,1),
(30,2),
(31,1),
(31,2),
(31,3),
(32,1),
(32,2),
(33,1),
(33,2),
(33,4),
(33,5),
(34,1),
(34,2),
(34,4),
(34,5),
(35,1),
(35,2),
(35,4),
(36,1),
(36,2),
(36,4),
(37,1),
(37,2),
(38,1),
(38,2),
(39,1),
(39,2),
(40,1),
(40,2),
(41,1),
(41,2),
(42,1),
(42,2),
(43,1),
(43,2),
(43,4),
(44,1),
(44,2),
(45,1),
(45,2),
(46,1),
(46,2),
(47,1),
(47,2),
(47,3),
(47,5),
(48,1),
(48,2),
(48,3),
(48,5),
(49,1),
(49,2),
(49,3),
(50,1),
(50,2),
(50,3),
(50,5),
(51,1),
(51,2),
(51,3),
(51,5),
(52,1),
(52,2),
(52,3),
(52,5),
(53,1),
(53,2),
(53,3),
(54,1),
(54,2),
(54,3),
(55,1),
(55,2),
(55,3),
(56,1),
(56,2),
(56,3),
(57,1),
(57,2),
(57,3),
(58,1),
(58,2),
(58,3),
(59,1),
(59,2),
(59,3),
(60,1),
(60,2),
(60,3),
(61,1),
(61,2),
(61,3),
(61,4),
(62,1),
(62,2),
(62,3),
(62,4),
(63,1),
(63,2),
(63,3),
(63,4),
(64,1),
(64,2),
(64,3),
(65,1),
(65,2),
(65,3),
(66,1),
(66,2),
(66,3),
(67,1),
(67,2),
(67,3),
(68,1),
(68,2),
(68,3),
(69,1),
(69,2),
(69,3),
(70,1),
(70,2),
(70,3),
(71,1),
(71,2),
(71,3),
(72,1),
(72,2),
(72,3),
(73,1),
(73,2),
(73,3),
(74,1),
(74,2),
(74,3),
(75,1),
(75,2),
(75,3),
(76,1),
(76,2),
(76,3),
(77,1),
(77,2),
(77,3),
(78,1),
(78,2),
(78,3),
(79,1),
(79,2),
(79,3),
(79,5),
(80,1),
(80,2),
(80,3),
(80,5),
(81,1),
(81,2),
(81,3),
(82,1),
(82,2),
(82,3),
(83,1),
(83,2),
(83,3),
(84,1),
(84,2),
(84,3),
(85,1),
(85,2),
(85,3),
(86,1),
(86,2),
(86,3),
(87,1),
(87,2),
(87,3),
(88,1),
(88,2),
(88,3),
(89,1),
(89,2),
(89,3),
(90,1),
(90,2),
(90,3),
(91,1),
(91,2),
(91,3),
(91,6),
(92,1),
(92,2),
(92,3),
(92,6),
(93,1),
(93,2),
(93,3),
(93,6),
(94,1),
(94,2),
(94,3),
(94,6),
(95,1),
(95,2),
(95,3),
(95,6),
(96,1),
(96,2),
(96,3),
(96,6),
(97,1),
(97,2),
(97,3),
(97,6),
(98,1),
(98,2),
(98,3),
(98,6),
(99,1),
(99,2),
(99,3),
(99,6),
(100,1),
(100,2),
(100,6),
(101,6),
(102,6),
(103,6),
(104,6),
(105,6),
(106,6),
(107,6),
(108,1),
(108,2),
(108,6),
(109,1),
(109,2),
(109,6),
(110,1),
(110,2),
(110,6),
(111,6),
(112,6),
(113,1),
(113,2),
(113,6),
(114,1),
(114,2),
(114,6),
(115,1),
(115,2),
(115,3),
(116,1),
(116,2),
(116,3),
(117,1),
(117,2),
(117,3),
(118,1),
(118,2),
(118,3),
(119,1),
(119,2),
(119,3),
(120,1),
(120,2),
(120,3),
(121,1),
(121,2),
(121,3),
(122,1),
(122,2),
(122,3),
(123,1),
(123,2),
(123,3),
(124,1),
(124,2),
(124,3),
(125,1),
(125,2),
(125,3),
(126,1),
(126,2),
(126,3),
(140,1),
(140,2),
(140,3),
(140,4),
(140,5),
(140,6),
(150,6),
(151,6),
(152,6),
(153,6),
(154,6),
(155,6),
(156,6),
(157,6),
(158,6),
(164,6),
(165,6),
(166,6),
(167,6),
(168,6),
(169,6),
(170,6),
(171,6),
(172,6),
(173,6),
(174,6),
(175,6),
(176,1),
(176,2),
(176,6),
(177,1),
(177,2),
(177,6),
(178,1),
(178,2),
(178,6),
(179,1),
(179,2),
(179,6),
(180,1),
(180,2),
(180,6),
(181,6),
(182,6),
(183,6),
(184,6),
(185,6),
(186,6),
(187,6),
(188,6),
(189,6),
(190,6),
(191,6),
(192,6),
(193,6),
(194,6),
(195,6),
(196,6),
(197,6),
(198,6),
(199,6),
(200,1),
(200,2),
(201,1),
(201,2),
(202,1),
(202,2),
(203,1),
(203,2),
(204,1),
(204,2),
(205,1),
(205,2),
(206,1),
(206,2),
(207,1),
(207,2),
(208,1),
(208,2),
(209,1),
(209,2),
(210,1),
(210,2),
(211,1),
(211,2),
(211,6),
(212,6),
(213,1),
(213,2),
(213,6),
(214,6),
(215,1),
(215,2),
(215,6),
(216,6),
(217,6),
(218,6),
(219,6),
(220,6),
(221,6),
(222,6),
(223,6),
(224,1),
(224,2),
(224,3),
(224,4),
(224,5),
(225,1),
(225,2),
(225,3),
(225,4),
(226,1),
(226,2),
(226,3),
(226,4),
(227,1),
(227,2),
(227,3),
(228,1),
(228,2),
(228,3),
(228,4),
(229,6),
(230,6),
(231,6),
(232,6),
(233,6),
(234,6),
(235,6),
(236,6),
(237,1),
(237,2),
(237,6),
(238,1),
(238,2),
(238,6),
(239,6),
(240,1),
(240,2),
(240,6),
(241,1),
(241,2),
(241,6),
(242,1),
(242,2),
(243,1),
(243,2),
(243,6),
(244,6),
(245,1),
(245,2),
(245,6),
(246,6),
(247,6),
(248,6),
(249,6),
(250,6),
(251,1),
(251,2),
(252,1),
(252,2),
(253,1),
(253,2),
(254,1),
(254,2),
(254,6),
(255,1),
(255,2),
(256,6),
(257,1),
(257,2),
(257,3),
(257,4),
(257,5),
(258,1),
(258,2),
(258,3),
(258,4),
(258,5),
(259,1),
(259,2),
(260,1),
(260,2),
(261,1),
(261,2),
(262,1),
(262,2),
(262,3),
(262,4),
(262,5),
(263,1),
(263,2),
(264,1),
(264,2),
(265,1),
(265,2),
(266,1),
(266,2),
(267,1),
(267,2),
(267,3),
(267,4),
(267,5),
(268,1),
(268,2),
(268,3),
(268,4),
(268,5),
(269,1),
(269,2),
(270,1),
(270,2),
(271,1),
(271,2),
(272,1),
(272,2),
(272,3),
(272,4),
(272,5),
(273,1),
(273,2),
(274,1),
(274,2),
(275,1),
(275,2),
(276,1),
(276,2),
(277,1),
(277,2),
(278,1),
(278,2),
(279,1),
(279,2),
(280,1),
(280,2),
(281,1),
(281,2),
(282,1),
(282,2),
(283,1),
(283,2),
(284,1),
(284,2),
(285,1),
(285,2),
(285,3),
(285,4),
(285,5),
(286,1),
(286,2),
(286,3),
(286,4),
(286,5),
(287,1),
(287,2),
(287,3),
(287,4),
(287,5),
(288,1),
(288,2),
(288,3),
(288,4),
(289,1),
(289,2),
(289,3),
(289,4),
(289,5),
(290,1),
(290,2),
(290,3),
(290,4),
(290,5),
(291,1),
(291,2),
(291,3),
(291,4),
(291,5),
(292,1),
(292,2),
(292,3),
(292,4),
(292,5),
(293,1),
(293,2),
(293,3),
(293,4),
(293,5),
(294,1),
(294,2),
(294,3),
(294,4),
(294,5),
(295,1),
(295,2),
(295,3),
(295,4),
(295,5),
(296,1),
(296,2),
(296,3),
(296,4),
(296,5),
(297,1),
(297,2),
(297,3),
(298,1),
(298,2),
(298,5),
(299,1),
(299,2),
(299,5),
(300,1),
(300,2),
(301,1),
(301,2),
(302,1),
(302,2),
(303,1),
(303,2),
(304,1),
(304,2),
(304,3),
(304,5),
(305,1),
(305,2),
(305,3),
(305,5),
(306,1),
(306,2),
(306,3),
(307,1),
(307,2),
(307,3),
(308,1),
(308,2),
(309,1),
(309,2),
(309,3),
(310,1),
(310,2),
(310,3),
(311,1),
(311,2),
(311,5),
(312,1),
(312,2),
(312,5),
(313,1),
(313,2),
(314,1),
(314,2),
(315,1),
(315,2),
(316,1),
(316,2),
(316,5),
(317,1),
(317,2),
(317,5),
(318,1),
(318,2),
(319,1),
(319,2),
(320,1),
(320,2),
(321,1),
(321,2),
(322,1),
(322,2),
(323,1),
(323,2),
(324,1),
(324,2),
(324,5),
(325,1),
(325,2),
(325,5),
(326,1),
(326,2),
(326,5),
(327,1),
(327,2),
(328,1),
(328,2),
(329,1),
(329,2),
(330,1),
(330,2),
(331,1),
(331,2),
(332,1),
(332,2),
(333,1),
(333,2),
(334,1),
(334,2),
(334,5),
(335,1),
(335,2),
(336,1),
(336,2),
(337,1),
(337,2),
(338,1),
(338,2),
(339,1),
(339,2),
(340,1),
(340,2),
(341,1),
(341,2),
(342,1),
(342,2),
(343,1),
(343,2),
(343,3),
(343,4),
(343,5),
(344,1),
(344,2),
(344,3),
(344,4),
(344,5),
(345,1),
(345,2),
(345,3),
(346,1),
(346,2),
(346,3),
(347,1),
(347,2),
(347,3);
/*!40000 ALTER TABLE `role_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES
(1,'company','web','Company','Company has access to manage their business workspace','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(2,'owner','web','Owner','Owner with read-only access','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(3,'manager','web','Manager','Manager with full workspace management','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(4,'member','web','Member','Member with limited workspace access','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(5,'client','web','Client','Client with read-only access','2026-03-09 13:00:38','2026-03-09 13:00:38'),
(6,'superadmin','web','Super Admin','Super Admin has full access to all SaaS platform features','2026-03-09 13:05:51','2026-03-09 13:05:51');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_types`
--

DROP TABLE IF EXISTS `service_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_types` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `service_types_workspace_id_index` (`workspace_id`),
  CONSTRAINT `service_types_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_types`
--

LOCK TABLES `service_types` WRITE;
/*!40000 ALTER TABLE `service_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `workspace_id` bigint(20) unsigned DEFAULT NULL,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_user_id_workspace_id_key_unique` (`user_id`,`workspace_id`,`key`),
  CONSTRAINT `settings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES
(41,2,NULL,'defaultLanguage','ka','2026-03-09 13:05:51','2026-03-09 13:21:17'),
(42,2,NULL,'dateFormat','Y-m-d','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(43,2,NULL,'timeFormat','H:i','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(44,2,NULL,'calendarStartDay','monday','2026-03-09 13:05:51','2026-03-09 13:21:17'),
(45,2,NULL,'defaultTimezone','Asia/Tbilisi','2026-03-09 13:05:51','2026-03-09 13:21:17'),
(46,2,NULL,'emailVerification','0','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(47,2,NULL,'landingPageEnabled','0','2026-03-09 13:05:51','2026-03-09 13:21:27'),
(48,2,NULL,'logoDark','/images/logos/logo-dark.png','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(49,2,NULL,'logoLight','/images/logos/logo-light.png','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(50,2,NULL,'favicon','/images/logos/favicon.png','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(51,2,NULL,'titleText','Humana Tasks','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(52,2,NULL,'footerText','© 2024 Humana Tasks. All rights reserved.','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(53,2,NULL,'themeColor','green','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(54,2,NULL,'customColor','#10B77F','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(55,2,NULL,'sidebarVariant','inset','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(56,2,NULL,'sidebarStyle','plain','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(57,2,NULL,'layoutDirection','left','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(58,2,NULL,'themeMode','light','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(59,2,NULL,'storage_type','local','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(60,2,NULL,'storage_file_types','jpg,jpeg,png,pdf,doc,docx,xls,xlsx,ppt,pptx','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(61,2,NULL,'storage_max_upload_size','10240','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(62,2,NULL,'aws_access_key_id','','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(63,2,NULL,'aws_secret_access_key','','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(64,2,NULL,'aws_default_region','us-east-1','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(65,2,NULL,'aws_bucket','','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(66,2,NULL,'aws_url','','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(67,2,NULL,'aws_endpoint','','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(68,2,NULL,'wasabi_access_key','','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(69,2,NULL,'wasabi_secret_key','','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(70,2,NULL,'wasabi_region','us-east-1','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(71,2,NULL,'wasabi_bucket','','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(72,2,NULL,'wasabi_url','','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(73,2,NULL,'wasabi_root','','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(74,2,NULL,'decimalFormat','1','2026-03-09 13:05:51','2026-03-09 13:22:00'),
(75,2,NULL,'defaultCurrency','GEL','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(76,2,NULL,'decimalSeparator','.','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(77,2,NULL,'thousandsSeparator',',','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(78,2,NULL,'floatNumber','1','2026-03-09 13:05:51','2026-03-09 13:05:51'),
(79,2,NULL,'currencySymbolSpace','1','2026-03-09 13:05:51','2026-03-09 13:22:00'),
(80,2,NULL,'currencySymbolPosition','after','2026-03-09 13:05:51','2026-03-09 13:22:00'),
(81,3,2,'calendarStartDay','sunday','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(82,3,2,'customColor','#10B77F','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(83,3,2,'dateFormat','Y-m-d','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(84,3,2,'defaultLanguage','en','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(85,3,2,'defaultTimezone','UTC','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(86,3,2,'emailVerification','0','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(87,3,2,'favicon','/images/logos/favicon.png','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(88,3,2,'footerText','© 2024 Humana Tasks. All rights reserved.','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(89,3,2,'landingPageEnabled','1','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(90,3,2,'layoutDirection','left','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(91,3,2,'logoDark','/images/logos/logo-dark.png','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(92,3,2,'logoLight','/images/logos/logo-light.png','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(93,3,2,'sidebarStyle','plain','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(94,3,2,'sidebarVariant','inset','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(95,3,2,'themeColor','green','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(96,3,2,'themeMode','light','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(97,3,2,'timeFormat','H:i','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(98,3,2,'titleText','Humana Tasks','2026-03-09 13:06:29','2026-03-09 13:06:29'),
(99,2,NULL,'termsConditionsUrl',NULL,'2026-03-09 13:21:17','2026-03-09 13:21:17'),
(100,3,2,'email_provider','smtp','2026-03-09 14:03:33','2026-03-09 14:03:33'),
(101,3,2,'email_driver','smtp','2026-03-09 14:03:33','2026-03-09 14:03:33'),
(102,3,2,'email_host','smtp.inexia.cc','2026-03-09 14:03:33','2026-03-09 14:12:54'),
(103,3,2,'email_port','587','2026-03-09 14:03:33','2026-03-09 14:03:33'),
(104,3,2,'email_username','tasky@inexia.cc','2026-03-09 14:03:33','2026-03-09 14:03:33'),
(105,3,2,'email_password','Dr@nda252','2026-03-09 14:03:33','2026-03-09 14:03:33'),
(106,3,2,'email_encryption','ssl','2026-03-09 14:03:33','2026-03-09 14:13:06'),
(107,3,2,'email_from_address','tasky@inexia.cc','2026-03-09 14:03:33','2026-03-09 14:03:33'),
(108,3,2,'email_from_name','Humana Tasky','2026-03-09 14:03:33','2026-03-09 14:03:33');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_attachments`
--

DROP TABLE IF EXISTS `task_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_attachments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) unsigned NOT NULL,
  `media_item_id` bigint(20) unsigned NOT NULL,
  `uploaded_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `task_attachments_uploaded_by_foreign` (`uploaded_by`),
  KEY `task_attachments_task_id_created_at_index` (`task_id`,`created_at`),
  KEY `task_attachments_media_item_id_index` (`media_item_id`),
  CONSTRAINT `task_attachments_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_attachments_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_attachments`
--

LOCK TABLES `task_attachments` WRITE;
/*!40000 ALTER TABLE `task_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_checklists`
--

DROP TABLE IF EXISTS `task_checklists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_checklists` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `order` int(11) NOT NULL DEFAULT 0,
  `assigned_to` bigint(20) unsigned DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `task_checklists_created_by_foreign` (`created_by`),
  KEY `task_checklists_assigned_to_foreign` (`assigned_to`),
  KEY `task_checklists_task_id_order_index` (`task_id`,`order`),
  CONSTRAINT `task_checklists_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `task_checklists_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_checklists_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_checklists`
--

LOCK TABLES `task_checklists` WRITE;
/*!40000 ALTER TABLE `task_checklists` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_checklists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_comments`
--

DROP TABLE IF EXISTS `task_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_comments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `comment` text NOT NULL,
  `mentions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mentions`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `task_comments_user_id_foreign` (`user_id`),
  KEY `task_comments_task_id_created_at_index` (`task_id`,`created_at`),
  CONSTRAINT `task_comments_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_comments`
--

LOCK TABLES `task_comments` WRITE;
/*!40000 ALTER TABLE `task_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_members`
--

DROP TABLE IF EXISTS `task_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_members` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `assigned_by` bigint(20) unsigned NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `task_members_task_id_user_id_unique` (`task_id`,`user_id`),
  KEY `task_members_assigned_by_foreign` (`assigned_by`),
  KEY `task_members_user_id_assigned_at_index` (`user_id`,`assigned_at`),
  CONSTRAINT `task_members_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_members_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_members_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_members`
--

LOCK TABLES `task_members` WRITE;
/*!40000 ALTER TABLE `task_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_stages`
--

DROP TABLE IF EXISTS `task_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_stages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(255) NOT NULL DEFAULT '#3b82f6',
  `order` int(11) NOT NULL DEFAULT 0,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `task_stages_workspace_id_order_index` (`workspace_id`,`order`),
  CONSTRAINT `task_stages_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_stages`
--

LOCK TABLES `task_stages` WRITE;
/*!40000 ALTER TABLE `task_stages` DISABLE KEYS */;
INSERT INTO `task_stages` VALUES
(6,2,'To Do','#ef4444',1,1,'2026-03-09 13:06:29','2026-03-09 13:06:29'),
(7,2,'In Progress','#f59e0b',2,0,'2026-03-09 13:06:29','2026-03-09 13:06:29'),
(8,2,'Review','#3b82f6',3,0,'2026-03-09 13:06:29','2026-03-09 13:06:29'),
(9,2,'Blocked','#a855f7',4,0,'2026-03-09 13:06:29','2026-03-09 13:06:29'),
(10,2,'Done','#10B77F',5,0,'2026-03-09 13:06:29','2026-03-09 13:06:29');
/*!40000 ALTER TABLE `task_stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tasks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) unsigned NOT NULL,
  `task_stage_id` bigint(20) unsigned NOT NULL,
  `milestone_id` bigint(20) unsigned DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `assigned_to` bigint(20) unsigned DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  `is_googlecalendar_sync` tinyint(1) NOT NULL DEFAULT 0,
  `google_calendar_event_id` varchar(255) DEFAULT NULL,
  `google_sheet_sync_key` varchar(512) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `equipment_id` bigint(20) unsigned DEFAULT NULL,
  `equipment_schedule_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tasks_task_stage_id_foreign` (`task_stage_id`),
  KEY `tasks_created_by_foreign` (`created_by`),
  KEY `tasks_milestone_id_foreign` (`milestone_id`),
  KEY `tasks_project_id_task_stage_id_index` (`project_id`,`task_stage_id`),
  KEY `tasks_assigned_to_created_by_index` (`assigned_to`,`created_by`),
  KEY `tasks_google_sheet_sync_key_index` (`google_sheet_sync_key`),
  KEY `tasks_equipment_id_foreign` (`equipment_id`),
  KEY `tasks_equipment_schedule_id_foreign` (`equipment_schedule_id`),
  CONSTRAINT `tasks_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_equipment_id_foreign` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_equipment_schedule_id_foreign` FOREIGN KEY (`equipment_schedule_id`) REFERENCES `equipment_schedules` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_milestone_id_foreign` FOREIGN KEY (`milestone_id`) REFERENCES `project_milestones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_task_stage_id_foreign` FOREIGN KEY (`task_stage_id`) REFERENCES `task_stages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES
(1,3,10,NULL,'ცენტრალური კარის პეტლი',NULL,'high','2026-03-09','2026-03-13',NULL,3,0,0,NULL,NULL,'2026-03-09 13:26:40','2026-03-09 13:37:18',NULL,NULL),
(2,17,7,NULL,'ცენტრალური კარის გაფართოება',NULL,'high','2026-03-06','2026-03-31',NULL,3,0,0,NULL,NULL,'2026-03-09 13:27:24','2026-03-09 13:27:29',NULL,NULL);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `taxes`
--

DROP TABLE IF EXISTS `taxes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `rate` double NOT NULL,
  `is_inclusive` tinyint(1) NOT NULL DEFAULT 0,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `taxes_workspace_id_foreign` (`workspace_id`),
  CONSTRAINT `taxes_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taxes`
--

LOCK TABLES `taxes` WRITE;
/*!40000 ALTER TABLE `taxes` DISABLE KEYS */;
INSERT INTO `taxes` VALUES
(1,'დ.ღ.გ',18,1,2,'2026-03-09 13:32:32','2026-03-09 13:32:32'),
(2,'საშემმოსავლო',20,0,2,'2026-03-09 13:32:41','2026-03-09 13:32:41');
/*!40000 ALTER TABLE `taxes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timesheet_approvals`
--

DROP TABLE IF EXISTS `timesheet_approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timesheet_approvals` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `timesheet_id` bigint(20) unsigned NOT NULL,
  `approver_id` bigint(20) unsigned NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `comments` text DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `timesheet_approvals_timesheet_id_status_index` (`timesheet_id`,`status`),
  KEY `timesheet_approvals_approver_id_status_index` (`approver_id`,`status`),
  CONSTRAINT `timesheet_approvals_approver_id_foreign` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `timesheet_approvals_timesheet_id_foreign` FOREIGN KEY (`timesheet_id`) REFERENCES `timesheets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timesheet_approvals`
--

LOCK TABLES `timesheet_approvals` WRITE;
/*!40000 ALTER TABLE `timesheet_approvals` DISABLE KEYS */;
/*!40000 ALTER TABLE `timesheet_approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timesheet_entries`
--

DROP TABLE IF EXISTS `timesheet_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timesheet_entries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `timesheet_id` bigint(20) unsigned NOT NULL,
  `project_id` bigint(20) unsigned NOT NULL,
  `task_id` bigint(20) unsigned DEFAULT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `hours` decimal(8,2) NOT NULL,
  `description` text DEFAULT NULL,
  `is_billable` tinyint(1) NOT NULL DEFAULT 1,
  `hourly_rate` decimal(8,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `timesheet_entries_project_id_foreign` (`project_id`),
  KEY `timesheet_entries_timesheet_id_project_id_index` (`timesheet_id`,`project_id`),
  KEY `timesheet_entries_user_id_date_index` (`user_id`,`date`),
  KEY `timesheet_entries_task_id_is_billable_index` (`task_id`,`is_billable`),
  CONSTRAINT `timesheet_entries_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `timesheet_entries_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL,
  CONSTRAINT `timesheet_entries_timesheet_id_foreign` FOREIGN KEY (`timesheet_id`) REFERENCES `timesheets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `timesheet_entries_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timesheet_entries`
--

LOCK TABLES `timesheet_entries` WRITE;
/*!40000 ALTER TABLE `timesheet_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `timesheet_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timesheets`
--

DROP TABLE IF EXISTS `timesheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timesheets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('draft','submitted','approved','rejected') NOT NULL DEFAULT 'draft',
  `total_hours` decimal(8,2) NOT NULL DEFAULT 0.00,
  `billable_hours` decimal(8,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `timesheets_workspace_id_foreign` (`workspace_id`),
  KEY `timesheets_approved_by_foreign` (`approved_by`),
  KEY `timesheets_user_id_workspace_id_status_index` (`user_id`,`workspace_id`,`status`),
  KEY `timesheets_start_date_end_date_index` (`start_date`,`end_date`),
  CONSTRAINT `timesheets_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `timesheets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `timesheets_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timesheets`
--

LOCK TABLES `timesheets` WRITE;
/*!40000 ALTER TABLE `timesheets` DISABLE KEYS */;
/*!40000 ALTER TABLE `timesheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_email_templates`
--

DROP TABLE IF EXISTS `user_email_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_email_templates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `template_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_email_templates_template_id_foreign` (`template_id`),
  CONSTRAINT `user_email_templates_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `email_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_email_templates`
--

LOCK TABLES `user_email_templates` WRITE;
/*!40000 ALTER TABLE `user_email_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_email_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notification_templates`
--

DROP TABLE IF EXISTS `user_notification_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_notification_templates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `template_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `type` varchar(255) NOT NULL DEFAULT 'slack',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_notification_templates_user_id_template_id_type_unique` (`user_id`,`template_id`,`type`),
  KEY `user_notification_templates_template_id_foreign` (`template_id`),
  CONSTRAINT `user_notification_templates_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `notification_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notification_templates`
--

LOCK TABLES `user_notification_templates` WRITE;
/*!40000 ALTER TABLE `user_notification_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_notification_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `lang` varchar(255) DEFAULT 'en',
  `current_business` bigint(20) unsigned DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'company',
  `plan_id` bigint(20) unsigned DEFAULT NULL,
  `created_by` int(11) NOT NULL DEFAULT 0,
  `mode` varchar(255) NOT NULL DEFAULT 'light',
  `is_enable_login` int(11) NOT NULL DEFAULT 1,
  `google2fa_enable` int(11) NOT NULL DEFAULT 0,
  `google2fa_secret` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `active_module` text DEFAULT NULL,
  `current_workspace_id` bigint(20) unsigned DEFAULT NULL,
  `timer_active` tinyint(1) NOT NULL DEFAULT 0,
  `timer_project_id` bigint(20) unsigned DEFAULT NULL,
  `timer_task_id` bigint(20) unsigned DEFAULT NULL,
  `timer_entry_id` bigint(20) unsigned DEFAULT NULL,
  `timer_started_at` timestamp NULL DEFAULT NULL,
  `timer_description` text DEFAULT NULL,
  `timer_elapsed_seconds` decimal(10,3) NOT NULL DEFAULT 0.000,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `plan_expire_date` date DEFAULT NULL,
  `requested_plan` int(11) DEFAULT 0,
  `plan_is_active` int(11) DEFAULT 1,
  `storage_limit` float(15,2) DEFAULT 0.00,
  `is_trial` varchar(255) DEFAULT NULL,
  `trial_day` int(11) DEFAULT 0,
  `trial_expire_date` date DEFAULT NULL,
  `referral_code` int(11) DEFAULT 0,
  `used_referral_code` int(11) DEFAULT 0,
  `commission_amount` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(2,'Super Admin','superadmin@example.com','2026-03-09 13:05:51','$2y$12$Bl.XCKC61c/JNnPSesp02OJdzCHDhtbASTuHPr6OlnMDMOsASGE6y',NULL,'en',NULL,NULL,'superadmin',NULL,0,'light',1,0,NULL,'active',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,0.000,'2026-03-09 13:05:51','2026-03-09 13:05:51',NULL,0,1,0.00,NULL,0,NULL,0,0,0),
(3,'Humana','shota@humana-georgia.ge',NULL,'$2y$12$lXgViDUWtCXouUlCwzqxsu4dFvsEE1PSNVyJyIyOODTgPJXBmqtJK',NULL,'ka',NULL,NULL,'company',1,0,'light',1,0,NULL,'active',NULL,2,0,NULL,NULL,NULL,NULL,NULL,0.000,'2026-03-09 13:06:29','2026-03-09 13:37:43','2026-04-09',0,1,0.00,NULL,0,NULL,973110,0,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webhooks`
--

DROP TABLE IF EXISTS `webhooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `webhooks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `workspace_id` bigint(20) unsigned DEFAULT NULL,
  `module` enum('Workspace Invitation','New Project','New Task','New Budget','New Invoice') NOT NULL,
  `method` enum('GET','POST') NOT NULL,
  `url` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `webhooks_user_id_foreign` (`user_id`),
  CONSTRAINT `webhooks_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webhooks`
--

LOCK TABLES `webhooks` WRITE;
/*!40000 ALTER TABLE `webhooks` DISABLE KEYS */;
/*!40000 ALTER TABLE `webhooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workspace_invitations`
--

DROP TABLE IF EXISTS `workspace_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workspace_invitations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `role` enum('manager','member','client') NOT NULL DEFAULT 'member',
  `invited_by` bigint(20) unsigned NOT NULL,
  `expires_at` timestamp NOT NULL,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workspace_invitations_token_unique` (`token`),
  KEY `workspace_invitations_invited_by_foreign` (`invited_by`),
  KEY `workspace_invitations_workspace_id_index` (`workspace_id`),
  KEY `workspace_invitations_email_index` (`email`),
  KEY `workspace_invitations_token_index` (`token`),
  CONSTRAINT `workspace_invitations_invited_by_foreign` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workspace_invitations_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workspace_invitations`
--

LOCK TABLES `workspace_invitations` WRITE;
/*!40000 ALTER TABLE `workspace_invitations` DISABLE KEYS */;
/*!40000 ALTER TABLE `workspace_invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workspace_members`
--

DROP TABLE IF EXISTS `workspace_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workspace_members` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `role` enum('owner','manager','member','client') NOT NULL DEFAULT 'member',
  `status` enum('active','inactive','pending') NOT NULL DEFAULT 'pending',
  `invited_by` bigint(20) unsigned DEFAULT NULL,
  `invited_at` timestamp NULL DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workspace_members_workspace_id_user_id_unique` (`workspace_id`,`user_id`),
  KEY `workspace_members_invited_by_foreign` (`invited_by`),
  KEY `workspace_members_workspace_id_index` (`workspace_id`),
  KEY `workspace_members_user_id_index` (`user_id`),
  CONSTRAINT `workspace_members_invited_by_foreign` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `workspace_members_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workspace_members_workspace_id_foreign` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workspace_members`
--

LOCK TABLES `workspace_members` WRITE;
/*!40000 ALTER TABLE `workspace_members` DISABLE KEYS */;
INSERT INTO `workspace_members` VALUES
(2,2,3,'owner','active',NULL,NULL,'2026-03-09 13:06:29','2026-03-09 13:06:29','2026-03-09 13:06:29');
/*!40000 ALTER TABLE `workspace_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workspaces`
--

DROP TABLE IF EXISTS `workspaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workspaces` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `owner_id` bigint(20) unsigned NOT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `timesheet_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `timesheet_approval_required` enum('none','manager','admin') NOT NULL DEFAULT 'manager',
  `timesheet_auto_submit` tinyint(1) NOT NULL DEFAULT 0,
  `timesheet_reminder_days` int(11) NOT NULL DEFAULT 3,
  `default_work_start` time NOT NULL DEFAULT '09:00:00',
  `default_work_end` time NOT NULL DEFAULT '17:00:00',
  `budget_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`budget_settings`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workspaces_slug_unique` (`slug`),
  KEY `workspaces_owner_id_index` (`owner_id`),
  KEY `workspaces_slug_index` (`slug`),
  CONSTRAINT `workspaces_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workspaces`
--

LOCK TABLES `workspaces` WRITE;
/*!40000 ALTER TABLE `workspaces` DISABLE KEYS */;
INSERT INTO `workspaces` VALUES
(2,'Humana\'s Workspace','humana-workspace-3',NULL,3,NULL,1,1,'manager',0,3,'09:00:00','17:00:00',NULL,'2026-03-09 13:06:29','2026-03-09 13:06:29');
/*!40000 ALTER TABLE `workspaces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zoom_meeting_members`
--

DROP TABLE IF EXISTS `zoom_meeting_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `zoom_meeting_members` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `zoom_meeting_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `zoom_meeting_members_zoom_meeting_id_user_id_unique` (`zoom_meeting_id`,`user_id`),
  KEY `zoom_meeting_members_user_id_foreign` (`user_id`),
  CONSTRAINT `zoom_meeting_members_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `zoom_meeting_members_zoom_meeting_id_foreign` FOREIGN KEY (`zoom_meeting_id`) REFERENCES `zoom_meetings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zoom_meeting_members`
--

LOCK TABLES `zoom_meeting_members` WRITE;
/*!40000 ALTER TABLE `zoom_meeting_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `zoom_meeting_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zoom_meetings`
--

DROP TABLE IF EXISTS `zoom_meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `zoom_meetings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `zoom_meeting_id` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `timezone` varchar(255) NOT NULL DEFAULT 'UTC',
  `duration` int(11) NOT NULL,
  `join_url` text DEFAULT NULL,
  `start_url` text DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `attendees` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attendees`)),
  `status` enum('scheduled','started','ended','cancelled') NOT NULL DEFAULT 'scheduled',
  `type` enum('instant','scheduled','recurring') NOT NULL DEFAULT 'scheduled',
  `user_id` bigint(20) unsigned NOT NULL,
  `workspace_id` bigint(20) unsigned NOT NULL,
  `project_id` bigint(20) unsigned DEFAULT NULL,
  `zoom_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`zoom_settings`)),
  `is_googlecalendar_sync` tinyint(1) NOT NULL DEFAULT 0,
  `google_calendar_event_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `zoom_meetings_user_id_start_time_index` (`user_id`,`start_time`),
  KEY `zoom_meetings_workspace_id_start_time_index` (`workspace_id`,`start_time`),
  KEY `zoom_meetings_project_id_start_time_index` (`project_id`,`start_time`),
  KEY `zoom_meetings_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zoom_meetings`
--

LOCK TABLES `zoom_meetings` WRITE;
/*!40000 ALTER TABLE `zoom_meetings` DISABLE KEYS */;
/*!40000 ALTER TABLE `zoom_meetings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-09 16:14:57
