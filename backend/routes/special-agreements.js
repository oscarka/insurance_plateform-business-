// 特别约定相关路由
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/special-agreements
 * 获取特别约定列表（支持按保司、责任筛选）
 */
router.get('/', async (req, res) => {
  try {
    const { company_id, liability_id, is_linked } = req.query;
    
    let sql = `
      SELECT 
        sa.agreement_id,
        sa.company_id,
        sa.product_id,
        sa.plan_id,
        sa.clause_id,
        sa.liability_id,
        sa.agreement_code,
        sa.agreement_name,
        sa.agreement_content,
        sa.registration_no,
        sa.is_linked,
        sa.link_type,
        sa.display_order,
        sa.status,
        ic.company_name,
        ic.company_code,
        ins_cl.clause_name,
        ins_cl.clause_code,
        cl.liability_name,
        cl.liability_code
      FROM special_agreements sa
      INNER JOIN insurance_companies ic ON sa.company_id = ic.company_id
      LEFT JOIN insurance_clauses ins_cl ON sa.clause_id = ins_cl.clause_id
      LEFT JOIN company_liabilities cl ON sa.liability_id = cl.liability_id
      WHERE 1=1
    `;
    const params = [];
    
    if (company_id) {
      sql += ' AND sa.company_id = ?';
      params.push(company_id);
    }
    
    if (liability_id) {
      sql += ' AND sa.liability_id = ?';
      params.push(liability_id);
    }
    
    if (is_linked !== undefined) {
      sql += ' AND sa.is_linked = ?';
      params.push(is_linked === 'true' || is_linked === '1' ? 1 : 0);
    }
    
    sql += ' ORDER BY sa.display_order, sa.agreement_id';
    
    const [rows] = await pool.execute(sql, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('获取特别约定列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取特别约定列表失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/special-agreements/:id
 * 获取特别约定详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT 
        sa.*,
        ic.company_name,
        ic.company_code,
        ins_cl.clause_name,
        ins_cl.clause_code,
        cl.liability_name,
        cl.liability_code
      FROM special_agreements sa
      INNER JOIN insurance_companies ic ON sa.company_id = ic.company_id
      LEFT JOIN insurance_clauses ins_cl ON sa.clause_id = ins_cl.clause_id
      LEFT JOIN company_liabilities cl ON sa.liability_id = cl.liability_id
      WHERE sa.agreement_id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '特别约定不存在',
      });
    }
    
    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('获取特别约定详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取特别约定详情失败',
      message: error.message,
    });
  }
});

export default router;

