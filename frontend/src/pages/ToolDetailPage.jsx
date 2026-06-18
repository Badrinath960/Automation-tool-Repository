import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toolsApi } from '../api/toolsApi';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  Download,
  Calendar,
  Wrench,
  Tag,
  ChevronRight,
  Shield,
  Edit2,
  Trash2,
  PlusCircle,
  FileText,
  History,
  Info,
  Layers,
  Upload,
  X,
  FileCheck,
} from 'lucide-react';

import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DocumentationViewer from '../components/tools/DocumentationViewer';
import VersionHistory from '../components/tools/VersionHistory';
import ToolUploadForm from '../components/tools/ToolUploadForm';

// Simple inner component for uploading a new version ZIP
const VersionUploadModalContent = ({ onSubmit, onCancel, loading }) => {
  const [file, setFile] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleFormSubmit = (data) => {
    if (!file) {
      toast.error('Please select a script ZIP file');
      return;
    }
    onSubmit({
      version_number: data.version_number,
      release_notes: data.release_notes,
      zip_file: file,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-bold text-gray-700">Version Number *</label>
        <input
          type="text"
          disabled={loading}
          className={`input-field mt-1 ${errors.version_number ? 'border-red-300' : 'border-gray-300'}`}
          placeholder="e.g. 1.1.0"
          {...register('version_number', {
            required: 'Version number is required',
            pattern: {
              value: /^\d+\.\d+\.\d+$/,
              message: 'Must follow semantic versioning (x.y.z)',
            },
          })}
        />
        {errors.version_number && (
          <p className="mt-1 text-xs text-red-500 font-medium">{errors.version_number.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700">Release Notes</label>
        <textarea
          disabled={loading}
          rows={3}
          className="input-field mt-1 border-gray-300"
          placeholder="Describe changes in this version..."
          {...register('release_notes')}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">ZIP Archive *</label>
        <div className="relative border-2 border-dashed border-gray-300 hover:border-primary-400 rounded-xl p-4 transition-all duration-150 flex flex-col items-center justify-center bg-gray-50">
          <input
            type="file"
            accept=".zip"
            disabled={loading}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {file ? (
            <div className="text-center space-y-1">
              <FileCheck className="h-8 w-8 text-green-500 mx-auto" />
              <p className="text-sm font-bold text-gray-800 truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="text-center space-y-1 text-gray-400">
              <Upload className="h-8 w-8 mx-auto" />
              <p className="text-sm font-semibold text-gray-700">Select Script ZIP</p>
              <p className="text-xs">Drag ZIP archive or click to browse</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 border-t border-gray-100 pt-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" color="white" />
              <span>Uploading...</span>
            </>
          ) : (
            <span>Upload Version</span>
          )}
        </button>
      </div>
    </form>
  );
};

const ToolDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [categories, setCategories] = useState([]);

  // Modals state
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState(false);

  const fetchToolDetails = async () => {
    try {
      const response = await toolsApi.getTool(id);
      if (response && response.success) {
        setTool(response.data);
      }
    } catch (error) {
      console.error('Error fetching tool details:', error);
      toast.error('Failed to load tool details.');
      navigate('/tools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchToolDetails();
      
      // Load categories for editing form
      if (isAdmin) {
        try {
          const catResponse = await toolsApi.getCategories();
          if (catResponse && catResponse.success) {
            setCategories(catResponse.data || []);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    loadData();
  }, [id, isAdmin]);

  const getThumbnailUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('uploads/')) {
      return `/api/files/${path}`;
    }
    return path;
  };

  const handleDownloadLatest = async () => {
    try {
      const response = await toolsApi.downloadTool(tool.id);
      
      const blob = new Blob([response], { type: 'application/zip' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const latestVersion = tool.latest_version?.version_number || '1.0.0';
      link.setAttribute('download', `${tool.slug || 'tool'}_v${latestVersion}.zip`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Downloading script file...');
      
      // Reload details to update download counts
      fetchToolDetails();
    } catch (error) {
      console.error('Download latest error:', error);
      toast.error('Failed to download script. Please try again.');
    }
  };

  const handleEditSuccess = () => {
    setEditOpen(false);
    fetchToolDetails();
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await toolsApi.deleteTool(tool.id);
      if (response && response.success) {
        toast.success(response.message || 'Tool deactivated successfully.');
        navigate('/tools');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to deactivate tool.');
    }
  };

  const handleVersionSubmit = async (versionData) => {
    setAdminActionLoading(true);
    const formData = new FormData();
    formData.append('version_number', versionData.version_number);
    formData.append('release_notes', versionData.release_notes);
    formData.append('zip_file', versionData.zip_file);

    try {
      const response = await toolsApi.uploadVersion(tool.id, formData);
      if (response && response.success) {
        toast.success(response.message || 'New version uploaded successfully.');
        setVersionOpen(false);
        fetchToolDetails();
      }
    } catch (error) {
      console.error('Version upload error:', error);
      const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to upload version';
      toast.error(msg);
    } finally {
      setAdminActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!tool) return null;

  const thumbnailUrl = getThumbnailUrl(tool.thumbnail_path);
  const latestVersionStr = tool.latest_version?.version_number || '—';
  const categoryName = tool.category?.name || 'Uncategorized';

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 font-semibold">
        <Link to="/tools" className="hover:text-accent-600 transition-colors">
          Tools Directory
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-400 truncate max-w-[120px] md:max-w-none">{categoryName}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 truncate max-w-[150px] md:max-w-none">{tool.name}</span>
      </nav>

      {/* Hero Banner Card */}
      <div className="bg-white border border-border rounded-xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Left Aspect Thumbnail */}
        <div className="aspect-video w-full md:w-80 bg-slate-100 rounded-xl border border-border overflow-hidden flex-shrink-0 relative">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={tool.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-50 flex items-center justify-center">
              <Wrench className="h-16 w-16 text-primary-500" />
            </div>
          )}
          {tool.is_featured && (
            <div className="absolute top-3 left-3 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow border border-primary-400">
              FEATURED
            </div>
          )}
        </div>

        {/* Right Info Panels */}
        <div className="flex-1 space-y-4">
          <div className="space-y-1.5 text-left">
            <Badge variant="primary">{categoryName}</Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {tool.name}
            </h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              {tool.description}
            </p>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y border-gray-100 text-left">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Latest Version</p>
              <p className="text-sm font-extrabold text-gray-900 mt-0.5">v{latestVersionStr}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Total Downloads</p>
              <p className="text-sm font-extrabold text-gray-900 mt-0.5">{tool.download_count || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Last Released</p>
              <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                {tool.latest_version
                  ? new Date(tool.latest_version.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Active Status</p>
              <p className="text-sm mt-0.5">
                <Badge variant={tool.is_active ? 'success' : 'danger'}>
                  {tool.is_active ? 'Active' : 'Deactivated'}
                </Badge>
              </p>
            </div>
          </div>

          {/* Main Hero Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleDownloadLatest}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-white bg-accent-600 hover:bg-accent-700 transition-colors duration-150 shadow focus:outline-none focus:ring-2 focus:ring-accent-550"
            >
              <Download className="h-5 w-5" />
              <span>Download Script ZIP</span>
            </button>

            {tool.documentation_pdf_path && (
              <a
                href={`/api/files/${tool.documentation_pdf_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-150 shadow focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <FileText className="h-5 w-5 text-gray-400" />
                <span>Download PDF Guide</span>
              </a>
            )}

            {/* Admin Console Buttons */}
            {isAdmin && (
              <div className="flex items-center space-x-2 border-l border-gray-200 pl-3">
                <span className="text-gray-400 flex items-center pr-1" title="Administrator Tools">
                  <Shield className="h-4 w-4" />
                </span>
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-950 transition-colors focus:outline-none"
                >
                  <Edit2 className="h-4 w-4 text-gray-400" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setVersionOpen(true)}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-950 transition-colors focus:outline-none"
                >
                  <PlusCircle className="h-4 w-4 text-gray-400" />
                  <span className="hidden sm:inline">New Version</span>
                </button>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="flex items-center space-x-1 px-3 py-2 border border-red-200 rounded-lg text-sm font-semibold text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors focus:outline-none"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                  <span className="hidden sm:inline">Deactivate</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs navigation block */}
      <div className="space-y-4">
        <div className="border-b border-border">
          <nav className="flex space-x-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: Info },
              { id: 'documentation', name: 'Documentation', icon: FileText },
              { id: 'history', name: 'Version History', icon: History },
              { id: 'dependencies', name: 'Dependencies', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-bold text-sm transition-all duration-150 focus:outline-none ${
                    isActive
                      ? 'border-accent-600 text-accent-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Panel contents */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm text-left">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">About this Script</h3>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {tool.long_description || 'No detailed overview provided for this automation script.'}
                </p>
              </div>

              {tool.tags && tool.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Associated Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-bold text-gray-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full flex items-center space-x-1"
                      >
                        <Tag className="h-3 w-3 text-gray-400 mr-0.5" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documentation' && (
            <div className="space-y-4">
              {tool.documentation_pdf_path && (
                <div className="flex justify-between items-center bg-accent-50 border border-accent-100 p-4 rounded-xl mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-accent-600" />
                    <div>
                      <p className="font-bold text-primary-900 text-sm">Detailed PDF Guide Available</p>
                      <p className="text-xs text-gray-500">A structured PDF manual is uploaded for this automation script.</p>
                    </div>
                  </div>
                  <a
                    href={`/api/files/${tool.documentation_pdf_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-1.5 px-3 text-xs flex items-center space-x-1"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              )}
              <DocumentationViewer documentation={tool.documentation} />
            </div>
          )}

          {activeTab === 'history' && (
            <VersionHistory
              toolId={tool.id}
              versions={tool.versions}
              latestVersionId={tool.latest_version?.id || tool.latest_version_id}
              toolSlug={tool.slug}
              isAdmin={isAdmin}
              onDeleteSuccess={fetchToolDetails}
            />
          )}

          {activeTab === 'dependencies' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Required Python Packages</h3>
              <p className="text-gray-600 text-sm">
                Ensure these packages are installed in your virtual environment prior to execution:
              </p>
              {tool.dependencies?.packages && tool.dependencies.packages.length > 0 ? (
                <div className="border border-border rounded-xl divide-y divide-gray-100 bg-gray-50 overflow-hidden font-mono text-sm">
                  {tool.dependencies.packages.map((pkg, idx) => (
                    <div key={idx} className="px-4 py-2 text-gray-800 flex items-center justify-between">
                      <span>{pkg}</span>
                      <span className="text-[10px] font-bold text-accent-600 bg-accent-50 border border-accent-100 px-2 py-0.5 rounded">
                        pip install
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 py-4 text-center text-sm font-mono bg-gray-50 border border-border border-dashed rounded-xl">
                  No python package dependencies listed.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Action modals */}
      {isAdmin && (
        <>
          {/* Edit Tool Metadata Modal */}
          <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Tool Details" size="lg">
            <ToolUploadForm
              initialData={tool}
              categories={categories}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditOpen(false)}
            />
          </Modal>

          {/* New Version Upload Modal */}
          <Modal isOpen={versionOpen} onClose={() => setVersionOpen(false)} title="Upload New Script Version" size="md">
            <VersionUploadModalContent
              onSubmit={handleVersionSubmit}
              onCancel={() => setVersionOpen(false)}
              loading={adminActionLoading}
            />
          </Modal>

          {/* Deactivation Dialog */}
          <ConfirmDialog
            isOpen={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Deactivate Tool"
            message={`Are you sure you want to deactivate and soft-delete '${tool.name}'? Users will no longer see it in the catalog, but historic download records will be preserved.`}
            confirmText="Deactivate"
            cancelText="Cancel"
            type="danger"
          />
        </>
      )}
    </div>
  );
};

export default ToolDetailPage;
