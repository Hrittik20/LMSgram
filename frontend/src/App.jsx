import { useState, useEffect } from 'react'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import Courses from './components/Courses'
import Assignments from './components/Assignments'

const API_BASE_URL = '/api'

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
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app">
        <div className="empty-state">
          <p>Error loading user data. Please restart the app.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎓 LMS</h1>
        <div className="user-info">
          <span>{user.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}</span>
          <span>{user.first_name} {user.last_name}</span>
          <span>•</span>
          <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
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

