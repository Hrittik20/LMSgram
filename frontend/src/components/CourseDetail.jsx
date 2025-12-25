import { useState, useEffect } from 'react'
import axios from 'axios'
import CreateAssignmentModal from './CreateAssignmentModal'
import CreateAnnouncementModal from './CreateAnnouncementModal'
import UploadMaterialModal from './UploadMaterialModal'
import AnnouncementCard from './AnnouncementCard'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function CourseDetail({ course, user, onBack, onUpdate }) {
  const [activeSubTab, setActiveSubTab] = useState('assignments')
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
      // Check if current user is a teacher of this course
      setIsCourseTeacher(teachersRes.data.some(t => t.id === user.id) || course.teacher_id === user.id)
    } catch (error) {
      console.error('Error loading course data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1rem' }}>
        ← Back to Courses
      </button>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {course.title}
        </h2>
        {course.description && (
          <p className="card-description">{course.description}</p>
        )}
        {isCourseTeacher && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--tg-theme-secondary-bg-color)', borderRadius: '8px' }}>
            <strong>Access Code:</strong> <span style={{ fontSize: '1.2rem', letterSpacing: '2px', fontFamily: 'monospace' }}>{course.access_code}</span>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Share this code with students to let them join
            </div>
          </div>
        )}
      </div>

      <div className="nav-tabs" style={{ position: 'relative', top: 0, marginBottom: '1rem' }}>
        <button
          className={`nav-tab ${activeSubTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('assignments')}
        >
          📝 Assignments
        </button>
        <button
          className={`nav-tab ${activeSubTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('announcements')}
        >
          📢 Announcements
        </button>
        <button
          className={`nav-tab ${activeSubTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('materials')}
        >
          📁 Materials
        </button>
        {isCourseTeacher && (
          <button
            className={`nav-tab ${activeSubTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('students')}
          >
            👥 Students
          </button>
        )}
        {isCourseTeacher && (
          <button
            className={`nav-tab ${activeSubTab === 'teachers' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('teachers')}
          >
            👨‍🏫 Teachers
          </button>
        )}
      </div>

      {activeSubTab === 'assignments' && (
        <div>
          {isCourseTeacher && (
            <button className="btn btn-primary" onClick={() => setShowCreateAssignment(true)} style={{ marginBottom: '1rem' }}>
              ➕ Create Assignment
            </button>
          )}
          
          {assignments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-text">No assignments yet</div>
            </div>
          ) : (
            assignments.map(assignment => (
              <div key={assignment.id} className="card">
                <div className="card-title">{assignment.title}</div>
                {assignment.description && (
                  <div className="card-description">{assignment.description}</div>
                )}
                <div className="card-footer">
                  <div>
                    {assignment.due_date && (
                      <div className="card-meta">
                        ⏰ Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                    )}
                    <div className="card-meta">
                      Points: {assignment.max_points}
                    </div>
                  </div>
                  <button className="btn btn-small btn-primary">
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeSubTab === 'announcements' && (
        <div>
          {isCourseTeacher && (
            <button className="btn btn-primary" onClick={() => setShowCreateAnnouncement(true)} style={{ marginBottom: '1rem' }}>
              ➕ Post Announcement
            </button>
          )}
          
          {announcements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📢</div>
              <div className="empty-state-text">No announcements yet</div>
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

      {activeSubTab === 'materials' && (
        <div>
          {isCourseTeacher && (
            <button className="btn btn-primary" onClick={() => setShowUploadMaterial(true)} style={{ marginBottom: '1rem' }}>
              ⬆️ Upload Material
            </button>
          )}
          
          {materials.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📁</div>
              <div className="empty-state-text">No materials yet</div>
            </div>
          ) : (
            materials.map(material => (
              <div key={material.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '2rem' }}>📄</div>
                  <div style={{ flex: 1 }}>
                    <div className="card-title">{material.title}</div>
                    <div className="card-meta">
                      {material.file_type} • Uploaded {new Date(material.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                  <a href={`/uploads/${material.file_path}`} className="btn btn-small btn-primary" download>
                    ⬇️ Download
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeSubTab === 'students' && isCourseTeacher && (
        <div>
          <div style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            {students.length} student{students.length !== 1 ? 's' : ''} enrolled
          </div>
          
          {students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-text">No students enrolled yet</div>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Share the access code with students to let them join
              </p>
            </div>
          ) : (
            students.map(student => (
              <div key={student.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '2rem' }}>👨‍🎓</div>
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
            ))
          )}
        </div>
      )}

      {activeSubTab === 'teachers' && isCourseTeacher && (
        <div>
          <div style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} in this course
          </div>
          
          {teachers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👨‍🏫</div>
              <div className="empty-state-text">No teachers assigned</div>
            </div>
          ) : (
            teachers.map(teacher => (
              <div key={teacher.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '2rem' }}>👨‍🏫</div>
                  <div style={{ flex: 1 }}>
                    <div className="card-title">
                      {teacher.first_name} {teacher.last_name}
                    </div>
                    {teacher.username && (
                      <div className="card-meta">@{teacher.username}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

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

