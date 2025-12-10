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
    // 返回response.data，因为后端统一返回 {success, data, ...} 格式
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

// ============================================
// 投保单相关API
// ============================================

/**
 * 获取投保单列表
 */
export const getApplications = async (params?: {
  keyword?: string;
  status?: string;
  company_name?: string;
  product_id?: string | number;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.keyword) queryParams.append('keyword', params.keyword);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.company_name) queryParams.append('company_name', params.company_name);
  if (params?.product_id) queryParams.append('product_id', String(params.product_id));
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.page_size) queryParams.append('page_size', String(params.page_size));
  
  const queryString = queryParams.toString();
  const response: any = await api.get(`/applications${queryString ? `?${queryString}` : ''}`);
  // 后端返回格式: { success: true, data: [...], pagination: {...} }
  // axios拦截器已经提取了response.data，所以response就是后端返回的数据
  if (response && response.success && response.data) {
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  }
  return response;
};

/**
 * 获取投保单详情
 */
export const getApplication = async (applicationId: number) => {
  const response = await api.get(`/applications/${applicationId}`);
  return response.data || response;
};

// ============================================
// 拦截规则相关API
// ============================================

/**
 * 获取拦截规则列表
 */
export const getInterceptRules = async () => {
  const response = await api.get('/products/intercept-rules/list');
  return response.data || response;
};

export default api;

