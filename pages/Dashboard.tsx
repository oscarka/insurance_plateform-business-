import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, FileText, ChevronRight, ChevronLeft, Eye } from 'lucide-react';
import { Policy } from '../types';

const MOCK_POLICIES: Policy[] = [
  {
    id: '1',
    policyNumber: 'P2025001',
    holderName: 'Future Tech Solutions Ltd.',
    productName: 'Enterprise Liability Insurance (Classic) - Plan A',
    premium: 1021.80,
    status: 'active',
    createTime: '2025-05-14 10:20',
    startDate: '2025-05-15',
    endDate: '2026-05-14',
    insuredCount: 12
  },
  {
    id: '2',
    policyNumber: 'P2025002',
    holderName: 'SecureGuard Services Inc.',
    productName: 'Enterprise Liability Insurance (Classic) - Plan C',
    premium: 3073.20,
    status: 'processing',
    createTime: '2025-08-14 15:22',
    startDate: '2025-08-15',
    endDate: '2026-08-14',
    insuredCount: 35
  },
   {
    id: '3',
    policyNumber: 'P2024099',
    holderName: 'Swift Logistics Co.',
    productName: 'Group Accident Protection - Plan B',
    premium: 5600.00,
    status: 'expired',
    createTime: '2024-01-10 09:00',
    startDate: '2024-01-11',
    endDate: '2025-01-10',
    insuredCount: 50
  }
];

const Dashboard: React.FC = () => {
  const [filter, setFilter] = useState({
    holder: '',
    policyNo: '',
    status: 'all'
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">保障中</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">处理中</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-500">已过期</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700">待审核</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">我的保单</h1>
        <Link 
          to="/new-policy" 
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          立即投保
        </Link>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">投保人名称</label>
            <input 
              type="text" 
              className="block w-full rounded-md border-gray-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="请输入投保人名称"
              value={filter.holder}
              onChange={e => setFilter({...filter, holder: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">保单号</label>
            <input 
              type="text" 
              className="block w-full rounded-md border-gray-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="请输入保单号"
              value={filter.policyNo}
              onChange={e => setFilter({...filter, policyNo: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">保单状态</label>
            <select 
              className="block w-full rounded-md border-gray-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filter.status}
              onChange={e => setFilter({...filter, status: e.target.value})}
            >
              <option value="all">全部订单</option>
              <option value="active">保障中</option>
              <option value="processing">处理中</option>
              <option value="expired">已过期</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button className="inline-flex items-center px-8 py-2 border border-transparent text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors">
            <Search className="mr-2 h-4 w-4" />
            查询
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投保人名称</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">保单信息</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">保全信息</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_POLICIES.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{policy.holderName}</div>
                    <div className="text-xs text-gray-500 mt-1">人数: {policy.insuredCount}人</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500">订单号: {policy.policyNumber}</div>
                    <div className="text-xs text-gray-500">保单号: {policy.policyNumber}</div>
                    <div className="text-sm text-gray-900 font-medium">{policy.productName}</div>
                    <div className="mt-1">
                      {getStatusBadge(policy.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-bold text-gray-900">{policy.premium.toFixed(2)}</span> 元
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {policy.status === 'active' ? '申请完成' : '审核中'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-y-2">
                    <Link to={`/policy/${policy.id}`} className="flex items-center justify-center gap-1 text-blue-600 hover:text-blue-900 hover:underline">
                      <Eye size={14} /> 查看详情
                    </Link>
                    <button className="block w-full text-gray-600 hover:text-blue-900 hover:underline">
                      下载发票
                    </button>
                    <button className="block w-full text-gray-600 hover:text-blue-900 hover:underline">
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
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                显示 <span className="font-medium">1</span> 到 <span className="font-medium">3</span> 条，共 <span className="font-medium">3</span> 条
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button aria-current="page" className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;