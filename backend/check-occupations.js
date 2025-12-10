// 检查职业表数据的脚本
import pool from './config/database.js';

async function checkOccupations() {
  try {
    console.log('=== 检查职业表数据 ===\n');
    
    // 1. 检查表是否存在
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'occupation_categories'"
    );
    if (tables.length === 0) {
      console.log('❌ occupation_categories 表不存在');
      return;
    }
    console.log('✅ occupation_categories 表存在\n');
    
    // 2. 检查总数据量
    const [totalCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM occupation_categories'
    );
    console.log(`总数据量: ${totalCount[0].total}`);
    
    // 3. 检查启用状态的数据量
    const [enabledCount] = await pool.execute(
      "SELECT COUNT(*) as total FROM occupation_categories WHERE status = '启用'"
    );
    console.log(`启用状态的数据量: ${enabledCount[0].total}\n`);
    
    // 4. 检查各公司的数据分布
    const [companyStats] = await pool.execute(
      `SELECT 
        oc.company_id,
        ic.company_name,
        ic.company_code,
        COUNT(*) as count
      FROM occupation_categories oc
      LEFT JOIN insurance_companies ic ON oc.company_id = ic.company_id
      WHERE oc.status = '启用'
      GROUP BY oc.company_id, ic.company_name, ic.company_code
      ORDER BY count DESC`
    );
    console.log('各公司的职业数据统计:');
    if (companyStats.length === 0) {
      console.log('  ⚠️ 没有找到任何公司的职业数据');
    } else {
      companyStats.forEach(stat => {
        console.log(`  - company_id: ${stat.company_id}, company_name: ${stat.company_name || 'N/A'}, company_code: ${stat.company_code || 'N/A'}, 数量: ${stat.count}`);
      });
    }
    console.log('');
    
    // 5. 检查产品ID=1对应的company_id
    const [productInfo] = await pool.execute(
      'SELECT product_id, company_id FROM insurance_products WHERE product_id = 1'
    );
    if (productInfo.length > 0) {
      const product = productInfo[0];
      console.log(`产品ID=1 对应的 company_id: ${product.company_id}`);
      
      // 检查该company_id是否有职业数据
      const [companyOccupations] = await pool.execute(
        "SELECT COUNT(*) as total FROM occupation_categories WHERE company_id = ? AND status = '启用'",
        [product.company_id]
      );
      console.log(`company_id=${product.company_id} 的职业数据数量: ${companyOccupations[0].total}\n`);
      
      // 如果有数据，显示前几条
      if (companyOccupations[0].total > 0) {
        const [samples] = await pool.execute(
          `SELECT 
            industry_large_code,
            industry_large_name,
            industry_medium_code,
            industry_medium_name,
            occupation_detail_code,
            occupation_detail_name,
            occupation_level
          FROM occupation_categories 
          WHERE company_id = ? AND status = '启用'
          LIMIT 5`,
          [product.company_id]
        );
        console.log('前5条职业数据示例:');
        samples.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.industry_large_name} > ${item.industry_medium_name} > ${item.occupation_detail_name} (${item.occupation_level}类)`);
        });
      }
    } else {
      console.log('⚠️ 未找到产品ID=1');
    }
    console.log('');
    
    // 6. 检查一级分类
    const [levels] = await pool.execute(
      `SELECT DISTINCT 
        company_id,
        industry_large_code,
        industry_large_name,
        COUNT(*) as count
      FROM occupation_categories 
      WHERE status = '启用'
      GROUP BY company_id, industry_large_code, industry_large_name
      ORDER BY company_id, industry_large_code
      LIMIT 10`
    );
    console.log('一级分类示例（前10条）:');
    if (levels.length === 0) {
      console.log('  ⚠️ 没有找到一级分类数据');
    } else {
      levels.forEach(level => {
        console.log(`  - company_id: ${level.company_id}, ${level.industry_large_name} (${level.industry_large_code}), 数量: ${level.count}`);
      });
    }
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await pool.end();
  }
}

checkOccupations();
