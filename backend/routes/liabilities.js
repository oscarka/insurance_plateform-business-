// 责任相关路由
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/liabilities
 * 获取责任列表（支持按保司筛选）
 */
router.get('/', async (req, res) => {
  try {
    const { company_id, is_additional } = req.query;
    
    let sql = `
      SELECT 
        cl.liability_id,
        cl.company_id,
        cl.liability_code,
        cl.liability_name,
        cl.liability_type,
        cl.unit_type,
        cl.description,
        cl.is_additional,
        cl.clause_id,
        cl.status,
        ic.company_name,
        ic.company_code,
        ins_cl.clause_name as clause_name,
        ins_cl.clause_code as clause_code
      FROM company_liabilities cl
      INNER JOIN insurance_companies ic ON cl.company_id = ic.company_id
      LEFT JOIN insurance_clauses ins_cl ON cl.clause_id = ins_cl.clause_id
      WHERE 1=1
    `;
    const params = [];
    
    if (company_id) {
      sql += ' AND cl.company_id = ?';
      params.push(company_id);
    }
    
    if (is_additional !== undefined) {
      sql += ' AND cl.is_additional = ?';
      params.push(is_additional === 'true' || is_additional === '1' ? 1 : 0);
    }
    
    sql += ' ORDER BY cl.is_additional, cl.liability_code';
    
    const [rows] = await pool.execute(sql, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('获取责任列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取责任列表失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/liabilities/:id
 * 获取责任详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT 
        cl.*,
        ic.company_name,
        ic.company_code,
        ins_cl.clause_name,
        ins_cl.clause_code
      FROM company_liabilities cl
      INNER JOIN insurance_companies ic ON cl.company_id = ic.company_id
      LEFT JOIN insurance_clauses ins_cl ON cl.clause_id = ins_cl.clause_id
      WHERE cl.liability_id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '责任不存在',
      });
    }
    
    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('获取责任详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取责任详情失败',
      message: error.message,
    });
  }
});

export default router;

