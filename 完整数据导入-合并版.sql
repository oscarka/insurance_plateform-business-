-- ============================================
-- 完整数据导入SQL - 合并版
-- 包含所有任务的数据配置
-- 执行顺序：条款 -> 责任 -> 特别约定 -> 产品方案 -> 拦截规则
-- ============================================

USE railway;

-- 设置字符集
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- 第一部分：基础数据准备
-- ============================================

-- 确保利宝保险公司存在
INSERT IGNORE INTO insurance_companies (company_code, company_name, status) 
VALUES ('LIBO', '利宝保险有限公司', '启用');

-- 获取利宝保险公司ID
SET @libo_company_id = (SELECT company_id FROM insurance_companies WHERE company_code = 'LIBO' LIMIT 1);
SET @libo_company_code = (SELECT company_code FROM insurance_companies WHERE company_code = 'LIBO' LIMIT 1);

-- ============================================
-- 第二部分：任务12 - 插入所有条款
-- ============================================

-- 主险条款
INSERT INTO insurance_clauses (company_id, clause_code, clause_name, clause_type, registration_no, status)
VALUES 
  (@libo_company_id, '16M00031', '利宝保险有限公司雇主责任保险条款（2024版A款）', '主险', 'C00006030912024080703473', '启用')
ON DUPLICATE KEY UPDATE 
  clause_name = VALUES(clause_name), 
  registration_no = VALUES(registration_no);

-- 附加险条款
INSERT INTO insurance_clauses (company_id, clause_code, clause_name, clause_type, registration_no, status)
VALUES 
  (@libo_company_id, '16S00083', '雇主责任保险附加住院津贴保险条款', '附加险', 'C00006030922019123105012', '启用'),
  (@libo_company_id, '16S00136', '利宝保险有限公司雇主责任保险附加突发疾病死亡保险条款(A款)', '附加险', 'C00006030922023100862251', '启用'),
  (@libo_company_id, '16S00066', '利宝保险有限公司雇主责任保险附加医疗费用范围扩展保险条款(A款)', '附加险', 'C00006030922023020522733', '启用'),
  (@libo_company_id, '16S00063', '利宝保险有限公司雇主责任保险附加转院就医食宿交通费扩展条款', '附加险', 'C00006030922019122511161', '启用'),
  (@libo_company_id, '16S00079', '利宝保险有限公司雇主责任保险附加残疾辅助器具费用保险条款(A款)', '附加险', 'C00006030922023020522603', '启用'),
  (@libo_company_id, '16S00162', '利宝保险有限公司雇主责任保险附加二十四小时责任扩展保险条款(2024版C款)', '附加险', 'C00006030922023100862221', '启用')
ON DUPLICATE KEY UPDATE 
  clause_name = VALUES(clause_name), 
  registration_no = VALUES(registration_no);

-- 特约条款
INSERT INTO insurance_clauses (company_id, clause_code, clause_name, clause_type, registration_no, status)
VALUES 
  (@libo_company_id, 'SE5106', '高风险工种除外特约', '特约', 'H00006030922016112922541', '启用'),
  (@libo_company_id, 'SE3535', '利宝保险有限公司附加传染病责任免除条款', '特约', 'C00006031922021012002402', '启用'),
  (@libo_company_id, 'SE2425', '利宝保险有限公司雇主责任保险附加雇员承保年龄保险条款', '特约', 'C00006030922023040461183', '启用'),
  (@libo_company_id, 'SE1545', '利宝保险有限公司雇主责任保险附加雇员高风险职业除外保险条款', '特约', 'C00006030922023040461193', '启用'),
  (@libo_company_id, 'SE6626', '利宝保险有限公司雇主责任保险附加雇员列明承保职业保险条款', '特约', 'C00006030922023040461203', '启用'),
  (@libo_company_id, 'SE7295', '利宝保险有限公司雇主责任保险附加伤残赔偿比例调整保险条款(A款)', '特约', 'C00006030922023020522683', '启用'),
  (@libo_company_id, 'SE5974', '利宝保险有限公司雇主责任保险附加提前三十天通知解除合同保险条款', '特约', 'C00006030922023040461263', '启用'),
  (@libo_company_id, 'SE5970', '利宝保险有限公司雇主责任保险附加四十八小时内及时报案通知保险条款', '特约', 'C00006030922023040461233', '启用'),
  (@libo_company_id, 'SE0684', '已退保雇员保险金扣除特别约定', '特约', 'H00006030922016112922651', '启用'),
  (@libo_company_id, 'SE7372', '责任险高空作业除外特约', '特约', 'H00006030922016112922691', '启用')
