import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function CreateAssignmentModal({ course, user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    max_points: 100
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Assignment title is required')
      return
    }

    setLoading(true)

    try {
      await axios.post(`${API_BASE_URL}/assignments`, {
        course_id: course.id,
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date || null,
        max_points: formData.max_points,
        telegram_id: user.telegram_id
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create Assignment</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Assignment Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Week 1 Homework"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Instructions</label>
              <textarea
                className="form-textarea"
                placeholder="Describe the assignment requirements..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Max Points</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.max_points}
                  onChange={(e) => setFormData({ ...formData, max_points: parseInt(e.target.value) || 100 })}
                  min="1"
                  max="1000"
                />
              </div>
            </div>

            <div className="alert alert-info">
              <span>📢</span>
              <span>Students will be notified about this new assignment via Telegram.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : '➕ Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateAssignmentModal
