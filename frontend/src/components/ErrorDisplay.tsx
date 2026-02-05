import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  showLoginButton?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  onGoBack,
  showLoginButton = false 
}) => {
  return (
    <div style={{ 
      marginTop: '20px', 
      padding: '20px', 
      backgroundColor: '#ffebee',
      borderLeft: '4px solid #d32f2f',
      borderRadius: '4px'
    }}>
      <h3 style={{ color: '#c62828', margin: '0 0 10px 0' }}>Error</h3>
      <p style={{ margin: '0 0 15px 0', color: '#666' }}>
        {error}
      </p>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary">
            Retry
          </button>
        )}
        {onGoBack && (
          <button onClick={onGoBack} className="btn btn-secondary">
            Go Back
          </button>
        )}
        {showLoginButton && (
          <button 
            onClick={() => window.location.href = '/login'} 
            className="btn btn-secondary"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
