import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usersApi } from '../api/usersApi';
import UserManagementTable from '../components/admin/UserManagementTable';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SearchBar from '../components/common/SearchBar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Users, ShieldCheck } from 'lucide-react';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search input state
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');

  // Modals state
  const [roleOpen, setRoleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Read URL queries
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const perPage = 20;

  // Sync search input with URL
  useEffect(() => {
    setSearchVal(searchParams.get('search') || '');
  }, [searchParams]);

  // Debounced search sync
  useEffect(() => {
    const delay = setTimeout(() => {
      const currentQuery = searchParams.get('search') || '';
      if (searchVal !== currentQuery) {
        const newParams = new URLSearchParams(searchParams);
        if (searchVal.trim()) {
          newParams.set('search', searchVal);
        } else {
          newParams.delete('search');
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchVal, setSearchParams, searchParams]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
      };
      if (search) params.search = search;

      const response = await usersApi.getUsers(params);
      if (response && response.success && response.data) {
        const { items, total, pages } = response.data;
        setUsers(items || []);
        setTotalItems(total || 0);
        setTotalPages(pages || 1);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load users directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  };

  // Dialog triggers
  const handleRoleClick = (user) => {
    setSelectedUser(user);
    setRoleOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleRoleConfirm = async () => {
    if (!selectedUser) return;
    const targetRole = selectedUser.role === 'admin' ? 'user' : 'admin';
    try {
      const response = await usersApi.updateUserRole(selectedUser.id, targetRole);
      if (response && response.success) {
        toast.success(`User '${selectedUser.full_name}' role changed to ${targetRole}.`);
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to update user role.';
      toast.error(msg);
    } finally {
      setRoleOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      const response = await usersApi.deleteUser(selectedUser.id);
      if (response && response.success) {
        toast.success(response.message || 'User account deleted successfully.');
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user account.');
    } finally {
      setDeleteOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 border border-border rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary-600" />
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View active user registrations, modify admin capabilities, and manage credentials
          </p>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-center">
          <SearchBar
            value={searchVal}
            onChange={setSearchVal}
            onClear={() => setSearchVal('')}
            placeholder="Search users by name, email..."
          />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="space-y-6">
          <UserManagementTable
            users={users}
            currentUserId={currentUser?.id}
            loading={loading}
            onPromote={handleRoleClick}
            onDelete={handleDeleteClick}
          />

          {!loading && users.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {/* Confirmation overlays */}
      {selectedUser && (
        <>
          {/* Role Change Prompt */}
          <ConfirmDialog
            isOpen={roleOpen}
            onClose={() => {
              setRoleOpen(false);
              setSelectedUser(null);
            }}
            onConfirm={handleRoleConfirm}
            title="Update User Role"
            message={`Are you sure you want to change the role of '${selectedUser.full_name}' to ${
              selectedUser.role === 'admin' ? 'Standard User' : 'Administrator'
            }?`}
            confirmText="Change Role"
            cancelText="Cancel"
            type="warning"
          />

          {/* Account deletion Prompt */}
          <ConfirmDialog
            isOpen={deleteOpen}
            onClose={() => {
              setDeleteOpen(false);
              setSelectedUser(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete User Account"
            message={`Are you sure you want to delete '${selectedUser.full_name}'? This action is permanent and will remove all their information and login credentials.`}
            confirmText="Delete Account"
            cancelText="Cancel"
            type="danger"
          />
        </>
      )}
    </div>
  );
};

export default AdminUsersPage;
