import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
          <AlertCircle size={64} className="text-red-500 mb-4" />
          <h1 className="text-3xl font-black mb-2">Oops! Something went wrong</h1>
          <p className="text-slate-300 mb-6 text-center max-w-md">
            We've logged this error. Our team has been notified.
          </p>
          <p className="text-xs text-slate-500 font-mono mb-6 bg-slate-800 p-4 rounded max-w-md overflow-auto max-h-32">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-hero-blue rounded-lg font-bold hover:bg-blue-600"
          >
            Reload Game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