ON DUPLICATE KEY UPDATE 
  clause_name = VALUES(clause_name), 
  registration_no = VALUES(registration_no);

-- 获取条款ID（用于后续关联）
SET @clause_main = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16M00031' LIMIT 1);
SET @clause_16S00083 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16S00083' LIMIT 1);
SET @clause_16S00136 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16S00136' LIMIT 1);
SET @clause_16S00066 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16S00066' LIMIT 1);
SET @clause_16S00063 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16S00063' LIMIT 1);
SET @clause_16S00079 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16S00079' LIMIT 1);
SET @clause_16S00162 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = '16S00162' LIMIT 1);

-- ============================================
-- 第三部分：任务10-11 - 插入责任数据
-- ============================================

-- 主险责任（任务10）
INSERT INTO company_liabilities (
  company_id, liability_code, liability_name, liability_type, unit_type, 
  description, is_additional, clause_id, status
)
VALUES 
  (@libo_company_id, '01824', '死亡/伤残(不含突发疾病和职业病)', '身故', '金额', 
   '死亡/伤残赔偿，不含突发疾病和职业病', FALSE, @clause_main, '启用'),
  (@libo_company_id, '0037', '医疗费用', '医疗', '金额', 
   '医疗费用赔偿', FALSE, @clause_main, '启用'),
  (@libo_company_id, '0040', '误工费用', '其他', '天数', 
   '误工费用赔偿', FALSE, @clause_main, '启用')
ON DUPLICATE KEY UPDATE 
  liability_name = VALUES(liability_name), 
  is_additional = VALUES(is_additional), 
  clause_id = VALUES(clause_id);

-- 附加险责任（任务11）
INSERT INTO company_liabilities (
  company_id, liability_code, liability_name, liability_type, unit_type, 
  description, is_additional, clause_id, status
)
VALUES 
  (@libo_company_id, '00420', '住院津贴', '津贴', '天数', 
   '住院津贴赔偿', TRUE, @clause_16S00083, '启用'),
  (@libo_company_id, '01671', '附加突发疾病死亡', '身故', '金额', 
   '附加突发疾病死亡赔偿', TRUE, @clause_16S00136, '启用'),
  (@libo_company_id, '0509', '医疗费用范围扩展', '医疗', '金额', 
   '医疗费用范围扩展赔偿', TRUE, @clause_16S00066, '启用'),
  (@libo_company_id, '00481', '转院就医食宿交通费', '其他', '金额', 
   '转院就医食宿交通费赔偿', TRUE, @clause_16S00063, '启用'),
  (@libo_company_id, '00478', '残疾辅助器具费用', '其他', '金额', 
   '残疾辅助器具费用赔偿', TRUE, @clause_16S00079, '启用'),
  (@libo_company_id, '01521', '二十四小时责任死亡/伤残', '身故', '金额', 
   '二十四小时责任死亡/伤残赔偿', TRUE, @clause_16S00162, '启用'),
  (@libo_company_id, '01522', '二十四小时责任医疗费用', '医疗', '金额', 
   '二十四小时责任医疗费用赔偿', TRUE, @clause_16S00162, '启用'),
  (@libo_company_id, '01525', '二十四小时责任误工费用', '其他', '天数', 
   '二十四小时责任误工费用赔偿', TRUE, @clause_16S00162, '启用'),
  (@libo_company_id, '01524', '二十四小时责任住院津贴', '津贴', '天数', 
   '二十四小时责任住院津贴赔偿', TRUE, @clause_16S00162, '启用')
ON DUPLICATE KEY UPDATE 
  liability_name = VALUES(liability_name), 
  is_additional = VALUES(is_additional), 
  clause_id = VALUES(clause_id);

