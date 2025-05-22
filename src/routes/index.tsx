import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "../store";
import { UserRole } from "../types";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import ScanQR from "../pages/customer/ScanQR";
import Menu from "../pages/customer/Menu";
import Cart from "../pages/customer/Cart";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import CustomerRoute from "../components/auth/CustomerRoute";

const ManagerDashboard = React.lazy(() => import("../pages/manager/Dashboard"));
const WaiterDashboard = React.lazy(() => import("../pages/waiter/Dashboard"));
const KitchenDashboard = React.lazy(() => import("../pages/kitchen/Dashboard"));

const AppRoutes: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/scan" element={<ScanQR />} />

          {/* Customer Routes */}
          <Route path="/" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/orders"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <CustomerRoute>
                  <div>Customer Orders Page - To be implemented</div>
                </CustomerRoute>
              </React.Suspense>
            }
          />

          {/* Staff Routes */}
          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              </React.Suspense>
            }
          />

          <Route
            path="/menu/*"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
                  <div>Menu Management - To be implemented</div>
                </ProtectedRoute>
              </React.Suspense>
            }
          />

          <Route
            path="/tables/*"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute
                  allowedRoles={[UserRole.MANAGER, UserRole.WAITER]}
                >
                  <div>Tables Management - To be implemented</div>
                </ProtectedRoute>
              </React.Suspense>
            }
          />

          <Route
            path="/staff/*"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
                  <div>Staff Management - To be implemented</div>
                </ProtectedRoute>
              </React.Suspense>
            }
          />

          <Route
            path="/reports/*"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
                  <div>Reports - To be implemented</div>
                </ProtectedRoute>
              </React.Suspense>
            }
          />

          {/* Waiter Routes */}
          <Route
            path="/waiter/dashboard"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute allowedRoles={[UserRole.WAITER]}>
                  <WaiterDashboard />
                </ProtectedRoute>
              </React.Suspense>
            }
          />

          {/* Kitchen Routes */}
          <Route
            path="/kitchen/dashboard"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute allowedRoles={[UserRole.CHEF]}>
                  <KitchenDashboard />
                </ProtectedRoute>
              </React.Suspense>
            }
          />

          <Route
            path="/kitchen/*"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute
                  allowedRoles={[UserRole.CHEF, UserRole.MANAGER]}
                >
                  <div>Kitchen - To be implemented</div>
                </ProtectedRoute>
              </React.Suspense>
            }
          />

          {/* Common Staff Routes */}
          <Route
            path="/orders/*"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.MANAGER,
                    UserRole.WAITER,
                    UserRole.CHEF,
                  ]}
                >
                  <div>Orders Management - To be implemented</div>
                </ProtectedRoute>
              </React.Suspense>
            }
          />

          <Route
            path="/notifications/*"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute allowedRoles={[UserRole.WAITER, UserRole.CHEF]}>
                  <div>Notifications - To be implemented</div>
                </ProtectedRoute>
              </React.Suspense>
            }
          />

          {/* Redirect to dashboard based on user role */}
          <Route
            path="/dashboard"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.CUSTOMER,
                    UserRole.MANAGER,
                    UserRole.WAITER,
                    UserRole.CHEF,
                  ]}
                >
                  <div>Dashboard - Will redirect based on role</div>
                </ProtectedRoute>
              </React.Suspense>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default AppRoutes;
