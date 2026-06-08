import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toolsApi } from '../api/toolsApi';
import AdminToolTable from '../components/admin/AdminToolTable';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ToolUploadForm from '../components/tools/ToolUploadForm';
import { toast } from 'react-hot-toast';
import { Plus, Wrench, Upload, FileCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';

// Inner component for version upload form
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

const AdminToolsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search input state
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');

  // Modal control states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Read URL queries
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const perPage = 10;

  // Load Categories on mount
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

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
        sort_by: 'newest',
      };
      if (search) params.search = search;

      const response = await toolsApi.getTools(params);
      if (response && response.success && response.data) {
        const { items, total, pages } = response.data;
        setTools(items || []);
        setTotalItems(total || 0);
        setTotalPages(pages || 1);
      }
    } catch (error) {
      console.error('Fetch tools error:', error);
      toast.error('Failed to load tools catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [page, search]);

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  };

  // Admin action triggers
  const handleEditClick = (tool) => {
    setSelectedTool(tool);
    setEditOpen(true);
  };

  const handleVersionClick = (tool) => {
    setSelectedTool(tool);
    setVersionOpen(true);
  };

  const handleDeleteClick = (tool) => {
    setSelectedTool(tool);
    setDeleteOpen(true);
  };

  // Toggle active directly from the table
  const handleToggleActive = async (tool) => {
    const newStatus = !tool.is_active;
    const formData = new FormData();
    formData.append('is_active', String(newStatus));
    formData.append('name', tool.name); // Required in validator schema if sent

    try {
      const response = await toolsApi.updateTool(tool.id, formData);
      if (response && response.success) {
        toast.success(`Tool '${tool.name}' ${newStatus ? 'activated' : 'deactivated'}.`);
        fetchTools();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to toggle active status.');
    }
  };

  const handleCreateSuccess = () => {
    setCreateOpen(false);
    fetchTools();
  };

  const handleEditSuccess = () => {
    setEditOpen(false);
    setSelectedTool(null);
    fetchTools();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTool) return;
    try {
      const response = await toolsApi.deleteTool(selectedTool.id);
      if (response && response.success) {
        toast.success(response.message || 'Tool deactivated.');
        fetchTools();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to deactivate tool.');
    } finally {
      setDeleteOpen(false);
      setSelectedTool(null);
    }
  };

  const handleVersionSubmit = async (versionData) => {
    if (!selectedTool) return;
    setSubmitLoading(true);
    
    const formData = new FormData();
    formData.append('version_number', versionData.version_number);
    formData.append('release_notes', versionData.release_notes);
    formData.append('zip_file', versionData.zip_file);

    try {
      const response = await toolsApi.uploadVersion(selectedTool.id, formData);
      if (response && response.success) {
        toast.success(response.message || 'New version uploaded successfully.');
        setVersionOpen(false);
        setSelectedTool(null);
        fetchTools();
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to upload version';
      toast.error(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 border border-border rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary-600" />
            Manage Tools
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Add script tools, upload version archives, and edit active metadata
          </p>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-center">
          <SearchBar
            value={searchVal}
            onChange={setSearchVal}
            onClear={() => setSearchVal('')}
            placeholder="Search tools name, tag..."
          />

          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 border border-transparent rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors focus:outline-none"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Script</span>
          </button>
        </div>
      </div>

      {/* Tools Table Container */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="space-y-6">
          <AdminToolTable
            tools={tools}
            loading={loading}
            onEdit={handleEditClick}
            onAddVersion={handleVersionClick}
            onToggleActive={handleToggleActive}
            onDelete={handleDeleteClick}
          />

          {!loading && tools.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {/* Admin modaly actions overlay */}
      {/* Add Tool Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Upload New script Tool" size="lg">
        <ToolUploadForm
          categories={categories}
          onSuccess={handleCreateSuccess}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* Edit Tool Modal */}
      {selectedTool && (
        <>
          <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Tool Details" size="lg">
            <ToolUploadForm
              initialData={selectedTool}
              categories={categories}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditOpen(false)}
            />
          </Modal>

          {/* New Version Upload Modal */}
          <Modal isOpen={versionOpen} onClose={() => setVersionOpen(false)} title="Upload New Version ZIP" size="md">
            <VersionUploadModalContent
              onSubmit={handleVersionSubmit}
              onCancel={() => {
                setVersionOpen(false);
                setSelectedTool(null);
              }}
              loading={submitLoading}
            />
          </Modal>

          {/* Delete confirmation dialog */}
          <ConfirmDialog
            isOpen={deleteOpen}
            onClose={() => {
              setDeleteOpen(false);
              setSelectedTool(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Deactivate script Tool"
            message={`Are you sure you want to deactivate and soft-delete '${selectedTool.name}'? It will be hidden from standard directory searches.`}
            confirmText="Deactivate"
            cancelText="Cancel"
            type="danger"
          />
        </>
      )}
    </div>
  );
};

export default AdminToolsPage;
