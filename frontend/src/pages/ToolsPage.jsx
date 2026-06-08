import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toolsApi } from '../api/toolsApi';
import ToolCard from '../components/tools/ToolCard';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import { Filter, SlidersHorizontal, RefreshCcw, Tag } from 'lucide-react';

const SkeletonCard = () => (
  <div className="card border border-border rounded-xl overflow-hidden animate-pulse flex flex-col bg-white">
    <div className="aspect-video w-full bg-gray-200" />
    <div className="p-5 flex-grow space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="space-y-3 pt-3 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-7 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  </div>
);

const ToolsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Read URL params
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category_id') || '';
  const activeTags = searchParams.get('tags') ? searchParams.get('tags').split(',') : [];
  const sortBy = searchParams.get('sort_by') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = 12;

  // Static common tags to show in sidebar filter
  const commonTags = ['excel', 'pdf', 'email', 'sap', 'web-scraping', 'rest-api', 'database', 'automation'];

  // Load categories on mount
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

  // Fetch tools when search parameters change
  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
        sort_by: sortBy,
      };
      if (search) params.search = search;
      if (categoryId) params.category_id = categoryId;
      if (activeTags.length > 0) params.tags = activeTags.join(',');

      const response = await toolsApi.getTools(params);
      if (response && response.success && response.data) {
        const { items, total, pages } = response.data;
        setTools(items || []);
        setTotalItems(total || 0);
        setTotalPages(pages || 1);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [search, categoryId, searchParams.get('tags'), sortBy, page]);

  // Handle category selection
  const handleCategorySelect = (id) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId === id) {
      newParams.delete('category_id'); // Toggle off if clicked again
    } else {
      newParams.set('category_id', id);
    }
    newParams.set('page', '1'); // Reset to page 1
    setSearchParams(newParams);
  };

  // Handle tag selection (multiple allowed)
  const handleTagToggle = (tag) => {
    const newParams = new URLSearchParams(searchParams);
    let updatedTags = [...activeTags];

    if (updatedTags.includes(tag)) {
      updatedTags = updatedTags.filter((t) => t !== tag);
    } else {
      updatedTags.push(tag);
    }

    if (updatedTags.length > 0) {
      newParams.set('tags', updatedTags.join(','));
    } else {
      newParams.delete('tags');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Handle sorting change
  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort_by', e.target.value);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchParams({ page: '1', sort_by: sortBy });
  };

  // Triggered when a tool is downloaded, to refresh download stats
  const handleDownloadSuccess = () => {
    fetchTools();
  };

  const hasActiveFilters = search || categoryId || activeTags.length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
        <div className="bg-white p-5 border border-border rounded-xl shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <h3 className="flex items-center text-sm font-bold text-gray-900 uppercase tracking-wide">
              <Filter className="h-4.5 w-4.5 mr-2 text-gray-500" />
              Filter Catalog
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
          <div className="space-y-4 mb-6">
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

          {/* Divider */}
          <div className="border-t border-gray-100 my-4" />

          {/* Tag Filters */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              Filter by Tags
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {commonTags.map((tag) => {
                const isActive = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-all duration-150 ${
                      isActive
                        ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Tools Catalog Grid */}
      <div className="flex-1 space-y-6">
        {/* Toolbar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 border border-border rounded-xl shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Automation Scripts</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? 'Searching repository...' : `${totalItems} tool${totalItems !== 1 ? 's' : ''} available`}
            </p>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-center">
            <span className="text-sm font-semibold text-gray-500 flex items-center">
              <SlidersHorizontal className="h-4 w-4 mr-1.5" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="border border-gray-300 rounded-lg text-sm bg-white text-gray-700 py-1.5 pl-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="newest">Newest Releases</option>
              <option value="downloads">Popular Downloads</option>
              <option value="name">Name (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Results grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="card p-12 text-center border border-border bg-white flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-50 text-gray-400 rounded-full">
              <Filter className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No matching tools found</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              We couldn't find any tools matching your search criteria. Try modifying your search term or adjusting filters.
            </p>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} className="btn-primary flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                <span>Reset Search Filters</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onDownloadSuccess={handleDownloadSuccess}
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
    </div>
  );
};

export default ToolsPage;
