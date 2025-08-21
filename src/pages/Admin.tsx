import { Calendar, Edit, FileText, Settings, Trash2, UserPlus, Plus } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import UserManagement from '../components/UserManagement'
import type { EventItem, ResultItem, SchoolData, StudentItem } from '../types/school'

interface AdminProps {
  data: SchoolData
  isAdmin: boolean
  toggleAdmin: () => void
  onAddStudent: () => void
  onAddGrade: () => void
  onAddEvent: () => void
  onAddMaterial: () => void
  openEditStudent: (student: StudentItem) => void
  openEditGrade: (result: ResultItem) => void
  openEditEvent: (event: EventItem) => void
  handleDeleteStudent: (id: number) => void
  handleDeleteGrade: (id: number) => void
  handleDeleteEvent: (id: number) => void
  handleDeleteMaterial: (grade: string, id: number) => void
}

export default function Admin({ data, isAdmin, toggleAdmin, onAddStudent, onAddGrade, onAddEvent, onAddMaterial, openEditStudent, openEditGrade, openEditEvent, handleDeleteStudent, handleDeleteGrade, handleDeleteEvent, handleDeleteMaterial }: AdminProps) {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Button variant={isAdmin ? 'danger' : 'success'} size="sm" onClick={toggleAdmin}>
          {isAdmin ? 'Exit Admin' : 'Enter Admin'}
        </Button>
      </div>

      {!isAdmin ? (
        <div className="text-center py-8 text-gray-500">
          <Settings size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Click "Enter Admin" to access administrative features</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* User Management Section */}
          <UserManagement />
          
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Students Management</h2>
              <Button variant="primary" size="sm" onClick={onAddStudent}>
                <UserPlus size={16} />
                Add Student
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.students.map((student) => (
                <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.grade} • {student.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditStudent(student)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Grade Management</h2>
              <Button variant="primary" size="sm" onClick={onAddGrade}>
                <Plus size={16} />
                Add Grade
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.results.map((result) => {
                const student = data.students.find((s) => s.id === result.studentId)
                return (
                  <div key={result.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{student?.name} - {result.subject}</h4>
                      <p className="text-sm text-gray-600">Grade: {result.grade}% • {result.term} • {result.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditGrade(result)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteGrade(result.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Events Management</h2>
              <Button variant="primary" size="sm" onClick={onAddEvent}>
                <Calendar size={16} />
                Add Event
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.events.map((event) => (
                <div key={event.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.date} • {event.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditEvent(event)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteEvent(event.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Materials Management</h2>
              <Button variant="primary" size="sm" onClick={onAddMaterial}>
                <FileText size={16} />
                Add Material
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Object.entries(data.materials).flatMap(([grade, materials]) =>
                materials.map((material) => (
                  <div key={material.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{material.name}</h4>
                      <p className="text-sm text-gray-600">{grade} • {material.type} • {material.size}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDeleteMaterial(grade, material.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )),
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
