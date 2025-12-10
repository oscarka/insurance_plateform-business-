// 数据库连接配置
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'insurance_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  // 明确设置连接选项
  typeCast: function (field, next) {
    if (field.type === 'VAR_STRING' || field.type === 'STRING') {
      return field.string();
    }
    return next();
  },
});

// 连接池配置中已设置 charset: 'utf8mb4'，无需在连接事件中再次设置
// 如果需要，可以在连接池配置中添加初始化查询

// 测试数据库连接
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
};

export default pool;

