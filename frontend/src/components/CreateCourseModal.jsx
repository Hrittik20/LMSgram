import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = '/api'

function CreateCourseModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Course title is required')
      return
    }

    setLoading(true)

    try {
      await axios.post(`${API_BASE_URL}/courses`, {
        title: formData.title,
        description: formData.description,
        telegram_id: user.telegram_id
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Course</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Course Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Introduction to Programming"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Brief description of the course..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
              />
            </div>

            <div style={{ padding: '0.75rem', background: 'var(--tg-theme-secondary-bg-color)', borderRadius: '8px', fontSize: '0.9rem' }}>
              💡 After creating the course, you'll receive a unique access code that students can use to join.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCourseModal

