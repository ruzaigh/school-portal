import { BookOpen, Download, Eye, Trash2, Plus } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import GradeSelector from '../components/GradeSelector'
import type { SchoolData } from '../types/school'

interface MaterialsProps {
  data: SchoolData
  isAdmin: boolean
  selectedGrade: string
  setSelectedGrade: (g: string) => void
  onAddMaterial: () => void
  onDeleteMaterial: (grade: string, id: number) => void
  grades: string[]
}

export default function Materials({ data, isAdmin, selectedGrade, setSelectedGrade, onAddMaterial, onDeleteMaterial, grades }: MaterialsProps) {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Learning Materials</h1>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={onAddMaterial}>
            <Plus size={16} />
            Add Material
          </Button>
        )}
      </div>

      <GradeSelector selectedGrade={selectedGrade} onGradeChange={setSelectedGrade} grades={grades} />

      <div className="space-y-4">
        {(data.materials[selectedGrade] || []).map((material) => (
          <Card key={material.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold">{material.name}</h3>
                  <p className="text-sm text-gray-600">{material.type.toUpperCase()} • {material.size}</p>
                  <p className="text-xs text-gray-500">Uploaded: {material.uploadDate}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye size={16} />
                  Preview
                </Button>
                <Button variant="primary" size="sm">
                  <Download size={16} />
                  Download
                </Button>
                {isAdmin && (
                  <Button variant="danger" size="sm" onClick={() => onDeleteMaterial(selectedGrade, material.id)}>
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {(!data.materials[selectedGrade] || data.materials[selectedGrade].length === 0) && (
          <div className="text-center py-8 text-gray-500">No materials available for {selectedGrade}</div>
        )}
      </div>
    </div>
  )
}
