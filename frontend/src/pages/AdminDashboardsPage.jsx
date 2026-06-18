import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dashboardsApi } from '../api/dashboardsApi';
import { toolsApi } from '../api/toolsApi';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DashboardUploadForm from '../components/dashboards/DashboardUploadForm';
import Badge from '../components/common/Badge';
import { toast } from 'react-hot-toast';
import { Plus, LayoutDashboard, Edit2, Trash2, ExternalLink } from 'lucide-react';

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
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-20" />
    </td>
    <td className="px-6 py-4">
      <div className="h-5 bg-gray-200 rounded-full w-14" />
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end space-x-1.5">
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
      </div>
    </td>
  </tr>
);

const AdminDashboardsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dashboards, setDashboards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search input state
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');

  // Modal control states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const perPage = 10;

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await toolsApi.getCategories();
        if (response && response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadCategories();
  }, []);

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

  const fetchDashboards = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
      };
      if (search) params.search = search;

      const response = await dashboardsApi.getDashboards(params);
      if (response && response.success && response.data) {
        const { items, total, pages } = response.data;
        setDashboards(items || []);
        setTotalItems(total || 0);
        setTotalPages(pages || 1);
      }
    } catch (error) {
      console.error('Fetch dashboards error:', error);
      toast.error('Failed to load dashboards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, [page, search]);

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  };

  const handleEditClick = (dash) => {
    setSelectedDashboard(dash);
    setEditOpen(true);
  };

  const handleDeleteClick = (dash) => {
    setSelectedDashboard(dash);
    setDeleteOpen(true);
  };

  const handleToggleActive = async (dash) => {
    const newStatus = !dash.is_active;
    const formData = new FormData();
    formData.append('is_active', String(newStatus));
    formData.append('name', dash.name);
    formData.append('embed_url', dash.embed_url); // Required

    try {
      const response = await dashboardsApi.updateDashboard(dash.id, formData);
      if (response && response.success) {
        toast.success(`Dashboard '${dash.name}' ${newStatus ? 'activated' : 'deactivated'}.`);
        fetchDashboards();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to toggle active status.');
    }
  };

  const handleCreateSuccess = () => {
    setCreateOpen(false);
    fetchDashboards();
  };

  const handleEditSuccess = () => {
    setEditOpen(false);
    setSelectedDashboard(null);
    fetchDashboards();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDashboard) return;
    try {
      const response = await dashboardsApi.deleteDashboard(selectedDashboard.id);
      if (response && response.success) {
        toast.success(response.message || 'Dashboard deactivated.');
        fetchDashboards();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to deactivate dashboard.');
    } finally {
      setDeleteOpen(false);
      setSelectedDashboard(null);
    }
  };

  const getThumbnailUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('uploads/')) {
      return `/api/files/${path}`;
    }
    return path;
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 border border-border rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-accent-500" />
            Manage Dashboards
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Add live Power BI dashboards, edit metadata, and configure active states
          </p>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-center">
          <SearchBar
            value={searchVal}
            onChange={setSearchVal}
            onClear={() => setSearchVal('')}
            placeholder="Search dashboards..."
          />

          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 border rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 btn-secondary"
            style={{ padding: '0.5rem 1rem' }}
          >
            <Plus className="h-5 w-5 text-accent-600" />
            <span className="hidden sm:inline">Add Dashboard</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <div className="space-y-6">
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Cover</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => <SkeletonRow key={idx} />)
                ) : dashboards.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">
                      No dashboards found.
                    </td>
                  </tr>
                ) : (
                  dashboards.map((dash) => {
                    const thumbnailUrl = getThumbnailUrl(dash.thumbnail_path);
                    const categoryName = dash.category?.name || 'Uncategorized';

                    return (
                      <tr key={dash.id} className="hover:bg-slate-50 transition-colors duration-100">
                        {/* Cover */}
                        <td className="px-6 py-3.5">
                          <div className="h-10 w-16 rounded border border-border bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {thumbnailUrl ? (
                              <img src={thumbnailUrl} alt={dash.name} className="w-full h-full object-cover" />
                            ) : (
                              <LayoutDashboard className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-900 truncate max-w-xs">{dash.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{dash.description}</p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 text-gray-600 font-semibold">
                          {categoryName}
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4 text-gray-600">
                          <Badge variant="info">{dash.report_type || 'Power BI'}</Badge>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(dash)}
                            className="focus:outline-none transition-transform active:scale-95"
                          >
                            <Badge variant={dash.is_active ? 'success' : 'danger'}>
                              {dash.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Open live link */}
                            {dash.report_url && (
                              <a
                                href={dash.report_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:text-accent-600 hover:bg-accent-50 transition-all focus:outline-none"
                                title="Open Live Dashboard"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            
                            {/* Edit */}
                            <button
                              onClick={() => handleEditClick(dash)}
                              className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all focus:outline-none"
                              title="Edit Details"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteClick(dash)}
                              className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:text-red-900 hover:bg-red-50 transition-all focus:outline-none"
                              title="Deactivate Dashboard"
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

          {!loading && dashboards.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {/* Add Dashboard Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Power BI Dashboard" size="lg">
        <DashboardUploadForm
          categories={categories}
          onSuccess={handleCreateSuccess}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* Edit Dashboard Modal */}
      {selectedDashboard && (
        <>
          <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Dashboard details" size="lg">
            <DashboardUploadForm
              initialData={selectedDashboard}
              categories={categories}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditOpen(false)}
            />
          </Modal>

          <ConfirmDialog
            isOpen={deleteOpen}
            onClose={() => {
              setDeleteOpen(false);
              setSelectedDashboard(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Deactivate Dashboard"
            message={`Are you sure you want to deactivate and soft-delete '${selectedDashboard.name}'? Users will no longer see it in the directory.`}
            confirmText="Deactivate"
            cancelText="Cancel"
            type="danger"
          />
        </>
      )}
    </div>
  );
};

export default AdminDashboardsPage;
