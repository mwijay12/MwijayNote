import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary for Mwijay Note.
 * Catches runtime crashes and displays a professional recovery screen.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Here you could send the error to your analytics service
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="w-24 h-24 bg-accent/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-accent/20 shadow-xl relative group">
            <div className="absolute inset-0 bg-accent/5 rounded-[2.5rem] animate-ping opacity-20"></div>
            <span className="text-5xl group-hover:rotate-12 transition-transform">🚀</span>
          </div>
          
          <h1 className="text-3xl font-brand font-black text-isabelline tracking-tighter mb-4 uppercase">Something went wrong</h1>
          <p className="text-dun mb-10 max-w-sm leading-relaxed opacity-80">
            Mwijay Note encountered an unexpected turbulence. Your data is safe, but we need a quick restart to get back on track.
          </p>
          
          <div className="flex flex-col w-full max-w-xs gap-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-accent text-cafe font-black rounded-2xl shadow-lg shadow-amber/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm"
              >
                Restore System
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full py-4 bg-card border border-border-subtle text-isabelline font-bold rounded-2xl hover:bg-white/5 transition-all text-sm"
              >
                Ignore & Continue
              </button>
          </div>

          <div className="mt-12 p-6 bg-card/40 border border-border-subtle rounded-3xl text-left max-w-md w-full opacity-60 hover:opacity-100 transition-opacity">
            <div className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">Diagnostic Data</div>
            <pre className="text-[10px] font-mono text-dun overflow-auto max-h-32 no-scrollbar whitespace-pre-wrap">
              {this.state.error?.stack || this.state.error?.toString() || "Unknown error context"}
            </pre>
          </div>
          
          <div className="mt-auto pt-10 text-[10px] font-black text-dun uppercase tracking-[0.4em] opacity-30">
            Mwijay Core Intelligence
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
