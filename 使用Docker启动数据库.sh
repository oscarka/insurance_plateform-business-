#!/bin/bash

# 使用Docker启动MySQL数据库（带正确的字符集配置）

# 检查容器是否已存在
if [ "$(docker ps -a | grep mysql-insurance)" ]; then
    echo "⚠️  发现已存在的MySQL容器，正在删除..."
    docker stop mysql-insurance 2>/dev/null
    docker rm mysql-insurance 2>/dev/null
fi

# 创建新的MySQL容器
echo "🚀 创建MySQL容器（utf8mb4字符集）..."
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

# 等待MySQL启动
echo "⏳ 等待MySQL启动（10秒）..."
sleep 10

# 检查MySQL是否就绪
if docker exec mysql-insurance mysqladmin ping -h localhost -uroot -p123456 --silent 2>/dev/null; then
    echo "✅ MySQL已就绪"
else
    echo "❌ MySQL启动失败，请检查日志：docker logs mysql-insurance"
    exit 1
fi

# 初始化数据库结构
echo "📦 初始化数据库结构..."
docker exec -i mysql-insurance mysql -uroot -p123456 --default-character-set=utf8mb4 insurance_platform < database_schema.sql 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 数据库结构初始化完成"
else
    echo "⚠️  数据库结构初始化可能有问题，请检查"
fi

# 插入测试数据
echo "📝 插入测试数据..."
docker exec -i mysql-insurance mysql -uroot -p123456 --default-character-set=utf8mb4 insurance_platform < backend/init-test-data.sql 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 测试数据插入完成"
else
    echo "⚠️  测试数据插入可能有问题，请检查"
fi

# 验证数据
echo "🔍 验证数据编码..."
docker exec -i mysql-insurance mysql -uroot -p123456 insurance_platform -e "SELECT product_id, product_name, status, HEX(status) as status_hex FROM insurance_products LIMIT 1;" 2>/dev/null

echo ""
echo "🎉 MySQL数据库初始化完成！"
echo ""
echo "连接信息："
echo "  Host: localhost"
echo "  Port: 3306"
echo "  Database: insurance_platform"
echo "  User: root"
echo "  Password: 123456"
echo ""
echo "常用命令："
echo "  查看日志: docker logs mysql-insurance"
echo "  停止容器: docker stop mysql-insurance"
echo "  启动容器: docker start mysql-insurance"
echo "  进入MySQL: docker exec -it mysql-insurance mysql -uroot -p123456 insurance_platform"
