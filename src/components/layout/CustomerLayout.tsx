import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';

interface CustomerLayoutProps {
  children?: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const navItems = [
    { path: '/customer/menu', label: 'Menu' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar 
        items={navItems} 
        title="Restaurant Experience" 
      />
      <main className="container mx-auto px-4 py-8 fade-in flex-grow">
        {children || <Outlet />}
      </main>
      <footer className="bg-burgundy-900 text-white py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="font-display text-xl mb-2">Restaurant Experience</h3>
              <p className="text-cream-200 text-sm">Exquisite dining at your fingertips</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-cream-200 text-sm">© {new Date().getFullYear()} Restaurant Experience</p>
              <p className="text-cream-300 text-xs mt-1">Culinary Excellence Delivered</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout; 