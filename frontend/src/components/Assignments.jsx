import { useState, useEffect } from 'react'
import axios from 'axios'
import AssignmentDetail from './AssignmentDetail'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function Assignments({ user }) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  useEffect(() => {
    loadAssignments()
  }, [user])

  const loadAssignments = async () => {
    try {
      // First get all courses
      const coursesRes = await axios.get(`${API_BASE_URL}/courses?telegram_id=${user.telegram_id}`)
      const courses = coursesRes.data

      // Then get assignments for each course
      let allAssignments = []
      for (const course of courses) {
        const assignmentsRes = await axios.get(`${API_BASE_URL}/assignments/course/${course.id}`)
        allAssignments = [
          ...allAssignments,
          ...assignmentsRes.data.map(a => ({ ...a, courseName: course.title, courseId: course.id }))
        ]
      }

      // Sort by due date
      allAssignments.sort((a, b) => {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date) - new Date(b.due_date)
      })

      setAssignments(allAssignments)
    } catch (error) {
      console.error('Error loading assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (selectedAssignment) {
    return (
      <AssignmentDetail
        assignment={selectedAssignment}
        user={user}
        onBack={() => {
          setSelectedAssignment(null)
          loadAssignments()
        }}
      />
    )
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  const today = new Date()
  const upcomingAssignments = assignments.filter(a => {
    if (!a.due_date) return false
    return new Date(a.due_date) >= today
  })
  const pastAssignments = assignments.filter(a => {
    if (!a.due_date) return true
    return new Date(a.due_date) < today
  })

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>All Assignments</h2>

      {assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-text">No assignments yet</div>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {user.role === 'teacher'
              ? 'Create assignments in your courses'
              : 'Assignments will appear here when teachers post them'}
          </p>
        </div>
      ) : (
        <>
          {upcomingAssignments.length > 0 && (
            <>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                📌 Upcoming & Active
              </h3>
              {upcomingAssignments.map(assignment => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onClick={() => setSelectedAssignment(assignment)}
                />
              ))}
            </>
          )}

          {pastAssignments.length > 0 && (
            <>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '2rem', color: 'var(--text-secondary)' }}>
                📋 Past Assignments
              </h3>
              {pastAssignments.map(assignment => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onClick={() => setSelectedAssignment(assignment)}
                  isPast
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}

function AssignmentCard({ assignment, onClick, isPast = false }) {
  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date()
  
  return (
    <div className="card" onClick={onClick} style={{ cursor: 'pointer', opacity: isPast ? 0.7 : 1 }}>
      <div className="assignment-item">
        <div className="assignment-info">
          <div className="card-title">{assignment.title}</div>
          <div className="card-meta" style={{ marginTop: '0.25rem' }}>
            📚 {assignment.courseName}
          </div>
          {assignment.due_date && (
            <div className="assignment-due">
              <span>⏰</span>
              <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
              {isOverdue && <span className="badge badge-danger">Overdue</span>}
            </div>
          )}
        </div>
        <div className="assignment-actions">
          <button className="btn btn-small btn-primary" onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}>
            View
          </button>
        </div>
      </div>
    </div>
  )
}

export default Assignments

