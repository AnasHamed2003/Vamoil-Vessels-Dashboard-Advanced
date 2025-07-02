"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { getAllNotifications, getAllLPGPrices } from "../utils/firebaseUtils"
import { Link } from "react-router-dom"
import { TrendingUp } from "lucide-react"
import { Button } from "../components/ui/button"

// Import images
import heroTanker from "../assets/images/hero-tanker.png"
import tankerIcon from "../assets/images/tanker-icon.png"
import lpgShipIcon from "../assets/images/lpg-ship-icon.png"
import chemicalTankerIcon from "../assets/images/chemical-tanker-icon.png"
import vamoilLogo from "../assets/images/vamoil-logo.png"

const Dashboard = () => {
  const [lpgPrice, setLpgPrice] = useState("270")
  const [currentMonth, setCurrentMonth] = useState("")
  const [currentYear, setCurrentYear] = useState("")
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const date = new Date()
    setCurrentMonth(date.toLocaleString("default", { month: "short" }))
    setCurrentYear(date.getFullYear().toString())

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch notifications
        let notificationsList = []
        try {
          notificationsList = await getAllNotifications()
        } catch (notifError) {
          console.error("Error fetching notifications:", notifError)
          // Fallback to mock data
          notificationsList = [
            { id: "1", message: "ATGM vessel is approaching Port Ataturk.", priority: "normal" },
            { id: "2", message: "Maintenance scheduled for Sentor on June 15th.", priority: "normal" },
          ]
        }
        setNotifications(notificationsList)

        // Fetch latest LPG price
        try {
          const lpgPrices = await getAllLPGPrices()
          console.log("LPG prices fetched:", lpgPrices)

          if (lpgPrices && lpgPrices.length > 0) {
            setLpgPrice(lpgPrices[0].price.toString())
          }
        } catch (lpgError) {
          console.error("Error fetching LPG prices:", lpgError)
          // Keep default price
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 font-medium"
      case "high":
        return "text-orange-600"
      case "low":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Notification Center</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              ) : notifications.length > 0 ? (
                <ul className="space-y-3">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`text-sm ${getPriorityClass(notification.priority)} ${
                        notification.priority === "urgent" ? "bg-red-50 p-2 rounded-md" : ""
                      }`}
                    >
                      {notification.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No new notifications</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Monthly LPG - {currentMonth} {currentYear}
                <Link to="/lpg-prices">
                  <TrendingUp className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">${lpgPrice}</p>
                <Link to="/lpg-prices">
                  <Button variant="outline" size="sm">
                    View Chart
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hero Section with Shipping Image */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-900 to-blue-700 text-white">
          <div className="absolute inset-0">
            <img
              src={heroTanker || "/placeholder.svg"}
              alt="Oil Tanker Ship at Sea"
              className="w-full h-full object-cover opacity-30"
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=400&width=1200&text=Oil+Tanker+Ship+at+Sea"
                e.target.onerror = null
              }}
            />
          </div>
          <div className="relative px-8 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">VAMOIL INTERNATIONAL</h1>
            <p className="text-xl mb-6">Leading Global Shipping & Logistics Solutions</p>
            <p className="text-lg opacity-90">Specialized in Oil, Gas & Petroleum Products Transportation</p>
          </div>
        </div>

        {/* Fleet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={tankerIcon || "/placeholder.svg"}
                  alt="Oil Tanker"
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=80&width=80&text=Tanker+Icon"
                    e.target.onerror = null
                  }}
                />
                <div>
                  <h3 className="font-semibold">Oil Tankers</h3>
                  <p className="text-sm text-gray-600">Specialized fleet for crude oil transport</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={lpgShipIcon || "/placeholder.svg"}
                  alt="LPG Carrier"
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=80&width=80&text=LPG+Ship"
                    e.target.onerror = null
                  }}
                />
                <div>
                  <h3 className="font-semibold">LPG Carriers</h3>
                  <p className="text-sm text-gray-600">Advanced vessels for liquefied petroleum gas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={chemicalTankerIcon || "/placeholder.svg"}
                  alt="Chemical Tanker"
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=80&width=80&text=Chemical+Tanker"
                    e.target.onerror = null
                  }}
                />
                <div>
                  <h3 className="font-semibold">Chemical Tankers</h3>
                  <p className="text-sm text-gray-600">Safe transport of chemical products</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Logo Section */}
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <img
              src={vamoilLogo || "/placeholder.svg"}
              alt="Vamoil International Logo"
              className="mx-auto w-[400px] h-[200px] object-contain"
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=200&width=400&text=VAMOIL+LOGO"
                e.target.onerror = null
              }}
            />
            <h1 className="mt-6 text-3xl font-bold text-[#2e1a47]">VAMOIL</h1>
            <p className="text-xl text-gray-600">INTERNATIONAL</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
