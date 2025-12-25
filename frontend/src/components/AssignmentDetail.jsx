import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function AssignmentDetail({ assignment, user, onBack }) {
  const [submission, setSubmission] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ content: '' })
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [gradingSubmission, setGradingSubmission] = useState(null)

  useEffect(() => {
    loadAssignmentData()
  }, [assignment, user])

  const loadAssignmentData = async () => {
    try {
      if (user.role === 'student') {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/assignments/${assignment.id}/my-submission?telegram_id=${user.telegram_id}`
          )
          setSubmission(response.data)
          setFormData({ content: response.data.content || '' })
        } catch (err) {
          if (err.response?.status !== 404) throw err
        }
      } else {
        const response = await axios.get(`${API_BASE_URL}/assignments/${assignment.id}/submissions`)
        setSubmissions(response.data)
      }
    } catch (error) {
      console.error('Error loading assignment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.content.trim() && !file) {
      setError('Please provide either text content or a file')
      return
    }

    setSubmitting(true)

    try {
      const data = new FormData()
      data.append('telegram_id', user.telegram_id)
      data.append('content', formData.content)
      if (file) data.append('file', file)

      await axios.post(`${API_BASE_URL}/assignments/${assignment.id}/submit`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setSuccess('Assignment submitted successfully!')
      setTimeout(loadAssignmentData, 1000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit assignment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGrade = async (submissionId, grade, feedback) => {
    try {
      await axios.post(`${API_BASE_URL}/assignments/submissions/${submissionId}/grade`, {
        grade,
        feedback,
        telegram_id: user.telegram_id
      })
      setGradingSubmission(null)
      loadAssignmentData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to grade submission')
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading assignment...</div>
      </div>
    )
  }

  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date()

  return (
    <div className="page fade-in">
      {/* Header */}
      <button className="btn btn-ghost" onClick={onBack} style={{ marginLeft: '-0.5rem', marginBottom: '1rem' }}>
        ← Back
      </button>

      {/* Assignment Info Card */}
      <div className="card mb-lg">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
          <div className="card-icon card-icon-primary">📝</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.25rem' }}>
              {assignment.title}
            </h1>
            <div className="card-meta">📚 {assignment.courseName}</div>
          </div>
          <span className="badge badge-info" style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}>
            {assignment.max_points} pts
          </span>
        </div>

        {assignment.description && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem',
            background: 'var(--neutral-50)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap'
          }}>
            {assignment.description}
          </div>
        )}

        <div style={{ 
          marginTop: '1rem', 
          padding: '0.875rem',
          background: isOverdue ? 'rgba(244, 63, 94, 0.1)' : 'var(--primary-50)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>Due Date</div>
            <div style={{ fontSize: '0.9rem', color: isOverdue ? 'var(--danger)' : 'var(--neutral-600)' }}>
              {assignment.due_date 
                ? new Date(assignment.due_date).toLocaleString() 
                : 'No due date'}
            </div>
          </div>
          {isOverdue && <span className="badge badge-danger">Overdue</span>}
        </div>
      </div>

      {/* Student View */}
      {user.role === 'student' && (
        <div>
          {submission ? (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>✅</span> Your Submission
              </h3>
              
              <div className="card-meta mb-md">
                Submitted: {new Date(submission.submitted_at).toLocaleString()}
              </div>
              
              {submission.content && (
                <div style={{ 
                  padding: '1rem',
                  background: 'var(--neutral-50)',
                  borderRadius: 'var(--radius-md)',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9rem',
                  marginBottom: '1rem'
                }}>
                  {submission.content}
                </div>
              )}
              
              {submission.file_path && (
                <a href={`/uploads/${submission.file_path}`} className="btn btn-outline btn-sm mb-md" download>
                  📎 Download submitted file
                </a>
              )}

              {submission.grade !== null ? (
                <div style={{ 
                  marginTop: '1rem',
                  padding: '1.25rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--success)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: '600' }}>Grade</span>
                    <div className="grade-display">
                      <span className="grade-value">{submission.grade}</span>
                      <span style={{ color: 'var(--neutral-500)' }}>/ {assignment.max_points}</span>
                    </div>
                  </div>
                  {submission.feedback && (
                    <div style={{ borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Feedback</div>
                      <p style={{ fontSize: '0.9rem', margin: 0, whiteSpace: 'pre-wrap' }}>{submission.feedback}</p>
                    </div>
                  )}
                  <div className="card-meta mt-md">
                    Graded: {new Date(submission.graded_at).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning">
                  <span>⏳</span>
                  <span>Waiting for grade</span>
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>
                Submit Assignment
              </h3>

              {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}
              {success && <div className="alert alert-success"><span>✅</span>{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Answer</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Type your answer here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows="6"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Attach File (Optional)</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="submission-file"
                      className="file-input"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <label htmlFor="submission-file" className="file-input-label">
                      <span>📎</span>
                      <span>{file ? file.name : 'Choose file to upload'}</span>
                    </label>
                  </div>
                  {file && (
                    <div className="file-selected">
                      ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-success btn-block btn-lg" disabled={submitting}>
                  {submitting ? 'Submitting...' : isOverdue ? '⚠️ Late Submission' : '📤 Submit Assignment'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Teacher View */}
      {user.role === 'teacher' && (
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>
            Student Submissions ({submissions.length})
          </h3>

          {submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No submissions yet</div>
              <div className="empty-state-text">Student submissions will appear here</div>
            </div>
          ) : (
            <div className="flex flex-col gap-md">
              {submissions.map(sub => (
                <div key={sub.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="card-icon card-icon-success" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>👨‍🎓</div>
                      <div>
                        <div className="card-title" style={{ fontSize: '1rem' }}>
                          {sub.first_name} {sub.last_name}
                        </div>
                        {sub.username && <div className="card-meta">@{sub.username}</div>}
                        <div className="card-meta">
                          Submitted: {new Date(sub.submitted_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {sub.grade !== null ? (
                      <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}>
                        {sub.grade}/{assignment.max_points}
                      </span>
                    ) : (
                      <span className="badge badge-warning">Not graded</span>
                    )}
                  </div>

                  {sub.content && (
                    <div style={{ 
                      padding: '0.875rem',
                      background: 'var(--neutral-50)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.9rem'
                    }}>
                      {sub.content}
                    </div>
                  )}

                  {sub.file_path && (
                    <a href={`/uploads/${sub.file_path}`} className="btn btn-sm btn-outline mb-md" download>
                      📎 Download file
                    </a>
                  )}

                  {sub.grade !== null && sub.feedback && (
                    <div style={{ 
                      padding: '0.875rem',
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Your Feedback</div>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{sub.feedback}</p>
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setGradingSubmission(sub)}
                  >
                    {sub.grade !== null ? '✏️ Update Grade' : '📊 Grade Submission'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grade Modal */}
      {gradingSubmission && (
        <GradeModal
          submission={gradingSubmission}
          maxPoints={assignment.max_points}
          onClose={() => setGradingSubmission(null)}
          onGrade={handleGrade}
        />
      )}
    </div>
  )
}

function GradeModal({ submission, maxPoints, onClose, onGrade }) {
  const [grade, setGrade] = useState(submission.grade || '')
  const [feedback, setFeedback] = useState(submission.feedback || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onGrade(submission.id, parseInt(grade), feedback)
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            Grade Submission
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ 
              padding: '0.875rem',
              background: 'var(--neutral-50)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem'
            }}>
              <div style={{ fontWeight: '600' }}>
                {submission.first_name} {submission.last_name}
              </div>
              {submission.username && (
                <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>@{submission.username}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Grade (out of {maxPoints}) *</label>
              <input
                type="number"
                className="form-input"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                min="0"
                max={maxPoints}
                required
                style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: '700' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Feedback (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Provide feedback to the student..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="4"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Saving...' : '✅ Save Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssignmentDetail
