import React, { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="card max-w-md w-full p-8 space-y-6 bg-white border border-border shadow-lg">
            <div className="mx-auto w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-500">
              <AlertTriangle className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">Application Error</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Something went wrong in the application. Please try reloading the page or contact the administrator if the issue persists.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 border border-border p-3 rounded-lg text-left text-xs font-mono text-gray-500 max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-4 w-4 animate-spin-once" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
