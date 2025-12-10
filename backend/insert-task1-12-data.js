// 任务1-12数据插入脚本
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'insurance_platform',
  charset: 'utf8mb4'
});

console.log('✅ 数据库连接成功\n');

try {
  // 获取利宝保险公司ID
  const [companies] = await connection.execute(
    "INSERT IGNORE INTO insurance_companies (company_code, company_name, status) VALUES ('LIBO', '利宝保险有限公司', '启用')"
  );
  const [liboRows] = await connection.execute(
    "SELECT company_id FROM insurance_companies WHERE company_code = 'LIBO' LIMIT 1"
  );
  const liboCompanyId = liboRows[0].company_id;
  console.log(`📌 利宝保险公司ID: ${liboCompanyId}\n`);

  // 1. 插入所有条款
  console.log('📝 开始插入条款...');
  const clauses = [
    // 主险
    { code: '16M00031', name: '利宝保险有限公司雇主责任保险条款（2024版A款）', type: '主险', reg: 'C00006030912024080703473' },
    // 附加险
    { code: '16S00083', name: '住院津贴保险条款', type: '附加险', reg: 'C00006030922019123105012' },
    { code: '16S00136', name: '突发疾病死亡保险条款（A款）', type: '附加险', reg: 'C00006030922023100862251' },
    { code: '16S00066', name: '医疗费用范围扩展保险条款（A款）', type: '附加险', reg: 'C00006030922023020522733' },
    { code: '16S00063', name: '转院就医食宿交通费扩展条款', type: '附加险', reg: 'C00006030922019122511161' },
    { code: '16S00079', name: '残疾辅助器具费用保险条款（A款）', type: '附加险', reg: 'C00006030922023020522603' },
    { code: '16S00162', name: '二十四小时责任扩展保险条款（C款）', type: '附加险', reg: 'C00006030922023100862221' },
    // 特约
    { code: 'H00006030922016112922541', name: '高风险工种除外特约', type: '特约', reg: 'H00006030922016112922541' },
    { code: 'C00006031922021012002402', name: '附加传染病责任免除条款', type: '特约', reg: 'C00006031922021012002402' },
    { code: 'C00006030922023040461183', name: '附加雇员承保年龄保险条款', type: '特约', reg: 'C00006030922023040461183' },
    { code: 'C00006030922023040461193', name: '附加雇员高风险职业除外保险条款', type: '特约', reg: 'C00006030922023040461193' },
    { code: 'C00006030922023040461203', name: '附加雇员列明承保职业保险条款', type: '特约', reg: 'C00006030922023040461203' },
    { code: 'C00006030922023020522683', name: '附加伤残赔偿比例调整保险条款（A款）', type: '特约', reg: 'C00006030922023020522683' },
    { code: 'C00006030922023040461263', name: '附加提前三十天通知解除合同保险条款', type: '特约', reg: 'C00006030922023040461263' },
    { code: 'C00006030922023040461270', name: '附加四十八小时内及时报案通知保险条款', type: '特约', reg: 'C00006030922023040461270' },
    { code: 'SE0684', name: '已退保雇员保险金扣除特别约定', type: '特约', reg: 'SE0684' },
    { code: 'SE7372', name: '责任险高空作业除外特约', type: '特约', reg: 'SE7372' }
  ];

  let clauseMap = {};
  for (const clause of clauses) {
    const [result] = await connection.execute(
      `INSERT INTO insurance_clauses (company_id, clause_code, clause_name, clause_type, registration_no, status)
       VALUES (?, ?, ?, ?, ?, '启用')
       ON DUPLICATE KEY UPDATE clause_name = VALUES(clause_name), registration_no = VALUES(registration_no)`,
      [liboCompanyId, clause.code, clause.name, clause.type, clause.reg]
    );
    const [rows] = await connection.execute(
      "SELECT clause_id FROM insurance_clauses WHERE company_id = ? AND clause_code = ? LIMIT 1",
      [liboCompanyId, clause.code]
    );
    clauseMap[clause.code] = rows[0].clause_id;
    console.log(`  ✅ ${clause.code}: ${clause.name}`);
  }

  console.log(`\n✅ 条款插入完成，共 ${Object.keys(clauseMap).length} 条\n`);

  // 2. 插入主险责任
  console.log('📝 开始插入主险责任...');
  const mainClauseId = clauseMap['16M00031'];
  const mainLiabilities = [
    { code: '01824', name: '死亡/伤残(不含突发疾病和职业病)', type: '身故', unit: '金额', desc: '死亡/伤残赔偿，不含突发疾病和职业病' },
    { code: '0037', name: '医疗费用', type: '医疗', unit: '金额', desc: '医疗费用赔偿' },
    { code: '0040', name: '误工费用', type: '其他', unit: '天数', desc: '误工费用赔偿' }
  ];

  for (const liab of mainLiabilities) {
    await connection.execute(
      `INSERT INTO company_liabilities (company_id, liability_code, liability_name, liability_type, unit_type, description, is_additional, clause_id, status)
       VALUES (?, ?, ?, ?, ?, ?, FALSE, ?, '启用')
       ON DUPLICATE KEY UPDATE liability_name = VALUES(liability_name), is_additional = VALUES(is_additional), clause_id = VALUES(clause_id)`,
      [liboCompanyId, liab.code, liab.name, liab.type, liab.unit, liab.desc, mainClauseId]
    );
    console.log(`  ✅ ${liab.code}: ${liab.name}`);
  }

  // 3. 插入附加险责任
  console.log('\n📝 开始插入附加险责任...');
  const additionalLiabilities = [
    { code: '00420', name: '住院津贴', type: '津贴', unit: '天数', desc: '住院津贴赔偿', clauseCode: '16S00083' },
    { code: '01671', name: '附加突发疾病死亡', type: '身故', unit: '金额', desc: '附加突发疾病死亡赔偿', clauseCode: '16S00136' },
    { code: '0509', name: '医疗费用范围扩展', type: '医疗', unit: '金额', desc: '医疗费用范围扩展赔偿', clauseCode: '16S00066' },
    { code: '00481', name: '转院就医食宿交通费', type: '其他', unit: '金额', desc: '转院就医食宿交通费赔偿', clauseCode: '16S00063' },
    { code: '00478', name: '残疾辅助器具费用', type: '其他', unit: '金额', desc: '残疾辅助器具费用赔偿', clauseCode: '16S00079' },
    { code: '01521', name: '二十四小时责任死亡/伤残', type: '身故', unit: '金额', desc: '二十四小时责任死亡/伤残赔偿', clauseCode: '16S00162' },
    { code: '01522', name: '二十四小时责任医疗费用', type: '医疗', unit: '金额', desc: '二十四小时责任医疗费用赔偿', clauseCode: '16S00162' },
    { code: '01525', name: '二十四小时责任误工费用', type: '其他', unit: '天数', desc: '二十四小时责任误工费用赔偿', clauseCode: '16S00162' },
    { code: '01524', name: '二十四小时责任住院津贴', type: '津贴', unit: '天数', desc: '二十四小时责任住院津贴赔偿', clauseCode: '16S00162' }
  ];

  for (const liab of additionalLiabilities) {
    const clauseId = clauseMap[liab.clauseCode];
    await connection.execute(
      `INSERT INTO company_liabilities (company_id, liability_code, liability_name, liability_type, unit_type, description, is_additional, clause_id, status)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, ?, '启用')
       ON DUPLICATE KEY UPDATE liability_name = VALUES(liability_name), is_additional = VALUES(is_additional), clause_id = VALUES(clause_id)`,
      [liboCompanyId, liab.code, liab.name, liab.type, liab.unit, liab.desc, clauseId]
    );
    console.log(`  ✅ ${liab.code}: ${liab.name}`);
  }

  // 4. 插入特别约定
  console.log('\n📝 开始插入特别约定...');
  const [deathLiability] = await connection.execute(
    "SELECT liability_id FROM company_liabilities WHERE company_id = ? AND liability_code = '01824' LIMIT 1",
    [liboCompanyId]
  );
  const deathLiabilityId = deathLiability[0]?.liability_id;

  const agreements = [
    { clauseCode: 'H00006030922016112922541', linked: false, order: 1 },
    { clauseCode: 'C00006031922021012002402', linked: false, order: 2 },
    { clauseCode: 'C00006030922023040461183', linked: true, order: 3 },
    { clauseCode: 'C00006030922023040461193', linked: false, order: 4 },
    { clauseCode: 'C00006030922023040461203', linked: true, order: 5 },
    { clauseCode: 'C00006030922023020522683', linked: true, order: 6 },
    { clauseCode: 'C00006030922023040461263', linked: false, order: 7 },
    { clauseCode: 'C00006030922023040461270', linked: false, order: 8 },
    { clauseCode: 'SE0684', linked: false, order: 9 },
    { clauseCode: 'SE7372', linked: false, order: 10 }
  ];

  for (const agmt of agreements) {
    const clauseId = clauseMap[agmt.clauseCode];
    const [clauseRows] = await connection.execute(
      "SELECT clause_code, clause_name, registration_no FROM insurance_clauses WHERE clause_id = ? LIMIT 1",
      [clauseId]
    );
    const clause = clauseRows[0];
    
    await connection.execute(
      `INSERT INTO special_agreements (company_id, clause_id, liability_id, agreement_code, agreement_name, registration_no, is_linked, display_order, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '启用')
       ON DUPLICATE KEY UPDATE agreement_name = VALUES(agreement_name), clause_id = VALUES(clause_id), liability_id = VALUES(liability_id)`,
      [
        liboCompanyId,
        clauseId,
        agmt.linked ? deathLiabilityId : null,
        clause.clause_code,
        clause.clause_name,
        clause.registration_no,
        agmt.linked,
        agmt.order
      ]
    );
    console.log(`  ✅ ${clause.clause_name}`);
  }

  // 5. 验证结果
  console.log('\n📊 验证插入结果...');
  const [clauseCount] = await connection.execute("SELECT clause_type, COUNT(*) as count FROM insurance_clauses WHERE company_id = ? GROUP BY clause_type", [liboCompanyId]);
  const [liabilityCount] = await connection.execute("SELECT is_additional, COUNT(*) as count FROM company_liabilities WHERE company_id = ? GROUP BY is_additional", [liboCompanyId]);
  const [agreementCount] = await connection.execute("SELECT COUNT(*) as count FROM special_agreements WHERE company_id = ?", [liboCompanyId]);

  console.log('\n条款统计:');
  clauseCount.forEach(row => console.log(`  ${row.clause_type}: ${row.count} 条`));
  console.log('\n责任统计:');
  liabilityCount.forEach(row => console.log(`  ${row.is_additional ? '附加险' : '主险'}: ${row.count} 条`));
  console.log(`\n特别约定: ${agreementCount[0].count} 条`);

  console.log('\n✅ 任务1-12数据插入完成！');
  
} catch (error) {
  console.error('❌ 错误:', error.message);
  console.error(error);
} finally {
  await connection.end();
}

