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
  ExternalLink,
  Info,
  Calendar,
  FileText,
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
  const [activeTab, setActiveTab] = useState('overview');
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
  const thumbnailUrl = getThumbnailUrl(dashboard.thumbnail_path);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 font-semibold">
        <Link to="/dashboards" className="hover:text-accent-600 transition-colors">
          Power BI Reports
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-400 truncate max-w-[120px] md:max-w-none">{categoryName}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 truncate max-w-[180px] md:max-w-none">{dashboard.name}</span>
      </nav>

      {/* Hero Banner Card */}
      <div className="bg-white border border-border rounded-xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Left Aspect Thumbnail */}
        <div className="aspect-video w-full md:w-80 bg-slate-100 rounded-xl border border-border overflow-hidden flex-shrink-0 relative">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={dashboard.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-50 flex items-center justify-center">
              <LayoutDashboard className="h-16 w-16 text-primary-500" />
            </div>
          )}
          {dashboard.is_featured && (
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
              {dashboard.name}
            </h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              {dashboard.description}
            </p>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-3 border-y border-gray-100 text-left">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Report Type</p>
              <p className="text-sm font-extrabold text-gray-900 mt-0.5">{dashboard.report_type || 'Power BI'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Created On</p>
              <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                {new Date(dashboard.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Active Status</p>
              <p className="text-sm mt-0.5">
                <Badge variant={dashboard.is_active ? 'success' : 'danger'}>
                  {dashboard.is_active ? 'Active' : 'Deactivated'}
                </Badge>
              </p>
            </div>
          </div>

          {/* Main Hero Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {dashboard.report_url && (
              <a
                href={dashboard.report_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-white bg-accent-600 hover:bg-accent-700 transition-colors duration-150 shadow focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <ExternalLink className="h-5 w-5" />
                <span>Open Power BI Report</span>
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
              { id: 'report_info', name: 'Report Info', icon: FileText },
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">About this Report</h3>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {dashboard.long_description || 'No detailed overview provided for this dashboard report.'}
                </p>
              </div>

              {tagList.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Associated Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {tagList.map((tag, idx) => (
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

          {activeTab === 'report_info' && (
            <div className="space-y-4">
              <div className="bg-accent-50 border border-accent-100 p-4 rounded-xl">
                <p className="font-bold text-primary-900 text-sm mb-1">Direct Live Link</p>
                <p className="text-xs text-gray-600 mb-3">
                  This report is hosted on the Power BI service. Click below to view the interactive dashboard in a new tab.
                </p>
                {dashboard.report_url && (
                  <a
                    href={dashboard.report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-2 px-4 text-xs inline-flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View live dashboard report</span>
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-900">Technical Details</h4>
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <tbody>
                    <tr>
                      <td className="py-2 font-semibold text-gray-500 w-1/4">System:</td>
                      <td className="py-2 text-gray-900">{dashboard.report_type || 'Power BI'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-gray-500">Target URL:</td>
                      <td className="py-2 text-gray-900 break-all">{dashboard.report_url}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Action modals */}
      {isAdmin && (
        <>
          <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Dashboard details" size="lg">
            <DashboardUploadForm
              initialData={dashboard}
              categories={categories}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditOpen(false)}
            />
          </Modal>

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
