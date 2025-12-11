import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Settings, 
  User, 
  ClipboardList,
  FileSignature,
  Save,
  ScrollText,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuth');
    navigate('/login');
  };

  const menuItems = [
    {
      category: '保单管理',
      items: [
        { name: '我的保单', icon: ClipboardList, path: '/dashboard' },
        { name: '团险批单', icon: FileSignature, path: '/endorsements' },
      ]
    },
    {
      category: '保单缓存管理',
      items: [
        { name: '保单缓存', icon: Save, path: '/drafts' },
      ]
    },
    {
      category: '保全售后管理',
      items: [
        { name: '回执中心', icon: ScrollText, path: '/receipts' },
        { name: '发票中心', icon: FileSpreadsheet, path: '/invoices' },
        { name: '续保中心', icon: RefreshCw, path: '/renewals' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white h-16 shadow-sm z-20 flex items-center justify-between px-6 sticky top-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-md">
              <FileText size={24} />
            </div>
            <span className="text-xl font-bold text-gray-700">保单助手</span>
          </div>
          <nav className="hidden md:flex gap-6 text-gray-600 text-sm font-medium">
            <Link to="/dashboard" className="hover:text-blue-600">保单管理</Link>
            <Link to="/faq" className="hover:text-blue-600">常见问题</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
            <div className="bg-blue-100 text-blue-600 p-1 rounded-full">
              <User size={16} />
            </div>
            <span className="text-sm font-medium">oscar</span>
          </div>
          <div className="h-4 w-[1px] bg-gray-300"></div>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-blue-600">
            退出
          </button>
          <div className="h-4 w-[1px] bg-gray-300"></div>
          <button className="text-sm text-gray-500 hover:text-blue-600">
            注销
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-60 bg-white shadow-sm flex-shrink-0 hidden lg:block overflow-y-auto h-[calc(100vh-64px)] sticky top-16">
          <div className="py-6 space-y-8">
            {menuItems.map((group, idx) => (
              <div key={idx}>
                <h3 className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  {group.category == '保单管理' && <ClipboardList size={14}/>}
                  {group.category == '保单缓存管理' && <Save size={14}/>}
                  {group.category == '保全售后管理' && <Settings size={14}/>}
                  {group.category}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path || (location.pathname.startsWith('/policy') && item.path === '/dashboard');
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-6 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon size={18} className={`mr-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;