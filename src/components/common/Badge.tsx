import React from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'pending' | 'progress' | 'ready' | 'completed';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  className?: string;
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = true,
  className = '',
  onClick,
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center font-medium transition-colors duration-200';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-burgundy-100 text-burgundy-800',
    secondary: 'bg-cream-100 text-burgundy-700',
    success: 'bg-sage-200 text-sage-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-blue-50 text-blue-600',
    pending: 'bg-amber-100 text-amber-800',
    progress: 'bg-amber-300 text-amber-900',
    ready: 'bg-sage-200 text-sage-800',
    completed: 'bg-sage-400 text-sage-900',
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-sm py-1 px-3',
    lg: 'text-base py-1.5 px-4',
  };
  
  // Rounding
  const roundedClass = rounded ? 'rounded-full' : 'rounded';
  
  // Clickable
  const clickableClass = onClick ? 'cursor-pointer hover:bg-opacity-80' : '';
  
  // Combine all classes
  const badgeClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${roundedClass}
    ${clickableClass}
    ${className}
  `;

  return (
    <span className={badgeClasses} onClick={onClick}>
      {children}
    </span>
  );
};

export default Badge; 