"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useFirebase } from "../components/FirebaseProvider"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { getAllUsers, updateUser, deleteUser } from "../utils/firebaseUtils"

const AdminUsers = () => {
  const { userRole } = useFirebase()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: "", text: "" })
  const navigate = useNavigate()

  // Redirect if not admin
  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/")
    }
  }, [userRole, navigate])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const usersList = await getAllUsers()
        setUsers(usersList)
      } catch (error) {
        console.error("Error fetching users:", error)
        setMessage({ type: "error", text: "Failed to load users. Please try again." })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole })

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

      setMessage({ type: "success", text: "User role updated successfully!" })
    } catch (error) {
      console.error("Error updating user role:", error)
      setMessage({ type: "error", text: "Failed to update user role. Please try again." })
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      await deleteUser(userId)

      // Update local state
      setUsers(users.filter((user) => user.id !== userId))

      setMessage({ type: "success", text: "User deleted successfully!" })
    } catch (error) {
      console.error("Error deleting user:", error)
      setMessage({ type: "error", text: "Failed to delete user. Please try again." })
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{user.fullName || "N/A"}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleChange(user.id, user.role === "admin" ? "user" : "admin")}
                            >
                              {user.role === "admin" ? "Make User" : "Make Admin"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">No users found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminUsers
