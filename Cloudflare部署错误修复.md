# Cloudflare Pages 部署错误修复指南

## ❌ 错误信息

```
Failed: error occurred while running deploy command
If are uploading a directory of assets, you can either:
- Specify the path to the directory of assets via the command line: (ex: `npx wrangler deploy --assets=./dist`)
- Or create a "wrangler.jsonc" file containing: ...
```

## 🔍 问题原因

在 Cloudflare Pages 项目设置中，**部署命令（Deploy command）** 字段被设置为 `npx wrangler deploy`，这是**错误的配置**。

Cloudflare Pages 会自动部署构建产物，**不需要**手动指定 `wrangler deploy` 命令。

## ✅ 修复步骤

### 方法1：在 Cloudflare Pages 网页界面修复（推荐）

1. **登录 Cloudflare Pages**
   - 访问 https://pages.cloudflare.com
   - 找到你的项目：`insurance-platform-admin`

2. **进入项目设置**
   - 点击项目名称
   - 点击左侧菜单的 **"Settings"**（设置）
   - 找到 **"Builds & deployments"**（构建和部署）部分

3. **修改部署命令**
   - 找到 **"Deploy command"**（部署命令）字段
   - **将其留空或删除**（不要填写任何内容）
   - 点击 **"Save"**（保存）

4. **确认其他配置**
   确保以下配置正确：
   - ✅ **Build command**: `cd admin && npm install && npm run build`
   - ✅ **Build output directory**: `admin/dist`
   - ✅ **Root directory**: `/`（或留空）
   - ✅ **Deploy command**: **留空**（这是关键！）

5. **重新部署**
   - 点击 **"Deployments"**（部署）标签
   - 点击 **"Retry deployment"**（重试部署）
   - 或点击 **"Create deployment"**（创建部署）选择最新commit

### 方法2：使用 Wrangler CLI（不推荐，仅用于手动部署）

如果你确实需要使用 `wrangler deploy`（例如手动部署），需要指定正确的目录：

```bash
# 在项目根目录执行
cd admin
npm run build
npx wrangler pages deploy dist --project-name=insurance-platform-admin
```

但**不建议**在 Cloudflare Pages 的自动部署中使用这种方式。

## 📋 正确的 Cloudflare Pages 配置

### 后台管理前端配置

```
Project name: insurance-platform-admin
Production branch: main
Framework preset: Vite
Build command: cd admin && npm install && npm run build
Build output directory: admin/dist
Root directory: / (或留空)
Deploy command: (留空) ⚠️ 关键！
```

### 环境变量

```
VITE_API_BASE_URL = https://your-backend.railway.app/api
```

（等Railway部署完成后，替换为实际的后端地址）

## 🎯 为什么会出现这个错误？

1. **误解了 Cloudflare Pages 的工作方式**
   - Cloudflare Pages 是**静态网站托管服务**
   - 它会自动检测构建产物并部署
   - 不需要像 Cloudflare Workers 那样使用 `wrangler deploy`

2. **混淆了 Cloudflare Pages 和 Cloudflare Workers**
   - **Cloudflare Pages**: 用于静态网站，自动部署构建产物
   - **Cloudflare Workers**: 用于服务器端代码，需要使用 `wrangler deploy`

3. **可能参考了错误的文档**
   - 某些文档可能混淆了两种服务的部署方式

## ✅ 修复后的预期结果

修复后，构建日志应该显示：
- ✅ 构建成功：`npm run build` 完成
- ✅ 部署成功：自动上传 `admin/dist` 目录中的文件
- ✅ 部署完成：显示部署URL（例如：`https://insurance-platform-admin.pages.dev`）

## 🔗 相关文档

- [Cloudflare Pages 官方文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages 构建配置](https://developers.cloudflare.com/pages/platform/build-configuration/)

---

**修复完成后，记得重新触发部署！**
