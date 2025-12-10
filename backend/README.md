# 保险平台后端API服务

## 一、快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置数据库

1. 复制 `.env.example` 为 `.env`
2. 修改数据库配置：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=insurance_platform
```

3. 确保数据库已创建（执行 `database_schema.sql`）

### 3. 启动服务器

```bash
npm run dev
```

服务器将运行在 `http://localhost:3000`

### 4. 运行测试

```bash
npm test
```

---

## 二、API接口列表

### 2.1 保司相关

- **GET /api/insurance-companies** - 获取保司列表

### 2.2 产品相关

- **GET /api/products** - 获取产品列表
  - 查询参数: `company_code` (可选)
- **GET /api/products/:id** - 获取产品详情
- **GET /api/products/:id/plans** - 获取产品下的方案列表

### 2.3 方案相关

- **GET /api/plans/:id** - 获取方案详情
- **GET /api/plans/:id/liabilities** - 获取方案的责任配置

### 2.4 保费计算

- **POST /api/premium/calculate** - 计算保费
- **GET /api/premium/rates** - 查询费率

### 2.5 投保单相关

- **POST /api/applications** - 创建投保单
- **GET /api/applications/:id** - 获取投保单详情
- **POST /api/applications/:id/underwriting** - 提交核保

---

## 三、API使用示例

### 3.1 获取产品列表

```bash
curl http://localhost:3000/api/products
```

### 3.2 获取方案列表

```bash
curl http://localhost:3000/api/products/1/plans
```

### 3.3 获取方案责任配置

```bash
curl http://localhost:3000/api/plans/1/liabilities
```

### 3.4 计算保费

```bash
curl -X POST http://localhost:3000/api/premium/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "plan_id": 1,
    "liability_selections": [
      {"liability_id": 1, "coverage_amount": "30万"}
    ],
    "job_class": "1~3类",
    "insured_count": 10
  }'
```

### 3.5 创建投保单

```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "company_info": {
      "name": "测试企业",
      "credit_code": "91110000MA01234567",
      "province": "北京市",
      "city": "北京市",
      "district": "通州区",
      "address": "测试地址",
      "contact_name": "张三",
      "contact_phone": "13800138000",
      "contact_email": "test@example.com"
    },
    "product_id": 1,
    "plan_instances": [
      {
        "plan_id": 1,
        "plan_name": "方案一",
        "job_class": "1~3类",
        "duration": "1年",
        "insured_count": 10,
        "liability_selections": [
          {
            "liability_id": 1,
            "coverage_amount": "30万",
            "unit": "元"
          }
        ]
      }
    ],
    "effective_date": "2025-01-01",
    "expiry_date": "2026-01-01"
  }'
```

---

## 四、测试验证

### 4.1 运行测试脚本

```bash
npm test
```

测试脚本会依次测试：
1. ✅ 健康检查
2. ✅ 获取保司列表
3. ✅ 获取产品列表
4. ✅ 获取方案列表
5. ✅ 获取方案责任配置
6. ✅ 计算保费
7. ✅ 创建投保单

### 4.2 手动测试

使用 Postman 或 curl 测试各个接口。

---

## 五、数据结构

### 5.1 产品列表响应

```json
{
  "success": true,
  "data": [
    {
      "product_id": 1,
      "product_code": "PRODUCT_A",
      "product_name": "雇主责任险A",
      "product_type": "雇主责任险",
      "company_code": "LIBO",
      "company_name": "利宝保险"
    }
  ],
  "count": 1
}
```

### 5.2 方案列表响应

```json
{
  "success": true,
  "data": [
    {
      "plan_id": 1,
      "plan_code": "PLAN_01",
      "plan_name": "方案一",
      "job_class_range": "1~3类",
      "duration_options": ["1年", "6个月"],
      "payment_type": "一次交清"
    }
  ],
  "count": 1
}
```

### 5.3 方案责任配置响应

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "liability_id": 1,
      "liability_name": "意外身故伤残保险金",
      "is_required": true,
      "coverage_options": ["10万", "30万", "50万", "80万", "100万"],
      "default_coverage": "10万",
      "unit": "元",
      "display_order": 1
    }
  ],
  "count": 1
}
```

### 5.4 保费计算响应

```json
{
  "success": true,
  "data": {
    "premium_per_person": 81.00,
    "total_premium": 810.00,
    "insured_count": 10,
    "premium_details": [
      {
        "liability_id": 1,
        "coverage_amount": "30万",
        "base_rate": 0.0081,
        "rate_factor": 1.0,
        "premium": 81.00
      }
    ]
  }
}
```

---

## 六、错误处理

所有API都返回统一格式：

**成功**：
```json
{
  "success": true,
  "data": {...}
}
```

**失败**：
```json
{
  "success": false,
  "error": "错误描述",
  "message": "详细错误信息"
}
```

---

## 七、注意事项

1. **数据库连接**：确保数据库已创建并配置正确
2. **CORS配置**：已配置允许所有来源，生产环境需要限制
3. **错误处理**：所有错误都会记录到控制台
4. **事务处理**：创建投保单使用事务，确保数据一致性

---

## 八、开发建议

1. **添加认证**：生产环境需要添加JWT认证
2. **参数验证**：使用 joi 或 express-validator 进行参数验证
3. **日志记录**：使用 winston 等日志库记录详细日志
4. **API文档**：使用 Swagger 生成API文档

