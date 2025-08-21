
import './App.css'
import { AuthProvider } from './contexts/AuthProvider'
import ProtectedRoute from './components/auth/ProtectedRoute'
import SchoolApp from "./school.tsx"

function App() {

  return (
    <AuthProvider>
      <ProtectedRoute>
        <SchoolApp />
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default App
