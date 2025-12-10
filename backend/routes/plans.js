// 方案相关路由
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/plans/:id
 * 获取方案详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT 
        p.*,
        pr.product_name,
        pr.product_code,
        ic.company_code,
        ic.company_name
      FROM product_plans p
      INNER JOIN insurance_products pr ON p.product_id = pr.product_id
      INNER JOIN insurance_companies ic ON pr.company_id = ic.company_id
      WHERE p.plan_id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '方案不存在',
      });
    }
    
    const plan = rows[0];
    plan.duration_options = JSON.parse(plan.duration_options || '[]');
    
    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('获取方案详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取方案详情失败',
      message: error.message,
    });
  }
});

/**
 * GET /api/plans/:id/liabilities
 * 获取方案的责任配置（包含保额选项）
 */
router.get('/:id/liabilities', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT 
        pl.id,
        pl.plan_id,
        pl.liability_id,
        pl.is_required,
        pl.coverage_options,
        pl.default_coverage,
        pl.min_coverage,
        pl.max_coverage,
        pl.unit,
        pl.display_order,
        cl.liability_code,
        cl.liability_name,
        cl.liability_type,
        cl.unit_type
      FROM plan_liabilities pl
      INNER JOIN company_liabilities cl ON pl.liability_id = cl.liability_id
      WHERE pl.plan_id = ?
      ORDER BY pl.display_order, pl.id`,
      [id]
    );
    
    // 解析JSON字段
    const liabilities = rows.map(liability => ({
      id: liability.id,
      liability_id: liability.liability_id,
      liability_code: liability.liability_code,
      liability_name: liability.liability_name,
      liability_type: liability.liability_type,
      unit_type: liability.unit_type,
      is_required: Boolean(liability.is_required),
      coverage_options: JSON.parse(liability.coverage_options || '[]'),
      default_coverage: liability.default_coverage,
      min_coverage: liability.min_coverage,
      max_coverage: liability.max_coverage,
      unit: liability.unit,
      display_order: liability.display_order,
    }));
    
    res.json({
      success: true,
      data: liabilities,
      count: liabilities.length,
    });
  } catch (error) {
    console.error('获取方案责任配置失败:', error);
    res.status(500).json({
      success: false,
      error: '获取方案责任配置失败',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/plans/:planId/liabilities/:liabilityId
 * 删除方案的责任配置
 */
router.delete('/:planId/liabilities/:liabilityId', async (req, res) => {
  try {
    const { planId, liabilityId } = req.params;
    
    // 验证责任配置是否存在
    const [rows] = await pool.execute(
      'SELECT id FROM plan_liabilities WHERE plan_id = ? AND id = ?',
      [planId, liabilityId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '责任配置不存在',
      });
    }
    
    // 删除责任配置
    await pool.execute(
      'DELETE FROM plan_liabilities WHERE plan_id = ? AND id = ?',
      [planId, liabilityId]
    );
    
    res.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除方案责任配置失败:', error);
    res.status(500).json({
      success: false,
      error: '删除方案责任配置失败',
      message: error.message,
    });
  }
});

export default router;

