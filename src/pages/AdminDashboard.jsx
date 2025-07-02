"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { useFirebase } from "../components/FirebaseProvider"
import { getAllUsers, getAllVessels, getAllNotifications } from "../utils/firebaseUtils"
import { Users, Ship, Bell, UserPlus } from "lucide-react"

const AdminDashboard = () => {
  const { userRole } = useFirebase()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    users: 0,
    vessels: 0,
    notifications: 0,
  })
  const [loading, setLoading] = useState(true)

  // Redirect if not admin
  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/")
    }
  }, [userRole, navigate])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Get users count
        const users = await getAllUsers()

        // Get vessels count
        const vessels = await getAllVessels()

        // Get notifications count
        const notifications = await getAllNotifications()

        // Set stats
        setStats({
          users: users.length,
          vessels: vessels.length,
          notifications: notifications.length,
        })
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link to="/admin/add-user">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add Admin User
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.users}</div>
              <p className="text-xs text-muted-foreground">
                {stats.users === 1 ? "1 registered user" : `${stats.users} registered users`}
              </p>
              <div className="mt-4">
                <Link to="/admin/users">
                  <Button size="sm" variant="outline">
                    Manage Users
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vessels</CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.vessels}</div>
              <p className="text-xs text-muted-foreground">
                {stats.vessels === 1 ? "1 vessel in fleet" : `${stats.vessels} vessels in fleet`}
              </p>
              <div className="mt-4">
                <Link to="/vessels">
                  <Button size="sm" variant="outline">
                    Manage Vessels
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.notifications}</div>
              <p className="text-xs text-muted-foreground">
                {stats.notifications === 1 ? "1 active notification" : `${stats.notifications} active notifications`}
              </p>
              <div className="mt-4">
                <Link to="/admin/notifications">
                  <Button size="sm" variant="outline">
                    Manage Notifications
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/users">
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/add-user">
                <Button className="w-full" variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Admin User
                </Button>
              </Link>
              <Link to="/vessels/add">
                <Button className="w-full" variant="outline">
                  <Ship className="mr-2 h-4 w-4" />
                  Add Vessel
                </Button>
              </Link>
              <Link to="/admin/notifications">
                <Button className="w-full" variant="outline">
                  <Bell className="mr-2 h-4 w-4" />
                  Manage Notifications
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
