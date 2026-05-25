// frontend/src/components/ErrorBoundary.jsx

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white font-sans px-8">
          <div className="max-w-md w-full space-y-6 border border-black/10 dark:border-white/10 p-10">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-rose-500 font-bold">
                Application Error
              </span>
              <h1 className="text-2xl font-serif font-light uppercase tracking-widest">
                Something went wrong
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 tracking-wider leading-relaxed">
                An unexpected error occurred. Please refresh the page or return to the homepage.
              </p>
              {this.state.error && (
                <pre className="text-[10px] text-rose-400 bg-rose-950/10 border border-rose-900/20 p-3 overflow-auto mt-4 font-mono">
                  {this.state.error.message}
                </pre>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 border border-black dark:border-white text-black dark:text-white py-3 text-xs uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                Refresh Page
              </button>
              <a
                href="/"
                className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors text-center"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
