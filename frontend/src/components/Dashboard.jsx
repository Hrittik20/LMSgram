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
    submittedCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentCourses, setRecentCourses] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      const coursesRes = await axios.get(`${API_BASE_URL}/courses?telegram_id=${user.telegram_id}`)
      const courses = coursesRes.data
      
      setRecentCourses(courses.slice(0, 3))
      
      let allAssignments = []
      let submittedCount = 0
      const today = new Date()
      
      for (const course of courses) {
        try {
          const assignmentsRes = await axios.get(`${API_BASE_URL}/assignments/course/${course.id}`)
          allAssignments = [
            ...allAssignments, 
            ...assignmentsRes.data.map(a => ({ 
              ...a, 
              courseName: course.title,
              courseId: course.id 
            }))
          ]
        } catch (err) {
          console.error('Error loading assignments:', err)
        }
      }

      // Get submissions for student
      if (user.role === 'student') {
        try {
          const submissionsRes = await axios.get(`${API_BASE_URL}/submissions/user/${user.telegram_id}`)
          submittedCount = submissionsRes.data?.length || 0
        } catch (err) {
          console.log('Could not fetch submissions')
        }
      }

      const upcoming = allAssignments
        .filter(a => {
          if (!a.due_date) return false
          const dueDate = new Date(a.due_date)
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          return dueDate >= today && dueDate <= weekFromNow
        })
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 3)

      setUpcomingTasks(upcoming)

      const upcomingCount = allAssignments.filter(a => {
        if (!a.due_date) return false
        return new Date(a.due_date) >= today
      }).length

      setStats({
        courses: courses.length,
        assignments: allAssignments.length,
        upcomingAssignments: upcomingCount,
        submittedCount: submittedCount
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    )
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="page fade-in">
      {/* Welcome Section */}
      <div className="page-header">
        <div className="page-title">
          {greeting()}{user.first_name ? `, ${user.first_name}` : ''}! 👋
        </div>
        <div className="page-subtitle">
          {user.role === 'teacher' 
            ? 'Manage your courses and track student progress' 
            : 'Keep track of your learning journey'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/courses')}>
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats.courses}</div>
          <div className="stat-label">Courses</div>
        </div>
        
        <div className="stat-card" onClick={() => navigate('/assignments')}>
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats.assignments}</div>
          <div className="stat-label">Assignments</div>
        </div>

        {user.role === 'student' && (
          <>
            <div className="stat-card stat-card-warning" onClick={() => navigate('/assignments')}>
              <div className="stat-icon">⏰</div>
              <div className="stat-value">{stats.upcomingAssignments}</div>
              <div className="stat-label">Upcoming</div>
            </div>
            
            <div className="stat-card stat-card-success">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{stats.submittedCount}</div>
              <div className="stat-label">Submitted</div>
            </div>
          </>
        )}

        {user.role === 'teacher' && (
          <>
            <div className="stat-card stat-card-success">
              <div className="stat-icon">👥</div>
              <div className="stat-value">-</div>
              <div className="stat-label">Students</div>
            </div>
            
            <div className="stat-card stat-card-warning">
              <div className="stat-icon">📊</div>
              <div className="stat-value">-</div>
              <div className="stat-label">To Grade</div>
            </div>
          </>
        )}
      </div>

      {/* Upcoming Tasks */}
      {user.role === 'student' && upcomingTasks.length > 0 && (
        <div className="section">
          <div className="section-header">
            <div className="section-title">📌 Upcoming Tasks</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/assignments')}>
              View All →
            </button>
          </div>
          
          <div className="flex flex-col gap-sm">
            {upcomingTasks.map(task => (
              <div 
                key={task.id} 
                className="assignment-card"
                onClick={() => navigate('/assignments')}
              >
                <div className="assignment-icon">📝</div>
                <div className="assignment-info">
                  <div className="assignment-title">{task.title}</div>
                  <div className="assignment-course">{task.courseName}</div>
                  {task.due_date && (
                    <div className="assignment-due">
                      ⏰ Due {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Courses */}
      {recentCourses.length > 0 && (
        <div className="section">
          <div className="section-header">
            <div className="section-title">📚 Your Courses</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/courses')}>
              View All →
            </button>
          </div>
          
          <div className="course-grid">
            {recentCourses.map(course => (
              <div 
                key={course.id} 
                className="course-card"
                onClick={() => navigate('/courses')}
              >
                <div className="course-card-header">
                  <div className="course-card-icon">📖</div>
                  <div className="course-card-info">
                    <div className="course-card-title">{course.title}</div>
                    {course.description && (
                      <div className="course-card-desc">{course.description}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => navigate('/courses')}>
          <div className="quick-action-icon">📚</div>
          <div className="quick-action-text">
            <div className="quick-action-title">
              {user.role === 'teacher' ? 'Manage Courses' : 'Browse Courses'}
            </div>
            <div className="quick-action-desc">
              {user.role === 'teacher' ? 'Create and manage' : 'View enrolled courses'}
            </div>
          </div>
          <span className="quick-action-arrow">→</span>
        </button>
        
        <button className="quick-action-btn" onClick={() => navigate('/assignments')}>
          <div className="quick-action-icon">📝</div>
          <div className="quick-action-text">
            <div className="quick-action-title">
              {user.role === 'teacher' ? 'Grade Submissions' : 'View Assignments'}
            </div>
            <div className="quick-action-desc">
              {user.role === 'teacher' ? 'Review student work' : 'Check pending tasks'}
            </div>
          </div>
          <span className="quick-action-arrow">→</span>
        </button>
      </div>

      {/* Empty State */}
      {stats.courses === 0 && (
        <div className="empty-state mt-xl">
          <div className="empty-state-icon">🎓</div>
          <div className="empty-state-title">Welcome to LMS!</div>
          <div className="empty-state-text">
            {user.role === 'teacher' 
              ? 'Create your first course to get started'
              : 'Join a course using an access code'}
          </div>
          <button className="btn btn-primary btn-lg mt-md" onClick={() => navigate('/courses')}>
            {user.role === 'teacher' ? '➕ Create Course' : '🔗 Join Course'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard
