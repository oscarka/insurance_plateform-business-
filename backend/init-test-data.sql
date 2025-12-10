-- 初始化测试数据
-- 执行此脚本前，确保已执行 database_schema.sql 创建表结构

USE insurance_platform;

-- 设置连接字符集为utf8mb4，确保数据正确插入
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_results = utf8mb4;

-- 1. 插入保司
INSERT INTO insurance_companies (company_code, company_name, contact_name, contact_phone, contact_email, status) 
VALUES ('LIBO', '利宝保险', '张三', '13800138000', 'contact@libo.com', '启用')
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name);

-- 2. 插入保司责任
INSERT INTO company_liabilities (company_id, liability_code, liability_name, liability_type, unit_type, description, status)
SELECT 
  company_id,
  'DEATH_BENEFIT',
  '意外身故伤残保险金',
  '身故',
  '金额',
  '意外身故或伤残的保险金',
  '启用'
FROM insurance_companies WHERE company_code = 'LIBO'
ON DUPLICATE KEY UPDATE liability_name = VALUES(liability_name);

INSERT INTO company_liabilities (company_id, liability_code, liability_name, liability_type, unit_type, description, status)
SELECT 
  company_id,
  'MEDICAL_BENEFIT',
  '医疗费用保险金',
  '医疗',
  '金额',
  '医疗费用保险金',
  '启用'
FROM insurance_companies WHERE company_code = 'LIBO'
ON DUPLICATE KEY UPDATE liability_name = VALUES(liability_name);

INSERT INTO company_liabilities (company_id, liability_code, liability_name, liability_type, unit_type, description, status)
SELECT 
  company_id,
  'DAILY_HOSPITAL',
  '意外每日住院津贴',
  '津贴',
  '天数',
  '意外每日住院津贴',
  '启用'
FROM insurance_companies WHERE company_code = 'LIBO'
ON DUPLICATE KEY UPDATE liability_name = VALUES(liability_name);

-- 3. 插入产品
INSERT INTO insurance_products (company_id, product_code, product_name, product_type, registration_no, registration_name, status)
SELECT 
  company_id,
  'PRODUCT_A',
  '雇主责任险A',
  '雇主责任险',
  'C0000173309120250101001',
  '雇主责任险（2025版）',
  '启用'
FROM insurance_companies WHERE company_code = 'LIBO'
ON DUPLICATE KEY UPDATE product_name = VALUES(product_name);

-- 4. 插入方案
INSERT INTO product_plans (product_id, plan_code, plan_name, job_class_range, duration_options, payment_type, description, status)
SELECT 
  product_id,
  'PLAN_01',
  '方案一',
  '1~3类',
  '["1年","6个月"]',
  '一次交清',
  '方案一：适用于1~3类职业',
  '启用'
FROM insurance_products WHERE product_code = 'PRODUCT_A'
ON DUPLICATE KEY UPDATE plan_name = VALUES(plan_name);

INSERT INTO product_plans (product_id, plan_code, plan_name, job_class_range, duration_options, payment_type, description, status)
SELECT 
  product_id,
  'PLAN_02',
  '方案二',
  '4~5类',
  '["1年","6个月"]',
  '一次交清',
  '方案二：适用于4~5类职业',
  '启用'
FROM insurance_products WHERE product_code = 'PRODUCT_A'
ON DUPLICATE KEY UPDATE plan_name = VALUES(plan_name);

-- 5. 插入方案责任配置
-- 方案一的责任配置
INSERT INTO plan_liabilities (plan_id, liability_id, is_required, coverage_options, default_coverage, unit, display_order, status)
SELECT 
  p.plan_id,
  cl.liability_id,
  TRUE,
  CASE 
    WHEN cl.liability_code = 'DEATH_BENEFIT' THEN '["10万","30万","50万","80万","100万"]'
    WHEN cl.liability_code = 'MEDICAL_BENEFIT' THEN '["1万","2万","5万"]'
    WHEN cl.liability_code = 'DAILY_HOSPITAL' THEN '["100元/天"]'
  END,
  CASE 
    WHEN cl.liability_code = 'DEATH_BENEFIT' THEN '10万'
    WHEN cl.liability_code = 'MEDICAL_BENEFIT' THEN '1万'
    WHEN cl.liability_code = 'DAILY_HOSPITAL' THEN '100元/天'
  END,
  CASE 
    WHEN cl.liability_code = 'DAILY_HOSPITAL' THEN '元/天'
    ELSE '元'
  END,
  CASE 
    WHEN cl.liability_code = 'DEATH_BENEFIT' THEN 1
    WHEN cl.liability_code = 'MEDICAL_BENEFIT' THEN 2
    WHEN cl.liability_code = 'DAILY_HOSPITAL' THEN 3
  END,
  '启用'
FROM product_plans p
CROSS JOIN company_liabilities cl
WHERE p.plan_code = 'PLAN_01'
  AND cl.company_id = (SELECT company_id FROM insurance_companies WHERE company_code = 'LIBO')
ON DUPLICATE KEY UPDATE coverage_options = VALUES(coverage_options);

-- 方案二的责任配置
INSERT INTO plan_liabilities (plan_id, liability_id, is_required, coverage_options, default_coverage, unit, display_order, status)
SELECT 
  p.plan_id,
  cl.liability_id,
  TRUE,
  CASE 
    WHEN cl.liability_code = 'DEATH_BENEFIT' THEN '["20万","40万","60万"]'
    WHEN cl.liability_code = 'MEDICAL_BENEFIT' THEN '["2万","5万","10万"]'
    WHEN cl.liability_code = 'DAILY_HOSPITAL' THEN '["150元/天"]'
  END,
  CASE 
    WHEN cl.liability_code = 'DEATH_BENEFIT' THEN '20万'
    WHEN cl.liability_code = 'MEDICAL_BENEFIT' THEN '2万'
    WHEN cl.liability_code = 'DAILY_HOSPITAL' THEN '150元/天'
  END,
  CASE 
    WHEN cl.liability_code = 'DAILY_HOSPITAL' THEN '元/天'
    ELSE '元'
  END,
  CASE 
    WHEN cl.liability_code = 'DEATH_BENEFIT' THEN 1
    WHEN cl.liability_code = 'MEDICAL_BENEFIT' THEN 2
    WHEN cl.liability_code = 'DAILY_HOSPITAL' THEN 3
  END,
  '启用'
