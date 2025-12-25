import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function Dashboard({ user }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    courses: 0,
    assignments: 0,
    upcomingAssignments: 0,
    submissions: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentCourses, setRecentCourses] = useState([])

  useEffect(() => {
    loadStats()
  }, [user])

  const loadStats = async () => {
    try {
      const coursesRes = await axios.get(`${API_BASE_URL}/courses?telegram_id=${user.telegram_id}`)
      const courses = coursesRes.data
      
      // Get recent courses (last 3)
      setRecentCourses(courses.slice(0, 3))
      
      let allAssignments = []
      const today = new Date()
      
      for (const course of courses) {
        try {
          const assignmentsRes = await axios.get(`${API_BASE_URL}/assignments/course/${course.id}`)
          allAssignments = [...allAssignments, ...assignmentsRes.data.map(a => ({ ...a, courseName: course.title }))]
        } catch (err) {
          console.error('Error loading assignments:', err)
        }
      }

      const upcomingAssignments = allAssignments.filter(a => {
        if (!a.due_date) return false
        return new Date(a.due_date) >= today
      })

      setStats({
        courses: courses.length,
        assignments: allAssignments.length,
        upcomingAssignments: upcomingAssignments.length,
        submissions: 0
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
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Welcome back{user.first_name ? `, ${user.first_name}` : ''}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          {user.role === 'teacher' ? 'Manage your courses and students' : 'Track your learning progress'}
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📚</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--tg-theme-button-color)' }}>
            {stats.courses}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
            {stats.courses === 1 ? 'Course' : 'Courses'}
          </div>
        </div>
        
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--tg-theme-button-color)' }}>
            {stats.assignments}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
            {stats.assignments === 1 ? 'Assignment' : 'Assignments'}
          </div>
        </div>

        {user.role === 'student' && (
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏰</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--warning-color)' }}>
              {stats.upcomingAssignments}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
              Upcoming
            </div>
          </div>
        )}
      </div>

      {recentCourses.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Recent Courses</h2>
            <button 
              className="btn btn-secondary btn-small" 
              onClick={() => navigate('/courses')}
            >
              View All →
            </button>
          </div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {recentCourses.map(course => (
              <div 
                key={course.id} 
                className="card" 
                onClick={() => navigate('/courses')}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-title">{course.title}</div>
                {course.description && (
                  <div className="card-description" style={{ marginTop: '0.5rem' }}>
                    {course.description.length > 100 
                      ? `${course.description.substring(0, 100)}...` 
                      : course.description}
                  </div>
                )}
                <div className="card-meta" style={{ marginTop: '0.75rem' }}>
                  📅 {new Date(course.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button className="btn btn-primary btn-large" onClick={() => navigate('/courses')}>
          <span>📚</span>
          <span>View All Courses</span>
        </button>
        <button className="btn btn-secondary btn-large" onClick={() => navigate('/assignments')}>
          <span>📝</span>
          <span>View Assignments</span>
        </button>
      </div>
    </div>
  )
}

export default Dashboard
