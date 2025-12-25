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
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '14px',
      overflow: 'hidden',
      marginBottom: '16px'
    }}>
      {/* Announcement Content */}
      <div style={{
        padding: '16px',
        borderLeft: '4px solid #f59e0b'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: 'rgba(245, 158, 11, 0.15)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            flexShrink: 0
          }}>
            📢
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '1.05rem', 
              fontWeight: '700', 
              color: '#111827',
              marginBottom: '8px' 
            }}>
              {announcement.title}
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#4b5563',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}>
              {announcement.content}
            </div>
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#9ca3af',
              marginTop: '12px' 
            }}>
              📅 {formatDate(announcement.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Toggle */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #f3f4f6'
      }}>
        <button 
          onClick={() => setShowComments(!showComments)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#6b7280',
            fontSize: '0.85rem',
            fontWeight: '500',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <span>💬</span>
          <span>{showComments ? 'Hide' : 'Show'} Comments</span>
          {comments.length > 0 && (
            <span style={{
              backgroundColor: '#eef5ff',
              color: '#3378ff',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '0.7rem',
              fontWeight: '600'
            }}>
              {comments.length}
            </span>
          )}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb'
        }}>
          {commentLoading ? (
            <div style={{ textAlign: 'center', padding: '16px', color: '#6b7280' }}>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '16px', 
              color: '#6b7280',
              fontSize: '0.9rem'
            }}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              {comments.map(comment => (
                <div 
                  key={comment.id} 
                  style={{
                    padding: '12px',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    marginBottom: '8px',
                    borderLeft: '3px solid #3378ff'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: '600',
                      color: '#111827'
                    }}>
                      {comment.first_name} {comment.last_name || ''}
                      {comment.role === 'teacher' && (
                        <span style={{
                          marginLeft: '8px',
                          backgroundColor: '#eef5ff',
                          color: '#3378ff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          Teacher
                        </span>
                      )}
                    </div>
                    {comment.user_id === user.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        style={{ 
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          color: '#9ca3af',
                          padding: '4px'
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: '#4b5563',
                    lineHeight: 1.5
                  }}>
                    {comment.content}
                  </div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    color: '#9ca3af',
                    marginTop: '6px'
                  }}>
                    {formatDate(comment.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows="2"
              style={{
                width: '100%',
                minHeight: '70px',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                backgroundColor: '#ffffff',
                color: '#111827'
              }}
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              style={{
                marginTop: '8px',
                padding: '10px 16px',
                backgroundColor: loading || !newComment.trim() ? '#9ca3af' : '#3378ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: loading || !newComment.trim() ? 'not-allowed' : 'pointer'
              }}
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
