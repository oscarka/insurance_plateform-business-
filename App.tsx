import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewPolicy from './pages/NewPolicy';
import PolicyDetail from './pages/PolicyDetail';
import Receipts from './pages/Receipts';
import Invoices from './pages/Invoices';
import FAQ from './pages/FAQ';
import Drafts from './pages/Drafts';
import Endorsements from './pages/Endorsements';
import Renewals from './pages/Renewals';
import Layout from './components/Layout';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const isAuth = localStorage.getItem('isAuth') === 'true';
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/new-policy" element={<NewPolicy />} />
                <Route path="/policy/:id" element={<PolicyDetail />} />
                <Route path="/receipts" element={<Receipts />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/drafts" element={<Drafts />} />
                <Route path="/endorsements" element={<Endorsements />} />
                <Route path="/renewals" element={<Renewals />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;