import { useState, useEffect } from 'react'
import axios from 'axios'
import CreateCourseModal from './CreateCourseModal'
import JoinCourseModal from './JoinCourseModal'
import CourseDetail from './CourseDetail'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function Courses({ user }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)

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

  const handleCourseCreated = () => {
    setShowCreateModal(false)
    loadCourses()
  }

  const handleCourseJoined = () => {
    setShowJoinModal(false)
    loadCourses()
  }

  if (selectedCourse) {
    return (
      <CourseDetail 
        course={selectedCourse} 
        user={user}
        onBack={() => setSelectedCourse(null)}
        onUpdate={loadCourses}
      />
    )
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
          My Courses
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {user.role === 'teacher' && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              ➕ Create Course
            </button>
          )}
          <button className="btn btn-success" onClick={() => setShowJoinModal(true)}>
            🎓 Join Course
          </button>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-text">
            No courses yet
          </div>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            {user.role === 'teacher'
              ? 'Create a course to teach or join one to learn'
              : 'Join a course with an access code to start learning'}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user.role === 'teacher' && (
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                ➕ Create Course
              </button>
            )}
            <button className="btn btn-success" onClick={() => setShowJoinModal(true)}>
              🎓 Join Course
            </button>
          </div>
        </div>
      ) : (
        <div>
          {courses.map(course => {
            const isTeacher = course.teacher_id === user.id
            return (
              <div key={course.id} className="card" onClick={() => setSelectedCourse(course)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div className="card-title" style={{ marginBottom: 0 }}>{course.title}</div>
                  <span className={`badge ${isTeacher ? 'badge-info' : 'badge-success'}`}>
                    {isTeacher ? '👨‍🏫 Teaching' : '👨‍🎓 Student'}
                  </span>
                </div>
                {course.description && (
                  <div className="card-description">{course.description}</div>
                )}
                <div className="card-footer">
                  <div className="card-meta">
                    {isTeacher ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>🔑 Code:</span>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>{course.access_code}</strong>
                        </div>
                        <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                          Created {new Date(course.created_at).toLocaleDateString()}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        📅 Enrolled {new Date(course.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <button className="btn btn-small btn-primary" onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCourse(course)
                  }}>
                    Open →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateCourseModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCourseCreated}
        />
      )}

      {showJoinModal && (
        <JoinCourseModal
          user={user}
          onClose={() => setShowJoinModal(false)}
          onSuccess={handleCourseJoined}
        />
      )}
    </div>
  )
}

export default Courses