-- 获取责任ID（用于后续关联）
SET @liability_death = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '01824' LIMIT 1);
SET @liability_medical = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '0037' LIMIT 1);
SET @liability_wage = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '0040' LIMIT 1);
SET @liability_hospital = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '00420' LIMIT 1);
SET @liability_sudden_death = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '01671' LIMIT 1);
SET @liability_medical_extend = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '0509' LIMIT 1);
SET @liability_transfer = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '00481' LIMIT 1);
SET @liability_disability_aid = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '00478' LIMIT 1);
SET @liability_24h_death = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '01521' LIMIT 1);
SET @liability_24h_medical = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '01522' LIMIT 1);
SET @liability_24h_wage = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '01525' LIMIT 1);
SET @liability_24h_hospital = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '01524' LIMIT 1);

-- 获取特约条款ID（用于特别约定关联）
SET @clause_SE5106 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'SE5106' LIMIT 1);
SET @clause_SE3535 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'SE3535' LIMIT 1);
SET @clause_SE2425 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'SE2425' LIMIT 1);
SET @clause_SE1545 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'SE1545' LIMIT 1);
SET @clause_SE6626 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'SE6626' LIMIT 1);
SET @clause_SE7295 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'SE7295' LIMIT 1);
SET @clause_SE5974 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'SE5974' LIMIT 1);
SET @clause_SE5970 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'SE5970' LIMIT 1);
SET @clause_SE0684 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'SE0684' LIMIT 1);
SET @clause_SE7372 = (SELECT clause_id FROM insurance_clauses WHERE company_id = @libo_company_id AND clause_code = 'SE7372' LIMIT 1);

-- ============================================
-- 第四部分：任务21 - 插入特别约定（基础10条）
-- ============================================

INSERT INTO special_agreements (
  company_id, clause_id, liability_id, agreement_code, agreement_name, 
  registration_no, is_linked, display_order, status
)
VALUES 
  -- 1. 高风险工种除外特约（不联动）
  (@libo_company_id, @clause_SE5106, NULL, 'SE5106', 
   '高风险工种除外特约', 'H00006030922016112922541', FALSE, 1, '启用'),
  
  -- 2. 附加传染病责任免除条款（不联动）
  (@libo_company_id, @clause_SE3535, NULL, 'SE3535', 
   '利宝保险有限公司附加传染病责任免除条款', 'C00006031922021012002402', FALSE, 2, '启用'),
  
  -- 3. 附加雇员承保年龄保险条款（联动死亡/伤残责任）
  (@libo_company_id, @clause_SE2425, @liability_death, 'SE2425', 
   '利宝保险有限公司雇主责任保险附加雇员承保年龄保险条款', 'C00006030922023040461183', TRUE, 3, '启用'),
  
  -- 4. 附加雇员高风险职业除外保险条款（不联动）
  (@libo_company_id, @clause_SE1545, NULL, 'SE1545', 
   '利宝保险有限公司雇主责任保险附加雇员高风险职业除外保险条款', 'C00006030922023040461193', FALSE, 4, '启用'),
  
  -- 5. 附加雇员列明承保职业保险条款（联动死亡/伤残责任）
  (@libo_company_id, @clause_SE6626, @liability_death, 'SE6626', 
   '利宝保险有限公司雇主责任保险附加雇员列明承保职业保险条款', 'C00006030922023040461203', TRUE, 5, '启用'),
  
  -- 6. 附加伤残赔偿比例调整保险条款（A款）（联动死亡/伤残责任）
  (@libo_company_id, @clause_SE7295, @liability_death, 'SE7295', 
   '利宝保险有限公司雇主责任保险附加伤残赔偿比例调整保险条款(A款)', 'C00006030922023020522683', TRUE, 6, '启用'),
  
  -- 7. 附加提前三十天通知解除合同保险条款（不联动）
  (@libo_company_id, @clause_SE5974, NULL, 'SE5974', 
   '利宝保险有限公司雇主责任保险附加提前三十天通知解除合同保险条款', 'C00006030922023040461263', FALSE, 7, '启用'),
  
  -- 8. 附加四十八小时内及时报案通知保险条款（不联动）
  (@libo_company_id, @clause_SE5970, NULL, 'SE5970', 
   '利宝保险有限公司雇主责任保险附加四十八小时内及时报案通知保险条款', 'C00006030922023040461233', FALSE, 8, '启用'),
  
  -- 9. 已退保雇员保险金扣除特别约定（不联动）
  (@libo_company_id, @clause_SE0684, NULL, 'SE0684', 
   '已退保雇员保险金扣除特别约定', 'H00006030922016112922651', FALSE, 9, '启用'),
  
  -- 10. 责任险高空作业除外特约（不联动）
  (@libo_company_id, @clause_SE7372, NULL, 'SE7372', 
   '责任险高空作业除外特约', 'H00006030922016112922691', FALSE, 10, '启用')
