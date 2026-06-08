import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-100 flex flex-col justify-center items-center p-6 text-center">
      <div className="card max-w-md w-full p-8 space-y-6 bg-white border border-border shadow-lg">
        <div className="mx-auto w-16 h-16 bg-primary-50 border border-primary-100 rounded-full flex items-center justify-center text-primary-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-gray-900">Page Not Found</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            The page you are looking for does not exist or has been moved to another location.
          </p>
        </div>

        <Link
          to="/tools"
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tools Directory</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
