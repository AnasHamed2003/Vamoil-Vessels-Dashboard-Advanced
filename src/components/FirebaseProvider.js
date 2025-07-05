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

// Hook for auth (backward compatibility)
export const useAuth = () => {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("useAuth must be used within a FirebaseProvider")
  }
  return {
    user: context.user,
    userProfile: context.userProfile,
    loading: context.loading,
    authChecked: context.authChecked,
    isAdmin: context.isAdmin,
  }
}

// Firebase provider component
export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    console.log("FirebaseProvider: Setting up auth listener")

    // Listen for auth state changes - NO CLEARING OF AUTH DATA
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log("Auth state changed:", authUser ? `User: ${authUser.email}` : "No user")

      try {
        if (authUser) {
          // User is signed in
          setUser(authUser)
          console.log("User authenticated:", authUser.email)

          // Fetch user data from Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", authUser.uid))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              console.log("User data from Firestore:", userData)

              // Set both userProfile and userRole for backward compatibility
              setUserProfile(userData)
              setUserRole(userData.role || "user")
            } else {
              console.log("No user document found, creating basic profile")
              // Create a basic profile if none exists
              const basicProfile = {
                email: authUser.email,
                fullName: authUser.displayName || authUser.email.split("@")[0],
                role: "user",
                createdAt: new Date().toISOString(),
              }
              setUserProfile(basicProfile)
              setUserRole("user")
            }
          } catch (error) {
            console.error("Error fetching user data:", error)

            // Fallback profile
            const fallbackProfile = {
              email: authUser.email,
              fullName: authUser.displayName || authUser.email.split("@")[0],
              role: "user",
              createdAt: new Date().toISOString(),
            }
            setUserProfile(fallbackProfile)
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
          console.log("No user authenticated")
          setUser(null)
          setUserProfile(null)
          setUserRole(null)
        }
      } catch (error) {
        console.error("Error in auth state change handler:", error)
      } finally {
        setLoading(false)
        setAuthChecked(true)
        console.log("Auth check completed, loading:", false, "authChecked:", true)
      }
    })

    // Cleanup subscription
    return () => {
      console.log("FirebaseProvider: Cleaning up auth listener")
      unsubscribe()
    }
  }, [])

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth)
      console.log("User signed out successfully")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Value to be provided to consuming components
  const value = {
    user,
    userProfile,
    userRole,
    loading,
    authChecked,
    auth,
    db,
    isAdmin: userRole === "admin",
    logout,
  }

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
}