ON DUPLICATE KEY UPDATE 
  agreement_name = VALUES(agreement_name), 
  clause_id = VALUES(clause_id), 
  liability_id = VALUES(liability_id);

-- ============================================
-- 第五部分：任务13-16 - 插入产品和方案数据
-- ============================================

-- 插入产品：利宝保险雇主责任保险-乐选
INSERT INTO `insurance_products` (
  `company_id`, 
  `product_code`, 
  `product_name`, 
  `product_type`, 
  `registration_no`, 
  `registration_name`, 
  `status`
)
VALUES (
  @libo_company_id,
  'LIBO_EMPLOYER_LIABILITY_LEXUAN',
  '利宝保险雇主责任保险-乐选',
  '雇主责任险',
  'C00006030912024080703473',
  '利宝保险有限公司雇主责任保险（2024版A款）',
  '启用'
)
ON DUPLICATE KEY UPDATE 
  `product_name` = VALUES(`product_name`),
  `registration_no` = VALUES(`registration_no`);

SET @product_id = (SELECT product_id FROM insurance_products WHERE product_code = 'LIBO_EMPLOYER_LIABILITY_LEXUAN' LIMIT 1);

-- 插入方案一
INSERT INTO `product_plans` (
  `product_id`,
  `plan_code`,
  `plan_name`,
  `job_class_range`,
  `duration_options`,
  `payment_type`,
  `description`,
  `status`
)
VALUES (
  @product_id,
  'PLAN_01',
  '利宝保险雇主责任保险-乐选-方案一',
  '1-5类',
  '["1年","1个月"]',
  '一次交清',
  '方案一：适用于1-5类职业',
  '启用'
)
ON DUPLICATE KEY UPDATE 
  `plan_name` = VALUES(`plan_name`),
  `job_class_range` = VALUES(`job_class_range`),
  `duration_options` = VALUES(`duration_options`);

SET @plan_01_id = (SELECT plan_id FROM product_plans WHERE plan_code = 'PLAN_01' AND product_id = @product_id LIMIT 1);

-- 插入方案二
INSERT INTO `product_plans` (
  `product_id`,
  `plan_code`,
  `plan_name`,
  `job_class_range`,
  `duration_options`,
  `payment_type`,
  `description`,
  `status`
)
VALUES (
  @product_id,
  'PLAN_02',
  '利宝保险雇主责任保险-乐选-方案二',
  '1-5类',
  '["1年","1个月"]',
  '一次交清',
  '方案二：适用于1-5类职业',
  '启用'
)
ON DUPLICATE KEY UPDATE 
  `plan_name` = VALUES(`plan_name`),
  `job_class_range` = VALUES(`job_class_range`);

SET @plan_02_id = (SELECT plan_id FROM product_plans WHERE plan_code = 'PLAN_02' AND product_id = @product_id LIMIT 1);

-- ============================================
-- 第六部分：任务15-16 - 配置方案责任关联
-- ============================================

