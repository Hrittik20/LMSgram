import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = '/api'

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
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
        Welcome back, {user.first_name}! 👋
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {stats.totalCourses}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {user.role === 'teacher' ? 'Courses Teaching' : 'Courses Enrolled'}
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {stats.totalAssignments}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Total Assignments
          </div>
        </div>

        {user.role === 'student' && (
          <>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏰</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>
                {stats.pendingSubmissions}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Pending
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                {stats.averageGrade}%
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Avg Grade
              </div>
            </div>
          </>
        )}
      </div>

      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>📌 Quick Actions</h3>
      
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {user.role === 'teacher' ? (
          <>
            <button className="btn btn-primary">
              ➕ Create Course
            </button>
            <button className="btn btn-secondary">
              📊 View Analytics
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-primary">
              🔍 Join Course
            </button>
            <button className="btn btn-secondary">
              📚 Browse Materials
            </button>
          </>
        )}
      </div>

      {stats.totalCourses === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            {user.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}
          </div>
          <div className="empty-state-text">
            {user.role === 'teacher' 
              ? 'Create your first course to get started!' 
              : 'Join a course to start learning!'}
          </div>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {user.role === 'teacher'
              ? 'Go to the Courses tab to create a new course.'
              : 'Ask your teacher for a course access code.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Dashboard

