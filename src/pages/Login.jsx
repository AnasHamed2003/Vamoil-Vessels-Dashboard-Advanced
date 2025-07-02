"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Label } from "../components/ui/label"
import { createUser } from "../utils/firebaseUtils"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Update the handleLogin function to handle permission errors
  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("Attempting login with:", email) // Debug log

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      console.log("Login successful, user:", user.uid) // Debug log

      try {
        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          console.log("User data retrieved:", userData) // Debug log

          // Redirect based on user role - admins go directly to admin dashboard
          if (userData.role === "admin") {
            console.log("Redirecting admin to admin dashboard") // Debug log
            navigate("/admin/dashboard")
          } else {
            console.log("Redirecting user to main dashboard") // Debug log
            navigate("/")
          }
        } else {
          console.log("User document doesn't exist, creating one") // Debug log

          try {
            // If user document doesn't exist, create one with default role
            await setDoc(doc(db, "users", user.uid), {
              email: user.email,
              fullName: user.displayName || email.split("@")[0],
              role: "user",
              createdAt: new Date().toISOString(),
            })
          } catch (createError) {
            console.error("Error creating user document:", createError)
            // Continue even if document creation fails
          }

          // New users are regular users, redirect to main dashboard
          navigate("/")
        }
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError) // Debug log

        // Handle permission errors specifically
        if (firestoreError.code === "permission-denied") {
          console.warn("Permission denied when accessing Firestore. Check your security rules.")
        }

        // If there's an error with Firestore, still allow login but redirect to main dashboard
        navigate("/")
      }
    } catch (error) {
      console.error("Login error:", error) // Debug log

      // Provide more specific error messages
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setError("Invalid email or password. Please try again.")
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.")
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.")
      } else {
        setError(`Login failed: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      console.log("Creating new user:", email) // Debug log

      // Create user with our utility function
      const newUser = await createUser(email, password, {
        fullName,
        role: "user", // Always set to "user" for self-registration
      })

      console.log("User created successfully:", newUser) // Debug log
      navigate("/") // Regular users always go to main dashboard
    } catch (error) {
      console.error("Signup error:", error) // Debug log

      if (error.code === "auth/email-already-in-use") {
        setError("Email is already in use")
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address")
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak")
      } else {
        setError(`Error creating account: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#2e1a47]">VAMOIL</h1>
          <p className="text-xl text-gray-600">INTERNATIONAL</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <h2 className="mb-6 text-2xl font-bold">Login to your account</h2>

              {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-600">{error}</div>}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <h2 className="mb-6 text-2xl font-bold">Create a user account</h2>
              <p className="text-sm text-gray-500 mb-4">
                Sign up for a standard user account. Administrator accounts can only be created by existing
                administrators.
              </p>

              {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-600">{error}</div>}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default Login
