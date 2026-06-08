import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPagesRange = () => {
    const pages = [];
    const delta = 2; // Pages to show around the current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const pages = getPagesRange();

  return (
    <nav className="flex items-center justify-center space-x-1 mt-6" aria-label="Pagination">
      {/* Previous Page Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all duration-200"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page Numbers */}
      {pages.map((page, idx) => {
        if (page === '...') {
          return (
            <span
              key={`dots-${idx}`}
              className="px-3 py-2 text-sm text-gray-400 font-medium select-none"
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`px-3.5 py-2 text-sm font-semibold rounded-lg border transition-all duration-200 ${
              isActive
                ? 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      {/* Next Page Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all duration-200"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default Pagination;
