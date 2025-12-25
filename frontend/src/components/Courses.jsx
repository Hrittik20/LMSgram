import { useState, useEffect } from 'react'
import axios from 'axios'
import CourseDetail from './CourseDetail'
import CreateCourseModal from './CreateCourseModal'
import JoinCourseModal from './JoinCourseModal'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function Courses({ user }) {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [filter, setFilter] = useState('all') // all, teaching, enrolled

  useEffect(() => {
    loadCourses()
  }, [user])

  const loadCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses?telegram_id=${user.telegram_id}`)
      setCourses(response.data)
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        user={user}
        onBack={() => {
          setSelectedCourse(null)
          loadCourses()
        }}
        onUpdate={loadCourses}
      />
    )
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  // Filter courses based on user role and filter
  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true
    if (filter === 'teaching' && user.role === 'teacher') {
      // Check if user is teacher of this course (would need API call, simplified for now)
      return true // Simplified - in real app, check course_teachers
    }
    return true
  })

  return (
    <div className="fade-in">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>My Courses</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {user.role === 'teacher' && (
            <button 
              className="btn btn-primary" 
              onClick={() => setShowCreateModal(true)}
              style={{ whiteSpace: 'nowrap' }}
            >
              ➕ Create Course
            </button>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowJoinModal(true)}
            style={{ whiteSpace: 'nowrap' }}
          >
            🔗 Join Course
          </button>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-text">No courses yet</div>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            {user.role === 'teacher'
              ? 'Create your first course to get started, or join an existing one'
              : 'Join a course using an access code from your teacher'}
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {user.role === 'teacher' && (
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                ➕ Create Your First Course
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => setShowJoinModal(true)}>
              🔗 Join a Course
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ 
            display: 'grid', 
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
          }}>
            {filteredCourses.map(course => (
              <div 
                key={course.id} 
                className="card" 
                onClick={() => setSelectedCourse(course)} 
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    flexShrink: 0,
                    background: 'var(--tg-theme-secondary-bg-color)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    📚
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-title" style={{ 
                      marginBottom: '0.5rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {course.title}
                    </div>
                    {course.description && (
                      <div className="card-description" style={{ 
                        marginTop: '0.5rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {course.description}
                      </div>
                    )}
                    <div className="card-meta" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>📅</span>
                      <span>{new Date(course.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div style={{ 
                  marginTop: '1rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Click to view details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showCreateModal && (
        <CreateCourseModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadCourses()
          }}
        />
      )}

      {showJoinModal && (
        <JoinCourseModal
          user={user}
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            setShowJoinModal(false)
            loadCourses()
          }}
        />
      )}
    </div>
  )
}

export default Courses
