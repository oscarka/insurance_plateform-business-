-- ============================================
-- 乐选渠道对接配置 - 任务1-12数据库迁移脚本
-- 执行日期：2025-12-10
-- ============================================

USE `insurance_platform`;

-- ============================================
-- 任务1：创建职业分类表 occupation_categories
-- ============================================
CREATE TABLE IF NOT EXISTS `occupation_categories` (
  `occupation_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '职业ID',
  `company_id` BIGINT NOT NULL COMMENT '保司ID（外键，关联insurance_companies）',
  `industry_large_code` VARCHAR(20) DEFAULT NULL COMMENT '行业大分类代码',
  `industry_large_name` VARCHAR(100) DEFAULT NULL COMMENT '行业大分类名称',
  `industry_medium_code` VARCHAR(20) DEFAULT NULL COMMENT '行业中分类代码',
  `industry_medium_name` VARCHAR(100) DEFAULT NULL COMMENT '行业中分类名称',
  `industry_small_name` VARCHAR(100) DEFAULT NULL COMMENT '行业小分类名称',
  `occupation_detail_code` VARCHAR(20) NOT NULL COMMENT '职业细类代码',
  `occupation_detail_name` VARCHAR(200) NOT NULL COMMENT '职业细类名称',
  `occupation_level` INT NOT NULL COMMENT '职业等级1-5',
  `industry_factor` DECIMAL(5,2) DEFAULT NULL COMMENT '行业系数（用于保费计算）',
  `status` VARCHAR(20) NOT NULL DEFAULT '启用' COMMENT '状态（启用/禁用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`occupation_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_occupation_code` (`company_id`, `occupation_detail_code`),
  KEY `idx_occupation_level` (`occupation_level`),
  CONSTRAINT `fk_oc_company` FOREIGN KEY (`company_id`) REFERENCES `insurance_companies` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='职业分类表';

-- ============================================
-- 任务12：创建条款表 insurance_clauses（需要先创建，因为责任表需要关联）
-- ============================================
CREATE TABLE IF NOT EXISTS `insurance_clauses` (
  `clause_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '条款ID',
  `company_id` BIGINT NOT NULL COMMENT '保司ID（外键，关联insurance_companies）',
  `clause_code` VARCHAR(50) NOT NULL COMMENT '条款代码（保司定义）',
  `clause_name` VARCHAR(200) NOT NULL COMMENT '条款名称',
  `clause_type` VARCHAR(20) NOT NULL COMMENT '条款类型（主险/附加险/特约）',
  `registration_no` VARCHAR(100) DEFAULT NULL COMMENT '注册号',
  `clause_content` TEXT DEFAULT NULL COMMENT '条款内容',
  `status` VARCHAR(20) NOT NULL DEFAULT '启用' COMMENT '状态（启用/禁用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`clause_id`),
  KEY `idx_company_id` (`company_id`),
  UNIQUE KEY `uk_company_clause_code` (`company_id`, `clause_code`),
  CONSTRAINT `fk_ic_company` FOREIGN KEY (`company_id`) REFERENCES `insurance_companies` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='保险条款表';

-- ============================================
-- 任务7：扩展 company_liabilities 表字段
-- ============================================
ALTER TABLE `company_liabilities`
  ADD COLUMN `is_additional` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否附加险（true=附加险，false=主险）' AFTER `description`,
  ADD COLUMN `clause_id` BIGINT DEFAULT NULL COMMENT '条款ID（外键，关联insurance_clauses）' AFTER `is_additional`,
  ADD KEY `idx_clause_id` (`clause_id`),
  ADD CONSTRAINT `fk_cl_clause` FOREIGN KEY (`clause_id`) REFERENCES `insurance_clauses` (`clause_id`);

-- ============================================
-- 任务2：创建特别约定表 special_agreements
-- ============================================
CREATE TABLE IF NOT EXISTS `special_agreements` (
  `agreement_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '约定ID',
  `company_id` BIGINT NOT NULL COMMENT '保司ID（外键，关联insurance_companies）',
  `clause_id` BIGINT DEFAULT NULL COMMENT '条款ID（外键，关联insurance_clauses，可空）',
  `liability_id` BIGINT DEFAULT NULL COMMENT '责任ID（外键，关联company_liabilities，可空）',
  `agreement_code` VARCHAR(50) DEFAULT NULL COMMENT '约定代码',
  `agreement_name` VARCHAR(200) NOT NULL COMMENT '约定名称',
  `agreement_content` TEXT DEFAULT NULL COMMENT '约定内容',
  `registration_no` VARCHAR(100) DEFAULT NULL COMMENT '注册号',
  `is_linked` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否联动展示',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT '显示顺序',
  `status` VARCHAR(20) NOT NULL DEFAULT '启用' COMMENT '状态（启用/禁用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`agreement_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_clause_id` (`clause_id`),
  KEY `idx_liability_id` (`liability_id`),
  CONSTRAINT `fk_sa_company` FOREIGN KEY (`company_id`) REFERENCES `insurance_companies` (`company_id`),
  CONSTRAINT `fk_sa_clause` FOREIGN KEY (`clause_id`) REFERENCES `insurance_clauses` (`clause_id`),
  CONSTRAINT `fk_sa_liability` FOREIGN KEY (`liability_id`) REFERENCES `company_liabilities` (`liability_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='特别约定表';

-- ============================================
-- 任务5：扩展 premium_rates 费率表支持方案固定保费
-- ============================================
ALTER TABLE `premium_rates`
  ADD COLUMN `plan_id` BIGINT DEFAULT NULL COMMENT '方案ID（外键，关联product_plans，可空）' AFTER `product_id`,
  ADD COLUMN `premium_type` VARCHAR(20) NOT NULL DEFAULT '费率计算' COMMENT '保费类型（费率计算/固定保费）' AFTER `plan_id`,
  ADD COLUMN `monthly_premium` DECIMAL(10,2) DEFAULT NULL COMMENT '月保费金额（元/人/月，固定保费时使用）' AFTER `premium_type`,
  ADD COLUMN `annual_premium` DECIMAL(10,2) DEFAULT NULL COMMENT '年保费金额（元/人/年，固定保费时使用）' AFTER `monthly_premium`,
  ADD KEY `idx_plan_id` (`plan_id`),
  ADD CONSTRAINT `fk_pr_plan` FOREIGN KEY (`plan_id`) REFERENCES `product_plans` (`plan_id`);

-- ============================================
-- 任务7-1：扩展 insured_persons 表字段
-- ============================================
ALTER TABLE `insured_persons`
  ADD COLUMN `occupation_detail_code` VARCHAR(20) DEFAULT NULL COMMENT '职业细类代码' AFTER `job_name`,
  ADD COLUMN `occupation_level` INT DEFAULT NULL COMMENT '职业等级' AFTER `occupation_detail_code`,
  ADD COLUMN `occupation_detail_name` VARCHAR(200) DEFAULT NULL COMMENT '职业细类名称' AFTER `occupation_level`,
  ADD COLUMN `job_description` VARCHAR(200) DEFAULT NULL COMMENT '职务/工种描述' AFTER `occupation_detail_name`,
  ADD COLUMN `extended_info` JSON DEFAULT NULL COMMENT '扩展信息（JSON格式）' AFTER `job_description`;

-- ============================================
-- 任务8：扩展 applications 表字段
-- ============================================
ALTER TABLE `applications`
  ADD COLUMN `policy_type` VARCHAR(20) DEFAULT '新保' COMMENT '投保类型：新保/续保/优续' AFTER `insurance_company_code`,
  ADD COLUMN `is_high_risk_work` BOOLEAN DEFAULT FALSE COMMENT '是否涉及高处作业' AFTER `policy_type`;

-- ============================================
-- 任务12：配置条款数据（主险+附加险+特约）
-- ============================================

-- 首先获取利宝保险公司的ID（假设已存在，如果没有需要先插入）
SET @libo_company_id = (SELECT company_id FROM insurance_companies WHERE company_code = 'LIBO' LIMIT 1);

-- 如果利宝保险公司不存在，需要先插入
INSERT IGNORE INTO `insurance_companies` (`company_code`, `company_name`, `status`)
VALUES ('LIBO', '利宝保险有限公司', '启用');

SET @libo_company_id = (SELECT company_id FROM insurance_companies WHERE company_code = 'LIBO' LIMIT 1);

-- 主险条款
INSERT INTO `insurance_clauses` (`company_id`, `clause_code`, `clause_name`, `clause_type`, `registration_no`, `status`)
VALUES 
  (@libo_company_id, '16M00031', '利宝保险有限公司雇主责任保险条款（2024版A款）', '主险', 'C00006030912024080703473', '启用')
ON DUPLICATE KEY UPDATE 
  `clause_name` = VALUES(`clause_name`),
  `registration_no` = VALUES(`registration_no`);

-- 附加险条款
INSERT INTO `insurance_clauses` (`company_id`, `clause_code`, `clause_name`, `clause_type`, `registration_no`, `status`)
VALUES 
  (@libo_company_id, '16S00083', '住院津贴保险条款', '附加险', 'C00006030922019123105012', '启用'),
  (@libo_company_id, '16S00136', '突发疾病死亡保险条款（A款）', '附加险', 'C00006030922023100862251', '启用'),
  (@libo_company_id, '16S00066', '医疗费用范围扩展保险条款（A款）', '附加险', 'C00006030922023020522733', '启用'),
  (@libo_company_id, '16S00063', '转院就医食宿交通费扩展条款', '附加险', 'C00006030922019122511161', '启用'),
  (@libo_company_id, '16S00079', '残疾辅助器具费用保险条款（A款）', '附加险', 'C00006030922023020522603', '启用'),
  (@libo_company_id, '16S00162', '二十四小时责任扩展保险条款（C款）', '附加险', 'C00006030922023100862221', '启用')
ON DUPLICATE KEY UPDATE 
  `clause_name` = VALUES(`clause_name`),
  `registration_no` = VALUES(`registration_no`);

-- 特约条款
INSERT INTO `insurance_clauses` (`company_id`, `clause_code`, `clause_name`, `clause_type`, `registration_no`, `status`)
VALUES 
  (@libo_company_id, 'H00006030922016112922541', '高风险工种除外特约', '特约', 'H00006030922016112922541', '启用'),
  (@libo_company_id, 'C00006031922021012002402', '附加传染病责任免除条款', '特约', 'C00006031922021012002402', '启用'),
  (@libo_company_id, 'C00006030922023040461183', '附加雇员承保年龄保险条款', '特约', 'C00006030922023040461183', '启用'),
  (@libo_company_id, 'C00006030922023040461193', '附加雇员高风险职业除外保险条款', '特约', 'C00006030922023040461193', '启用'),
  (@libo_company_id, 'C00006030922023040461203', '附加雇员列明承保职业保险条款', '特约', 'C00006030922023040461203', '启用'),
  (@libo_company_id, 'C00006030922023020522683', '附加伤残赔偿比例调整保险条款（A款）', '特约', 'C00006030922023020522683', '启用'),
  (@libo_company_id, 'C00006030922023040461263', '附加提前三十天通知解除合同保险条款', '特约', 'C00006030922023040461263', '启用'),
  (@libo_company_id, 'C00006030922023040461270', '附加四十八小时内及时报案通知保险条款', '特约', 'C00006030922023040461270', '启用'),
  (@libo_company_id, 'SE0684', '已退保雇员保险金扣除特别约定', '特约', 'SE0684', '启用'),
  (@libo_company_id, 'SE7372', '责任险高空作业除外特约', '特约', 'SE7372', '启用')
ON DUPLICATE KEY UPDATE 
  `clause_name` = VALUES(`clause_name`),
  `registration_no` = VALUES(`registration_no`);

-- ============================================
-- 任务10：配置主险责任到 company_liabilities 表
-- ============================================

-- 获取主险条款ID
SET @main_clause_id = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16M00031' LIMIT 1);

-- 主险责任
INSERT INTO `company_liabilities` (`company_id`, `liability_code`, `liability_name`, `liability_type`, `unit_type`, `description`, `is_additional`, `clause_id`, `status`)
VALUES 
  (@libo_company_id, '01824', '死亡/伤残(不含突发疾病和职业病)', '身故', '金额', '死亡/伤残赔偿，不含突发疾病和职业病', FALSE, @main_clause_id, '启用'),
  (@libo_company_id, '0037', '医疗费用', '医疗', '金额', '医疗费用赔偿', FALSE, @main_clause_id, '启用'),
  (@libo_company_id, '0040', '误工费用', '其他', '天数', '误工费用赔偿', FALSE, @main_clause_id, '启用')
ON DUPLICATE KEY UPDATE 
  `liability_name` = VALUES(`liability_name`),
  `is_additional` = VALUES(`is_additional`),
  `clause_id` = VALUES(`clause_id`);

-- ============================================
-- 任务11：配置附加险责任到 company_liabilities 表
-- ============================================

-- 获取附加险条款ID
SET @clause_16S00083 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16S00083' LIMIT 1);
SET @clause_16S00136 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16S00136' LIMIT 1);
SET @clause_16S00066 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16S00066' LIMIT 1);
SET @clause_16S00063 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16S00063' LIMIT 1);
SET @clause_16S00079 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16S00079' LIMIT 1);
SET @clause_16S00162 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16S00162' LIMIT 1);

-- 附加险责任
INSERT INTO `company_liabilities` (`company_id`, `liability_code`, `liability_name`, `liability_type`, `unit_type`, `description`, `is_additional`, `clause_id`, `status`)
VALUES 
  (@libo_company_id, '00420', '住院津贴', '津贴', '天数', '住院津贴赔偿', TRUE, @clause_16S00083, '启用'),
  (@libo_company_id, '01671', '附加突发疾病死亡', '身故', '金额', '附加突发疾病死亡赔偿', TRUE, @clause_16S00136, '启用'),
  (@libo_company_id, '0509', '医疗费用范围扩展', '医疗', '金额', '医疗费用范围扩展赔偿', TRUE, @clause_16S00066, '启用'),
  (@libo_company_id, '00481', '转院就医食宿交通费', '其他', '金额', '转院就医食宿交通费赔偿', TRUE, @clause_16S00063, '启用'),
  (@libo_company_id, '00478', '残疾辅助器具费用', '其他', '金额', '残疾辅助器具费用赔偿', TRUE, @clause_16S00079, '启用'),
  (@libo_company_id, '01521', '二十四小时责任死亡/伤残', '身故', '金额', '二十四小时责任死亡/伤残赔偿', TRUE, @clause_16S00162, '启用'),
  (@libo_company_id, '01522', '二十四小时责任医疗费用', '医疗', '金额', '二十四小时责任医疗费用赔偿', TRUE, @clause_16S00162, '启用'),
  (@libo_company_id, '01525', '二十四小时责任误工费用', '其他', '天数', '二十四小时责任误工费用赔偿', TRUE, @clause_16S00162, '启用'),
  (@libo_company_id, '01524', '二十四小时责任住院津贴', '津贴', '天数', '二十四小时责任住院津贴赔偿', TRUE, @clause_16S00162, '启用')
ON DUPLICATE KEY UPDATE 
  `liability_name` = VALUES(`liability_name`),
  `is_additional` = VALUES(`is_additional`),
  `clause_id` = VALUES(`clause_id`);

-- ============================================
-- 任务12：配置特别约定数据（关联条款和责任）
-- ============================================

-- 获取特约条款ID
SET @clause_high_risk = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'H00006030922016112922541' LIMIT 1);
SET @clause_infectious = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'C00006031922021012002402' LIMIT 1);
SET @clause_age = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'C00006030922023040461183' LIMIT 1);
SET @clause_high_risk_occupation = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'C00006030922023040461193' LIMIT 1);
SET @clause_listed_occupation = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'C00006030922023040461203' LIMIT 1);
SET @clause_disability_ratio = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'C00006030922023020522683' LIMIT 1);
SET @clause_30days = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'C00006030922023040461263' LIMIT 1);
SET @clause_48hours = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'C00006030922023040461270' LIMIT 1);
SET @clause_se0684 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'SE0684' LIMIT 1);
SET @clause_se7372 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'SE7372' LIMIT 1);

