// Express服务器
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';

// 导入路由
import productRoutes from './routes/products.js';
import planRoutes from './routes/plans.js';
import premiumRoutes from './routes/premium.js';
import applicationRoutes from './routes/applications.js';
import companyRoutes from './routes/companies.js';
import liabilityRoutes from './routes/liabilities.js';
import clauseRoutes from './routes/clauses.js';
import specialAgreementRoutes from './routes/special-agreements.js';
import regionRoutes from './routes/regions.js';
import occupationRoutes from './routes/occupations.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件 - CORS配置
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174']; // 默认允许本地开发

app.use(cors({
  origin: function (origin, callback) {
    // 允许没有origin的请求（如移动应用、Postman等）
    if (!origin) return callback(null, true);
    
    // 开发环境允许所有来源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // 生产环境检查允许的来源
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 设置响应头，确保UTF-8编码
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/products', productRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/insurance-companies', companyRoutes);
app.use('/api/liabilities', liabilityRoutes);
app.use('/api/clauses', clauseRoutes);
app.use('/api/special-agreements', specialAgreementRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/occupations', occupationRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

// 启动服务器
const startServer = async () => {
  // 测试数据库连接
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('⚠️  数据库连接失败，请检查配置');
    console.log('提示：请确保数据库已创建，并检查 .env 文件配置');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`📝 API文档: http://0.0.0.0:${PORT}/api`);
    console.log(`💚 健康检查: http://0.0.0.0:${PORT}/health`);
  });
};

startServer();

