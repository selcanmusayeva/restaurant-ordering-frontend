import React from 'react';
import { Link } from 'react-router-dom';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <header className="bg-burgundy-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-display font-bold">Restaurant App</Link>
          <div className="flex gap-4">
            <Link 
              to="/public/scan" 
              className="px-4 py-2 bg-burgundy-700 hover:bg-burgundy-600 transition-colors rounded-md text-white text-sm font-medium"
            >
              Scan QR
            </Link>
            <Link 
              to="/login" 
              className="px-4 py-2 bg-white hover:bg-gray-100 transition-colors rounded-md text-burgundy-800 text-sm font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-burgundy-900 text-white p-4 mt-auto">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Restaurant App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout; 