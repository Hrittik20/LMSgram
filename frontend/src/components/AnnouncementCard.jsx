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

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div className="card-title">{announcement.title}</div>
      <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{announcement.content}</p>
      <div className="card-meta" style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#666' }}>
        {new Date(announcement.created_at).toLocaleString()}
      </div>

      <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.75rem' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setShowComments(!showComments)}
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
        >
          {showComments ? '👁️ Hide' : '💬 Show'} Comments ({comments.length})
        </button>

        {showComments && (
          <div style={{ marginTop: '1rem' }}>
            {commentLoading ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>Loading comments...</div>
            ) : comments.length === 0 ? (
              <div style={{ color: '#666', fontSize: '0.9rem', padding: '0.5rem' }}>
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div style={{ marginBottom: '1rem' }}>
                {comments.map(comment => (
                  <div
                    key={comment.id}
                    style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '4px',
                      borderLeft: '3px solid #007bff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {comment.first_name} {comment.last_name || ''}
                          {comment.role === 'teacher' && ' 👨‍🏫'}
                        </div>
                        <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#666' }}>
                          {comment.content}
                        </div>
                        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#999' }}>
                          {new Date(comment.created_at).toLocaleString()}
                        </div>
                      </div>
                      {comment.user_id === user.id && (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', marginLeft: '0.5rem' }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmitComment} style={{ marginTop: '1rem' }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !newComment.trim()}
                style={{ marginTop: '0.5rem' }}
              >
                {loading ? 'Posting...' : '💬 Post Comment'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnnouncementCard

