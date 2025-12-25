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
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading courses...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    fontSize: '0.95rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer'
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
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: '#111827' }}>
          My Courses
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '4px 0 0 0' }}>
          {courses.length === 0 
            ? 'Get started by creating or joining a course'
            : `${courses.length} course${courses.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {user.role === 'teacher' && (
          <button 
            style={{ ...buttonStyle, backgroundColor: '#3378ff', color: 'white' }}
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Create Course
          </button>
        )}
        <button 
          style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151', border: '2px solid #3378ff' }}
          onClick={() => setShowJoinModal(true)}
        >
          🔗 Join Course
        </button>
      </div>

      {/* Course List */}
      {courses.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.6 }}>📚</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            No courses yet
          </div>
          <div style={{ fontSize: '0.9rem', marginBottom: '24px' }}>
            {user.role === 'teacher'
              ? 'Create your first course to start teaching'
              : 'Join a course using an access code'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {courses.map(course => (
            <div 
              key={course.id} 
              onClick={() => setSelectedCourse(course)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '14px',
                padding: '16px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #3378ff, #8b5cf6)'
              }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  background: 'linear-gradient(135deg, #eef5ff, #f9fafb)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  📖
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '1.1rem',
                    color: '#111827',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {course.title}
                  </div>
                  {course.description && (
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#6b7280',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {course.description}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #f3f4f6'
              }}>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  📅 {new Date(course.created_at).toLocaleDateString()}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '1.2rem' }}>→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateCourseModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={async () => {
            setShowCreateModal(false)
            await loadCourses()
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
