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
 * GET /api/applications/:id
 * 获取投保单详情
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

