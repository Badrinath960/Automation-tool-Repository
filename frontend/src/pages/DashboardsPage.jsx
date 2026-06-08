import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dashboardsApi } from '../api/dashboardsApi';
import { toolsApi } from '../api/toolsApi';
import DashboardCard from '../components/dashboards/DashboardCard';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';
import { Filter, SlidersHorizontal, RefreshCcw } from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DashboardUploadForm from '../components/dashboards/DashboardUploadForm';
import { toast } from 'react-hot-toast';

const SkeletonCard = () => (
  <div className="card border border-border rounded-xl overflow-hidden animate-pulse flex flex-col bg-white">
    <div className="aspect-video w-full bg-gray-200" />
    <div className="p-5 flex-grow space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
      <div className="space-y-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center pt-1">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-7 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  </div>
);

const DashboardsPage = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dashboards, setDashboards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modals state (for direct admin shortcuts in card)
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState(null);

  // Read URL params
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category_id') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = 12;

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await toolsApi.getCategories();
        if (response && response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchDashboards = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
      };
      if (search) params.search = search;
      if (categoryId) params.category_id = categoryId;

      const response = await dashboardsApi.getDashboards(params);
      if (response && response.success && response.data) {
        const { items, total, pages } = response.data;
        setDashboards(items || []);
        setTotalItems(total || 0);
        setTotalPages(pages || 1);
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, [search, categoryId, page]);

  const handleCategorySelect = (id) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId === id) {
      newParams.delete('category_id');
    } else {
      newParams.set('category_id', id);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams({ page: '1' });
  };

  // Admin Shortcut Handlers
  const handleEditClick = (dashboard) => {
    setSelectedDashboard(dashboard);
    setEditOpen(true);
  };

  const handleDeleteClick = (dashboard) => {
    setSelectedDashboard(dashboard);
    setDeleteOpen(true);
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

  const hasActiveFilters = search || categoryId;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
        <div className="bg-white p-5 border border-border rounded-xl shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <h3 className="flex items-center text-sm font-bold text-gray-900 uppercase tracking-wide">
              <Filter className="h-4.5 w-4.5 mr-2 text-gray-500" />
              Filter List
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
              >
                <RefreshCcw className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    categoryId === category.id
                      ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  <span className="truncate">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Grid */}
      <div className="flex-1 space-y-6">
        {/* Toolbar Header */}
        <div className="flex items-center justify-between bg-white p-4 border border-border rounded-xl shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Power BI Reports</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? 'Searching dashboards...' : `${totalItems} report${totalItems !== 1 ? 's' : ''} available`}
            </p>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : dashboards.length === 0 ? (
          <div className="card p-12 text-center border border-border bg-white flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-50 text-gray-400 rounded-full">
              <Filter className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No dashboards found</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              We couldn't find any reports matching your search query. Try modifying your filters.
            </p>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} className="btn-primary flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboards.map((dashboard) => (
                <DashboardCard
                  key={dashboard.id}
                  dashboard={dashboard}
                  isAdmin={isAdmin}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Admin Quick Actions Modals */}
      {isAdmin && selectedDashboard && (
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
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Deactivate Dashboard"
            message={`Are you sure you want to deactivate '${selectedDashboard.name}'? Users will no longer be able to load this Power BI visual.`}
            confirmText="Deactivate"
            cancelText="Cancel"
            type="danger"
          />
        </>
      )}
    </div>
  );
};

export default DashboardsPage;
