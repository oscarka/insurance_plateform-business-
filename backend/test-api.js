// API测试脚本
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = `http://localhost:${process.env.PORT || 8888}/api`;

// 测试函数
const test = async (name, fn) => {
  console.log(`\n🧪 测试: ${name}`);
  try {
    await fn();
    console.log(`✅ 通过: ${name}`);
  } catch (error) {
    console.error(`❌ 失败: ${name}`);
    console.error(`   错误: ${error.message}`);
  }
};

// 测试健康检查
const testHealth = async () => {
  const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
  const data = await response.json();
  if (data.status !== 'ok') {
    throw new Error('健康检查失败');
  }
};

// 测试获取保司列表
const testGetCompanies = async () => {
  const response = await fetch(`${API_BASE_URL}/insurance-companies`);
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || '获取保司列表失败');
  }
  console.log(`   返回 ${result.count} 个保司`);
};

// 测试获取产品列表
const testGetProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || '获取产品列表失败');
  }
  console.log(`   返回 ${result.count} 个产品`);
  if (result.data.length > 0) {
    console.log(`   产品: ${result.data[0].product_name} (ID: ${result.data[0].product_id})`);
  }
  return result.data[0]?.product_id; // 返回第一个产品ID用于后续测试
};

// 测试获取方案列表
const testGetPlans = async (productId) => {
  if (!productId) {
    console.log('   跳过：没有可用的产品ID');
    return null;
  }
  const response = await fetch(`${API_BASE_URL}/products/${productId}/plans`);
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || '获取方案列表失败');
  }
  console.log(`   返回 ${result.count} 个方案`);
  if (result.data.length > 0) {
    console.log(`   方案: ${result.data[0].plan_name} (ID: ${result.data[0].plan_id})`);
  }
  return result.data[0]?.plan_id; // 返回第一个方案ID用于后续测试
};

// 测试获取方案责任配置
const testGetPlanLiabilities = async (planId) => {
  if (!planId) {
    console.log('   跳过：没有可用的方案ID');
    return;
  }
  const response = await fetch(`${API_BASE_URL}/plans/${planId}/liabilities`);
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || '获取方案责任配置失败');
  }
  console.log(`   返回 ${result.count} 个责任配置`);
  if (result.data.length > 0) {
    console.log(`   示例责任: ${result.data[0].liability_name}`);
    console.log(`   保额选项: ${result.data[0].coverage_options.join(', ')}`);
  }
};

// 测试计算保费
const testCalculatePremium = async (productId, planId) => {
  if (!productId || !planId) {
    console.log('   跳过：缺少必要参数');
    return;
  }
  
  // 先获取方案的责任配置
  const liabilitiesResponse = await fetch(`${API_BASE_URL}/plans/${planId}/liabilities`);
  const liabilitiesResult = await liabilitiesResponse.json();
  
  if (!liabilitiesResult.success || liabilitiesResult.data.length === 0) {
    console.log('   跳过：没有可用的责任配置');
    return;
  }
  
  const liability = liabilitiesResult.data[0];
  const coverageAmount = liability.coverage_options[0] || '10万';
  
  const response = await fetch(`${API_BASE_URL}/premium/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      plan_id: planId,
      liability_selections: [
        {
          liability_id: liability.liability_id,
          coverage_amount: coverageAmount,
        },
      ],
      job_class: '1~3类',
      insured_count: 1,
    }),
  });
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || '计算保费失败');
  }
  console.log(`   每人保费: ¥${result.data.premium_per_person}`);
  console.log(`   总保费: ¥${result.data.total_premium}`);
};

// 测试创建投保单
const testCreateApplication = async (productId, planId) => {
  if (!productId || !planId) {
    console.log('   跳过：缺少必要参数');
    return;
  }
  
  // 先获取方案的责任配置
  const liabilitiesResponse = await fetch(`${API_BASE_URL}/plans/${planId}/liabilities`);
  const liabilitiesResult = await liabilitiesResponse.json();
  
  if (!liabilitiesResult.success || liabilitiesResult.data.length === 0) {
    console.log('   跳过：没有可用的责任配置');
    return;
  }
  
  const liability = liabilitiesResult.data[0];
  const coverageAmount = liability.coverage_options[0] || '10万';
  
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_info: {
        name: '测试企业',
        credit_code: 'TEST' + Date.now(),
        province: '北京市',
        city: '北京市',
        district: '通州区',
        address: '测试地址',
        contact_name: '测试联系人',
        contact_phone: '13800138000',
        contact_email: 'test@example.com',
      },
      product_id: productId,
      plan_instances: [
        {
          plan_id: planId,
          plan_name: '测试方案',
          job_class: '1~3类',
          duration: '1年',
          insured_count: 1,
          liability_selections: [
            {
              liability_id: liability.liability_id,
              coverage_amount: coverageAmount,
              unit: liability.unit,
            },
          ],
        },
      ],
      effective_date: '2025-01-01',
      expiry_date: '2026-01-01',
    }),
  });
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || '创建投保单失败');
  }
  console.log(`   投保单号: ${result.data.application_no}`);
  console.log(`   投保单ID: ${result.data.application_id}`);
};

// 运行所有测试
const runTests = async () => {
  console.log('🚀 开始API测试\n');
  console.log('='.repeat(50));
  
  await test('健康检查', testHealth);
  
  await test('获取保司列表', testGetCompanies);
  
  let productId;
  await test('获取产品列表', async () => {
    productId = await testGetProducts();
  });
  
  let planId;
  await test('获取方案列表', async () => {
    planId = await testGetPlans(productId);
  });
  
  await test('获取方案责任配置', async () => {
    await testGetPlanLiabilities(planId);
  });
  
  await test('计算保费', async () => {
    await testCalculatePremium(productId, planId);
  });
  
  await test('创建投保单', async () => {
    await testCreateApplication(productId, planId);
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ 测试完成');
};

// 等待服务器启动
setTimeout(() => {
  runTests().catch(console.error);
}, 2000);

