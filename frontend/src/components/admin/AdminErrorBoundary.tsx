"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  /** Custom fallback. Defaults to a full-panel error card with retry. */
  fallback?: React.ReactNode;
  /** Name of the section — shown in the error card title. */
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * AdminErrorBoundary
 *
 * Class component required by React — hooks cannot catch render errors.
 * Wrap any admin panel section to prevent a single component crash from
 * taking down the entire dashboard shell.
 *
 * Usage:
 *   <AdminErrorBoundary section="Lead Pipeline">
 *     <KanbanBoard />
 *   </AdminErrorBoundary>
 */
export class AdminErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log structured error for observability — visible in Vercel/server logs.
    console.error(
      `[AdminErrorBoundary] Uncaught render error in section "${this.props.section ?? "unknown"}"`,
      { error: error.message, stack: error.stack, componentStack: info.componentStack }
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[320px] bg-red-50/60 border border-red-100 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>

          <h2 className="text-lg font-bold text-red-700 mb-1">
            {this.props.section
              ? `${this.props.section} — Render Error`
              : "Something went wrong"}
          </h2>

          <p className="text-sm text-red-500/80 max-w-sm mb-6">
            An unexpected error occurred in this panel. Your data is safe.
            <br />
            <span className="font-mono text-xs text-red-400 mt-1 block truncate max-w-xs mx-auto">
              {this.state.error?.message ?? "Unknown error"}
            </span>
          </p>

          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
