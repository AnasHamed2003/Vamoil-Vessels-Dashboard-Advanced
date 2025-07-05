"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./FirebaseProvider"

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, userProfile, loading, authChecked } = useAuth()
  const location = useLocation()

  console.log("ProtectedRoute check:", {
    loading,
    authChecked,
    user: user ? user.email : "No user",
    userProfile: userProfile ? userProfile.role : "No profile",
    currentPath: location.pathname,
  })

  // Show loading spinner while Firebase is checking authentication
  if (loading || !authChecked) {
    console.log("ProtectedRoute: Still loading or auth not checked")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2e1a47] dark:border-purple-400"></div>
          <p className="text-gray-600 dark:text-gray-300">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Only redirect to login after we've confirmed there's no user
  if (!user) {
    console.log("ProtectedRoute: No user found, redirecting to login")
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check admin permissions
  if (adminOnly && userProfile?.role !== "admin") {
    console.log("ProtectedRoute: Admin access required, redirecting to dashboard")
    return <Navigate to="/dashboard" replace />
  }

  console.log("ProtectedRoute: Access granted")
  return children
}

export default ProtectedRoute
