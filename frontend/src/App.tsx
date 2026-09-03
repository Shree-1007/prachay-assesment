import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { CreateVoucher } from './pages/CreateVoucher';
import { MyVouchers } from './pages/MyVouchers';
import { VoucherDetails } from './pages/VoucherDetails';
import { EditVoucher } from './pages/EditVoucher';
import { PendingApprovals } from './pages/PendingApprovals';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="create" element={<CreateVoucher />} />
            <Route path="vouchers" element={<MyVouchers />} />
            <Route path="vouchers/:id" element={<VoucherDetails />} />
            <Route path="edit/:id" element={<EditVoucher />} />
            <Route path="pending" element={<PendingApprovals />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
