// 自定义Hook：获取产品和方案数据
import { useState, useEffect } from 'react';
import { getProducts, getPlans, getPlanLiabilities } from '../services/api';

interface Product {
  product_id: number;
  product_code: string;
  product_name: string;
  product_type: string;
  company_name: string;
  company_code: string;
}

interface Plan {
  plan_id: number;
  plan_code: string;
  plan_name: string;
  job_class_range: string;
  duration_options: string[];
  payment_type: string;
}

interface PlanLiability {
  id: number;
  liability_id: number;
  liability_name: string;
  liability_type: string;
  is_required: boolean;
  coverage_options: string[];
  default_coverage: string;
  unit: string;
  display_order: number;
}

export const useProductPlans = (productId?: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planLiabilities, setPlanLiabilities] = useState<Record<number, PlanLiability[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取产品列表（只获取启用的产品）
  const fetchProducts = async (companyCode?: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== 前端：开始获取产品列表 ===');
      console.log('API地址:', import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8888/api');
      
      const productList = await getProducts({ company_code: companyCode });
      console.log('获取到的产品数据（原始）:', productList);
      console.log('数据类型:', Array.isArray(productList) ? '数组' : typeof productList);
      console.log('数据长度:', Array.isArray(productList) ? productList.length : 'N/A');
      
      if (Array.isArray(productList) && productList.length > 0) {
        const firstProduct = productList[0];
        console.log('第一条产品:');
        console.log('  product_id:', firstProduct.product_id);
        console.log('  product_name (原始):', firstProduct.product_name);
        console.log('  product_name (类型):', typeof firstProduct.product_name);
        console.log('  product_name (长度):', firstProduct.product_name?.length);
        console.log('  product_name (包含乱码?):', /[éäç]/.test(firstProduct.product_name || ''));
        
        // 检查是否是乱码，如果是则尝试转换
        if (firstProduct.product_name && /[éäç]/.test(firstProduct.product_name)) {
          console.log('  ⚠️  检测到可能的乱码字符，尝试转换...');
          try {
            // 尝试从latin1转换（如果数据被错误地当作latin1存储）
            const fixed = Buffer.from(firstProduct.product_name, 'latin1').toString('utf8');
            console.log('  转换后:', fixed);
            if (/[\u4e00-\u9fa5]/.test(fixed)) {
              console.log('  ✅ 转换成功，使用转换后的数据');
              firstProduct.product_name = fixed;
            }
          } catch (e) {
            console.log('  ❌ 转换失败:', e);
          }
        }
      }
      
      // getProducts已经处理了响应格式，直接返回数组
      // 确保只显示启用的产品（后端已经过滤，这里做二次确认）
      const enabledProducts = Array.isArray(productList) 
        ? productList.filter((p: any) => !p.status || p.status === '启用')
        : [];
      
      console.log('过滤后的产品数量:', enabledProducts.length);
      console.log('=== 前端：产品列表获取完成 ===');
      
      setProducts(enabledProducts);
    } catch (err: any) {
      setError(err.message || '获取产品列表失败');
      console.error('获取产品列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 获取方案列表
  const fetchPlans = async (productId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlans(productId);
      setPlans(data);
    } catch (err: any) {
      setError(err.message || '获取方案列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取方案的责任配置
  const fetchPlanLiabilities = async (planId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlanLiabilities(planId);
      setPlanLiabilities((prev) => ({
        ...prev,
        [planId]: data,
      }));
    } catch (err: any) {
      setError(err.message || '获取责任配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 当productId变化时，自动获取方案列表
  useEffect(() => {
    if (productId) {
      fetchPlans(productId);
    }
  }, [productId]);

  return {
    products,
    plans,
    planLiabilities,
    loading,
    error,
    fetchProducts,
    fetchPlans,
    fetchPlanLiabilities,
  };
};

