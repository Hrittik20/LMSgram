import { useState, useEffect } from 'react'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import Courses from './components/Courses'
import Assignments from './components/Assignments'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      
      // Set theme colors
      if (tg.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff')
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000')
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc')
      }

      // Get user data from Telegram
      const telegramUser = tg.initDataUnsafe?.user
      if (telegramUser) {
        initUser(telegramUser)
      } else {
        // Fallback for development
        initUser({
          id: '123456789',
          first_name: 'Demo',
          last_name: 'User',
          username: 'demouser'
        })
      }
    } else {
      // Development mode
      initUser({
        id: '123456789',
        first_name: 'Demo',
        last_name: 'User',
        username: 'demouser'
      })
    }
  }, [])

  const initUser = async (telegramUser) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, {
        telegram_id: telegramUser.id.toString(),
        username: telegramUser.username || '',
        first_name: telegramUser.first_name || '',
        last_name: telegramUser.last_name || ''
      })
      setUser({ ...response.data, telegram_id: telegramUser.id.toString() })
    } catch (error) {
      console.error('Error initializing user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="app" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)'
      }}>
        <div className="loading">
          <div className="spinner"></div>
          <p style={{ 
            marginTop: '1.5rem', 
            fontSize: '1.1rem', 
            fontWeight: '600',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Loading your workspace...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'var(--card-bg)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: '400px',
          margin: '1rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Unable to Load
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Error loading user data. Please restart the app.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            🔄 Reload App
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <span style={{ 
              fontSize: '2rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}>🎓</span>
            <span style={{ letterSpacing: '-0.5px' }}>LMS</span>
          </h1>
        </div>
        <div className="user-info">
          <span style={{ fontSize: '1.1rem' }}>
            {user.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}
          </span>
          <span style={{ fontWeight: '600' }}>{user.first_name} {user.last_name}</span>
          <span style={{ opacity: 0.7 }}>•</span>
          <span style={{ 
            textTransform: 'capitalize',
            fontSize: '0.85rem',
            padding: '0.25rem 0.5rem',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px'
          }}>
            {user.role}
          </span>
        </div>
      </header>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-tab ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          📚 Courses
        </button>
        <button
          className={`nav-tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          📝 Assignments
        </button>
      </nav>

      <main className="content">
        {activeTab === 'dashboard' && <Dashboard user={user} />}
        {activeTab === 'courses' && <Courses user={user} />}
        {activeTab === 'assignments' && <Assignments user={user} />}
      </main>
    </div>
  )
}

export default App

