import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Hide initial loader once React is ready
const hideLoader = () => {
  const loader = document.getElementById('initial-loader')
  if (loader) {
    loader.style.display = 'none'
  }
}

// Error boundary for the entire app
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px',
          backgroundColor: '#ffffff',
          color: '#111827',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>App Error</div>
          <div style={{ 
            fontSize: '0.85rem', 
            maxWidth: '300px',
            color: '#6b7280',
            marginBottom: '16px',
            wordBreak: 'break-word'
          }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              backgroundColor: '#3378ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🔄 Reload App
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

try {
  const root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  )
  hideLoader()
} catch (error) {
  console.error('Failed to render app:', error)
  hideLoader()
  document.getElementById('error-message').textContent = error.message || 'Failed to start the application'
  document.getElementById('error-display').classList.add('show')
}














