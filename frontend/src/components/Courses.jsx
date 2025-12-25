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
      <div className="loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading courses...</div>
      </div>
    )
  }

  return (
    <div className="page fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">My Courses</div>
        <div className="page-subtitle">
          {courses.length === 0 
            ? 'Get started by creating or joining a course'
            : `${courses.length} course${courses.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-md mb-lg">
        {user.role === 'teacher' && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            ➕ Create Course
          </button>
        )}
        <button className="btn btn-outline" onClick={() => setShowJoinModal(true)}>
          🔗 Join Course
        </button>
      </div>

      {/* Course List */}
      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-title">No courses yet</div>
          <div className="empty-state-text">
            {user.role === 'teacher'
              ? 'Create your first course to start teaching'
              : 'Join a course using an access code'}
          </div>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map(course => (
            <div 
              key={course.id} 
              className="course-card"
              onClick={() => setSelectedCourse(course)}
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
              <div className="course-card-footer">
                <span className="course-card-meta">
                  📅 {new Date(course.created_at).toLocaleDateString()}
                </span>
                <span className="course-card-arrow">→</span>
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
          onSuccess={(newCourse) => {
            setShowCreateModal(false)
            loadCourses()
            if (newCourse) {
              setSelectedCourse(newCourse)
            }
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
