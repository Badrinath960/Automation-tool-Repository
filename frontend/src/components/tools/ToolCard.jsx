import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Wrench, Sparkles, Tag } from 'lucide-react';
import Badge from '../common/Badge';
import { toolsApi } from '../../api/toolsApi';
import { toast } from 'react-hot-toast';

const ToolCard = ({ tool, onDownloadSuccess }) => {
  const navigate = useNavigate();

  // Helper to format thumbnail paths
  const getThumbnailUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('uploads/')) {
      return `/api/files/${path}`;
    }
    return path;
  };

  // Safe category details
  const categoryName = tool.category?.name || 'Uncategorized';
  const categoryColors = {
    'data analysis': 'success',
    'web scraping': 'info',
    'file management': 'warning',
    'devops': 'danger',
    'automation': 'primary',
  };

  const getCategoryVariant = (name) => {
    const key = name.toLowerCase();
    for (const [pattern, variant] of Object.entries(categoryColors)) {
      if (key.includes(pattern)) return variant;
    }
    return 'secondary';
  };

  const categoryVariant = getCategoryVariant(categoryName);

  // Download handler
  const handleDownload = async (e) => {
    e.stopPropagation(); // Stop navigation click
    try {
      const response = await toolsApi.downloadTool(tool.id);
      
      // Create download link in browser
      const blob = new Blob([response], { type: 'application/zip' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Attempt to find filename from version, or use default
      const latestVersion = tool.latest_version?.version_number || '1.0.0';
      link.setAttribute('download', `${tool.slug || 'tool'}_v${latestVersion}.zip`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success(`Downloading ${tool.name}...`);
      if (onDownloadSuccess) onDownloadSuccess();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  const thumbnailUrl = getThumbnailUrl(tool.thumbnail_path);
  const tagList = tool.tags || [];

  return (
    <div
      onClick={() => navigate(`/tools/${tool.id}`)}
      className="card group cursor-pointer overflow-hidden flex flex-col bg-white border border-border rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-border">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={tool.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors duration-300">
            <Wrench className="h-12 w-12 text-primary-500 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}

        {/* Featured Overlay */}
        {tool.is_featured && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-primary-500 shadow-sm border border-primary-400">
              <Sparkles className="h-3 w-3" />
              <span>Featured</span>
            </span>
          </div>
        )}

        {/* Latest Version overlay */}
        {tool.latest_version && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold text-white uppercase tracking-wider">
              v{tool.latest_version.version_number}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Category Pill */}
          <div>
            <Badge variant={categoryVariant}>{categoryName}</Badge>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-accent-600 transition-colors duration-150 truncate">
            {tool.name}
          </h3>

          {/* Truncated Description */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {tool.description || 'No description provided for this tool.'}
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Footer Actions */}
          <div className="flex items-center justify-between">
            {/* Download log count */}
            <div className="flex items-center space-x-1.5 text-gray-500 text-sm">
              <Download className="h-4.5 w-4.5" />
              <span className="font-semibold">{tool.download_count || 0} downloads</span>
            </div>

            {/* Download Trigger */}
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-accent-600 hover:bg-accent-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
              aria-label={`Download latest version of ${tool.name}`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Get ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;
