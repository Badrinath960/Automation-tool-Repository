import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const PrivateRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