-- 方案一的责任配置（任务15）
INSERT INTO `plan_liabilities` (
  `plan_id`,
  `liability_id`,
  `is_required`,
  `coverage_options`,
  `default_coverage`,
  `unit`,
  `display_order`,
  `status`
)
VALUES
  -- 死亡/伤残：100万
  (@plan_01_id, @liability_death, TRUE, '["100万"]', '100万', '元', 1, '启用'),
  -- 医疗费用：9万（免赔额0元，100%赔付）
  (@plan_01_id, @liability_medical, TRUE, '["9万"]', '9万', '元', 2, '启用'),
  -- 误工费用：200元/人/天（免赔天数0天，赔偿天数365天为限）
  (@plan_01_id, @liability_wage, TRUE, '["200元/天"]', '200元/天', '元/天', 3, '启用'),
  -- 住院津贴：60元/人/天（免赔天数0天，赔偿天数365天为限）
  (@plan_01_id, @liability_hospital, TRUE, '["60元/天"]', '60元/天', '元/天', 4, '启用'),
  -- 附加突发疾病死亡：100万
  (@plan_01_id, @liability_sudden_death, FALSE, '["100万"]', '100万', '元', 5, '启用'),
  -- 附加医疗费用范围扩展：9万
  (@plan_01_id, @liability_medical_extend, FALSE, '["9万"]', '9万', '元', 6, '启用'),
  -- 附加转院就医食宿交通费：2500元
  (@plan_01_id, @liability_transfer, FALSE, '["2500元"]', '2500元', '元', 7, '启用'),
  -- 附加残疾辅助器具费用：2500元
  (@plan_01_id, @liability_disability_aid, FALSE, '["2500元"]', '2500元', '元', 8, '启用'),
  -- 附加二十四小时责任死亡/伤残：20万
  (@plan_01_id, @liability_24h_death, FALSE, '["20万"]', '20万', '元', 9, '启用'),
  -- 附加二十四小时责任医疗费用：3万（方案一是3万，方案二是5万）
  (@plan_01_id, @liability_24h_medical, FALSE, '["3万"]', '3万', '元', 10, '启用'),
  -- 附加二十四小时责任住院津贴：60元/天
  (@plan_01_id, @liability_24h_hospital, FALSE, '["60元/天"]', '60元/天', '元/天', 11, '启用')
ON DUPLICATE KEY UPDATE 
  `coverage_options` = VALUES(`coverage_options`),
  `default_coverage` = VALUES(`default_coverage`);

-- 方案二的责任配置（任务16）- 12条，与方案一差异：二十四小时责任医疗费用是5万，且有误工费用
INSERT INTO `plan_liabilities` (
  `plan_id`,
  `liability_id`,
  `is_required`,
  `coverage_options`,
  `default_coverage`,
  `unit`,
  `display_order`,
  `status`
)
VALUES
  -- 死亡/伤残：100万
  (@plan_02_id, @liability_death, TRUE, '["100万"]', '100万', '元', 1, '启用'),
  -- 医疗费用：9万（免赔额0元，100%赔付）
  (@plan_02_id, @liability_medical, TRUE, '["9万"]', '9万', '元', 2, '启用'),
  -- 误工费用：200元/人/天（免赔天数0天，赔偿天数365天为限）
  (@plan_02_id, @liability_wage, TRUE, '["200元/天"]', '200元/天', '元/天', 3, '启用'),
  -- 住院津贴：60元/人/天（免赔天数0天，赔偿天数365天为限）
  (@plan_02_id, @liability_hospital, TRUE, '["60元/天"]', '60元/天', '元/天', 4, '启用'),
  -- 附加突发疾病死亡：100万
  (@plan_02_id, @liability_sudden_death, FALSE, '["100万"]', '100万', '元', 5, '启用'),
  -- 附加医疗费用范围扩展：9万
  (@plan_02_id, @liability_medical_extend, FALSE, '["9万"]', '9万', '元', 6, '启用'),
  -- 附加转院就医食宿交通费：2500元
  (@plan_02_id, @liability_transfer, FALSE, '["2500元"]', '2500元', '元', 7, '启用'),
  -- 附加残疾辅助器具费用：2500元
  (@plan_02_id, @liability_disability_aid, FALSE, '["2500元"]', '2500元', '元', 8, '启用'),
  -- 附加二十四小时责任死亡/伤残：20万
  (@plan_02_id, @liability_24h_death, FALSE, '["20万"]', '20万', '元', 9, '启用'),
  -- 附加二十四小时责任医疗费用：5万（方案二是5万，方案一是3万）
  (@plan_02_id, @liability_24h_medical, FALSE, '["5万"]', '5万', '元', 10, '启用'),
  -- 附加二十四小时责任误工费用：200元/天（方案二有，方案一没有）
  (@plan_02_id, @liability_24h_wage, FALSE, '["200元/天"]', '200元/天', '元/天', 11, '启用'),
  -- 附加二十四小时责任住院津贴：60元/天
  (@plan_02_id, @liability_24h_hospital, FALSE, '["60元/天"]', '60元/天', '元/天', 12, '启用')
ON DUPLICATE KEY UPDATE 
  `coverage_options` = VALUES(`coverage_options`),
  `default_coverage` = VALUES(`default_coverage`);

