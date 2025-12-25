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
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading assignments...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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

  const getTabStyle = (isActive) => ({
    flex: 1,
    padding: '10px 12px',
    background: isActive ? '#ffffff' : 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: isActive ? '#3378ff' : '#6b7280',
    fontSize: '0.85rem',
    fontWeight: isActive ? '600' : '500',
    cursor: 'pointer',
    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
  })

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
          Assignments
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '4px 0 0 0' }}>
          {assignments.length === 0 
            ? 'Your assignments will appear here'
            : `${upcomingAssignments.length} upcoming, ${pastAssignments.length} past`}
        </p>
      </div>

      {/* Filter Tabs */}
      {assignments.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '4px',
          backgroundColor: '#f3f4f6',
          padding: '4px',
          borderRadius: '14px',
          marginBottom: '16px'
        }}>
          <button style={getTabStyle(filter === 'all')} onClick={() => setFilter('all')}>
            All ({assignments.length})
          </button>
          <button style={getTabStyle(filter === 'upcoming')} onClick={() => setFilter('upcoming')}>
            📌 Upcoming ({upcomingAssignments.length})
          </button>
          <button style={getTabStyle(filter === 'past')} onClick={() => setFilter('past')}>
            ✅ Past ({pastAssignments.length})
          </button>
        </div>
      )}

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.6 }}>📝</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            No assignments yet
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            {user.role === 'teacher'
              ? 'Create assignments in your courses'
              : 'Assignments will appear here when posted'}
          </div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.6 }}>
            {filter === 'upcoming' ? '🎉' : '📋'}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            {filter === 'upcoming' ? 'All caught up!' : 'No past assignments'}
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            {filter === 'upcoming' 
              ? 'You have no upcoming assignments' 
              : 'Past assignments will appear here'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAssignments.map(assignment => {
            const isOverdue = assignment.due_date && new Date(assignment.due_date) < today
            const daysUntilDue = assignment.due_date 
              ? Math.ceil((new Date(assignment.due_date) - today) / (1000 * 60 * 60 * 24))
              : null

            return (
              <div 
                key={assignment.id} 
                onClick={() => setSelectedAssignment(assignment)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '14px',
                  padding: '16px',
                  cursor: 'pointer',
                  opacity: isOverdue ? 0.8 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                    background: isOverdue 
                      ? 'rgba(244, 63, 94, 0.15)' 
                      : daysUntilDue !== null && daysUntilDue <= 2 
                      ? 'rgba(245, 158, 11, 0.15)' 
                      : '#eef5ff'
                  }}>
                    📝
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      {assignment.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>
                      📚 {assignment.courseName}
                    </div>
                    {assignment.due_date && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        marginTop: '8px',
                        fontSize: '0.8rem',
                        color: isOverdue ? '#f43f5e' : daysUntilDue <= 2 ? '#f59e0b' : '#6b7280'
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
                        {isOverdue && (
                          <span style={{
                            backgroundColor: 'rgba(244, 63, 94, 0.15)',
                            color: '#f43f5e',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: '600'
                          }}>Late</span>
                        )}
                        {!isOverdue && daysUntilDue !== null && daysUntilDue <= 2 && (
                          <span style={{
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: '600'
                          }}>Soon</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{
                      backgroundColor: '#eef5ff',
                      color: '#3378ff',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>{assignment.max_points} pts</span>
                    <span style={{ color: '#9ca3af', fontSize: '1.25rem' }}>→</span>
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
