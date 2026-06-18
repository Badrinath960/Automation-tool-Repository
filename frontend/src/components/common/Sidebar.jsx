import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, BarChart2, Package, ArrowLeft, LayoutDashboard } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin/tools',
      label: 'Tools',
      icon: Package,
    },
    {
      path: '/admin/dashboards',
      label: 'Dashboards',
      icon: LayoutDashboard,
    },
    {
      path: '/admin/users',
      label: 'Users',
      icon: Users,
    },
    {
      path: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart2,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r flex flex-row md:flex-col justify-between flex-shrink-0 md:min-h-[calc(100vh-4rem)]">
      <div className="p-3 md:p-4 w-full flex flex-col space-y-0 md:space-y-6">
        <div>
          <h2 className="hidden md:block px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Admin Controls
          </h2>
          <nav className="mt-0 md:mt-3 flex flex-row md:flex-col w-full overflow-x-auto md:overflow-x-visible space-x-1.5 md:space-x-0 md:space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-accent-50 text-accent-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 mr-2.5 transition-colors ${
                      isActive ? 'text-accent-600' : 'text-gray-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer link to return to tools - visible only on desktop */}
      <div className="hidden md:block p-4 border-t border-border bg-gray-50">
        <Link
          to="/tools"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-3 text-gray-400" />
          Back to Directory
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
