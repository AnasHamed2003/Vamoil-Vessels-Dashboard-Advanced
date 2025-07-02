"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ArrowLeft, Plus, Edit, Trash2, Mail, MailX, ExternalLink } from "lucide-react"
import { useFirebase } from "../components/FirebaseProvider"
import {
  getAllNotifications,
  addNotification,
  updateNotification,
  deleteNotification,
  getUsersForEmailNotifications,
} from "../utils/firebaseUtils"
import { createMailtoLink } from "../utils/emailService"

const AdminNotifications = () => {
  const { userRole } = useFirebase()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [sendEmails, setSendEmails] = useState(true)
  const [userCount, setUserCount] = useState(0)
  const [users, setUsers] = useState([])
  const [currentNotification, setCurrentNotification] = useState({ id: "", message: "", priority: "normal" })

  // Redirect if not admin
  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/")
    }
  }, [userRole, navigate])

  // Get user count
  useEffect(() => {
    const getUserCount = async () => {
      try {
        const usersList = await getUsersForEmailNotifications()
        setUsers(usersList)
        setUserCount(usersList.length)
      } catch (error) {
        console.error("Error getting user count:", error)
      }
    }

    getUserCount()
  }, [])

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const notificationsList = await getAllNotifications()
        setNotifications(notificationsList)
        setError(null)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        setError("Failed to load notifications. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentNotification((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentNotification.message.trim()) {
      setError("Notification message cannot be empty")
      return
    }

    try {
      if (isEditing) {
        // Update existing notification
        await updateNotification(currentNotification.id, {
          message: currentNotification.message,
          priority: currentNotification.priority,
          updatedAt: new Date().toISOString(),
        })

        // Update local state
        setNotifications(
          notifications.map((notification) =>
            notification.id === currentNotification.id
              ? { ...notification, ...currentNotification, updatedAt: new Date().toISOString() }
              : notification,
          ),
        )

        setSuccess("Notification updated successfully")
      } else {
        // Add new notification
        const newNotification = {
          message: currentNotification.message,
          priority: currentNotification.priority,
          createdAt: new Date().toISOString(),
        }

        const newNotificationId = await addNotification(newNotification, sendEmails)

        // Update local state
        setNotifications([...notifications, { id: newNotificationId, ...newNotification }])

        if (sendEmails) {
          setSuccess(`Notification added successfully and emails sent to ${userCount} users`)
        } else {
          setSuccess("Notification added successfully (Email sending disabled)")
        }
      }

      // Reset form
      resetForm()
    } catch (error) {
      console.error("Error saving notification:", error)
      setError(`Failed to ${isEditing ? "update" : "add"} notification. Please try again.`)
    }
  }

  const handleEdit = (notification) => {
    setCurrentNotification({
      id: notification.id,
      message: notification.message,
      priority: notification.priority || "normal",
    })
    setIsEditing(true)
    setError(null)
    setSuccess(null)

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return
    }

    try {
      await deleteNotification(id)

      // Update local state
      setNotifications(notifications.filter((notification) => notification.id !== id))
      setSuccess("Notification deleted successfully")

      // If we were editing this notification, reset the form
      if (currentNotification.id === id) {
        resetForm()
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      setError("Failed to delete notification. Please try again.")
    }
  }

  const handleSendViaMailto = () => {
    if (users.length === 0) {
      setError("No users found to send emails to")
      return
    }

    const mailtoLink = createMailtoLink(currentNotification, users)
    window.open(mailtoLink, "_blank")
  }

  const resetForm = () => {
    setCurrentNotification({ id: "", message: "", priority: "normal" })
    setIsEditing(false)
    setError(null)
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">Manage Notifications</h1>
          <Link to="/admin/dashboard">
            <Button
              variant="outline"
              className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-800 bg-transparent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">
              {isEditing ? "Edit Notification" : "Add New Notification"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-md">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="message" className="text-sm font-medium dark:text-white">
                  Notification Message*
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={currentNotification.message}
                  onChange={handleInputChange}
                  className="rounded-md border dark:border-gray-600 px-3 py-2 text-sm min-h-[100px] dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter notification message"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="priority" className="text-sm font-medium dark:text-white">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={currentNotification.priority}
                  onChange={handleInputChange}
                  className="rounded-md border dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {!isEditing && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium dark:text-white">Email Notifications</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sendEmails}
                        onChange={(e) => setSendEmails(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm dark:text-gray-300">
                        Send email to all users ({userCount} recipients)
                      </span>
                      {sendEmails ? (
                        <Mail className="h-4 w-4 text-green-600" />
                      ) : (
                        <MailX className="h-4 w-4 text-gray-400" />
                      )}
                    </label>
                  </div>

                  
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="dark:bg-purple-600 dark:hover:bg-purple-700">
                  {isEditing ? "Update Notification" : "Add Notification"}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-800 bg-transparent"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Current Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 dark:text-gray-300">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b dark:border-gray-600">
                      <th className="text-left py-3 px-4 dark:text-white">Message</th>
                      <th className="text-left py-3 px-4 w-24 dark:text-white">Priority</th>
                      <th className="text-left py-3 px-4 w-24 dark:text-white">Email Status</th>
                      <th className="text-left py-3 px-4 w-40 dark:text-white">Date</th>
                      <th className="text-left py-3 px-4 w-32 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notification) => (
                      <tr
                        key={notification.id}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="py-3 px-4 dark:text-gray-300">{notification.message}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              notification.priority === "high" || notification.priority === "urgent"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : notification.priority === "low"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {notification.priority || "normal"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {notification.emailsSent ? (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-600 dark:text-green-400">
                                {notification.successfulEmails || 0}/{notification.emailCount || 0}
                              </span>
                            </div>
                          ) : notification.emailError ? (
                            <div className="flex items-center gap-1">
                              <MailX className="h-4 w-4 text-red-600" />
                              <span className="text-xs text-red-600 dark:text-red-400">Failed</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No email</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(notification.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 bg-transparent"
                              onClick={() => handleEdit(notification)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No notifications found</p>
                <Button
                  onClick={() => setCurrentNotification({ id: "", message: "", priority: "normal" })}
                  className="dark:bg-purple-600 dark:hover:bg-purple-700"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Notification
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminNotifications
