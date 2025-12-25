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
      setIsCourseTeacher(teachersRes.data.some(t => t.id === user.id) || course.teacher_id === user.id)
    } catch (error) {
      console.error('Error loading course data:', error)
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

  const tabs = [
    { id: 'assignments', label: '📝 Tasks', count: assignments.length },
    { id: 'announcements', label: '📢 News', count: announcements.length },
    { id: 'materials', label: '📁 Files', count: materials.length }
  ]

  if (isCourseTeacher) {
    tabs.push({ id: 'students', label: '👥 Students', count: students.length })
    tabs.push({ id: 'teachers', label: '👨‍🏫 Teachers', count: teachers.length })
  }

  return (
    <div className="page fade-in">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ marginLeft: '-0.5rem', marginBottom: '1rem' }}>
          ← Back to Courses
        </button>
        
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div className="card-icon card-icon-primary">📖</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                {course.title}
              </h1>
              {course.description && (
                <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem', marginBottom: 0 }}>
                  {course.description}
                </p>
              )}
            </div>
          </div>
          
          {isCourseTeacher && (
            <div className="access-code-box">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--neutral-500)', marginBottom: '0.25rem' }}>
                  ACCESS CODE
                </div>
                <div className="access-code-value">{course.access_code}</div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', maxWidth: '140px' }}>
                Share with students to let them join
              </div>
            </div>
          )}
        </div>
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

      {/* Tab Content */}
      {activeTab === 'assignments' && (
        <div className="fade-in">
          {isCourseTeacher && (
            <button 
              className="btn btn-primary mb-lg" 
              onClick={() => setShowCreateAssignment(true)}
            >
              ➕ Create Assignment
            </button>
          )}
          
          {assignments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No assignments yet</div>
              <div className="empty-state-text">
                {isCourseTeacher 
                  ? 'Create your first assignment for this course'
                  : 'Assignments will appear here when posted'}
              </div>
              {isCourseTeacher && (
                <button 
                  className="btn btn-primary mt-md" 
                  onClick={() => setShowCreateAssignment(true)}
                >
                  ➕ Create Assignment
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              {assignments.map(assignment => (
                <div key={assignment.id} className="card card-clickable">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div className="card-icon card-icon-primary">📝</div>
                    <div style={{ flex: 1 }}>
                      <div className="card-title">{assignment.title}</div>
                      {assignment.description && (
                        <div className="card-description" style={{ marginTop: '0.25rem' }}>
                          {assignment.description.length > 100 
                            ? `${assignment.description.substring(0, 100)}...` 
                            : assignment.description}
                        </div>
                      )}
                      <div className="card-meta mt-sm">
                        {assignment.due_date && (
                          <>
                            <span>⏰ Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>📊 {assignment.max_points} points</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="fade-in">
          {isCourseTeacher && (
            <button 
              className="btn btn-primary mb-lg" 
              onClick={() => setShowCreateAnnouncement(true)}
            >
              ➕ Post Announcement
            </button>
          )}
          
          {announcements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📢</div>
              <div className="empty-state-title">No announcements yet</div>
              <div className="empty-state-text">
                {isCourseTeacher 
                  ? 'Share important updates with your students'
                  : 'Announcements will appear here when posted'}
              </div>
              {isCourseTeacher && (
                <button 
                  className="btn btn-primary mt-md" 
                  onClick={() => setShowCreateAnnouncement(true)}
                >
                  ➕ Post Announcement
                </button>
              )}
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

      {activeTab === 'materials' && (
        <div className="fade-in">
          {isCourseTeacher && (
            <button 
              className="btn btn-primary mb-lg" 
              onClick={() => setShowUploadMaterial(true)}
            >
              ⬆️ Upload Material
            </button>
          )}
          
          {materials.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📁</div>
              <div className="empty-state-title">No materials yet</div>
              <div className="empty-state-text">
                {isCourseTeacher 
                  ? 'Upload course materials for your students'
                  : 'Materials will appear here when uploaded'}
              </div>
              {isCourseTeacher && (
                <button 
                  className="btn btn-primary mt-md" 
                  onClick={() => setShowUploadMaterial(true)}
                >
                  ⬆️ Upload Material
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              {materials.map(material => (
                <div key={material.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="card-icon card-icon-violet">📄</div>
                    <div style={{ flex: 1 }}>
                      <div className="card-title">{material.title}</div>
                      <div className="card-meta">
                        {material.file_type} • Uploaded {new Date(material.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                    <a 
                      href={`/uploads/${material.file_path}`} 
                      className="btn btn-sm btn-outline" 
                      download
                      onClick={(e) => e.stopPropagation()}
                    >
                      ⬇️ Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && isCourseTeacher && (
        <div className="fade-in">
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--neutral-500)' }}>
            {students.length} student{students.length !== 1 ? 's' : ''} enrolled
          </div>
          
          {students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">No students yet</div>
              <div className="empty-state-text">
                Share the access code with students to let them join this course
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              {students.map(student => (
                <div key={student.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="card-icon card-icon-success">👨‍🎓</div>
                    <div style={{ flex: 1 }}>
                      <div className="card-title">
                        {student.first_name} {student.last_name}
                      </div>
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

      {activeTab === 'teachers' && isCourseTeacher && (
        <div className="fade-in">
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--neutral-500)' }}>
            {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} in this course
          </div>
          
          {teachers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👨‍🏫</div>
              <div className="empty-state-title">No teachers assigned</div>
              <div className="empty-state-text">
                Add teachers to help manage this course
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              {teachers.map(teacher => (
                <div key={teacher.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="card-icon card-icon-primary">👨‍🏫</div>
                    <div style={{ flex: 1 }}>
                      <div className="card-title">
                        {teacher.first_name} {teacher.last_name}
                      </div>
                      {teacher.username && (
                        <div className="card-meta">@{teacher.username}</div>
                      )}
                    </div>
                    {teacher.id === user.id && (
                      <span className="badge badge-primary">You</span>
                    )}
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
