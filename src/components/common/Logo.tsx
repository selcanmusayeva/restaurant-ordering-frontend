import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`text-blue-600 ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="w-full h-full"
      >
        <path 
          d="M12 2C5.4 2 0 6.3 0 11.7c0 3.6 2.4 6.7 5.9 8.7V22c0 .3.2.6.5.7.1.1.3.1.4.1.1 0 .3 0 .4-.1l3.5-2.4h1.3c6.6 0 12-4.3 12-9.7S18.6 2 12 2zm-1 13h-2v-2h2v2zm3-5c-.6.4-1 .7-1 1.3V12h-2v-.7c0-1.1.7-1.7 1.3-2.1.6-.4.7-.7.7-1.2s-.5-1-1-1-1 .5-1 1H9c0-1.7 1.3-3 3-3s3 1.3 3 3c0 1.1-.7 1.7-1 2z"
        />
      </svg>
    </div>
  );
};

export default Logo; 