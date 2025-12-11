# 用户端 Cloudflare Pages 部署说明

## 一、部署前准备

### 1. 确保代码已提交到 GitHub

```bash
cd client
git add .
git commit -m "整理用户端代码结构"
git push
```

### 2. 获取后端 API 地址

确保后端服务已在 Railway 部署完成，并获取 API 地址，例如：
```
https://your-backend.railway.app/api
```

## 二、在 Cloudflare Pages 创建项目

### 步骤1：访问 Cloudflare Pages

1. 打开 https://pages.cloudflare.com
2. 登录你的 Cloudflare 账号

### 步骤2：创建新项目

1. 点击 **"Create a project"** 按钮
2. 选择 **"Connect to Git"**
3. 选择你的 GitHub 仓库：`你的仓库名/insuranceplateform`

### 步骤3：配置构建设置

在项目配置页面填写以下信息：

- **Project name**: `insurance-platform-client`（或你喜欢的名字）
- **Production branch**: `main`（或你的主分支名）
- **Framework preset**: `Vite`
- **Build command**: `cd client && npm install && npm run build`
- **Build output directory**: `client/dist`
- **Root directory**: `/`（留空或填 `/`）
- **⚠️ 重要：Deploy command（部署命令）必须留空！** 
  - Cloudflare Pages 会自动部署构建产物，不需要 `wrangler deploy` 命令
  - 如果填写了部署命令，会导致构建失败

### 步骤4：配置环境变量

在 **"Environment variables"** 部分添加：

```
VITE_API_BASE_URL = https://your-backend.railway.app/api
```

**注意**：
- 将 `https://your-backend.railway.app/api` 替换为你的实际后端地址
- 如果后端地址有变化，需要在这里更新并重新部署

### 步骤5：保存并部署

1. 点击 **"Save and Deploy"**
2. 等待构建完成（通常需要 2-5 分钟）
3. 构建成功后，Cloudflare 会提供一个 `.pages.dev` 域名

## 三、自定义域名（可选）

### 绑定自定义域名

1. 在 Cloudflare Pages 项目设置中，找到 **"Custom domains"**
2. 点击 **"Set up a custom domain"**
3. 输入你的域名（例如：`client.yourdomain.com`）
4. Cloudflare 会自动配置 SSL 证书

## 四、部署后检查

### 检查清单

- [ ] 访问用户端 URL，页面正常加载
- [ ] 检查浏览器控制台，无 CORS 错误
- [ ] 测试登录功能是否正常
- [ ] 测试 API 调用是否正常（例如：获取产品列表）
- [ ] 测试路由跳转是否正常（例如：从首页跳转到投保页面）

### 常见问题排查

#### Q: 构建失败，提示 "error occurred while running deploy command"？

**A**: 这是最常见的错误！

**原因**：在 Cloudflare Pages 配置中设置了 `npx wrangler deploy` 作为部署命令。

**解决方法**：
1. 进入 Cloudflare Pages 项目设置
2. 找到 **"Deploy command"**（部署命令）字段
3. **将其留空或删除**
4. 保存并重新部署

**正确的配置**：
- ✅ Build command: `cd client && npm install && npm run build`
- ✅ Build output directory: `client/dist`
- ✅ Deploy command: **留空**

#### Q: 页面显示 404？

**A**: 确保 `_redirects` 文件已正确创建并部署。

检查方法：
1. 在构建日志中查看是否有 "✅ _redirects文件已复制到dist目录" 的提示
2. 如果构建日志中没有，检查 `client/_redirects` 文件是否存在
3. 检查 `client/vite.config.ts` 中的复制插件配置是否正确

#### Q: API 调用失败，提示 CORS 错误？

**A**: 需要配置后端 CORS。

在 Railway 后端环境变量中添加：
```
ALLOWED_ORIGINS = https://your-client.pages.dev,https://your-admin.pages.dev
```

将 `your-client.pages.dev` 和 `your-admin.pages.dev` 替换为你的实际前端域名。

#### Q: 构建失败，提示找不到模块？

**A**: 检查 Node.js 版本和依赖。

1. 在 Cloudflare Pages 设置中，确保 Node.js 版本为 18 或更高
2. 检查 `client/package.json` 中的依赖是否完整
3. 查看构建日志中的具体错误信息

#### Q: 页面路由跳转后显示 404？

**A**: 确保 `_redirects` 文件配置正确。

`_redirects` 文件内容应该是：
```
/*    /index.html   200
```

## 五、更新部署

### 自动部署

如果已连接 GitHub，每次推送到主分支会自动触发部署。

### 手动部署

1. 在 Cloudflare Pages 项目页面
2. 点击 **"Retry deployment"** 或 **"Create deployment"**
3. 选择要部署的分支和 commit

### 更新环境变量

1. 进入项目设置
2. 找到 **"Environment variables"**
3. 更新变量值
4. 保存后会自动重新部署

## 六、与后台管理端的区别

| 项目 | 用户端 | 后台管理端 |
|------|--------|-----------|
| 目录 | `client/` | `admin/` |
| 构建命令 | `cd client && npm install && npm run build` | `cd admin && npm install && npm run build` |
| 输出目录 | `client/dist` | `admin/dist` |
| 用途 | 企业客户使用 | 内部管理员使用 |

## 七、项目结构

```
insuranceplateform/
├── client/              # 用户端前端（本目录）
│   ├── pages/          # 页面组件
│   ├── components/     # 公共组件
│   ├── src/            # 业务逻辑
│   ├── App.tsx         # 主应用
│   ├── index.tsx       # 入口文件
│   ├── package.json    # 依赖配置
│   ├── vite.config.ts  # Vite 配置
│   └── wrangler.toml   # Cloudflare 配置
├── admin/              # 后台管理端
└── backend/            # 后端服务
```

## 八、技术支持

如果遇到问题，请检查：
1. Cloudflare Pages 构建日志
2. 浏览器控制台错误信息
3. 后端服务日志
4. 环境变量配置
