import Button from './ui/Button'

interface GradeSelectorProps {
  selectedGrade: string
  onGradeChange: (grade: string) => void
  showAll?: boolean
  grades: string[]
}

export default function GradeSelector({ selectedGrade, onGradeChange, showAll = false, grades }: GradeSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Select Grade</h3>
      <div className="grid grid-cols-4 gap-2">
        {showAll && (
          <Button variant={selectedGrade === 'All' ? 'primary' : 'outline'} size="sm" onClick={() => onGradeChange('All')}>
            All
          </Button>
        )}
        {grades.map((grade) => (
          <Button key={grade} variant={selectedGrade === grade ? 'primary' : 'outline'} size="sm" onClick={() => onGradeChange(grade)}>
            {grade}
          </Button>
        ))}
      </div>
    </div>
  )
}

