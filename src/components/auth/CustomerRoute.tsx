import React from 'react';
import { Navigate } from 'react-router-dom';
import CustomerLayout from '../layout/CustomerLayout';
import useAuth from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface CustomerRouteProps {
  children: React.ReactNode;
}

const CustomerRoute: React.FC<CustomerRouteProps> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && user.role !== UserRole.CUSTOMER) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <CustomerLayout>
      {children}
    </CustomerLayout>
  );
};

export default CustomerRoute; 