// 投保单相关路由
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * POST /api/applications
 * 创建投保单
 */
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      company_info,
      product_id,
      plan_instances,
      effective_date,
      expiry_date,
      insured_persons = [], // 被保人列表
    } = req.body;
    
    // 参数验证
    if (!company_info || !product_id || !plan_instances || !effective_date || !expiry_date) {
      return res.status(400).json({
        success: false,
        error: '参数不完整',
      });
    }
    
    // ========== 任务22、23、24、25、26：拦截规则校验 ==========
    // 1. 获取拦截规则配置
    const [productRows] = await connection.execute(
      `SELECT p.*, ic.company_id as insurance_company_id
       FROM insurance_products p
       INNER JOIN insurance_companies ic ON p.company_id = ic.company_id
       WHERE p.product_id = ?`,
      [product_id]
    );
    
    if (productRows.length === 0) {
      return res.status(400).json({
        success: false,
        error: '产品不存在',
      });
    }
    
    const product = productRows[0];
    
    // 获取拦截规则
    const [configRows] = await connection.execute(
      `SELECT intercept_rules_json FROM insurance_api_configs 
       WHERE company_id = ? AND channel_code = 'LEXUAN' AND status = '启用'`,
      [product.insurance_company_id]
    );
    
    let interceptRules = {};
    if (configRows.length > 0 && configRows[0].intercept_rules_json) {
      try {
        interceptRules = JSON.parse(configRows[0].intercept_rules_json);
      } catch (e) {
        console.error('解析拦截规则失败:', e);
      }
    }
    
    // 2. 任务22：地区限制校验
    if (interceptRules.region_restriction && company_info.province) {
      const deniedRegions = interceptRules.region_restriction.denied_regions || [];
      if (deniedRegions.includes(company_info.province)) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: '地区限制',
          message: `该地区（${company_info.province}）暂不支持投保`,
        });
      }
    }
    
    // 3. 任务24：最低在保人数校验
    let totalInsuredCount = 0;
    for (const planInstance of plan_instances) {
      totalInsuredCount += planInstance.insured_count || 0;
    }
    
    if (interceptRules.min_insured_count) {
      const minCount = interceptRules.min_insured_count.min_count || 3;
      if (totalInsuredCount < minCount) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: '人数限制',
          message: `最低在保人数为${minCount}人，当前投保人数为${totalInsuredCount}人`,
        });
      }
    }
    
    // 4. 任务23：年龄限制校验（如果有被保人列表）
    if (interceptRules.age_restriction && insured_persons.length > 0) {
      const minAge = interceptRules.age_restriction.min_age || 16;
      const maxAge = interceptRules.age_restriction.max_age || 65;
      const today = new Date();
      
      for (const person of insured_persons) {
        if (person.id_number && person.birth_date) {
          const birthDate = new Date(person.birth_date);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          if (age < minAge || age > maxAge) {
            await connection.rollback();
            return res.status(400).json({
              success: false,
              error: '年龄限制',
              message: `被保人${person.name || ''}年龄为${age}岁，不在允许范围（${minAge}-${maxAge}周岁）内`,
            });
          }
        }
      }
    }
    
    // 5. 任务25：重复投保校验（仅校验本平台数据库）
    if (interceptRules.duplicate_application_check && insured_persons.length > 0) {
      for (const person of insured_persons) {
        if (person.id_number) {
          // 检查是否有相同身份证号的投保单
          const [existingApps] = await connection.execute(
            `SELECT DISTINCT a.application_no 
             FROM applications a
             INNER JOIN application_plans ap ON a.application_id = ap.application_id
             INNER JOIN plan_instance_liabilities pil ON ap.instance_id = pil.instance_id
             INNER JOIN insured_persons ip ON a.application_id = ip.application_id
             WHERE ip.id_number = ? 
               AND a.status IN ('草稿', '待核保', '已承保')
               AND a.product_id = ?`,
            [person.id_number, product_id]
          );
          
          if (existingApps.length > 0) {
            await connection.rollback();
            return res.status(400).json({
              success: false,
              error: '重复投保',
              message: `被保人${person.name || ''}（身份证号：${person.id_number}）已存在投保记录，不能重复投保`,
            });
          }
        }
      }
    }
    
    // 6. 任务26：投保份数限制校验（仅校验本平台数据库）
    if (interceptRules.policy_limit_check && insured_persons.length > 0) {
      const maxPolicies = interceptRules.policy_limit_check.max_policies_per_employee || 1;
      
      for (const person of insured_persons) {
        if (person.id_number) {
          // 检查该雇员是否已有保单
          const [existingPolicies] = await connection.execute(
            `SELECT COUNT(DISTINCT p.policy_id) as policy_count
             FROM policies p
             INNER JOIN applications a ON p.application_id = a.application_id
             INNER JOIN insured_persons ip ON a.application_id = ip.application_id
             WHERE ip.id_number = ? 
               AND p.status IN ('有效', '已生效')
               AND a.product_id = ?`,
            [person.id_number, product_id]
          );
          
          if (existingPolicies.length > 0 && existingPolicies[0].policy_count >= maxPolicies) {
            await connection.rollback();
            return res.status(400).json({
              success: false,
              error: '投保份数限制',
              message: `被保人${person.name || ''}（身份证号：${person.id_number}）已有${existingPolicies[0].policy_count}份有效保单，最多只能投保${maxPolicies}份`,
            });
          }
        }
      }
    }
    
    // ========== 继续原有逻辑 ==========
    
    // 1. 检查或创建企业客户
    let companyId;
    const [existingCompany] = await connection.execute(
      'SELECT company_id FROM companies WHERE credit_code = ?',
      [company_info.credit_code]
    );
    
    if (existingCompany.length > 0) {
      companyId = existingCompany[0].company_id;
      // 更新企业信息
      await connection.execute(
        `UPDATE companies SET
          company_name = ?,
          province = ?,
          city = ?,
          district = ?,
          address = ?,
          contact_name = ?,
          contact_phone = ?,
          contact_email = ?,
          updated_at = NOW()
        WHERE company_id = ?`,
        [
          company_info.name,
          company_info.province,
          company_info.city || '',
          company_info.district,
          company_info.address,
          company_info.contact_name,
          company_info.contact_phone,
          company_info.contact_email,
          companyId,
        ]
      );
    } else {
      // 创建新企业
      const [result] = await connection.execute(
        `INSERT INTO companies (
          company_name, credit_code, province, city, district, address,
          contact_name, contact_phone, contact_email, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '正常')`,
        [
          company_info.name,
          company_info.credit_code,
          company_info.province,
          company_info.city || '',
          company_info.district,
          company_info.address,
          company_info.contact_name,
          company_info.contact_phone,
          company_info.contact_email,
        ]
      );
      companyId = result.insertId;
    }
    
    // 2. 获取产品详细信息（包含公司代码和名称）
    const [productInfoRows] = await connection.execute(
      `SELECT p.*, ic.company_code, ic.company_name
       FROM insurance_products p
       INNER JOIN insurance_companies ic ON p.company_id = ic.company_id
       WHERE p.product_id = ?`,
      [product_id]
    );
    
    if (productInfoRows.length === 0) {
      throw new Error('产品不存在');
    }
    
    const productInfo = productInfoRows[0];
    
    // 3. 生成投保单号
    const applicationNo = `APP${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // 4. 计算总保费（totalInsuredCount已在上面计算）
    let totalPremium = 0;
    
    // 5. 创建投保单
    const [applicationResult] = await connection.execute(
      `INSERT INTO applications (
        application_no, company_id, product_id, product_name, product_code,
        total_premium, insured_count, effective_date, expiry_date,
        status, insurance_company_code, insurance_company
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '草稿', ?, ?)`,
      [
        applicationNo,
        companyId,
        product_id,
        productInfo.product_name,
        productInfo.product_code,
        totalPremium,
        totalInsuredCount,
        effective_date,
        expiry_date,
        productInfo.company_code,
        productInfo.company_name,
      ]
    );
    
    const applicationId = applicationResult.insertId;
    
    // 6. 创建方案实例和责任选择
    for (const planInstance of plan_instances) {
      // 创建方案实例
      const [planInstanceResult] = await connection.execute(
        `INSERT INTO application_plans (
          application_id, plan_id, plan_name, job_class, duration,
          insured_count, plan_premium
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationId,
          planInstance.plan_id,
          planInstance.plan_name,
          planInstance.job_class,
          planInstance.duration,
          planInstance.insured_count,
          0, // plan_premium 需要计算
        ]
      );
      
      const instanceId = planInstanceResult.insertId;
      
      // 创建责任选择
      for (const liabilitySelection of planInstance.liability_selections) {
        await connection.execute(
          `INSERT INTO plan_instance_liabilities (
            instance_id, liability_id, coverage_amount, coverage_value, unit, is_selected
          ) VALUES (?, ?, ?, ?, ?, TRUE)`,
          [
            instanceId,
            liabilitySelection.liability_id,
            liabilitySelection.coverage_amount,
            liabilitySelection.coverage_value || null,
            liabilitySelection.unit,
          ]
        );
      }
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      data: {
        application_id: applicationId,
        application_no: applicationNo,
        message: '投保单创建成功',
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('创建投保单失败:', error);
    res.status(500).json({
      success: false,
      error: '创建投保单失败',
      message: error.message,
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/applications
 * 获取投保单列表（包括草稿状态）
 * 注意：必须在 /:id 路由之前定义，避免路由冲突
 */
router.get('/', async (req, res) => {
  try {
    console.log('[投保单列表] 收到请求，query参数:', req.query);
    
    const { 
      keyword, 
      status, 
      company_name, 
      product_id,
      start_date,
      end_date,
      page = 1,
      page_size = 20
    } = req.query;
    
    console.log('[投保单列表] 解析后的参数:', { keyword, status, company_name, product_id, start_date, end_date, page, page_size });
    
    let sql = `
      SELECT 
        a.application_id,
        a.application_no,
        a.company_id,
        c.company_name,
        c.credit_code,
        a.product_id,
        a.product_name,
        a.product_code,
        a.total_premium,
        a.insured_count,
        a.effective_date,
        a.expiry_date,
        a.status,
        a.insurance_company_code,
        ic.company_name as insurance_company_name,
        a.created_at,
        a.updated_at,
        a.submitted_at,
        a.underwritten_at
      FROM applications a
      INNER JOIN companies c ON a.company_id = c.company_id
      LEFT JOIN insurance_companies ic ON a.insurance_company_code = ic.company_code
      WHERE 1=1
    `;
    const params = [];
    
    // 关键词搜索（投保单号、企业名称）
    if (keyword) {
      sql += ' AND (a.application_no LIKE ? OR c.company_name LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    // 状态筛选
    if (status) {
      sql += ' AND a.status = ?';
      params.push(String(status));
    }
    
    // 企业名称筛选
    if (company_name) {
      sql += ' AND c.company_name LIKE ?';
      params.push(`%${company_name}%`);
    }
    
    // 产品ID筛选
    if (product_id) {
      sql += ' AND a.product_id = ?';
      params.push(Number(product_id));
    }
    
    // 日期范围筛选
    if (start_date) {
      sql += ' AND a.created_at >= ?';
      params.push(String(start_date));
    }
    if (end_date) {
      sql += ' AND a.created_at <= ?';
      params.push(String(end_date));
    }
    
    // 排序
    sql += ' ORDER BY a.created_at DESC';
    
    // 分页 - 直接拼接数字到SQL中（MySQL2对LIMIT/OFFSET的参数化查询支持有问题）
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(page_size) || 20;
    const offset = (pageNum - 1) * pageSizeNum;
    
    // 确保是正整数，防止SQL注入
    const safeLimit = Math.max(1, Math.floor(pageSizeNum));
    const safeOffset = Math.max(0, Math.floor(offset));
    
    sql += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    
    console.log('[投保单列表] 分页参数:', { page, page_size, pageNum, pageSizeNum, offset, safeLimit, safeOffset });
    console.log('[投保单列表] SQL参数数组:', params);
    console.log('[投保单列表] 最终SQL:', sql);
    
    const [rows] = await pool.execute(sql, params);
    
    // 获取总数
    let countSql = `
      SELECT COUNT(*) as total
      FROM applications a
      INNER JOIN companies c ON a.company_id = c.company_id
      WHERE 1=1
    `;
    const countParams = [];
    
    if (keyword) {
      countSql += ' AND (a.application_no LIKE ? OR c.company_name LIKE ?)';
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (status) {
      countSql += ' AND a.status = ?';
      countParams.push(String(status));
    }
    if (company_name) {
      countSql += ' AND c.company_name LIKE ?';
      countParams.push(`%${company_name}%`);
    }
    if (product_id) {
      countSql += ' AND a.product_id = ?';
      countParams.push(Number(product_id));
    }
    if (start_date) {
      countSql += ' AND a.created_at >= ?';
      countParams.push(String(start_date));
    }
    if (end_date) {
      countSql += ' AND a.created_at <= ?';
      countParams.push(String(end_date));
    }
    
    const [countRows] = await pool.execute(countSql, countParams);
    const total = countRows[0]?.total || 0;
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: parseInt(page),
        page_size: parseInt(page_size),
        total_pages: Math.ceil(total / parseInt(page_size)),
      },
    });
  } catch (error) {
    console.error('获取投保单列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取投保单列表失败',
      message: error.message,
    });
  }
});

/**
 * POST /api/applications/draft
 * 保存投保单草稿（缓存）
 */
router.post('/draft', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      company_info,
      product_id,
      plans,
      employees,
      effective_date,
      expiry_date,
      common_duration,
      selected_plan_ids,
      premiums,
    } = req.body;
    
    // 参数验证
    if (!company_info || !product_id) {
      return res.status(400).json({
        success: false,
        error: '参数不完整：缺少company_info或product_id',
      });
    }
    
    // 获取产品信息
    const [productRows] = await connection.execute(
      `SELECT p.*, ic.company_code as insurance_company_code, ic.company_name as insurance_company_name
       FROM insurance_products p
       INNER JOIN insurance_companies ic ON p.company_id = ic.company_id
       WHERE p.product_id = ?`,
      [product_id]
    );
    
    if (productRows.length === 0) {
      return res.status(400).json({
        success: false,
        error: '产品不存在',
      });
    }
    
    const product = productRows[0];
    
    // 检查或创建企业客户
    let companyId;
    const creditCode = company_info.credit_code || null;
    if (!creditCode) {
      return res.status(400).json({
        success: false,
        error: '参数不完整：缺少credit_code',
      });
    }
    const [existingCompany] = await connection.execute(
      'SELECT company_id FROM companies WHERE credit_code = ?',
      [creditCode]
    );
    
    if (existingCompany.length > 0) {
      companyId = existingCompany[0].company_id;
      // 更新企业信息
      await connection.execute(
        `UPDATE companies SET 
          company_name = ?,
          province = ?,
          city = ?,
          district = ?,
          address = ?,
          contact_name = ?,
          contact_phone = ?,
          contact_email = ?,
          updated_at = CURRENT_TIMESTAMP
         WHERE company_id = ?`,
        [
          company_info.name || null,
          company_info.province || null,
          company_info.city || null,
          company_info.district || null,
          company_info.address || null,
          company_info.contact_name || null,
          company_info.contact_phone || null,
          company_info.contact_email || null,
          companyId
        ]
      );
    } else {
      // 创建新企业
      const [insertResult] = await connection.execute(
        `INSERT INTO companies (
          company_name, credit_code, province, city, district, address,
          contact_name, contact_phone, contact_email, industry, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '启用')`,
        [
          company_info.name,
          company_info.credit_code,
          company_info.province || '',
          company_info.city || '',
          company_info.district || '',
          company_info.address || '',
          company_info.contact_name || '',
          company_info.contact_phone || '',
          company_info.contact_email || '',
          company_info.industry || ''
        ]
      );
      companyId = insertResult.insertId;
    }
    
    // 计算总保费和总人数
    const totalPremium = plans?.reduce((sum, plan) => {
      return sum + (plan.totalPremium || 0);
    }, 0) || 0;
    
    const totalInsuredCount = employees?.length || 0;
    
    // 生成投保单号
    const applicationNo = `APP${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // 构建草稿数据（JSON格式）
    const draftData = {
      company_info,
      product_id,
      plans: plans || [],
      employees: employees || [],
      effective_date,
      expiry_date,
      common_duration,
      selected_plan_ids: selected_plan_ids || {},
      premiums: premiums || {},
    };
    
    // 创建或更新草稿（如果已存在该企业的草稿，检查是否有修改）
    const [existingDraft] = await connection.execute(
      `SELECT application_id, draft_data FROM applications 
       WHERE company_id = ? AND product_id = ? AND status = '草稿'
       ORDER BY created_at DESC LIMIT 1`,
      [companyId, product_id]
    );
    
    let applicationId;
    let isNewDraft = false;
    
    if (existingDraft.length > 0) {
      // 检查是否有修改：比较新的draftData和旧的draft_data
      const oldDraftDataStr = existingDraft[0].draft_data;
      let oldDraftData = {};
      
      try {
        if (oldDraftDataStr) {
          oldDraftData = JSON.parse(oldDraftDataStr);
        }
      } catch (e) {
        console.error('解析旧草稿数据失败:', e);
      }
      
      // 比较关键字段是否有变化（使用JSON字符串比较，简单高效）
      const newDraftDataStr = JSON.stringify(draftData);
      const oldDraftDataStrNormalized = JSON.stringify(oldDraftData);
      const hasChanges = newDraftDataStr !== oldDraftDataStrNormalized;
      
      if (hasChanges) {
        // 有修改，创建新的草稿记录
        isNewDraft = true;
        const applicationNo = `APP${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        // 更新企业信息（包括省市区）
        await connection.execute(
          `UPDATE companies SET 
            company_name = ?,
            province = ?,
            city = ?,
            district = ?,
            address = ?,
            contact_name = ?,
            contact_phone = ?,
            contact_email = ?,
            updated_at = CURRENT_TIMESTAMP
           WHERE company_id = ?`,
          [
            company_info.name || null,
            company_info.province || null,
            company_info.city || null,
            company_info.district || null,
            company_info.address || null,
            company_info.contact_name || null,
            company_info.contact_phone || null,
            company_info.contact_email || null,
            companyId
          ]
        );
        
        // 创建新的草稿记录
        const [insertResult] = await connection.execute(
          `INSERT INTO applications (
            application_no, company_id, product_id, product_name, product_code,
            total_premium, insured_count, effective_date, expiry_date,
            status, draft_data, insurance_company_code
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '草稿', ?, ?)`,
          [
            applicationNo,
            companyId,
            product_id,
            product.product_name || null,
            product.product_code || null,
            totalPremium || 0,
            totalInsuredCount || 0,
            effective_date || null,
            expiry_date || null,
            JSON.stringify(draftData),
            product.insurance_company_code || null
          ]
        );
        applicationId = insertResult.insertId;
      } else {
        // 没有修改，只更新缓存时间
        applicationId = existingDraft[0].application_id;
        await connection.execute(
          `UPDATE applications SET updated_at = CURRENT_TIMESTAMP WHERE application_id = ?`,
          [applicationId]
        );
      }
    } else {
      // 创建新草稿
      const [insertResult] = await connection.execute(
        `INSERT INTO applications (
          application_no, company_id, product_id, product_name, product_code,
          total_premium, insured_count, effective_date, expiry_date,
          status, draft_data, insurance_company_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '草稿', ?, ?)`,
        [
          applicationNo,
          companyId,
          product_id,
          product.product_name || null,
          product.product_code || null,
          totalPremium || 0,
          totalInsuredCount || 0,
          effective_date || null,
          expiry_date || null,
          JSON.stringify(draftData),
          product.insurance_company_code || null
        ]
      );
      applicationId = insertResult.insertId;
    }
    
    await connection.commit();
    
    let message = '草稿已保存';
    if (existingDraft.length > 0) {
      if (isNewDraft) {
        message = '检测到修改，已创建新的草稿记录';
      } else {
        message = '未检测到修改，已更新缓存时间';
      }
    }
    
    res.json({
      success: true,
      data: {
        application_id: applicationId,
        application_no: applicationNo || `APP${Date.now()}`,
        message: message,
        is_new: isNewDraft,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('保存草稿失败:', error);
    res.status(500).json({
      success: false,
      error: '保存草稿失败',
      message: error.message,
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/applications/drafts
 * 获取草稿列表（按企业分组）
 */
router.get('/drafts', async (req, res) => {
  try {
    const { company_name, credit_code } = req.query;
    
    let sql = `
      SELECT 
        a.application_id,
        a.application_no,
        a.company_id,
        c.company_name,
        c.credit_code,
        a.product_id,
        a.product_name,
        a.total_premium,
        a.insured_count,
        a.effective_date,
        a.expiry_date,
        a.created_at,
        a.updated_at
      FROM applications a
      INNER JOIN companies c ON a.company_id = c.company_id
      WHERE a.status = '草稿'
    `;
    const params = [];
    
    if (company_name) {
      sql += ' AND c.company_name LIKE ?';
      params.push(`%${company_name}%`);
    }
    
    if (credit_code) {
      sql += ' AND c.credit_code = ?';
      params.push(credit_code);
    }
    
    sql += ' ORDER BY a.updated_at DESC';
    
    const [rows] = await pool.execute(sql, params);
    
    // 按企业分组
    const groupedByCompany = {};
    rows.forEach((row) => {
      if (!groupedByCompany[row.company_id]) {
        groupedByCompany[row.company_id] = {
          company_id: row.company_id,
          company_name: row.company_name,
          credit_code: row.credit_code,
          products: [],
        };
      }
      
      // 检查该产品是否已存在
      const existingProduct = groupedByCompany[row.company_id].products.find(
        (p) => p.product_id === row.product_id
      );
      
      if (!existingProduct) {
        groupedByCompany[row.company_id].products.push({
          product_id: row.product_id,
          product_name: row.product_name,
          drafts: [],
        });
      }
      
      // 添加草稿记录
      const product = groupedByCompany[row.company_id].products.find(
        (p) => p.product_id === row.product_id
      );
      product.drafts.push({
        application_id: row.application_id,
        application_no: row.application_no,
        total_premium: row.total_premium,
        insured_count: row.insured_count,
        effective_date: row.effective_date,
        expiry_date: row.expiry_date,
        created_at: row.created_at,
        updated_at: row.updated_at,
      });
    });
    
    res.json({
      success: true,
      data: Object.values(groupedByCompany),
      count: Object.keys(groupedByCompany).length,
    });
  } catch (error) {
    console.error('获取草稿列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取草稿列表失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/applications/drafts/:id
 * 获取草稿详情
 */
router.get('/drafts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT 
        a.*,
        c.company_name,
        c.credit_code
       FROM applications a
       INNER JOIN companies c ON a.company_id = c.company_id
       WHERE a.application_id = ? AND a.status = '草稿'`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '草稿不存在',
      });
    }
    
    const application = rows[0];
    
    // 解析draft_data
    let draftData = {};
    if (application.draft_data) {
      try {
        draftData = JSON.parse(application.draft_data);
      } catch (e) {
        console.error('解析draft_data失败:', e);
      }
    }
    
    res.json({
      success: true,
      data: {
        ...application,
        draft_data: draftData,
      },
    });
  } catch (error) {
    console.error('获取草稿详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取草稿详情失败',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/applications/drafts/:id
 * 删除草稿
 */
router.delete('/drafts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM applications WHERE application_id = ? AND status = \'草稿\'',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: '草稿不存在或已被删除',
      });
    }
    
    res.json({
      success: true,
      message: '草稿已删除',
    });
  } catch (error) {
    console.error('删除草稿失败:', error);
    res.status(500).json({
      success: false,
      error: '删除草稿失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/applications/:id
 * 获取投保单详情
 * 注意：必须在 /drafts 路由之后定义，避免路由冲突
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT * FROM applications WHERE application_id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '投保单不存在',
      });
    }
    
    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('获取投保单详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取投保单详情失败',
      message: error.message,
    });
  }
});

/**
 * POST /api/applications/:id/underwriting
 * 提交核保
 */
router.post('/:id/underwriting', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 更新投保单状态
    await pool.execute(
      `UPDATE applications 
       SET status = '待核保', submitted_at = NOW()
       WHERE application_id = ?`,
      [id]
    );
    
    res.json({
      success: true,
      message: '核保申请已提交',
    });
  } catch (error) {
    console.error('提交核保失败:', error);
    res.status(500).json({
      success: false,
      error: '提交核保失败',
      message: error.message,
    });
  }
});

export default router;

