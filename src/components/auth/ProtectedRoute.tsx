import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../types';
import useAuth from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  console.log('ProtectedRoute:', { 
    isAuthenticated, 
    userRole: user?.role, 
    allowedRoles,
    hasRoleAccess: user && allowedRoles.includes(user.role)
  });
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (user && !allowedRoles.includes(user.role)) {
    // Redirect based on user role if they don't have access
    console.log(`ProtectedRoute: User role ${user.role} not allowed, redirecting to appropriate page`);
    
    // Route the user to their appropriate home page based on role
    if (user.role === 'CUSTOMER') {
      return <Navigate to="/customer/menu" replace />;
    } else if (['MANAGER', 'WAITER', 'CHEF'].includes(user.role)) {
      return <Navigate to="/staff/orders" replace />;
    }
    
    return <Navigate to="/" replace />;
  }
  
  console.log('ProtectedRoute: Access granted');
  return <>{children}</>;
};

export default ProtectedRoute; 