FROM product_plans p
CROSS JOIN company_liabilities cl
WHERE p.plan_code = 'PLAN_02'
  AND cl.company_id = (SELECT company_id FROM insurance_companies WHERE company_code = 'LIBO')
ON DUPLICATE KEY UPDATE coverage_options = VALUES(coverage_options);

-- 6. 插入费率配置
-- 方案一：1~3类职业，意外身故10万
INSERT INTO premium_rates (product_id, liability_id, job_class, coverage_amount, base_rate, rate_factor, effective_date, status)
SELECT 
  pr.product_id,
  cl.liability_id,
  '1~3类',
  '10万',
  0.0081,
  1.0,
  CURDATE(),
  '启用'
FROM insurance_products pr
CROSS JOIN company_liabilities cl
WHERE pr.product_code = 'PRODUCT_A'
  AND cl.liability_code = 'DEATH_BENEFIT'
  AND cl.company_id = pr.company_id
ON DUPLICATE KEY UPDATE base_rate = VALUES(base_rate);

-- 方案一：1~3类职业，意外身故30万
INSERT INTO premium_rates (product_id, liability_id, job_class, coverage_amount, base_rate, rate_factor, effective_date, status)
SELECT 
  pr.product_id,
  cl.liability_id,
  '1~3类',
  '30万',
  0.0146,
  1.0,
  CURDATE(),
  '启用'
FROM insurance_products pr
CROSS JOIN company_liabilities cl
WHERE pr.product_code = 'PRODUCT_A'
  AND cl.liability_code = 'DEATH_BENEFIT'
  AND cl.company_id = pr.company_id
ON DUPLICATE KEY UPDATE base_rate = VALUES(base_rate);

-- 方案一：1~3类职业，意外身故50万
INSERT INTO premium_rates (product_id, liability_id, job_class, coverage_amount, base_rate, rate_factor, effective_date, status)
SELECT 
  pr.product_id,
  cl.liability_id,
  '1~3类',
  '50万',
  0.0203,
  1.0,
  CURDATE(),
  '启用'
FROM insurance_products pr
CROSS JOIN company_liabilities cl
WHERE pr.product_code = 'PRODUCT_A'
  AND cl.liability_code = 'DEATH_BENEFIT'
  AND cl.company_id = pr.company_id
ON DUPLICATE KEY UPDATE base_rate = VALUES(base_rate);

-- 方案一：1~3类职业，医疗费用1万
INSERT INTO premium_rates (product_id, liability_id, job_class, coverage_amount, base_rate, rate_factor, effective_date, status)
SELECT 
  pr.product_id,
  cl.liability_id,
  '1~3类',
  '1万',
  0.002,
  1.0,
  CURDATE(),
  '启用'
FROM insurance_products pr
CROSS JOIN company_liabilities cl
WHERE pr.product_code = 'PRODUCT_A'
  AND cl.liability_code = 'MEDICAL_BENEFIT'
  AND cl.company_id = pr.company_id
ON DUPLICATE KEY UPDATE base_rate = VALUES(base_rate);

-- 方案一：1~3类职业，医疗费用2万
INSERT INTO premium_rates (product_id, liability_id, job_class, coverage_amount, base_rate, rate_factor, effective_date, status)
SELECT 
  pr.product_id,
  cl.liability_id,
  '1~3类',
  '2万',
  0.003,
  1.0,
  CURDATE(),
  '启用'
FROM insurance_products pr
CROSS JOIN company_liabilities cl
WHERE pr.product_code = 'PRODUCT_A'
  AND cl.liability_code = 'MEDICAL_BENEFIT'
  AND cl.company_id = pr.company_id
ON DUPLICATE KEY UPDATE base_rate = VALUES(base_rate);

-- 方案一：1~3类职业，住院津贴100元/天
INSERT INTO premium_rates (product_id, liability_id, job_class, coverage_amount, base_rate, rate_factor, effective_date, status)
SELECT 
  pr.product_id,
  cl.liability_id,
  '1~3类',
  '100元/天',
  0.001,
  1.0,
  CURDATE(),
  '启用'
FROM insurance_products pr
CROSS JOIN company_liabilities cl
WHERE pr.product_code = 'PRODUCT_A'
  AND cl.liability_code = 'DAILY_HOSPITAL'
  AND cl.company_id = pr.company_id
ON DUPLICATE KEY UPDATE base_rate = VALUES(base_rate);

-- 方案二：4~5类职业的费率（示例）
INSERT INTO premium_rates (product_id, liability_id, job_class, coverage_amount, base_rate, rate_factor, effective_date, status)
SELECT 
  pr.product_id,
  cl.liability_id,
  '4~5类',
  '20万',
  0.012,
  1.0,
  CURDATE(),
  '启用'
FROM insurance_products pr
CROSS JOIN company_liabilities cl
WHERE pr.product_code = 'PRODUCT_A'
  AND cl.liability_code = 'DEATH_BENEFIT'
  AND cl.company_id = pr.company_id
ON DUPLICATE KEY UPDATE base_rate = VALUES(base_rate);

SELECT '测试数据初始化完成！' AS message;

