# Railway 后端部署说明（使用 railway.toml）

## 📋 概述

使用 `railway.toml` 配置文件可以简化Railway部署配置，所有环境变量和部署设置都在一个文件中管理。

## 🚀 部署步骤

### 1. 准备配置文件

`railway.toml` 文件已经创建在 `backend/` 目录中，包含所有必要的配置。

### 2. 在Railway创建项目

1. **访问 Railway**
   - 打开 https://railway.app
   - 使用GitHub账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择仓库：`oscarka/insurance_plateform-business-`

3. **设置项目根目录**
   - 在项目设置中，找到 "Root Directory"
   - 设置为：`backend`
   - 这样Railway会从 `backend` 目录读取 `railway.toml`

### 3. 添加MySQL数据库

1. **在Railway项目中添加MySQL服务**
   - 点击 "New" → "Database" → "MySQL"
   - Railway会自动创建MySQL实例

2. **Railway会自动注入MySQL环境变量**
   - `${{MySQL.MYSQLHOST}}` → `DB_HOST`
   - `${{MySQL.MYSQLUSER}}` → `DB_USER`
   - `${{MySQL.MYSQLPASSWORD}}` → `DB_PASSWORD`
   - `${{MySQL.MYSQLDATABASE}}` → `DB_NAME`
   - `${{MySQL.MYSQLPORT}}` → `DB_PORT`（如果需要）

### 4. 更新前端域名（重要）

在 `railway.toml` 中，更新 `ALLOWED_ORIGINS`：

```toml
ALLOWED_ORIGINS = "https://insurance-plateform-business.pages.dev,https://your-user-frontend.pages.dev"
```

**替换为实际的前端域名**：
- 后台管理前端：`https://insurance-plateform-business.pages.dev`
- 用户端前端：你的用户端Cloudflare Pages域名

### 5. 提交并部署

```bash
cd /Users/cc/insuranceplateform
git add backend/railway.toml
git commit -m "添加Railway配置文件"
git push origin main
```

Railway会自动检测到新的commit并开始部署。

### 6. 初始化数据库

部署成功后，需要初始化数据库：

1. **在Railway项目中找到MySQL服务**
2. **点击 "Query" 或使用MySQL客户端**
3. **执行SQL文件**（按顺序）：
   - `database_schema.sql` - 创建表结构
   - `database_create_regions_table.sql` - 创建地区表
   - `database_extend_special_agreements.sql` - 扩展表结构
   - `database_migration_task1-12.sql` - 迁移数据

或者使用Railway CLI：

```bash
# 安装Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 链接项目
railway link

# 执行SQL文件
railway run mysql < database_schema.sql
```

## 📝 railway.toml 配置说明

### 当前配置

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node server.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
DB_HOST = "${{MySQL.MYSQLHOST}}"
DB_PORT = "3306"
DB_USER = "${{MySQL.MYSQLUSER}}"
DB_PASSWORD = "${{MySQL.MYSQLPASSWORD}}"
DB_NAME = "${{MySQL.MYSQLDATABASE}}"
PORT = "3000"
NODE_ENV = "production"
ALLOWED_ORIGINS = "https://insurance-plateform-business.pages.dev,https://your-user-frontend.pages.dev"
```

### 配置项说明

- **builder**: 使用NIXPACKS自动检测和构建Node.js项目
- **startCommand**: 启动命令，运行 `node server.js`
- **restartPolicyType**: 失败时自动重启
- **DB_***: 数据库配置，从Railway MySQL服务自动注入
- **PORT**: 服务器端口（Railway会自动分配，但这里设置默认值）
- **NODE_ENV**: 生产环境
- **ALLOWED_ORIGINS**: CORS允许的前端域名

## 🔧 更新配置

如果需要更新配置（例如添加新的前端域名）：

1. **编辑 `backend/railway.toml`**
2. **提交更改**
   ```bash
   git add backend/railway.toml
   git commit -m "更新Railway配置"
   git push origin main
   ```
3. **Railway会自动重新部署**

## ✅ 验证部署

部署成功后：

1. **获取Railway后端URL**
   - 在Railway项目页面，找到服务URL
   - 例如：`https://insurance-platform-backend.railway.app`

2. **测试健康检查**
   - 访问：`https://your-backend.railway.app/health`
   - 应该返回：`{ "status": "ok" }`

3. **测试API**
   - 访问：`https://your-backend.railway.app/api/products`
   - 应该返回产品列表

4. **更新前端环境变量**
   - 在Cloudflare Pages中，更新 `VITE_API_BASE_URL`
   - 值：`https://your-backend.railway.app/api`

## 🐛 常见问题

### Q: Railway没有读取railway.toml？

A: 检查：
- 文件是否在 `backend/` 目录中
- 项目根目录是否设置为 `backend`
- 文件格式是否正确（TOML格式）

### Q: MySQL环境变量没有注入？

A: 确保：
- MySQL服务已添加到Railway项目
- MySQL服务和Web服务在同一个Railway项目中
- 使用 `${{MySQL.VARIABLE_NAME}}` 格式引用

### Q: CORS错误？

A: 检查：
- `ALLOWED_ORIGINS` 是否包含实际的前端域名
- 域名格式是否正确（包含 `https://`）
- 多个域名用逗号分隔，不要有空格

### Q: 如何查看环境变量？

A: 在Railway项目页面：
- 点击服务 → "Variables" 标签
- 可以看到所有环境变量（包括从railway.toml读取的）

## 📚 相关文档

- [Railway官方文档](https://docs.railway.app/)
- [Railway TOML配置](https://docs.railway.app/reference/railway-toml)

---

**使用 `railway.toml` 可以大大简化部署配置！**
