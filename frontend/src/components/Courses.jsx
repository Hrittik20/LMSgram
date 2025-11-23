import { useState, useEffect } from 'react'
import axios from 'axios'
import CreateCourseModal from './CreateCourseModal'
import JoinCourseModal from './JoinCourseModal'
import CourseDetail from './CourseDetail'

const API_BASE_URL = '/api'

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>
          {user.role === 'teacher' ? 'My Courses' : 'Enrolled Courses'}
        </h2>
        {user.role === 'teacher' ? (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            ➕ Create Course
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setShowJoinModal(true)}>
            🔍 Join Course
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-text">
            {user.role === 'teacher' 
              ? 'No courses yet' 
              : 'Not enrolled in any courses'}
          </div>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            {user.role === 'teacher'
              ? 'Create your first course to start teaching'
              : 'Join a course with an access code to start learning'}
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => user.role === 'teacher' ? setShowCreateModal(true) : setShowJoinModal(true)}
          >
            {user.role === 'teacher' ? '➕ Create Course' : '🔍 Join Course'}
          </button>
        </div>
      ) : (
        <div>
          {courses.map(course => (
            <div key={course.id} className="card" onClick={() => setSelectedCourse(course)} style={{ cursor: 'pointer' }}>
              <div className="card-title">{course.title}</div>
              {course.description && (
                <div className="card-description">{course.description}</div>
              )}
              <div className="card-footer">
                <div className="card-meta">
                  {user.role === 'teacher' ? (
                    <>
                      <div>Access Code: <strong>{course.access_code}</strong></div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        Created {new Date(course.created_at).toLocaleDateString()}
                      </div>
                    </>
                  ) : (
                    <div>
                      Enrolled {new Date(course.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button className="btn btn-small btn-primary" onClick={(e) => {
                  e.stopPropagation()
                  setSelectedCourse(course)
                }}>
                  View →
                </button>
              </div>
            </div>
          ))}
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

