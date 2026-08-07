// src/components/dashboard/DashboardErrorBoundary.tsx
"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class DashboardErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Wire this into Sentry/your error tracker of choice in production.
    console.error("[DashboardErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center justify-center mx-auto mb-4 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              The dashboard hit an unexpected error. Try reloading — your progress data is safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}