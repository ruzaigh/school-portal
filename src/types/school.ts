export type TabId = 'home' | 'results' | 'materials' | 'admin'

export type EventType = 'academic' | 'sports' | 'meeting' | 'cultural'
export type MaterialType = 'pdf' | 'doc' | 'ppt' | 'video' | 'image'
export type Term = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Final'

export interface SchoolImage {
  id: number
  url: string
  alt: string
}

export interface EventItem {
  id: number
  title: string
  date: string
  type: EventType
  description: string
}

export interface StudentItem {
  id: number
  name: string
  grade: string
  email: string
  phone: string
}

export interface ResultItem {
  id: number
  studentId: number
  subject: string
  grade: number
  date: string
  term: Term
}

export interface MaterialItem {
  id: number
  name: string
  type: MaterialType
  size: string
  uploadDate: string
}

export type MaterialsMap = Record<string, MaterialItem[]>

export interface SchoolData {
  events: EventItem[]
  schoolImages: SchoolImage[]
  materials: MaterialsMap
  students: StudentItem[]
  results: ResultItem[]
}

// Forms
export type EventFormState = Omit<EventItem, 'id'>
export type StudentFormState = Omit<StudentItem, 'id'>
export interface GradeFormState {
  studentId: string
  subject: string
  grade: string
  date: string
  term: Term
}
export interface MaterialFormState {
  name: string
  type: MaterialType
  grade: string
  size: string
}

