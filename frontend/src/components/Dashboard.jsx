import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function Dashboard({ user }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    courses: 0,
    assignments: 0,
    submissions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [user])

  const loadStats = async () => {
    try {
      const coursesRes = await axios.get(`${API_BASE_URL}/courses?telegram_id=${user.telegram_id}`)
      const courses = coursesRes.data
      
      let allAssignments = []
      for (const course of courses) {
        try {
          const assignmentsRes = await axios.get(`${API_BASE_URL}/assignments/course/${course.id}`)
          allAssignments = [...allAssignments, ...assignmentsRes.data]
        } catch (err) {
          console.error('Error loading assignments:', err)
        }
      }

      setStats({
        courses: courses.length,
        assignments: allAssignments.length,
        submissions: 0 // Could be calculated if needed
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.courses}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Courses</div>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.assignments}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Assignments</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button className="btn btn-primary btn-large" onClick={() => navigate('/courses')}>
          📚 View Courses
        </button>
        <button className="btn btn-secondary btn-large" onClick={() => navigate('/assignments')}>
          📝 View Assignments
        </button>
      </div>
    </div>
  )
}

export default Dashboard
