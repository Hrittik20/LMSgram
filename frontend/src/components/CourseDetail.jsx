import { useState, useEffect } from 'react'
import axios from 'axios'
import CreateAssignmentModal from './CreateAssignmentModal'
import CreateAnnouncementModal from './CreateAnnouncementModal'
import UploadMaterialModal from './UploadMaterialModal'
import AnnouncementCard from './AnnouncementCard'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function CourseDetail({ course, user, onBack, onUpdate }) {
  const [activeTab, setActiveTab] = useState('assignments')
  const [assignments, setAssignments] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [materials, setMaterials] = useState([])
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [isCourseTeacher, setIsCourseTeacher] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false)
  const [showUploadMaterial, setShowUploadMaterial] = useState(false)

  useEffect(() => {
    loadCourseData()
  }, [course])

  const loadCourseData = async () => {
    try {
      const [assignmentsRes, announcementsRes, materialsRes, studentsRes, teachersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/assignments/course/${course.id}`),
        axios.get(`${API_BASE_URL}/announcements/course/${course.id}`),
        axios.get(`${API_BASE_URL}/materials/course/${course.id}`),
        user.role === 'teacher' ? axios.get(`${API_BASE_URL}/courses/${course.id}/students`) : Promise.resolve({ data: [] }),
        axios.get(`${API_BASE_URL}/courses/${course.id}/teachers`)
      ])

      setAssignments(assignmentsRes.data)
      setAnnouncements(announcementsRes.data)
      setMaterials(materialsRes.data)
      setStudents(studentsRes.data)
      setTeachers(teachersRes.data)
      
      const isTeacher = teachersRes.data.some(t => t.id === user.id) || user.role === 'teacher'
      setIsCourseTeacher(isTeacher)
    } catch (error) {
      console.error('Error loading course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const isTeacherUser = user.role === 'teacher' || isCourseTeacher

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#3378ff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading course...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const tabs = [
    { id: 'assignments', label: '📝 Tasks', count: assignments.length },
    { id: 'announcements', label: '📢 News', count: announcements.length },
    { id: 'materials', label: '📁 Files', count: materials.length }
  ]

  if (isTeacherUser) {
    tabs.push({ id: 'students', label: '👥 Students', count: students.length })
  }

  const getTabStyle = (isActive) => ({
    flex: 1,
    padding: '10px 12px',
    background: isActive ? '#ffffff' : 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: isActive ? '#3378ff' : '#6b7280',
    fontSize: '0.8rem',
    fontWeight: isActive ? '600' : '500',
    cursor: 'pointer',
    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
    whiteSpace: 'nowrap'
  })

  const cardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '12px'
  }

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    fontSize: '0.95rem',
    fontWeight: '600',
    backgroundColor: '#3378ff',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: '16px'
  }

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#6b7280'
  }

  return (
    <div style={{
      padding: '16px',
      paddingBottom: '90px',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      {/* Back Button */}
      <button 
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          color: '#3378ff',
          fontSize: '0.95rem',
          fontWeight: '500',
          cursor: 'pointer',
          padding: '8px 0',
          marginBottom: '16px'
        }}
      >
        ← Back to Courses
      </button>

      {/* Course Header */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#eef5ff',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
          }}>
            📖
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#111827' }}>
              {course.title}
            </h1>
            {course.description && (
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '8px 0 0 0' }}>
                {course.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Access Code for Teachers */}
        {isTeacherUser && course.access_code && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            background: 'linear-gradient(135deg, #eef5ff, #f9fafb)',
            border: '2px dashed #bcd7ff',
            borderRadius: '10px',
            marginTop: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                Access Code
              </div>
              <div style={{ 
                fontSize: '1.3rem', 
                fontWeight: '700', 
                fontFamily: 'monospace', 
                letterSpacing: '3px', 
                color: '#1a56f5' 
              }}>
                {course.access_code}
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', maxWidth: '120px' }}>
              Share with students to join
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        backgroundColor: '#f3f4f6',
        padding: '4px',
        borderRadius: '14px',
        marginBottom: '16px',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={getTabStyle(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tab Content: Assignments */}
      {activeTab === 'assignments' && (
        <div>
          {isTeacherUser && (
            <button style={buttonStyle} onClick={() => setShowCreateAssignment(true)}>
              ➕ Create Assignment
            </button>
          )}
          
          {assignments.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.6 }}>📝</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                No assignments yet
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                {isTeacherUser ? 'Create your first assignment' : 'Assignments will appear here'}
              </div>
            </div>
          ) : (
            assignments.map(assignment => (
              <div key={assignment.id} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: '#eef5ff',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    📝
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      {assignment.title}
                    </div>
                    {assignment.description && (
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px' }}>
                        {assignment.description.length > 80 
                          ? `${assignment.description.substring(0, 80)}...` 
                          : assignment.description}
                      </div>
                    )}
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', gap: '12px' }}>
                      {assignment.due_date && (
                        <span>⏰ {new Date(assignment.due_date).toLocaleDateString()}</span>
                      )}
                      <span>📊 {assignment.max_points} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Announcements */}
      {activeTab === 'announcements' && (
        <div>
          {isTeacherUser && (
            <button style={buttonStyle} onClick={() => setShowCreateAnnouncement(true)}>
              ➕ Post Announcement
            </button>
          )}
          
          {announcements.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.6 }}>📢</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                No announcements yet
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                {isTeacherUser ? 'Share updates with your students' : 'Announcements will appear here'}
              </div>
            </div>
          ) : (
            announcements.map(announcement => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                user={user}
                onUpdate={loadCourseData}
              />
            ))
          )}
        </div>
      )}

      {/* Tab Content: Materials */}
      {activeTab === 'materials' && (
        <div>
          {isTeacherUser && (
            <button style={buttonStyle} onClick={() => setShowUploadMaterial(true)}>
              ⬆️ Upload Material
            </button>
          )}
          
          {materials.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.6 }}>📁</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                No materials yet
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                {isTeacherUser ? 'Upload course materials' : 'Materials will appear here'}
              </div>
            </div>
          ) : (
            materials.map(material => (
              <div key={material.id} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    📄
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{material.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                      {material.file_type} • {new Date(material.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                  <a 
                    href={`/uploads/${material.file_path}`}
                    download
                    style={{
                      padding: '8px 12px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      textDecoration: 'none'
                    }}
                  >
                    ⬇️ Download
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Students */}
      {activeTab === 'students' && isTeacherUser && (
        <div>
          <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#6b7280' }}>
            {students.length} student{students.length !== 1 ? 's' : ''} enrolled
          </div>
          
          {students.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.6 }}>👥</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                No students yet
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                Share the access code with students
              </div>
            </div>
          ) : (
            students.map(student => (
              <div key={student.id} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    👨‍🎓
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>
                      {student.first_name} {student.last_name}
                    </div>
                    {student.username && (
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>@{student.username}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateAssignment && (
        <CreateAssignmentModal
          course={course}
          user={user}
          onClose={() => setShowCreateAssignment(false)}
          onSuccess={() => {
            setShowCreateAssignment(false)
            loadCourseData()
          }}
        />
      )}

      {showCreateAnnouncement && (
        <CreateAnnouncementModal
          course={course}
          user={user}
          onClose={() => setShowCreateAnnouncement(false)}
          onSuccess={() => {
            setShowCreateAnnouncement(false)
            loadCourseData()
          }}
        />
      )}

      {showUploadMaterial && (
        <UploadMaterialModal
          course={course}
          user={user}
          onClose={() => setShowUploadMaterial(false)}
          onSuccess={() => {
            setShowUploadMaterial(false)
            loadCourseData()
          }}
        />
      )}
    </div>
  )
}

export default CourseDetail
