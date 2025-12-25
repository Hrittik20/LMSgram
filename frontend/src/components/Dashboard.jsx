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
    pendingSubmissions: 0
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
        pendingSubmissions: 0
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
        backgroundColor: '#ffffff'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#3378ff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const statCardStyle = (bgColor = '#eef5ff') => ({
    backgroundColor: bgColor,
    borderRadius: '14px',
    padding: '16px',
    cursor: 'pointer',
    textAlign: 'center'
  })

  const quickActionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '14px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left'
  }

  return (
    <div style={{
      padding: '16px',
      paddingBottom: '90px',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      {/* Welcome Section */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: '#111827' }}>
          {greeting()}{user.first_name ? `, ${user.first_name}` : ''}! 👋
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '4px 0 0 0' }}>
          {user.role === 'teacher' 
            ? 'Manage your courses and track student progress' 
            : 'Keep track of your learning journey'}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={statCardStyle('#eef5ff')} onClick={() => navigate('/courses')}>
          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📚</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827' }}>{stats.courses}</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Courses</div>
        </div>
        
        <div style={statCardStyle('#fef3c7')} onClick={() => navigate('/assignments')}>
          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📝</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827' }}>{stats.assignments}</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Assignments</div>
        </div>

        {user.role === 'student' && (
          <>
            <div style={statCardStyle('#fef3c7')} onClick={() => navigate('/assignments')}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>⏰</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827' }}>{stats.upcomingAssignments}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Upcoming</div>
            </div>
            
            <div style={statCardStyle('#d1fae5')}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>✅</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827' }}>{stats.assignments - stats.upcomingAssignments}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Completed</div>
            </div>
          </>
        )}

        {user.role === 'teacher' && (
          <>
            <div style={statCardStyle('#d1fae5')}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>👥</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827' }}>-</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Students</div>
            </div>
            
            <div style={statCardStyle('#fef3c7')}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📊</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827' }}>-</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>To Grade</div>
            </div>
          </>
        )}
      </div>

      {/* Upcoming Tasks */}
      {user.role === 'student' && upcomingTasks.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: '#111827' }}>
              📌 Upcoming Tasks
            </h2>
            <button 
              onClick={() => navigate('/assignments')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3378ff',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              View All →
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => navigate('/assignments')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  📝
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#111827', marginBottom: '2px' }}>{task.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{task.courseName}</div>
                  {task.due_date && (
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⏰ Due {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <span style={{ color: '#9ca3af', fontSize: '1.25rem' }}>→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Courses */}
      {recentCourses.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: '#111827' }}>
              📚 Your Courses
            </h2>
            <button 
              onClick={() => navigate('/courses')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3378ff',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              View All →
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentCourses.map(course => (
              <div 
                key={course.id} 
                onClick={() => navigate('/courses')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#eef5ff',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  📖
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#111827' }}>{course.title}</div>
                  {course.description && (
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {course.description}
                    </div>
                  )}
                </div>
                <span style={{ color: '#9ca3af', fontSize: '1.25rem' }}>→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 12px 0', color: '#111827' }}>
          ⚡ Quick Actions
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button style={quickActionStyle} onClick={() => navigate('/courses')}>
            <div style={{
              width: '44px',
              height: '44px',
              background: '#eef5ff',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              flexShrink: 0
            }}>
              📚
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '2px' }}>
                {user.role === 'teacher' ? 'Manage Courses' : 'Browse Courses'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                {user.role === 'teacher' ? 'Create and manage' : 'View enrolled courses'}
              </div>
            </div>
            <span style={{ color: '#9ca3af', fontSize: '1.25rem' }}>→</span>
          </button>
          
          <button style={quickActionStyle} onClick={() => navigate('/assignments')}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'rgba(245, 158, 11, 0.15)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              flexShrink: 0
            }}>
              📝
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '2px' }}>
                {user.role === 'teacher' ? 'Grade Submissions' : 'View Assignments'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                {user.role === 'teacher' ? 'Review student work' : 'Check pending tasks'}
              </div>
            </div>
            <span style={{ color: '#9ca3af', fontSize: '1.25rem' }}>→</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {stats.courses === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.6 }}>🎓</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            Welcome to LMS!
          </div>
          <div style={{ fontSize: '0.9rem', marginBottom: '24px' }}>
            {user.role === 'teacher' 
              ? 'Create your first course to get started'
              : 'Join a course using an access code'}
          </div>
          <button 
            onClick={() => navigate('/courses')}
            style={{
              padding: '14px 24px',
              backgroundColor: '#3378ff',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {user.role === 'teacher' ? '➕ Create Course' : '🔗 Join Course'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard
