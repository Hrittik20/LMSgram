import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalAssignments: 0,
    pendingSubmissions: 0,
    averageGrade: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [user])

  const loadDashboard = async () => {
    try {
      // Load courses
      const coursesRes = await axios.get(`${API_BASE_URL}/courses?telegram_id=${user.telegram_id}`)
      const courses = coursesRes.data

      // Load assignments for each course
      let allAssignments = []
      for (const course of courses) {
        const assignmentsRes = await axios.get(`${API_BASE_URL}/assignments/course/${course.id}`)
        allAssignments = [...allAssignments, ...assignmentsRes.data.map(a => ({ ...a, courseName: course.title }))]
      }

      // Calculate stats
      setStats({
        totalCourses: courses.length,
        totalAssignments: allAssignments.length,
        pendingSubmissions: user.role === 'student' ? allAssignments.filter(a => !a.submitted).length : 0,
        averageGrade: 85 // Placeholder
      })

      // Recent activity (placeholder)
      setRecentActivity([
        { type: 'course', text: 'Started learning', time: 'Today' },
        { type: 'assignment', text: 'New assignment posted', time: '2 hours ago' }
      ])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '2rem 1.5rem',
        marginBottom: '2rem',
        color: 'white',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
      }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: '700' }}>
          Welcome back, {user.first_name}! 👋
        </h2>
        <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
          {user.role === 'teacher' 
            ? 'Ready to inspire minds today?' 
            : 'Keep up the great work with your studies!'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
          border: '2px solid #667eea30'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>📚</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '0.25rem' }}>
            {stats.totalCourses}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {user.role === 'teacher' ? 'Courses' : 'Enrolled'}
          </div>
        </div>

        <div className="card" style={{ 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)',
          border: '2px solid #f093fb30'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>📝</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f5576c', marginBottom: '0.25rem' }}>
            {stats.totalAssignments}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Assignments
          </div>
        </div>

        <div className="card" style={{ 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #ffeaa715 0%, #fbda6115 100%)',
          border: '2px solid #ffeaa730'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>⏰</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--warning-color)', marginBottom: '0.25rem' }}>
            {stats.pendingSubmissions}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pending
          </div>
        </div>

        <div className="card" style={{ 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #a8edea15 0%, #fed6e315 100%)',
          border: '2px solid #a8edea30'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>⭐</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success-color)', marginBottom: '0.25rem' }}>
            {stats.averageGrade}%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Avg Grade
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
          ⚡ Quick Actions
        </h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {user.role === 'teacher' && (
          <button className="btn btn-primary" style={{ padding: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>➕</span>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.1rem' }}>
              <span style={{ fontWeight: '700' }}>Create Course</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Start teaching</span>
            </span>
          </button>
        )}
        <button className="btn btn-success" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎓</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.1rem' }}>
            <span style={{ fontWeight: '700' }}>Join Course</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Enter access code</span>
          </span>
        </button>
        <button className="btn btn-secondary" style={{ padding: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📚</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.1rem' }}>
            <span style={{ fontWeight: '700' }}>Browse Materials</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>View resources</span>
          </span>
        </button>
      </div>

      {stats.totalCourses === 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #ffeaa715 0%, #fbda6115 100%)',
          border: '2px dashed #fbbf24',
          borderRadius: '20px',
          padding: '3rem 2rem',
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>
            {user.role === 'teacher' ? '🎯' : '🚀'}
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            {user.role === 'teacher' 
              ? 'Start Your Teaching Journey!' 
              : 'Begin Your Learning Adventure!'}
          </h3>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {user.role === 'teacher'
              ? 'Create your first course and share knowledge with students around the world.'
              : 'Join a course and start learning something amazing today!'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user.role === 'teacher' && (
              <button className="btn btn-primary">
                ➕ Create First Course
              </button>
            )}
            <button className="btn btn-success">
              🎓 Join Course
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

