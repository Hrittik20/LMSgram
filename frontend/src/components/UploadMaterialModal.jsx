import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = '/api'

function UploadMaterialModal({ course, user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: ''
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB')
        return
      }
      setFile(selectedFile)
      if (!formData.title) {
        setFormData({ title: selectedFile.name })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim() || !file) {
      setError('Title and file are required')
      return
    }

    setLoading(true)

    try {
      const data = new FormData()
      data.append('file', file)
      data.append('title', formData.title)
      data.append('course_id', course.id)
      data.append('telegram_id', user.telegram_id)

      await axios.post(`${API_BASE_URL}/materials`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload material')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Upload Material</h2>
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
              <label className="form-label">Material Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Lecture Notes - Week 1"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">File *</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="material-file"
                  className="file-input"
                  onChange={handleFileChange}
                  required
                />
                <label htmlFor="material-file" className="file-input-label">
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

            <div style={{ padding: '0.75rem', background: 'var(--tg-theme-secondary-bg-color)', borderRadius: '8px', fontSize: '0.9rem' }}>
              📁 Maximum file size: 50MB
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadMaterialModal

