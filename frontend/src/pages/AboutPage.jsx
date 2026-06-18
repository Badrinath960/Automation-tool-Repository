import React from 'react';
import { useAuth } from '../context/AuthContext';
import NiqLogo from '../components/common/NiqLogo';
import { Wrench, LayoutDashboard, Download, Upload, Shield, Info, Layers, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      {/* Brand Hero */}
      <div className="bg-white border border-border rounded-xl p-6 md:p-8 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center gap-6">
        <NiqLogo className="h-16 text-primary-500 flex-shrink-0" />
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary-900 tracking-tight">
            Automation Tools Repository Hub
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed">
            Automation Tools Repository Hub is a centralized workspace designed for discoverability, version-controlled distribution, 
            and auditing of automation scripts and Power BI visual dashboards across internal teams.
          </p>
        </div>
      </div>

      {/* Tech Stack Info */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-2">
          <Layers className="h-5 w-5 mr-2 text-primary-600" />
          Application Technology Stack
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-gray-800">Frontend Layer</h4>
            <ul className="text-xs text-gray-600 space-y-1 font-semibold list-disc list-inside">
              <li>React 19 & Vite 8</li>
              <li>Tailwind CSS Utility UI</li>
              <li>Lucide Icons</li>
              <li>Recharts Visualization</li>
            </ul>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-gray-800">Backend Engine</h4>
            <ul className="text-xs text-gray-600 space-y-1 font-semibold list-disc list-inside">
              <li>FastAPI Async Framework</li>
              <li>SQLAlchemy 2.0 ORM</li>
              <li>Alembic Migrations</li>
              <li>Python JOSE (JWT)</li>
            </ul>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-gray-800">Database & Storage</h4>
            <ul className="text-xs text-gray-600 space-y-1 font-semibold list-disc list-inside">
              <li>PostgreSQL 17.5 DB</li>
              <li>Local File Storage</li>
              <li>Path Traversal Sanitization</li>
              <li>Cascading Audit Logging</li>
            </ul>
          </div>
        </div>
      </div>

      {/* User Guide */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-2">
          <Download className="h-5 w-5 mr-2 text-primary-600" />
          User Guide: How to Download & Run Scripts
        </h2>
        <div className="space-y-3.5 pt-2 text-sm text-gray-700 leading-relaxed">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center font-bold text-xs text-primary-600 mt-0.5">
              1
            </span>
            <div>
              <p className="font-bold text-gray-900">Locate your Tool</p>
              <p className="text-gray-500 text-xs mt-0.5">
                Browse the catalog, search by keywords, or filter categories in the sidebar to find your target script.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center font-bold text-xs text-primary-600 mt-0.5">
              2
            </span>
            <div>
              <p className="font-bold text-gray-900">Review Dependencies & Setup Steps</p>
              <p className="text-gray-500 text-xs mt-0.5">
                Click on the card to open detail tabs. Review the **Dependencies** list and follow instructions in the **Documentation** tab.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center font-bold text-xs text-primary-600 mt-0.5">
              3
            </span>
            <div>
              <p className="font-bold text-gray-900">Download the ZIP Package</p>
              <p className="text-gray-500 text-xs mt-0.5">
                Click **Download Script ZIP** to save the latest release, or head to **Version History** to grab historic releases.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center font-bold text-xs text-primary-600 mt-0.5">
              4
            </span>
            <div>
              <p className="font-bold text-gray-900">Install Packages & Execute</p>
              <p className="text-gray-500 text-xs mt-0.5">
                Extract the ZIP archive. Open terminal, activate your virtual environment, and install dependencies:
                <code className="block bg-slate-100 border border-border p-2 rounded-lg font-mono text-xs text-slate-800 mt-1.5 select-all">
                  pip install -r requirements.txt
                </code>
                Then execute the entry point script (usually `main.py`):
                <code className="block bg-slate-100 border border-border p-2 rounded-lg font-mono text-xs text-slate-800 mt-1.5 select-all">
                  python main.py
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Guide (rendered only if administrator) */}
      {isAdmin && (
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4 border-l-4 border-l-primary-500">
          <h2 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-2">
            <Shield className="h-5 w-5 mr-2 text-primary-600" />
            Admin Console Guide: Upload & Versioning
          </h2>
          <div className="space-y-3.5 pt-2 text-sm text-gray-700 leading-relaxed">
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center font-bold text-xs text-primary-600 mt-0.5">
                1
              </span>
              <div>
                <p className="font-bold text-gray-900">Upload a New Script Tool</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Go to **Manage Tools** in the Admin panel and click **Add Script**. Provide metadata, tags, cover thumbnail, select the ZIP archive, and set the initial version (e.g. `1.0.0`).
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center font-bold text-xs text-primary-600 mt-0.5">
                2
              </span>
              <div>
                <p className="font-bold text-gray-900">Release a New Version</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  To release updates for an existing script, click the **New Version** icon next to the tool. Input the new version number (e.g. `1.1.0`), provide release notes, select the updated ZIP, and submit. The system automatically updates directory labels to display this version.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center font-bold text-xs text-primary-600 mt-0.5">
                3
              </span>
              <div>
                <p className="font-bold text-gray-900">Deactivation vs Soft Delete</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Instead of hard-deleting records (which corrupts historical log relationships), clicking **Deactivate** toggle hides the scripts from user views. Historical metrics remain fully intact.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutPage;
