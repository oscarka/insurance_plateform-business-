import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Briefcase, 
  Shield, 
  Printer, 
  FileClock,
  MoreHorizontal
} from 'lucide-react';

const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode; 
  defaultOpen?: boolean; 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-1.5 rounded-md text-blue-600">
             <Icon size={18} />
          </div>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="text-gray-400 h-5 w-5" /> : <ChevronDown className="text-gray-400 h-5 w-5" />}
      </button>
      {isOpen && (
        <div className="px-6 py-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

const PolicyDetail: React.FC = () => {
  const { id } = useParams();

  // Mock Data
  const policyInfo = {
    holderName: 'Future Tech Solutions Ltd.',
    creditCode: '91131028MAC0E1R50R',
    address: 'Beijing, Tongzhou District, Zhangjiawan Town',
    contactName: 'Alice Zhang',
    contactPhone: '13800138000',
    contactEmail: 'alice@futuretech.com',
    policyNo: 'P2025001',
    productName: 'Enterprise Liability Insurance (2025 Edition) - Plan A',
    effectiveDate: '2025-08-15',
    expiryDate: '2026-08-14',
    totalPremium: '3073.20',
    insuredCount: 17
  };

  const insuredPersons = Array.from({ length: 17 }).map((_, i) => ({
    id: i + 1,
    name: `Employee ${i + 1}`,
    idType: 'Identity Card',
    idNumber: `110101199${i}0101${1000+i}`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
    status: 'Insured',
    effectiveDate: '2025-08-15',
    expiryDate: '2026-08-14',
    jobType: 'Metal Heat Treatment Worker'
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
         <Link to="/dashboard" className="hover:text-blue-600">我的保单</Link>
         <span>/</span>
         <span className="text-gray-800">保单详情</span>
      </div>

      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold text-gray-800">投保订单</h1>
        <div className="flex gap-2">
           <button className="flex items-center gap-1 px-3 py-1.5 border border-blue-200 text-blue-600 bg-blue-50 rounded text-sm hover:bg-blue-100">
             <FileClock size={14} /> 保全批改
           </button>
           <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 bg-white rounded text-sm hover:bg-gray-50">
             <Printer size={14} /> 下载发票
           </button>
           <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 bg-white rounded text-sm hover:bg-gray-50">
             <Download size={14} /> 下载电子保单
           </button>
           <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 bg-white rounded text-sm hover:bg-gray-50">
             <FileText size={14} /> 下载在保人员清单
           </button>
           <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 bg-white rounded text-sm hover:bg-gray-50">
             更多
           </button>
        </div>
      </div>

      {/* Applicant Information */}
      <CollapsibleSection title="投保人信息" icon={FileText}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-sm">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">投保企业名称</span>
            <span className="font-medium text-gray-800">{policyInfo.holderName}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">证件类型</span>
            <span className="font-medium text-gray-800">统一社会信用代码</span>
          </div>
           <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">证件号</span>
            <span className="font-medium text-gray-800">{policyInfo.creditCode}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">联系人姓名</span>
            <span className="font-medium text-gray-800">{policyInfo.contactName}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">联系人手机号</span>
            <span className="font-medium text-gray-800">{policyInfo.contactPhone}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">联系人邮箱</span>
            <span className="font-medium text-gray-800">{policyInfo.contactEmail}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2 md:col-span-2">
            <span className="text-gray-500">公司地址</span>
            <span className="font-medium text-gray-800">{policyInfo.address}</span>
          </div>
        </div>
      </CollapsibleSection>

      {/* Insurance Information */}
      <CollapsibleSection title="保险信息" icon={Briefcase}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-sm">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">保单号</span>
            <span className="font-medium text-gray-800">{policyInfo.policyNo}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">产品名称</span>
            <span className="font-medium text-gray-800">{policyInfo.productName}</span>
          </div>
           <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">生效起期</span>
            <span className="font-medium text-gray-800">{policyInfo.effectiveDate}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">生效止期</span>
            <span className="font-medium text-gray-800">{policyInfo.expiryDate}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">合计支付保费</span>
            <span className="font-bold text-gray-800">{policyInfo.totalPremium}元</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">投保单号</span>
            <span className="font-medium text-gray-800">T{policyInfo.policyNo.substring(1)}</span>
          </div>
        </div>
      </CollapsibleSection>

      {/* Plan Details */}
      <CollapsibleSection title="投保方案" icon={Shield}>
         <div className="bg-gray-50 rounded-lg p-4">
             <div className="flex gap-4 mb-4 border-b border-gray-200 pb-2">
                 <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm font-medium flex items-center gap-1">
                   <div className="w-2 h-2 bg-blue-600 rounded-full"></div> 方案一
                 </button>
                 <button className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded text-sm font-medium hover:bg-gray-50">
                   方案二
                 </button>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                   <span className="text-gray-500 text-xs">意外身故伤残保险金</span>
                   <p className="font-medium">10万</p>
                </div>
                <div className="space-y-1">
                   <span className="text-gray-500 text-xs">医疗费用保险金</span>
                   <p className="font-medium">1万</p>
                </div>
                <div className="space-y-1">
                   <span className="text-gray-500 text-xs">意外每日住院津贴</span>
                   <p className="font-medium">100元/天</p>
                </div>
                <div className="space-y-1">
                   <span className="text-gray-500 text-xs">保障时间</span>
                   <p className="font-medium">1年</p>
                </div>
                <div className="space-y-1">
                   <span className="text-gray-500 text-xs">职业类别</span>
                   <p className="font-medium">5类</p>
                </div>
                <div className="space-y-1">
                   <span className="text-gray-500 text-xs">每人保费</span>
                   <p className="font-medium">224元</p>
                </div>
             </div>
         </div>
      </CollapsibleSection>

      {/* Insured Persons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
           <h3 className="text-base font-bold text-gray-800">被保人信息</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 font-bold">被保人姓名</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 font-bold">证件类型</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 font-bold">证件号码</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 font-bold">性别</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 font-bold">状态</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 font-bold">手机号</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 font-bold">生效日期</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 font-bold">失效日期</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 font-bold">职业类型</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {insuredPersons.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{person.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.idType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{person.idNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">{person.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.effectiveDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.expiryDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.jobType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
           <div className="text-sm text-gray-500">共 {insuredPersons.length} 条</div>
           <div className="flex gap-1">
             <button className="px-2 py-1 border rounded text-xs hover:bg-gray-50">1</button>
             <button className="px-2 py-1 border rounded text-xs hover:bg-gray-50">2</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetail;