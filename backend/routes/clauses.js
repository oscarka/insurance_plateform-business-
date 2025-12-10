// 条款相关路由
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/clauses
 * 获取条款列表（支持按保司、类型筛选）
 */
router.get('/', async (req, res) => {
  try {
    const { company_id, clause_type } = req.query;
    
    let sql = `
      SELECT 
        c.clause_id,
        c.company_id,
        c.clause_code,
        c.clause_name,
        c.clause_type,
        c.registration_no,
        c.clause_content,
        c.status,
        ic.company_name,
        ic.company_code
      FROM insurance_clauses c
      INNER JOIN insurance_companies ic ON c.company_id = ic.company_id
      WHERE 1=1
    `;
    const params = [];
    
    if (company_id) {
      sql += ' AND c.company_id = ?';
      params.push(company_id);
    }
    
    if (clause_type) {
      sql += ' AND c.clause_type = ?';
      params.push(clause_type);
    }
    
    sql += ' ORDER BY c.clause_type, c.clause_code';
    
    const [rows] = await pool.execute(sql, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('获取条款列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取条款列表失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/clauses/:id
 * 获取条款详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT 
        c.*,
        ic.company_name,
        ic.company_code
      FROM insurance_clauses c
      INNER JOIN insurance_companies ic ON c.company_id = ic.company_id
      WHERE c.clause_id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '条款不存在',
      });
    }
    
    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('获取条款详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取条款详情失败',
      message: error.message,
    });
  }
});

export default router;

