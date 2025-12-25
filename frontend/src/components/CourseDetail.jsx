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
  const [error, setError] = useState(null)
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false)
  const [showUploadMaterial, setShowUploadMaterial] = useState(false)

  useEffect(() => {
    loadCourseData()
  }, [course])

  const loadCourseData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Loading course data for:', course.id)
      
      const [assignmentsRes, announcementsRes, materialsRes, teachersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/assignments/course/${course.id}`),
        axios.get(`${API_BASE_URL}/announcements/course/${course.id}`),
        axios.get(`${API_BASE_URL}/materials/course/${course.id}`),
        axios.get(`${API_BASE_URL}/courses/${course.id}/teachers`)
      ])

      console.log('Assignments:', assignmentsRes.data)
      console.log('Announcements:', announcementsRes.data)
      console.log('Materials:', materialsRes.data)
      console.log('Teachers:', teachersRes.data)

      setAssignments(assignmentsRes.data || [])
      setAnnouncements(announcementsRes.data || [])
      setMaterials(materialsRes.data || [])
      setTeachers(teachersRes.data || [])
      
      const isTeacher = (teachersRes.data || []).some(t => t.id === user.id) || user.role === 'teacher'
      setIsCourseTeacher(isTeacher)

      // Load students only for teachers
      if (isTeacher) {
        try {
          const studentsRes = await axios.get(`${API_BASE_URL}/courses/${course.id}/students`)
          setStudents(studentsRes.data || [])
        } catch (err) {
          console.log('Could not load students')
        }
      }
    } catch (err) {
      console.error('Error loading course data:', err)
      setError('Failed to load course data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading course...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <button className="btn btn-ghost mb-md" onClick={onBack}>← Back</button>
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-primary" onClick={loadCourseData}>Retry</button>
      </div>
    )
  }

  const tabs = [
    { id: 'assignments', label: '📝 Tasks', count: assignments.length },
    { id: 'announcements', label: '📢 News', count: announcements.length },
    { id: 'materials', label: '📁 Files', count: materials.length }
  ]

  if (isCourseTeacher) {
    tabs.push({ id: 'students', label: '👥 Students', count: students.length })
  }

  return (
    <div className="page fade-in">
      {/* Header */}
      <button className="btn btn-ghost mb-md" onClick={onBack}>
        ← Back to Courses
      </button>
      
      <div className="card mb-lg">
        <div className="card-header">
          <div className="card-icon card-icon-primary">📖</div>
          <div className="card-body">
            <div className="card-title">{course.title}</div>
            {course.description && (
              <div className="card-description">{course.description}</div>
            )}
          </div>
        </div>
        
        {/* Access Code for Teachers */}
        {isCourseTeacher && course.access_code && (
          <div className="access-code-box">
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                ACCESS CODE
              </div>
              <div className="access-code-value">{course.access_code}</div>
            </div>
            <div className="access-code-hint">Share with students to join</div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tab Content: Assignments */}
      {activeTab === 'assignments' && (
        <div className="fade-in">
          {isCourseTeacher && (
            <button className="btn btn-primary mb-lg" onClick={() => setShowCreateAssignment(true)}>
              ➕ Create Assignment
            </button>
          )}
          
          {assignments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No assignments yet</div>
              <div className="empty-state-text">
                {isCourseTeacher ? 'Create your first assignment' : 'Assignments will appear here'}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              {assignments.map(assignment => (
                <div key={assignment.id} className="card">
                  <div className="card-header">
                    <div className="card-icon card-icon-primary">📝</div>
                    <div className="card-body">
                      <div className="card-title">{assignment.title}</div>
                      {assignment.description && (
                        <div className="card-description">{assignment.description}</div>
                      )}
                      <div className="card-meta">
                        {assignment.due_date && (
                          <span>⏰ Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                        )}
                        <span>📊 {assignment.max_points} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Announcements */}
      {activeTab === 'announcements' && (
        <div className="fade-in">
          {isCourseTeacher && (
            <button className="btn btn-primary mb-lg" onClick={() => setShowCreateAnnouncement(true)}>
              ➕ Post Announcement
            </button>
          )}
          
          {announcements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📢</div>
              <div className="empty-state-title">No announcements yet</div>
              <div className="empty-state-text">
                {isCourseTeacher ? 'Share updates with students' : 'Announcements will appear here'}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-md">
              {announcements.map(announcement => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  user={user}
                  onUpdate={loadCourseData}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Materials */}
      {activeTab === 'materials' && (
        <div className="fade-in">
          {isCourseTeacher && (
            <button className="btn btn-primary mb-lg" onClick={() => setShowUploadMaterial(true)}>
              ⬆️ Upload Material
            </button>
          )}
          
          {materials.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📁</div>
              <div className="empty-state-title">No materials yet</div>
              <div className="empty-state-text">
                {isCourseTeacher ? 'Upload course materials' : 'Materials will appear here'}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              {materials.map(material => (
                <div key={material.id} className="card">
                  <div className="card-header">
                    <div className="card-icon card-icon-violet">📄</div>
                    <div className="card-body">
                      <div className="card-title">{material.title}</div>
                      <div className="card-meta">
                        {material.file_type} • {new Date(material.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                    <a 
                      href={`${API_BASE_URL}/uploads/${material.file_path}`}
                      className="btn btn-sm btn-secondary"
                      download
                    >
                      ⬇️
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Students */}
      {activeTab === 'students' && isCourseTeacher && (
        <div className="fade-in">
          <div className="text-muted mb-md">
            {students.length} student{students.length !== 1 ? 's' : ''} enrolled
          </div>
          
          {students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">No students yet</div>
              <div className="empty-state-text">Share the access code with students</div>
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              {students.map(student => (
                <div key={student.id} className="card">
                  <div className="card-header">
                    <div className="card-icon card-icon-success">👨‍🎓</div>
                    <div className="card-body">
                      <div className="card-title">{student.first_name} {student.last_name}</div>
                      {student.username && (
                        <div className="card-meta">@{student.username}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
