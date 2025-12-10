# Cloudflare Pages 部署说明

## 一、用户端前端（已在Cloudflare）

### 更新步骤：
1. 代码已提交到GitHub（本地commit已完成）
2. 如果Cloudflare已连接GitHub，会自动触发部署
3. 如果没有自动部署，手动触发：
   - 进入Cloudflare Pages项目
   - 点击 "Retry deployment" 或 "Create deployment"
   - 选择最新的commit

### 环境变量检查：
确保Cloudflare Pages项目设置中有：
```
VITE_API_BASE_URL = https://your-backend.railway.app/api
```
（等Railway部署完成后，替换为实际的后端地址）

## 二、后台管理前端（需要新建项目）

### 在Cloudflare Pages创建新项目：

1. **访问 Cloudflare Pages**
   - 打开 https://pages.cloudflare.com
   - 登录账号

2. **创建新项目**
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 选择你的GitHub仓库：`oscarka/insurance_plateform-business-`

3. **配置构建设置**
   - **Project name**: `insurance-platform-admin`（或你喜欢的名字）
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Build command**: `cd admin && npm install && npm run build`
   - **Build output directory**: `admin/dist`
   - **Root directory**: `/`（留空或填 `/`）

4. **环境变量**
   在 "Environment variables" 中添加：
   ```
   VITE_API_BASE_URL = https://your-backend.railway.app/api
   ```
   （等Railway部署完成后，替换为实际的后端地址）

5. **保存并部署**
   - 点击 "Save and Deploy"
   - 等待构建完成

### 自定义域名（可选）
- 部署完成后，可以在项目设置中绑定自定义域名
- Cloudflare会自动配置SSL证书

## 三、SPA路由配置

已创建 `_redirects` 文件，确保React Router正常工作：
- 用户端：根目录的 `_redirects`
- 后台：`admin/_redirects`

这些文件会在构建时自动复制到 `dist` 目录。

## 四、部署后检查

### 用户端检查：
- [ ] 访问用户端URL，页面正常加载
- [ ] 检查浏览器控制台，无CORS错误
- [ ] 测试API调用是否正常

### 后台管理检查：
- [ ] 访问后台URL，登录页面正常
- [ ] 登录后能正常访问各个页面
- [ ] API调用正常，数据能正常显示

## 五、更新API地址

等Railway后端部署完成后：

1. **获取Railway后端URL**
   - 例如：`https://your-backend.railway.app`

2. **更新环境变量**
   - 用户端：`VITE_API_BASE_URL = https://your-backend.railway.app/api`
   - 后台：`VITE_API_BASE_URL = https://your-backend.railway.app/api`
   - 在Cloudflare Pages项目设置中更新
   - 更新后会自动重新部署

3. **更新后端CORS配置**
   - 在Railway环境变量中添加：
   ```
   ALLOWED_ORIGINS = https://your-user-frontend.pages.dev,https://your-admin-frontend.pages.dev
   ```

## 六、常见问题

### Q: 构建失败？
A: 检查：
- Node.js版本（Cloudflare默认使用Node 18）
- 构建命令是否正确
- 依赖是否完整（确保package.json中有所有依赖）

### Q: 页面404？
A: 确保 `_redirects` 文件已正确创建并部署

### Q: API调用失败？
A: 检查：
- 环境变量 `VITE_API_BASE_URL` 是否正确
- 后端CORS配置是否允许前端域名
- 后端服务是否正常运行
