import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminRoute = () => {
  const { user, token, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated, redirect to / if not admin
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
