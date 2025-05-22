import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import useTableSession from '../../hooks/useTableSession';
import CustomerLayout from '../layout/CustomerLayout';
import Spinner from '../common/Spinner';

interface CustomerRouteProps {
  children: React.ReactNode;
}

const CustomerRoute: React.FC<CustomerRouteProps> = ({ children }) => {
  const { hasActiveSession } = useTableSession(true);
  const { loading } = useAppSelector(state => state.table);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!hasActiveSession) {
    return <Navigate to="/scan" replace />;
  }
  
  return (
    <CustomerLayout>
      {children}
    </CustomerLayout>
  );
};

export default CustomerRoute; 