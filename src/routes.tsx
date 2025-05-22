import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ScanQR from './pages/customer/ScanQR';
import Menu from './pages/customer/Menu';
import OrderStatus from './pages/customer/OrderStatus';
import StaffLayout from './components/layout/StaffLayout';
import TableSessionRoute from './components/routes/TableSessionRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import StaffRoute from './components/routes/StaffRoute';
import OrdersManagement from './pages/staff/OrdersManagement';
import OrderDetails from './pages/staff/OrderDetails';
import { UserRole } from './types';
import { useAppSelector } from './store';
import NotFoundPage from './pages/NotFoundPage';
import PublicScanQR from './pages/public/PublicScanQR';
import PublicMenu from './pages/public/PublicMenu';
import PublicOrderStatus from './pages/public/PublicOrderStatus';
import MenuManagement from './pages/staff/MenuManagement';

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  // Function to redirect based on auth status and role
  const determineHomePage = () => {
    if (!isAuthenticated) {
      return <Navigate to="/public/scan" replace />;
    }
    
    if (user && [UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF].includes(user.role)) {
      return <Navigate to="/staff/orders" replace />;
    } else if (user && user.role === UserRole.CUSTOMER) {
      return <Navigate to="/scan" replace />;
    }
    
    return <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* New public routes for non-authenticated users */}
      <Route path="/public/scan" element={<PublicScanQR />} />
      <Route path="/public/menu/:tableId" element={<PublicMenu />} />
      <Route path="/public/menu" element={<PublicMenu />} />
      <Route path="/public/order/:orderId" element={<PublicOrderStatus />} />

      {/* Protected customer routes */}
      <Route 
        path="/scan" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
            <ScanQR />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/menu/:tableId" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
            <TableSessionRoute>
              <Menu />
            </TableSessionRoute>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/menu" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
            <TableSessionRoute>
              <Menu />
            </TableSessionRoute>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/order/:orderId" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
            <OrderStatus />
          </ProtectedRoute>
        } 
      />

      {/* Staff routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={[UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF]}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="orders"
          element={
            <StaffRoute roles={[UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF]}>
              <OrdersManagement />
            </StaffRoute>
          }
        />

        <Route
          path="orders/:orderId"
          element={
            <StaffRoute roles={[UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF]}>
              <OrderDetails />
            </StaffRoute>
          }
        />
        
        <Route
          path="menu"
          element={
            <MenuManagement />
          }
        />
        
        {/* Redirect /staff to /staff/orders */}
        <Route index element={<Navigate to="/staff/orders" replace />} />
      </Route>

      {/* Default route - redirect based on role */}
      <Route path="/" element={determineHomePage()} />

      {/* Catch all route for 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes; 