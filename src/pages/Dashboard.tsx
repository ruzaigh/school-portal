import { BarChart3, Calendar, Plus } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ImageCarousel from '../components/ImageCarousel'
import type { EventItem, SchoolData } from '../types/school'

interface DashboardProps {
  data: SchoolData
  isAdmin: boolean
  onAddEvent: () => void
  onEditEvent: (event: EventItem) => void
  onDeleteEvent: (id: number) => void
  onEditImages?: () => void
  calculateGradeAverages: () => Array<{ grade: string; average: number }>
}

export default function Dashboard({ data, isAdmin, onAddEvent, onEditEvent, onDeleteEvent, onEditImages, calculateGradeAverages }: DashboardProps) {
  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sunshine Elementary</h1>
        <p className="text-gray-600">Academic Excellence Dashboard</p>
        {isAdmin && (
          <div className="mt-2">
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Admin Mode</span>
          </div>
        )}
      </div>

      <ImageCarousel images={data.schoolImages} isAdmin={isAdmin} onEditImages={onEditImages} />

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
          </div>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={onAddEvent}>
              <Plus size={16} />
              Add Event
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {data.events.map((event) => (
            <div key={event.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{event.title}</h4>
                <p className="text-sm text-gray-600">{event.date}</p>
                <p className="text-xs text-gray-500">{event.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    event.type === 'academic' ? 'bg-blue-100 text-blue-800' : event.type === 'sports' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {event.type}
                </span>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => onEditEvent(event)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      Edit
                    </button>
                    <button onClick={() => onDeleteEvent(event.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-green-600" size={24} />
          <h2 className="text-xl font-semibold">Grade Performance</h2>
        </div>
        <div className="space-y-3">
          {calculateGradeAverages().map(({ grade, average }) => (
            <div key={grade} className="flex items-center justify-between">
              <span className="font-medium">{grade}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${average >= 85 ? 'bg-green-500' : average >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${average}%` }}
                  />
                </div>
                <span className="text-lg font-bold min-w-[3rem] text-right">{average}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )}
