import React, { useState } from 'react';
import { Search, Upload, FileText, Calendar, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';

const MOCK_RECEIPTS = [
  {
    id: '1',
    productName: 'Team Safety Accident Insurance (Plan B)',
    holderName: 'SecureGuard Services Inc.',
    applyTime: '2025-08-14 15:22',
    orderNo: 'O2025081401',
    policyNo: 'P2025002',
    amount: 3073.20,
    status: '保障中',
    receiptStatus: 'passed', // passed, pending
    receiptStatusText: '回执已通过',
  },
  {
    id: '2',
    productName: 'Team Safety Accident Insurance (Plan B)',
    holderName: 'Future Tech Solutions Ltd.',
    applyTime: '2025-08-14 15:27',
    orderNo: 'O2025081402',
    policyNo: 'P2025001',
    amount: 1021.80,
    status: '保障中',
    receiptStatus: 'passed',
    receiptStatusText: '回执已通过',
  }
];

const Receipts: React.FC = () => {
  const [filter, setFilter] = useState({
    holderName: '',
    startDate: '',
    endDate: '',
    policyNo: '',
    receiptStatus: 'all'
  });

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-4">
          {/* Row 1 */}
          <div className="flex items-center">
            <label className="w-24 text-sm text-gray-600">投保人名称</label>
            <input 
              type="text" 
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filter.holderName}
              onChange={(e) => setFilter({...filter, holderName: e.target.value})}
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-sm text-gray-600">投保时间</label>
            <div className="flex-1 flex items-center gap-2">
               <div className="relative flex-1">
                 <input 
                   type="text" 
                   placeholder="开始日期"
                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none pl-8"
                 />
                 <Calendar className="absolute left-2.5 top-2.5 text-gray-400 h-4 w-4" />
               </div>
               <span className="text-gray-400">-</span>
               <div className="relative flex-1">
                 <input 
                   type="text" 
                   placeholder="结束日期"
                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none pl-8"
                 />
               </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex items-center">
            <label className="w-24 text-sm text-gray-600">保单号</label>
            <input 
              type="text" 
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filter.policyNo}
              onChange={(e) => setFilter({...filter, policyNo: e.target.value})}
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-sm text-gray-600">订单状态</label>
            <div className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm flex flex-wrap gap-2 min-h-[38px] items-center">
               <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                 待生效 <X size={12} className="cursor-pointer hover:text-blue-500"/>
               </span>
               <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                 保障中 <X size={12} className="cursor-pointer hover:text-blue-500"/>
               </span>
               <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                 已失效 <X size={12} className="cursor-pointer hover:text-blue-500"/>
               </span>
               <ChevronDown className="ml-auto text-gray-400 h-4 w-4 cursor-pointer" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex items-center">
            <label className="w-24 text-sm text-gray-600">回执状态</label>
            <div className="flex-1">
               <select 
                 className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                 value={filter.receiptStatus}
                 onChange={(e) => setFilter({...filter, receiptStatus: e.target.value})}
               >
                 <option value="all">全部订单</option>
                 <option value="passed">回执已通过</option>
                 <option value="pending">待上传</option>
               </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4 justify-center md:justify-start md:ml-24">
          <button className="px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm shadow-sm flex items-center gap-2">
            查询
          </button>
          <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm shadow-sm flex items-center gap-2">
            批量上传回执
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 tracking-wider">产品名称</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 tracking-wider">投保人名称</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 tracking-wider">保单信息</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 tracking-wider">金额</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 tracking-wider">保全信息</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_RECEIPTS.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                          {item.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{item.productName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top text-sm text-gray-600">
                    {item.holderName}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-1 text-xs text-gray-500">
                      <p>申请时间：{item.applyTime}</p>
                      <p>订单号：{item.orderNo}</p>
                      <p>保单号：{item.policyNo}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top text-sm text-gray-600">
                    {item.amount.toFixed(2)}元
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    <div className="text-sm text-gray-600">
                       <span className="text-gray-500">回执状态：</span>
                       <span className="text-gray-800">{item.receiptStatusText}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top text-sm font-medium space-y-2">
                    <button className="block text-blue-600 hover:text-blue-800">
                      上传回执
                    </button>
                    <button className="block text-blue-600 hover:text-blue-800">
                      查看日志
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

export default Receipts;