# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (TypeScript compile + Vite build)
- `npm run lint` - Run ESLint on all TypeScript/TSX files
- `npm run preview` - Preview production build locally

## Project Architecture

This is a React single-page application (SPA) built with Vite and TypeScript, implementing a school portal system for managing students, grades, materials, and events.

### Tech Stack
- **React 19.1** with TypeScript for UI components
- **Vite 7.1** for fast development and building
- **Tailwind CSS v4** for styling (using @tailwindcss/vite plugin)
- **Lucide React** for consistent iconography
- **ESLint** with TypeScript support for code quality

### Application Structure

The entire application is contained in a single component (`src/school.tsx`) with:

- **Tab-based navigation**: Dashboard, Results, Materials, Admin
- **Modal-based forms**: Create/edit entities with reusable modal system
- **Admin mode toggle**: Controls visibility of CRUD operations
- **Responsive design**: Mobile-first with max-width constraint

### Core Data Models

```typescript
type EventType = 'academic' | 'sports' | 'meeting' | 'cultural'
type MaterialType = 'pdf' | 'doc' | 'ppt' | 'video' | 'image' 
type Term = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Final'

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
    grade: string  // 'Grade 1' through 'Grade 7'
    email: string
    phone: string
}

interface ResultItem {
    id: number
    studentId: number
    subject: string  // Math, English, Science, History, Art
    grade: number    // Percentage score
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
```

### Component Architecture

**Reusable UI Components** (all defined in school.tsx):
- `Card` - Container with shadow and padding
- `Button` - Multi-variant button (primary, secondary, outline, danger, success)
- `Input` - Form input with label support
- `Select` - Dropdown with options
- `Modal` - Overlay modal with header and close functionality
- `GradeSelector` - Grade selection grid
- `ImageCarousel` - Auto-rotating image display

**Main Application Sections**:
- `Dashboard` - Overview with events, grade averages, image carousel
- `Results` - Student grade viewing by grade level
- `Materials` - Learning material downloads by grade
- `Admin` - CRUD operations for all entities (requires admin mode)

### State Management

Uses React's built-in state with hooks:
- `data: SchoolData` - Main application data store
- `activeTab: TabId` - Current navigation tab
- `selectedGrade: string` - Current grade filter
- `isAdmin: boolean` - Admin mode toggle
- Form states for each modal (eventForm, studentForm, gradeForm, materialForm)
- Modal visibility states

### Data Flow Patterns

- **Mock Data**: Application starts with `initialData` object
- **CRUD Operations**: Direct state mutations using setter functions
- **Grade Calculations**: Computed averages based on student results
- **Filtered Views**: Data filtering by grade selection
- **Form Handling**: Controlled components with individual form states

### Development Notes

- All data is stored in memory (mock data) - no persistence layer
- Components follow DRY principle with reusable UI elements
- TypeScript strict mode enabled with comprehensive linting
- Mobile-first responsive design with 'max-w-md mx-auto' container
- Admin mode controls CRUD button visibility throughout the application
- Grade averages calculated dynamically from student results
- Materials organized by grade level in nested object structure

### Styling Approach

- Tailwind CSS v4 with utility classes
- Consistent color scheme: blue (primary), gray (neutral), green/yellow/red (status)
- Shadow and hover effects for interactive elements
- Responsive grid layouts for data display
- Fixed bottom navigation for mobile UX