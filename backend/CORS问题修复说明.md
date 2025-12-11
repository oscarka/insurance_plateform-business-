# CORS 问题修复说明

## 🔴 问题现象

前端部署到 Cloudflare Pages 后，出现 CORS 错误：
```
Access to fetch at 'https://insuranceplateform-business-production.up.railway.app/...' 
from origin 'https://insurance-plateform-client.pages.dev' 
has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 问题原因

后端 Railway 的 `ALLOWED_ORIGINS` 环境变量中没有包含前端域名 `https://insurance-plateform-client.pages.dev`。

## ✅ 解决方案

### 方法 1：在 Railway Web UI 中更新环境变量（推荐）

1. **登录 Railway**
   - 访问 https://railway.app
   - 登录你的账号

2. **进入后端项目**
   - 找到你的后端服务项目
   - 点击进入项目

3. **进入环境变量设置**
   - 点击服务名称
   - 选择 **"Variables"** 标签
   - 找到 `ALLOWED_ORIGINS` 环境变量

4. **更新环境变量值**
   - 点击 `ALLOWED_ORIGINS` 进行编辑
   - 将值更新为：
     ```
     https://insurance-plateform-business.pages.dev,https://insurance-plateform-client.pages.dev
     ```
   - ⚠️ **注意**：多个域名用逗号分隔，**不要有空格**

5. **保存并重新部署**
   - 点击 **"Save"** 保存
   - Railway 会自动重新部署服务
   - 等待部署完成（通常 1-2 分钟）

### 方法 2：通过 railway.toml 文件更新

1. **更新 railway.toml 文件**
   - 文件已更新，包含正确的前端域名
   - 提交并推送到 Git：
     ```bash
     cd backend
     git add railway.toml
     git commit -m "更新 CORS 配置，添加前端域名"
     git push
     ```

2. **Railway 会自动读取并应用配置**
   - Railway 会检测到 `railway.toml` 的更改
   - 自动更新环境变量并重新部署

## 🔍 验证修复

部署完成后，验证步骤：

1. **清除浏览器缓存**
   - 按 `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac) 强制刷新

2. **检查前端页面**
   - 访问 `https://insurance-plateform-client.pages.dev`
   - 打开浏览器开发者工具 → Network 标签
   - 查看 API 请求是否成功（状态码 200）

3. **检查控制台**
   - 打开浏览器开发者工具 → Console 标签
   - 应该不再有 CORS 错误
   - 产品列表、省份列表等数据应该能正常加载

## 📝 当前配置

### 前端域名
- 用户端：`https://insurance-plateform-client.pages.dev`
- 后台管理端：`https://insurance-plateform-business.pages.dev`

### 后端 CORS 配置
```
ALLOWED_ORIGINS = https://insurance-plateform-business.pages.dev,https://insurance-plateform-client.pages.dev
```

## ⚠️ 注意事项

1. **域名必须完全匹配**
   - 包括协议（`https://`）
   - 包括完整的域名
   - 区分大小写（虽然域名通常不区分）

2. **多个域名用逗号分隔**
   - ✅ 正确：`domain1.com,domain2.com`
   - ❌ 错误：`domain1.com, domain2.com`（有空格）

3. **修改后必须重新部署**
   - 环境变量修改后，Railway 会自动重新部署
   - 等待部署完成后再测试

4. **如果还有问题**
   - 检查 Railway 部署日志，确认环境变量已更新
   - 检查后端日志，查看是否有 CORS 阻止的警告
   - 确认前端域名拼写正确

## 🔗 相关文档

- [Railway部署说明.md](./Railway部署说明.md) - Railway 部署详细说明
- [railway.toml](./railway.toml) - Railway 配置文件