-- ============================================
-- 第七部分：任务20 - 配置方案固定保费
-- ============================================
-- 注意：premium_rates表的liability_id, job_class, coverage_amount, base_rate都是NOT NULL
-- 对于固定保费，我们需要使用占位值，因为表结构要求这些字段不能为空
-- 可以使用一个虚拟的责任ID、职业类别和保额值

-- 获取一个虚拟的责任ID（使用死亡/伤残责任作为占位）
SET @dummy_liability_id = (SELECT liability_id FROM company_liabilities WHERE company_id = @libo_company_id AND liability_code = '01824' LIMIT 1);

-- 方案一固定保费：28元/人/月，336元/人/年
INSERT INTO `premium_rates` (
  `product_id`,
  `plan_id`,
  `liability_id`,
  `job_class`,
  `coverage_amount`,
  `premium_type`,
  `monthly_premium`,
  `annual_premium`,
  `base_rate`,
  `rate_factor`,
  `effective_date`,
  `status`
)
VALUES (
  @product_id,
  @plan_01_id,
  @dummy_liability_id,  -- 使用占位责任ID（固定保费不依赖具体责任）
  '固定保费',           -- 使用特殊值标识这是固定保费
  '固定',               -- 使用特殊值标识这是固定保费
  '固定保费',
  28.00,
  336.00,
  0.0000,  -- base_rate设为0（固定保费不使用）
  1.0000,  -- rate_factor设为1（固定保费不使用）
  CURDATE(),
  '启用'
)
ON DUPLICATE KEY UPDATE 
  `monthly_premium` = VALUES(`monthly_premium`),
  `annual_premium` = VALUES(`annual_premium`),
  `status` = VALUES(`status`);

-- 方案二固定保费：29元/人/月，344元/人/年
INSERT INTO `premium_rates` (
  `product_id`,
  `plan_id`,
  `liability_id`,
  `job_class`,
  `coverage_amount`,
  `premium_type`,
  `monthly_premium`,
  `annual_premium`,
  `base_rate`,
  `rate_factor`,
  `effective_date`,
  `status`
)
VALUES (
  @product_id,
  @plan_02_id,
  @dummy_liability_id,  -- 使用占位责任ID（固定保费不依赖具体责任）
  '固定保费',           -- 使用特殊值标识这是固定保费
  '固定',               -- 使用特殊值标识这是固定保费
  '固定保费',
  29.00,
  344.00,
  0.0000,  -- base_rate设为0（固定保费不使用）
  1.0000,  -- rate_factor设为1（固定保费不使用）
  CURDATE(),
  '启用'
)
ON DUPLICATE KEY UPDATE 
  `monthly_premium` = VALUES(`monthly_premium`),
  `annual_premium` = VALUES(`annual_premium`),
  `status` = VALUES(`status`);

-- ============================================
-- 第七部分补充：任务21 - 新增特别约定（关联产品/方案）
-- ============================================

-- 11-12. 医疗费用免赔条件特别约定（关联方案一、方案二）
INSERT INTO special_agreements (
  company_id, product_id, plan_id, liability_id, agreement_code, agreement_name, 
  link_type, agreement_content, is_linked, display_order, status
)
VALUES 
  -- 方案一
  (@libo_company_id, @product_id, @plan_01_id, @liability_medical, 
   'MEDICAL_DEDUCTIBLE_PLAN01', '医疗费用免赔条件特别约定', 
   'plan', '医疗费用免赔额为0元，100%赔付', TRUE, 11, '启用'),
  -- 方案二
  (@libo_company_id, @product_id, @plan_02_id, @liability_medical, 
   'MEDICAL_DEDUCTIBLE_PLAN02', '医疗费用免赔条件特别约定', 
   'plan', '医疗费用免赔额为0元，100%赔付', TRUE, 12, '启用')
ON DUPLICATE KEY UPDATE 
  agreement_name = VALUES(agreement_name),
  agreement_content = VALUES(agreement_content);

