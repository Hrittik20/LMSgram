import { useState, useEffect } from 'react'
import axios from 'axios'
import AssignmentDetail from './AssignmentDetail'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function Assignments({ user }) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadAssignments()
  }, [user])

  const loadAssignments = async () => {
    try {
      const coursesRes = await axios.get(`${API_BASE_URL}/courses?telegram_id=${user.telegram_id}`)
      const courses = coursesRes.data

      let allAssignments = []
      for (const course of courses) {
        const assignmentsRes = await axios.get(`${API_BASE_URL}/assignments/course/${course.id}`)
        allAssignments = [
          ...allAssignments,
          ...assignmentsRes.data.map(a => ({ ...a, courseName: course.title, courseId: course.id }))
        ]
      }

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
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading assignments...</div>
      </div>
    )
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

  const filteredAssignments = filter === 'upcoming' 
    ? upcomingAssignments 
    : filter === 'past' 
    ? pastAssignments 
    : assignments

  return (
    <div className="page fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">Assignments</div>
        <div className="page-subtitle">
          {assignments.length === 0 
            ? 'Your assignments will appear here'
            : `${upcomingAssignments.length} upcoming, ${pastAssignments.length} past`}
        </div>
      </div>

      {/* Filter Tabs */}
      {assignments.length > 0 && (
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({assignments.length})
          </button>
          <button 
            className={`nav-tab ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            📌 Upcoming ({upcomingAssignments.length})
          </button>
          <button 
            className={`nav-tab ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            ✅ Past ({pastAssignments.length})
          </button>
        </div>
      )}

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No assignments yet</div>
          <div className="empty-state-text">
            {user.role === 'teacher'
              ? 'Create assignments in your courses'
              : 'Assignments will appear here when teachers post them'}
          </div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{filter === 'upcoming' ? '🎉' : '📋'}</div>
          <div className="empty-state-title">
            {filter === 'upcoming' ? 'All caught up!' : 'No past assignments'}
          </div>
          <div className="empty-state-text">
            {filter === 'upcoming' 
              ? 'You have no upcoming assignments' 
              : 'Past assignments will appear here'}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-sm">
          {filteredAssignments.map(assignment => {
            const isOverdue = assignment.due_date && new Date(assignment.due_date) < today
            const daysUntilDue = assignment.due_date 
              ? Math.ceil((new Date(assignment.due_date) - today) / (1000 * 60 * 60 * 24))
              : null

            return (
              <div 
                key={assignment.id} 
                className="card card-clickable"
                onClick={() => setSelectedAssignment(assignment)}
                style={{ opacity: isOverdue ? 0.7 : 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className="card-icon" style={{ 
                    background: isOverdue 
                      ? 'rgba(244, 63, 94, 0.15)' 
                      : daysUntilDue !== null && daysUntilDue <= 2 
                      ? 'rgba(245, 158, 11, 0.15)' 
                      : 'var(--primary-100)'
                  }}>
                    📝
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-title">{assignment.title}</div>
                    <div className="card-meta mt-sm">
                      <span>📚 {assignment.courseName}</span>
                    </div>
                    {assignment.due_date && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        marginTop: '0.5rem',
                        fontSize: '0.8rem',
                        color: isOverdue ? 'var(--danger)' : daysUntilDue <= 2 ? 'var(--warning)' : 'var(--neutral-500)'
                      }}>
                        <span>⏰</span>
                        <span>
                          {isOverdue 
                            ? 'Overdue' 
                            : daysUntilDue === 0 
                            ? 'Due today' 
                            : daysUntilDue === 1 
                            ? 'Due tomorrow' 
                            : `Due in ${daysUntilDue} days`}
                        </span>
                        {isOverdue && <span className="badge badge-danger">Late</span>}
                        {!isOverdue && daysUntilDue !== null && daysUntilDue <= 2 && (
                          <span className="badge badge-warning">Soon</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span className="badge badge-info">{assignment.max_points} pts</span>
                    <span style={{ color: 'var(--neutral-400)', fontSize: '1.25rem' }}>→</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Assignments
