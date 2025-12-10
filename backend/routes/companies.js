// 保司相关路由
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/insurance-companies
 * 获取保司列表
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        company_id,
        company_code,
        company_name,
        contact_name,
        contact_phone,
        contact_email,
        status
      FROM insurance_companies
      ORDER BY created_at DESC`
    );
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('获取保司列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取保司列表失败',
      message: error.message,
    });
  }
});

export default router;

