import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import Courses from './components/Courses'
import Assignments from './components/Assignments'

// Auto-detect API URL based on environment
const getApiBaseUrl = () => {
  // If explicitly set in environment, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // In development, use proxy
  if (import.meta.env.DEV) {
    return '/api'
  }
  
  // In production, try to detect from current origin
  // If frontend is on Vercel, backend might be on same domain or different
  const origin = window.location.origin
  
  // If we're on a Vercel domain, try to construct backend URL
  // This assumes backend might be on same domain with /api or different subdomain
  // You should set VITE_API_URL in Vercel environment variables!
  console.warn('⚠️ VITE_API_URL not set! Using fallback:', origin + '/api')
  console.warn('Please set VITE_API_URL in Vercel environment variables to your backend URL')
  
  return '/api' // Fallback - will only work if backend is on same domain
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
  const [error, setError] = useState(null)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      console.log('Initializing app...')
      console.log('API_BASE_URL:', API_BASE_URL)
      console.log('Environment:', import.meta.env.MODE)
      
      // Test API connection first (optional - don't block if it fails)
      try {
        console.log('Testing API connection...')
        // Health endpoint is at root, not under /api
        const healthUrl = API_BASE_URL.includes('/api') 
          ? API_BASE_URL.replace('/api', '') + '/health'
          : API_BASE_URL + '/health'
        
        const healthCheck = await axios.get(healthUrl, { timeout: 5000 })
        console.log('✅ API connection successful:', healthCheck.data)
      } catch (err) {
        console.warn('⚠️ API health check failed:', err.message)
        console.warn('This is OK if backend is not yet deployed or URL is incorrect')
      }
      
      // Get user from Telegram WebApp
      const tg = window.Telegram?.WebApp
      console.log('Telegram WebApp available:', !!tg)
      
      if (tg) {
        tg.ready()
        tg.expand()
        
        console.log('Telegram initDataUnsafe:', tg.initDataUnsafe)
        console.log('Telegram user:', tg.initDataUnsafe?.user)
        
        // Set Telegram theme colors
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

        const initUser = tg.initDataUnsafe?.user
        if (initUser) {
          console.log('Loading user from Telegram:', initUser.id)
          await loadUser(initUser.id.toString(), initUser)
        } else {
          console.warn('No Telegram user found, using fallback')
          // Development fallback
          await loadUser('123456789', null)
        }
      } else {
        console.warn('Telegram WebApp not available, using development mode')
        // Development mode - use test user
        await loadUser('123456789', null)
      }
    } catch (err) {
      console.error('App initialization error:', err)
      console.error('Error stack:', err.stack)
      setError(`Failed to initialize app: ${err.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
      console.log('App initialization complete')
    }
  }

  const loadUser = async (telegramId, initUser) => {
    try {
      console.log('Loading user with telegram_id:', telegramId)
      console.log('API_BASE_URL:', API_BASE_URL)
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      try {
        const response = await axios.post(`${API_BASE_URL}/users`, {
          telegram_id: telegramId
        }, {
          signal: controller.signal,
          timeout: 10000
        })
        clearTimeout(timeoutId)
        console.log('User loaded:', response.data)
        setUser(response.data)
      } catch (error) {
        clearTimeout(timeoutId)
        
        // If 404, user doesn't exist - create them
        if (error.response?.status === 404 || error.response?.status === 400) {
          console.log('User not found, creating new user...')
          try {
            const response = await axios.post(`${API_BASE_URL}/users`, {
              telegram_id: telegramId,
              username: initUser?.username || '',
              first_name: initUser?.first_name || 'Test',
              last_name: initUser?.last_name || 'User',
              role: 'student'
            }, {
              signal: controller.signal,
              timeout: 10000
            })
            console.log('User created:', response.data)
            setUser(response.data)
          } catch (createErr) {
            console.error('Error creating user:', createErr)
            console.error('Error details:', {
              message: createErr.message,
              response: createErr.response?.data,
              status: createErr.response?.status,
              url: createErr.config?.url
            })
            setError(`Failed to create user: ${createErr.message || 'Network error'}`)
          }
        } else {
          // Other errors
          console.error('Error loading user:', error)
          console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url,
            code: error.code
          })
          
          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            setError('Request timed out. Please check your connection and try again.')
          } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
            setError(`Cannot connect to server. API URL: ${API_BASE_URL}`)
          } else {
            setError(`Failed to load user: ${error.response?.data?.error || error.message || 'Unknown error'}`)
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error in loadUser:', err)
      setError(`Unexpected error: ${err.message || 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading your LMS...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-title">Something went wrong</div>
          <div className="empty-state-text" style={{ 
            fontSize: '0.9rem', 
            maxWidth: '400px',
            wordBreak: 'break-word',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            color: 'var(--neutral-500)',
            marginBottom: '1rem',
            padding: '0.75rem',
            background: 'var(--neutral-50)',
            borderRadius: 'var(--radius-md)',
            maxWidth: '400px'
          }}>
            <strong>Debug Info:</strong><br/>
            API URL: {API_BASE_URL}<br/>
            Telegram WebApp: {window.Telegram?.WebApp ? 'Available' : 'Not available'}
          </div>
          <button className="btn btn-primary mt-lg" onClick={() => window.location.reload()}>
            🔄 Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">📱</div>
          <div className="empty-state-title">Open from Telegram</div>
          <div className="empty-state-text">
            Please open this app from the Telegram bot to continue
          </div>
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
