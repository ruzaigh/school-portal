import { useState, useEffect, useRef } from 'react'
import { Users, Save, BarChart3, BookOpen, Download, Settings, LogOut, User } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'

import Dashboard from './pages/Dashboard'
import Results from './pages/Results'
import Materials from './pages/Materials'
import Admin from './pages/Admin'

import Modal from './components/ui/Modal'
import Input from './components/ui/Input'
import Select from './components/ui/Select'
import Button from './components/ui/Button'

import type {
  TabId,
  SchoolData,
  EventItem,
  StudentItem,
  ResultItem,
  EventFormState,
  StudentFormState,
  GradeFormState,
  MaterialFormState,
  EventType,
  Term,
  MaterialType,
} from './types/school'

// Constants
const GRADES = Array.from({ length: 7 }, (_, i) => `Grade ${i + 1}`)
const SUBJECTS = ['Math', 'English', 'Science', 'History', 'Art']

// Sample data
const initialData: SchoolData = {
  events: [
    { id: 1, title: 'Science Fair', date: '2024-09-15', type: 'academic', description: 'Annual science exhibition' },
    { id: 2, title: 'Sports Day', date: '2024-09-20', type: 'sports', description: 'Inter-class competitions' },
    { id: 3, title: 'Parent Meeting', date: '2024-09-25', type: 'meeting', description: 'Quarterly progress review' },
  ],
  schoolImages: [
    { id: 1, url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop', alt: 'School Building' },
    { id: 2, url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=400&fit=crop', alt: 'Students Learning' },
    { id: 3, url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=400&fit=crop', alt: 'Library' },
    { id: 4, url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop', alt: 'Science Lab' },
  ],
  materials: {
    'Grade 1': [
      { id: 1, name: 'Math Workbook', type: 'pdf', size: '2.3 MB', uploadDate: '2024-08-01' },
      { id: 2, name: 'Reading Exercises', type: 'pdf', size: '1.8 MB', uploadDate: '2024-08-01' },
    ],
    'Grade 2': [
      { id: 3, name: 'Science Activities', type: 'pdf', size: '3.1 MB', uploadDate: '2024-08-01' },
      { id: 4, name: 'Art Projects', type: 'pdf', size: '2.7 MB', uploadDate: '2024-08-01' },
    ],
  },
  students: [
    { id: 1, name: 'Alice Johnson', grade: 'Grade 1', email: 'alice@email.com', phone: '123-456-7890' },
    { id: 2, name: 'Bob Smith', grade: 'Grade 1', email: 'bob@email.com', phone: '123-456-7891' },
    { id: 3, name: 'Carol Davis', grade: 'Grade 2', email: 'carol@email.com', phone: '123-456-7892' },
    { id: 4, name: 'David Wilson', grade: 'Grade 2', email: 'david@email.com', phone: '123-456-7893' },
  ],
  results: [
    { id: 1, studentId: 1, subject: 'Math', grade: 85, date: '2024-08-15', term: 'Q1' },
    { id: 2, studentId: 1, subject: 'English', grade: 78, date: '2024-08-15', term: 'Q1' },
    { id: 3, studentId: 1, subject: 'Science', grade: 92, date: '2024-08-15', term: 'Q1' },
    { id: 4, studentId: 2, subject: 'Math', grade: 76, date: '2024-08-15', term: 'Q1' },
    { id: 5, studentId: 2, subject: 'English', grade: 88, date: '2024-08-15', term: 'Q1' },
    { id: 6, studentId: 2, subject: 'Science', grade: 79, date: '2024-08-15', term: 'Q1' },
  ],
}

const SchoolApp = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 1')
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [data, setData] = useState<SchoolData>(initialData)
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Handle click outside user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Modal states
  const [showEventModal, setShowEventModal] = useState<boolean>(false)
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false)
  const [showGradeModal, setShowGradeModal] = useState<boolean>(false)
  const [showMaterialModal, setShowMaterialModal] = useState<boolean>(false)
  const [editingItem, setEditingItem] = useState<{ id: number } | null>(null)

  // Forms
  const [eventForm, setEventForm] = useState<EventFormState>({ title: '', date: '', type: 'academic', description: '' })
  const [studentForm, setStudentForm] = useState<StudentFormState>({ name: '', grade: '', email: '', phone: '' })
  const [gradeForm, setGradeForm] = useState<GradeFormState>({ studentId: '', subject: '', grade: '', date: '', term: 'Q1' })
  const [materialForm, setMaterialForm] = useState<MaterialFormState>({ name: '', type: 'pdf', grade: '', size: '1.0 MB' })

  // Helpers
  const calculateGradeAverages = () => {
    const averages: Record<string, number> = {}
    GRADES.forEach((grade) => {
      const gradeStudents = data.students.filter((s) => s.grade === grade)
      if (gradeStudents.length === 0) {
        averages[grade] = 0
        return
      }
      const gradeResults = data.results.filter((r) => gradeStudents.some((s) => s.id === r.studentId))
      if (gradeResults.length === 0) {
        averages[grade] = 0
        return
      }
      const totalGrade = gradeResults.reduce((sum, result) => sum + result.grade, 0)
      averages[grade] = Math.round(totalGrade / gradeResults.length)
    })
    return Object.entries(averages).map(([grade, average]) => ({ grade, average }))
  }

  const getStudentResults = (grade: string) => {
    const gradeStudents = data.students.filter((s) => s.grade === grade)
    return gradeStudents.map((student) => {
      const studentResults = data.results.filter((r) => r.studentId === student.id)
      const resultsBySubject: Record<string, number> = {}
      studentResults.forEach((result) => {
        resultsBySubject[result.subject.toLowerCase()] = result.grade
      })
      return { id: student.id, student: student.name, ...resultsBySubject } as { id: number; student: string } & Record<string, number>
    })
  }

  // CRUD: Events
  const openEditEvent = (event: EventItem) => {
    setEditingItem({ id: event.id })
    setEventForm({ ...event })
    setShowEventModal(true)
  }
  const handleCreateEvent = () => {
    const newEvent = { id: Date.now(), ...eventForm }
    setData((prev) => ({ ...prev, events: [...prev.events, newEvent] }))
    setShowEventModal(false)
    setEventForm({ title: '', date: '', type: 'academic', description: '' })
  }
  const handleUpdateEvent = () => {
    setData((prev) => ({
      ...prev,
      events: prev.events.map((event) => (event.id === (editingItem?.id ?? -1) ? { ...event, ...eventForm } : event)),
    }))
    setShowEventModal(false)
    setEditingItem(null)
    setEventForm({ title: '', date: '', type: 'academic', description: '' })
  }
  const handleDeleteEvent = (id: number) => setData((prev) => ({ ...prev, events: prev.events.filter((e) => e.id !== id) }))

  // CRUD: Students
  const openEditStudent = (student: StudentItem) => {
    setEditingItem({ id: student.id })
    setStudentForm({ ...student })
    setShowStudentModal(true)
  }
  const handleCreateStudent = () => {
    const newStudent = { id: Date.now(), ...studentForm }
    setData((prev) => ({ ...prev, students: [...prev.students, newStudent] }))
    setShowStudentModal(false)
    setStudentForm({ name: '', grade: '', email: '', phone: '' })
  }
  const handleUpdateStudent = () => {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === (editingItem?.id ?? -1) ? { ...s, ...studentForm } : s)),
    }))
    setShowStudentModal(false)
    setEditingItem(null)
    setStudentForm({ name: '', grade: '', email: '', phone: '' })
  }
  const handleDeleteStudent = (id: number) =>
    setData((prev) => ({ ...prev, students: prev.students.filter((s) => s.id !== id), results: prev.results.filter((r) => r.studentId !== id) }))

  // CRUD: Grades
  const openEditGrade = (grade: ResultItem) => {
    setEditingItem({ id: grade.id })
    setGradeForm({ ...grade, studentId: grade.studentId.toString(), grade: grade.grade.toString() })
    setShowGradeModal(true)
  }
  const handleCreateGrade = () => {
    const newGrade: ResultItem = {
      id: Date.now(),
      studentId: Number.parseInt(gradeForm.studentId),
      subject: gradeForm.subject,
      grade: Number.parseInt(gradeForm.grade),
      date: gradeForm.date,
      term: gradeForm.term,
    }
    setData((prev) => ({ ...prev, results: [...prev.results, newGrade] }))
    setShowGradeModal(false)
    setGradeForm({ studentId: '', subject: '', grade: '', date: '', term: 'Q1' })
  }
  const handleUpdateGrade = () => {
    setData((prev) => ({
      ...prev,
      results: prev.results.map((r) =>
        r.id === (editingItem?.id ?? -1) ? { ...r, ...gradeForm, studentId: Number.parseInt(gradeForm.studentId), grade: Number.parseInt(gradeForm.grade) } : r,
      ),
    }))
    setShowGradeModal(false)
    setEditingItem(null)
    setGradeForm({ studentId: '', subject: '', grade: '', date: '', term: 'Q1' })
  }
  const handleDeleteGrade = (id: number) => setData((prev) => ({ ...prev, results: prev.results.filter((r) => r.id !== id) }))

  // CRUD: Materials
  const handleCreateMaterial = () => {
    const newMaterial = { id: Date.now(), ...materialForm, uploadDate: new Date().toISOString().split('T')[0] }
    setData((prev) => ({
      ...prev,
      materials: { ...prev.materials, [materialForm.grade]: [...(prev.materials[materialForm.grade] || []), newMaterial] },
    }))
    setShowMaterialModal(false)
    setMaterialForm({ name: '', type: 'pdf', grade: '', size: '1.0 MB' })
  }
  const handleDeleteMaterial = (grade: string, id: number) =>
    setData((prev) => ({ ...prev, materials: { ...prev.materials, [grade]: (prev.materials[grade] || []).filter((m) => m.id !== id) } }))

  // Navigation
  const Navigation = () => (
    <div className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {([
          { id: 'home', label: 'Dashboard', icon: BarChart3 },
          { id: 'results', label: 'Results', icon: BookOpen },
          { id: 'materials', label: 'Materials', icon: Download },
          { id: 'admin', label: 'Admin', icon: Settings },
        ] as Array<{ id: TabId; label: string; icon: typeof BarChart3 }>).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg ${activeTab === id ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
          >
            <Icon size={22} />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex flex-col">
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={28} />
            <div>
              <h1 className="text-lg font-bold">School Portal</h1>
              <p className="text-sm opacity-90">Results & Materials</p>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <User size={20} />
              <span className="text-sm font-medium truncate max-w-[100px]">
                {user?.displayName || user?.email?.split('@')[0]}
              </span>
            </button>
            
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  {!user?.emailVerified && (
                    <p className="text-xs text-yellow-600 mt-1">Email not verified</p>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home' && (
          <Dashboard
            data={data}
            isAdmin={isAdmin}
            onAddEvent={() => setShowEventModal(true)}
            onEditEvent={openEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onEditImages={() => alert('Image management feature would open here')}
            calculateGradeAverages={calculateGradeAverages}
          />
        )}
        {activeTab === 'results' && (
          <Results
            data={data}
            isAdmin={isAdmin}
            selectedGrade={selectedGrade}
            setSelectedGrade={setSelectedGrade}
            onAddGrade={() => setShowGradeModal(true)}
            openEditStudent={openEditStudent}
            openEditGrade={openEditGrade}
            getStudentResults={getStudentResults}
            grades={GRADES}
          />
        )}
        {activeTab === 'materials' && (
          <Materials
            data={data}
            isAdmin={isAdmin}
            selectedGrade={selectedGrade}
            setSelectedGrade={setSelectedGrade}
            onAddMaterial={() => setShowMaterialModal(true)}
            onDeleteMaterial={handleDeleteMaterial}
            grades={GRADES}
          />
        )}
        {activeTab === 'admin' && (
          <Admin
            data={data}
            isAdmin={isAdmin}
            toggleAdmin={() => setIsAdmin(!isAdmin)}
            onAddStudent={() => setShowStudentModal(true)}
            onAddGrade={() => setShowGradeModal(true)}
            onAddEvent={() => setShowEventModal(true)}
            onAddMaterial={() => setShowMaterialModal(true)}
            openEditStudent={openEditStudent}
            openEditGrade={openEditGrade}
            openEditEvent={openEditEvent}
            handleDeleteStudent={handleDeleteStudent}
            handleDeleteGrade={handleDeleteGrade}
            handleDeleteEvent={handleDeleteEvent}
            handleDeleteMaterial={handleDeleteMaterial}
          />
        )}
      </div>

      <Navigation />

      {/* Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false)
          setEditingItem(null)
          setEventForm({ title: '', date: '', type: 'academic', description: '' })
        }}
        title={editingItem ? 'Edit Event' : 'Add New Event'}
      >
        <Input label="Event Title" value={eventForm.title} onChange={(value) => setEventForm((prev) => ({ ...prev, title: value }))} placeholder="Enter event title" required />
        <Input label="Date" type="date" value={eventForm.date} onChange={(value) => setEventForm((prev) => ({ ...prev, date: value }))} required />
        <Select
          label="Event Type"
          value={eventForm.type}
          onChange={(value) => setEventForm((prev) => ({ ...prev, type: value as EventType }))}
          options={[
            { value: 'academic', label: 'Academic' },
            { value: 'sports', label: 'Sports' },
            { value: 'meeting', label: 'Meeting' },
            { value: 'cultural', label: 'Cultural' },
          ]}
          required
        />
        <Input label="Description" value={eventForm.description} onChange={(value) => setEventForm((prev) => ({ ...prev, description: value }))} placeholder="Event description" />
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowEventModal(false)
              setEditingItem(null)
              setEventForm({ title: '', date: '', type: 'academic', description: '' })
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={editingItem ? handleUpdateEvent : handleCreateEvent} className="flex-1" disabled={!eventForm.title || !eventForm.date}>
            <Save size={16} />
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>

      {/* Student Modal */}
      <Modal
        isOpen={showStudentModal}
        onClose={() => {
          setShowStudentModal(false)
          setEditingItem(null)
          setStudentForm({ name: '', grade: '', email: '', phone: '' })
        }}
        title={editingItem ? 'Edit Student' : 'Add New Student'}
      >
        <Input label="Student Name" value={studentForm.name} onChange={(value) => setStudentForm((prev) => ({ ...prev, name: value }))} placeholder="Enter student name" required />
        <Select label="Grade" value={studentForm.grade} onChange={(value) => setStudentForm((prev) => ({ ...prev, grade: value }))} options={GRADES.map((g) => ({ value: g, label: g }))} required />
        <Input label="Email" type="email" value={studentForm.email} onChange={(value) => setStudentForm((prev) => ({ ...prev, email: value }))} placeholder="student@email.com" required />
        <Input label="Phone" value={studentForm.phone} onChange={(value) => setStudentForm((prev) => ({ ...prev, phone: value }))} placeholder="123-456-7890" />
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowStudentModal(false)
              setEditingItem(null)
              setStudentForm({ name: '', grade: '', email: '', phone: '' })
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={editingItem ? handleUpdateStudent : handleCreateStudent} className="flex-1" disabled={!studentForm.name || !studentForm.grade || !studentForm.email}>
            <Save size={16} />
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>

      {/* Grade Modal */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => {
          setShowGradeModal(false)
          setEditingItem(null)
          setGradeForm({ studentId: '', subject: '', grade: '', date: '', term: 'Q1' })
        }}
        title={editingItem ? 'Edit Grade' : 'Add New Grade'}
      >
        <Select
          label="Student"
          value={gradeForm.studentId}
          onChange={(value) => setGradeForm((prev) => ({ ...prev, studentId: value }))}
          options={data.students.map((s) => ({ value: s.id.toString(), label: `${s.name} (${s.grade})` }))}
          required
        />
        <Select label="Subject" value={gradeForm.subject} onChange={(value) => setGradeForm((prev) => ({ ...prev, subject: value }))} options={SUBJECTS.map((s) => ({ value: s, label: s }))} required />
        <Input label="Grade (%)" type="number" value={gradeForm.grade} onChange={(value) => setGradeForm((prev) => ({ ...prev, grade: value }))} placeholder="85" required />
        <Input label="Date" type="date" value={gradeForm.date} onChange={(value) => setGradeForm((prev) => ({ ...prev, date: value }))} required />
        <Select
          label="Term"
          value={gradeForm.term}
          onChange={(value) => setGradeForm((prev) => ({ ...prev, term: value as Term }))}
          options={[
            { value: 'Q1', label: 'Quarter 1' },
            { value: 'Q2', label: 'Quarter 2' },
            { value: 'Q3', label: 'Quarter 3' },
            { value: 'Q4', label: 'Quarter 4' },
            { value: 'Final', label: 'Final' },
          ]}
          required
        />
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowGradeModal(false)
              setEditingItem(null)
              setGradeForm({ studentId: '', subject: '', grade: '', date: '', term: 'Q1' })
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={editingItem ? handleUpdateGrade : handleCreateGrade} className="flex-1" disabled={!gradeForm.studentId || !gradeForm.subject || !gradeForm.grade || !gradeForm.date}>
            <Save size={16} />
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>

      {/* Material Modal */}
      <Modal
        isOpen={showMaterialModal}
        onClose={() => {
          setShowMaterialModal(false)
          setMaterialForm({ name: '', type: 'pdf', grade: '', size: '1.0 MB' })
        }}
        title="Add New Material"
      >
        <Input label="Material Name" value={materialForm.name} onChange={(value) => setMaterialForm((prev) => ({ ...prev, name: value }))} placeholder="Enter material name" required />
        <Select label="Grade" value={materialForm.grade} onChange={(value) => setMaterialForm((prev) => ({ ...prev, grade: value }))} options={GRADES.map((g) => ({ value: g, label: g }))} required />
        <Select
          label="File Type"
          value={materialForm.type}
          onChange={(value) => setMaterialForm((prev) => ({ ...prev, type: value as MaterialType }))}
          options={[
            { value: 'pdf', label: 'PDF' },
            { value: 'doc', label: 'Document' },
            { value: 'ppt', label: 'Presentation' },
            { value: 'video', label: 'Video' },
            { value: 'image', label: 'Image' },
          ]}
          required
        />
        <Input label="File Size" value={materialForm.size} onChange={(value) => setMaterialForm((prev) => ({ ...prev, size: value }))} placeholder="2.5 MB" required />
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowMaterialModal(false)
              setMaterialForm({ name: '', type: 'pdf', grade: '', size: '1.0 MB' })
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateMaterial} className="flex-1" disabled={!materialForm.name || !materialForm.grade}>
            <Save size={16} />
            Create
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default SchoolApp
