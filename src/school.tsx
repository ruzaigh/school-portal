import { useState, useEffect, type ReactNode } from 'react';
import {
    ChevronLeft, ChevronRight, Calendar, BookOpen, BarChart3, Users, Download, Eye, Plus,
    Edit, Trash2, Save, X, Settings, UserPlus, FileText, Image
} from 'lucide-react';

// Types
type EventType = 'academic' | 'sports' | 'meeting' | 'cultural'
type MaterialType = 'pdf' | 'doc' | 'ppt' | 'video' | 'image'
type Term = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Final'

type TabId = 'home' | 'results' | 'materials' | 'admin'

interface SchoolImage {
    id: number
    url: string
    alt: string
}

interface EventItem {
    id: number
    title: string
    date: string
    type: EventType
    description: string
}

interface StudentItem {
    id: number
    name: string
    grade: string
    email: string
    phone: string
}

interface ResultItem {
    id: number
    studentId: number
    subject: string
    grade: number
    date: string
    term: Term
}

interface MaterialItem {
    id: number
    name: string
    type: MaterialType
    size: string
    uploadDate: string
}

type MaterialsMap = Record<string, MaterialItem[]>

interface SchoolData {
    events: EventItem[]
    schoolImages: SchoolImage[]
    materials: MaterialsMap
    students: StudentItem[]
    results: ResultItem[]
}

// Forms
type EventFormState = Omit<EventItem, 'id'>
type StudentFormState = Omit<StudentItem, 'id'>
interface GradeFormState {
    studentId: string
    subject: string
    grade: string
    date: string
    term: Term
}
interface MaterialFormState {
    name: string
    type: MaterialType
    grade: string
    size: string
}

// Mock data following DRY principle
const GRADES = Array.from({ length: 7 }, (_, i) => `Grade ${i + 1}`);
const SUBJECTS = ['Math', 'English', 'Science', 'History', 'Art'];

