# 用户端前端应用

这是保险平台的用户端前端应用，用于企业客户进行投保、查看保单等操作。

## 技术栈

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS (CDN)

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 部署到 Cloudflare Pages

### 方式1：通过 GitHub 自动部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 在 Cloudflare Pages 中创建新项目
3. 连接 GitHub 仓库
4. 配置构建设置：
   - **Framework preset**: `Vite`
   - **Build command**: `npm install && npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`（留空）
   - **⚠️ 重要：Deploy command 必须留空！**

5. 配置环境变量：
   ```
   VITE_API_BASE_URL = https://your-backend.railway.app/api
   ```

6. 保存并部署

### 方式2：使用 Wrangler CLI

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 构建项目
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy dist --project-name=insurance-platform-client
```

## 环境变量

在 Cloudflare Pages 项目设置中配置以下环境变量：

- `VITE_API_BASE_URL`: 后端 API 地址（例如：`https://your-backend.railway.app/api`）

## 项目结构

```
client/
├── pages/           # 页面组件
├── components/      # 公共组件
├── src/
│   ├── components/  # 业务组件
│   ├── hooks/       # 自定义 Hooks
│   └── services/    # API 服务
├── types.ts         # TypeScript 类型定义
├── App.tsx          # 主应用组件
├── index.tsx        # 入口文件
└── index.html       # HTML 模板
```

## 路由配置

应用使用 React Router 进行路由管理，所有路由都通过 `_redirects` 文件配置为 SPA 模式，确保 Cloudflare Pages 正确处理路由。
