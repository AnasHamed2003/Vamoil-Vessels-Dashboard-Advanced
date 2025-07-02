"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { useFirebase } from "../components/FirebaseProvider"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { signOut } from "firebase/auth"

const Profile = () => {
  const { user, userRole, auth, db } = useFirebase()
  const [fullName, setFullName] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      setFullName(user.displayName || "")
      // You might want to fetch this from Firestore user document
      setEmailNotifications(true) // Default value
    }
  }, [user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      // Update display name in Firebase Auth
      await updateProfile(user, { displayName: fullName })

      // Update user document in Firestore
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        fullName,
        emailNotifications,
      })

      setMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Failed to update profile. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
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

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ""}
                      className="w-full rounded-md border px-3 py-2 bg-gray-100"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-md border px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium mb-1">
                      Account Type
                    </label>
                    <input
                      type="text"
                      id="role"
                      value={userRole === "admin" ? "Administrator" : "Standard User"}
                      className="w-full rounded-md border px-3 py-2 bg-gray-100"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email Notifications</label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Receive email notifications</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Get notified via email when new announcements are posted
                    </p>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button type="submit" className="bg-[#2e1a47] hover:bg-[#3d2361]" disabled={loading}>
                      {loading ? "Updating..." : "Update Profile"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="w-24 h-24 rounded-full bg-[#2e1a47] text-white flex items-center justify-center text-2xl font-bold mb-4">
                      {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-semibold text-lg">{fullName || user?.email}</h3>
                    <p className="text-sm text-gray-500">{userRole === "admin" ? "Administrator" : "Standard User"}</p>
                  </div>

                  {userRole === "admin" && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Admin Privileges</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Manage all vessels</li>
                        <li>• Access to all reports</li>
                        <li>• User management</li>
                        <li>• System configuration</li>
                      </ul>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Account Created</h4>
                    <p className="text-sm">
                      {user?.metadata?.creationTime
                        ? new Date(user.metadata.creationTime).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
