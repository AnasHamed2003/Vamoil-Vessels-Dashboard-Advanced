"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { ArrowLeft } from "lucide-react"
import { useFirebase } from "../components/FirebaseProvider"
import { createUser } from "../utils/firebaseUtils"

const AdminAddUser = () => {
  const { userRole } = useFirebase()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "admin", // Default to admin for this form
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // Redirect if not admin
  useState(() => {
    if (userRole !== "admin") {
      navigate("/")
    }
  }, [userRole, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      // Create user with admin role
      await createUser(formData.email, formData.password, {
        fullName: formData.fullName,
        role: formData.role,
      })

      setSuccess(`Successfully created ${formData.role} account for ${formData.email}`)

      // Reset form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        role: "admin",
      })
    } catch (error) {
      console.error("Error creating user:", error)

      if (error.code === "auth/email-already-in-use") {
        setError("Email is already in use")
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address")
      } else {
        setError(`Error creating account: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Add New Admin User</h1>
          <Link to="/admin/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Admin Account</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>}
            {success && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name*</Label>
                <input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="rounded-md border px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email Address*</Label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="rounded-md border px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password*</Label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="rounded-md border px-3 py-2 text-sm"
                  required
                />
                <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password*</Label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="rounded-md border px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">User Role*</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="rounded-md border px-3 py-2 text-sm"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="user">Regular User</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/admin/dashboard")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminAddUser
