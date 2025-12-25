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
      setComments(res.data || [])
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
      {/* Announcement Content */}
      <div className="announcement-header">
        <div className="flex gap-md">
          <div className="card-icon card-icon-warning">📢</div>
          <div style={{ flex: 1 }}>
            <div className="announcement-title">{announcement.title}</div>
            <div className="announcement-content">{announcement.content}</div>
            <div className="announcement-meta">📅 {formatDate(announcement.created_at)}</div>
          </div>
        </div>
      </div>

      {/* Comments Toggle */}
      <div className="announcement-footer">
        <button className="comments-toggle" onClick={() => setShowComments(!showComments)}>
          <span>💬</span>
          <span>{showComments ? 'Hide' : 'Show'} Comments</span>
          {comments.length > 0 && <span className="badge badge-primary">{comments.length}</span>}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section fade-in">
          {commentLoading ? (
            <div className="text-center text-muted" style={{ padding: '1rem' }}>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '1rem' }}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="mb-md">
              {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-author">
                      {comment.first_name} {comment.last_name || ''}
                      {comment.role === 'teacher' && (
                        <span className="badge badge-primary teacher-badge">Teacher</span>
                      )}
                    </div>
                    {comment.user_id === user.id && (
                      <button
                        className="btn btn-icon-only btn-ghost"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Delete comment"
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

          {/* Comment Form - Available to everyone */}
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
