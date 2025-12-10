// 前端API服务 - 连接后台配置系统
// 注意：需要安装 axios: npm install axios

// 如果项目中没有axios，可以使用fetch
// 这里提供一个使用fetch的版本
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8888/api';

// 简单的fetch封装
const request = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('=== API请求 ===');
  console.log('URL:', `${API_BASE_URL}${url}`);
  console.log('方法:', options.method || 'GET');
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  console.log('响应状态:', response.status, response.statusText);
  console.log('Content-Type:', response.headers.get('Content-Type'));
  console.log('Content-Encoding:', response.headers.get('Content-Encoding'));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(`API Error: ${response.statusText}`);
  }

  // 获取响应文本（用于调试）
  const responseText = await response.text();
  console.log('响应文本（前200字符）:', responseText.substring(0, 200));
  console.log('响应文本（包含乱码?）:', /[éäç]/.test(responseText));
  
  // 解析JSON
  let data;
  try {
    data = JSON.parse(responseText);
    console.log('JSON解析成功');
    console.log('数据keys:', Object.keys(data));
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      const first = data.data[0];
      console.log('第一条数据 product_name:', first.product_name);
      console.log('第一条数据 product_name (类型):', typeof first.product_name);
    }
  } catch (e) {
    console.error('JSON解析失败:', e);
    throw e;
  }
  
  console.log('=== API请求完成 ===');
  
  // 统一处理响应格式：如果返回的是{success, data, count}格式，提取data字段
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    // 对于数组类型的data，直接返回数组
    if (Array.isArray(data.data)) {
      console.log(`提取${url}的data字段，数量:`, data.data.length);
      return data.data;
    }
    // 对于对象类型的data，返回对象
    return data.data;
  }
  
  return data;
};

// 如果使用axios，取消注释下面的代码
/*
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
*/

// 注意：如果需要使用axios，可以取消注释上面的代码并安装axios

// ============================================
// 产品相关API
// ============================================

/**
 * 获取产品列表
 */
export const getProducts = async (params?: { company_code?: string }) => {
  // 过滤掉undefined和空字符串的参数
  const cleanParams: any = {};
  if (params && params.company_code && params.company_code !== 'undefined' && params.company_code.trim() !== '') {
    cleanParams.company_code = params.company_code;
  }
  const queryString = Object.keys(cleanParams).length > 0 ? `?${new URLSearchParams(cleanParams).toString()}` : '';
  console.log('getProducts调用参数:', params, '清理后:', cleanParams, '查询字符串:', queryString);
  const response = await request(`/products${queryString}`);
  console.log('getProducts响应类型:', typeof response, '是数组?', Array.isArray(response));
  
  // request函数已经处理了响应格式，对于/products接口会返回data数组
  // 但如果返回的是完整对象，提取data字段
  if (response && typeof response === 'object' && !Array.isArray(response) && 'data' in response) {
    console.log('getProducts: 提取data字段，数量:', Array.isArray(response.data) ? response.data.length : 0);
    return Array.isArray(response.data) ? response.data : [];
  }
  // 如果已经是数组，直接返回
  if (Array.isArray(response)) {
    console.log('getProducts: 直接返回数组，数量:', response.length);
    return response;
  }
  console.log('getProducts: 返回空数组（格式不匹配）');
  return [];
};

/**
 * 获取产品详情
 */
export const getProduct = async (productId: number) => {
  return request(`/products/${productId}`);
};

// ============================================
// 方案相关API
// ============================================

/**
 * 获取产品下的方案列表
 */
export const getPlans = async (productId: number) => {
  const response = await request(`/products/${productId}/plans`);
  // 后端返回格式：{ success: true, data: [...], count: ... }
  return response.data || response;
};

/**
 * 获取方案详情
 */
export const getPlan = async (planId: number) => {
  return request(`/plans/${planId}`);
};

/**
 * 获取方案的责任配置（包含保额选项）
 */
export const getPlanLiabilities = async (planId: number) => {
  console.log('getPlanLiabilities调用，planId:', planId);
  const response = await request(`/plans/${planId}/liabilities`);
  console.log('getPlanLiabilities响应:', response);
  // request函数已经统一处理了响应格式，会返回data数组
  return Array.isArray(response) ? response : [];
};

// ============================================
// 费率相关API
// ============================================

