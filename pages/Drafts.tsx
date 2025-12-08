import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Clock, Building2 } from 'lucide-react';

const MOCK_DRAFTS = [
  {
    id: '1',
    companyName: 'Future Tech Solutions Ltd.',
    creditCode: '91131028MAC0E1R50R',
    products: [
      {
        id: 'p1',
        name: 'Enterprise Liability Insurance (Classic)',
        drafts: [
           { id: 'd1', time: '2025-08-14 15:27:23' },
           { id: 'd2', time: '2025-08-13 15:55:24' },
           { id: 'd3', time: '2025-08-13 15:47:26' },
           { id: 'd4', time: '2025-08-13 15:41:02' },
           { id: 'd5', time: '2025-08-12 12:26:19' },
        ]
      }
    ]
  },
  {
    id: '2',
    companyName: 'SecureGuard Services Inc.',
    creditCode: '9111011275415855X1',
    products: []
  },
  {
    id: '3',
    companyName: 'Swift Logistics Co.',
    creditCode: '91131026MA7BPFFP7L',
    products: []
  },
  {
     id: '4',
     companyName: 'River City Construction',
     creditCode: '91110112MAD0XWLJ78',
     products: []
  }
];

const Drafts: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
          <button className="px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm shadow-sm">
            搜索
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 min-h-[400px]">
        {MOCK_DRAFTS.map((company) => (
          <div key={company.id} className="border-b border-gray-100 last:border-0">
             <div 
               className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
               onClick={() => toggleExpand(company.id)}
             >
               <div className="mr-3 text-gray-400">
                 {expandedId === company.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
               </div>
               <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-1.5 rounded text-blue-600">
                    <Building2 size={18} />
                  </div>
                  <span className="font-medium text-gray-800">{company.companyName}</span>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">统一社会信用代码: {company.creditCode}</span>
               </div>
             </div>

             {expandedId === company.id && (
               <div className="bg-gray-50/50 p-6 border-t border-gray-100">
                  {company.products.length > 0 ? (
                    company.products.map(product => (
                      <div key={product.id} className="space-y-4">
                        <div className="text-sm text-gray-600 mb-2">请选择需要查看保单缓存的商品</div>
                        <button className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-600 text-sm rounded-md flex items-center gap-2 hover:bg-blue-100 transition-colors">
                           <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-sm">344815</span>
                           {product.name}
                        </button>
                        
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">投保缓存记录</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                             {product.drafts.map(draft => (
                               <div key={draft.id} className="bg-white border border-gray-200 rounded p-3 text-xs text-gray-600 flex items-center gap-2 hover:border-blue-300 cursor-pointer transition-colors shadow-sm">
                                  <Clock size={14} className="text-gray-400"/>
                                  <span>暂存时间：{draft.time}</span>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 py-4 text-center">暂无缓存记录</div>
                  )}
               </div>
             )}
          </div>
        ))}
         
         <div className="flex justify-end p-4 items-center gap-2 text-sm text-gray-500">
            <div className="border border-gray-300 rounded px-2 py-1 flex items-center gap-2">
              10条/页 <ChevronDown size={14}/>
            </div>
            <div className="flex gap-1">
               <button className="w-8 h-8 border border-gray-300 rounded bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-white">&lt;</button>
               <button className="w-8 h-8 border border-blue-600 bg-blue-600 text-white rounded flex items-center justify-center">1</button>
               <button className="w-8 h-8 border border-gray-300 rounded bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-white">&gt;</button>
            </div>
            <span>前往</span>
            <input type="text" className="w-10 h-8 border border-gray-300 rounded text-center" defaultValue="1"/>
            <span>页</span>
            <span>共4条</span>
         </div>
      </div>
    </div>
  );
};

export default Drafts;