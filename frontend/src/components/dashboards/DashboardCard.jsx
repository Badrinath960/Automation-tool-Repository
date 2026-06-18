import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Shield, Edit2, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';

const DashboardCard = ({ dashboard, isAdmin, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const getThumbnailUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('uploads/')) {
      return `/api/files/${path}`;
    }
    return path;
  };

  const categoryName = dashboard.category?.name || 'Uncategorized';
  const categoryColors = {
    'sales': 'success',
    'financial': 'info',
    'operations': 'warning',
    'hr': 'danger',
    'management': 'primary',
  };

  const getCategoryVariant = (name) => {
    const key = name.toLowerCase();
    for (const [pattern, variant] of Object.entries(categoryColors)) {
      if (key.includes(pattern)) return variant;
    }
    return 'secondary';
  };

  const categoryVariant = getCategoryVariant(categoryName);
  const thumbnailUrl = getThumbnailUrl(dashboard.thumbnail_path);

  const handleCardClick = () => {
    navigate(`/dashboards/${dashboard.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="card group cursor-pointer overflow-hidden flex flex-col bg-white border border-border rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-border">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={dashboard.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors duration-300">
            <LayoutDashboard className="h-12 w-12 text-primary-500 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}

        {/* Featured Overlay */}
        {dashboard.is_featured && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-primary-500 shadow-sm border border-primary-400">
              <Sparkles className="h-3 w-3" />
              <span>Featured</span>
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Category & Report Type Badge */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={categoryVariant}>{categoryName}</Badge>
            {dashboard.report_type && (
              <Badge variant="info">{dashboard.report_type}</Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-accent-600 transition-colors duration-150 truncate">
            {dashboard.name}
          </h3>

          {/* Truncated Description */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {dashboard.description || 'No description provided for this dashboard.'}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Footer Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (dashboard.report_url) {
                  window.open(dashboard.report_url, '_blank');
                } else {
                  navigate(`/dashboards/${dashboard.id}`);
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-accent-600 hover:bg-accent-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <span>View Report</span>
            </button>

            {/* Admin Controls */}
            {isAdmin && (onEdit || onDelete) && (
              <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <button
                    onClick={() => onEdit(dashboard)}
                    className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all focus:outline-none"
                    title="Edit Dashboard"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(dashboard)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:text-red-900 hover:bg-red-50 transition-all focus:outline-none"
                    title="Delete Dashboard"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
