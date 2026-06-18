import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { dashboardsApi } from '../../api/dashboardsApi';
import { toast } from 'react-hot-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const DashboardUploadForm = ({ initialData = null, categories = [], onSuccess, onCancel }) => {
  const isEditMode = !!initialData;
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      long_description: initialData?.long_description || '',
      report_url: initialData?.report_url || '',
      report_type: initialData?.report_type || 'Power BI',
      category_id: initialData?.category?.id || initialData?.category_id || '',
      tags: initialData?.tags ? initialData.tags.join(', ') : '',
      is_featured: initialData?.is_featured || false,
    },
  });

  useEffect(() => {
    if (initialData?.thumbnail_path) {
      setThumbnailPreview(`/api/files/${initialData.thumbnail_path}`);
    }
  }, [initialData]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('long_description', data.long_description);
    formData.append('report_url', data.report_url);
    formData.append('embed_url', data.report_url); // compatibility
    formData.append('report_type', data.report_type);
    if (data.category_id) formData.append('category_id', data.category_id);
    formData.append('tags', data.tags);
    formData.append('is_featured', String(data.is_featured));

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    try {
      if (isEditMode) {
        const response = await dashboardsApi.updateDashboard(initialData.id, formData);
        if (response && response.success) {
          toast.success(response.message || 'Dashboard updated successfully!');
          onSuccess(response.data);
        }
      } else {
        const response = await dashboardsApi.createDashboard(formData);
        if (response && response.success) {
          toast.success(response.message || 'Dashboard created successfully!');
          onSuccess(response.data);
        }
      }
    } catch (error) {
      console.error('Submit dashboard error:', error);
      const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to submit form';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
      {/* 2-Column Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700">Dashboard Name *</label>
          <input
            type="text"
            disabled={loading}
            className={`input-field mt-1 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="e.g. Sales Regional Q2"
            {...register('name', { required: 'Dashboard name is required' })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold text-gray-700">Category *</label>
          <select
            disabled={loading}
            className={`input-field mt-1 bg-white ${errors.category_id ? 'border-red-300' : 'border-gray-300'}`}
            {...register('category_id', { required: 'Please select a category' })}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.category_id.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold text-gray-700">Short Summary Description *</label>
        <input
          type="text"
          disabled={loading}
          className={`input-field mt-1 ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
          placeholder="Brief 1-liner description explaining what metrics are visualised"
          {...register('description', {
            required: 'Description is required',
            maxLength: { value: 150, message: 'Must be 150 characters or less' },
          })}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500 font-medium">{errors.description.message}</p>
        )}
      </div>

      {/* Long Description */}
      <div>
        <label className="block text-sm font-bold text-gray-700">Detailed Overview / Description</label>
        <textarea
          disabled={loading}
          rows={3}
          className="input-field mt-1 border-gray-300"
          placeholder="Detailed explanation of the report, target audience, update schedule, etc."
          {...register('long_description')}
        />
      </div>

      {/* 2-Column Links & Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Power BI Live URL */}
        <div>
          <label className="block text-sm font-bold text-gray-700">Power BI Live Report URL *</label>
          <input
            type="url"
            disabled={loading}
            className={`input-field mt-1 ${errors.report_url ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="e.g. https://app.powerbi.com/groups/.../reports/..."
            {...register('report_url', {
              required: 'Power BI Live Report URL is required',
            })}
          />
          {errors.report_url && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.report_url.message}</p>
          )}
        </div>

        {/* Report Type */}
        <div>
          <label className="block text-sm font-bold text-gray-700">Report Type</label>
          <input
            type="text"
            disabled={loading}
            className="input-field mt-1 border-gray-300"
            placeholder="e.g. Power BI, Tableau, Excel Online"
            {...register('report_type')}
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-bold text-gray-700">Tags (comma-separated)</label>
        <input
          type="text"
          disabled={loading}
          className="input-field mt-1 border-gray-300"
          placeholder="e.g. sales, regional, operations"
          {...register('tags')}
        />
      </div>

      {/* Cover Image Upload */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">Cover Image (Optional)</label>
        <div className="flex space-x-4">
          <div className="relative flex-grow border-2 border-dashed border-gray-300 hover:border-accent-400 rounded-xl p-4 transition-colors duration-150 flex flex-col items-center justify-center bg-gray-50">
            <input
              type="file"
              accept="image/*"
              disabled={loading}
              onChange={handleThumbnailChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {thumbnailFile ? (
              <div className="text-center space-y-1">
                <ImageIcon className="h-8 w-8 text-accent-500 mx-auto" />
                <p className="text-sm font-bold text-gray-800 truncate max-w-xs">{thumbnailFile.name}</p>
                <p className="text-xs text-gray-500">{(thumbnailFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="text-center space-y-1 text-gray-400">
                <Upload className="h-8 w-8 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">Upload Cover</p>
                <p className="text-xs">PNG, JPG, WEBP (Max 2MB)</p>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {thumbnailPreview && (
            <div className="w-28 h-24 rounded-xl border border-border overflow-hidden bg-slate-50 relative flex-shrink-0 flex items-center justify-center">
              <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setThumbnailFile(null);
                  setThumbnailPreview(null);
                }}
                className="absolute top-1 right-1 p-0.5 bg-slate-900/60 rounded-full text-white hover:bg-slate-900/80 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Featured Checkbox */}
      <div className="flex items-center space-x-2 pt-1">
        <input
          id="is_featured"
          type="checkbox"
          disabled={loading}
          className="h-4.5 w-4.5 text-accent-600 border-gray-300 rounded focus:ring-accent-500 transition-colors cursor-pointer"
          {...register('is_featured')}
        />
        <label htmlFor="is_featured" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
          Promote as Featured Dashboard (pin to top banner)
        </label>
      </div>

      {/* Actions */}
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
          className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-accent-600 hover:bg-accent-700 transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" color="white" />
              <span>Submitting...</span>
            </>
          ) : (
            <span>{isEditMode ? 'Save Changes' : 'Create Dashboard'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default DashboardUploadForm;
