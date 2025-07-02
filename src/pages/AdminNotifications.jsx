"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ArrowLeft, Plus, Edit, Trash2, Mail, MailX, ExternalLink, Settings } from "lucide-react"
import { useFirebase } from "../components/FirebaseProvider"
import {
  getAllNotifications,
  addNotification,
  updateNotification,
  deleteNotification,
  getUsersForEmailNotifications,
} from "../utils/firebaseUtils"
import { validateEmailConfig, createMailtoLink, getEmailServiceStatus } from "../utils/emailService"

const AdminNotifications = () => {
  const { userRole } = useFirebase()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [sendEmails, setSendEmails] = useState(true)
  const [emailConfigured, setEmailConfigured] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [users, setUsers] = useState([])
  const [emailStatus, setEmailStatus] = useState({})
  const [currentNotification, setCurrentNotification] = useState({ id: "", message: "", priority: "normal" })

  // Redirect if not admin
  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/")
    }
  }, [userRole, navigate])

  // Check email configuration and get user count
  useEffect(() => {
    const checkEmailConfig = () => {
      const configured = validateEmailConfig()
      const status = getEmailServiceStatus()
      setEmailConfigured(configured)
      setEmailStatus(status)
    }

    const getUserCount = async () => {
      try {
        const usersList = await getUsersForEmailNotifications()
        setUsers(usersList)
        setUserCount(usersList.length)
      } catch (error) {
        console.error("Error getting user count:", error)
      }
    }

    checkEmailConfig()
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

        const newNotificationId = await addNotification(newNotification, sendEmails && emailConfigured)

        // Update local state
        setNotifications([...notifications, { id: newNotificationId, ...newNotification }])

        if (sendEmails && emailConfigured) {
          setSuccess(`Notification added successfully and emails sent to ${userCount} users`)
        } else if (sendEmails && !emailConfigured) {
          setSuccess("Notification added successfully (Email service simulated)")
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
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Notifications</h1>
          <Link to="/admin/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Email Configuration Status */}
        <Card
          className={`mb-6 ${emailStatus.configured ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}`}
        >
          <CardContent className="p-4">
            <div className={`flex items-center gap-2 ${emailStatus.configured ? "text-green-700" : "text-yellow-700"}`}>
              <Settings className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium">Email Service Status: {emailStatus.status}</p>
                <p className="text-sm">
                  Template ID: {emailStatus.templateId} | Service: {emailStatus.service}
                </p>
                {!emailStatus.configured && (
                  <p className="text-sm mt-1">
                    <strong>To enable real emails:</strong> Update your EmailJS Service ID and Public Key in the email
                    service configuration.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Notification" : "Add New Notification"}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Notification Message*
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={currentNotification.message}
                  onChange={handleInputChange}
                  className="rounded-md border px-3 py-2 text-sm min-h-[100px]"
                  placeholder="Enter notification message"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={currentNotification.priority}
                  onChange={handleInputChange}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {!isEditing && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email Notifications</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sendEmails}
                        onChange={(e) => setSendEmails(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">
                        Send email to all users ({userCount} recipients) - {emailStatus.service}
                      </span>
                      {sendEmails ? (
                        <Mail className="h-4 w-4 text-green-600" />
                      ) : (
                        <MailX className="h-4 w-4 text-gray-400" />
                      )}
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                    <p className="text-sm text-blue-700 font-medium mb-2">📧 Send Real Emails Now:</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendViaMailto}
                      disabled={!currentNotification.message.trim()}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in Your Email Client
                    </Button>
                    <p className="text-xs text-blue-600 mt-2">
                      This will open your default email client (Outlook, Gmail, etc.) with all user emails pre-filled.
                      You can send the notification immediately from there.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit">{isEditing ? "Update Notification" : "Add Notification"}</Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Message</th>
                      <th className="text-left py-3 px-4 w-24">Priority</th>
                      <th className="text-left py-3 px-4 w-24">Email Status</th>
                      <th className="text-left py-3 px-4 w-40">Date</th>
                      <th className="text-left py-3 px-4 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notification) => (
                      <tr key={notification.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{notification.message}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              notification.priority === "high" || notification.priority === "urgent"
                                ? "bg-red-100 text-red-800"
                                : notification.priority === "low"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {notification.priority || "normal"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {notification.emailsSent ? (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-600">
                                {notification.successfulEmails || 0}/{notification.emailCount || 0}
                              </span>
                            </div>
                          ) : notification.emailError ? (
                            <div className="flex items-center gap-1">
                              <MailX className="h-4 w-4 text-red-600" />
                              <span className="text-xs text-red-600">Failed</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No email</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(notification.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(notification)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                <p className="text-gray-500 mb-4">No notifications found</p>
                <Button onClick={() => setCurrentNotification({ id: "", message: "", priority: "normal" })}>
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
