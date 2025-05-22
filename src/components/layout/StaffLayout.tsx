import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store';
import Navbar from '../common/Navbar';

const StaffLayout: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  const navItems = [
    { path: '/staff/orders', label: 'Orders' },
    { path: '/staff/menu', label: 'Menu' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar 
        items={navItems} 
        title={`Staff Portal${user ? ` - ${user.role}` : ''}`}
      />
      <main className="container mx-auto px-4 py-8 fade-in flex-grow">
        <Outlet />
      </main>
      <footer className="bg-burgundy-900 text-white py-4 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-cream-200">
              © {new Date().getFullYear()} Restaurant Staff Portal
            </div>
            {user && (
              <div className="text-xs text-cream-300 mt-1 md:mt-0">
                Logged in as {user.username} | {user.role}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StaffLayout; 