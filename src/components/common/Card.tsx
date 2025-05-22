import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  variant?: 'default' | 'menu' | 'order';
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
  onClick,
  hoverable = false,
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'bg-white shadow-card',
    menu: 'bg-white shadow-card hover:shadow-elegant border border-cream-200',
    order: 'bg-white shadow-card border-l-4 border-l-burgundy-500',
  };

  const cardClasses = `
    ${variantClasses[variant]}
    rounded-lg overflow-hidden 
    ${hoverable ? 'transition-all duration-300 hover:scale-[1.01] cursor-pointer' : ''}
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-cream-100">
          {title && <h3 className="text-lg font-display text-burgundy-800 font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      
      <div className="p-6">{children}</div>
      
      {footer && (
        <div className="px-6 py-4 bg-cream-50 border-t border-cream-100">{footer}</div>
      )}
    </div>
  );
};

export default Card; 