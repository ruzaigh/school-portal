# Developer Onboarding Guide

Welcome to the School Portal project! This guide will help you get up and running quickly and understand the codebase architecture.

## Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Project Architecture](#project-architecture)
3. [Development Workflow](#development-workflow)
4. [Component Reference](#component-reference)
5. [Domain Knowledge](#domain-knowledge)
6. [Common Development Tasks](#common-development-tasks)
7. [Troubleshooting](#troubleshooting)

## Quick Start Guide

### Prerequisites

- Node.js (version 18+ recommended)
- npm or yarn package manager
- Modern web browser
- Code editor (VS Code recommended)

### Environment Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd school-portal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` with hot reload enabled.

4. **Verify setup**:
   - Open the application in your browser
   - You should see the School Portal dashboard
   - Try switching between tabs (Dashboard, Results, Materials, Admin)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (TypeScript compile + Vite build) |
| `npm run lint` | Run ESLint on all TypeScript/TSX files |
| `npm run preview` | Preview production build locally |

## Project Architecture

### Tech Stack Overview

This is a **React single-page application (SPA)** built with modern tooling:

- **React 19.1** with TypeScript for UI components
- **Vite 7.1** for fast development and building
- **Tailwind CSS v4** for styling (using @tailwindcss/vite plugin)
- **Lucide React** for consistent iconography
- **ESLint** with TypeScript support for code quality

### Application Structure

```
/Users/ruzaighkalam/WebstormProjects/school-portal/
├── src/
│   ├── App.tsx              # Main app wrapper
│   ├── main.tsx             # React app entry point
│   ├── school.tsx           # Core application component (1200+ lines)
│   ├── index.css            # Global styles
│   └── assets/              # Static assets
├── public/                  # Public assets
├── dist/                    # Production build output
├── CLAUDE.md               # Development guidance for AI assistant
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── eslint.config.js        # ESLint configuration
```

### Key Architecture Decisions

1. **Single Component Architecture**: The entire application logic is contained in `/Users/ruzaighkalam/WebstormProjects/school-portal/src/school.tsx` (lines 1-1276)
2. **Tab-based Navigation**: Four main sections - Dashboard, Results, Materials, Admin
3. **Modal-based Forms**: All CRUD operations use reusable modal system
4. **Mobile-First Design**: Responsive with `max-w-md mx-auto` container
5. **In-Memory Data**: Mock data with no backend persistence

## Development Workflow

### Git Workflow

The project follows a simple Git workflow:

- **Main branch**: `master` (production-ready code)
- **Feature development**: Create feature branches from `master`
- **Commit style**: Follow conventional commits format

### Code Quality

#### ESLint Configuration

Located in `/Users/ruzaighkalam/WebstormProjects/school-portal/eslint.config.js`:
- TypeScript ESLint rules enabled
- React Hooks rules enforced
- React Refresh rules for Vite

#### TypeScript Configuration

- **Strict mode enabled** (`tsconfig.app.json` line 19)
- **Modern ES2022 target** with DOM types
- **Unused variables/parameters detection** (lines 20-21)

### Testing Strategy

**Note**: No testing framework is currently configured. Consider adding:
- Jest/Vitest for unit testing
- React Testing Library for component testing
- Playwright for E2E testing (already in devDependencies)

## Component Reference

### Reusable UI Components

All components are defined in `/Users/ruzaighkalam/WebstormProjects/school-portal/src/school.tsx`:

#### Card Component (lines 123-135)
```typescript
interface CardProps {
    children: ReactNode
    className?: string
    onClick?: () => void
}
```
**Usage**: Container with shadow and padding
```tsx
<Card className="mb-4">
    <h2>Content Title</h2>
    <p>Content goes here</p>
</Card>
```

#### Button Component (lines 137-169)
```typescript
interface ButtonProps {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
    size?: 'sm' | 'md' | 'lg'
    onClick?: () => void
    className?: string
    disabled?: boolean
}
```
**Usage**: Multi-variant button with consistent styling
```tsx
<Button variant="primary" onClick={handleClick}>
    Save Changes
</Button>
```

#### Input Component (lines 171-191)
```typescript
interface InputProps {
    label?: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
    required?: boolean
}
```

#### Select Component (lines 193-216)
```typescript
interface SelectProps {
    label?: string
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
    required?: boolean
}
```

#### Modal Component (lines 218-242)
Full-screen overlay modal with header and close functionality.

#### GradeSelector Component (lines 244-274)
Grid-based grade selection interface.

#### ImageCarousel Component (lines 276-340)
Auto-rotating image display with navigation controls.

### Application Sections

#### Dashboard (lines 570-668)
- Events display with CRUD operations (admin mode)
- Grade performance visualization
- School image carousel
- Admin mode indicator

#### Results (lines 670-751)
- Grade selector interface
- Student results by grade level
- Subject-wise grade display with color coding
- Edit capabilities in admin mode

#### Materials (lines 753-812)
- Learning materials by grade
- File type and size display
- Download/preview functionality
- Material management (admin mode)

#### Admin Panel (lines 814-976)
- Admin mode toggle
- CRUD operations for all entities
- Students, grades, events, and materials management

## Domain Knowledge

### Core Data Models

Defined in `/Users/ruzaighkalam/WebstormProjects/school-portal/src/school.tsx` (lines 7-61):

#### Student Management
```typescript
interface StudentItem {
    id: number
    name: string
    grade: string  // 'Grade 1' through 'Grade 7'
    email: string
    phone: string
}
```

#### Academic Results
```typescript
interface ResultItem {
    id: number
    studentId: number
    subject: string  // Math, English, Science, History, Art
    grade: number    // Percentage score
    date: string
    term: Term      // Q1, Q2, Q3, Q4, Final
}
```

#### School Events
```typescript
interface EventItem {
    id: number
    title: string
    date: string
    type: EventType  // academic, sports, meeting, cultural
    description: string
}
```

#### Learning Materials
```typescript
interface MaterialItem {
    id: number
    name: string
    type: MaterialType  // pdf, doc, ppt, video, image
    size: string
    uploadDate: string
}
```

### Business Logic

#### Grade Calculations (lines 362-387)
The `calculateGradeAverages()` function:
- Calculates average grades by class level
- Handles students with no results (returns 0)
- Used for dashboard performance visualization

#### Data Relationships
- Students → Results (one-to-many via `studentId`)
- Materials → Grades (organized by grade level in nested object)
- Events → Types (categorized for display styling)

### School System Context

**Sunshine Elementary School** serves grades 1-7 with:
- **5 core subjects**: Math, English, Science, History, Art
- **4 quarterly terms** plus final evaluations
- **4 event categories**: Academic, Sports, Meeting, Cultural
- **5 material types**: PDF, Document, Presentation, Video, Image

## Common Development Tasks

### Adding a New Student

1. **Through UI** (Admin Mode):
   ```tsx
   // Navigate to Admin tab → Students Management → Add Student
   // Modal form handles validation and state updates
   ```

2. **Programmatically** (for testing):
   ```tsx
   const newStudent = {
       id: Date.now(),
       name: "New Student",
       grade: "Grade 3",
       email: "student@email.com",
       phone: "123-456-7890"
   };
   setData(prev => ({ ...prev, students: [...prev.students, newStudent] }));
   ```

### Creating CRUD Operations

Pattern used throughout the application (example from lines 390-414):

```tsx
// Create operation
const handleCreateItem = () => {
    const newItem = {
        id: Date.now(),  // Simple ID generation
        ...formData
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setShowModal(false);
    resetForm();
};

// Update operation
const handleUpdateItem = () => {
    setData(prev => ({
        ...prev,
        items: prev.items.map(item =>
            item.id === editingItem?.id ? { ...item, ...formData } : item
        )
    }));
    setShowModal(false);
    setEditingItem(null);
    resetForm();
};

// Delete operation
const handleDeleteItem = (id: number) => {
    setData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
};
```

### Adding New UI Components

1. **Define interfaces** following the existing pattern:
   ```tsx
   interface NewComponentProps {
       // Props definition
   }
   ```

2. **Implement component** with consistent styling:
   ```tsx
   const NewComponent = ({ ...props }: NewComponentProps) => (
       <div className="bg-white rounded-lg shadow-md p-4">
           {/* Component content */}
       </div>
   );
   ```

3. **Follow Tailwind patterns** used throughout:
   - `bg-white rounded-lg shadow-md p-4` for cards
   - `text-gray-800` for primary text
   - `text-gray-600` for secondary text
   - `bg-blue-600 text-white` for primary buttons

### State Management Patterns

The application uses React's built-in state management (lines 342-361):

```tsx
// Main data store
const [data, setData] = useState<SchoolData>(initialData);

// UI state
const [activeTab, setActiveTab] = useState<TabId>('home');
const [selectedGrade, setSelectedGrade] = useState<string>('Grade 1');
const [isAdmin, setIsAdmin] = useState<boolean>(false);

// Modal states
const [showEventModal, setShowEventModal] = useState<boolean>(false);
// ... other modal states

// Form states
const [eventForm, setEventForm] = useState<EventFormState>({ /* initial values */ });
// ... other form states
```

### Styling Guidelines

#### Tailwind CSS Patterns

**Color Scheme**:
- Primary: `bg-blue-600`, `text-blue-600`, `hover:bg-blue-700`
- Success: `bg-green-600`, `text-green-600`
- Warning: `bg-yellow-500`, `text-yellow-600`
- Danger: `bg-red-600`, `text-red-600`
- Neutral: `bg-gray-200`, `text-gray-800`

**Layout Patterns**:
- Container: `max-w-md mx-auto` (mobile-first)
- Cards: `bg-white rounded-lg shadow-md p-4`
- Buttons: `px-4 py-2 rounded-lg transition-colors`
- Grid layouts: `grid grid-cols-3 gap-4`

### Adding New Features

1. **Define data models** (add to type definitions)
2. **Update mock data** (add to `initialData`)
3. **Create CRUD handlers** (following existing patterns)
4. **Add UI components** (modal forms, display cards)
5. **Update navigation** if needed
6. **Test in admin mode** for full functionality

## Troubleshooting

### Common Issues

#### Development Server Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### TypeScript Errors
```bash
# Run type checking
npx tsc --noEmit
# Check ESLint
npm run lint
```

#### Build Failures
```bash
# Clean build and retry
rm -rf dist
npm run build
```

#### Hot Reload Not Working
- Check that you're editing files in the `src/` directory
- Ensure Vite dev server is running on correct port
- Try restarting the dev server

### Performance Considerations

1. **Large Component Warning**: `/Users/ruzaighkalam/WebstormProjects/school-portal/src/school.tsx` is 1200+ lines
   - Consider splitting into smaller components for better maintainability
   - Extract reusable components to separate files

2. **State Updates**: All CRUD operations trigger full re-renders
   - Consider React.memo() for expensive components
   - Implement useCallback() for event handlers

3. **Image Loading**: Carousel images load from external URLs
   - Consider lazy loading for better performance
   - Add loading states for better UX

### Debugging Tips

1. **React Developer Tools**: Install browser extension for component inspection
2. **Console Logging**: Add strategic `console.log()` statements
3. **TypeScript**: Leverage type checking for catching errors early
4. **Network Tab**: Monitor API calls (though this app uses mock data)

### Getting Help

1. **Code Structure**: Reference `/Users/ruzaighkalam/WebstormProjects/school-portal/CLAUDE.md` for AI assistant guidance
2. **Component Examples**: Look at existing components in `/Users/ruzaighkalam/WebstormProjects/school-portal/src/school.tsx`
3. **TypeScript Issues**: Check `tsconfig.app.json` configuration
4. **Styling Questions**: Reference Tailwind CSS v4 documentation

### Next Steps

After completing onboarding:

1. **Explore Admin Mode**: Toggle admin mode to see all CRUD operations
2. **Try All Features**: Navigate through all tabs and test functionality  
3. **Review Code Patterns**: Study the component and state management patterns
4. **Consider Improvements**: Think about code organization and performance optimizations
5. **Set up Testing**: Add testing framework for robust development

---

*This documentation is based on the current state of the codebase as of the analysis date. Keep it updated as the project evolves.*