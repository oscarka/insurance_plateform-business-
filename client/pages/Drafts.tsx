import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronRight, Clock, Building2, Trash2 } from 'lucide-react';
import { getDrafts, getDraft, deleteDraft } from '../src/services/api';

interface DraftItem {
  application_id: number;
  application_no: string;
  total_premium: number;
  insured_count: number;
  effective_date: string;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

interface ProductDraft {
  product_id: number;
  product_name: string;
  drafts: DraftItem[];
}

interface CompanyDraft {
  company_id: number;
  company_name: string;
  credit_code: string;
  products: ProductDraft[];
}

const Drafts: React.FC = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [drafts, setDrafts] = useState<CompanyDraft[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载草稿列表
  const loadDrafts = async () => {
    setLoading(true);
    try {
      const data = await getDrafts(
        searchTerm ? { company_name: searchTerm } : undefined
      );
      setDrafts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('加载草稿列表失败:', error);
      alert('加载草稿列表失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleSearch = () => {
    loadDrafts();
  };

  const toggleExpand = (companyId: number) => {
    setExpandedId(expandedId === companyId ? null : companyId);
    setExpandedProductId(null);
  };

  const toggleProductExpand = (productId: number) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  // 恢复草稿
  const handleRestoreDraft = async (draftId: number) => {
    try {
      const draft = await getDraft(draftId);
      if (draft && draft.draft_data) {
        // 将草稿数据存储到localStorage，然后跳转到NewPolicy页面
        localStorage.setItem('restoreDraft', JSON.stringify(draft.draft_data));
        navigate('/new-policy');
      } else {
        alert('草稿数据不存在');
      }
    } catch (error: any) {
      console.error('恢复草稿失败:', error);
      alert('恢复草稿失败: ' + (error.message || '未知错误'));
    }
  };

  // 删除草稿
  const handleDeleteDraft = async (draftId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个草稿吗？')) {
      return;
    }
    
    try {
      await deleteDraft(draftId);
      alert('草稿已删除');
      loadDrafts();
    } catch (error: any) {
      console.error('删除草稿失败:', error);
      alert('删除草稿失败: ' + (error.message || '未知错误'));
    }
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">保单缓存</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="请填写投保企业"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={handleSearch}
            className="px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm shadow-sm"
          >
            搜索
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 min-h-[400px]">
        {loading ? (
          <div className="p-8 text-center text-gray-400">加载中...</div>
        ) : drafts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">暂无缓存记录</div>
        ) : (
          drafts.map((company) => (
            <div key={company.company_id} className="border-b border-gray-100 last:border-0">
              <div 
                className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(company.company_id)}
              >
                <div className="mr-3 text-gray-400">
                  {expandedId === company.company_id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-1.5 rounded text-blue-600">
                    <Building2 size={18} />
                  </div>
                  <span className="font-medium text-gray-800">{company.company_name}</span>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">统一社会信用代码: {company.credit_code}</span>
                </div>
              </div>

              {expandedId === company.company_id && (
                <div className="bg-gray-50/50 p-6 border-t border-gray-100">
                  {company.products.length > 0 ? (
                    company.products.map(product => (
                      <div key={product.product_id} className="space-y-4 mb-6 last:mb-0">
                        <div className="text-sm text-gray-600 mb-2">请选择需要查看保单缓存的商品</div>
                        <button 
                          onClick={() => toggleProductExpand(product.product_id)}
                          className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-600 text-sm rounded-md flex items-center gap-2 hover:bg-blue-100 transition-colors"
                        >
                          <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-sm">{product.product_id}</span>
                          {product.product_name}
                          {expandedProductId === product.product_id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        
                        {expandedProductId === product.product_id && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">投保缓存记录</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {product.drafts.map(draft => (
                                <div 
                                  key={draft.application_id} 
                                  className="bg-white border border-gray-200 rounded p-3 text-xs text-gray-600 hover:border-blue-300 cursor-pointer transition-colors shadow-sm group relative"
                                  onClick={() => handleRestoreDraft(draft.application_id)}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <Clock size={14} className="text-gray-400"/>
                                    <span className="font-medium">暂存时间</span>
                                    <button
                                      onClick={(e) => handleDeleteDraft(draft.application_id, e)}
                                      className="ml-auto opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  <div className="text-gray-800 font-medium">{formatTime(draft.updated_at)}</div>
                                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
                                    <div>总保费: ¥{draft.total_premium}</div>
                                    <div>被保人数: {draft.insured_count}人</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 py-4 text-center">暂无缓存记录</div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
         
         {drafts.length > 0 && (
           <div className="flex justify-end p-4 items-center gap-2 text-sm text-gray-500">
             <span>共{drafts.length}个企业</span>
           </div>
         )}
      </div>
    </div>
  );
};

export default Drafts;