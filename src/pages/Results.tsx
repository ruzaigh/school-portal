import { Edit, Eye, Plus } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import GradeSelector from '../components/GradeSelector'
import type { ResultItem, SchoolData, StudentItem } from '../types/school'

type StudentRow = { id: number; student: string } & Record<string, number>

interface ResultsProps {
  data: SchoolData
  isAdmin: boolean
  selectedGrade: string
  setSelectedGrade: (g: string) => void
  onAddGrade: () => void
  openEditStudent: (student: StudentItem) => void
  openEditGrade: (result: ResultItem) => void
  getStudentResults: (grade: string) => StudentRow[]
  grades: string[]
}

export default function Results({ data, isAdmin, selectedGrade, setSelectedGrade, onAddGrade, openEditStudent, openEditGrade, getStudentResults, grades }: ResultsProps) {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Results</h1>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={onAddGrade}>
            <Plus size={16} />
            Add Grade
          </Button>
        )}
      </div>

      <GradeSelector selectedGrade={selectedGrade} onGradeChange={setSelectedGrade} grades={grades} />

      <div className="space-y-4">
        {getStudentResults(selectedGrade).map((student) => (
          <Card key={student.id}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">{student.student}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye size={16} />
                  Details
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const s = data.students.find((s) => s.id === student.id)
                      if (s) openEditStudent(s)
                    }}
                  >
                    <Edit size={16} />
                    Edit
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(student as Record<string, number | string>)
                .filter(([key]) => !['id', 'student'].includes(key))
                .map(([subject, score]) => {
                  const value = score as number
                  return (
                    <div key={subject} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 capitalize">{subject}</div>
                      <div className={`text-xl font-bold ${value >= 85 ? 'text-green-600' : value >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>{value}%</div>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            const result = data.results.find((r) => r.studentId === student.id && r.subject.toLowerCase() === subject)
                            if (result) openEditGrade(result)
                          }}
                          className="mt-1 text-xs text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )
                })}
            </div>
          </Card>
        ))}

        {getStudentResults(selectedGrade).length === 0 && <div className="text-center py-8 text-gray-500">No results available for {selectedGrade}</div>}
      </div>
    </div>
  )
}
