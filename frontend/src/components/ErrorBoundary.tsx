import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <div className="card" style={{ maxWidth: '600px', margin: '50px auto' }}>
            <h2 style={{ color: '#d32f2f' }}>Something went wrong</h2>
            <p style={{ color: '#666', marginTop: '10px' }}>
              An unexpected error occurred. This has been logged for debugging.
            </p>
            
            {this.state.error && (
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#fff3e0',
                borderLeft: '4px solid #ff9800',
                borderRadius: '4px'
              }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#e65100' }}>
                  Error: {this.state.error.toString()}
                </p>
              </div>
            )}

            {this.state.errorInfo && (
              <details style={{ marginTop: '20px', cursor: 'pointer' }}>
                <summary style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                  Stack Trace
                </summary>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '15px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '0.9em'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
              <button 
                onClick={this.handleReload} 
                className="btn btn-primary"
              >
                Reload Page
              </button>
              <button 
                onClick={() => window.location.href = '/login'} 
                className="btn btn-secondary"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
