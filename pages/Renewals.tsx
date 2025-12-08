import React, { useState } from 'react';
import { Calendar, ChevronDown, FileQuestion } from 'lucide-react';

const Renewals: React.FC = () => {
  const [filter, setFilter] = useState({
    holderName: '',
    policyNo: '',
    approvalStatus: 'all',
    startDate: '',
    endDate: '',
  });

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
            <label className="w-24 text-sm text-gray-600">批单号</label>
             <input 
              type="text" 
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder=""
            />
          </div>
           <div className="flex items-center">
            <label className="w-24 text-sm text-gray-600">批单状态</label>
            <div className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm flex justify-between items-center cursor-pointer">
               <span className="text-gray-600">全部订单</span>
               <ChevronDown className="text-gray-400 h-4 w-4" />
            </div>
          </div>
        </div>
         <div className="mt-6 flex justify-center md:justify-start md:ml-24">
          <button className="px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm shadow-sm flex items-center gap-2">
            查询
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center text-center p-8">
         <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <FileQuestion className="text-gray-300 h-10 w-10" />
         </div>
         <p className="text-gray-500 text-sm">未查询到订单</p>
      </div>
    </div>
  );
};

export default Renewals;