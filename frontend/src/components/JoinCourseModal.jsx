import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function JoinCourseModal({ user, onClose, onSuccess }) {
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!accessCode.trim()) {
      setError('Access code is required')
      return
    }

    setLoading(true)

    try {
      await axios.post(`${API_BASE_URL}/courses/join`, {
        access_code: accessCode.toUpperCase(),
        telegram_id: user.telegram_id
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Join Course</h2>
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
              <label className="form-label">Access Code *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter 8-character code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                style={{ 
                  textTransform: 'uppercase', 
                  letterSpacing: '4px', 
                  fontSize: '1.25rem', 
                  textAlign: 'center',
                  fontWeight: '700',
                  fontFamily: 'var(--font-mono)'
                }}
                required
                maxLength={8}
                autoFocus
              />
              <div className="form-hint text-center">Ask your teacher for the access code</div>
            </div>

            <div className="alert alert-info">
              <span>💡</span>
              <span>Access codes are 8-character codes provided by teachers to let students join their courses.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || accessCode.length < 6}>
              {loading ? 'Joining...' : '🔗 Join Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JoinCourseModal
