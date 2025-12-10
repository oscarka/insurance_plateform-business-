// 职业分类相关路由
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/occupations/levels
 * 获取职业的一级分类（行业大分类）
 * 查询参数: company_id, product_id (可选，如果提供product_id，会自动查询对应的company_id)
 */
router.get('/levels', async (req, res) => {
  try {
    const { company_id, product_id, status = '启用' } = req.query;
    
    console.log('=== [职业API] 获取职业一级分类 ===');
    console.log('请求参数:', { company_id, product_id, status });
    
    let sql = `
      SELECT DISTINCT
        industry_large_code,
        industry_large_name
      FROM occupation_categories
      WHERE status = ?
    `;
    const params = [status];
    
    // 如果提供了product_id，先查询对应的company_id
    let actualCompanyId = company_id;
    if (product_id && !company_id) {
      console.log(`[职业API] 根据product_id=${product_id}查询company_id...`);
      const [productRows] = await pool.execute(
        'SELECT company_id FROM insurance_products WHERE product_id = ?',
        [product_id]
      );
      console.log(`[职业API] 产品查询结果数量: ${productRows.length}`);
      if (productRows.length > 0) {
        actualCompanyId = productRows[0].company_id;
        console.log(`[职业API] ✅ 找到对应的company_id: ${actualCompanyId}`);
      } else {
        console.log(`[职业API] ⚠️ 未找到product_id=${product_id}对应的产品`);
      }
    }
    
    if (actualCompanyId) {
      sql += ' AND company_id = ?';
      params.push(actualCompanyId);
      console.log(`[职业API] 添加company_id过滤条件: ${actualCompanyId}`);
    } else {
      console.log('[职业API] ⚠️ 没有company_id，将查询所有公司的职业数据');
    }
    
    sql += ' ORDER BY industry_large_code';
    
    console.log('[职业API] 执行SQL:', sql);
    console.log('[职业API] SQL参数:', params);
    
    const [rows] = await pool.execute(sql, params);
    
    console.log(`[职业API] 查询结果数量: ${rows.length}`);
    if (rows.length > 0) {
      console.log('[职业API] 前3条结果:', rows.slice(0, 3));
    } else {
      // 检查是否有数据但没有匹配的company_id
      console.log('[职业API] ⚠️ 查询结果为空，开始诊断...');
      const [allRows] = await pool.execute(
        'SELECT DISTINCT company_id, COUNT(*) as count FROM occupation_categories WHERE status = ? GROUP BY company_id',
        [status]
      );
      console.log('[职业API] 数据库中所有公司的职业数据统计:', JSON.stringify(allRows, null, 2));
      
      // 检查是否有任何职业数据
      const [totalCount] = await pool.execute(
        'SELECT COUNT(*) as total FROM occupation_categories WHERE status = ?',
        [status]
      );
      console.log('[职业API] 数据库中职业数据总数:', totalCount[0]?.total || 0);
      
      // 如果提供了company_id，检查该company_id是否有数据
      if (actualCompanyId) {
        const [companyCount] = await pool.execute(
          'SELECT COUNT(*) as total FROM occupation_categories WHERE status = ? AND company_id = ?',
          [status, actualCompanyId]
        );
        console.log(`[职业API] company_id=${actualCompanyId}的职业数据数量:`, companyCount[0]?.total || 0);
      }
    }
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('[职业API] ❌ 获取职业一级分类失败:', error);
    res.status(500).json({
      success: false,
      error: '获取职业一级分类失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/occupations/categories
 * 获取职业的二级分类（行业中分类）
 * 查询参数: company_id, product_id, industry_large_code, status
 */
router.get('/categories', async (req, res) => {
  try {
    const { company_id, product_id, industry_large_code, status = '启用' } = req.query;
    
    if (!industry_large_code) {
      return res.status(400).json({
        success: false,
        error: '缺少参数: industry_large_code',
      });
    }
    
    // 如果提供了product_id，先查询对应的company_id
    let actualCompanyId = company_id;
    if (product_id && !company_id) {
      const [productRows] = await pool.execute(
        'SELECT company_id FROM insurance_products WHERE product_id = ?',
        [product_id]
      );
      if (productRows.length > 0) {
        actualCompanyId = productRows[0].company_id;
      }
    }
    
    let sql = `
      SELECT DISTINCT
        industry_medium_code,
        industry_medium_name
      FROM occupation_categories
      WHERE status = ? AND industry_large_code = ?
    `;
    const params = [status, industry_large_code];
    
    if (actualCompanyId) {
      sql += ' AND company_id = ?';
      params.push(actualCompanyId);
    }
    
    sql += ' ORDER BY industry_medium_code';
    
    const [rows] = await pool.execute(sql, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('获取职业二级分类失败:', error);
    res.status(500).json({
      success: false,
      error: '获取职业二级分类失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/occupations/details
 * 获取职业的三级分类（具体职业）
 * 查询参数: company_id, product_id, industry_large_code, industry_medium_code, status
 */
router.get('/details', async (req, res) => {
  try {
    const { 
      company_id,
      product_id,
      industry_large_code, 
      industry_medium_code, 
      status = '启用' 
    } = req.query;
    
    if (!industry_large_code || !industry_medium_code) {
      return res.status(400).json({
        success: false,
        error: '缺少参数: industry_large_code 和 industry_medium_code',
      });
    }
    
    // 如果提供了product_id，先查询对应的company_id
    let actualCompanyId = company_id;
    if (product_id && !company_id) {
      const [productRows] = await pool.execute(
        'SELECT company_id FROM insurance_products WHERE product_id = ?',
        [product_id]
      );
      if (productRows.length > 0) {
        actualCompanyId = productRows[0].company_id;
      }
    }
    
    let sql = `
      SELECT 
        occupation_id,
        occupation_detail_code,
        occupation_detail_name,
        occupation_level,
        industry_small_name
      FROM occupation_categories
      WHERE status = ? 
        AND industry_large_code = ? 
        AND industry_medium_code = ?
    `;
    const params = [status, industry_large_code, industry_medium_code];
    
    if (actualCompanyId) {
      sql += ' AND company_id = ?';
      params.push(actualCompanyId);
    }
    
    sql += ' ORDER BY occupation_detail_code';
    
    const [rows] = await pool.execute(sql, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('获取职业三级分类失败:', error);
    res.status(500).json({
      success: false,
      error: '获取职业三级分类失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/occupations/search
 * 搜索职业（支持按职业名称或代码搜索）
 * 查询参数: keyword, company_id, status
 */
router.get('/search', async (req, res) => {
  try {
    const { keyword, company_id, status = '启用' } = req.query;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: '缺少参数: keyword',
      });
    }
    
    let sql = `
      SELECT 
        occupation_id,
        occupation_detail_code,
        occupation_detail_name,
        occupation_level,
        industry_large_name,
        industry_medium_name,
        industry_small_name
      FROM occupation_categories
      WHERE status = ?
        AND (
          occupation_detail_name LIKE ?
          OR occupation_detail_code LIKE ?
        )
    `;
    const searchPattern = `%${keyword}%`;
    const params = [status, searchPattern, searchPattern];
    
    if (company_id) {
      sql += ' AND company_id = ?';
      params.push(company_id);
    }
    
    sql += ' ORDER BY occupation_detail_code LIMIT 50';
    
    const [rows] = await pool.execute(sql, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('搜索职业失败:', error);
    res.status(500).json({
      success: false,
      error: '搜索职业失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/occupations/:code
 * 根据职业代码获取职业详情
 */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { company_id } = req.query;
    
    let sql = `
      SELECT 
        occupation_id,
        occupation_detail_code,
        occupation_detail_name,
        occupation_level,
        industry_large_name,
        industry_medium_name,
        industry_small_name,
        company_id
      FROM occupation_categories
      WHERE occupation_detail_code = ? AND status = '启用'
    `;
    const params = [code];
    
    if (company_id) {
      sql += ' AND company_id = ?';
      params.push(company_id);
    }
    
    const [rows] = await pool.execute(sql, params);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '职业不存在',
      });
    }
    
    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('获取职业详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取职业详情失败',
      message: error.message,
    });
  }
});

export default router;

