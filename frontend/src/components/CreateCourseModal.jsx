import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

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
      const response = await axios.post(`${API_BASE_URL}/courses`, {
        title: formData.title,
        description: formData.description,
        telegram_id: user.telegram_id
      })
      
      // Show success message with access code
      if (response.data && response.data.access_code) {
        alert(`✅ Course created successfully!\n\nAccess Code: ${response.data.access_code}\n\nShare this code with students to let them join.`)
      }
      
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
          <h2 className="modal-title">Create Course</h2>
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
              <label className="form-label">Course Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Introduction to Programming"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                autoFocus
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
              <div className="form-hint">Describe what students will learn</div>
            </div>

            <div className="alert alert-info">
              <span>💡</span>
              <span>After creating the course, you'll receive a unique access code that students can use to join.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : '➕ Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCourseModal
