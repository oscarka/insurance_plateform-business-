import React, { useState } from 'react';
import { Search, FileText, ChevronDown, Calendar, X } from 'lucide-react';

const MOCK_INVOICES = [
  {
    id: '1',
    productName: 'Enterprise Liability Insurance (2025) - Plan A',
    holderName: 'Future Tech Solutions Ltd.',
    policyNo: 'P2025001',
    amount: 1021.80,
    invoiceStatus: 'issued', // issued, applying, not_applied
    invoiceStatusText: '已开票',
    applyTime: '2025-05-15 10:00'
  },
  {
    id: '2',
    productName: 'Enterprise Liability Insurance (2025) - Plan C',
    holderName: 'SecureGuard Services Inc.',
    policyNo: 'P2025002',
    amount: 3073.20,
    invoiceStatus: 'applying',
    invoiceStatusText: '开票中',
    applyTime: '2025-08-15 11:30'
  }
];

const Invoices: React.FC = () => {
  const [filter, setFilter] = useState({
    holderName: '',
    policyNo: '',
    invoiceStatus: 'all'
  });

  return (
    <div className="space-y-6">
       {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex items-center">
            <label className="w-24 text-sm text-gray-600">投保人名称</label>
            <input 
              type="text" 
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filter.holderName}
              onChange={(e) => setFilter({...filter, holderName: e.target.value})}
              placeholder="请输入投保人名称"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-sm text-gray-600">保单号</label>
            <input 
              type="text" 
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filter.policyNo}
              onChange={(e) => setFilter({...filter, policyNo: e.target.value})}
              placeholder="请输入保单号"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-sm text-gray-600">发票状态</label>
            <div className="flex-1">
               <select 
                 className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                 value={filter.invoiceStatus}
                 onChange={(e) => setFilter({...filter, invoiceStatus: e.target.value})}
               >
                 <option value="all">全部</option>
                 <option value="issued">已开票</option>
                 <option value="applying">开票中</option>
                 <option value="not_applied">未申请</option>
               </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4 justify-center md:justify-start md:ml-24">
          <button className="px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm shadow-sm flex items-center gap-2">
            查询
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 tracking-wider">投保人名称</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 tracking-wider">保单信息</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 tracking-wider">金额</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 tracking-wider">发票信息</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_INVOICES.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    <div className="text-sm font-medium text-gray-900">{item.holderName}</div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-1 text-xs text-gray-500">
                      <p className="font-medium text-gray-700">{item.productName}</p>
                      <p>保单号：{item.policyNo}</p>
                      <p>投保时间：{item.applyTime}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top text-sm text-gray-600">
                    <span className="font-bold">{item.amount.toFixed(2)}</span> 元
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      item.invoiceStatus === 'issued' ? 'bg-green-100 text-green-700' :
                      item.invoiceStatus === 'applying' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {item.invoiceStatusText}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top text-sm font-medium space-y-2">
                    {item.invoiceStatus === 'issued' ? (
                       <button className="block text-blue-600 hover:text-blue-800">
                        下载发票
                      </button>
                    ) : item.invoiceStatus === 'not_applied' ? (
                       <button className="block text-blue-600 hover:text-blue-800">
                        申请开票
                      </button>
                    ) : (
                      <span className="text-gray-400 cursor-not-allowed">处理中</span>
                    )}
                    <button className="block text-gray-500 hover:text-gray-700 text-xs mt-1">
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
         {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-end gap-4">
             <div className="text-sm text-gray-500">
                前往 <input type="text" className="w-10 border border-gray-300 rounded text-center py-0.5 mx-1" defaultValue="1" /> 页
             </div>
             <p className="text-sm text-gray-500">共2条</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;