-- 13-14. 误工费用免赔条件特别约定（关联方案一、方案二）
INSERT INTO special_agreements (
  company_id, product_id, plan_id, liability_id, agreement_code, agreement_name, 
  link_type, agreement_content, is_linked, display_order, status
)
VALUES 
  -- 方案一
  (@libo_company_id, @product_id, @plan_01_id, @liability_wage, 
   'WAGE_DEDUCTIBLE_PLAN01', '误工费用免赔条件特别约定', 
   'plan', '误工费用200元/天，免赔天数0天，赔偿天数365天为限', TRUE, 13, '启用'),
  -- 方案二
  (@libo_company_id, @product_id, @plan_02_id, @liability_wage, 
   'WAGE_DEDUCTIBLE_PLAN02', '误工费用免赔条件特别约定', 
   'plan', '误工费用200元/天，免赔天数0天，赔偿天数365天为限', TRUE, 14, '启用')
ON DUPLICATE KEY UPDATE 
  agreement_name = VALUES(agreement_name),
  agreement_content = VALUES(agreement_content);

-- 15-16. 住院津贴免赔条件特别约定（关联方案一、方案二）
INSERT INTO special_agreements (
  company_id, product_id, plan_id, liability_id, agreement_code, agreement_name, 
  link_type, agreement_content, is_linked, display_order, status
)
VALUES 
  -- 方案一
  (@libo_company_id, @product_id, @plan_01_id, @liability_hospital, 
   'HOSPITAL_DEDUCTIBLE_PLAN01', '住院津贴免赔条件特别约定', 
   'plan', '住院津贴60元/天，免赔天数0天，赔偿天数365天为限', TRUE, 15, '启用'),
  -- 方案二
  (@libo_company_id, @product_id, @plan_02_id, @liability_hospital, 
   'HOSPITAL_DEDUCTIBLE_PLAN02', '住院津贴免赔条件特别约定', 
   'plan', '住院津贴60元/天，免赔天数0天，赔偿天数365天为限', TRUE, 16, '启用')
ON DUPLICATE KEY UPDATE 
  agreement_name = VALUES(agreement_name),
  agreement_content = VALUES(agreement_content);

-- 17. 雇主责任保险附加二十四小时责任扩展特别约定（关联产品）
INSERT INTO special_agreements (
  company_id, product_id, liability_id, agreement_code, agreement_name, 
  link_type, agreement_content, is_linked, display_order, status
)
VALUES (
  @libo_company_id, @product_id, @liability_24h_death, 
  '24H_LIABILITY_EXTENSION', '雇主责任保险附加二十四小时责任扩展特别约定', 
  'product', '伤残等级1-10级赔付比例（100%到10%）', TRUE, 17, '启用'
)
ON DUPLICATE KEY UPDATE 
  agreement_name = VALUES(agreement_name),
  agreement_content = VALUES(agreement_content);

-- 注意：任务21中提到的"其他特别约定（Excel中的17，19，20）"暂时不添加，待确认Excel内容后调整

-- ============================================
-- 第八部分：任务22-35 - 配置拒保地区和拦截规则
-- ============================================

-- 添加拒保地区（西藏、新疆、青海）
INSERT INTO `regions` (`region_code`, `region_name`, `region_level`, `parent_id`, `parent_code`, `sort_order`, `status`)
VALUES ('540000', '西藏自治区', 1, NULL, NULL, 0, '启用')
ON DUPLICATE KEY UPDATE `region_name` = VALUES(`region_name`);

INSERT INTO `regions` (`region_code`, `region_name`, `region_level`, `parent_id`, `parent_code`, `sort_order`, `status`)
VALUES ('650000', '新疆维吾尔自治区', 1, NULL, NULL, 0, '启用')
ON DUPLICATE KEY UPDATE `region_name` = VALUES(`region_name`);

INSERT INTO `regions` (`region_code`, `region_name`, `region_level`, `parent_id`, `parent_code`, `sort_order`, `status`)
VALUES ('630000', '青海省', 1, NULL, NULL, 0, '启用')
ON DUPLICATE KEY UPDATE `region_name` = VALUES(`region_name`);

