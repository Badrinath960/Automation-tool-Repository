import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toolsApi } from '../../api/toolsApi';
import { toast } from 'react-hot-toast';
import { Upload, X, FileCheck, Image as ImageIcon } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const ToolUploadForm = ({ initialData = null, categories = [], onSuccess, onCancel }) => {
  const isEditMode = !!initialData;
  const [loading, setLoading] = useState(false);
  const [zipFile, setZipFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      long_description: initialData?.long_description || '',
      category_id: initialData?.category?.id || initialData?.category_id || '',
      tags: initialData?.tags ? initialData.tags.join(', ') : '',
      is_featured: initialData?.is_featured || false,
      dependencies: initialData?.dependencies
        ? initialData.dependencies.packages
          ? initialData.dependencies.packages.join(', ')
          : JSON.stringify(initialData.dependencies)
        : '',
      documentation: initialData?.documentation || '',
      version_number: '',
      release_notes: '',
    },
  });

  // Pre-populate thumbnail preview if in edit mode
  useEffect(() => {
    if (initialData?.thumbnail_path) {
      setThumbnailPreview(`/api/files/${initialData.thumbnail_path}`);
    }
  }, [initialData]);

  // Handle image preview
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

  const handleZipChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setZipFile(file);
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('PDF file exceeds 10MB limit');
        e.target.value = null;
        return;
      }
      setPdfFile(file);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const onSubmit = async (data) => {
    if (!isEditMode && !zipFile) {
      toast.error('Please select a ZIP file for the initial version');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    // Core tool metadata
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('long_description', data.long_description);
    if (data.category_id) formData.append('category_id', data.category_id);
    formData.append('tags', data.tags);
    formData.append('is_featured', String(data.is_featured));
    formData.append('dependencies', data.dependencies);
    formData.append('documentation', data.documentation);

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    if (pdfFile) {
      formData.append('documentation_pdf', pdfFile);
    }

    try {
      if (isEditMode) {
        // Edit mode submission
        const response = await toolsApi.updateTool(initialData.id, formData);
        if (response && response.success) {
          toast.success(response.message || 'Tool updated successfully!');
          onSuccess(response.data);
        }
      } else {
        // Create mode submission
        formData.append('version_number', data.version_number);
        formData.append('release_notes', data.release_notes);
        formData.append('zip_file', zipFile);

        const response = await toolsApi.createTool(formData);
        if (response && response.success) {
          toast.success(response.message || 'Tool uploaded successfully!');
          onSuccess(response.data);
        }
      }
    } catch (error) {
      console.error('Submit tool error:', error);
      const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to submit form';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
      {/* 2-Column Core Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700">Tool Name *</label>
          <input
            type="text"
            disabled={loading}
            className={`input-field mt-1 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="e.g. PDF Invoice Extractor"
            {...register('name', { required: 'Tool name is required' })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
        </div>

        {/* Category Selector */}
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

      {/* Short Summary Description */}
      <div>
        <label className="block text-sm font-bold text-gray-700">Short Summary Description *</label>
        <input
          type="text"
          disabled={loading}
          className={`input-field mt-1 ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
          placeholder="Brief 1-liner description of the tool (will appear on catalog cards)"
          {...register('description', {
            required: 'Short description is required',
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
          placeholder="Detailed explanation of what the tool accomplishes, pre-requisites, etc."
          {...register('long_description')}
        />
      </div>

      {/* Tags & Dependencies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tags */}
        <div>
          <label className="block text-sm font-bold text-gray-700">Tags (comma-separated)</label>
          <input
            type="text"
            disabled={loading}
            className="input-field mt-1 border-gray-300"
            placeholder="e.g. excel, pdf, email, sap"
            {...register('tags')}
          />
        </div>

        {/* Dependencies */}
        <div>
          <label className="block text-sm font-bold text-gray-700">Required Packages (comma-separated)</label>
          <input
            type="text"
            disabled={loading}
            className="input-field mt-1 border-gray-300"
            placeholder="e.g. pandas, requests, openpyxl"
            {...register('dependencies')}
          />
        </div>
      </div>

      {/* Documentation Markdown */}
      <div>
        <label className="block text-sm font-bold text-gray-700">Documentation (Markdown/Text)</label>
        <textarea
          disabled={loading}
          rows={5}
          className="input-field mt-1 font-mono text-xs border-gray-300"
          placeholder="# Setup Guide&#10;1. Install required packages&#10;2. Update credentials in config.json&#10;&#10;# How to Run&#10;Execute script: `python main.py`"
          {...register('documentation')}
        />
      </div>

      {/* File Upload Area (only if creating) */}
      {!isEditMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          {/* Version Number */}
          <div>
            <label className="block text-sm font-bold text-gray-700">Initial Version *</label>
            <input
              type="text"
              disabled={loading}
              className={`input-field mt-1 ${errors.version_number ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="e.g. 1.0.0"
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

          {/* Release Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700">Release Notes</label>
            <input
              type="text"
              disabled={loading}
              className="input-field mt-1 border-gray-300"
              placeholder="e.g. Initial version release"
              {...register('release_notes')}
            />
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Shells */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {/* ZIP script archive upload (only if creating) */}
        {!isEditMode && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Script ZIP Archive *</label>
            <div className="relative border-2 border-dashed border-gray-300 hover:border-accent-400 rounded-xl p-4 transition-colors duration-150 flex flex-col items-center justify-center bg-gray-50">
              <input
                type="file"
                accept=".zip"
                disabled={loading}
                onChange={handleZipChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {zipFile ? (
                <div className="text-center space-y-1">
                  <FileCheck className="h-8 w-8 text-green-500 mx-auto" />
                  <p className="text-sm font-bold text-gray-800 truncate max-w-xs">{zipFile.name}</p>
                  <p className="text-xs text-gray-500">{formatBytes(zipFile.size)}</p>
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
        )}

        {/* Documentation PDF (Optional) */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Documentation PDF (Optional)</label>
          <div className="relative border-2 border-dashed border-gray-300 hover:border-accent-400 rounded-xl p-4 transition-colors duration-150 flex flex-col items-center justify-center bg-gray-50">
            <input
              type="file"
              accept=".pdf"
              disabled={loading}
              onChange={handlePdfChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {pdfFile ? (
              <div className="text-center space-y-1">
                <FileCheck className="h-8 w-8 text-accent-500 mx-auto" />
                <p className="text-sm font-bold text-gray-800 truncate max-w-xs">{pdfFile.name}</p>
                <p className="text-xs text-gray-500">{formatBytes(pdfFile.size)}</p>
              </div>
            ) : initialData?.documentation_pdf_path ? (
              <div className="text-center space-y-1">
                <FileCheck className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-emerald-800 truncate max-w-xs">PDF Guide Uploaded</p>
                <p className="text-xs text-gray-500">Click or drag to replace</p>
              </div>
            ) : (
              <div className="text-center space-y-1 text-gray-400">
                <Upload className="h-8 w-8 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">Select Guide PDF</p>
                <p className="text-xs">PDF document up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Upload (Optional) */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Cover Image (Optional)</label>
          <div className="flex space-x-4">
            <div className="relative flex-1 border-2 border-dashed border-gray-300 hover:border-accent-400 rounded-xl p-4 transition-colors duration-150 flex flex-col items-center justify-center bg-gray-50">
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
                  <p className="text-xs text-gray-500">{formatBytes(thumbnailFile.size)}</p>
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
              <div className="w-28 h-24 rounded-xl border border-border overflow-hidden bg-slate-50 flex items-center justify-center relative flex-shrink-0">
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
      </div>

      {/* Featured Checkbox */}
      <div className="flex items-center space-x-2 pt-2">
        <input
          id="is_featured"
          type="checkbox"
          disabled={loading}
          className="h-4.5 w-4.5 text-accent-600 border-gray-300 rounded focus:ring-accent-500 transition-colors cursor-pointer"
          {...register('is_featured')}
        />
        <label htmlFor="is_featured" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
          Promote as Featured Tool (pin to top banner)
        </label>
      </div>

      {/* Form Submission Actions */}
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
            <span>{isEditMode ? 'Save Changes' : 'Upload Tool'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default ToolUploadForm;
