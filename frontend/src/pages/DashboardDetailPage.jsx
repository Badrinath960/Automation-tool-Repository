import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardsApi } from '../api/dashboardsApi';
import { toolsApi } from '../api/toolsApi';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard,
  ChevronRight,
  Shield,
  Edit2,
  Trash2,
  Maximize2,
  ExternalLink,
  Minimize2,
  X,
  Tag,
} from 'lucide-react';

import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DashboardUploadForm from '../components/dashboards/DashboardUploadForm';

const DashboardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Admin Modals
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchDashboardDetails = async () => {
    try {
      const response = await dashboardsApi.getDashboard(id);
      if (response && response.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard details:', error);
      toast.error('Failed to load dashboard details.');
      navigate('/dashboards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDashboardDetails();

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

  const handleEditSuccess = () => {
    setEditOpen(false);
    fetchDashboardDetails();
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await dashboardsApi.deleteDashboard(dashboard.id);
      if (response && response.success) {
        toast.success(response.message || 'Dashboard deactivated.');
        navigate('/dashboards');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to deactivate dashboard.');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getThumbnailUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('uploads/')) {
      return `/api/files/${path}`;
    }
    return path;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!dashboard) return null;

  const categoryName = dashboard.category?.name || 'Uncategorized';
  const tagList = dashboard.tags || [];

  // Fullscreen view mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col w-screen h-screen animate-in fade-in duration-200">
        {/* Fullscreen Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800 text-white">
          <div className="flex items-center space-x-3 text-left">
            <LayoutDashboard className="h-5 w-5 text-primary-400" />
            <div>
              <p className="font-extrabold text-sm truncate max-w-md">{dashboard.name}</p>
              <p className="text-[10px] text-gray-400 leading-none">Embedded Power BI Viewer</p>
            </div>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 text-slate-300 hover:text-white"
            title="Exit Fullscreen"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="flex-grow relative bg-slate-950">
          <iframe
            src={dashboard.embed_url}
            title={dashboard.name}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 font-semibold">
        <Link to="/dashboards" className="hover:text-primary-600 transition-colors">
          Power BI Reports
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-400 truncate max-w-[120px] md:max-w-none">{categoryName}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 truncate max-w-[180px] md:max-w-none">{dashboard.name}</span>
      </nav>

      {/* Info Header details */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="space-y-3 flex-1 text-left">
          <div className="flex items-center space-x-2">
            <Badge variant="primary">{categoryName}</Badge>
            {dashboard.is_featured && <Badge variant="warning">Featured</Badge>}
            <Badge variant={dashboard.is_active ? 'success' : 'danger'}>
              {dashboard.is_active ? 'Active' : 'Deactivated'}
            </Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {dashboard.name}
          </h1>

          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            {dashboard.description}
          </p>

          {/* Tags */}
          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tagList.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1"
                >
                  <Tag className="h-3 w-3 text-gray-400 mr-0.5" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-2 self-start md:self-center flex-shrink-0">
          {/* External tab link */}
          <a
            href={dashboard.embed_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none"
            title="Open in a new tab"
          >
            <ExternalLink className="h-4.5 w-4.5" />
            <span>Open Original</span>
          </a>

          {/* Fullscreen triggers */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center space-x-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none"
            title="Enter fullscreen viewer"
          >
            <Maximize2 className="h-4.5 w-4.5" />
            <span>Fullscreen</span>
          </button>

          {/* Admin Buttons */}
          {isAdmin && (
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-3 ml-1">
              <span className="text-gray-400" title="Administrator Tools">
                <Shield className="h-4 w-4" />
              </span>
              <button
                onClick={() => setEditOpen(true)}
                className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
                title="Edit Dashboard Details"
              >
                <Edit2 className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="p-2 border border-red-200 rounded-lg text-red-500 hover:text-red-900 hover:bg-red-50 transition-colors focus:outline-none"
                title="Deactivate Dashboard"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Viewport Frame */}
      <div className="bg-white border border-border rounded-2xl shadow-sm p-4 relative h-[70vh] flex flex-col overflow-hidden">
        {iframeLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-3">
            <LoadingSpinner size="medium" />
            <p className="text-sm font-semibold text-gray-500">Loading Power BI visualization...</p>
          </div>
        )}
        <iframe
          src={dashboard.embed_url}
          title={dashboard.name}
          onLoad={() => setIframeLoading(false)}
          className="w-full h-full rounded-xl border border-gray-100"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          allowFullScreen
        />
      </div>

      {/* Admin Action modals */}
      {isAdmin && (
        <>
          {/* Edit Metadata Modal */}
          <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Dashboard details" size="lg">
            <DashboardUploadForm
              initialData={dashboard}
              categories={categories}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditOpen(false)}
            />
          </Modal>

          {/* Delete Dialog */}
          <ConfirmDialog
            isOpen={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Deactivate Dashboard"
            message={`Are you sure you want to deactivate and soft-delete '${dashboard.name}'? Users will no longer see it in the list.`}
            confirmText="Deactivate"
            cancelText="Cancel"
            type="danger"
          />
        </>
      )}
    </div>
  );
};

export default DashboardDetailPage;
