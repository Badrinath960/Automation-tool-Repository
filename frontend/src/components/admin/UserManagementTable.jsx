import React from 'react';
import { Shield, ShieldAlert, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-28" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-40" />
    </td>
    <td className="px-6 py-4">
      <div className="h-5 bg-gray-200 rounded-full w-14" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-8" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-20" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-20" />
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end space-x-1.5">
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
      </div>
    </td>
  </tr>
);

const UserManagementTable = ({
  users = [],
  currentUserId,
  loading = false,
  onPromote,
  onToggleActive,
  onDelete,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!loading && users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm">
        No users matching search criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-xl">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Downloads</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Registered</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => <SkeletonRow key={idx} />)
          ) : (
            users.map((user) => {
              const isSelf = user.id === currentUserId;
              const isAdmin = user.role === 'admin';

              return (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors duration-100">
                  {/* Full name */}
                  <td className="px-6 py-4 font-bold text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>{user.full_name}</span>
                      {isSelf && (
                        <span className="text-[10px] bg-slate-100 text-gray-500 font-bold px-1.5 py-0.5 rounded border border-gray-200">
                          You
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Email address */}
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {user.email}
                  </td>

                  {/* Role badge */}
                  <td className="px-6 py-4">
                    <Badge variant={isAdmin ? 'primary' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </td>

                  {/* Download counts */}
                  <td className="px-6 py-4 text-gray-600 font-semibold font-mono">
                    {user.download_count || 0}
                  </td>

                  {/* Registration Date */}
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {formatDate(user.created_at)}
                  </td>

                  {/* Last Login Date */}
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {formatDate(user.last_login)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* Role toggler */}
                      <button
                        onClick={() => onPromote(user)}
                        disabled={isSelf}
                        className={`p-1.5 rounded-lg border border-gray-300 transition-all focus:outline-none ${
                          isSelf
                            ? 'opacity-30 cursor-not-allowed'
                            : isAdmin
                            ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
                            : 'text-primary-600 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200'
                        }`}
                        title={isAdmin ? 'Demote to User' : 'Promote to Admin'}
                      >
                        {isAdmin ? <ShieldAlert className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                      </button>

                      {/* Delete user */}
                      <button
                        onClick={() => onDelete(user)}
                        disabled={isSelf}
                        className={`p-1.5 rounded-lg border border-red-200 text-red-500 transition-all focus:outline-none ${
                          isSelf
                            ? 'opacity-30 cursor-not-allowed'
                            : 'hover:bg-red-50 hover:text-red-900 hover:border-red-300'
                        }`}
                        title="Delete User Account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementTable;
