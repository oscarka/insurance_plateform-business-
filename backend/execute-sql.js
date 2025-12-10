// Node.js脚本：执行SQL文件
import mysql from 'mysql2/promise';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function executeSqlFile(filename, connection) {
  console.log(`\n📄 执行文件: ${filename}`);
  
  if (!fs.existsSync(filename)) {
    console.error(`❌ 文件不存在: ${filename}`);
    return;
  }
  
  const sql = fs.readFileSync(filename, 'utf-8');
  
  // 分割SQL语句（按分号和换行）
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && s.length > 0);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const statement of statements) {
    try {
      await connection.execute(statement);
      successCount++;
    } catch (error) {
      // 忽略一些常见的错误（如表已存在等）
      if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
          error.code === 'ER_DUP_ENTRY' ||
          error.message.includes('Duplicate')) {
        console.log(`   ⚠️  跳过（已存在）: ${statement.substring(0, 50)}...`);
      } else {
        console.error(`   ❌ 错误: ${error.message}`);
        console.error(`   SQL: ${statement.substring(0, 100)}...`);
        errorCount++;
      }
    }
  }
  
  console.log(`   ✅ 成功: ${successCount} 条`);
  if (errorCount > 0) {
    console.log(`   ❌ 失败: ${errorCount} 条`);
  }
}

async function main() {
  console.log('🚀 数据库初始化脚本\n');
  console.log('='.repeat(50));
  
  // 获取数据库配置
  const host = await question('数据库主机 [localhost]: ') || 'localhost';
  const port = await question('数据库端口 [3306]: ') || '3306';
  const user = await question('数据库用户 [root]: ') || 'root';
  const password = await question('数据库密码: ');
  const database = await question('数据库名称 [insurance_platform]: ') || 'insurance_platform';
  
  try {
    // 先连接（不指定数据库），用于创建数据库
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      multipleStatements: true
    });
    
    console.log('\n✅ 数据库连接成功');
    
    // 创建数据库（如果不存在）
    try {
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`✅ 数据库 ${database} 已创建或已存在`);
    } catch (error) {
      console.error(`❌ 创建数据库失败: ${error.message}`);
    }
    
    await connection.end();
    
    // 连接到指定数据库
    const dbConnection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
      multipleStatements: true
    });
    
    // 执行SQL文件
    const schemaFile = path.join(__dirname, '..', 'database_schema.sql');
    const testDataFile = path.join(__dirname, 'init-test-data.sql');
    
    await executeSqlFile(schemaFile, dbConnection);
    await executeSqlFile(testDataFile, dbConnection);
    
    // 验证数据
    console.log('\n📊 验证数据...');
    const [companies] = await dbConnection.execute('SELECT COUNT(*) as count FROM insurance_companies');
    const [products] = await dbConnection.execute('SELECT COUNT(*) as count FROM insurance_products');
    const [plans] = await dbConnection.execute('SELECT COUNT(*) as count FROM product_plans');
    const [liabilities] = await dbConnection.execute('SELECT COUNT(*) as count FROM plan_liabilities');
    const [rates] = await dbConnection.execute('SELECT COUNT(*) as count FROM premium_rates');
    
    console.log(`   保司: ${companies[0].count} 个`);
    console.log(`   产品: ${products[0].count} 个`);
    console.log(`   方案: ${plans[0].count} 个`);
    console.log(`   责任配置: ${liabilities[0].count} 个`);
    console.log(`   费率: ${rates[0].count} 个`);
    
    await dbConnection.end();
    rl.close();
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ 数据库初始化完成！');
    console.log('\n下一步：');
    console.log('1. 配置 backend/.env 文件');
    console.log('2. 启动后端服务: cd backend && npm run dev');
    console.log('3. 运行测试: npm test');
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();

