import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import Courses from './components/Courses'
import Assignments from './components/Assignments'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user from Telegram WebApp
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()

      const initUser = tg.initDataUnsafe?.user
      if (initUser) {
        loadUser(initUser.id.toString())
      } else {
        setLoading(false)
      }
    } else {
      // Development mode - use test user
      loadUser('123456789')
    }
  }, [])

  const loadUser = async (telegramId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, {
        telegram_id: telegramId
      })
      setUser(response.data)
    } catch (error) {
      console.error('Error loading user:', error)
      // Create user if doesn't exist
      try {
        const tg = window.Telegram?.WebApp
        const initUser = tg?.initDataUnsafe?.user
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
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Unable to load user</h1>
        <p>Please open this app from Telegram</p>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/courses" element={<Courses user={user} />} />
          <Route path="/assignments" element={<Assignments user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
