/**
 * 系统页面自动截图脚本
 * 使用 Puppeteer 自动访问系统所有页面并截图保存
 * 
 * 使用方法：
 * 1. 确保系统正在运行（前端和后端都已启动）
 * 2. 安装依赖：npm install
 * 3. 运行脚本：node screenshot-pages.cjs
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  // 用户端地址（Vite默认端口5173）
  clientUrl: 'http://localhost:5173',
  // 后台管理端地址（Vite默认端口5174）
  adminUrl: 'http://localhost:5174',
  // 截图保存目录（相对于脚本所在目录）
  screenshotDir: path.join(__dirname, '..', '..', 'screenshots'),
  // 等待页面加载的时间（毫秒）
  waitTime: 3000,
  // 视口大小
  viewport: {
    width: 1920,
    height: 1080
  },
  // 测试账号（如果需要自动登录）
  testAccounts: {
    client: {
      username: process.env.CLIENT_USERNAME || '',
      password: process.env.CLIENT_PASSWORD || ''
    },
    admin: {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    }
  }
};

// 需要截图的页面列表
const pages = {
  // 用户端页面
  client: [
    {
      name: '登录页',
      url: '/login',
      description: '用户登录页面'
    },
    {
      name: '我的保单',
      url: '/dashboard',
      description: '保单列表页面',
      requiresAuth: true
    },
    {
      name: '立即投保-步骤1',
      url: '/new-policy',
      description: '投保页面-选择投保方案',
      requiresAuth: true,
      waitForSelector: '.bg-white' // 等待内容加载
    },
    {
      name: '保单详情',
      url: '/policy/1',
      description: '保单详情页面',
      requiresAuth: true
    },
    {
      name: '草稿管理',
      url: '/drafts',
      description: '保单草稿列表页面',
      requiresAuth: true
    },
    {
      name: '批改申请',
      url: '/endorsements',
      description: '批改申请页面',
      requiresAuth: true
    },
    {
      name: '续保申请',
      url: '/renewals',
      description: '续保申请页面',
      requiresAuth: true
    },
    {
      name: '发票管理',
      url: '/invoices',
      description: '发票列表页面',
      requiresAuth: true
    },
    {
      name: '常见问题',
      url: '/faq',
      description: '常见问题页面',
      requiresAuth: true
    }
  ],
  // 后台管理端页面
  admin: [
    {
      name: '登录页',
      url: '/login',
      description: '管理员登录页面'
    },
    {
      name: '仪表盘',
      url: '/admin/dashboard',
      description: '后台管理首页',
      requiresAuth: true
    },
    {
      name: '保险公司管理',
      url: '/admin/insurance-companies',
      description: '保险公司列表页面',
      requiresAuth: true
    },
    {
      name: '产品管理',
      url: '/admin/products',
      description: '产品列表页面',
      requiresAuth: true
    },
    {
      name: '方案管理',
      url: '/admin/plans',
      description: '方案列表页面',
      requiresAuth: true
    },
    {
      name: '责任管理',
      url: '/admin/liabilities',
      description: '责任列表页面',
      requiresAuth: true
    },
    {
      name: '条款管理',
      url: '/admin/clauses',
      description: '条款列表页面',
      requiresAuth: true
    },
    {
      name: '费率管理',
      url: '/admin/rates',
      description: '费率列表页面',
      requiresAuth: true
    },
    {
      name: '拦截规则管理',
      url: '/admin/interception-rules',
      description: '拦截规则列表页面',
      requiresAuth: true
    },
    {
      name: '投保单管理',
      url: '/admin/applications',
      description: '投保单列表页面',
      requiresAuth: true
    },
    {
      name: '企业客户管理',
      url: '/admin/companies',
      description: '企业客户列表页面',
      requiresAuth: true
    },
    {
      name: '接口配置管理',
      url: '/admin/api-configs',
      description: '接口配置列表页面',
      requiresAuth: true
    },
    {
      name: '配置导入',
      url: '/admin/config-import',
      description: '配置导入页面',
      requiresAuth: true
    },
    {
      name: '数据统计',
      url: '/admin/statistics',
      description: '数据统计页面',
      requiresAuth: true
    },
    {
      name: '系统日志',
      url: '/admin/system-logs',
      description: '系统日志页面',
      requiresAuth: true
    }
  ]
};

// 创建截图目录
function createScreenshotDir() {
  const dirs = [
    path.join(config.screenshotDir, '用户端'),
    path.join(config.screenshotDir, '后台管理端')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ 创建目录: ${dir}`);
    }
  });
}

// 登录函数
async function login(page, baseUrl, isAdmin = false) {
  try {
    const loginUrl = `${baseUrl}${isAdmin ? '/admin/login' : '/login'}`;
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });
    
    // 等待页面加载完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 检查是否已经登录
    const isLoggedIn = await page.evaluate(() => {
      return localStorage.getItem('isAuth') === 'true' || 
             localStorage.getItem('token') !== null ||
             localStorage.getItem('admin_token') !== null ||
             document.cookie.includes('token') ||
             !window.location.href.includes('/login');
    });
    
    if (isLoggedIn) {
      console.log(`   ✅ 已登录，跳过登录步骤`);
      return true;
    }
    
    // 测试环境：账号密码已自动填充，直接点击登录按钮
    console.log(`   🔐 测试环境：账号密码已自动填充，直接点击登录...`);
    
    try {
      // 等待页面加载完成
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 尝试多种方式点击登录按钮
      let clicked = false;
      
      // 方式1：查找包含"登录"文本的按钮
      try {
        const loginButtons = await page.$$eval('button', buttons => {
          return buttons
            .map((btn, index) => ({
              index,
              text: btn.textContent?.trim() || '',
              type: btn.type,
              className: btn.className
            }))
            .filter(btn => 
              btn.text.includes('登录') || 
              btn.text.includes('登陆') || 
              btn.text.includes('立即登录') ||
              (btn.type === 'submit' && btn.text.length > 0)
            );
        });
        
        if (loginButtons.length > 0) {
          const buttonIndex = loginButtons[0].index;
          await page.evaluate((index) => {
            const buttons = document.querySelectorAll('button');
            if (buttons[index]) {
              buttons[index].click();
            }
          }, buttonIndex);
          clicked = true;
          console.log(`   ✅ 点击登录按钮: "${loginButtons[0].text}"`);
        }
      } catch (e) {
        console.log(`   ⚠️  方式1失败: ${e.message}`);
      }
      
      // 方式2：如果方式1失败，尝试查找submit类型的按钮
      if (!clicked) {
        try {
          const submitButton = await page.$('button[type="submit"]');
          if (submitButton) {
            await submitButton.click();
            clicked = true;
            console.log(`   ✅ 点击submit按钮`);
          }
        } catch (e) {
          console.log(`   ⚠️  方式2失败: ${e.message}`);
        }
      }
      
      // 方式3：如果还是失败，尝试Ant Design的按钮
      if (!clicked) {
        try {
          const antButton = await page.$('.ant-btn-primary, button.ant-btn-primary');
          if (antButton) {
            await antButton.click();
            clicked = true;
            console.log(`   ✅ 点击Ant Design按钮`);
          }
        } catch (e) {
          console.log(`   ⚠️  方式3失败: ${e.message}`);
        }
      }
      
      // 方式4：查找所有按钮，点击第一个包含"登录"的
      if (!clicked) {
        try {
          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const loginBtn = buttons.find(btn => {
              const text = btn.textContent?.trim() || '';
              return text.includes('登录') || text.includes('登陆') || text.includes('立即登录');
            });
            if (loginBtn) {
              loginBtn.click();
              return true;
            }
            return false;
          });
          clicked = true;
          console.log(`   ✅ 通过evaluate点击登录按钮`);
        } catch (e) {
          console.log(`   ⚠️  方式4失败: ${e.message}`);
        }
      }
      
      if (clicked) {
        // 等待登录完成
        console.log(`   ⏳ 等待登录完成...`);
        
        // 等待页面跳转（登录成功后通常会跳转）
        try {
          await page.waitForNavigation({ 
            waitUntil: 'networkidle2', 
            timeout: 8000 
          }).catch(() => {
            // 如果导航超时，继续
          });
        } catch (e) {
          // 导航可能已经完成或不需要导航
        }
        
        // 等待一下确保状态更新
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 检查登录是否成功（通过URL和localStorage）
        try {
          const loginSuccess = await page.evaluate(() => {
            try {
              const currentUrl = window.location.href;
              const isAuth = localStorage.getItem('isAuth') === 'true' || 
                            localStorage.getItem('token') !== null ||
                            localStorage.getItem('admin_token') !== null;
              const notOnLoginPage = !currentUrl.includes('/login');
              return notOnLoginPage && isAuth;
            } catch (e) {
              // 如果访问localStorage失败，只检查URL
              const currentUrl = window.location.href;
              return !currentUrl.includes('/login');
            }
          });
          
          if (loginSuccess) {
            console.log(`   ✅ 登录成功`);
            return true;
          }
        } catch (e) {
          // localStorage访问可能被拒绝，只检查URL
          const currentUrl = page.url();
          if (!currentUrl.includes('/login')) {
            console.log(`   ✅ 登录成功（通过URL判断）`);
            return true;
          }
        }
        
        // 如果检查失败，再等待一下重试
        console.log(`   ⚠️  登录状态检查未通过，等待后重试...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const retryCheck = await page.evaluate(() => {
            try {
              return localStorage.getItem('isAuth') === 'true' || 
                     localStorage.getItem('token') !== null ||
                     localStorage.getItem('admin_token') !== null;
            } catch (e) {
              return false;
            }
          });
          
          if (retryCheck) {
            console.log(`   ✅ 登录成功（重试检查）`);
            return true;
          }
        } catch (e) {
          // 如果还是失败，检查URL
          const currentUrl = page.url();
          if (!currentUrl.includes('/login')) {
            console.log(`   ✅ 登录成功（通过URL判断，重试）`);
            return true;
          }
        }
      }
    } catch (e) {
      console.log(`   ⚠️  自动点击登录失败: ${e.message}`);
    }
    
    // 自动登录失败，但测试环境可能已经自动登录了
    console.log(`   ⚠️  自动登录流程未完成，等待3秒后检查登录状态...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 最后检查一次登录状态
    const finalCheck = await page.evaluate(() => {
      return localStorage.getItem('isAuth') === 'true' || 
             localStorage.getItem('token') !== null ||
             localStorage.getItem('admin_token') !== null;
    });
    
    if (finalCheck) {
      console.log(`   ✅ 检测到已登录状态，继续`);
      return true;
    }
    
    // 如果还是没登录，返回false让脚本跳过这个页面
    console.log(`   ❌ 未检测到登录状态，跳过此页面`);
    return false;
  } catch (error) {
    console.error(`   ❌ 登录失败: ${error.message}`);
    return false;
  }
}

// 截图单个页面
async function screenshotPage(browser, pageConfig, baseUrl, category, loginPage = null) {
  const page = await browser.newPage();
  
  try {
    // 设置视口大小
    await page.setViewport(config.viewport);
    
    // 如果需要登录，先复制登录状态
    if (pageConfig.requiresAuth && loginPage) {
      // 复制cookies
      const cookies = await loginPage.cookies();
      await page.setCookie(...cookies);
      
      // 复制localStorage
      const localStorageData = await loginPage.evaluate(() => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          data[key] = localStorage.getItem(key);
        }
        return data;
      });
      
      await page.goto('about:blank');
      await page.evaluate((data) => {
        for (const key in data) {
          localStorage.setItem(key, data[key]);
        }
      }, localStorageData);
    }
    
    // 构建完整URL
    const fullUrl = `${baseUrl}${pageConfig.url}`;
    console.log(`\n📸 正在截图: ${pageConfig.name}`);
    console.log(`   URL: ${fullUrl}`);
    
    // 访问页面
    await page.goto(fullUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // 检查是否需要登录
    const currentUrl = page.url();
    if (currentUrl.includes('/login') && pageConfig.requiresAuth) {
      console.log(`   ⚠️  需要登录，尝试登录...`);
      const isAdmin = baseUrl.includes('admin') || fullUrl.includes('/admin');
      const loginSuccess = await login(page, baseUrl, isAdmin);
      if (!loginSuccess) {
        console.log(`   ❌ 登录失败，跳过此页面`);
        return null;
      }
      // 重新访问目标页面
      await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    } else if (pageConfig.requiresAuth) {
      // 即使不在登录页，也检查一下登录状态
      const isLoggedIn = await page.evaluate(() => {
        return localStorage.getItem('isAuth') === 'true' || 
               localStorage.getItem('token') !== null ||
               localStorage.getItem('admin_token') !== null;
      });
      
      if (!isLoggedIn) {
        console.log(`   ⚠️  检测到未登录，尝试登录...`);
        const isAdmin = baseUrl.includes('admin') || fullUrl.includes('/admin');
        const loginSuccess = await login(page, baseUrl, isAdmin);
        if (!loginSuccess) {
          console.log(`   ❌ 登录失败，跳过此页面`);
          return null;
        }
        // 重新访问目标页面
        await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      }
    }
    
    // 等待特定元素（如果有配置）
    if (pageConfig.waitForSelector) {
      try {
        await page.waitForSelector(pageConfig.waitForSelector, { timeout: 10000 });
      } catch (e) {
        console.log(`   ⚠️  等待元素超时: ${pageConfig.waitForSelector}`);
      }
    }
    
    // 等待页面稳定
    await new Promise(resolve => setTimeout(resolve, config.waitTime));
    
    // 滚动到页面底部（确保所有内容都加载）
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 滚动回顶部
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 生成文件名（去除特殊字符）
    const fileName = `${pageConfig.name.replace(/[\/\\:*?"<>|]/g, '_')}.png`;
    const filePath = path.join(config.screenshotDir, category, fileName);
    
    // 截图
    await page.screenshot({
      path: filePath,
      fullPage: true, // 截取整个页面
      type: 'png'
    });
    
    console.log(`   ✅ 截图保存: ${filePath}`);
    
    // 保存页面信息到JSON文件
    const infoPath = path.join(config.screenshotDir, category, `${pageConfig.name.replace(/[\/\\:*?"<>|]/g, '_')}_info.json`);
    fs.writeFileSync(infoPath, JSON.stringify({
      name: pageConfig.name,
      url: fullUrl,
      description: pageConfig.description,
      screenshotTime: new Date().toISOString()
    }, null, 2));
    
    return page; // 返回page对象，用于后续页面共享登录状态
  } catch (error) {
    console.error(`   ❌ 截图失败: ${error.message}`);
    return null;
  } finally {
    // 如果不需要保留登录状态，关闭页面
    if (!pageConfig.requiresAuth) {
      await page.close();
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始自动截图...\n');
  console.log('⚠️  请确保系统正在运行：');
  console.log(`   用户端: ${config.clientUrl}`);
  console.log(`   后台管理端: ${config.adminUrl}\n`);
  
  // 创建截图目录
  createScreenshotDir();
  
  // 启动浏览器
  console.log('🌐 启动浏览器...');
  
  // 尝试使用系统Chrome（macOS）
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const executablePath = fs.existsSync(chromePath) ? chromePath : undefined;
  
  const browser = await puppeteer.launch({
    headless: true, // 设为false可以看到浏览器操作过程
    executablePath: executablePath, // 使用系统Chrome
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  let successCount = 0;
  let failCount = 0;
  
  try {
    // 截图用户端页面
    console.log('\n📱 开始截图用户端页面...');
    let clientLoginPage = null;
    for (const pageConfig of pages.client) {
      const result = await screenshotPage(browser, pageConfig, config.clientUrl, '用户端', clientLoginPage);
      if (result) {
        successCount++;
        // 如果是第一个需要登录的页面，保存登录状态
        if (pageConfig.requiresAuth && !clientLoginPage) {
          clientLoginPage = result;
        }
      } else {
        failCount++;
      }
    }
    // 关闭用户端登录页面
    if (clientLoginPage) {
      await clientLoginPage.close();
    }
    
    // 截图后台管理端页面
    console.log('\n🖥️  开始截图后台管理端页面...');
    let adminLoginPage = null;
    for (const pageConfig of pages.admin) {
      const result = await screenshotPage(browser, pageConfig, config.adminUrl, '后台管理端', adminLoginPage);
      if (result) {
        successCount++;
        // 如果是第一个需要登录的页面，保存登录状态
        if (pageConfig.requiresAuth && !adminLoginPage) {
          adminLoginPage = result;
        }
      } else {
        failCount++;
      }
    }
    // 关闭后台管理端登录页面
    if (adminLoginPage) {
      await adminLoginPage.close();
    }
    
  } catch (error) {
    console.error(`\n❌ 发生错误: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // 生成截图索引文件
  const indexPath = path.join(config.screenshotDir, 'index.json');
  const indexData = {
    screenshotTime: new Date().toISOString(),
    totalPages: pages.client.length + pages.admin.length,
    successCount,
    failCount,
    pages: {
      client: pages.client.map(p => ({
        name: p.name,
        url: `${config.clientUrl}${p.url}`,
        description: p.description
      })),
      admin: pages.admin.map(p => ({
        name: p.name,
        url: `${config.adminUrl}${p.url}`,
        description: p.description
      }))
    }
  };
  
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  console.log(`\n📄 截图索引已保存: ${indexPath}`);
  
  // 生成README文件
  const readmePath = path.join(config.screenshotDir, 'README.md');
  const readmeContent = `# 系统页面截图

## 截图说明

本目录包含系统所有页面的截图，用于文档整理。

## 目录结构

\`\`\`
screenshots/
├── 用户端/          # 用户端页面截图
├── 后台管理端/      # 后台管理端页面截图
├── index.json       # 截图索引文件
└── README.md        # 本文件
\`\`\`

## 截图时间

${new Date().toLocaleString('zh-CN')}

## 统计信息

- 总页面数: ${indexData.totalPages}
- 成功截图: ${successCount}
- 失败截图: ${failCount}

## 页面列表

### 用户端页面

${pages.client.map((p, i) => `${i + 1}. **${p.name}** - ${p.description}`).join('\n')}

### 后台管理端页面

${pages.admin.map((p, i) => `${i + 1}. **${p.name}** - ${p.description}`).join('\n')}

## 使用说明

1. 所有截图都是PNG格式，全页面截图
2. 每个截图文件都有对应的 \`_info.json\` 文件，包含页面信息
3. 截图索引文件 \`index.json\` 包含所有页面的URL和描述信息

## 注意事项

- 如果页面需要登录，请确保在运行脚本前已完成登录或配置了测试账号
- 截图时系统需要正在运行
- 某些动态内容可能需要等待加载完成
`;
  
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`📝 README已生成: ${readmePath}`);
  
  console.log(`\n✅ 截图完成！`);
  console.log(`   成功: ${successCount} 个`);
  console.log(`   失败: ${failCount} 个`);
  console.log(`   截图保存在: ${config.screenshotDir}`);
}

// 运行主函数
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});