/**
 * 计算保费
 * @param params 计算参数
 */
export const calculatePremium = async (params: {
  product_id: number;
  plan_id: number;
  liability_selections: Array<{
    liability_id: number;
    coverage_amount: string;
  }>;
  job_class: string;
  insured_count: number;
  duration?: string;
}) => {
  console.log('[API] calculatePremium 请求参数:', params);
  const response = await request('/premium/calculate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  console.log('[API] calculatePremium 响应数据:', response);
  return response;
};

/**
 * 查询费率
 */
export const getRates = async (params: {
  product_id: number;
  liability_id: number;
  job_class: string;
  coverage_amount: string;
}) => {
  const queryString = `?${new URLSearchParams(params as any).toString()}`;
  return request(`/rates${queryString}`);
};

// ============================================
// 投保相关API
// ============================================

/**
 * 创建投保单
 */
export const createApplication = async (data: {
  company_id?: number;
  company_info: {
    name: string;
    credit_code: string;
    province: string;
    city: string;
    district: string;
    address: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
  };
  product_id: number;
  plan_instances: Array<{
    plan_id: number;
    plan_name: string;
    job_class: string;
    duration: string;
    insured_count: number;
    liability_selections: Array<{
      liability_id: number;
      coverage_amount: string;
      coverage_value?: number;
      unit: string;
    }>;
  }>;
  effective_date: string;
  expiry_date: string;
}) => {
  return request('/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * 获取投保单详情
 */
export const getApplication = async (applicationId: number) => {
  return request(`/applications/${applicationId}`);
};

/**
 * 提交核保
 */
export const submitUnderwriting = async (applicationId: number) => {
  return request(`/applications/${applicationId}/underwriting`, {
    method: 'POST',
  });
};

// ============================================
// 保司相关API
// ============================================

/**
 * 获取保司列表
 */
export const getInsuranceCompanies = async () => {
  return request('/insurance-companies');
};

// ============================================
// 地区相关API
// ============================================

/**
 * 获取地区列表
 */
export const getRegions = async (params?: {
  level?: number;
  parent_id?: number;
  parent_code?: string;
  status?: string;
}) => {
  const queryString = params && Object.keys(params).length > 0
    ? `?${new URLSearchParams(params as any).toString()}`
    : '';
  return request(`/regions${queryString}`);
};

/**
 * 获取所有省份
 */
export const getProvinces = async () => {
  return request('/regions/provinces');
};

/**
 * 获取产品的拦截规则配置
 */
export const getInterceptRules = async (productId: number) => {
  return request(`/products/${productId}/intercept-rules`);
};

/**
 * 职业分类相关API
 */
export const getOccupationLevels = async (companyId?: number, productId?: number) => {
  const params = new URLSearchParams();
  if (companyId) params.append('company_id', companyId.toString());
  if (productId) params.append('product_id', productId.toString());
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const result = await request(`/occupations/levels${queryString}`);
  return result.data || result;
};

export const getOccupationCategories = async (
  industryLargeCode: string, 
  companyId?: number,
  productId?: number
) => {
  const params = new URLSearchParams({ industry_large_code: industryLargeCode });
  if (companyId) params.append('company_id', companyId.toString());
  if (productId) params.append('product_id', productId.toString());
  const result = await request(`/occupations/categories?${params}`);
  return result.data || result;
};

export const getOccupationDetails = async (
  industryLargeCode: string,
  industryMediumCode: string,
  companyId?: number,
  productId?: number
) => {
  const params = new URLSearchParams({
    industry_large_code: industryLargeCode,
    industry_medium_code: industryMediumCode,
  });
  if (companyId) params.append('company_id', companyId.toString());
  if (productId) params.append('product_id', productId.toString());
  const result = await request(`/occupations/details?${params}`);
  return result.data || result;
};

export const searchOccupations = async (keyword: string, companyId?: number) => {
  const params = new URLSearchParams({ keyword });
  if (companyId) params.append('company_id', companyId.toString());
  const result = await request(`/occupations/search?${params}`);
  return result.data || result;
};

export const getOccupationByCode = async (code: string, companyId?: number) => {
  const params = companyId ? `?company_id=${companyId}` : '';
  const result = await request(`/occupations/${code}${params}`);
  return result.data || result;
};

