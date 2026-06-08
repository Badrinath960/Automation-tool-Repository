import React from 'react';
import { Download, Edit2, PlusCircle, Trash2, Wrench } from 'lucide-react';
import Badge from '../common/Badge';

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-10 w-16 bg-gray-200 rounded" />
    </td>
    <td className="px-6 py-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-24" />
    </td>
    <td className="px-6 py-4 font-mono">
      <div className="h-4 bg-gray-200 rounded w-10" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-8" />
    </td>
    <td className="px-6 py-4">
      <div className="h-5 bg-gray-200 rounded-full w-14" />
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end space-x-1.5">
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
      </div>
    </td>
  </tr>
);

const AdminToolTable = ({
  tools = [],
  loading = false,
  onEdit,
  onAddVersion,
  onToggleActive,
  onDelete,
}) => {
  const getThumbnailUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('uploads/')) {
      return `/api/files/${path}`;
    }
    return path;
  };

  if (!loading && tools.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm">
        No script tools matching search criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-xl">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Cover</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Latest Version</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Downloads</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => <SkeletonRow key={idx} />)
          ) : (
            tools.map((tool) => {
              const thumbnailUrl = getThumbnailUrl(tool.thumbnail_path);
              const latestVersion = tool.latest_version?.version_number || '—';
              const categoryName = tool.category?.name || 'Uncategorized';

              return (
                <tr key={tool.id} className="hover:bg-slate-50 transition-colors duration-100">
                  {/* Cover Preview */}
                  <td className="px-6 py-3.5">
                    <div className="h-10 w-16 rounded border border-border bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt={tool.name} className="w-full h-full object-cover" />
                      ) : (
                        <Wrench className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900 truncate max-w-xs">{tool.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{tool.description}</p>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="text-gray-600 font-semibold">{categoryName}</span>
                  </td>

                  {/* Latest Version */}
                  <td className="px-6 py-4 font-mono font-bold text-gray-600">
                    v{latestVersion}
                  </td>

                  {/* Download counts */}
                  <td className="px-6 py-4 text-gray-600">
                    <span className="font-semibold">{tool.download_count || 0}</span>
                  </td>

                  {/* Status Badges */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onToggleActive(tool)}
                      className="focus:outline-none transition-transform active:scale-95"
                      title={tool.is_active ? 'Click to deactivate' : 'Click to activate'}
                    >
                      <Badge variant={tool.is_active ? 'success' : 'danger'}>
                        {tool.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* Edit */}
                      <button
                        onClick={() => onEdit(tool)}
                        className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all focus:outline-none"
                        title="Edit Tool Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      
                      {/* Add Version */}
                      <button
                        onClick={() => onAddVersion(tool)}
                        className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all focus:outline-none"
                        title="Upload New Version"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </button>

                      {/* Delete / Deactivate */}
                      <button
                        onClick={() => onDelete(tool)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:text-red-900 hover:bg-red-50 transition-all focus:outline-none"
                        title="Delete/Deactivate Tool"
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

export default AdminToolTable;
