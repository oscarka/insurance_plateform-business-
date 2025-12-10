// 产品相关路由
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/products
 * 获取产品列表
 * 查询参数: company_code (可选)
 */
router.get('/', async (req, res) => {
  try {
    let { company_code } = req.query;
    
    // 清理参数：如果是undefined字符串或空字符串，设为undefined
    if (company_code === 'undefined' || company_code === '' || !company_code) {
      company_code = undefined;
    }
    
    console.log('=== 产品列表API调用开始 ===');
    console.log('原始查询参数:', req.query);
    console.log('清理后的查询参数:', { company_code });
    
    // 检查数据库连接字符集
    const [charsetRows] = await pool.execute('SHOW VARIABLES LIKE "character_set%"');
    console.log('数据库字符集配置:');
    charsetRows.forEach(row => {
      console.log(`  ${row.Variable_name}: ${row.Value}`);
    });
    
    // 检查表的字符集
    const [tableCharset] = await pool.execute(`
      SELECT 
        TABLE_NAME,
        TABLE_COLLATION,
        CHARACTER_SET_NAME
      FROM information_schema.TABLES t
      JOIN information_schema.COLLATION_CHARACTER_SET_APPLICABILITY c
        ON t.TABLE_COLLATION = c.COLLATION_NAME
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('insurance_products', 'insurance_companies')
    `);
    console.log('表字符集配置:');
    tableCharset.forEach(row => {
      console.log(`  ${row.TABLE_NAME}: ${row.CHARACTER_SET_NAME} / ${row.TABLE_COLLATION}`);
    });
    
    // 检查字段字符集
    const [columnCharset] = await pool.execute(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CHARACTER_SET_NAME,
        COLLATION_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('insurance_products', 'insurance_companies')
        AND CHARACTER_SET_NAME IS NOT NULL
    `);
    console.log('字段字符集配置:');
    columnCharset.forEach(row => {
      console.log(`  ${row.TABLE_NAME}.${row.COLUMN_NAME}: ${row.CHARACTER_SET_NAME} / ${row.COLLATION_NAME}`);
    });
    
    // 直接查询原始数据
    const [rawRows] = await pool.execute(`
      SELECT 
        product_id,
        product_name,
        HEX(product_name) as product_name_hex,
        status,
        HEX(status) as status_hex
      FROM insurance_products
      WHERE product_id = 1
      LIMIT 1
    `);
    console.log('原始数据（第一条产品）:');
    if (rawRows.length > 0) {
      const row = rawRows[0];
      console.log(`  product_id: ${row.product_id}`);
      console.log(`  product_name (原始): ${row.product_name}`);
      console.log(`  product_name (HEX): ${row.product_name_hex}`);
      console.log(`  status (原始): ${row.status}`);
      console.log(`  status (HEX): ${row.status_hex}`);
      console.log(`  product_name (类型): ${typeof row.product_name}`);
      console.log(`  product_name (长度): ${row.product_name ? row.product_name.length : 0}`);
    }
    
    let sql = `
      SELECT 
        p.product_id,
        p.product_code,
        p.product_name,
        p.product_type,
        p.registration_no,
        p.registration_name,
        p.status,
        ic.company_code,
        ic.company_name
      FROM insurance_products p
      INNER JOIN insurance_companies ic ON p.company_id = ic.company_id
      WHERE 1=1
    `;
    
    const params = [];
    if (company_code) {
      sql += ' AND ic.company_code = ?';
      params.push(company_code);
    }
    
    sql += ' ORDER BY p.product_id DESC';
    
    // 在执行查询前，检查当前连接的字符集
    const [currentCharset] = await pool.execute('SHOW VARIABLES LIKE "character_set%"');
    console.log('🔍 [查询前] 当前连接字符集:');
    currentCharset.forEach(row => {
      if (row.Variable_name.includes('client') || row.Variable_name.includes('connection') || row.Variable_name.includes('results')) {
        console.log(`  ${row.Variable_name}: ${row.Value}`);
      }
    });
    
    console.log('执行SQL查询...');
    const [rows] = await pool.execute(sql, params);
    console.log(`查询结果数量: ${rows.length}`);
    
    if (rows.length > 0) {
      console.log('第一条结果（查询后）:');
      const firstRow = rows[0];
      console.log(`  product_id: ${firstRow.product_id}`);
      console.log(`  product_name: ${firstRow.product_name}`);
      console.log(`  product_name (类型): ${typeof firstRow.product_name}`);
      console.log(`  product_name (Buffer检查):`, Buffer.isBuffer(firstRow.product_name));
      if (Buffer.isBuffer(firstRow.product_name)) {
        console.log(`  product_name (Buffer内容):`, firstRow.product_name.toString('hex'));
      }
      console.log(`  product_name (HEX验证):`, Buffer.from(firstRow.product_name, 'utf8').toString('hex'));
      console.log(`  status: ${firstRow.status}`);
      console.log(`  status (HEX验证):`, Buffer.from(firstRow.status, 'utf8').toString('hex'));
      console.log(`  company_name: ${firstRow.company_name}`);
      console.log(`  company_name (HEX验证):`, Buffer.from(firstRow.company_name, 'utf8').toString('hex'));
      
      // 验证是否是正确的中文字符
      const hasChinese = /[\u4e00-\u9fa5]/.test(firstRow.product_name);
      console.log(`  product_name (包含中文?): ${hasChinese}`);
    }
    
    // 检查Node.js进程的默认编码
    console.log('Node.js环境:');
    console.log(`  process.platform: ${process.platform}`);
    console.log(`  process.env.LANG: ${process.env.LANG || '未设置'}`);
    console.log(`  process.env.LC_ALL: ${process.env.LC_ALL || '未设置'}`);
    
    // 尝试转换编码
    console.log('尝试编码转换...');
    const convertedRows = rows.map(row => {
      const converted = { ...row };
      const textFields = ['product_name', 'product_type', 'registration_name', 'status', 'company_name'];
      textFields.forEach(field => {
        if (converted[field] && typeof converted[field] === 'string') {
          const original = converted[field];
          console.log(`  字段 ${field}:`);
          console.log(`    原始值: ${original}`);
          console.log(`    原始HEX: ${Buffer.from(original, 'latin1').toString('hex')}`);
          
          // 尝试从latin1转换
          try {
            const fromLatin1 = Buffer.from(original, 'latin1').toString('utf8');
            console.log(`    从latin1转换: ${fromLatin1}`);
            if (fromLatin1 !== original && /[\u4e00-\u9fa5]/.test(fromLatin1)) {
              converted[field] = fromLatin1;
              console.log(`    ✅ 使用latin1转换结果`);
            }
          } catch (e) {
            console.log(`    ❌ latin1转换失败: ${e.message}`);
          }
        }
      });
      return converted;
    });
    
    if (convertedRows.length > 0) {
      console.log('转换后的第一条结果:');
      const firstConverted = convertedRows[0];
      console.log(`  product_name: ${firstConverted.product_name}`);
      console.log(`  status: ${firstConverted.status}`);
    }
    
    console.log('准备返回JSON响应...');
    const response = {
      success: true,
      data: convertedRows,
      count: convertedRows.length,
    };
    
    // 检查JSON序列化
    const jsonString = JSON.stringify(response);
    console.log(`JSON字符串长度: ${jsonString.length}`);
    console.log(`JSON字符串前200字符: ${jsonString.substring(0, 200)}`);
    
    console.log('=== 产品列表API调用结束 ===');
    
    res.json(response);
  } catch (error) {
    console.error('获取产品列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取产品列表失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/products/:id
 * 获取产品详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT 
        p.*,
        ic.company_code,
        ic.company_name
      FROM insurance_products p
      INNER JOIN insurance_companies ic ON p.company_id = ic.company_id
      WHERE p.product_id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '产品不存在',
      });
    }
    
    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('获取产品详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取产品详情失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/products/:id/plans
 * 获取产品下的方案列表
 */
router.get('/:id/plans', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT 
        plan_id,
        plan_code,
        plan_name,
        job_class_range,
        duration_options,
        payment_type,
        description,
        status
      FROM product_plans
      WHERE product_id = ?
      ORDER BY plan_id`,
      [id]
    );
    
    // 解析JSON字段
    const plans = rows.map(plan => ({
      ...plan,
      duration_options: JSON.parse(plan.duration_options || '[]'),
    }));
    
    res.json({
      success: true,
      data: plans,
      count: plans.length,
    });
  } catch (error) {
    console.error('获取方案列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取方案列表失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/products/:id/plans
 * 获取产品下的方案列表
 */
router.get('/:id/plans', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== 获取产品方案列表 ===');
    console.log('产品ID:', id);
    
    const [rows] = await pool.execute(
      `SELECT 
        p.plan_id,
        p.plan_code,
        p.plan_name,
        p.job_class_range,
        p.duration_options,
        p.payment_type,
        p.description,
        p.status
      FROM product_plans p
      WHERE p.product_id = ?
        AND (p.status = '启用' OR p.status IS NULL OR p.status = '')
      ORDER BY p.plan_id`,
      [id]
    );
    
    console.log(`查询到 ${rows.length} 个方案（产品ID: ${id}）`);
    
    // 解析JSON字段
    const plans = rows.map(plan => ({
      ...plan,
      duration_options: JSON.parse(plan.duration_options || '[]'),
    }));
    
    console.log(`查询到 ${plans.length} 个方案`);
    
    res.json({
      success: true,
      data: plans,
      count: plans.length,
    });
  } catch (error) {
    console.error('获取产品方案列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取产品方案列表失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/products/:id/intercept-rules
 * 获取产品的拦截规则配置
 */
router.get('/:id/intercept-rules', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const product_id = parseInt(req.params.id);
    
    if (!product_id || isNaN(product_id)) {
      return res.status(400).json({
        success: false,
        error: '产品ID无效',
      });
    }
    
    // 获取产品信息
    const [productRows] = await connection.execute(
      `SELECT product_id, product_name, insurance_company_id 
       FROM insurance_products 
       WHERE product_id = ?`,
      [product_id]
    );
    
    if (productRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '产品不存在',
      });
    }
    
    const product = productRows[0];
    
    // 获取拦截规则（如果产品有对应的保险公司ID）
    let interceptRules = {};
    if (product.insurance_company_id) {
      try {
        const [configRows] = await connection.execute(
          `SELECT intercept_rules_json FROM insurance_api_configs 
           WHERE company_id = ? AND channel_code = 'LEXUAN' AND status = '启用'
           ORDER BY updated_at DESC LIMIT 1`,
          [product.insurance_company_id]
        );
        
        if (configRows.length > 0 && configRows[0].intercept_rules_json) {
          try {
            interceptRules = JSON.parse(configRows[0].intercept_rules_json);
          } catch (e) {
            console.error('解析拦截规则失败:', e);
          }
        }
      } catch (e) {
        console.error('查询拦截规则失败:', e);
        // 如果查询失败，返回空对象，不中断流程
      }
    }
    
    res.json({
      success: true,
      data: interceptRules,
    });
  } catch (error) {
    console.error('获取拦截规则失败:', error);
    res.status(500).json({
      success: false,
      error: '获取拦截规则失败',
      message: error.message,
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/products/intercept-rules/list
 * 获取所有拦截规则列表（用于管理页面展示）
 */
router.get('/intercept-rules/list', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // 获取所有配置，包含拦截规则
    const [configRows] = await connection.execute(
      `SELECT 
        iac.config_id,
        iac.company_id,
        iac.company_code,
        iac.intercept_rules_json,
        iac.status as config_status,
        ic.company_name as insurance_company_name
      FROM insurance_api_configs iac
      INNER JOIN insurance_companies ic ON iac.company_id = ic.company_id
      WHERE iac.status = '启用' AND iac.intercept_rules_json IS NOT NULL
      ORDER BY iac.updated_at DESC`
    );
    
    const rules = [];
    
    // 解析每个配置的拦截规则
    for (const config of configRows) {
      if (!config.intercept_rules_json) continue;
      
      try {
        const interceptRules = JSON.parse(config.intercept_rules_json);
        const companyCode = config.company_code;
        const companyName = config.insurance_company_name;
        
        // 获取该保司的所有产品
        const [productRows] = await connection.execute(
          `SELECT product_id, product_code, product_name 
           FROM insurance_products 
           WHERE company_id = ? AND status = '启用'`,
          [config.company_id]
        );
        
        // 为每个规则类型创建规则记录
        let ruleId = 1;
        
        // 地区限制规则
        if (interceptRules.region_restriction) {
          const rule = interceptRules.region_restriction;
          const deniedRegions = rule.denied_regions || [];
          for (const product of productRows) {
            rules.push({
              rule_id: `${config.config_id}_region_${product.product_id}`,
              rule_name: '地区限制规则',
              rule_type: '地区限制',
              insurance_company_code: companyCode,
              insurance_company_name: companyName,
              product_code: product.product_code,
              product_name: product.product_name,
              condition_type: '地区',
              condition_value: deniedRegions.join('、'),
              action: '拦截',
              priority: 1,
              status: config.config_status,
              description: rule.description || `拒保地区：${deniedRegions.join('、')}`,
            });
          }
        }
        
        // 年龄限制规则
        if (interceptRules.age_restriction) {
          const rule = interceptRules.age_restriction;
          for (const product of productRows) {
            rules.push({
              rule_id: `${config.config_id}_age_${product.product_id}`,
              rule_name: '年龄限制规则',
              rule_type: '年龄限制',
              insurance_company_code: companyCode,
              insurance_company_name: companyName,
              product_code: product.product_code,
              product_name: product.product_name,
              condition_type: '年龄',
              condition_value: `${rule.min_age || 16}-${rule.max_age || 65}岁`,
              action: '拦截',
              priority: 2,
              status: config.config_status,
              description: rule.description || `雇员年龄：${rule.min_age || 16}周岁至${rule.max_age || 65}周岁（含）`,
            });
          }
        }
        
        // 最低在保人数规则
        if (interceptRules.min_insured_count) {
          const rule = interceptRules.min_insured_count;
          for (const product of productRows) {
            rules.push({
              rule_id: `${config.config_id}_min_count_${product.product_id}`,
              rule_name: '最低在保人数规则',
              rule_type: '人数限制',
              insurance_company_code: companyCode,
              insurance_company_name: companyName,
              product_code: product.product_code,
              product_name: product.product_name,
              condition_type: '人数',
              condition_value: `${rule.min_count || 3}人（含）以上`,
              action: '拦截',
              priority: 3,
              status: config.config_status,
              description: rule.description || `最低在保人数：${rule.min_count || 3}人（含）以上`,
            });
          }
        }
        
        // 重复投保校验规则
        if (interceptRules.duplicate_application_check) {
          const rule = interceptRules.duplicate_application_check;
          for (const product of productRows) {
            rules.push({
              rule_id: `${config.config_id}_duplicate_${product.product_id}`,
              rule_name: '重复投保校验规则',
              rule_type: '重复投保',
              insurance_company_code: companyCode,
              insurance_company_name: companyName,
              product_code: product.product_code,
              product_name: product.product_name,
              condition_type: '重复投保',
              condition_value: rule.check_scope === 'platform_only' ? '仅校验本平台' : '全平台',
              action: '拦截',
              priority: 4,
              status: config.config_status,
              description: rule.description || '重复投保校验（仅校验本平台数据库）',
            });
          }
        }
        
        // 投保份数限制规则
        if (interceptRules.policy_limit_check) {
          const rule = interceptRules.policy_limit_check;
          for (const product of productRows) {
            rules.push({
              rule_id: `${config.config_id}_policy_limit_${product.product_id}`,
              rule_name: '投保份数限制规则',
              rule_type: '投保份数',
              insurance_company_code: companyCode,
              insurance_company_name: companyName,
              product_code: product.product_code,
              product_name: product.product_name,
              condition_type: '投保份数',
              condition_value: `限${rule.max_policies_per_employee || 1}份`,
              action: '拦截',
              priority: 5,
              status: config.config_status,
              description: rule.description || `投保份数限制：相同雇员限${rule.max_policies_per_employee || 1}份（仅校验本平台数据库）`,
            });
          }
        }
      } catch (e) {
        console.error(`解析配置 ${config.config_id} 的拦截规则失败:`, e);
      }
    }
    
    res.json({
      success: true,
      data: rules,
      count: rules.length,
    });
  } catch (error) {
    console.error('获取拦截规则列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取拦截规则列表失败',
      message: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

export default router;

