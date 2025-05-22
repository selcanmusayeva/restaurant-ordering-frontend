import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from './store';
import AppRoutes from './routes';
import './App.css';

function App() {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if already on public routes
    if (location.pathname.startsWith('/public')) {
      return;
    }
    
    // Redirect users based on their role when auth state changes
    if (isAuthenticated && user) {
      if (['MANAGER', 'WAITER', 'CHEF'].includes(user.role)) {
        // Only redirect if not already on a staff route
        if (!location.pathname.startsWith('/staff')) {
          navigate('/staff/orders');
        }
      } else if (user.role === 'CUSTOMER') {
        // Only redirect if not already on a customer route
        if (!location.pathname.startsWith('/menu') && 
            !location.pathname.startsWith('/scan')) {
          navigate('/scan');
        }
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  return (
    <div className="App">
      <AppRoutes />
    </div>
  );
}

export default App;
