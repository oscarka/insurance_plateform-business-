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
import PlanSelectionDynamic from '../src/components/PlanSelectionDynamic';
import { getProvinces, getRegions, saveDraft } from '../src/services/api';
import { useProductPlans } from '../src/hooks/useProductPlans';
import OccupationCascader from '../src/components/OccupationCascader';

// 地区级联选择器组件
const RegionSelector = ({
  companyInfo,
  setCompanyInfo
}: {
  companyInfo: CompanyInfo;
  setCompanyInfo: (c: CompanyInfo) => void;
}) => {
  const [provinces, setProvinces] = useState<Array<{region_id: number; region_code: string; region_name: string}>>([]);
  const [cities, setCities] = useState<Array<{region_id: number; region_code: string; region_name: string}>>([]);
  const [districts, setDistricts] = useState<Array<{region_id: number; region_code: string; region_name: string}>>([]);
  const [loading, setLoading] = useState(false);

  // 加载省份列表
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await getProvinces();
        setProvinces(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('加载省份失败:', error);
      }
    };
    loadProvinces();
  }, []);

  // 当选择省份时，加载城市列表
  useEffect(() => {
    if (companyInfo.provinceId) {
      const loadCities = async () => {
        setLoading(true);
        try {
          const data = await getRegions({ level: 2, parent_id: companyInfo.provinceId });
          setCities(Array.isArray(data) ? data : []);
          setDistricts([]);
          // 清空城市和区县选择
          setCompanyInfo({...companyInfo, cityId: undefined, districtId: undefined, city: '', district: ''});
        } catch (error) {
          console.error('加载城市失败:', error);
        } finally {
          setLoading(false);
        }
      };
      loadCities();
    } else {
      setCities([]);
      setDistricts([]);
    }
  }, [companyInfo.provinceId]);

  // 当选择城市时，加载区县列表
  useEffect(() => {
    if (companyInfo.cityId) {
      const loadDistricts = async () => {
        setLoading(true);
        try {
          const data = await getRegions({ level: 3, parent_id: companyInfo.cityId });
          setDistricts(Array.isArray(data) ? data : []);
          // 清空区县选择
          setCompanyInfo({...companyInfo, districtId: undefined, district: ''});
        } catch (error) {
          console.error('加载区县失败:', error);
        } finally {
          setLoading(false);
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
    }
  }, [companyInfo.cityId]);

  return (
    <div className="flex items-center col-span-1 md:col-span-2">
      <label className="w-28 text-sm text-gray-600">企业所在地</label>
      <div className="flex-1 flex gap-2">
        <select 
          className="flex-1 rounded border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          value={companyInfo.provinceId || ''}
          onChange={e => {
            const provinceId = e.target.value ? Number(e.target.value) : undefined;
            const province = provinces.find(p => p.region_id === provinceId)?.region_name || '';
            setCompanyInfo({...companyInfo, provinceId, province, cityId: undefined, city: '', districtId: undefined, district: ''});
          }}
          disabled={loading}
        >
          <option value="">请选择省份</option>
          {provinces.map(p => (
            <option key={p.region_id} value={p.region_id}>{p.region_name}</option>
          ))}
        </select>
        {companyInfo.provinceId && (
          <select 
            className="flex-1 rounded border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            value={companyInfo.cityId || ''}
            onChange={e => {
              const cityId = e.target.value ? Number(e.target.value) : undefined;
              const city = cities.find(c => c.region_id === cityId)?.region_name || '';
              setCompanyInfo({...companyInfo, cityId, city, districtId: undefined, district: ''});
            }}
            disabled={loading}
          >
            <option value="">请选择城市</option>
            {cities.map(c => (
              <option key={c.region_id} value={c.region_id}>{c.region_name}</option>
            ))}
          </select>
        )}
        {companyInfo.cityId && (
          <select 
            className="flex-1 rounded border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            value={companyInfo.districtId || ''}
            onChange={e => {
              const districtId = e.target.value ? Number(e.target.value) : undefined;
              const district = districts.find(d => d.region_id === districtId)?.region_name || '';
              setCompanyInfo({...companyInfo, districtId, district});
            }}
            disabled={loading}
          >
            <option value="">请选择区县</option>
            {districts.map(d => (
              <option key={d.region_id} value={d.region_id}>{d.region_name}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

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
            <label className="w-28 text-sm text-gray-600">投保类型</label>
            <input 
              type="text" 
              className="flex-1 rounded border-gray-300 border px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              value="新保"
              disabled
              readOnly
            />
          </div>
          <div className="flex items-center">
            <label className="w-32 text-sm text-gray-600">是否涉高</label>
            <select 
              className="flex-1 rounded border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              value={companyInfo.isHighRisk ? '是' : '否'}
              onChange={e => setCompanyInfo({...companyInfo, isHighRisk: e.target.value === '是'})}
            >
              <option value="否">否</option>
              <option value="是">是</option>
            </select>
          </div>
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
          <RegionSelector companyInfo={companyInfo} setCompanyInfo={setCompanyInfo} />
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
                  <span className="text-blue-600 font-bold text-lg">
                    {plan.premiumPerPerson ? `¥${plan.premiumPerPerson}元` : `¥${calculatePlanPrice(plan)}元`}
                  </span>
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
  plans,
  selectedProductId,
  selectedPlanIds,
  premiums,
  effectiveDate,
  setEffectiveDate,
  commonDuration,
  onNext,
  onPrev
}: {
  companyInfo: CompanyInfo,
  setCompanyInfo: (c: CompanyInfo) => void,
  employees: Employee[],
  setEmployees: (e: Employee[]) => void,
  plans: PlanConfig[],
  selectedProductId: number | null,
  selectedPlanIds: Record<string, number>,
  premiums: Record<string, number>,
  effectiveDate: string,
  setEffectiveDate: (d: string) => void,
  commonDuration: string,
  onNext: () => void,
  onPrev: () => void
}) => {
  
  // 当前选中的方案标签页
  const [activePlanTab, setActivePlanTab] = useState<string>(plans[0]?.id || '');

  // 使用useProductPlans获取责任信息和产品信息
  const { planLiabilities, fetchPlanLiabilities, products } = useProductPlans(selectedProductId || undefined);
  
  // 获取当前选中的产品信息
  const [productDetail, setProductDetail] = useState<any>(null);
  
  // 根据产品ID获取产品详情
  useEffect(() => {
    if (selectedProductId) {
      // 先从products列表获取基本信息
      const product = products.find(p => p.product_id === selectedProductId);
      if (product) {
        setProductDetail({
          product_name: product.product_name,
          company_name: product.company_name,
          company_code: product.company_code,
        });
      }
      
      // 调用API获取详细产品信息（包含registration_name和registration_no）
      import('../src/services/api').then(({ getProduct }) => {
        getProduct(selectedProductId).then((response: any) => {
          const detail = response?.data || response;
          if (detail) {
            setProductDetail({
              product_name: detail.product_name || product?.product_name,
              registration_name: detail.registration_name,
              registration_no: detail.registration_no,
              company_name: product?.company_name || detail.company_name,
              company_code: product?.company_code || detail.company_code,
            });
          }
        }).catch((err: any) => {
          console.error('获取产品详情失败:', err);
          // 如果API失败，至少使用列表中的基本信息
          if (product) {
            setProductDetail({
              product_name: product.product_name,
              company_name: product.company_name,
              company_code: product.company_code,
            });
          }
        });
      });
    } else {
      setProductDetail(null);
    }
  }, [selectedProductId, products]);
  
  // 根据产品ID获取保险公司ID
  const companyId = selectedProductId 
    ? products.find(p => p.product_id === selectedProductId)?.company_id 
    : undefined;
  
  // 计算终止日期（根据生效日期和保障期限）
  const calculateTerminationDate = (effDate: string, duration: string): string => {
    if (!effDate) return '';
    
    const eff = new Date(effDate);
    if (isNaN(eff.getTime())) return '';
    
    const term = new Date(eff);
    
    if (duration.includes('年')) {
      const years = parseInt(duration.match(/\d+/)?.[0] || '1');
      term.setFullYear(term.getFullYear() + years);
      term.setDate(term.getDate() - 1); // 终止日期是生效日期+保障期限-1天
    } else if (duration.includes('个月') || duration.includes('月')) {
      const months = parseInt(duration.match(/\d+/)?.[0] || '1');
      term.setMonth(term.getMonth() + months);
      term.setDate(term.getDate() - 1);
    }
    
    return term.toISOString().split('T')[0];
  };
  
  const terminationDate = effectiveDate ? calculateTerminationDate(effectiveDate, commonDuration) : '';
  
  // 初始化生效日期（如果没有设置，默认为今天）
  useEffect(() => {
    if (!effectiveDate) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      setEffectiveDate(todayStr);
    }
  }, []);

  // 当plans变化时，更新activePlanTab，并加载责任信息
  useEffect(() => {
    if (plans.length > 0 && (!activePlanTab || !plans.find(p => p.id === activePlanTab))) {
      setActivePlanTab(plans[0].id);
    }
  }, [plans.length]);

  // 加载所有方案的责任信息
  useEffect(() => {
    plans.forEach((plan) => {
      const planId = selectedPlanIds[plan.id];
      if (planId && !planLiabilities[planId]) {
        fetchPlanLiabilities(planId);
      }
    });
  }, [plans, selectedPlanIds]);

  const addEmployee = () => {
    const newEmp: Employee = {
      id: Date.now().toString(),
      name: '',
      idType: '身份证',
      idNumber: '',
      gender: '男',
      jobCode: '00714035',
      jobCategory: '5类',
      isHighWork: false,
      planId: activePlanTab // 自动关联到当前选中的方案
    };
    setEmployees([...employees, newEmp]);
  };

  const updateEmployee = (id: string, field: keyof Employee, value: string | boolean) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // 下载投保模版
  const handleDownloadTemplate = () => {
    // 创建Excel模版数据
    const templateData = [
      ['姓名', '证件类型', '证件号码', '性别', '出生日期', '职业代码', '职业类别', '是否涉及高处作业', '职务/工种描述', '国籍', '月工资币别', '月工资金额', '赔偿月数', '用工单位', '用工地点', '是否参保工伤保险', '备注']
    ];
    
    // 转换为CSV格式（简单实现，实际可以使用xlsx库）
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '人员清单导入模版.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 计算总保费
  const totalPremium = plans.reduce((sum, plan) => {
    return sum + (plan.totalPremium || 0);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
      {/* Product Info Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4 border-l-4 border-transparent pl-0">保险信息</h3>
        <div className="pl-0">
          <div className="grid grid-cols-12 gap-4 mb-2">
            <div className="col-span-1 text-gray-500 text-sm pt-1">产品名称</div>
            <div className="col-span-11">
              {productDetail ? (
                <>
                  <span className="font-medium text-gray-800">{productDetail.product_name}</span>
                  {productDetail.registration_name && (
                    <div className="mt-2 bg-gray-50 p-3 rounded text-xs text-gray-500 space-y-1 inline-block pr-12">
                      <p>备案名: {productDetail.registration_name}</p>
                      {productDetail.registration_no && (
                        <p>注册号: {productDetail.registration_no}</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-gray-400">请先选择产品</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 mt-4">
            <div className="col-span-1 text-gray-500 text-sm pt-1">生效日期</div>
            <div className="col-span-5">
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="col-span-1 text-gray-500 text-sm pt-1">终止日期</div>
            <div className="col-span-5">
              <span className="text-sm text-gray-800">
                {terminationDate || '请先选择生效日期'}
              </span>
            </div>
          </div>
          {totalPremium > 0 && (
            <div className="grid grid-cols-12 gap-4 mt-4">
              <div className="col-span-1 text-gray-500 text-sm pt-1">总保费</div>
              <div className="col-span-11">
                <span className="text-2xl font-bold text-blue-600">¥{totalPremium}元</span>
              </div>
            </div>
          )}
        </div>
      </div>

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

      {/* 投保方案 - 标签页显示 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">投保方案</h3>
        
        {/* 提示信息 */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 text-xs text-gray-600">
          此处"每人保费"为普通职业保费, 部分职业涉及加费承保, 请以被保人信息录入页"每人保费"金额为准, 更多加费职业信息可通过产品资料职业表查询
        </div>

        {/* 方案标签页 */}
        <div className="border-b border-gray-200 mb-4">
          <div className="flex space-x-1">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setActivePlanTab(plan.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activePlanTab === plan.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {plan.name}
              </button>
            ))}
          </div>
        </div>

        {/* 当前选中方案的详细信息 */}
        {(() => {
          const currentPlan = plans.find(p => p.id === activePlanTab);
          if (!currentPlan) return null;
          
          const planId = selectedPlanIds[currentPlan.id];
          const liabilities = planId ? planLiabilities[planId] || [] : [];
          
          // 根据liabilitySelections和planLiabilities动态显示责任信息
          const getLiabilityDisplay = (liabilityName: string) => {
            const liability = liabilities.find(l => l.liability_name === liabilityName);
            if (!liability) return '-';
            
            const selectedValue = currentPlan.liabilitySelections?.[liability.liability_id];
            if (!selectedValue) return '-';
            
            return `${selectedValue}${liability.unit || ''}`;
          };
          
          return (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {/* 动态显示所有责任 */}
                {liabilities.length > 0 ? (
                  liabilities
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                    .map((liability) => {
                      const selectedValue = currentPlan.liabilitySelections?.[liability.liability_id];
                      const displayValue = selectedValue 
                        ? `${selectedValue}${liability.unit || ''}` 
                        : '-';
                      
                      return (
                        <div key={liability.liability_id}>
                          <span className="text-gray-600">{liability.liability_name}：</span>
                          <span className="font-semibold text-gray-800 ml-2">{displayValue}</span>
                        </div>
                      );
                    })
                ) : planId ? (
                  <div className="col-span-3 text-gray-400 text-sm">正在加载责任配置...</div>
                ) : (
                  <div className="col-span-3 text-gray-400 text-sm">请先选择方案</div>
                )}
                
                {/* 固定显示的信息 */}
                <div>
                  <span className="text-gray-600">保障时间：</span>
                  <span className="font-semibold text-gray-800 ml-2">{currentPlan.duration || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600">职业类别：</span>
                  <span className="font-semibold text-gray-800 ml-2">{currentPlan.jobClass || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600">每人保费：</span>
                  <span className="font-semibold text-blue-600 ml-2">
                    {currentPlan.premiumPerPerson ? `¥${currentPlan.premiumPerPerson}元` : '-'}
                    {currentPlan.duration && (
                      <span className="text-xs text-gray-500 ml-1">(保障期限:{currentPlan.duration})</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 被保人信息 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-gray-800">被保人信息</h3>
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadTemplate}
              className="text-gray-600 text-sm border px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-1 bg-white"
            >
              <Download size={14} /> 下载投保模版
            </button>
            <button className="text-gray-600 text-sm border px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-1 bg-white">
              <Upload size={14} /> 批量导入被保人
            </button>
             <button 
              onClick={() => {
                // 只删除当前方案下的被保人
                const currentPlanEmployees = employees.filter(e => e.planId === activePlanTab);
                const selectedIds = new Set(); // TODO: 实现选中状态管理
                const toDelete = currentPlanEmployees.filter(e => selectedIds.has(e.id));
                setEmployees(employees.filter(e => !toDelete.includes(e)));
              }} 
              className="text-gray-600 text-sm border px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-1 bg-white"
            >
              <Trash2 size={14} /> 删除选中
            </button>
             <button onClick={addEmployee} className="text-gray-600 text-sm border px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-1 bg-white">
              <Plus size={14} /> 添加被保人
            </button>
          </div>
        </div>
        
        <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">请于下方选择雇员职业查询职业代码</p>
            <OccupationCascader
              placeholder="请选择要查询的职业"
              productId={selectedProductId || undefined}
              onChange={(occupation) => {
                if (occupation) {
                  // 更新当前方案下所有被保人的职业信息
                  const currentPlanEmployees = employees.filter(e => e.planId === activePlanTab);
                  const updatedEmployees = employees.map(emp => {
                    if (currentPlanEmployees.includes(emp)) {
                      return {
                        ...emp,
                        jobCode: occupation.detailCode,
                        jobCategory: `${occupation.occupationLevel}类`,
                      };
                    }
                    return emp;
                  });
                  setEmployees(updatedEmployees);
                }
              }}
            />
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 font-bold">是否涉及高处作业</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 font-bold">每人保费</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                // 只显示当前选中方案下的被保人
                const currentPlanEmployees = employees.filter(e => e.planId === activePlanTab);
                
                if (currentPlanEmployees.length === 0) {
                  return (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-gray-400 text-sm">
                        暂无被保人信息，请添加或导入
                      </td>
                    </tr>
                  );
                }
                
                return currentPlanEmployees.map((emp) => (
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
                    <td className="px-4 py-3">
                      <select 
                        value={emp.isHighWork ? '是' : '否'}
                        onChange={(e) => updateEmployee(emp.id, 'isHighWork', e.target.value === '是')}
                        className="w-20 border-gray-300 border rounded px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="否">否</option>
                        <option value="是">是</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-blue-600 font-bold">
                        {(() => {
                          // 当前被保人关联的方案（应该是当前activePlanTab）
                          const empPlan = plans.find(p => p.id === activePlanTab);
                          if (empPlan) {
                            // 优先使用plan中的premiumPerPerson，否则使用premiums中的值
                            const planPremium = empPlan.premiumPerPerson || premiums[empPlan.id];
                            if (planPremium) {
                              return `¥${planPremium}元`;
                            }
                          }
                          return '—';
                        })()}
                      </span>
                    </td>
                  </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
         <div className="bg-gray-50 p-4 border border-t-0 border-gray-200 rounded-b-lg text-xs text-gray-500">
             <p>一共{employees.filter(e => e.planId === activePlanTab).length}名被保人（{plans.find(p => p.id === activePlanTab)?.name || '当前方案'}），已选中0位</p>
             <p className="mt-1">请注意被保人职业类别，如果职业类别高于投保方案时选择的职业类别，可能导致无法投保，请返回修改投保方案</p>
             <p>职业类别属于重要告知内容，投保人务必如实填写，如一人同时涉及多个岗位的，则以职业类别最高的岗位申报；如果申报的职业与实际不一致的，后续可能导致无法理赔</p>
         </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button onClick={onPrev} className="px-8 py-2 bg-white border border-blue-400 text-blue-600 rounded shadow-sm hover:bg-blue-50 text-sm">
          上一步
        </button>
        <div className="flex gap-4">
           <button 
            onClick={async () => {
              if (!selectedProductId) {
                alert('请先选择产品');
                return;
              }
              
              if (!companyInfo.name || !companyInfo.creditCode) {
                alert('请先填写投保企业信息');
                return;
              }
              
              try {
                // 转换companyInfo字段名为后端期望的格式
                const company_info = {
                  name: companyInfo.name || '',
                  credit_code: companyInfo.creditCode || '',
                  province: companyInfo.province || '',
                  city: companyInfo.city || '',
                  district: companyInfo.district || '',
                  province_id: companyInfo.provinceId || null,
                  city_id: companyInfo.cityId || null,
                  district_id: companyInfo.districtId || null,
                  address: companyInfo.address || '',
                  contact_name: companyInfo.contactName || '',
                  contact_phone: companyInfo.contactPhone || '',
                  contact_email: companyInfo.contactEmail || '',
                  industry: companyInfo.industry || '',
                };
                
                const result = await saveDraft({
                  company_info: company_info,
                  product_id: selectedProductId,
                  plans: plans,
                  employees: employees,
                  effective_date: effectiveDate,
                  expiry_date: terminationDate,
                  common_duration: commonDuration,
                  selected_plan_ids: selectedPlanIds,
                  premiums: premiums,
                });
                
                alert(result.message || '保单已缓存成功');
              } catch (error: any) {
                console.error('缓存失败:', error);
                alert('缓存失败: ' + (error.message || '未知错误'));
              }
            }}
            className="px-8 py-2 bg-white border border-blue-400 text-blue-600 rounded shadow-sm hover:bg-blue-50 text-sm flex items-center gap-1"
          >
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
                {plan.premiumPerPerson && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-blue-600 font-semibold">每人保费: ¥{plan.premiumPerPerson}元</div>
                    {plan.totalPremium && (
                      <div className="text-blue-600 font-semibold">总保费: ¥{plan.totalPremium}元</div>
                    )}
                  </div>
                )}
             </div>
           ))}
         </div>
         {/* 显示总保费 */}
         {(() => {
           const totalPremium = plans.reduce((sum, plan) => sum + (plan.totalPremium || 0), 0);
           return totalPremium > 0 ? (
             <div className="mt-4 pt-4 border-t border-gray-200">
               <div className="text-right">
                 <span className="text-lg font-bold text-blue-600">合计支付保费: ¥{totalPremium}元</span>
               </div>
             </div>
           ) : null;
         })()}
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
  
  // 保费信息状态（用于在页面间传递）
  const [premiums, setPremiums] = useState<Record<string, number>>({});
  
  // PlanSelectionDynamic 的内部状态（用于保持选择状态）
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<Record<string, number>>({});
  const [commonDuration, setCommonDuration] = useState<string>('1年'); // 统一的保障期限
  const [effectiveDate, setEffectiveDate] = useState<string>(''); // 生效日期

  // 恢复草稿数据
  useEffect(() => {
    const restoreDraftStr = localStorage.getItem('restoreDraft');
    if (restoreDraftStr) {
      try {
        const draftData = JSON.parse(restoreDraftStr);
        console.log('恢复草稿数据:', draftData);
        
        // 恢复企业信息（需要转换字段名从下划线到驼峰）
        if (draftData.company_info) {
          const ci = draftData.company_info;
          
          // 如果地区ID不存在，尝试根据地区名称查找ID
          const restoreRegionIds = async () => {
            let provinceId = ci.province_id;
            let cityId = ci.city_id;
            let districtId = ci.district_id;
            
            // 如果省份ID不存在但省份名称存在，查找省份ID
            if (!provinceId && ci.province) {
              try {
                const provinces = await getProvinces();
                const province = provinces.find((p: any) => p.region_name === ci.province);
                if (province) {
                  provinceId = province.region_id;
                }
              } catch (e) {
                console.error('查找省份ID失败:', e);
              }
            }
            
            // 如果城市ID不存在但城市名称存在，查找城市ID
            if (!cityId && ci.city && provinceId) {
              try {
                const cities = await getRegions({ level: '2', parent_id: provinceId });
                const city = cities.find((c: any) => c.region_name === ci.city);
                if (city) {
                  cityId = city.region_id;
                }
              } catch (e) {
                console.error('查找城市ID失败:', e);
              }
            }
            
            // 如果区县ID不存在但区县名称存在，查找区县ID
            if (!districtId && ci.district && cityId) {
              try {
                const districts = await getRegions({ level: '3', parent_id: cityId });
                const district = districts.find((d: any) => d.region_name === ci.district);
                if (district) {
                  districtId = district.region_id;
                }
              } catch (e) {
                console.error('查找区县ID失败:', e);
              }
            }
            
            // 更新企业信息，包含查找后的ID
            setCompanyInfo({
              name: ci.name || '',
              creditCode: ci.credit_code || '',
              province: ci.province || '',
              city: ci.city || '',
              district: ci.district || '',
              address: ci.address || '',
              contactName: ci.contact_name || '',
              contactPhone: ci.contact_phone || '',
              contactEmail: ci.contact_email || '',
              industry: ci.industry || '',
              provinceId: provinceId,
              cityId: cityId,
              districtId: districtId,
            });
          };
          
          // 如果ID都存在，直接设置；否则异步查找
          if (ci.province_id && ci.city_id && ci.district_id) {
            setCompanyInfo({
              name: ci.name || '',
              creditCode: ci.credit_code || '',
              province: ci.province || '',
              city: ci.city || '',
              district: ci.district || '',
              address: ci.address || '',
              contactName: ci.contact_name || '',
              contactPhone: ci.contact_phone || '',
              contactEmail: ci.contact_email || '',
              industry: ci.industry || '',
              provinceId: ci.province_id,
              cityId: ci.city_id,
              districtId: ci.district_id,
            });
          } else {
            restoreRegionIds();
          }
        }
        
        // 恢复产品ID
        if (draftData.product_id) {
          setSelectedProductId(draftData.product_id);
        }
        
        // 恢复方案
        if (draftData.plans && Array.isArray(draftData.plans)) {
          setPlans(draftData.plans);
        }
        
        // 恢复被保人
        if (draftData.employees && Array.isArray(draftData.employees)) {
          setEmployees(draftData.employees);
        }
        
        // 恢复保障期限
        if (draftData.common_duration) {
          setCommonDuration(draftData.common_duration);
        }
        
        // 恢复生效日期
        if (draftData.effective_date) {
          setEffectiveDate(draftData.effective_date);
        }
        
        // 恢复方案ID映射
        if (draftData.selected_plan_ids) {
          setSelectedPlanIds(draftData.selected_plan_ids);
        }
        
        // 恢复保费信息
        if (draftData.premiums) {
          setPremiums(draftData.premiums);
        }
        
        // 清除恢复标记
        localStorage.removeItem('restoreDraft');
        
        // 跳转到第一步
        setCurrentStep(1);
      } catch (error) {
        console.error('恢复草稿数据失败:', error);
        localStorage.removeItem('restoreDraft');
      }
    }
  }, []);

  // Pre-fill a sample employee for demo when reaching step 2
  useEffect(() => {
     if (currentStep === 2 && employees.length === 0 && plans.length > 0) {
        // 为每个方案创建一个示例被保人
        const sampleEmployees: Employee[] = plans.map((plan, index) => ({
          id: `sample-${plan.id}`,
          name: index === 0 ? '张三' : '',
          idType: '身份证',
          idNumber: index === 0 ? '110101199001011234' : '',
          gender: '男',
          jobCode: '00714035',
          jobCategory: plan.jobClass || '5类',
          planId: plan.id // 关联到对应的方案
        }));
        setEmployees(sampleEmployees);
     }
  }, [currentStep, plans.length]);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <Steps current={currentStep} />
      
      {currentStep === 1 && (
        <PlanSelectionDynamic 
          plans={plans} 
          setPlans={setPlans} 
          companyInfo={companyInfo}
          setCompanyInfo={setCompanyInfo}
          premiums={premiums}
          setPremiums={setPremiums}
          selectedProductId={selectedProductId}
          setSelectedProductId={setSelectedProductId}
          selectedPlanIds={selectedPlanIds}
          setSelectedPlanIds={setSelectedPlanIds}
          commonDuration={commonDuration}
          setCommonDuration={setCommonDuration}
          onNext={() => setCurrentStep(2)} 
        />
      )}
      
      {currentStep === 2 && (
        <InfoFilling 
          companyInfo={companyInfo} 
          setCompanyInfo={setCompanyInfo}
          employees={employees}
          setEmployees={setEmployees}
          plans={plans}
          selectedProductId={selectedProductId}
          selectedPlanIds={selectedPlanIds}
          premiums={premiums}
          effectiveDate={effectiveDate}
          setEffectiveDate={setEffectiveDate}
          commonDuration={commonDuration}
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