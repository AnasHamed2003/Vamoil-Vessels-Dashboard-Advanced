import { Navigate } from "react-router-dom"
import { useFirebase } from "./FirebaseProvider"

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, userRole } = useFirebase()

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  // If route requires admin access and user is not an admin
  if (requireAdmin && userRole !== "admin") {
    return <Navigate to="/" />
  }

  return <>{children}</>
}

export default ProtectedRoute
