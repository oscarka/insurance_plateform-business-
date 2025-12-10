-- ============================================
-- 保险经纪公司业务平台数据库结构
-- 数据库：insurance_platform
-- 字符集：utf8mb4
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `insurance_platform` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `insurance_platform`;

-- ============================================
-- 一、核心业务表
-- ============================================

-- 1. 保司表
CREATE TABLE `insurance_companies` (
  `company_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '保司ID',
  `company_code` VARCHAR(50) NOT NULL COMMENT '保司代码（唯一，如：LIBO/PINGAN）',
  `company_name` VARCHAR(200) NOT NULL COMMENT '保司名称',
  `contact_name` VARCHAR(50) DEFAULT NULL COMMENT '联系人姓名',
  `contact_phone` VARCHAR(20) DEFAULT NULL COMMENT '联系人电话',
  `contact_email` VARCHAR(100) DEFAULT NULL COMMENT '联系人邮箱',
  `status` VARCHAR(20) NOT NULL DEFAULT '启用' COMMENT '状态（启用/禁用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`company_id`),
  UNIQUE KEY `uk_company_code` (`company_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='保司表';

-- 2. 企业客户表
CREATE TABLE `companies` (
  `company_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '企业ID',
  `company_name` VARCHAR(200) NOT NULL COMMENT '企业名称',
  `credit_code` VARCHAR(50) NOT NULL COMMENT '统一社会信用代码',
  `province` VARCHAR(50) NOT NULL COMMENT '省份',
  `city` VARCHAR(50) NOT NULL COMMENT '城市',
  `district` VARCHAR(50) NOT NULL COMMENT '区县',
  `address` VARCHAR(500) NOT NULL COMMENT '详细地址',
  `industry` VARCHAR(100) DEFAULT NULL COMMENT '行业类型',
  `contact_name` VARCHAR(50) NOT NULL COMMENT '联系人姓名',
  `contact_phone` VARCHAR(20) NOT NULL COMMENT '联系人电话',
  `contact_email` VARCHAR(100) NOT NULL COMMENT '联系人邮箱',
  `business_license_url` VARCHAR(500) DEFAULT NULL COMMENT '营业执照文件路径',
  `risk_level` VARCHAR(20) DEFAULT NULL COMMENT '风控等级（正常/关注/高风险）',
  `risk_query_time` DATETIME DEFAULT NULL COMMENT '风控查询时间',
  `status` VARCHAR(20) NOT NULL DEFAULT '正常' COMMENT '状态（正常/禁用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`company_id`),
  UNIQUE KEY `uk_credit_code` (`credit_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业客户表';

-- 3. 保司责任表
CREATE TABLE `company_liabilities` (
  `liability_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '责任ID',
  `company_id` BIGINT NOT NULL COMMENT '保司ID（外键）',
  `liability_code` VARCHAR(50) NOT NULL COMMENT '责任代码（保司定义）',
  `liability_name` VARCHAR(100) NOT NULL COMMENT '责任名称',
  `liability_type` VARCHAR(50) NOT NULL COMMENT '责任类型（身故/医疗/津贴/其他）',
  `unit_type` VARCHAR(20) NOT NULL COMMENT '单位类型（金额/天数/比例等）',
  `description` TEXT DEFAULT NULL COMMENT '责任描述（保司定义的具体含义）',
  `status` VARCHAR(20) NOT NULL DEFAULT '启用' COMMENT '状态（启用/禁用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`liability_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_liability_code` (`company_id`, `liability_code`),
  CONSTRAINT `fk_cl_company` FOREIGN KEY (`company_id`) REFERENCES `insurance_companies` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='保司责任表';

-- 4. 保司产品表
CREATE TABLE `insurance_products` (
  `product_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '产品ID',
  `company_id` BIGINT NOT NULL COMMENT '保司ID（外键）',
  `product_code` VARCHAR(50) NOT NULL COMMENT '产品代码（保司定义）',
  `product_name` VARCHAR(200) NOT NULL COMMENT '产品名称',
  `registration_no` VARCHAR(100) DEFAULT NULL COMMENT '产品注册号',
  `registration_name` VARCHAR(200) DEFAULT NULL COMMENT '产品注册名称',
  `product_type` VARCHAR(50) NOT NULL COMMENT '产品类型（雇主责任险/团体意外险等）',
  `config_source` VARCHAR(100) DEFAULT NULL COMMENT '配置来源（配置文件路径或导入批次）',
  `status` VARCHAR(20) NOT NULL DEFAULT '启用' COMMENT '状态（启用/禁用）',
  `effective_date` DATE DEFAULT NULL COMMENT '生效日期',
  `expiry_date` DATE DEFAULT NULL COMMENT '失效日期',
  `description` TEXT DEFAULT NULL COMMENT '产品描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `uk_product_code` (`company_id`, `product_code`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_ip_company` FOREIGN KEY (`company_id`) REFERENCES `insurance_companies` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='保司产品表';

-- 5. 产品方案表
CREATE TABLE `product_plans` (
  `plan_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '方案ID',
  `product_id` BIGINT NOT NULL COMMENT '产品ID（外键）',
  `plan_code` VARCHAR(50) NOT NULL COMMENT '方案代码（保司定义）',
  `plan_name` VARCHAR(100) NOT NULL COMMENT '方案名称（如：方案一/方案二）',
  `job_class_range` VARCHAR(50) NOT NULL COMMENT '职业类别范围（1~3类/4类/5类等）',
  `duration_options` TEXT NOT NULL COMMENT '保障时间选项（JSON格式，如：["1年","6个月"]）',
  `payment_type` VARCHAR(50) NOT NULL COMMENT '缴费方式（一次交清）',
  `description` TEXT DEFAULT NULL COMMENT '方案描述',
  `config_source` VARCHAR(100) DEFAULT NULL COMMENT '配置来源（配置文件路径或导入批次）',
  `status` VARCHAR(20) NOT NULL DEFAULT '启用' COMMENT '状态（启用/禁用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`plan_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_pp_product` FOREIGN KEY (`product_id`) REFERENCES `insurance_products` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品方案表';

-- 6. 方案责任关联表
CREATE TABLE `plan_liabilities` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `plan_id` BIGINT NOT NULL COMMENT '方案ID（外键）',
  `liability_id` BIGINT NOT NULL COMMENT '责任ID（外键，关联保司责任表）',
  `is_required` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否必选（true=必选，false=可选）',
  `coverage_options` TEXT NOT NULL COMMENT '保额选项（JSON格式，如：["10万","30万","50万","80万","100万"]）',
  `default_coverage` VARCHAR(50) DEFAULT NULL COMMENT '默认保额（如：10万）',
  `min_coverage` VARCHAR(50) DEFAULT NULL COMMENT '最小保额',
  `max_coverage` VARCHAR(50) DEFAULT NULL COMMENT '最大保额',
  `unit` VARCHAR(20) NOT NULL COMMENT '单位（元/天/比例等）',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT '显示顺序',
  `config_source` VARCHAR(100) DEFAULT NULL COMMENT '配置来源（配置文件路径或导入批次）',
  `status` VARCHAR(20) NOT NULL DEFAULT '启用' COMMENT '状态（启用/禁用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_liability_id` (`liability_id`),
  CONSTRAINT `fk_pl_plan` FOREIGN KEY (`plan_id`) REFERENCES `product_plans` (`plan_id`),
  CONSTRAINT `fk_pl_liability` FOREIGN KEY (`liability_id`) REFERENCES `company_liabilities` (`liability_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案责任关联表';

-- 7. 费率配置表
CREATE TABLE `premium_rates` (
  `rate_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '费率ID',
  `product_id` BIGINT NOT NULL COMMENT '产品ID（外键）',
  `liability_id` BIGINT NOT NULL COMMENT '责任ID（外键，关联保司责任表）',
  `job_class` VARCHAR(20) NOT NULL COMMENT '职业类别（1类/2类/3类/4类/5类）',
  `coverage_amount` VARCHAR(50) NOT NULL COMMENT '保额（10万/30万/100元/天等）',
  `base_rate` DECIMAL(10,4) NOT NULL COMMENT '基础费率',
  `rate_factor` DECIMAL(10,4) NOT NULL DEFAULT 1.0000 COMMENT '费率系数',
  `min_premium` DECIMAL(10,2) DEFAULT NULL COMMENT '最低保费',
  `max_premium` DECIMAL(10,2) DEFAULT NULL COMMENT '最高保费',
  `effective_date` DATE NOT NULL COMMENT '生效日期',
  `expiry_date` DATE DEFAULT NULL COMMENT '失效日期',
  `config_source` VARCHAR(100) DEFAULT NULL COMMENT '配置来源（配置文件路径或导入批次）',
  `status` VARCHAR(20) NOT NULL DEFAULT '启用' COMMENT '状态（启用/禁用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`rate_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_liability_id` (`liability_id`),
  KEY `idx_job_class` (`job_class`),
  KEY `idx_effective_date` (`effective_date`),
  CONSTRAINT `fk_pr_product` FOREIGN KEY (`product_id`) REFERENCES `insurance_products` (`product_id`),
  CONSTRAINT `fk_pr_liability` FOREIGN KEY (`liability_id`) REFERENCES `company_liabilities` (`liability_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='费率配置表';

-- 8. 投保单表
CREATE TABLE `applications` (
  `application_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '投保单ID',
  `application_no` VARCHAR(50) NOT NULL COMMENT '投保单号（系统生成，唯一）',
  `company_id` BIGINT NOT NULL COMMENT '企业客户ID（外键）',
  `product_id` BIGINT NOT NULL COMMENT '产品ID（外键）',
  `product_name` VARCHAR(200) NOT NULL COMMENT '产品名称',
  `product_code` VARCHAR(50) NOT NULL COMMENT '产品代码',
  `total_premium` DECIMAL(12,2) NOT NULL COMMENT '总保费',
  `insured_count` INT NOT NULL COMMENT '被保人数',
  `effective_date` DATE NOT NULL COMMENT '生效起期',
  `expiry_date` DATE NOT NULL COMMENT '生效止期',
  `status` VARCHAR(20) NOT NULL DEFAULT '草稿' COMMENT '状态（草稿/待核保/核保中/核保通过/核保拒绝/已承保/已取消）',
  `draft_data` TEXT DEFAULT NULL COMMENT '草稿数据（JSON格式，保存完整表单数据）',
  `insurance_company_code` VARCHAR(50) NOT NULL COMMENT '承保公司代码（外键，关联保司表）',
  `submitted_at` DATETIME DEFAULT NULL COMMENT '提交时间',
  `underwritten_at` DATETIME DEFAULT NULL COMMENT '核保时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`application_id`),
  UNIQUE KEY `uk_application_no` (`application_no`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_status` (`status`),
  KEY `idx_insurance_company_code` (`insurance_company_code`),
  CONSTRAINT `fk_app_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`),
  CONSTRAINT `fk_app_product` FOREIGN KEY (`product_id`) REFERENCES `insurance_products` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投保单表';

-- 9. 投保方案实例表
CREATE TABLE `application_plans` (
  `instance_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '方案实例ID',
  `application_id` BIGINT NOT NULL COMMENT '投保单ID（外键）',
  `plan_id` BIGINT NOT NULL COMMENT '方案ID（外键，关联product_plans）',
  `plan_name` VARCHAR(100) NOT NULL COMMENT '方案名称（如：方案一）',
  `job_class` VARCHAR(20) NOT NULL COMMENT '职业类别（用户选择：1~3类/4类/5类等）',
  `duration` VARCHAR(20) NOT NULL COMMENT '保障时间（用户选择：1年/6个月）',
  `insured_count` INT NOT NULL COMMENT '该方案对应的被保人数',
  `plan_premium` DECIMAL(10,2) NOT NULL COMMENT '该方案的总保费',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`instance_id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_plan_id` (`plan_id`),
  CONSTRAINT `fk_ap_application` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`),
  CONSTRAINT `fk_ap_plan` FOREIGN KEY (`plan_id`) REFERENCES `product_plans` (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投保方案实例表';

-- 10. 方案实例责任关联表
CREATE TABLE `plan_instance_liabilities` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `instance_id` BIGINT NOT NULL COMMENT '方案实例ID（外键，关联application_plans）',
  `liability_id` BIGINT NOT NULL COMMENT '责任ID（外键，关联保司责任表）',
  `coverage_amount` VARCHAR(50) NOT NULL COMMENT '保额（用户选择的具体值，如：30万/100元/天）',
  `coverage_value` DECIMAL(12,2) DEFAULT NULL COMMENT '保额数值（用于计算，如：300000）',
  `unit` VARCHAR(20) NOT NULL COMMENT '单位（元/天/比例等）',
  `is_selected` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否选择（某些责任可能是可选的）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_instance_id` (`instance_id`),
  KEY `idx_liability_id` (`liability_id`),
  CONSTRAINT `fk_pil_instance` FOREIGN KEY (`instance_id`) REFERENCES `application_plans` (`instance_id`),
  CONSTRAINT `fk_pil_liability` FOREIGN KEY (`liability_id`) REFERENCES `company_liabilities` (`liability_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案实例责任关联表';

-- 11. 被保人表
CREATE TABLE `insured_persons` (
  `person_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '被保人ID',
  `application_id` BIGINT NOT NULL COMMENT '投保单ID（外键）',
  `instance_id` BIGINT NOT NULL COMMENT '所属方案实例ID（外键）',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `id_type` VARCHAR(20) NOT NULL COMMENT '证件类型（身份证/护照等）',
  `id_number` VARCHAR(50) NOT NULL COMMENT '证件号码',
  `gender` VARCHAR(10) NOT NULL COMMENT '性别（男/女）',
  `birth_date` DATE NOT NULL COMMENT '出生日期',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `job_code` VARCHAR(50) NOT NULL COMMENT '职业代码',
  `job_category` VARCHAR(20) NOT NULL COMMENT '职业类别（1类/2类/3类/4类/5类）',
  `job_name` VARCHAR(100) NOT NULL COMMENT '职业名称',
  `individual_premium` DECIMAL(10,2) NOT NULL COMMENT '个人保费（考虑职业加费）',
  `status` VARCHAR(20) NOT NULL DEFAULT '待核保' COMMENT '状态（待核保/已承保/已退保/已替换）',
  `effective_date` DATE DEFAULT NULL COMMENT '生效日期',
  `expiry_date` DATE DEFAULT NULL COMMENT '失效日期',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`person_id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_instance_id` (`instance_id`),
  CONSTRAINT `fk_ip_application` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`),
  CONSTRAINT `fk_ip_instance` FOREIGN KEY (`instance_id`) REFERENCES `application_plans` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='被保人表';

-- 12. 保单表
CREATE TABLE `policies` (
  `policy_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '保单ID',
  `policy_no` VARCHAR(50) NOT NULL COMMENT '保单号（保司返回，唯一）',
  `application_id` BIGINT NOT NULL COMMENT '投保单ID（外键）',
  `company_id` BIGINT NOT NULL COMMENT '企业客户ID（外键）',
  `product_name` VARCHAR(200) NOT NULL COMMENT '产品名称',
  `product_code` VARCHAR(50) NOT NULL COMMENT '产品代码',
  `total_premium` DECIMAL(12,2) NOT NULL COMMENT '总保费',
  `insured_count` INT NOT NULL COMMENT '被保人数',
  `effective_date` DATE NOT NULL COMMENT '生效起期',
  `expiry_date` DATE NOT NULL COMMENT '生效止期',
  `status` VARCHAR(20) NOT NULL DEFAULT '保障中' COMMENT '状态（保障中/已过期/已退保/已终止）',
  `insurance_company_code` VARCHAR(50) NOT NULL COMMENT '承保公司代码',
  `policy_file_url` VARCHAR(500) DEFAULT NULL COMMENT '电子保单文件路径',
  `issued_at` DATETIME NOT NULL COMMENT '承保时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`policy_id`),
  UNIQUE KEY `uk_policy_no` (`policy_no`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_pol_application` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`),
  CONSTRAINT `fk_pol_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='保单表';

-- 13. 批改申请表
CREATE TABLE `endorsements` (
  `endorsement_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '批改申请ID',
  `endorsement_no` VARCHAR(50) NOT NULL COMMENT '批改单号（系统生成）',
  `policy_id` BIGINT NOT NULL COMMENT '保单ID（外键）',
  `endorsement_type` VARCHAR(20) NOT NULL COMMENT '批改类型（增员/减员/替换/信息变更）',
  `add_count` INT DEFAULT 0 COMMENT '新增人数',
  `remove_count` INT DEFAULT 0 COMMENT '减少人数',
  `replace_count` INT DEFAULT 0 COMMENT '替换人数',
  `premium_change` DECIMAL(10,2) DEFAULT NULL COMMENT '保费变化（正数表示增加，负数表示减少）',
  `reason` VARCHAR(500) DEFAULT NULL COMMENT '批改原因',
  `status` VARCHAR(20) NOT NULL DEFAULT '待审核' COMMENT '状态（待审核/审核中/审核通过/审核拒绝/已生效）',
  `effective_date` DATE DEFAULT NULL COMMENT '批改生效日期',
  `submitted_at` DATETIME DEFAULT NULL COMMENT '提交时间',
  `approved_at` DATETIME DEFAULT NULL COMMENT '审核时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`endorsement_id`),
  KEY `idx_policy_id` (`policy_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_end_policy` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`policy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批改申请表';

-- 14. 批改被保人明细表
CREATE TABLE `endorsement_persons` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `endorsement_id` BIGINT NOT NULL COMMENT '批改申请ID（外键）',
  `operation_type` VARCHAR(20) NOT NULL COMMENT '操作类型（新增/删除/替换）',
  `old_person_id` BIGINT DEFAULT NULL COMMENT '原被保人ID（替换时使用）',
  `new_person_id` BIGINT DEFAULT NULL COMMENT '新被保人ID（新增/替换时使用）',
  `person_data` TEXT DEFAULT NULL COMMENT '被保人信息（JSON格式，新增时使用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_endorsement_id` (`endorsement_id`),
  CONSTRAINT `fk_ep_endorsement` FOREIGN KEY (`endorsement_id`) REFERENCES `endorsements` (`endorsement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批改被保人明细表';

-- 15. 续保申请表
CREATE TABLE `renewals` (
  `renewal_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '续保申请ID',
  `renewal_no` VARCHAR(50) NOT NULL COMMENT '续保单号（系统生成）',
  `original_policy_id` BIGINT NOT NULL COMMENT '原保单ID（外键）',
  `new_policy_id` BIGINT DEFAULT NULL COMMENT '新保单ID（续保成功后关联）',
  `company_id` BIGINT NOT NULL COMMENT '企业客户ID（外键）',
  `renewal_premium` DECIMAL(12,2) NOT NULL COMMENT '续保保费',
  `insured_count` INT NOT NULL COMMENT '续保被保人数',
  `effective_date` DATE NOT NULL COMMENT '续保生效日期',
  `expiry_date` DATE NOT NULL COMMENT '续保到期日期',
  `status` VARCHAR(20) NOT NULL DEFAULT '待审核' COMMENT '状态（待审核/审核中/审核通过/审核拒绝/已承保）',
  `submitted_at` DATETIME DEFAULT NULL COMMENT '提交时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`renewal_id`),
  KEY `idx_original_policy_id` (`original_policy_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_ren_original_policy` FOREIGN KEY (`original_policy_id`) REFERENCES `policies` (`policy_id`),
  CONSTRAINT `fk_ren_new_policy` FOREIGN KEY (`new_policy_id`) REFERENCES `policies` (`policy_id`),
  CONSTRAINT `fk_ren_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='续保申请表';

-- 16. 发票表
CREATE TABLE `invoices` (
  `invoice_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '发票ID',
  `invoice_no` VARCHAR(50) DEFAULT NULL COMMENT '发票号码',
  `policy_id` BIGINT NOT NULL COMMENT '保单ID（外键）',
  `company_id` BIGINT NOT NULL COMMENT '企业客户ID（外键）',
  `invoice_type` VARCHAR(20) NOT NULL COMMENT '发票类型（电子发票/纸质发票）',
  `invoice_amount` DECIMAL(12,2) NOT NULL COMMENT '发票金额',
  `invoice_file_url` VARCHAR(500) DEFAULT NULL COMMENT '发票文件路径（附件）',
  `invoice_file_name` VARCHAR(200) DEFAULT NULL COMMENT '发票文件名',
  `file_size` BIGINT DEFAULT NULL COMMENT '文件大小（字节）',
  `uploaded_at` DATETIME DEFAULT NULL COMMENT '上传时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`invoice_id`),
  KEY `idx_policy_id` (`policy_id`),
  KEY `idx_company_id` (`company_id`),
  CONSTRAINT `fk_inv_policy` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`policy_id`),
  CONSTRAINT `fk_inv_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发票表';

-- 17. 回执表
CREATE TABLE `receipts` (
  `receipt_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '回执ID',
  `receipt_no` VARCHAR(50) DEFAULT NULL COMMENT '回执号',
  `policy_id` BIGINT NOT NULL COMMENT '保单ID（外键）',
  `company_id` BIGINT NOT NULL COMMENT '企业客户ID（外键）',
  `receipt_type` VARCHAR(20) NOT NULL COMMENT '回执类型（电子回执/纸质回执）',
  `signer_name` VARCHAR(50) DEFAULT NULL COMMENT '签收人姓名',
  `signer_phone` VARCHAR(20) DEFAULT NULL COMMENT '签收人电话',
  `signed_at` DATETIME DEFAULT NULL COMMENT '签收时间',
  `receipt_file_url` VARCHAR(500) DEFAULT NULL COMMENT '回执文件路径（附件）',
  `receipt_file_name` VARCHAR(200) DEFAULT NULL COMMENT '回执文件名',
  `file_size` BIGINT DEFAULT NULL COMMENT '文件大小（字节）',
  `uploaded_at` DATETIME DEFAULT NULL COMMENT '上传时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`receipt_id`),
  KEY `idx_policy_id` (`policy_id`),
  KEY `idx_company_id` (`company_id`),
  CONSTRAINT `fk_rec_policy` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`policy_id`),
  CONSTRAINT `fk_rec_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回执表';

-- ============================================
-- 二、接口对接相关表
-- ============================================

-- 18. 保司接口配置表（优化后：配置JSON化）
CREATE TABLE `insurance_api_configs` (
  `config_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `company_id` BIGINT NOT NULL COMMENT '保司ID（外键）',
  `company_code` VARCHAR(50) NOT NULL COMMENT '保司代码',
  `channel_code` VARCHAR(50) NOT NULL COMMENT '渠道代码（如：LEXUAN）',
  `api_base_url` VARCHAR(200) NOT NULL COMMENT '接口基础地址',
  `api_version` VARCHAR(20) NOT NULL COMMENT '接口版本',
  `app_id` VARCHAR(100) NOT NULL COMMENT '应用ID',
  `app_secret` VARCHAR(200) NOT NULL COMMENT '应用密钥（加密存储）',
  `environment` VARCHAR(20) NOT NULL DEFAULT 'test' COMMENT '环境（test/production）',
  `api_config_json` TEXT NOT NULL COMMENT '接口配置JSON（包含所有接口的地址、方法等）',
  `field_mapping_json` TEXT NOT NULL COMMENT '字段映射JSON（系统字段 → 保司字段的映射）',
  `intercept_rules_json` TEXT DEFAULT NULL COMMENT '拦截规则JSON（承保前的校验规则）',
  `validation_rules_json` TEXT DEFAULT NULL COMMENT '数据校验规则JSON（字段级别的校验）',
  `config_source` VARCHAR(100) DEFAULT NULL COMMENT '配置来源（配置文件路径或导入批次）',
  `status` VARCHAR(20) NOT NULL DEFAULT '启用' COMMENT '状态（启用/禁用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`config_id`),
  UNIQUE KEY `uk_channel_code` (`company_code`, `channel_code`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_iac_company` FOREIGN KEY (`company_id`) REFERENCES `insurance_companies` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='保司接口配置表';

-- 19. 配置文件导入记录表
CREATE TABLE `config_imports` (
  `import_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '导入ID',
  `import_type` VARCHAR(50) NOT NULL COMMENT '导入类型（产品配置/接口配置/责任配置等）',
  `file_name` VARCHAR(200) NOT NULL COMMENT '配置文件名',
  `file_path` VARCHAR(500) NOT NULL COMMENT '配置文件路径',
  `file_size` BIGINT DEFAULT NULL COMMENT '文件大小（字节）',
  `import_status` VARCHAR(20) NOT NULL COMMENT '导入状态（成功/失败/部分成功）',
  `success_count` INT DEFAULT 0 COMMENT '成功导入数量',
  `fail_count` INT DEFAULT 0 COMMENT '失败数量',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `imported_by` VARCHAR(50) DEFAULT NULL COMMENT '导入人',
  `imported_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '导入时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`import_id`),
  KEY `idx_import_type` (`import_type`),
  KEY `idx_import_status` (`import_status`),
  KEY `idx_imported_at` (`imported_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配置文件导入记录表';

-- 20. 保司接口调用日志表
CREATE TABLE `insurance_api_logs` (
  `log_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `company_code` VARCHAR(50) NOT NULL COMMENT '保险公司代码',
  `api_name` VARCHAR(100) NOT NULL COMMENT '接口名称（如：核保接口/承保接口）',
  `api_url` VARCHAR(500) NOT NULL COMMENT '接口地址',
  `request_method` VARCHAR(10) NOT NULL COMMENT '请求方法（POST/GET）',
  `request_headers` TEXT DEFAULT NULL COMMENT '请求头（JSON格式）',
  `request_body` TEXT DEFAULT NULL COMMENT '请求体（JSON格式）',
  `response_status` INT DEFAULT NULL COMMENT '响应状态码',
  `response_body` TEXT DEFAULT NULL COMMENT '响应体（JSON格式）',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `execution_time` INT DEFAULT NULL COMMENT '执行时间（毫秒）',
  `business_id` VARCHAR(50) DEFAULT NULL COMMENT '业务ID（投保单号/保单号等）',
  `business_type` VARCHAR(50) DEFAULT NULL COMMENT '业务类型（投保/批改/续保等）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`log_id`),
  KEY `idx_company_code` (`company_code`),
  KEY `idx_api_name` (`api_name`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='保司接口调用日志表';

-- 21. 保司接口任务表
CREATE TABLE `insurance_api_tasks` (
  `task_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `task_type` VARCHAR(50) NOT NULL COMMENT '任务类型（核保/承保/批改/续保等）',
  `company_code` VARCHAR(50) NOT NULL COMMENT '保险公司代码',
  `business_id` VARCHAR(50) NOT NULL COMMENT '业务ID',
  `request_data` TEXT NOT NULL COMMENT '请求数据（JSON格式）',
  `response_data` TEXT DEFAULT NULL COMMENT '响应数据（JSON格式）',
  `status` VARCHAR(20) NOT NULL DEFAULT '待处理' COMMENT '状态（待处理/处理中/成功/失败）',
  `retry_count` INT NOT NULL DEFAULT 0 COMMENT '重试次数',
  `max_retry` INT NOT NULL DEFAULT 3 COMMENT '最大重试次数',
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `scheduled_at` DATETIME NOT NULL COMMENT '计划执行时间',
  `started_at` DATETIME DEFAULT NULL COMMENT '开始时间',
  `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`task_id`),
  KEY `idx_task_type` (`task_type`),
  KEY `idx_status` (`status`),
  KEY `idx_scheduled_at` (`scheduled_at`),
  KEY `idx_business_id` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='保司接口任务表';

-- ============================================
-- 三、系统管理表
-- ============================================

-- 22. 用户表
CREATE TABLE `users` (
  `user_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（手机号）',
  `password_hash` VARCHAR(200) NOT NULL COMMENT '密码哈希',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `role` VARCHAR(20) NOT NULL DEFAULT 'customer' COMMENT '角色（customer/admin）',
  `status` VARCHAR(20) NOT NULL DEFAULT '正常' COMMENT '状态（正常/禁用）',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 23. 操作日志表
CREATE TABLE `operation_logs` (
  `log_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` BIGINT DEFAULT NULL COMMENT '用户ID（外键）',
  `operation_type` VARCHAR(50) NOT NULL COMMENT '操作类型（创建投保单/提交核保/申请批改等）',
  `business_id` VARCHAR(50) DEFAULT NULL COMMENT '业务ID',
  `operation_desc` VARCHAR(500) DEFAULT NULL COMMENT '操作描述',
  `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '用户代理',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`log_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_operation_type` (`operation_type`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_ol_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- ============================================
-- 初始化数据
-- ============================================

-- 插入默认管理员用户（密码：admin123，需要在实际使用时修改）
INSERT INTO `users` (`username`, `password_hash`, `phone`, `email`, `role`, `status`) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '13800000000', 'admin@example.com', 'admin', '正常');

