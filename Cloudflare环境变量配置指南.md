# Cloudflare Pages 后台前端环境变量配置指南

## 📋 配置步骤

### 1. 获取Railway后端URL

首先，你需要获取Railway后端的URL：

1. 登录 [Railway控制台](https://railway.app)
2. 进入你的后端项目
3. 在Web Service的"Settings"标签中，找到"Domains"
4. 复制你的Railway域名，格式通常是：`https://your-project-name.railway.app`
5. **完整的API地址应该是**：`https://your-project-name.railway.app/api`

### 2. 在Cloudflare Pages配置环境变量

#### 方法1：通过Web UI配置（推荐）

1. **登录Cloudflare Pages**
   - 访问 https://pages.cloudflare.com
   - 登录你的账号

2. **进入后台前端项目**
   - 找到你的后台管理前端项目（例如：`insurance-platform-admin`）
   - 点击进入项目

3. **进入设置页面**
   - 点击左侧菜单的 **"Settings"**
   - 找到 **"Environment variables"** 部分

4. **添加环境变量**
   - 点击 **"Add variable"** 或 **"Add environment variable"**
   - 配置如下：
     - **Variable name**: `VITE_API_BASE_URL`
     - **Value**: `https://your-project-name.railway.app/api`
       （替换为你的实际Railway后端地址）
     - **Environment**: 选择 **"Production"**（生产环境）
     - 如果需要，也可以为 **"Preview"**（预览环境）添加相同的变量

5. **保存并重新部署**
   - 点击 **"Save"** 保存环境变量
   - 环境变量保存后，需要**重新部署**才能生效
   - 进入 **"Deployments"** 标签
   - 找到最新的部署，点击 **"Retry deployment"** 或创建新的部署

#### 方法2：通过Cloudflare CLI配置（可选）

```bash
# 安装Wrangler CLI（如果还没安装）
npm install -g wrangler

# 登录
wrangler login

# 设置环境变量
wrangler pages project list  # 先查看项目列表
wrangler pages project create <project-name>  # 如果项目不存在

# 设置环境变量（需要项目ID）
wrangler pages secret put VITE_API_BASE_URL --project-name=<project-name>
# 然后输入值：https://your-project-name.railway.app/api
```

### 3. 验证环境变量是否生效

部署完成后，在浏览器中验证：

1. **打开部署的页面**
   - 访问你的Cloudflare Pages URL（例如：`https://your-admin.pages.dev`）

2. **打开浏览器开发者工具**
   - 按 `F12` 打开开发者工具
   - 切换到 **"Console"**（控制台）标签

3. **检查环境变量**
   - 在控制台执行：
     ```javascript
     console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
     ```
   - 应该显示你设置的Railway后端地址，而不是 `undefined`

4. **检查API请求**
   - 切换到 **"Network"**（网络）标签
   - 刷新页面
   - 查看API请求的URL，应该指向Railway后端
   - 确认请求是否成功（状态码200）

### 4. 更新后端CORS配置（重要！）

确保Railway后端的CORS配置允许Cloudflare Pages的域名访问：

在 `backend/server.js` 中，确保 `ALLOWED_ORIGINS` 环境变量包含你的Cloudflare Pages域名：

```javascript
// 在Railway环境变量中设置
ALLOWED_ORIGINS=https://your-admin.pages.dev,https://your-user.pages.dev
```

或者在 `backend/railway.toml` 中配置：

```toml
[env]
ALLOWED_ORIGINS = "https://your-admin.pages.dev,https://your-user.pages.dev"
```

## 🔍 常见问题

### 问题1：环境变量设置后不生效

**原因**：环境变量需要在构建时注入，必须重新部署才能生效。

**解决**：
1. 确保环境变量已保存
2. 在Cloudflare Pages中触发新的部署
3. 等待部署完成后再测试

### 问题2：API请求失败（CORS错误）

**原因**：后端CORS配置没有允许Cloudflare Pages域名。

**解决**：
1. 检查Railway后端的 `ALLOWED_ORIGINS` 环境变量
2. 确保包含你的Cloudflare Pages域名
3. 重启Railway服务

### 问题3：API请求返回404

**原因**：API地址配置错误。

**解决**：
1. 确认Railway后端URL是否正确
2. 确认API路径是否包含 `/api` 后缀
3. 检查Railway后端是否正常运行

### 问题4：环境变量显示为undefined

**原因**：
- 环境变量名称错误（必须是 `VITE_API_BASE_URL`）
- 环境变量没有在正确的环境（Production/Preview）中设置
- 没有重新部署

**解决**：
1. 确认变量名完全一致（区分大小写）
2. 确保在Production环境中设置了变量
3. 重新部署项目

## 📝 配置检查清单

- [ ] 已获取Railway后端URL
- [ ] 在Cloudflare Pages中设置了 `VITE_API_BASE_URL` 环境变量
- [ ] 环境变量值格式正确（包含 `https://` 和 `/api` 后缀）
- [ ] 已重新部署Cloudflare Pages项目
- [ ] 在浏览器控制台验证环境变量已生效
- [ ] 在Network标签中确认API请求指向Railway后端
- [ ] 已更新Railway后端CORS配置，允许Cloudflare Pages域名
- [ ] API请求成功返回数据

## 🎯 快速配置命令总结

```bash
# 1. 获取Railway后端URL（在Railway控制台查看）

# 2. 在Cloudflare Pages Web UI中：
#    - 进入项目 Settings > Environment variables
#    - 添加：VITE_API_BASE_URL = https://your-backend.railway.app/api
#    - 保存并重新部署

# 3. 在Railway后端环境变量中：
#    - 设置：ALLOWED_ORIGINS = https://your-admin.pages.dev,https://your-user.pages.dev
```

---

**配置完成后，后台前端就能正常连接到Railway后端了！** 🎉
