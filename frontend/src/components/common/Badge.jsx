import React from 'react';
import clsx from 'clsx';

const Badge = ({ children, variant = 'primary', className }) => {
  const variants = {
    primary: 'bg-primary-50 text-primary-700 border border-primary-200',
    secondary: 'bg-gray-100 text-gray-700 border border-gray-200',
    success: 'bg-green-50 text-green-700 border border-green-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    info: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border',
        variants[variant] || variants.primary,
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
