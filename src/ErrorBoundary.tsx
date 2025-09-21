import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px', margin: '20px' }}>
          <h2 style={{ color: '#d32f2f' }}>Error en la aplicación</h2>
          <p><strong>Error:</strong> {this.state.error?.message}</p>
          <p><strong>Stack:</strong> {this.state.error?.stack}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
