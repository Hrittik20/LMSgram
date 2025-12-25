import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import Courses from './components/Courses'
import Assignments from './components/Assignments'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

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
      // Get user from Telegram WebApp
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.ready()
        tg.expand()
        
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
          await loadUser(initUser.id.toString(), initUser)
        } else {
          // Development fallback
          await loadUser('123456789', null)
        }
      } else {
        // Development mode - use test user
        await loadUser('123456789', null)
      }
    } catch (err) {
      console.error('App initialization error:', err)
      setError('Failed to initialize app')
    } finally {
      setLoading(false)
    }
  }

  const loadUser = async (telegramId, initUser) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, {
        telegram_id: telegramId
      })
      setUser(response.data)
    } catch (error) {
      // Create user if doesn't exist
      try {
        const response = await axios.post(`${API_BASE_URL}/users`, {
          telegram_id: telegramId,
          username: initUser?.username || '',
          first_name: initUser?.first_name || 'Test',
          last_name: initUser?.last_name || 'User',
          role: 'student'
        })
        setUser(response.data)
      } catch (err) {
        console.error('Error creating user:', err)
        setError('Failed to load user profile')
      }
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
          <div className="empty-state-text">{error}</div>
          <button className="btn btn-primary mt-lg" onClick={() => window.location.reload()}>
            Try Again
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
