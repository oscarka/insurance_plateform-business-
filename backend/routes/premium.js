// 保费计算相关路由
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * POST /api/premium/calculate
 * 计算保费
 * 
 * 请求体:
 * {
 *   product_id: number,
 *   plan_id: number,
 *   liability_selections: [
 *     { liability_id: number, coverage_amount: string }
 *   ],
 *   job_class: string,
 *   insured_count: number
 * }
 */
router.post('/calculate', async (req, res) => {
  try {
    const { product_id, plan_id, liability_selections, job_class, insured_count, duration } = req.body;
    
    console.log(`[后端] 收到保费计算请求:`, {
      product_id,
      plan_id,
      duration: `"${duration}" (类型: ${typeof duration})`,
      insured_count,
      job_class,
    });
    
    // 参数验证
    if (!product_id || !plan_id || !insured_count) {
      return res.status(400).json({
        success: false,
        error: '参数不完整',
      });
    }
    
    // 首先检查是否有方案固定保费
    const [fixedPremiumRows] = await pool.execute(
      `SELECT 
        monthly_premium,
        annual_premium,
        premium_type
      FROM premium_rates
      WHERE product_id = ?
        AND plan_id = ?
        AND premium_type = '固定保费'
        AND status = '启用'
      LIMIT 1`,
      [product_id, plan_id]
    );
    
    // 如果有固定保费，直接使用固定保费
    if (fixedPremiumRows.length > 0) {
      const fixedPremium = fixedPremiumRows[0];
      // 判断是否为年保费：包含"年"字，或者"12个月"
      // 注意：duration可能是"1年"、"1个月"等格式
      const durationStr = String(duration || '').trim();
      // 明确判断：如果包含"个月"且不是"12个月"，则是月保费；否则如果是"年"或"12个月"则是年保费
      const isMonthly = durationStr.includes('个月') && durationStr !== '12个月';
      const isAnnual = !isMonthly && (durationStr.includes('年') || durationStr === '12个月');
      const premiumPerPerson = isAnnual ? fixedPremium.annual_premium : fixedPremium.monthly_premium;
      console.log(`[保费计算] 保障期限: "${duration}" (类型: ${typeof duration}, 字符串: "${durationStr}"), 是否月保费: ${isMonthly}, 是否年保费: ${isAnnual}, 月保费: ${fixedPremium.monthly_premium}, 年保费: ${fixedPremium.annual_premium}, 计算后保费: ${premiumPerPerson}`);
      const totalPremiumAmount = premiumPerPerson * insured_count;
      
      return res.json({
        success: true,
        data: {
          premium_per_person: Math.round(premiumPerPerson * 100) / 100,
          total_premium: Math.round(totalPremiumAmount * 100) / 100,
          insured_count,
          premium_type: '固定保费',
          premium_details: [{
            type: '固定保费',
            premium_per_person: premiumPerPerson,
            duration: duration || '1年',
          }],
        },
      });
    }
    
    // 如果没有固定保费，使用费率计算方式
    if (!liability_selections || !job_class) {
      return res.status(400).json({
        success: false,
        error: '参数不完整（费率计算需要liability_selections和job_class）',
      });
    }
    
    let totalPremium = 0;
    const premiumDetails = [];
    
    // 为每个责任计算保费
    for (const selection of liability_selections) {
      const { liability_id, coverage_amount } = selection;
      
      // 查询费率
      const [rateRows] = await pool.execute(
        `SELECT 
          base_rate,
          rate_factor,
          min_premium,
          max_premium
        FROM premium_rates
        WHERE product_id = ?
          AND liability_id = ?
          AND job_class = ?
          AND coverage_amount = ?
          AND premium_type = '费率计算'
          AND status = '启用'
          AND (expiry_date IS NULL OR expiry_date >= CURDATE())
          AND effective_date <= CURDATE()
        ORDER BY effective_date DESC
        LIMIT 1`,
        [product_id, liability_id, job_class, coverage_amount]
      );
      
      if (rateRows.length === 0) {
        console.warn(`未找到费率: product_id=${product_id}, liability_id=${liability_id}, job_class=${job_class}, coverage_amount=${coverage_amount}`);
        continue;
      }
      
      const rate = rateRows[0];
      let premium = rate.base_rate * rate.rate_factor;
      
      // 应用最低/最高保费限制
      if (rate.min_premium && premium < rate.min_premium) {
        premium = rate.min_premium;
      }
      if (rate.max_premium && premium > rate.max_premium) {
        premium = rate.max_premium;
      }
      
      premiumDetails.push({
        liability_id,
        coverage_amount,
        base_rate: rate.base_rate,
        rate_factor: rate.rate_factor,
        premium,
      });
      
      totalPremium += premium;
    }
    
    // 计算总保费
    const premiumPerPerson = totalPremium;
    const totalPremiumAmount = premiumPerPerson * insured_count;
    
    res.json({
      success: true,
      data: {
        premium_per_person: Math.round(premiumPerPerson * 100) / 100,
        total_premium: Math.round(totalPremiumAmount * 100) / 100,
        insured_count,
        premium_type: '费率计算',
        premium_details: premiumDetails,
      },
    });
  } catch (error) {
    console.error('计算保费失败:', error);
    res.status(500).json({
      success: false,
      error: '计算保费失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/premium/rates
 * 查询费率
 * 查询参数: product_id, liability_id, job_class, coverage_amount
 */
router.get('/rates', async (req, res) => {
  try {
    const { product_id, liability_id, job_class, coverage_amount } = req.query;
    
    if (!product_id || !liability_id || !job_class || !coverage_amount) {
      return res.status(400).json({
        success: false,
        error: '参数不完整',
      });
    }
    
    const [rows] = await pool.execute(
      `SELECT 
        rate_id,
        base_rate,
        rate_factor,
        min_premium,
        max_premium,
        effective_date,
        expiry_date
      FROM premium_rates
      WHERE product_id = ?
        AND liability_id = ?
        AND job_class = ?
        AND coverage_amount = ?
        AND status = '启用'
        AND (expiry_date IS NULL OR expiry_date >= CURDATE())
        AND effective_date <= CURDATE()
      ORDER BY effective_date DESC
      LIMIT 1`,
      [product_id, liability_id, job_class, coverage_amount]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '未找到费率',
      });
    }
    
    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('查询费率失败:', error);
    res.status(500).json({
      success: false,
      error: '查询费率失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/premium/rates/list
 * 获取费率列表
 * 查询参数: product_id (可选), plan_id (可选), premium_type (可选)
 * 
 * 逻辑：如果产品有固定保费的方案，则不显示该产品的费率计算记录
 */
router.get('/rates/list', async (req, res) => {
  try {
    const { product_id, plan_id, premium_type } = req.query;
    
    // 首先找出有固定保费方案的产品ID列表
    const [fixedPremiumProducts] = await pool.execute(
      `SELECT DISTINCT product_id 
       FROM premium_rates 
       WHERE premium_type = '固定保费' 
         AND status = '启用'
         AND plan_id IS NOT NULL`
    );
    
    const fixedPremiumProductIds = fixedPremiumProducts.map((row) => row.product_id);
    
    let query = `
      SELECT 
        pr.rate_id,
        pr.product_id,
        ip.product_name,
        pr.plan_id,
        pp.plan_name,
        pr.liability_id,
        cl.liability_name,
        pr.job_class,
        pr.coverage_amount,
        pr.base_rate,
        pr.rate_factor,
        pr.monthly_premium,
        pr.annual_premium,
        pr.premium_type,
        pr.min_premium,
        pr.max_premium,
        pr.effective_date,
        pr.expiry_date,
        pr.status
      FROM premium_rates pr
      LEFT JOIN insurance_products ip ON pr.product_id = ip.product_id
      LEFT JOIN product_plans pp ON pr.plan_id = pp.plan_id
      LEFT JOIN company_liabilities cl ON pr.liability_id = cl.liability_id
      WHERE pr.status = '启用'
    `;
    
    const params = [];
    
    // 如果产品有固定保费方案，则过滤掉该产品的费率计算记录
    if (fixedPremiumProductIds.length > 0) {
      const placeholders = fixedPremiumProductIds.map(() => '?').join(',');
      query += ` AND NOT (pr.product_id IN (${placeholders}) AND pr.premium_type = '费率计算' AND pr.plan_id IS NULL)`;
      params.push(...fixedPremiumProductIds);
    }
    
    if (product_id) {
      query += ' AND pr.product_id = ?';
      params.push(product_id);
    }
    
    if (plan_id) {
      query += ' AND pr.plan_id = ?';
      params.push(plan_id);
    }
    
    if (premium_type) {
      query += ' AND pr.premium_type = ?';
      params.push(premium_type);
    }
    
    query += ' ORDER BY pr.product_id, pr.plan_id, pr.liability_id, pr.job_class, pr.rate_id';
    
    const [rows] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('获取费率列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取费率列表失败',
      message: error.message,
    });
  }
});

export default router;

