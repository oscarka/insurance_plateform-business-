# 保险平台系统

企业保险服务平台，包含用户端、后台管理端和后端服务。

## 项目结构

```
insuranceplateform/
├── client/          # 用户端前端（React + Vite）
├── admin/           # 后台管理端（React + Ant Design）
├── backend/         # 后端服务（Node.js + Express）
└── docs/            # 项目文档
```

## 快速开始

### 用户端开发

```bash
cd client
npm install
npm run dev
```

### 后台管理端开发

```bash
cd admin
npm install
npm run dev
```

### 后端服务开发

```bash
cd backend
npm install
npm run dev
```

## 部署

### 用户端（Cloudflare Pages）

详细部署说明请查看：
- [用户端 Cloudflare 部署说明](client/Cloudflare部署说明.md)
- [通用 Cloudflare 部署说明](docs/Cloudflare部署说明.md)

### 后台管理端（Cloudflare Pages）

详细部署说明请查看：
- [后台管理端 README](admin/README.md)
- [通用 Cloudflare 部署说明](docs/Cloudflare部署说明.md)

### 后端服务（Railway）

详细部署说明请查看：
- [后端服务 README](backend/README.md)
- [Railway 部署说明](backend/Railway部署说明.md)

## 文档索引

所有详细文档都在 `docs/` 目录下，包括：

### 部署相关
- [快速部署操作](docs/快速部署操作.md)
- [Cloudflare 部署说明](docs/Cloudflare部署说明.md)
- [Railway 部署说明](backend/Railway部署说明.md)
- [环境变量配置](docs/环境变量配置.md)

### 开发相关
- [系统架构说明](docs/系统架构说明.md)
- [系统设计文档](docs/系统设计文档.md)
- [数据库设计文档](docs/数据库设计文档.md)
- [API 接口文档](docs/功能说明文档.md)

### 问题修复
- [编码问题修复总结](docs/编码问题修复总结.md)
- [问题定位总结](docs/问题定位总结.md)
- [问题修复总结](docs/问题修复总结.md)

### 测试报告
- [最终测试报告](docs/最终测试报告.md)
- [用户端功能测试报告](docs/用户端功能测试报告.md)
- [后端服务测试报告](docs/后端服务测试报告.md)

更多文档请查看 [docs/](docs/) 目录。

## 技术栈

- **前端**: React 19, TypeScript, Vite
- **后台**: React 18, Ant Design 5
- **后端**: Node.js, Express, MySQL
- **部署**: Cloudflare Pages, Railway

## 许可证

MIT
