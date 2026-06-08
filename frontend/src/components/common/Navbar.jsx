import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from './SearchBar';
import { ChevronDown, LogOut, Shield, Wrench, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  // Synchronize input value with URL search parameter changes
  useEffect(() => {
    setSearchValue(searchParams.get('search') || '');
  }, [searchParams]);

  // Debounced search logic
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const currentQuery = searchParams.get('search') || '';
      
      if (searchValue !== currentQuery) {
        let targetPath = location.pathname;
        if (targetPath !== '/tools' && targetPath !== '/dashboards') {
          targetPath = '/tools';
        }

        const newParams = new URLSearchParams(searchParams);
        if (searchValue.trim()) {
          newParams.set('search', searchValue);
        } else {
          newParams.delete('search');
        }
        newParams.set('page', '1');
        
        navigate(`${targetPath}?${newParams.toString()}`);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchValue, navigate, location.pathname, searchParams]);

  // Close dropdown on outside clicks
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleClearSearch = () => {
    setSearchValue('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    newParams.set('page', '1');
    
    let targetPath = location.pathname;
    if (targetPath !== '/tools' && targetPath !== '/dashboards') {
      targetPath = '/tools';
    }
    navigate(`${targetPath}?${newParams.toString()}`);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showSearch = location.pathname === '/tools' || location.pathname === '/dashboards' || location.pathname === '/';

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Hamburger Menu Toggle (Mobile) */}
          <div className="flex md:hidden items-center mr-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Brand Logo and Title */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="p-1.5 bg-primary-100 rounded-lg text-primary-700">
                <Wrench className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold text-primary-700 tracking-tight">ATR</span>
            </Link>

            {/* Navigation links (Desktop) */}
            <div className="hidden md:flex space-x-1">
              <Link
                to="/tools"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname.startsWith('/tools') || location.pathname === '/'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Tools
              </Link>
              <Link
                to="/dashboards"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname.startsWith('/dashboards')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Dashboards
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname.startsWith('/about')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                About & Help
              </Link>
            </div>
          </div>

          {/* Global Search bar (synced, responsive visibility) */}
          <div className="flex-1 flex justify-center px-2 sm:px-4 md:px-12">
            {showSearch && (
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                onClear={handleClearSearch}
                className="w-full max-w-[12rem] sm:max-w-md"
                placeholder={location.pathname === '/dashboards' ? "Search..." : "Search tools..."}
              />
            )}
          </div>

          {/* Right section - User profile dropdown & Admin panel */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAdmin && (
              <Link
                to="/admin"
                className={`p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors hidden sm:flex items-center space-x-1 ${
                  location.pathname.startsWith('/admin') ? 'bg-primary-50 text-primary-700 hover:text-primary-700' : ''
                }`}
                title="Admin Panel"
              >
                <Shield className="h-4.5 w-4.5" />
                <span className="hidden lg:inline text-xs font-semibold">Admin</span>
              </Link>
            )}

            {/* Profile Dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1.5 p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                    {getInitials(user.full_name)}
                  </div>
                  <span className="hidden md:inline text-sm font-semibold text-gray-700">
                    {user.full_name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden md:inline" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-border shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                      <p className="text-xs text-primary-600 font-semibold mt-0.5 capitalize">
                        {user.role} Account
                      </p>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex sm:hidden items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Shield className="h-4 w-4 mr-2.5 text-gray-400" />
                          Admin Panel
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4 mr-2.5 text-red-400" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Slide down menu (Mobile Dropdown) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pt-2 pb-4 space-y-1 text-left animate-in slide-in-from-top duration-200">
          <Link
            to="/tools"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-base font-semibold ${
              location.pathname.startsWith('/tools') ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
            }`}
          >
            Tools Directory
          </Link>
          <Link
            to="/dashboards"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-base font-semibold ${
              location.pathname.startsWith('/dashboards') ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
            }`}
          >
            Power BI Dashboards
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-base font-semibold ${
              location.pathname.startsWith('/about') ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
            }`}
          >
            About & Help
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                location.pathname.startsWith('/admin') ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
              }`}
            >
              Admin Controls
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
