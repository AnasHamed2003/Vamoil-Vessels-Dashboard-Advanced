"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { auth, db } from "../lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

// Create context
export const FirebaseContext = createContext(null)

// Hook to use the Firebase context
export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}

// Firebase provider component
export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Clear all authentication on app start
    const clearAuthOnStart = async () => {
      try {
        // Sign out any existing user
        await signOut(auth)
        console.log("Cleared existing authentication on app start")

        // Clear any stored authentication data
        localStorage.removeItem("firebase:authUser")
        sessionStorage.removeItem("firebase:authUser")

        // Clear any other auth-related storage
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith("firebase:") || key.startsWith("CachedAuthUser")) {
            localStorage.removeItem(key)
          }
        })

        const sessionKeys = Object.keys(sessionStorage)
        sessionKeys.forEach((key) => {
          if (key.startsWith("firebase:") || key.startsWith("CachedAuthUser")) {
            sessionStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.log("No existing user to sign out:", error.message)
      }
    }

    // Clear auth on component mount (app start)
    clearAuthOnStart()

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log("Auth state changed:", authUser ? authUser.uid : "No user")

      if (authUser) {
        // User is signed in
        setUser(authUser)

        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", authUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            console.log("User data from Firestore:", userData)
            setUserRole(userData.role || "user")
          } else {
            console.log("No user document found, defaulting to user role")
            setUserRole("user")
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
          setUserRole("user")

          if (error.code === "permission-denied") {
            console.warn(
              "Permission denied when accessing user data. Please check your Firestore security rules. " +
                "Defaulting to 'user' role for now.",
            )
          }
        }
      } else {
        // User is signed out
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth)

      // Clear storage after logout
      localStorage.removeItem("firebase:authUser")
      sessionStorage.removeItem("firebase:authUser")

      console.log("User signed out successfully")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Value to be provided to consuming components
  const value = {
    user,
    userRole,
    loading,
    auth,
    db,
    isAdmin: userRole === "admin",
    logout,
  }

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
}
