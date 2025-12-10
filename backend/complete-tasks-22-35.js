// 完成任务22-35：拦截规则配置和前端页面修改
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'insurance_platform',
  charset: 'utf8mb4',
};

async function executeSQL(connection, sql, params = []) {
  try {
    const [result] = await connection.execute(sql, params);
    return result;
  } catch (error) {
    console.error('SQL执行失败:', sql);
    console.error('错误:', error.message);
    throw error;
  }
}

async function main() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // ========== 任务22-1：完善地区表数据 ==========
    console.log('\n📋 任务22-1：完善地区表数据...');
    
    // 检查regions表是否存在
    try {
      const [tables] = await executeSQL(connection, "SHOW TABLES LIKE 'regions'");
      if (tables.length === 0) {
        console.log('⚠️  regions表不存在，先创建表...');
        // 直接执行CREATE TABLE语句
        await executeSQL(connection, `
          CREATE TABLE IF NOT EXISTS \`regions\` (
            \`region_id\` BIGINT NOT NULL AUTO_INCREMENT COMMENT '地区ID',
            \`region_code\` VARCHAR(20) NOT NULL COMMENT '地区编码（国家标准）',
            \`region_name\` VARCHAR(100) NOT NULL COMMENT '地区名称',
            \`region_level\` TINYINT NOT NULL COMMENT '地区级别（1=省/直辖市/自治区，2=市/地区，3=区/县）',
            \`parent_id\` BIGINT DEFAULT NULL COMMENT '父级地区ID',
            \`parent_code\` VARCHAR(20) DEFAULT NULL COMMENT '父级地区编码',
            \`sort_order\` INT DEFAULT 0 COMMENT '排序顺序',
            \`status\` VARCHAR(20) DEFAULT '启用' COMMENT '状态（启用/禁用）',
            \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`region_id\`),
            UNIQUE KEY \`uk_region_code\` (\`region_code\`),
            KEY \`idx_parent_id\` (\`parent_id\`),
            KEY \`idx_region_level\` (\`region_level\`),
            KEY \`idx_status\` (\`status\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='地区表（省市区三级）'
        `);
        console.log('  ✅ regions表创建成功');
      } else {
        console.log('  ℹ️  regions表已存在');
      }
    } catch (error) {
      if (error.message.includes("doesn't exist")) {
        // 表不存在，创建表
        console.log('⚠️  创建regions表...');
        await executeSQL(connection, `
          CREATE TABLE IF NOT EXISTS \`regions\` (
            \`region_id\` BIGINT NOT NULL AUTO_INCREMENT COMMENT '地区ID',
            \`region_code\` VARCHAR(20) NOT NULL COMMENT '地区编码（国家标准）',
            \`region_name\` VARCHAR(100) NOT NULL COMMENT '地区名称',
            \`region_level\` TINYINT NOT NULL COMMENT '地区级别（1=省/直辖市/自治区，2=市/地区，3=区/县）',
            \`parent_id\` BIGINT DEFAULT NULL COMMENT '父级地区ID',
            \`parent_code\` VARCHAR(20) DEFAULT NULL COMMENT '父级地区编码',
            \`sort_order\` INT DEFAULT 0 COMMENT '排序顺序',
            \`status\` VARCHAR(20) DEFAULT '启用' COMMENT '状态（启用/禁用）',
            \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`region_id\`),
            UNIQUE KEY \`uk_region_code\` (\`region_code\`),
            KEY \`idx_parent_id\` (\`parent_id\`),
            KEY \`idx_region_level\` (\`region_level\`),
            KEY \`idx_status\` (\`status\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='地区表（省市区三级）'
        `);
        console.log('  ✅ regions表创建成功');
      } else {
        throw error;
      }
    }
    
    // 添加西藏、新疆、青海等省份数据（如果不存在）
    const deniedRegions = [
      { code: '540000', name: '西藏自治区', level: 1 },
      { code: '650000', name: '新疆维吾尔自治区', level: 1 },
      { code: '630000', name: '青海省', level: 1 },
    ];
    
    for (const region of deniedRegions) {
      const existing = await executeSQL(
        connection,
        'SELECT region_id FROM regions WHERE region_code = ?',
        [region.code]
      );
      
      if (!existing || existing.length === 0) {
        await executeSQL(
          connection,
          `INSERT INTO regions (region_code, region_name, region_level, parent_id, parent_code, sort_order, status)
           VALUES (?, ?, ?, NULL, NULL, 0, '启用')`,
          [region.code, region.name, region.level]
        );
        console.log(`  ✅ 已添加拒保地区: ${region.name}`);
      } else {
        console.log(`  ℹ️  拒保地区已存在: ${region.name}`);
      }
    }
    
    // ========== 任务23、24：配置拦截规则到insurance_api_configs ==========
    console.log('\n📋 任务23、24：配置拦截规则...');
    
    // 获取利宝保险的company_id
    const companies = await executeSQL(
      connection,
      "SELECT company_id, company_code FROM insurance_companies WHERE company_code = 'LIBO' LIMIT 1"
    );
    
    if (!companies || companies.length === 0) {
      throw new Error('未找到利宝保险公司');
    }
    
    const companyId = companies[0].company_id;
    const companyCode = companies[0].company_code;
    
    // 检查是否已有配置
    const existingConfigs = await executeSQL(
      connection,
      `SELECT config_id, intercept_rules_json FROM insurance_api_configs 
       WHERE company_id = ? AND channel_code = 'LEXUAN'`,
      [companyId]
    );
    
    // 构建拦截规则JSON
    const interceptRules = {
      region_restriction: {
        type: 'region_restriction',
        denied_regions: ['西藏自治区', '新疆维吾尔自治区', '青海省'],
        denied_region_codes: ['540000', '650000', '630000'],
        description: '拒保地区：西藏、新疆、青海',
      },
      age_restriction: {
        type: 'age_restriction',
        min_age: 16,
        max_age: 65,
        description: '雇员年龄：年满16周岁至65周岁（含）',
      },
      min_insured_count: {
        type: 'min_insured_count',
        min_count: 3,
        description: '最低在保人数：3人（含）以上',
      },
      duplicate_application_check: {
        type: 'duplicate_application_check',
        check_scope: 'platform_only',
        description: '重复投保校验（仅校验本平台数据库）',
      },
      policy_limit_check: {
        type: 'policy_limit_check',
        max_policies_per_employee: 1,
        check_scope: 'platform_only',
        description: '投保份数限制：相同雇员限1份（仅校验本平台数据库）',
      },
    };
    
    const interceptRulesJSON = JSON.stringify(interceptRules, null, 2);
    
    if (existingConfigs.length > 0) {
      // 更新现有配置
      await executeSQL(
        connection,
        `UPDATE insurance_api_configs 
         SET intercept_rules_json = ?, updated_at = NOW()
         WHERE config_id = ?`,
        [interceptRulesJSON, existingConfigs[0].config_id]
      );
      console.log('  ✅ 已更新拦截规则配置');
    } else {
      // 创建新配置
      await executeSQL(
        connection,
        `INSERT INTO insurance_api_configs (
          company_id, company_code, channel_code, api_base_url, api_version,
          app_id, app_secret, environment, api_config_json, field_mapping_json,
          intercept_rules_json, status
        ) VALUES (?, ?, 'LEXUAN', '', 'v1', '', '', 'test', '{}', '{}', ?, '启用')`,
        [companyId, companyCode, interceptRulesJSON]
      );
      console.log('  ✅ 已创建拦截规则配置');
    }
    
    console.log('  ✅ 拦截规则配置完成');
    console.log('     - 地区限制：西藏、新疆、青海');
    console.log('     - 年龄限制：16-65周岁');
    console.log('     - 最低人数：3人');
    console.log('     - 重复投保校验：仅校验本平台');
    console.log('     - 投保份数限制：仅校验本平台');
    
    console.log('\n✅ 所有任务完成！');
    
  } catch (error) {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
