# 数据库脚本目录

此目录包含所有数据库相关的 SQL 脚本。

## 文件说明

### 数据库结构

- **`database_schema.sql`** - 数据库完整结构定义（表结构、索引等）
  - 用途：初始化数据库结构
  - 包含：所有表的创建语句

### 数据库迁移脚本

- **`database_migration_task1-12.sql`** - 任务1-12的数据库迁移脚本
  - 用途：执行任务1-12相关的数据库变更
  - 包含：表结构修改、数据迁移等

### 表扩展脚本

- **`database_create_regions_table.sql`** - 创建地区表的脚本
  - 用途：创建地区相关表结构
  - 包含：regions 表的创建语句

- **`database_extend_special_agreements.sql`** - 扩展特殊协议表的脚本
  - 用途：扩展特殊协议表结构
  - 包含：special_agreements 表的扩展语句

### 数据导入脚本

- **`完整数据导入-合并版.sql`** - 完整数据导入脚本（合并版）
  - 用途：导入完整的测试数据或初始数据
  - 包含：所有表的初始数据

## 使用顺序

### 初始化新数据库

1. 执行 `database_schema.sql` - 创建数据库结构
2. 执行 `database_create_regions_table.sql` - 创建地区表（如果需要）
3. 执行 `database_extend_special_agreements.sql` - 扩展特殊协议表（如果需要）
4. 执行 `database_migration_task1-12.sql` - 执行迁移（如果需要）
5. 执行 `完整数据导入-合并版.sql` - 导入数据（如果需要）

### 使用 Docker 初始化

```bash
# 使用根目录的脚本（会自动执行 database_schema.sql）
./使用Docker启动数据库.sh
```

### 手动执行

```bash
# 进入 MySQL
mysql -u root -p insurance_platform

# 或者使用 Docker
docker exec -it mysql-insurance mysql -uroot -p123456 insurance_platform

# 执行脚本
source database_schema.sql;
source 完整数据导入-合并版.sql;
```

## 注意事项

1. **执行顺序**：请按照上述顺序执行脚本
2. **备份数据**：在生产环境执行前，请先备份数据库
3. **字符编码**：确保使用 utf8mb4 字符集
4. **权限检查**：确保有足够的数据库权限

## 相关文档

- [数据库设计文档](../docs/数据库设计文档.md)
- [数据库初始化指南](../docs/数据库初始化指南.md)
- [数据库结构图](../docs/数据库结构图.md)
