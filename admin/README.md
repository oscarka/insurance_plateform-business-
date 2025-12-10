# 保险平台后台管理系统

## 技术栈

- **React 18** - UI框架
- **TypeScript** - 类型支持
- **Ant Design 5** - UI组件库
- **React Router 6** - 路由管理
- **Vite** - 构建工具
- **Axios** - HTTP客户端

## 项目结构

```
admin/
├── src/
│   ├── layouts/          # 布局组件
│   │   └── AdminLayout.tsx
│   ├── pages/            # 页面组件
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── InsuranceCompanyList.tsx
│   │   ├── LiabilityList.tsx
│   │   ├── ProductList.tsx
│   │   ├── PlanList.tsx
│   │   ├── PlanLiabilityConfig.tsx  # 核心功能：方案责任配置
│   │   ├── RateList.tsx
│   │   ├── ApiConfigList.tsx
│   │   └── ConfigImport.tsx
│   ├── utils/            # 工具函数
│   │   └── api.ts        # API封装
│   ├── App.tsx           # 根组件
│   ├── main.tsx          # 入口文件
│   └── index.css         # 全局样式
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 安装和运行

### 1. 安装依赖

```bash
cd admin
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:3001

### 3. 构建生产版本

```bash
npm run build
```

## 核心功能

### 1. 方案责任配置（最重要）

**页面路径**：`/admin/plans/:planId/liabilities`

**功能**：
- 查看方案的责任配置列表
- 添加责任配置
- 编辑责任配置
- 删除责任配置
- 配置保额选项（支持多个选项，用逗号分隔）

**使用流程**：
1. 进入方案管理页面
2. 点击"配置责任"按钮
3. 在方案责任配置页面添加/编辑责任
4. 配置每个责任的保额选项

### 2. 其他功能模块

- **保司管理**：管理对接的保险公司
- **责任管理**：管理保司的责任类型
- **产品管理**：管理保司的产品
- **方案管理**：管理产品的方案
- **费率配置**：配置费率信息
- **接口配置**：配置保司接口信息
- **配置导入**：通过配置文件批量导入

## API接口

所有API接口都在 `src/utils/api.ts` 中封装，需要连接后端API。

示例：
```typescript
// 获取方案列表
const plans = await api.get('/plans', { params: { product_id: 1 } });

// 获取方案的责任配置
const liabilities = await api.get(`/plans/${planId}/liabilities`);

// 创建责任配置
await api.post(`/plans/${planId}/liabilities`, data);
```

## 开发说明

### 添加新页面

1. 在 `src/pages/` 目录下创建新组件
2. 在 `src/App.tsx` 中添加路由
3. 在 `src/layouts/AdminLayout.tsx` 中添加菜单项

### 样式定制

Ant Design 的主题可以通过 `ConfigProvider` 组件定制，在 `src/main.tsx` 中配置。

## 注意事项

1. 所有API调用都是模拟的，需要连接真实的后端API
2. 登录功能需要实现真实的认证逻辑
3. 文件上传功能需要实现真实的上传逻辑
4. 配置文件解析需要实现YAML/JSON解析逻辑

