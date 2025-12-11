-- 扩展special_agreements表，支持关联产品或方案
-- 用于那些没有对应条款或责任的特别约定（如：医疗费用免赔条件、误工费用免赔条件等）

ALTER TABLE `special_agreements`
  ADD COLUMN `product_id` BIGINT DEFAULT NULL COMMENT '产品ID（外键，关联insurance_products，可空）' AFTER `liability_id`,
  ADD COLUMN `plan_id` BIGINT DEFAULT NULL COMMENT '方案ID（外键，关联product_plans，可空）' AFTER `product_id`,
  ADD COLUMN `link_type` VARCHAR(20) DEFAULT 'clause' COMMENT '关联类型（clause=条款，liability=责任，product=产品，plan=方案）' AFTER `plan_id`;

-- 添加索引
ALTER TABLE `special_agreements`
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_plan_id` (`plan_id`),
  ADD KEY `idx_link_type` (`link_type`);

-- 添加外键
ALTER TABLE `special_agreements`
  ADD CONSTRAINT `fk_sa_product` FOREIGN KEY (`product_id`) REFERENCES `insurance_products` (`product_id`),
  ADD CONSTRAINT `fk_sa_plan` FOREIGN KEY (`plan_id`) REFERENCES `product_plans` (`plan_id`);

-- 说明：
-- 1. 如果link_type='clause'：关联到条款（clause_id不为空）
-- 2. 如果link_type='liability'：关联到责任（liability_id不为空）
-- 3. 如果link_type='product'：关联到产品（product_id不为空）
-- 4. 如果link_type='plan'：关联到方案（plan_id不为空）
-- 5. 可以同时关联多个（如：既关联条款又关联产品）
