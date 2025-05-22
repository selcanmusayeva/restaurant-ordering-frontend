import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';

interface NavItem {
  path: string;
  label: string;
}

interface NavbarProps {
  items: NavItem[];
  logo?: string;
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ items, logo, title = 'Fine Dining Experience' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-burgundy-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            {logo && <img src={logo} alt="Restaurant Logo" className="h-10 w-auto" />}
            <h1 className="text-xl font-display font-semibold">{title}</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-burgundy-900 text-white' 
                    : 'text-white hover:bg-burgundy-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-2 rounded-md text-sm font-medium bg-burgundy-900 text-white hover:bg-burgundy-700 transition-colors duration-200"
              >
                Logout
              </button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-200 hover:text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-burgundy-700 fade-in">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 rounded-md text-sm font-medium my-1 ${
                  location.pathname === item.path 
                    ? 'bg-burgundy-900 text-white' 
                    : 'text-white hover:bg-burgundy-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 rounded-md text-sm font-medium my-1 bg-burgundy-900 text-white hover:bg-burgundy-700"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 