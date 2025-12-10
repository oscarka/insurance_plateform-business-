import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InsuranceCompanyList from './pages/InsuranceCompanyList';
import LiabilityList from './pages/LiabilityList';
import ClauseList from './pages/ClauseList';
import ProductList from './pages/ProductList';
import PlanList from './pages/PlanList';
import PlanLiabilityConfig from './pages/PlanLiabilityConfig';
import RateList from './pages/RateList';
import ApiConfigList from './pages/ApiConfigList';
import ConfigImport from './pages/ConfigImport';
import ApplicationsList from './pages/ApplicationsList';
import CompanyList from './pages/CompanyList';
import InterceptionRulesList from './pages/InterceptionRulesList';
import Statistics from './pages/Statistics';
import SystemLogs from './pages/SystemLogs';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="insurance-companies" element={<InsuranceCompanyList />} />
          <Route path="liabilities" element={<LiabilityList />} />
          <Route path="clauses" element={<ClauseList />} />
          <Route path="products" element={<ProductList />} />
          <Route path="plans" element={<PlanList />} />
          <Route path="plans/:planId/liabilities" element={<PlanLiabilityConfig />} />
          <Route path="rates" element={<RateList />} />
          <Route path="api-configs" element={<ApiConfigList />} />
          <Route path="config-import" element={<ConfigImport />} />
          <Route path="applications" element={<ApplicationsList />} />
          <Route path="companies" element={<CompanyList />} />
          <Route path="interception-rules" element={<InterceptionRulesList />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="system-logs" element={<SystemLogs />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

