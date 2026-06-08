import React from 'react';
import { Download } from 'lucide-react';
import Badge from '../common/Badge';
import { toolsApi } from '../../api/toolsApi';
import { toast } from 'react-hot-toast';

const VersionHistory = ({ toolId, versions = [], latestVersionId, toolSlug }) => {
  
  // Format file sizes into readable strings
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date ISO strings
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Trigger download of specific version
  const handleDownloadVersion = async (versionNumber) => {
    try {
      const response = await toolsApi.downloadToolVersion(toolId, versionNumber);
      
      const blob = new Blob([response], { type: 'application/zip' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${toolSlug || 'tool'}_v${versionNumber}.zip`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success(`Downloading version ${versionNumber}...`);
    } catch (error) {
      console.error('Download specific version error:', error);
      toast.error('Failed to download this version. Please try again.');
    }
  };

  if (versions.length === 0) {
    return (
      <div className="text-gray-400 py-6 text-center text-sm">
        No version records found for this tool.
      </div>
    );
  }

  // Sort versions descending by date/version
  const sortedVersions = [...versions].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="overflow-x-auto border border-border rounded-xl">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Version</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Release Date</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">File Size</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Release Notes</th>
            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {sortedVersions.map((v) => {
            const isLatest = v.id === latestVersionId;
            return (
              <tr key={v.id} className="hover:bg-slate-50 transition-colors duration-100">
                <td className="px-6 py-4 font-bold text-gray-900 flex items-center space-x-2">
                  <span>v{v.version_number}</span>
                  {isLatest && <Badge variant="success">Latest</Badge>}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {formatDate(v.created_at)}
                </td>
                <td className="px-6 py-4 text-gray-600 font-mono">
                  {formatFileSize(v.file_size_bytes)}
                </td>
                <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={v.release_notes}>
                  {v.release_notes || '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDownloadVersion(v.version_number)}
                    className="inline-flex items-center space-x-1.5 text-primary-600 hover:text-primary-800 font-bold hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors duration-150 focus:outline-none"
                    aria-label={`Download version ${v.version_number}`}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VersionHistory;
