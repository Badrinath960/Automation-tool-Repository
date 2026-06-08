import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  const sizeClasses = {
    small: 'h-5 w-5 border-2',
    medium: 'h-10 w-10 border-4',
    large: 'h-16 w-16 border-4',
  };

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-200 border-t-gray-500',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
