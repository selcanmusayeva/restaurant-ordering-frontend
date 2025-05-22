import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../types';
import useAuth from '../../hooks/useAuth';

interface StaffRouteProps {
  children: React.ReactNode;
  roles: UserRole[];
}

const StaffRoute: React.FC<StaffRouteProps> = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  if (!user || !roles.includes(user.role)) {
    // Redirect to home if user role is not in the allowed roles
    return <Navigate to="/" replace />;
  }
  
  // Return children directly without wrapping in MainLayout
  return <>{children}</>;
};

export default StaffRoute; 