const initialData: SchoolData = {
    events: [
        { id: 1, title: 'Science Fair', date: '2024-09-15', type: 'academic', description: 'Annual science exhibition' },
        { id: 2, title: 'Sports Day', date: '2024-09-20', type: 'sports', description: 'Inter-class competitions' },
        { id: 3, title: 'Parent Meeting', date: '2024-09-25', type: 'meeting', description: 'Quarterly progress review' }
    ],
    schoolImages: [
        { id: 1, url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop', alt: 'School Building' },
        { id: 2, url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=400&fit=crop', alt: 'Students Learning' },
        { id: 3, url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=400&fit=crop', alt: 'Library' },
        { id: 4, url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop', alt: 'Science Lab' }
    ],
    materials: {
        'Grade 1': [
            { id: 1, name: 'Math Workbook', type: 'pdf', size: '2.3 MB', uploadDate: '2024-08-01' },
            { id: 2, name: 'Reading Exercises', type: 'pdf', size: '1.8 MB', uploadDate: '2024-08-01' }
        ],
        'Grade 2': [
            { id: 3, name: 'Science Activities', type: 'pdf', size: '3.1 MB', uploadDate: '2024-08-01' },
            { id: 4, name: 'Art Projects', type: 'pdf', size: '2.7 MB', uploadDate: '2024-08-01' }
        ]
    },
    students: [
        { id: 1, name: 'Alice Johnson', grade: 'Grade 1', email: 'alice@email.com', phone: '123-456-7890' },
        { id: 2, name: 'Bob Smith', grade: 'Grade 1', email: 'bob@email.com', phone: '123-456-7891' },
        { id: 3, name: 'Carol Davis', grade: 'Grade 2', email: 'carol@email.com', phone: '123-456-7892' },
        { id: 4, name: 'David Wilson', grade: 'Grade 2', email: 'david@email.com', phone: '123-456-7893' }
    ],
    results: [
        { id: 1, studentId: 1, subject: 'Math', grade: 85, date: '2024-08-15', term: 'Q1' },
        { id: 2, studentId: 1, subject: 'English', grade: 78, date: '2024-08-15', term: 'Q1' },
        { id: 3, studentId: 1, subject: 'Science', grade: 92, date: '2024-08-15', term: 'Q1' },
        { id: 4, studentId: 2, subject: 'Math', grade: 76, date: '2024-08-15', term: 'Q1' },
        { id: 5, studentId: 2, subject: 'English', grade: 88, date: '2024-08-15', term: 'Q1' },
        { id: 6, studentId: 2, subject: 'Science', grade: 79, date: '2024-08-15', term: 'Q1' }
    ]
};

// Reusable components following DRY principle
interface CardProps {
    children: ReactNode
    className?: string
    onClick?: () => void
}
const Card = ({ children, className = '', onClick }: CardProps) => (
    <div
        className={`bg-white rounded-lg shadow-md p-4 ${className} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
        onClick={onClick}
    >
        {children}
    </div>
);

interface ButtonProps {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
    size?: 'sm' | 'md' | 'lg'
    onClick?: () => void
    className?: string
    disabled?: boolean
}
const Button = ({ children, variant = 'primary', size = 'md', onClick, className = '', disabled = false }: ButtonProps) => {
    const baseClasses = 'font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700'
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

interface InputProps {
    label?: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
    required?: boolean
}
const Input = ({ label, value, onChange, placeholder, type = 'text', required = false }: InputProps) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

interface SelectOption { value: string; label: string }
interface SelectProps {
    label?: string
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
    required?: boolean
}
const Select = ({ label, value, onChange, options, required = false }: SelectProps) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">Select...</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
}
const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

interface GradeSelectorProps {
    selectedGrade: string
    onGradeChange: (grade: string) => void
    showAll?: boolean
}
const GradeSelector = ({ selectedGrade, onGradeChange, showAll = false }: GradeSelectorProps) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Grade</h3>
        <div className="grid grid-cols-4 gap-2">
            {showAll && (
                <Button
                    variant={selectedGrade === 'All' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onGradeChange('All')}
                >
                    All
                </Button>
            )}
            {GRADES.map(grade => (
                <Button
                    key={grade}
                    variant={selectedGrade === grade ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onGradeChange(grade)}
                >
                    {grade}
                </Button>
            ))}
        </div>
    </div>
);

interface ImageCarouselProps {
    images: SchoolImage[]
    isAdmin?: boolean
    onEditImages?: () => void
}
const ImageCarousel = ({ images, isAdmin = false, onEditImages }: ImageCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [images.length]);

    const goToPrevious = () => setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    const goToNext = () => setCurrentIndex(prev => (prev + 1) % images.length);

    return (
        <div className="relative h-48 rounded-lg overflow-hidden bg-gray-200">
            <img
                src={images[currentIndex]?.url}
                alt={images[currentIndex]?.alt}
                className="w-full h-full object-cover transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {isAdmin && (
                <button
                    onClick={onEditImages}
                    className="absolute top-2 right-2 bg-white/80 p-2 rounded-full hover:bg-white"
                >
                    <Image size={16} />
                </button>
            )}

            <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full"
            >
                <ChevronLeft size={20} />
            </button>

            <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full"
            >
                <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                ))}
            </div>

            <div className="absolute bottom-4 left-4 text-white font-medium">
                {images[currentIndex]?.alt}
            </div>
        </div>
    );
};

const SchoolApp = () => {
    const [activeTab, setActiveTab] = useState<TabId>('home');
    const [selectedGrade, setSelectedGrade] = useState<string>('Grade 1');
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [data, setData] = useState<SchoolData>(initialData);

    // Modal states
    const [showEventModal, setShowEventModal] = useState<boolean>(false);
    const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
    const [showGradeModal, setShowGradeModal] = useState<boolean>(false);
    const [showMaterialModal, setShowMaterialModal] = useState<boolean>(false);
    // Minimal editing state: only need the id for updates and a truthy value for UI
    const [editingItem, setEditingItem] = useState<{ id: number } | null>(null);

    // Form states
    const [eventForm, setEventForm] = useState<EventFormState>({ title: '', date: '', type: 'academic', description: '' });
    const [studentForm, setStudentForm] = useState<StudentFormState>({ name: '', grade: '', email: '', phone: '' });
    const [gradeForm, setGradeForm] = useState<GradeFormState>({ studentId: '', subject: '', grade: '', date: '', term: 'Q1' });
    const [materialForm, setMaterialForm] = useState<MaterialFormState>({ name: '', type: 'pdf', grade: '', size: '1.0 MB' });

    // Calculate grade averages
    const calculateGradeAverages = () => {
        const averages: Record<string, number> = {};

        GRADES.forEach(grade => {
            const gradeStudents = data.students.filter((s) => s.grade === grade);
            if (gradeStudents.length === 0) {
                averages[grade] = 0;
                return;
            }

            const gradeResults = data.results.filter((r) =>
                gradeStudents.some((s) => s.id === r.studentId)
            );

            if (gradeResults.length === 0) {
                averages[grade] = 0;
                return;
            }

            const totalGrade = gradeResults.reduce((sum, result) => sum + result.grade, 0);
            averages[grade] = Math.round(totalGrade / gradeResults.length);
        });

        return Object.entries(averages).map(([grade, average]) => ({ grade, average }));
    };

    // CRUD Operations
    const handleCreateEvent = () => {
        const newEvent = {
            id: Date.now(),
            ...eventForm
        };
        setData(prev => ({ ...prev, events: [...prev.events, newEvent] }));
        setShowEventModal(false);
        setEventForm({ title: '', date: '', type: 'academic', description: '' });
    };

    const handleUpdateEvent = () => {
        setData(prev => ({
            ...prev,
            events: prev.events.map(event =>
                event.id === (editingItem?.id ?? -1) ? { ...event, ...eventForm } : event
            )
        }));
        setShowEventModal(false);
        setEditingItem(null);
        setEventForm({ title: '', date: '', type: 'academic', description: '' });
    };

    const handleDeleteEvent = (id: number) => {
        setData(prev => ({ ...prev, events: prev.events.filter(event => event.id !== id) }));
    };

    const handleCreateStudent = () => {
        const newStudent = {
            id: Date.now(),
            ...studentForm
        };
        setData(prev => ({ ...prev, students: [...prev.students, newStudent] }));
        setShowStudentModal(false);
        setStudentForm({ name: '', grade: '', email: '', phone: '' });
    };

    const handleUpdateStudent = () => {
        setData(prev => ({
            ...prev,
            students: prev.students.map(student =>
                student.id === (editingItem?.id ?? -1) ? { ...student, ...studentForm } : student
            )
        }));
        setShowStudentModal(false);
        setEditingItem(null);
        setStudentForm({ name: '', grade: '', email: '', phone: '' });
    };

    const handleDeleteStudent = (id: number) => {
        setData(prev => ({
            ...prev,
            students: prev.students.filter(student => student.id !== id),
            results: prev.results.filter(result => result.studentId !== id)
        }));
    };

    const handleCreateGrade = () => {
        const newGrade = {
            id: Date.now(),
            ...gradeForm,
            studentId: Number.parseInt(gradeForm.studentId),
            grade: Number.parseInt(gradeForm.grade)
        };
        setData(prev => ({ ...prev, results: [...prev.results, newGrade] }));
        setShowGradeModal(false);
        setGradeForm({ studentId: '', subject: '', grade: '', date: '', term: 'Q1' });
    };

    const handleUpdateGrade = () => {
        setData(prev => ({
            ...prev,
            results: prev.results.map(result =>
                result.id === (editingItem?.id ?? -1) ? {
                    ...result,
                    ...gradeForm,
                    studentId: Number.parseInt(gradeForm.studentId),
                    grade: Number.parseInt(gradeForm.grade)
                } : result
            )
        }));
        setShowGradeModal(false);
        setEditingItem(null);
        setGradeForm({ studentId: '', subject: '', grade: '', date: '', term: 'Q1' });
    };

    const handleDeleteGrade = (id: number) => {
        setData(prev => ({ ...prev, results: prev.results.filter(result => result.id !== id) }));
    };

    const handleCreateMaterial = () => {
        const newMaterial = {
            id: Date.now(),
            ...materialForm,
            uploadDate: new Date().toISOString().split('T')[0]
        };
        setData(prev => ({
            ...prev,
            materials: {
                ...prev.materials,
                [materialForm.grade]: [...(prev.materials[materialForm.grade] || []), newMaterial]
            }
        }));
        setShowMaterialModal(false);
        setMaterialForm({ name: '', type: 'pdf', grade: '', size: '1.0 MB' });
    };

    const handleDeleteMaterial = (grade: string, id: number) => {
        setData(prev => ({
            ...prev,
            materials: {
                ...prev.materials,
                [grade]: (prev.materials[grade] || []).filter(material => material.id !== id)
            }
        }));
    };

    // Open edit modals
    const openEditEvent = (event: EventItem) => {
        setEditingItem({ id: event.id });
        setEventForm({ ...event });
        setShowEventModal(true);
    };

    const openEditStudent = (student: StudentItem) => {
        setEditingItem({ id: student.id });
        setStudentForm({ ...student });
        setShowStudentModal(true);
    };

    const openEditGrade = (grade: ResultItem) => {
        setEditingItem({ id: grade.id });
        setGradeForm({ ...grade, studentId: grade.studentId.toString(), grade: grade.grade.toString() });
        setShowGradeModal(true);
    };

    // Get student results for display
    const getStudentResults = (grade: string) => {
        const gradeStudents = data.students.filter((s) => s.grade === grade);
        return gradeStudents.map((student) => {
            const studentResults = data.results.filter((r) => r.studentId === student.id);
            const resultsBySubject: Record<string, number> = {};
            studentResults.forEach((result) => {
                resultsBySubject[result.subject.toLowerCase()] = result.grade;
            });
            return {
                id: student.id,
                student: student.name,
                ...resultsBySubject,
            } as { id: number; student: string } & Record<string, number>;
        });
    };

    // Navigation component
    const Navigation = () => (
        <div className="bg-white border-t border-gray-200 px-4 py-2">
            <div className="flex justify-around">
                {([
                    { id: 'home', icon: BarChart3, label: 'Dashboard' },
                    { id: 'results', icon: BookOpen, label: 'Results' },
                    { id: 'materials', icon: Download, label: 'Materials' },
                    { id: 'admin', icon: Settings, label: 'Admin' }
                ] as Array<{ id: TabId; icon: any; label: string }>).map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                            activeTab === id ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                        }`}
                    >
                        <Icon size={24} />
                        <span className="text-xs mt-1">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    // Dashboard/Landing Page
    const Dashboard = () => (
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

            <ImageCarousel
                images={data.schoolImages}
                isAdmin={isAdmin}
                onEditImages={() => alert('Image management feature would open here')}
            />

            {/* Events Section */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="text-blue-600" size={24} />
                        <h2 className="text-xl font-semibold">Upcoming Events</h2>
                    </div>
                    {isAdmin && (
                        <Button variant="outline" size="sm" onClick={() => setShowEventModal(true)}>
                            <Plus size={16} />
                            Add Event
                        </Button>
                    )}
                </div>
                <div className="space-y-3">
                    {data.events.map(event => (
                        <div key={event.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-medium">{event.title}</h4>
                                <p className="text-sm text-gray-600">{event.date}</p>
                                <p className="text-xs text-gray-500">{event.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                    event.type === 'academic' ? 'bg-blue-100 text-blue-800' :
                        event.type === 'sports' ? 'bg-green-100 text-green-800' :
                            'bg-orange-100 text-orange-800'
                }`}>
                  {event.type}
                </span>
                                {isAdmin && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditEvent(event)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Grade Averages */}
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
                                        className={`h-2 rounded-full ${
                                            average >= 85 ? 'bg-green-500' :
                                                average >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
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
    );

    // Results Page
    const Results = () => (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Student Results</h1>
                {isAdmin && (
                    <Button variant="outline" size="sm" onClick={() => setShowGradeModal(true)}>
                        <Plus size={16} />
                        Add Grade
                    </Button>
                )}
            </div>

            <GradeSelector selectedGrade={selectedGrade} onGradeChange={setSelectedGrade} />

            <div className="space-y-4">
                {getStudentResults(selectedGrade).map(student => (
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
                                            const s = data.students.find((s) => s.id === student.id);
                                            if (s) openEditStudent(s);
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
                                    const value = score as number;
                                    return (
                                <div key={subject} className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-gray-600 capitalize">{subject}</div>
                                    <div className={`text-xl font-bold ${
                                        value >= 85 ? 'text-green-600' :
                                            value >= 75 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                        {value}%
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={() => {
                                                const result = data.results.find(r =>
                                                    r.studentId === student.id && r.subject.toLowerCase() === subject
                                                );
                                                if (result) openEditGrade(result);
                                            }}
                                            className="mt-1 text-xs text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                                    );
                                })}
                        </div>
                    </Card>
                ))}

                {getStudentResults(selectedGrade).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No results available for {selectedGrade}
                    </div>
                )}
            </div>
        </div>
    );

    // Materials Page
    const Materials = () => (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Learning Materials</h1>
                {isAdmin && (
                    <Button variant="outline" size="sm" onClick={() => setShowMaterialModal(true)}>
                        <Plus size={16} />
                        Add Material
                    </Button>
                )}
            </div>

            <GradeSelector selectedGrade={selectedGrade} onGradeChange={setSelectedGrade} />

            <div className="space-y-4">
                {(data.materials[selectedGrade] || []).map(material => (
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
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDeleteMaterial(selectedGrade, material.id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}

                {(!data.materials[selectedGrade] || data.materials[selectedGrade].length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                        No materials available for {selectedGrade}
                    </div>
                )}
            </div>
        </div>
    );

    // Admin Page
    const Admin = () => (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <Button
                    variant={isAdmin ? 'danger' : 'success'}
                    size="sm"
                    onClick={() => setIsAdmin(!isAdmin)}
                >
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
                    {/* Students Management */}
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Students Management</h2>
                            <Button variant="primary" size="sm" onClick={() => setShowStudentModal(true)}>
                                <UserPlus size={16} />
                                Add Student
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {data.students.map(student => (
                                <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <h4 className="font-medium">{student.name}</h4>
                                        <p className="text-sm text-gray-600">{student.grade} • {student.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditStudent(student)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStudent(student.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Grade Management */}
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Grade Management</h2>
                            <Button variant="primary" size="sm" onClick={() => setShowGradeModal(true)}>
                                <Plus size={16} />
                                Add Grade
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {data.results.map(result => {
                                const student = data.students.find(s => s.id === result.studentId);
                                return (
                                    <div key={result.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium">{student?.name} - {result.subject}</h4>
                                            <p className="text-sm text-gray-600">Grade: {result.grade}% • {result.term} • {result.date}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditGrade(result)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGrade(result.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Events Management */}
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Events Management</h2>
                            <Button variant="primary" size="sm" onClick={() => setShowEventModal(true)}>
                                <Calendar size={16} />
                                Add Event
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {data.events.map(event => (
                                <div key={event.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <h4 className="font-medium">{event.title}</h4>
                                        <p className="text-sm text-gray-600">{event.date} • {event.type}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditEvent(event)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Materials Management */}
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Materials Management</h2>
                            <Button variant="primary" size="sm" onClick={() => setShowMaterialModal(true)}>
                                <FileText size={16} />
                                Add Material
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {Object.entries(data.materials).flatMap(([grade, materials]) =>
                                materials.map(material => (
                                    <div key={material.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium">{material.name}</h4>
                                            <p className="text-sm text-gray-600">{grade} • {material.type} • {material.size}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDeleteMaterial(grade, material.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4">
                <div className="flex items-center gap-2">
                    <Users size={28} />
                    <div>
                        <h1 className="text-lg font-bold">School Portal</h1>
                        <p className="text-sm opacity-90">Results & Materials</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'home' && <Dashboard />}
                {activeTab === 'results' && <Results />}
                {activeTab === 'materials' && <Materials />}
                {activeTab === 'admin' && <Admin />}
            </div>

            {/* Bottom Navigation */}
            <Navigation />

            {/* Modals */}
            <Modal
                isOpen={showEventModal}
                onClose={() => {
                    setShowEventModal(false);
                    setEditingItem(null);
                    setEventForm({ title: '', date: '', type: 'academic', description: '' });
                }}
                title={editingItem ? 'Edit Event' : 'Add New Event'}
            >
                <Input
                    label="Event Title"
                    value={eventForm.title}
                    onChange={(value) => setEventForm(prev => ({ ...prev, title: value }))}
                    placeholder="Enter event title"
                    required
                />
                <Input
                    label="Date"
                    type="date"
                    value={eventForm.date}
                    onChange={(value) => setEventForm(prev => ({ ...prev, date: value }))}
                    required
                />
                <Select
                    label="Event Type"
                    value={eventForm.type}
                    onChange={(value) => setEventForm(prev => ({ ...prev, type: value as EventType }))}
                    options={[
                        { value: 'academic', label: 'Academic' },
                        { value: 'sports', label: 'Sports' },
                        { value: 'meeting', label: 'Meeting' },
                        { value: 'cultural', label: 'Cultural' }
                    ]}
                    required
                />
                <Input
                    label="Description"
                    value={eventForm.description}
                    onChange={(value) => setEventForm(prev => ({ ...prev, description: value }))}
                    placeholder="Event description"
                />
                <div className="flex gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowEventModal(false);
                            setEditingItem(null);
                            setEventForm({ title: '', date: '', type: 'academic', description: '' });
                        }}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={editingItem ? handleUpdateEvent : handleCreateEvent}
                        className="flex-1"
                        disabled={!eventForm.title || !eventForm.date}
                    >
                        <Save size={16} />
                        {editingItem ? 'Update' : 'Create'}
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={showStudentModal}
                onClose={() => {
                    setShowStudentModal(false);
                    setEditingItem(null);
                    setStudentForm({ name: '', grade: '', email: '', phone: '' });
                }}
                title={editingItem ? 'Edit Student' : 'Add New Student'}
            >
                <Input
                    label="Student Name"
                    value={studentForm.name}
                    onChange={(value) => setStudentForm(prev => ({ ...prev, name: value }))}
                    placeholder="Enter student name"
                    required
                />
                <Select
                    label="Grade"
                    value={studentForm.grade}
                    onChange={(value) => setStudentForm(prev => ({ ...prev, grade: value }))}
                    options={GRADES.map(grade => ({ value: grade, label: grade }))}
                    required
                />
                <Input
                    label="Email"
                    type="email"
                    value={studentForm.email}
                    onChange={(value) => setStudentForm(prev => ({ ...prev, email: value }))}
                    placeholder="student@email.com"
                    required
                />
                <Input
                    label="Phone"
                    value={studentForm.phone}
                    onChange={(value) => setStudentForm(prev => ({ ...prev, phone: value }))}
                    placeholder="123-456-7890"
                />
                <div className="flex gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowStudentModal(false);
                            setEditingItem(null);
                            setStudentForm({ name: '', grade: '', email: '', phone: '' });
                        }}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={editingItem ? handleUpdateStudent : handleCreateStudent}
                        className="flex-1"
                        disabled={!studentForm.name || !studentForm.grade || !studentForm.email}
                    >
                        <Save size={16} />
                        {editingItem ? 'Update' : 'Create'}
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={showGradeModal}
                onClose={() => {
                    setShowGradeModal(false);
                    setEditingItem(null);
                    setGradeForm({ studentId: '', subject: '', grade: '', date: '', term: 'Q1' });
                }}
                title={editingItem ? 'Edit Grade' : 'Add New Grade'}
            >
                <Select
                    label="Student"
                    value={gradeForm.studentId}
                    onChange={(value) => setGradeForm(prev => ({ ...prev, studentId: value }))}
                    options={data.students.map(student => ({
                        value: student.id.toString(),
                        label: `${student.name} (${student.grade})`
                    }))}
                    required
                />
                <Select
                    label="Subject"
                    value={gradeForm.subject}
                    onChange={(value) => setGradeForm(prev => ({ ...prev, subject: value }))}
                    options={SUBJECTS.map(subject => ({ value: subject, label: subject }))}
                    required
                />
                <Input
                    label="Grade (%)"
                    type="number"
                    value={gradeForm.grade}
                    onChange={(value) => setGradeForm(prev => ({ ...prev, grade: value }))}
                    placeholder="85"
                    required
                />
                <Input
                    label="Date"
                    type="date"
                    value={gradeForm.date}
                    onChange={(value) => setGradeForm(prev => ({ ...prev, date: value }))}
                    required
                />
                <Select
                    label="Term"
                    value={gradeForm.term}
                    onChange={(value) => setGradeForm(prev => ({ ...prev, term: value as Term }))}
                    options={[
                        { value: 'Q1', label: 'Quarter 1' },
                        { value: 'Q2', label: 'Quarter 2' },
                        { value: 'Q3', label: 'Quarter 3' },
                        { value: 'Q4', label: 'Quarter 4' },
                        { value: 'Final', label: 'Final' }
                    ]}
                    required
                />
                <div className="flex gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowGradeModal(false);
                            setEditingItem(null);
                            setGradeForm({ studentId: '', subject: '', grade: '', date: '', term: 'Q1' });
                        }}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={editingItem ? handleUpdateGrade : handleCreateGrade}
                        className="flex-1"
                        disabled={!gradeForm.studentId || !gradeForm.subject || !gradeForm.grade || !gradeForm.date}
                    >
                        <Save size={16} />
                        {editingItem ? 'Update' : 'Create'}
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={showMaterialModal}
                onClose={() => {
                    setShowMaterialModal(false);
                    setMaterialForm({ name: '', type: 'pdf', grade: '', size: '1.0 MB' });
                }}
                title="Add New Material"
            >
                <Input
                    label="Material Name"
                    value={materialForm.name}
                    onChange={(value) => setMaterialForm(prev => ({ ...prev, name: value }))}
                    placeholder="Enter material name"
                    required
                />
                <Select
                    label="Grade"
                    value={materialForm.grade}
                    onChange={(value) => setMaterialForm(prev => ({ ...prev, grade: value }))}
                    options={GRADES.map(grade => ({ value: grade, label: grade }))}
                    required
                />
                <Select
                    label="File Type"
                    value={materialForm.type}
                    onChange={(value) => setMaterialForm(prev => ({ ...prev, type: value as MaterialType }))}
                    options={[
                        { value: 'pdf', label: 'PDF' },
                        { value: 'doc', label: 'Document' },
                        { value: 'ppt', label: 'Presentation' },
                        { value: 'video', label: 'Video' },
                        { value: 'image', label: 'Image' }
                    ]}
                    required
                />
                <Input
                    label="File Size"
                    value={materialForm.size}
                    onChange={(value) => setMaterialForm(prev => ({ ...prev, size: value }))}
                    placeholder="2.5 MB"
                    required
                />
                <div className="flex gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowMaterialModal(false);
                            setMaterialForm({ name: '', type: 'pdf', grade: '', size: '1.0 MB' });
                        }}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateMaterial}
                        className="flex-1"
                        disabled={!materialForm.name || !materialForm.grade}
                    >
                        <Save size={16} />
                        Create
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default SchoolApp;
