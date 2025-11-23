import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = '/api'

function AssignmentDetail({ assignment, user, onBack }) {
  const [submission, setSubmission] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    content: ''
  })
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
        // Load student's own submission
        try {
          const response = await axios.get(
            `${API_BASE_URL}/assignments/${assignment.id}/my-submission?telegram_id=${user.telegram_id}`
          )
          setSubmission(response.data)
          setFormData({ content: response.data.content || '' })
        } catch (err) {
          if (err.response?.status !== 404) {
            throw err
          }
        }
      } else {
        // Load all submissions for teacher
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
      if (file) {
        data.append('file', file)
      }

      await axios.post(`${API_BASE_URL}/assignments/${assignment.id}/submit`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setSuccess('Assignment submitted successfully!')
      setTimeout(() => {
        loadAssignmentData()
      }, 1000)
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
    return <div className="loading"><div className="spinner"></div></div>
  }

  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date()
  const canSubmit = user.role === 'student' && (!isOverdue || !submission)

  return (
    <div>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {assignment.title}
            </h2>
            <div className="card-meta">📚 {assignment.courseName}</div>
          </div>
          <div className="badge badge-info" style={{ fontSize: '0.9rem' }}>
            {assignment.max_points} points
          </div>
        </div>

        {assignment.description && (
          <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {assignment.description}
          </div>
        )}

        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--tg-theme-secondary-bg-color)', borderRadius: '8px' }}>
          {assignment.due_date ? (
            <div>
              <strong>Due Date:</strong> {new Date(assignment.due_date).toLocaleString()}
              {isOverdue && <span className="badge badge-danger" style={{ marginLeft: '0.5rem' }}>Overdue</span>}
            </div>
          ) : (
            <div><strong>No due date</strong></div>
          )}
        </div>
      </div>

      {user.role === 'student' && (
        <div>
          {submission ? (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>Your Submission</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <div className="card-meta" style={{ marginBottom: '0.5rem' }}>
                  Submitted: {new Date(submission.submitted_at).toLocaleString()}
                </div>
                {submission.content && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--tg-theme-secondary-bg-color)', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                    {submission.content}
                  </div>
                )}
                {submission.file_path && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <a href={`/uploads/${submission.file_path}`} className="btn btn-secondary" download>
                      📎 Download submitted file
                    </a>
                  </div>
                )}
              </div>

              {submission.grade !== null ? (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#e8f5e9', borderRadius: '8px', border: '2px solid var(--success-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '1.1rem' }}>Grade:</strong>
                    <div className="grade-display">
                      <span className="grade-value">{submission.grade}</span>
                      <span>/ {assignment.max_points}</span>
                    </div>
                  </div>
                  {submission.feedback && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #c8e6c9' }}>
                      <strong>Feedback:</strong>
                      <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{submission.feedback}</p>
                    </div>
                  )}
                  <div className="card-meta" style={{ marginTop: '0.75rem' }}>
                    Graded: {new Date(submission.graded_at).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '0.75rem', background: '#fff3e0', borderRadius: '8px', textAlign: 'center' }}>
                  ⏳ Waiting for grade
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>Submit Assignment</h3>

              {error && (
                <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ padding: '0.75rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', marginBottom: '1rem' }}>
                  {success}
                </div>
              )}

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
                      <span>{file ? file.name : 'Choose file'}</span>
                    </label>
                  </div>
                  {file && (
                    <div className="file-selected">
                      ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-success btn-block" disabled={submitting || !canSubmit}>
                  {submitting ? 'Submitting...' : isOverdue ? 'Late Submission' : 'Submit Assignment'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {user.role === 'teacher' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            Student Submissions ({submissions.length})
          </h3>

          {submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-text">No submissions yet</div>
            </div>
          ) : (
            submissions.map(sub => (
              <div key={sub.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <div className="card-title">
                      {sub.first_name} {sub.last_name}
                    </div>
                    {sub.username && (
                      <div className="card-meta">@{sub.username}</div>
                    )}
                    <div className="card-meta" style={{ marginTop: '0.25rem' }}>
                      Submitted: {new Date(sub.submitted_at).toLocaleString()}
                    </div>
                  </div>
                  {sub.grade !== null ? (
                    <div className="badge badge-success" style={{ fontSize: '1rem', padding: '0.5rem 0.875rem' }}>
                      {sub.grade}/{assignment.max_points}
                    </div>
                  ) : (
                    <div className="badge badge-warning">Not graded</div>
                  )}
                </div>

                {sub.content && (
                  <div style={{ padding: '0.75rem', background: 'var(--tg-theme-secondary-bg-color)', borderRadius: '8px', marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
                    {sub.content}
                  </div>
                )}

                {sub.file_path && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <a href={`/uploads/${sub.file_path}`} className="btn btn-small btn-secondary" download>
                      📎 Download file
                    </a>
                  </div>
                )}

                {sub.grade !== null && sub.feedback && (
                  <div style={{ padding: '0.75rem', background: '#e8f5e9', borderRadius: '8px', marginBottom: '0.75rem' }}>
                    <strong>Feedback:</strong>
                    <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{sub.feedback}</p>
                  </div>
                )}

                <button
                  className="btn btn-primary btn-small"
                  onClick={() => setGradingSubmission(sub)}
                >
                  {sub.grade !== null ? 'Update Grade' : 'Grade Submission'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

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
            Grade: {submission.first_name} {submission.last_name}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
                style={{ fontSize: '1.2rem', textAlign: 'center' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Feedback</label>
              <textarea
                className="form-textarea"
                placeholder="Provide feedback to the student..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="5"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssignmentDetail

