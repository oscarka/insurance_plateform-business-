import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8888/api',
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// 责任相关API
// ============================================

/**
 * 获取责任列表
 */
export const getLiabilities = async (params?: { company_id?: string | number; is_additional?: string | number }) => {
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', String(params.company_id));
  if (params?.is_additional !== undefined) queryParams.append('is_additional', String(params.is_additional));
  const queryString = queryParams.toString();
  const response = await api.get(`/liabilities${queryString ? `?${queryString}` : ''}`);
  return response.data || response;
};

/**
 * 获取责任详情
 */
export const getLiability = async (id: number) => {
  const response = await api.get(`/liabilities/${id}`);
  return response.data || response;
};

// ============================================
// 条款相关API
// ============================================

/**
 * 获取条款列表
 */
export const getClauses = async (params?: { company_id?: string | number; clause_type?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', String(params.company_id));
  if (params?.clause_type) queryParams.append('clause_type', params.clause_type);
  const queryString = queryParams.toString();
  const response = await api.get(`/clauses${queryString ? `?${queryString}` : ''}`);
  return response.data || response;
};

/**
 * 获取条款详情
 */
export const getClause = async (id: number) => {
  const response = await api.get(`/clauses/${id}`);
  return response.data || response;
};

// ============================================
// 特别约定相关API
// ============================================

/**
 * 获取特别约定列表
 */
export const getSpecialAgreements = async (params?: { company_id?: string | number; liability_id?: string | number; is_linked?: string | number }) => {
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', String(params.company_id));
  if (params?.liability_id) queryParams.append('liability_id', String(params.liability_id));
  if (params?.is_linked !== undefined) queryParams.append('is_linked', String(params.is_linked));
  const queryString = queryParams.toString();
  const response = await api.get(`/special-agreements${queryString ? `?${queryString}` : ''}`);
  return response.data || response;
};

/**
 * 获取特别约定详情
 */
export const getSpecialAgreement = async (id: number) => {
  const response = await api.get(`/special-agreements/${id}`);
  return response.data || response;
};

// ============================================
// 保司相关API
// ============================================

/**
 * 获取保司列表
 */
export const getInsuranceCompanies = async () => {
  const response = await api.get('/insurance-companies');
  return response.data || response;
};

// ============================================
// 方案相关API
// ============================================

/**
 * 获取方案详情
 */
export const getPlan = async (planId: string | number) => {
  const response = await api.get(`/plans/${planId}`);
  return response.data || response;
};

/**
 * 获取方案的责任配置
 */
export const getPlanLiabilities = async (planId: string | number) => {
  const response = await api.get(`/plans/${planId}/liabilities`);
  return response.data || response;
};

/**
 * 删除方案的责任配置
 */
export const deletePlanLiability = async (planId: string | number, liabilityId: string | number) => {
  const response = await api.delete(`/plans/${planId}/liabilities/${liabilityId}`);
  return response.data || response;
};

// ============================================
// 费率相关API
// ============================================

/**
 * 获取费率列表
 */
export const getRates = async (params?: { product_id?: string | number; plan_id?: string | number; premium_type?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.product_id) queryParams.append('product_id', String(params.product_id));
  if (params?.plan_id) queryParams.append('plan_id', String(params.plan_id));
  if (params?.premium_type) queryParams.append('premium_type', params.premium_type);
  const queryString = queryParams.toString();
  const response = await api.get(`/premium/rates/list${queryString ? `?${queryString}` : ''}`);
  return response.data || response;
};

export default api;

