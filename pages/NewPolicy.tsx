import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Trash2, 
  Plus, 
  Upload, 
  Info,
  ChevronDown,
  Download,
  FileText,
  Search,
  HelpCircle,
  X
} from 'lucide-react';
import { PlanConfig, CompanyInfo, Employee } from '../types';

// Steps Component
const Steps = ({ current }: { current: number }) => {
  const steps = [
    { id: 1, name: '选择投保方案' },
    { id: 2, name: '填写投保信息' },
    { id: 3, name: '确认信息及支付' },
    { id: 4, name: '投保完成' },
  ];

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center px-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center relative z-10">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-300 ${
                  current >= step.id 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.id}
              </div>
              <div 
                className={`mt-2 text-sm font-medium ${
                  current >= step.id ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {step.name}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0 mx-4 border-t-2 border-dotted border-gray-300 relative top-[-14px]">
                <div 
                  className={`absolute top-[-2px] left-0 h-0.5 bg-blue-500 transition-all duration-500 ${
                    current > step.id ? 'w-full' : 'w-0'
                  }`}
                />
                <span className="absolute left-1/2 top-[-10px] transform -translate-x-1/2 text-gray-300 tracking-widest text-xs">
                  &gt;&gt;&gt;&gt;&gt;
                </span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Step 1: Select Plan
const PlanSelection = ({ 
  plans, 
  setPlans, 
  companyInfo,
  setCompanyInfo,
  onNext 
}: { 
  plans: PlanConfig[], 
  setPlans: (p: PlanConfig[]) => void,
  companyInfo: CompanyInfo,
  setCompanyInfo: (c: CompanyInfo) => void,
  onNext: () => void 
}) => {
  
  // Calculate price for a single plan
  const calculatePlanPrice = (plan: PlanConfig) => {
    let base = 81; // Base price for 1-3 class, 10k/1k
    
    // Factors
    const jobClassFactors: Record<string, number> = { '1-2类': 1, '1~3类': 1, '3类': 1.5, '4类': 2.5, '5类': 3.5 };
    const deathFactors: Record<string, number> = { '10万': 1, '30万': 1.8, '50万': 2.5, '80万': 3.2, '100万': 3.8 };
    
    const factor1 = jobClassFactors[plan.jobClass] || 1;
    const factor2 = deathFactors[plan.deathBenefit] || 1;
    
    let price = base * factor1 * factor2;
    
    if (plan.accident24h === '投保') price *= 1.2;
    
    return Math.round(price);
  };

  const totalPrice = plans.reduce((sum, plan) => {
    const count = typeof plan.insuredCount === 'number' ? plan.insuredCount : 0;
    return sum + (calculatePlanPrice(plan) * count);
  }, 0);

  const handleUpdatePlan = (id: string, field: keyof PlanConfig, value: any) => {
    setPlans(plans.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleAddPlan = () => {
    const newId = Date.now().toString();
    const newPlan: PlanConfig = {
      id: newId,
      name: `方案${['一', '二', '三', '四', '五'][plans.length] || (plans.length + 1)}`,
      jobClass: '1~3类',
      insuredCount: '',
      deathBenefit: '10万',
      medicalBenefit: '1万',
      dailyHospital: '100元/天',
      lostWages: '100元/天',
      duration: '1年',
      paymentType: '一次交清',
      disabilityScale: '10级伤残赔付1%起',
      accident24h: '不投保'
    };
    setPlans([...plans, newPlan]);
  };

  const handleRemovePlan = (id: string) => {
    if (plans.length > 1) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Info Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4 border-l-4 border-transparent pl-0">保险信息</h3>
        <div className="pl-0">
          <div className="grid grid-cols-12 gap-4 mb-2">
            <div className="col-span-1 text-gray-500 text-sm pt-1">产品名称</div>
            <div className="col-span-11">
              <span className="font-medium text-gray-800">Enterprise Liability Insurance (Classic Edition)</span>
              <div className="mt-2 bg-gray-50 p-3 rounded text-xs text-gray-500 space-y-1 inline-block pr-12">
                <p>Registration Name: Enterprise Liability Insurance (2025 Edition) Registration No: C0000173309120250101001</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applicant Info Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-6">投保人信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div className="flex items-center">
            <label className="w-28 text-sm text-gray-600">投保企业名称</label>
            <input 
              type="text" 
              className="flex-1 rounded border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
              placeholder="请填写投保人姓名"
              value={companyInfo.name}
              onChange={e => setCompanyInfo({...companyInfo, name: e.target.value})}
            />
          </div>
          <div className="flex items-center">
            <label className="w-32 text-sm text-gray-600">社会统一信用代码</label>
            <input 
              type="text" 
              className="flex-1 rounded border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
              placeholder="请填写投保企业证件号码"
              value={companyInfo.creditCode}
              onChange={e => setCompanyInfo({...companyInfo, creditCode: e.target.value})}
            />
          </div>
          <div className="flex items-center">
            <label className="w-28 text-sm text-gray-600">企业所在地</label>
            <div className="flex-1 flex gap-2">
               <select 
                 className="w-full rounded border-gray-300 border px-3 py-2 text-sm text-gray-500"
                 value={companyInfo.province}
                 onChange={e => setCompanyInfo({...companyInfo, province: e.target.value})}
               >
                 <option value="">请选择企业所在地</option>
                 <option value="beijing">北京市</option>
               </select>
               {companyInfo.province && (
                 <select 
                   className="w-full rounded border-gray-300 border px-3 py-2 text-sm text-gray-500"
                   value={companyInfo.district}
                   onChange={e => setCompanyInfo({...companyInfo, district: e.target.value})}
                 >
                   <option value="">请选择区县</option>
                   <option value="tongzhou">通州区</option>
                 </select>
               )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-6 py-1.5 border border-blue-400 text-blue-600 text-sm rounded hover:bg-blue-50 transition-colors">
            风控查询
          </button>
        </div>
      </div>

      {/* Plan Selection Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-base font-bold text-gray-800">选择投保方案</h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="职业类别查询" 
                className="pl-3 pr-8 py-1.5 border border-gray-300 rounded text-sm w-48 focus:border-blue-500 focus:outline-none"
              />
              <ChevronDown className="absolute right-2 top-2 text-gray-400 h-4 w-4" />
            </div>
          </div>
          <button 
            onClick={handleAddPlan}
            className="text-blue-600 text-sm border border-blue-400 px-4 py-1.5 rounded hover:bg-blue-50 flex items-center gap-1 transition-colors"
          >
            <Plus size={16} />
            增加方案
          </button>
        </div>

        <div className="mb-4 text-xs text-blue-600">
          此处“每人保费”为普通职业保费，部分职业涉及加费承保，请以被保人信息录入页“每人保费”金额为准，更多加费职业信息可通过产品资料职业表查询
        </div>

        {/* Plan Table Grid */}
        <div className="bg-blue-50/30 rounded-lg overflow-hidden border border-blue-100/50">
          {/* Header Row */}
          <div className="flex border-b border-blue-100">
            <div className="w-40 flex-shrink-0 p-4 bg-gray-50/50 font-bold text-gray-700 text-sm flex items-center">
              投保信息/方案
            </div>
            {plans.map((plan, index) => (
              <div key={plan.id} className="flex-1 p-3 min-w-[220px] bg-blue-50/20 border-l border-blue-100 flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <FileText className="text-blue-600 h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700">{plan.name}</span>
                </div>
                {plans.length > 1 && (
                   <button 
                    onClick={() => handleRemovePlan(plan.id)}
                    className="text-gray-400 hover:text-blue-600 p-1"
                   >
                     <X size={14} />
                   </button>
                )}
              </div>
            ))}
          </div>

          {/* Job Class Row */}
          <div className="flex border-b border-gray-100">
             <div className="w-40 flex-shrink-0 p-4 text-sm text-gray-600 flex items-center bg-gray-50/20">
               职业类别
             </div>
             {plans.map((plan) => (
               <div key={plan.id} className="flex-1 p-4 min-w-[220px] border-l border-gray-100">
                  <select 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                    value={plan.jobClass}
                    onChange={(e) => handleUpdatePlan(plan.id, 'jobClass', e.target.value)}
                  >
                    <option value="1~3类">1~3类</option>
                    <option value="4类">4类</option>
                    <option value="5类">5类</option>
                  </select>
               </div>
             ))}
          </div>

          {/* Count Row */}
          <div className="flex border-b border-gray-100">
             <div className="w-40 flex-shrink-0 p-4 text-sm text-gray-600 flex items-center bg-gray-50/20">
               投保人数
             </div>
             {plans.map((plan) => (
               <div key={plan.id} className="flex-1 p-4 min-w-[220px] border-l border-gray-100">
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="请填写投保人数"
                    value={plan.insuredCount}
                    onChange={(e) => handleUpdatePlan(plan.id, 'insuredCount', e.target.value === '' ? '' : parseInt(e.target.value))}
                  />
               </div>
             ))}
          </div>

          {/* Premium Row */}
          <div className="flex border-b border-gray-100">
             <div className="w-40 flex-shrink-0 p-4 text-sm text-gray-600 flex items-center bg-gray-50/20">
               每人保费
             </div>
             {plans.map((plan) => (
               <div key={plan.id} className="flex-1 p-4 min-w-[220px] border-l border-gray-100 flex items-center">
                  <span className="text-blue-600 font-bold text-lg">¥{calculatePlanPrice(plan)}元</span>
               </div>
             ))}
          </div>

          {/* Coverage Row 1: Death */}
          <div className="flex border-b border-gray-100">
             <div className="w-40 flex-shrink-0 p-4 text-sm text-gray-600 flex items-center bg-gray-50/20">
               意外身故伤残保险金
             </div>
             {plans.map((plan) => (
               <div key={plan.id} className="flex-1 p-4 min-w-[220px] border-l border-gray-100">
                  <select 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    value={plan.deathBenefit}
                    onChange={(e) => handleUpdatePlan(plan.id, 'deathBenefit', e.target.value)}
                  >
                    <option value="10万">10万</option>
                    <option value="30万">30万</option>
                    <option value="50万">50万</option>
                    <option value="80万">80万</option>
                    <option value="100万">100万</option>
                  </select>
               </div>
             ))}
          </div>

           {/* Coverage Row 2: Medical */}
           <div className="flex border-b border-gray-100">
             <div className="w-40 flex-shrink-0 p-4 text-sm text-gray-600 flex items-center bg-gray-50/20">
               医疗费用保险金
             </div>
             {plans.map((plan) => (
               <div key={plan.id} className="flex-1 p-4 min-w-[220px] border-l border-gray-100">
                  <select 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    value={plan.medicalBenefit}
                    onChange={(e) => handleUpdatePlan(plan.id, 'medicalBenefit', e.target.value)}
                  >
                    <option value="1万">1万</option>
                    <option value="2万">2万</option>
                    <option value="5万">5万</option>
                    <option value="10万">10万</option>
                  </select>
               </div>
             ))}
          </div>

          {/* Coverage Row 3: Hospital Allowance */}
          <div className="flex border-b border-gray-100">
             <div className="w-40 flex-shrink-0 p-4 text-sm text-gray-600 flex items-center bg-gray-50/20">
               意外每日住院津贴
             </div>
             {plans.map((plan) => (
               <div key={plan.id} className="flex-1 p-4 min-w-[220px] border-l border-gray-100 flex items-center">
                  <span className="text-gray-800 text-sm">100元/天</span>
               </div>
             ))}
          </div>

          {/* Coverage Row 4: Duration */}
          <div className="flex">
             <div className="w-40 flex-shrink-0 p-4 text-sm text-gray-600 flex items-center bg-gray-50/20">
               保障时间
             </div>
             {plans.map((plan) => (
               <div key={plan.id} className="flex-1 p-4 min-w-[220px] border-l border-gray-100">
                   <select 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    value={plan.duration}
                    onChange={(e) => handleUpdatePlan(plan.id, 'duration', e.target.value)}
                  >
                    <option value="1年">1年</option>
                    <option value="6个月">6个月</option>
                  </select>
               </div>
             ))}
          </div>

        </div>
      </div>

      <div className="flex justify-end pt-6 items-center gap-4">
        <div className="text-sm text-gray-600">
           合计支付保费: <span className="text-2xl font-bold text-blue-600 mx-1">{totalPrice}</span> 元
        </div>
        <button className="px-6 py-2.5 bg-white border border-blue-400 text-blue-600 rounded hover:bg-blue-50 text-sm">
          生成计划书
        </button>
        <button onClick={onNext} className="px-8 py-2.5 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600 transition-colors text-sm">
          下一步
        </button>
      </div>
    </div>
  );
};

// Step 2: Information
const InfoFilling = ({
  companyInfo,
  setCompanyInfo,
  employees,
  setEmployees,
  onNext,
  onPrev
}: {
  companyInfo: CompanyInfo,
  setCompanyInfo: (c: CompanyInfo) => void,
  employees: Employee[],
  setEmployees: (e: Employee[]) => void,
  onNext: () => void,
  onPrev: () => void
}) => {
  
  const addEmployee = () => {
    const newEmp: Employee = {
      id: Date.now().toString(),
      name: '',
      idType: '身份证',
      idNumber: '',
      gender: '男',
      jobCode: '00714035',
      jobCategory: '5类'
    };
    setEmployees([...employees, newEmp]);
  };

  const updateEmployee = (id: string, field: keyof Employee, value: string) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
      {/* Company Info - Detailed for Step 2 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-6">投保人信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div className="flex items-center">
             <label className="w-32 text-sm text-gray-600">投保企业名称</label>
             <input type="text" disabled value={companyInfo.name} className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-500" />
          </div>
          <div className="flex items-center">
             <label className="w-32 text-sm text-gray-600">社会统一信用代码</label>
             <input type="text" disabled value={companyInfo.creditCode} className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-500" />
          </div>
           <div className="flex items-center">
            <label className="w-32 text-sm text-gray-600">投保企业联系人姓名</label>
            <input 
              type="text" 
              className="flex-1 rounded border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              value={companyInfo.contactName}
              onChange={e => setCompanyInfo({...companyInfo, contactName: e.target.value})}
              placeholder="请填写联系人姓名"
            />
          </div>
          <div className="flex items-center">
            <label className="w-32 text-sm text-gray-600">投保企业联系人邮箱</label>
            <input 
              type="text" 
              className="flex-1 rounded border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              value={companyInfo.contactEmail}
              onChange={e => setCompanyInfo({...companyInfo, contactEmail: e.target.value})}
               placeholder="请填写联系人邮箱"
            />
          </div>
          <div className="flex items-center">
            <label className="w-32 text-sm text-gray-600">投保企业联系人电话</label>
            <input 
              type="text" 
              className="flex-1 rounded border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              value={companyInfo.contactPhone}
              onChange={e => setCompanyInfo({...companyInfo, contactPhone: e.target.value})}
               placeholder="13800138000"
            />
          </div>
           <div className="flex items-center">
            <label className="w-32 text-sm text-gray-600">公司所在地</label>
             <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-500">
               {companyInfo.province ? '北京市-北京市区-通州区' : '请先在第一步选择地址'}
             </div>
          </div>
           <div className="col-span-1 md:col-span-2 flex items-start">
            <label className="w-32 text-sm text-gray-600 pt-2">投保企业详细地址</label>
            <textarea
              className="flex-1 rounded border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              value={companyInfo.address}
              onChange={e => setCompanyInfo({...companyInfo, address: e.target.value})}
              placeholder="请填写详细地址"
              rows={2}
            />
          </div>
          <div className="col-span-1 md:col-span-2 flex items-start">
             <label className="w-32 text-sm text-gray-600 pt-2">营业执照</label>
             <button className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 bg-white shadow-sm">
                上传文件
             </button>
             <div className="ml-2 pt-2 text-xs text-gray-400 flex flex-col gap-1">
                <div className="flex items-center gap-1"><FileText size={12}/> <span>营业执照.jpg</span></div>
             </div>
          </div>
        </div>
      </div>

      {/* Employee Info */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-gray-800">保险信息</h3>
        </div>
         {/* Simplified Policy Summary for Step 2 context */}
        <div className="bg-gray-50 p-4 rounded text-sm text-gray-600 mb-6 flex justify-between items-center">
            <div>
               <p className="font-bold text-gray-800 mb-1">Enterprise Liability Insurance (Classic Edition)</p>
               <p className="text-xs">生效日期：2025-12-07 终止日期：2026-12-06</p>
            </div>
            <div className="text-right">
                <p className="text-blue-600 font-bold text-lg">¥1245.8元</p>
            </div>
        </div>


        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-gray-800">被保人信息</h3>
          <div className="flex gap-2">
            <button className="text-gray-600 text-sm border px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-1 bg-white">
              <Download size={14} /> 下载投保模版
            </button>
            <button className="text-gray-600 text-sm border px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-1 bg-white">
              <Upload size={14} /> 批量导入被保人
            </button>
             <button onClick={() => setEmployees([])} className="text-gray-600 text-sm border px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-1 bg-white">
              <Trash2 size={14} /> 删除选中
            </button>
             <button onClick={addEmployee} className="text-gray-600 text-sm border px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-1 bg-white">
              <Plus size={14} /> 添加被保人
            </button>
          </div>
        </div>
        
        <div className="mb-4">
            <div className="relative">
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="请选择要查询的职业"
                />
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 h-4 w-4"/>
            </div>
        </div>

        <div className="overflow-x-auto rounded-t-lg border-t border-l border-r border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                   <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"/>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 font-bold">姓名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 font-bold">证件类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 font-bold">证件号码</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 font-bold">性别</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 font-bold">出生日期</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 font-bold">职业代码</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 font-bold">职业类别</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 font-bold">每人保费</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 font-bold">方案</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400 text-sm">
                    暂无被保人信息，请添加或导入
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                       <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"/>
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        value={emp.name} 
                        onChange={(e) => updateEmployee(emp.id, 'name', e.target.value)}
                        className="w-20 border-gray-300 border rounded px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                       <div className="relative">
                        <select 
                            value={emp.idType}
                            onChange={(e) => updateEmployee(emp.id, 'idType', e.target.value)}
                            className="w-24 border-gray-300 border rounded px-2 py-1 text-sm appearance-none bg-white focus:border-blue-500 focus:outline-none pr-6"
                        >
                            <option>身份证</option>
                            <option>护照</option>
                        </select>
                        <ChevronDown className="absolute right-1 top-1.5 h-3 w-3 text-gray-400 pointer-events-none"/>
                       </div>
                    </td>
                    <td className="px-4 py-3">
                       <input 
                        type="text" 
                        value={emp.idNumber} 
                        onChange={(e) => updateEmployee(emp.id, 'idNumber', e.target.value)}
                        className="w-40 border-gray-300 border rounded px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">{emp.gender}</td>
                    <td className="px-4 py-3 text-sm">1990-01-01</td>
                    <td className="px-4 py-3 text-sm">
                        <input 
                        type="text" 
                        value={emp.jobCode} 
                        readOnly
                        className="w-20 border-gray-300 border rounded px-2 py-1 text-sm bg-gray-50"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-center">5类</td>
                    <td className="px-4 py-3 text-sm">291.2元</td>
                    <td className="px-4 py-3 text-sm">方案一</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
         <div className="bg-gray-50 p-4 border border-t-0 border-gray-200 rounded-b-lg text-xs text-gray-500">
             <p>一共{employees.length}名被保人，已选中0位</p>
             <p className="mt-1">请注意被保人职业类别，如果职业类别高于投保方案时选择的职业类别，可能导致无法投保，请返回修改投保方案</p>
             <p>职业类别属于重要告知内容，投保人务必如实填写，如一人同时涉及多个岗位的，则以职业类别最高的岗位申报；如果申报的职业与实际不一致的，后续可能导致无法理赔</p>
         </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button onClick={onPrev} className="px-8 py-2 bg-white border border-blue-400 text-blue-600 rounded shadow-sm hover:bg-blue-50 text-sm">
          上一步
        </button>
        <div className="flex gap-4">
           <button className="px-8 py-2 bg-white border border-blue-400 text-blue-600 rounded shadow-sm hover:bg-blue-50 text-sm flex items-center gap-1">
            <FileText size={14}/> 缓存此保单
          </button>
          <button onClick={onNext} className="px-8 py-2 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600 transition-colors text-sm">
            立即投保
          </button>
        </div>
      </div>
       <div className="flex justify-end mt-2 items-center">
         <input type="checkbox" className="mr-1 text-blue-500 focus:ring-blue-500 rounded" defaultChecked/>
         <span className="text-xs text-gray-500">我已阅读并同意 <span className="text-blue-600">《投保须知及投保声明》</span>、<span className="text-blue-600">《保险条款及告知》</span>、<span className="text-blue-600">《特别约定-平台团意250704》</span>、<span className="text-blue-600">《免责条款》</span>、<span className="text-blue-600">《隐私政策》</span> 和 <span className="text-blue-600">《用户投保敏感个人信息授权书》</span></span>
       </div>
    </div>
  );
};

// Step 3: Confirmation
const Confirmation = ({
  companyInfo,
  plans,
  employees,
  onPrev,
  onFinish
}: {
  companyInfo: CompanyInfo,
  plans: PlanConfig[],
  employees: Employee[],
  onPrev: () => void,
  onFinish: () => void
}) => {
  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              请仔细核对以下信息，确认无误后提交核保。若需要暂时离开本页面，可以通过“缓存”功能进行保存。
            </p>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
         <h4 className="font-bold text-gray-800 mb-2">投保方案摘要</h4>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
           {plans.map(plan => (
             <div key={plan.id} className="bg-gray-50 p-3 rounded">
                <div className="font-bold text-gray-700 mb-1">{plan.name}</div>
                <div>身故赔偿: {plan.deathBenefit}</div>
                <div>医疗赔偿: {plan.medicalBenefit}</div>
                <div>被保人数: {plan.insuredCount || 0}人</div>
             </div>
           ))}
         </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
         <h4 className="font-bold text-gray-800 mb-2">企业信息摘要</h4>
         <div className="text-sm text-gray-600">
            <p>企业名称：{companyInfo.name || '未填写'}</p>
            <p>联系人：{companyInfo.contactName || '未填写'}</p>
         </div>
      </div>

      <div className="mt-8 flex items-start">
        <div className="flex items-center h-5">
          <input
            id="agreements"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="agreements" className="font-medium text-gray-700">
            我已阅读并同意
          </label>
          <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => setShowModal(true)}>《投保须知及投保声明》</span>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button onClick={onPrev} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-50">
          上一步
        </button>
        <button 
          onClick={onFinish} 
          disabled={!agreed}
          className="px-8 py-2 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          立即投保
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-3xl w-full p-0 relative shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center">
                 <h3 className="text-lg font-bold text-center w-full">请阅读以下内容(1/2)</h3>
            </div>
            
            <div className="overflow-y-auto p-6 text-sm text-gray-600 space-y-4 flex-1">
              <h4 className="font-bold text-gray-800">一、投保须知：</h4>
              <p>投保前请仔细阅读：保险责任、责任免除、费用扣除、退保、投保人、被保险人义务等内容详见产品条款，请务必仔细阅读保险条款及电子保单的特别约定。</p>
              <p>1、承保公司、销售主体</p>
              <p>本产品由平安财产保险（中国）有限公司承保（以下简称“平安财险”），该公司在北京、天津、青岛、深圳、江苏、陕西设有分支机构。</p>
              <p>2、条款适用</p>
              <p>本产品条款适用平安财产保险（中国）有限公司的以下条款：</p>
              <p>团体意外伤害保险（互联网专属2023 版）(注册号：C00004532312023083142261)</p>
               <p>3、保单形式</p>
               <p>本产品仅提供团体保单。</p>
            </div>
            <div className="p-4 border-t flex gap-4 justify-center bg-gray-50 rounded-b-lg">
               <button 
                onClick={() => setShowModal(false)}
                className="px-8 py-2 border border-gray-300 bg-white text-gray-600 rounded hover:bg-gray-100"
              >
                暂不同意
              </button>
              <button 
                onClick={() => { setShowModal(false); setAgreed(true); }}
                className="px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 shadow-sm"
              >
                已完整阅读并确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Step 4: Success
const SuccessStep = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">投保申请已提交</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        您的保单申请已提交至审核系统，审核通过后将发送短信通知。您可以在“我的保单”中查看进度。
      </p>
      <div className="flex gap-4">
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50">
          返回列表
        </button>
        <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          查看详情
        </button>
      </div>
    </div>
  );
};

// Main Page Container
const NewPolicy: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // State for all steps
  const [plans, setPlans] = useState<PlanConfig[]>([
    {
      id: '1',
      name: '方案一',
      jobClass: '5类',
      insuredCount: 4,
      deathBenefit: '10万',
      medicalBenefit: '1万',
      dailyHospital: '100元/天',
      lostWages: '100元/天',
      duration: '1年',
      paymentType: '一次交清',
      disabilityScale: '10级伤残赔付1%起',
      accident24h: '不投保'
    }
  ]);

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    creditCode: '',
    province: '',
    city: '',
    district: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    industry: ''
  });

  const [employees, setEmployees] = useState<Employee[]>([]);

  // Pre-fill a sample employee for demo when reaching step 2
  useEffect(() => {
     if (currentStep === 2 && employees.length === 0) {
        setEmployees([
           {
             id: '1',
             name: '张三',
             idType: '身份证',
             idNumber: '110101199001011234',
             gender: '男',
             jobCode: '00714035',
             jobCategory: '5类'
           }
        ]);
     }
  }, [currentStep]);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <Steps current={currentStep} />
      
      {currentStep === 1 && (
        <PlanSelection 
          plans={plans} 
          setPlans={setPlans} 
          companyInfo={companyInfo}
          setCompanyInfo={setCompanyInfo}
          onNext={() => setCurrentStep(2)} 
        />
      )}
      
      {currentStep === 2 && (
        <InfoFilling 
          companyInfo={companyInfo} 
          setCompanyInfo={setCompanyInfo}
          employees={employees}
          setEmployees={setEmployees}
          onNext={() => setCurrentStep(3)}
          onPrev={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 3 && (
        <Confirmation 
          companyInfo={companyInfo}
          plans={plans}
          employees={employees}
          onPrev={() => setCurrentStep(2)}
          onFinish={() => setCurrentStep(4)}
        />
      )}

      {currentStep === 4 && <SuccessStep />}
    </div>
  );
};

export default NewPolicy;