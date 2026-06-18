import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toolsApi } from '../api/toolsApi';
import { dashboardsApi } from '../api/dashboardsApi';
import ToolCard from '../components/tools/ToolCard';
import DashboardCard from '../components/dashboards/DashboardCard';
import { Wrench, LayoutDashboard, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

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

const HomePage = () => {
  const [tools, setTools] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [loadingDashboards, setLoadingDashboards] = useState(true);

  const fetchRecentTools = async () => {
    try {
      const response = await toolsApi.getTools({ page: 1, per_page: 3, sort_by: 'newest' });
      if (response && response.success && response.data) {
        setTools(response.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching recent tools:', error);
    } finally {
      setLoadingTools(false);
    }
  };

  const fetchRecentDashboards = async () => {
    try {
      const response = await dashboardsApi.getDashboards({ page: 1, per_page: 3 });
      if (response && response.success && response.data) {
        setDashboards(response.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching recent dashboards:', error);
    } finally {
      setLoadingDashboards(false);
    }
  };

  useEffect(() => {
    fetchRecentTools();
    fetchRecentDashboards();
  }, []);

  const handleDownloadSuccess = () => {
    fetchRecentTools();
  };

  return (
    <div className="space-y-10">
      {/* Hero Welcome Banner */}
      <div className="bg-white border border-border rounded-xl p-8 md:p-10 shadow-sm text-left relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold text-accent-700 bg-accent-50 border border-accent-100">
            <Sparkles className="h-3 w-3" />
            <span>NielsenIQ Internal Platform</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Welcome to the Automation Hub
          </h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Your single repository for internal automation script tools, workflow utilities, and executive Power BI dashboards. Streamline operations, view visual intelligence, and download approved toolpacks.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/tools" className="btn-primary flex items-center space-x-1.5">
              <span>Browse Script Tools</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            <Link to="/dashboards" className="btn-secondary flex items-center space-x-1.5">
              <span>View BI Dashboards</span>
            </Link>
          </div>
        </div>
        
        {/* Subtle decorative background shape */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-primary-50/30 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* Latest Script Tools Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 text-left">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-500">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Recent Automation Scripts</h2>
              <p className="text-xs text-gray-500">Latest tools added to streamline operational processes</p>
            </div>
          </div>
          <Link
            to="/tools"
            className="group flex items-center space-x-1 text-sm font-bold text-accent-600 hover:text-accent-700 transition-colors"
          >
            <span>View all tools</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loadingTools ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="card p-8 text-center text-gray-500 bg-white border border-border">
            No scripts uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onDownloadSuccess={handleDownloadSuccess}
              />
            ))}
          </div>
        )}
      </div>

      {/* Latest Power BI Dashboards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 text-left">
            <div className="p-2 bg-accent-50 rounded-lg text-accent-750 font-bold">
              <LayoutDashboard className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Recent Power BI Dashboards</h2>
              <p className="text-xs text-gray-500">Latest business intelligence reports and visual tracking dashboards</p>
            </div>
          </div>
          <Link
            to="/dashboards"
            className="group flex items-center space-x-1 text-sm font-bold text-accent-600 hover:text-accent-700 transition-colors"
          >
            <span>View all reports</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loadingDashboards ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : dashboards.length === 0 ? (
          <div className="card p-8 text-center text-gray-500 bg-white border border-border">
            No BI reports available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => (
              <DashboardCard
                key={dashboard.id}
                dashboard={dashboard}
                isAdmin={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
