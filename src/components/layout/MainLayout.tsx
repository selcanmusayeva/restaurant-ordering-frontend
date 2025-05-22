import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { UserRole } from '../../types';
import Spinner from '../common/Spinner';

interface SidebarLink {
  name: string;
  path: string;
  icon?: React.ReactNode;
  roles?: UserRole[];
}

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notification);
  
  // Define sidebar links with role-based access control
  const links: SidebarLink[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      roles: [UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF]
    },
    {
      name: 'Menu Management',
      path: '/menu',
      roles: [UserRole.MANAGER]
    },
    {
      name: 'Tables',
      path: '/tables',
      roles: [UserRole.MANAGER, UserRole.WAITER]
    },
    {
      name: 'Orders',
      path: '/orders',
      roles: [UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF]
    },
    {
      name: 'Kitchen',
      path: '/kitchen',
      roles: [UserRole.CHEF, UserRole.MANAGER]
    },
    {
      name: 'Notifications',
      path: '/notifications',
      roles: [UserRole.WAITER, UserRole.CHEF]
    },
    {
      name: 'Staff Management',
      path: '/staff',
      roles: [UserRole.MANAGER]
    },
    {
      name: 'Reports',
      path: '/reports',
      roles: [UserRole.MANAGER]
    },
  ];
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  // Filter links based on user role
  const filteredLinks = links.filter(link => 
    !link.roles || (user && link.roles.includes(user.role))
  );
  
  if (loading || !user) {
    return <Spinner size="lg" className="mx-auto mt-20" />;
  }
  
  // Get display name and initial for avatar
  const displayName = user.fullName || user.username || 'User';
  const userInitial = (user.fullName ? user.fullName.charAt(0) : user.username ? user.username.charAt(0) : 'U');
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transform bg-blue-700 text-white transition duration-300 lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-center h-16 border-b border-blue-600">
          <h2 className="text-xl font-bold">Restaurant App</h2>
        </div>
        
        <nav className="mt-5 px-2">
          {filteredLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`
                group flex items-center px-4 py-3 mt-1 text-sm font-medium rounded-md transition-colors
                ${location.pathname.startsWith(link.path) 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-100 hover:bg-blue-600'}
              `}
            >
              {link.icon && <span className="mr-3">{link.icon}</span>}
              <span>{link.name}</span>
              
              {/* Add notification badge for notifications link */}
              {link.path === '/notifications' && unreadCount > 0 && (
                <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-red-500">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full">
          <div className="px-4 py-6 border-t border-blue-600">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center">
                <span className="text-blue-800 font-semibold">
                  {userInitial}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{displayName}</p>
                <p className="text-xs font-medium text-blue-200">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm text-blue-100 bg-blue-800 rounded-md hover:bg-blue-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
      
      {/* Content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              className="lg:hidden text-gray-500 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            
            <div className="ml-4 flex items-center md:ml-6">
              <p className="text-sm text-gray-700">
                Welcome back, <span className="font-medium">{displayName}</span>
              </p>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 