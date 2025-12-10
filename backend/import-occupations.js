// 从Excel导入职业分类数据
import XLSX from 'xlsx';
import pool from './config/database.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importOccupations() {
  try {
    console.log('=== 开始导入职业分类数据 ===\n');
    
    // 1. 读取Excel文件
    const excelPath = path.join(__dirname, '..', '乐选渠道对接表.xlsx');
    console.log(`读取Excel文件: ${excelPath}`);
    
    if (!fs.existsSync(excelPath)) {
      console.error(`❌ Excel文件不存在: ${excelPath}`);
      console.log('请确保文件存在，或修改脚本中的文件路径');
      return;
    }
    
    const workbook = XLSX.readFile(excelPath);
    
    // 2. 查找职业分类表sheet（工作表7：职业分类表_专属）
    let sheetName = null;
    const sheetNames = workbook.SheetNames;
    console.log(`\n找到的工作表: ${sheetNames.join(', ')}`);
    
    // 尝试多个可能的sheet名称
    const possibleNames = ['职业分类表_专属', '职业分类表', '职业表', '工作表7'];
    for (const name of possibleNames) {
      if (sheetNames.includes(name)) {
        sheetName = name;
        break;
      }
    }
    
    // 如果没找到，尝试第7个sheet（索引6）
    if (!sheetName && sheetNames.length >= 7) {
      sheetName = sheetNames[6];
      console.log(`⚠️ 未找到标准名称，使用第7个工作表: ${sheetName}`);
    }
    
    if (!sheetName) {
      console.error('❌ 未找到职业分类表工作表');
      console.log('请检查Excel文件，确保有名为"职业分类表_专属"的工作表');
      return;
    }
    
    console.log(`\n使用工作表: ${sheetName}`);
    
    // 3. 读取数据
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,  // 使用数组格式
      defval: '', // 空单元格默认值
      raw: false  // 不保留原始值
    });
    
    console.log(`\n读取到 ${data.length} 行数据`);
    
    if (data.length < 3) {
      console.error('❌ 数据行数不足');
      return;
    }
    
    // 4. 查找真正的表头行（跳过标题行）
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i];
      const rowText = row.join(' ').toLowerCase();
      // 查找包含"行业"、"职业"、"代码"、"名称"等关键词的行
      if (rowText.includes('行业') && (rowText.includes('代码') || rowText.includes('名称'))) {
        headerRowIndex = i;
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      // 如果找不到，尝试第2行或第3行
      headerRowIndex = data.length > 2 ? 2 : 1;
      console.log(`⚠️ 未找到标准表头，使用第${headerRowIndex + 1}行作为表头`);
    } else {
      console.log(`找到表头行: 第${headerRowIndex + 1}行`);
    }
    
    const headers = data[headerRowIndex];
    console.log('表头:', headers);
    
    // 查找各列的索引
    const findColumnIndex = (possibleNames) => {
      for (const name of possibleNames) {
        const index = headers.findIndex(h => 
          h && (h.toString().includes(name) || name.includes(h.toString()))
        );
        if (index >= 0) return index;
      }
      return -1;
    };
    
    const industryLargeCodeIdx = findColumnIndex(['行业大分类代码', '大分类代码', '大分类']);
    const industryLargeNameIdx = findColumnIndex(['行业大分类名称', '大分类名称', '大分类']);
    const industryMediumCodeIdx = findColumnIndex(['行业中分类代码', '中分类代码', '中分类']);
    const industryMediumNameIdx = findColumnIndex(['行业中分类名称', '中分类名称', '中分类']);
    const industrySmallNameIdx = findColumnIndex(['行业小分类名称', '小分类名称', '小分类']);
    const occupationDetailCodeIdx = findColumnIndex(['职业细类代码', '细类代码', '职业代码', '代码']);
    const occupationDetailNameIdx = findColumnIndex(['职业细类名称', '细类名称', '职业名称', '名称']);
    const occupationLevelIdx = findColumnIndex(['职业等级', '等级', '类别', '类']);
    const industryFactorIdx = findColumnIndex(['行业系数', '系数']);
    
    console.log('\n列索引映射:');
    console.log(`  行业大分类代码: ${industryLargeCodeIdx}`);
    console.log(`  行业大分类名称: ${industryLargeNameIdx}`);
    console.log(`  行业中分类代码: ${industryMediumCodeIdx}`);
    console.log(`  行业中分类名称: ${industryMediumNameIdx}`);
    console.log(`  行业小分类名称: ${industrySmallNameIdx}`);
    console.log(`  职业细类代码: ${occupationDetailCodeIdx}`);
    console.log(`  职业细类名称: ${occupationDetailNameIdx}`);
    console.log(`  职业等级: ${occupationLevelIdx}`);
    console.log(`  行业系数: ${industryFactorIdx}`);
    
    // 5. 获取利宝保险公司的company_id
    const [companies] = await pool.execute(
      "SELECT company_id FROM insurance_companies WHERE company_name LIKE '%利宝%' OR company_code = 'LIBO' LIMIT 1"
    );
    
    if (companies.length === 0) {
      console.error('❌ 未找到利宝保险公司，请先创建保险公司数据');
      return;
    }
    
    const companyId = companies[0].company_id;
    console.log(`\n使用保险公司ID: ${companyId}`);
    
    // 6. 解析并导入数据（跳过表头行）
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      
      // 跳过空行
      if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
        continue;
      }
      
      try {
        // 提取数据
        const industryLargeCode = industryLargeCodeIdx >= 0 ? (row[industryLargeCodeIdx] || '').toString().trim() : '';
        const industryLargeName = industryLargeNameIdx >= 0 ? (row[industryLargeNameIdx] || '').toString().trim() : '';
        const industryMediumCode = industryMediumCodeIdx >= 0 ? (row[industryMediumCodeIdx] || '').toString().trim() : '';
        const industryMediumName = industryMediumNameIdx >= 0 ? (row[industryMediumNameIdx] || '').toString().trim() : '';
        const industrySmallName = industrySmallNameIdx >= 0 ? (row[industrySmallNameIdx] || '').toString().trim() : '';
        const occupationDetailCode = occupationDetailCodeIdx >= 0 ? (row[occupationDetailCodeIdx] || '').toString().trim() : '';
        const occupationDetailName = occupationDetailNameIdx >= 0 ? (row[occupationDetailNameIdx] || '').toString().trim() : '';
        let occupationLevel = occupationLevelIdx >= 0 ? (row[occupationLevelIdx] || '').toString().trim() : '';
        const industryFactor = industryFactorIdx >= 0 ? (row[industryFactorIdx] || '').toString().trim() : '';
        
        // 验证必填字段
        if (!occupationDetailCode || !occupationDetailName) {
          console.log(`⚠️ 第${i+1}行跳过：缺少必填字段（职业代码或职业名称）`);
          continue;
        }
        
        // 处理职业等级（提取数字）
        if (occupationLevel) {
          const levelMatch = occupationLevel.match(/(\d+)/);
          occupationLevel = levelMatch ? levelMatch[1] : '';
        }
        
        if (!occupationLevel || !['1', '2', '3', '4', '5'].includes(occupationLevel)) {
          console.log(`⚠️ 第${i+1}行跳过：职业等级无效 (${occupationLevel})`);
          continue;
        }
        
        // 处理行业系数
        let industryFactorValue = null;
        if (industryFactor) {
          const factorMatch = industryFactor.match(/([\d.]+)/);
          if (factorMatch) {
            industryFactorValue = parseFloat(factorMatch[1]);
          }
        }
        
        // 插入数据
        const sql = `
          INSERT INTO occupation_categories (
            company_id,
            industry_large_code,
            industry_large_name,
            industry_medium_code,
            industry_medium_name,
            industry_small_name,
            occupation_detail_code,
            occupation_detail_name,
            occupation_level,
            industry_factor,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '启用')
          ON DUPLICATE KEY UPDATE
            industry_large_name = VALUES(industry_large_name),
            industry_medium_name = VALUES(industry_medium_name),
            industry_small_name = VALUES(industry_small_name),
            occupation_detail_name = VALUES(occupation_detail_name),
            occupation_level = VALUES(occupation_level),
            industry_factor = VALUES(industry_factor),
            updated_at = CURRENT_TIMESTAMP
        `;
        
        await pool.execute(sql, [
          companyId,
          industryLargeCode || null,
          industryLargeName || null,
          industryMediumCode || null,
          industryMediumName || null,
          industrySmallName || null,
          occupationDetailCode,
          occupationDetailName,
          parseInt(occupationLevel),
          industryFactorValue,
        ]);
        
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`  已导入 ${successCount} 条...`);
        }
        
      } catch (error) {
        errorCount++;
        const errorMsg = `第${i+1}行: ${error.message}`;
        errors.push(errorMsg);
        console.error(`  ❌ ${errorMsg}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ 导入完成！`);
    console.log(`   成功: ${successCount} 条`);
    console.log(`   失败: ${errorCount} 条`);
    
    if (errors.length > 0 && errors.length <= 10) {
      console.log('\n错误详情:');
      errors.forEach(err => console.log(`   ${err}`));
    }
    
    // 7. 验证导入结果
    const [result] = await pool.execute(
      'SELECT COUNT(*) as total FROM occupation_categories WHERE company_id = ? AND status = "启用"',
      [companyId]
    );
    console.log(`\n数据库中company_id=${companyId}的职业数据总数: ${result[0].total}`);
    
  } catch (error) {
    console.error('\n❌ 导入失败:', error);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// 运行导入
importOccupations();
