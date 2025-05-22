import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-display font-bold text-burgundy-800 mb-2">404</h1>
        <h2 className="text-2xl font-medium text-burgundy-700 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="primary" fullWidth>
              Go Home
            </Button>
          </Link>
          <Link to="/public/scan">
            <Button variant="outline" fullWidth>
              Scan QR Code
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 