import React from 'react';

interface TextWithUnitProps {
  value: number | string;
  unit: string;
  className?: string;
}

const TextWithUnit: React.FC<TextWithUnitProps> = ({ value, unit, className = '' }) => {
  return (
    <span className={className}>
      {value} {unit}
    </span>
  );
};

export default TextWithUnit; 