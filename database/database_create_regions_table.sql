-- 创建地区表（省市区三级）
-- 参考公安系统的地区编码表
-- 用于企业所在地选择

CREATE TABLE IF NOT EXISTS `regions` (
  `region_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '地区ID',
  `region_code` VARCHAR(20) NOT NULL COMMENT '地区编码（国家标准）',
  `region_name` VARCHAR(100) NOT NULL COMMENT '地区名称',
  `region_level` TINYINT NOT NULL COMMENT '地区级别（1=省/直辖市/自治区，2=市/地区，3=区/县）',
  `parent_id` BIGINT DEFAULT NULL COMMENT '父级地区ID（省市的parent_id为NULL，区县的parent_id为市的region_id）',
  `parent_code` VARCHAR(20) DEFAULT NULL COMMENT '父级地区编码',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `status` VARCHAR(20) DEFAULT '启用' COMMENT '状态（启用/禁用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`region_id`),
  UNIQUE KEY `uk_region_code` (`region_code`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_region_level` (`region_level`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='地区表（省市区三级）';

-- 示例数据：北京市
INSERT INTO `regions` (`region_code`, `region_name`, `region_level`, `parent_id`, `parent_code`, `sort_order`) VALUES
('110000', '北京市', 1, NULL, NULL, 1),
('110100', '北京市市辖区', 2, 1, '110000', 1),
('110101', '东城区', 3, 2, '110100', 1),
('110102', '西城区', 3, 2, '110100', 2),
('110105', '朝阳区', 3, 2, '110100', 3),
('110106', '丰台区', 3, 2, '110100', 4),
('110107', '石景山区', 3, 2, '110100', 5),
('110108', '海淀区', 3, 2, '110100', 6),
('110109', '门头沟区', 3, 2, '110100', 7),
('110111', '房山区', 3, 2, '110100', 8),
('110112', '通州区', 3, 2, '110100', 9),
('110113', '顺义区', 3, 2, '110100', 10),
('110114', '昌平区', 3, 2, '110100', 11),
('110115', '大兴区', 3, 2, '110100', 12),
('110116', '怀柔区', 3, 2, '110100', 13),
('110117', '平谷区', 3, 2, '110100', 14),
('110118', '密云区', 3, 2, '110100', 15),
('110119', '延庆区', 3, 2, '110100', 16);

-- 示例数据：天津市
INSERT INTO `regions` (`region_code`, `region_name`, `region_level`, `parent_id`, `parent_code`, `sort_order`) VALUES
('120000', '天津市', 1, NULL, NULL, 2),
('120100', '天津市市辖区', 2, 18, '120000', 1),
('120101', '和平区', 3, 19, '120100', 1),
('120102', '河东区', 3, 19, '120100', 2),
('120103', '河西区', 3, 19, '120100', 3),
('120104', '南开区', 3, 19, '120100', 4),
('120105', '河北区', 3, 19, '120100', 5),
('120106', '红桥区', 3, 19, '120100', 6),
('120110', '东丽区', 3, 19, '120100', 7),
('120111', '西青区', 3, 19, '120100', 8),
('120112', '津南区', 3, 19, '120100', 9),
('120113', '北辰区', 3, 19, '120100', 10),
('120114', '武清区', 3, 19, '120100', 11),
('120115', '宝坻区', 3, 19, '120100', 12),
('120116', '滨海新区', 3, 19, '120100', 13),
('120117', '宁河区', 3, 19, '120100', 14),
('120118', '静海区', 3, 19, '120100', 15),
('120119', '蓟州区', 3, 19, '120100', 16);

-- 注意：这里只插入示例数据，实际使用时需要导入完整的国家标准地区编码表
-- 可以参考：GB/T 2260-2007 中华人民共和国行政区划代码

