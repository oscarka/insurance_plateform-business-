# Docker MySQL 重新初始化说明

## 一、已执行的操作

### 1. 删除旧容器 ✅
```bash
docker stop mysql-insurance
docker rm mysql-insurance
```

### 2. 创建新容器（带正确的字符集配置）✅
```bash
docker run -d \
  --name mysql-insurance \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=insurance_platform \
  -e MYSQL_CHARSET=utf8mb4 \
  -e MYSQL_COLLATION=utf8mb4_unicode_ci \
  -p 3306:3306 \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci \
  --default-authentication-plugin=mysql_native_password
```

**关键配置**：
- `MYSQL_CHARSET=utf8mb4`：数据库默认字符集
- `MYSQL_COLLATION=utf8mb4_unicode_ci`：数据库默认排序规则
- `--character-set-server=utf8mb4`：MySQL服务器默认字符集
- `--collation-server=utf8mb4_unicode_ci`：MySQL服务器默认排序规则

### 3. 初始化数据库结构 ✅
```bash
docker exec -i mysql-insurance mysql -uroot -p123456 insurance_platform < database_schema.sql
```

### 4. 插入测试数据 ✅
```bash
docker exec -i mysql-insurance mysql -uroot -p123456 insurance_platform < backend/init-test-data.sql
```

---

## 二、验证

### 1. 检查MySQL字符集配置
```bash
docker exec -i mysql-insurance mysql -uroot -p123456 -e "SHOW VARIABLES LIKE 'character%';"
```

应该看到：
- `character_set_server`: utf8mb4 ✅
- `character_set_database`: utf8mb4 ✅

### 2. 检查数据编码
```bash
docker exec -i mysql-insurance mysql -uroot -p123456 insurance_platform -e "SELECT product_id, product_name, status, HEX(status) FROM insurance_products;"
```

正确的HEX值应该是：`E590AFE794A8`（"启用"的UTF-8编码）

### 3. 测试API
```bash
curl http://localhost:8888/api/products
```

应该返回正确的UTF-8字符，没有乱码。

---

## 三、优势

### 1. 从源头解决 ✅
- 数据库创建时就使用正确的字符集
- 不需要修复旧数据
- 避免编码转换错误

### 2. 配置统一 ✅
- 数据库、表、字段都使用utf8mb4
- MySQL服务器默认也是utf8mb4
- 连接字符集通过代码设置

### 3. 数据干净 ✅
- 所有数据从一开始就是正确的UTF-8编码
- 不会出现乱码问题

---

## 四、后续使用

### 启动MySQL容器
```bash
docker start mysql-insurance
```

### 停止MySQL容器
```bash
docker stop mysql-insurance
```

### 查看日志
```bash
docker logs mysql-insurance
```

### 进入MySQL命令行
```bash
docker exec -it mysql-insurance mysql -uroot -p123456 insurance_platform
```

---

## 五、注意事项

1. **数据备份**：如果之前有重要数据，记得先备份
2. **连接配置**：确保后端连接池配置正确（已在 `backend/config/database.js` 中设置）
3. **测试数据**：重新初始化后，需要重新插入测试数据

---

**现在数据库已经重新初始化，字符集配置正确，应该不会再有乱码问题了！** 🎉

