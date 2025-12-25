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
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem' }}>My Courses</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {user.role === 'teacher' && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              ➕ Create Course
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => setShowJoinModal(true)}>
            🔗 Join Course
          </button>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-text">No courses yet</div>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {user.role === 'teacher'
              ? 'Create your first course or join an existing one'
              : 'Join a course using an access code'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {courses.map(course => (
            <div key={course.id} className="card" onClick={() => setSelectedCourse(course)} style={{ cursor: 'pointer' }}>
              <div className="card-title">{course.title}</div>
              {course.description && (
                <div className="card-description" style={{ marginTop: '0.5rem' }}>
                  {course.description}
                </div>
              )}
              <div className="card-meta" style={{ marginTop: '0.75rem' }}>
                Created {new Date(course.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
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
