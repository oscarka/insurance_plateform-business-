// 地区相关路由
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/regions
 * 获取地区列表（支持按级别和父级筛选）
 * 查询参数: level, parent_id, parent_code, status
 */
router.get('/', async (req, res) => {
  try {
    const { level, parent_id, parent_code, status = '启用' } = req.query;
    
    let sql = `
      SELECT 
        region_id,
        region_code,
        region_name,
        region_level,
        parent_id,
        parent_code,
        sort_order,
        status
      FROM regions
      WHERE status = ?
    `;
    const params = [status];
    
    if (level) {
      sql += ' AND region_level = ?';
      params.push(level);
    }
    
    if (parent_id) {
      sql += ' AND parent_id = ?';
      params.push(parent_id);
    }
    
    if (parent_code) {
      sql += ' AND parent_code = ?';
      params.push(parent_code);
    }
    
    sql += ' ORDER BY sort_order, region_id';
    
    const [rows] = await pool.execute(sql, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('获取地区列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取地区列表失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/regions/provinces
 * 获取所有省份
 */
router.get('/provinces', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT region_id, region_code, region_name 
       FROM regions 
       WHERE region_level = 1 AND status = '启用'
       ORDER BY sort_order, region_id`
    );
    
    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('获取省份列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取省份列表失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/regions/:id
 * 获取地区详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT * FROM regions WHERE region_id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '地区不存在',
      });
    }
    
    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('获取地区详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取地区详情失败',
      message: error.message,
    });
  }
});

export default router;