-- 构建拦截规则JSON
SET @intercept_rules_json = JSON_OBJECT(
  'region_restriction', JSON_OBJECT(
    'type', 'region_restriction',
    'denied_regions', JSON_ARRAY('西藏自治区', '新疆维吾尔自治区', '青海省'),
    'denied_region_codes', JSON_ARRAY('540000', '650000', '630000'),
    'description', '拒保地区：西藏、新疆、青海'
  ),
  'age_restriction', JSON_OBJECT(
    'type', 'age_restriction',
    'min_age', 16,
    'max_age', 65,
    'description', '雇员年龄：年满16周岁至65周岁（含）'
  ),
  'min_insured_count', JSON_OBJECT(
    'type', 'min_insured_count',
    'min_count', 3,
    'description', '最低在保人数：3人（含）以上'
  ),
  'duplicate_application_check', JSON_OBJECT(
    'type', 'duplicate_application_check',
    'check_scope', 'platform_only',
    'description', '重复投保校验（仅校验本平台数据库）'
  ),
  'policy_limit_check', JSON_OBJECT(
    'type', 'policy_limit_check',
    'max_policies_per_employee', 1,
    'check_scope', 'platform_only',
    'description', '投保份数限制：相同雇员限1份（仅校验本平台数据库）'
  )
);

-- 配置拦截规则到 insurance_api_configs
INSERT INTO `insurance_api_configs` (
  `company_id`, 
  `company_code`, 
  `channel_code`, 
  `api_base_url`, 
  `api_version`,
  `app_id`, 
  `app_secret`, 
  `environment`, 
  `api_config_json`, 
  `field_mapping_json`,
  `intercept_rules_json`, 
  `status`
)
VALUES (
  @libo_company_id,
  @libo_company_code,
  'LEXUAN',
  '',
  'v1',
  '',
  '',
  'test',
  '{}',
  '{}',
  @intercept_rules_json,
  '启用'
)
ON DUPLICATE KEY UPDATE
  `intercept_rules_json` = @intercept_rules_json,
  `updated_at` = NOW();

-- ============================================
-- 第九部分：数据验证
-- ============================================

SELECT '============================================' AS '';
SELECT '数据导入完成！验证结果如下：' AS '';
SELECT '============================================' AS '';

-- 验证条款数据
SELECT '条款统计' AS '类型', clause_type AS '分类', COUNT(*) AS '数量'
FROM insurance_clauses 
WHERE company_id = @libo_company_id 
GROUP BY clause_type;

-- 验证责任数据
SELECT '责任统计' AS '类型', 
  CASE WHEN is_additional = 0 THEN '主险' ELSE '附加险' END AS '分类', 
  COUNT(*) AS '数量'
FROM company_liabilities 
WHERE company_id = @libo_company_id 
GROUP BY is_additional;

-- 验证特别约定数据
SELECT '特别约定数量' AS '类型', COUNT(*) AS '数量'
FROM special_agreements 
WHERE company_id = @libo_company_id;

-- 验证产品数据
SELECT '产品数量' AS '类型', COUNT(*) AS '数量'
FROM insurance_products 
WHERE company_id = @libo_company_id;

-- 验证方案数据
SELECT '方案数量' AS '类型', COUNT(*) AS '数量'
FROM product_plans 
WHERE product_id = @product_id;

-- 验证方案责任配置
SELECT '方案责任配置' AS '类型', plan_name AS '方案', COUNT(*) AS '责任数量'
FROM plan_liabilities pl
JOIN product_plans pp ON pl.plan_id = pp.plan_id
WHERE pp.product_id = @product_id
GROUP BY plan_name;

-- 验证方案固定保费
SELECT '方案固定保费' AS '类型', plan_name AS '方案', monthly_premium AS '月保费(元)', annual_premium AS '年保费(元)'
FROM premium_rates pr
JOIN product_plans pp ON pr.plan_id = pp.plan_id
WHERE pr.premium_type = '固定保费' AND pp.product_id = @product_id;

-- 验证拦截规则配置
SELECT '拦截规则配置' AS '类型', 
  JSON_EXTRACT(intercept_rules_json, '$.region_restriction.denied_regions') AS '拒保地区',
  JSON_EXTRACT(intercept_rules_json, '$.age_restriction.min_age') AS '最小年龄',
  JSON_EXTRACT(intercept_rules_json, '$.age_restriction.max_age') AS '最大年龄',
  JSON_EXTRACT(intercept_rules_json, '$.min_insured_count.min_count') AS '最低人数'
FROM insurance_api_configs 
WHERE company_id = @libo_company_id AND channel_code = 'LEXUAN';

SELECT '============================================' AS '';
SELECT '✅ 所有数据导入完成！' AS '完成状态';
SELECT '============================================' AS '';
