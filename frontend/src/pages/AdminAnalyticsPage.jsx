import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import AnalyticsChart from '../components/admin/AnalyticsChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { toast } from 'react-hot-toast';
import {
  BarChart2,
  Download,
  LayoutDashboard,
  Package,
  Users,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  Plus,
  Trash2,
} from 'lucide-react';

const AdminAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState(30); // 7, 30, 90 days

  // Analytics states
  const [overview, setOverview] = useState({
    total_tools: 0,
    total_dashboards: 0,
    total_users: 0,
    total_downloads: 0,
  });
  const [downloadTrends, setDownloadTrends] = useState([]);
  const [registrationTrends, setRegistrationTrends] = useState([]);
  const [topTools, setTopTools] = useState([]);
  const [recentDownloads, setRecentDownloads] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);

  // Category management states
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  const loadStaticData = async () => {
    try {
      const [overviewRes, topToolsRes, recentRes] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getTopTools(10),
        analyticsApi.getRecentDownloads(20),
      ]);

      if (overviewRes?.success) setOverview(overviewRes.data);
      if (topToolsRes?.success) setTopTools(topToolsRes.data || []);
      if (recentRes?.success) setRecentDownloads(recentRes.data || []);
    } catch (error) {
      console.error('Failed to load static analytics data:', error);
      toast.error('Failed to load administrative overview stats.');
    }
  };

  const loadTrendData = async (days) => {
    try {
      const [trendsRes, registrationsRes] = await Promise.all([
        analyticsApi.getTrends(days),
        analyticsApi.getUserActivity(days),
      ]);

      if (trendsRes?.success) setDownloadTrends(trendsRes.data || []);
      if (registrationsRes?.success) setRegistrationTrends(registrationsRes.data || []);
    } catch (error) {
      console.error('Failed to load trend data:', error);
      toast.error('Failed to update trend charts.');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await analyticsApi.getCategories();
      if (res?.success) {
        setCategories(res.data || []);
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([
        loadStaticData(),
        loadTrendData(activeRange),
        fetchCategories(),
      ]);
      setLoading(false);
    };
    initData();
  }, []);

  const handleRangeChange = async (days) => {
    setActiveRange(days);
    await loadTrendData(days);
  };

  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - activeRange);
      const startDate = startDateObj.toISOString().split('T')[0];

      const blob = await analyticsApi.exportCsv(startDate, endDate);
      
      const downloadUrl = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `atr_downloads_${startDate}_to_${endDate}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('CSV Export started.');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export download logs.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Category name is required');
      return;
    }
    setCatLoading(true);
    try {
      const res = await analyticsApi.createCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim() || null,
        icon: 'folder',
      });
      if (res?.success) {
        toast.success(res.message || 'Category created successfully');
        setNewCatName('');
        setNewCatDesc('');
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to create category';
      toast.error(msg);
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"? Associated tools and dashboards will be set to Uncategorized.`)) {
      return;
    }
    try {
      const res = await analyticsApi.deleteCategory(catId);
      if (res?.success) {
        toast.success(res.message || 'Category deleted');
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete category');
    }
  };

  const formatLogDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Active Script Tools',
      value: overview.total_tools,
      icon: Package,
      bgColor: 'bg-primary-50 text-primary-600 border-primary-100',
    },
    {
      label: 'BI Dashboards',
      value: overview.total_dashboards,
      icon: LayoutDashboard,
      bgColor: 'bg-primary-50 text-primary-600 border-primary-100',
    },
    {
      label: 'Registered Users',
      value: overview.total_users,
      icon: Users,
      bgColor: 'bg-primary-50 text-primary-600 border-primary-100',
    },
    {
      label: 'Total Downloads',
      value: overview.total_downloads,
      icon: Download,
      bgColor: 'bg-primary-50 text-primary-600 border-primary-100',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 border border-border rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">System Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Overview metrics and download activities for ATR Hub
          </p>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-center">
          <button
            onClick={handleExportCsv}
            disabled={exportLoading}
            className="flex items-center space-x-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <FileSpreadsheet className="h-4.5 w-4.5 text-accent-550" />
            <span>{exportLoading ? 'Exporting...' : 'Export Logs CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-border rounded-xl p-6 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow"
            >
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{card.label}</p>
                <p className="text-3xl font-extrabold text-gray-900 leading-none">{card.value}</p>
              </div>
              <div className={`p-3.5 rounded-xl border ${card.bgColor}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Panels */}
      <div className="space-y-6">
        {/* Date Filter Bar */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-accent-500" />
            Activity Trends
          </h2>
          
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            {[
              { id: 7, name: '7 Days' },
              { id: 30, name: '30 Days' },
              { id: 90, name: '90 Days' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => handleRangeChange(r.id)}
                className={`px-3.5 py-1 text-xs font-bold rounded-md transition-all duration-150 ${
                  activeRange === r.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Charts Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily downloads */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <AnalyticsChart
              data={downloadTrends}
              type="line"
              dataKey="count"
              xKey="date"
              title="Daily Downloads"
              color="#0057B8"
            />
          </div>
 
          {/* User registrations */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <AnalyticsChart
              data={registrationTrends}
              type="line"
              dataKey="new_users"
              xKey="date"
              title="New Registrations"
              color="#475569"
            />
          </div>
        </div>
 
        {/* Bar chart - Popular tools */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <AnalyticsChart
            data={topTools}
            type="bar"
            dataKey="download_count"
            xKey="tool_name"
            title="Top Downloaded Tools (All Time)"
            color="#0057B8"
            height={320}
          />
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-400" />
            Recent Download Log (Last 20)
          </h3>
        </div>

        {recentDownloads.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No download activities recorded yet in this repository.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-left text-xs sm:text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Script Tool</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">User Account</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Downloaded At</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">IP address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {recentDownloads.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors duration-100">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {log.tool_name || 'Deleted Tool'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-600">
                      v{log.version || '1.0.0'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div>
                        <p className="font-semibold text-gray-800">{log.user_name || 'N/A'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{log.user_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatLogDate(log.downloaded_at)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono">
                      {log.ip_address || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Management */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2 text-accent-500" />
            Category Management
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Add or remove categories from the catalog. Removing a category uncategorizes its items.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="space-y-4 lg:col-span-1 border-r border-gray-100 pr-0 lg:pr-8">
            <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Add New Category</h4>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Category Name *</label>
              <input
                type="text"
                disabled={catLoading}
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="input-field mt-1 text-sm"
                placeholder="e.g. Data Analysis"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Description</label>
              <textarea
                disabled={catLoading}
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="input-field mt-1 text-sm"
                rows={2}
                placeholder="Briefly explain what items belong here..."
              />
            </div>

            <button
              type="submit"
              disabled={catLoading}
              className="w-full flex items-center justify-center space-x-1.5 px-4 py-2 border border-transparent rounded-lg text-sm font-bold text-white bg-accent-600 hover:bg-accent-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>{catLoading ? 'Creating...' : 'Create Category'}</span>
            </button>
          </form>

          {/* Categories List */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Active Categories ({categories.length})</h4>
            
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400">No categories defined.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 border border-gray-200 rounded-xl bg-slate-50 flex items-start justify-between gap-3 hover:border-gray-300 transition-colors">
                    <div className="space-y-1 text-left min-w-0">
                      <p className="font-bold text-gray-900 truncate text-sm">{cat.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{cat.description || 'No description'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
