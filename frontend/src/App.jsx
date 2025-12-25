import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import Courses from './components/Courses'
import Assignments from './components/Assignments'

// Auto-detect API URL based on environment
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  if (import.meta.env.DEV) {
    return '/api'
  }
  console.warn('⚠️ VITE_API_URL not set!')
  return '/api'
}

const API_BASE_URL = getApiBaseUrl()

// Bottom Navigation Component
function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-items">
        <button 
          className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </button>
        <button 
          className={`bottom-nav-item ${isActive('/courses') ? 'active' : ''}`}
          onClick={() => navigate('/courses')}
        >
          <span className="nav-icon">📚</span>
          <span>Courses</span>
        </button>
        <button 
          className={`bottom-nav-item ${isActive('/assignments') ? 'active' : ''}`}
          onClick={() => navigate('/assignments')}
        >
          <span className="nav-icon">📝</span>
          <span>Tasks</span>
        </button>
      </div>
    </nav>
  )
}

// Main App Content
function AppContent({ user }) {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/courses" element={<Courses user={user} />} />
        <Route path="/assignments" element={<Assignments user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingStatus, setLoadingStatus] = useState('Initializing...')
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState({})

  useEffect(() => {
    // Small delay to ensure Telegram WebApp script is loaded
    const timer = setTimeout(() => {
      initializeApp()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  const initializeApp = async () => {
    const debug = {
      apiUrl: API_BASE_URL,
      telegramAvailable: false,
      telegramUser: null,
      env: import.meta.env.MODE
    }
    
    try {
      setLoadingStatus('Checking Telegram...')
      
      // Get Telegram WebApp
      const tg = window.Telegram?.WebApp
      debug.telegramAvailable = !!tg
      
      if (tg) {
        // Tell Telegram we're ready
        tg.ready()
        tg.expand()
        
        // Apply Telegram theme
        if (tg.themeParams) {
          const root = document.documentElement
          if (tg.themeParams.bg_color) {
            root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color)
          }
          if (tg.themeParams.text_color) {
            root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color)
          }
          if (tg.themeParams.button_color) {
            root.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color)
            root.style.setProperty('--primary-600', tg.themeParams.button_color)
          }
          if (tg.themeParams.secondary_bg_color) {
            root.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color)
          }
        }

        // Get user from Telegram
        const initUser = tg.initDataUnsafe?.user
        debug.telegramUser = initUser ? { id: initUser.id, username: initUser.username } : null
        
        if (initUser && initUser.id) {
          setLoadingStatus('Loading your profile...')
          await loadUser(initUser.id.toString(), initUser, debug)
        } else {
          // Telegram WebApp is available but no user data
          // This can happen if opened directly (not from bot)
          console.warn('Telegram WebApp available but no user data')
          debug.error = 'No Telegram user data'
          
          // Use fallback for testing
          setLoadingStatus('Loading test profile...')
          await loadUser('123456789', null, debug)
        }
      } else {
        // Not in Telegram environment - development mode
        console.log('Not in Telegram environment, using development mode')
        setLoadingStatus('Loading test profile...')
        await loadUser('123456789', null, debug)
      }
    } catch (err) {
      console.error('App initialization error:', err)
      debug.initError = err.message
      setDebugInfo(debug)
      setError(`Initialization failed: ${err.message}`)
    } finally {
      setDebugInfo(debug)
      setLoading(false)
    }
  }

  const loadUser = async (telegramId, initUser, debug) => {
    try {
      setLoadingStatus('Connecting to server...')
      
      const response = await axios.post(`${API_BASE_URL}/users`, {
        telegram_id: telegramId,
        username: initUser?.username || '',
        first_name: initUser?.first_name || 'User',
        last_name: initUser?.last_name || '',
        role: 'student'
      }, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data) {
        debug.userLoaded = true
        setUser(response.data)
      } else {
        throw new Error('Empty response from server')
      }
    } catch (err) {
      console.error('Error loading user:', err)
      
      debug.loadUserError = {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        code: err.code
      }
      
      // Provide helpful error message
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError(`Cannot connect to server.\n\nMake sure your backend is running and accessible.`)
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Server is not responding. Please try again.')
      } else if (err.response?.status === 404) {
        setError('API endpoint not found. Check your API URL configuration.')
      } else if (err.response?.status >= 500) {
        setError(`Server error: ${err.response?.data?.error || 'Internal server error'}`)
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to load user')
      }
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#3378ff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{loadingStatus}</div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
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
        <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Connection Error</div>
        <div style={{ 
          fontSize: '0.9rem', 
          maxWidth: '350px',
          whiteSpace: 'pre-wrap',
          marginBottom: '16px',
          color: '#4b5563'
        }}>
          {error}
        </div>
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#6b7280',
          marginBottom: '16px',
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px',
          maxWidth: '350px',
          textAlign: 'left'
        }}>
          <strong>Debug:</strong><br/>
          API: {debugInfo.apiUrl || 'N/A'}<br/>
          Telegram: {debugInfo.telegramAvailable ? 'Yes' : 'No'}<br/>
          User ID: {debugInfo.telegramUser?.id || 'N/A'}<br/>
          Env: {debugInfo.env || 'N/A'}
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
          🔄 Try Again
        </button>
      </div>
    )
  }

  if (!user) {
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
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📱</div>
        <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Open from Telegram</div>
        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '16px' }}>
          Please open this app from the Telegram bot
        </div>
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#6b7280',
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          Telegram: {debugInfo.telegramAvailable ? 'Available' : 'Not detected'}
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <AppContent user={user} />
      </div>
    </Router>
  )
}

export default App
