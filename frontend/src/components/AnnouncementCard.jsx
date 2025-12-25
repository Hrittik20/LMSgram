import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function AnnouncementCard({ announcement, user, onUpdate }) {
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    if (showComments) {
      loadComments()
    }
  }, [showComments, announcement.id])

  const loadComments = async () => {
    try {
      setCommentLoading(true)
      const res = await axios.get(`${API_BASE_URL}/comments/announcement/${announcement.id}`)
      setComments(res.data)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setCommentLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setLoading(true)
      await axios.post(`${API_BASE_URL}/comments`, {
        announcement_id: announcement.id,
        content: newComment,
        telegram_id: user.telegram_id
      })
      setNewComment('')
      loadComments()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error posting comment:', error)
      alert(error.response?.data?.error || 'Failed to post comment')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return

    try {
      await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
        data: { telegram_id: user.telegram_id }
      })
      loadComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert(error.response?.data?.error || 'Failed to delete comment')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="announcement-card">
      <div className="announcement-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: 'rgba(245, 158, 11, 0.15)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            flexShrink: 0
          }}>
            📢
          </div>
          <div style={{ flex: 1 }}>
            <div className="announcement-title">{announcement.title}</div>
            <div className="announcement-content">{announcement.content}</div>
            <div className="announcement-meta">
              📅 {formatDate(announcement.created_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="announcement-footer">
        <button className="comments-toggle" onClick={() => setShowComments(!showComments)}>
          <span>💬</span>
          <span>{showComments ? 'Hide' : 'Show'} Comments</span>
          {comments.length > 0 && <span className="badge badge-primary">{comments.length}</span>}
        </button>
      </div>

      {showComments && (
        <div className="comments-section fade-in">
          {commentLoading ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--neutral-500)' }}>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem', 
              color: 'var(--neutral-500)',
              fontSize: '0.9rem'
            }}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div style={{ marginBottom: '1rem' }}>
              {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-author">
                      {comment.first_name} {comment.last_name || ''}
                      {comment.role === 'teacher' && (
                        <span className="teacher-badge badge badge-primary">Teacher</span>
                      )}
                    </div>
                    {comment.user_id === user.id && (
                      <button
                        className="btn btn-icon-only btn-ghost"
                        onClick={() => handleDeleteComment(comment.id)}
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          fontSize: '0.8rem',
                          color: 'var(--neutral-400)'
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <div className="comment-content">{comment.content}</div>
                  <div className="comment-time">{formatDate(comment.created_at)}</div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows="2"
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm mt-sm"
              disabled={loading || !newComment.trim()}
            >
              {loading ? 'Posting...' : '💬 Post Comment'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default AnnouncementCard