-- 获取责任ID（用于联动展示）
SET @liability_death = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '01824' LIMIT 1);
SET @liability_medical = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '0037' LIMIT 1);
SET @liability_wage = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '0040' LIMIT 1);
SET @liability_hospital = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '00420' LIMIT 1);

-- 特别约定（根据Excel中的联动展示逻辑配置）
INSERT INTO `special_agreements` (`company_id`, `clause_id`, `liability_id`, `agreement_code`, `agreement_name`, `registration_no`, `is_linked`, `display_order`, `status`)
VALUES 
  -- 高风险工种除外特约（只关联条款，直接展示）
  (@libo_company_id, @clause_high_risk, NULL, 'H00006030922016112922541', '高风险工种除外特约', 'H00006030922016112922541', FALSE, 1, '启用'),
  -- 附加传染病责任免除条款（只关联条款，直接展示）
  (@libo_company_id, @clause_infectious, NULL, 'C00006031922021012002402', '附加传染病责任免除条款', 'C00006031922021012002402', FALSE, 2, '启用'),
  -- 附加雇员承保年龄保险条款（联动展示，关联死亡伤残责任）
  (@libo_company_id, @clause_age, @liability_death, 'C00006030922023040461183', '附加雇员承保年龄保险条款', 'C00006030922023040461183', TRUE, 3, '启用'),
  -- 附加雇员高风险职业除外保险条款（只关联条款，直接展示）
  (@libo_company_id, @clause_high_risk_occupation, NULL, 'C00006030922023040461193', '附加雇员高风险职业除外保险条款', 'C00006030922023040461193', FALSE, 4, '启用'),
  -- 附加雇员列明承保职业保险条款（联动展示，关联死亡伤残责任）
  (@libo_company_id, @clause_listed_occupation, @liability_death, 'C00006030922023040461203', '附加雇员列明承保职业保险条款', 'C00006030922023040461203', TRUE, 5, '启用'),
  -- 附加伤残赔偿比例调整保险条款（A款）（联动展示，关联死亡伤残责任）
  (@libo_company_id, @clause_disability_ratio, @liability_death, 'C00006030922023020522683', '附加伤残赔偿比例调整保险条款（A款）', 'C00006030922023020522683', TRUE, 6, '启用'),
  -- 附加提前三十天通知解除合同保险条款（只关联条款，直接展示）
  (@libo_company_id, @clause_30days, NULL, 'C00006030922023040461263', '附加提前三十天通知解除合同保险条款', 'C00006030922023040461263', FALSE, 7, '启用'),
  -- 附加四十八小时内及时报案通知保险条款（只关联条款，直接展示）
  (@libo_company_id, @clause_48hours, NULL, 'C00006030922023040461270', '附加四十八小时内及时报案通知保险条款', 'C00006030922023040461270', FALSE, 8, '启用'),
  -- 已退保雇员保险金扣除特别约定（只关联条款，直接展示）
  (@libo_company_id, @clause_se0684, NULL, 'SE0684', '已退保雇员保险金扣除特别约定', 'SE0684', FALSE, 9, '启用'),
  -- 责任险高空作业除外特约（只关联条款，直接展示）
  (@libo_company_id, @clause_se7372, NULL, 'SE7372', '责任险高空作业除外特约', 'SE7372', FALSE, 10, '启用')
ON DUPLICATE KEY UPDATE 
  `agreement_name` = VALUES(`agreement_name`),
  `clause_id` = VALUES(`clause_id`),
  `liability_id` = VALUES(`liability_id`);

-- ============================================
-- 完成提示
-- ============================================
SELECT '任务1-12数据库迁移完成！' AS message;

