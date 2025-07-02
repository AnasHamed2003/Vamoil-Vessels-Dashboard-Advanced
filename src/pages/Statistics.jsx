"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import SimpleChart from "../components/SimpleChart"
import { getAllVessels, getAllTripReports, getAllNotifications } from "../utils/firebaseUtils"

const Statistics = () => {
  const [activeTab, setActiveTab] = useState("vessels")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [vessels, setVessels] = useState([])
  const [tripReports, setTripReports] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [vesselsData, tripReportsData, notificationsData] = await Promise.all([
          getAllVessels(),
          getAllTripReports(),
          getAllNotifications(),
        ])

        setVessels(vesselsData)
        setTripReports(tripReportsData)
        setNotifications(notificationsData)
      } catch (error) {
        console.error("Error fetching statistics data:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate vessel statistics from real data
  const getVesselStats = () => {
    if (vessels.length === 0) {
      return [{ label: "Total Vessels", value: 0, description: "No vessels in database" }]
    }

    const vesselsByType = vessels.reduce((acc, vessel) => {
      const type = vessel.vesselType || "Unknown"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    const stats = [{ label: "Total Vessels", value: vessels.length, description: "Vessels in fleet" }]

    // Add vessel type breakdown
    Object.entries(vesselsByType).forEach(([type, count]) => {
      stats.push({
        label: type,
        value: count,
        description: `${Math.round((count / vessels.length) * 100)}% of fleet`,
      })
    })

    return stats
  }

  // Calculate trip statistics from real data
  const getTripStats = () => {
    if (tripReports.length === 0) {
      return [{ label: "Total Trips", value: 0, description: "No trip reports in database" }]
    }

    const totalCost = tripReports.reduce((sum, trip) => {
      return sum + (Number.parseFloat(trip.totalCost) || 0)
    }, 0)

    const averageCost = totalCost / tripReports.length

    // Get current month trips
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const currentMonthTrips = tripReports.filter((trip) => {
      const tripDate = new Date(trip.date)
      return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear
    })

    // Get trips by vessel
    const tripsByVessel = tripReports.reduce((acc, trip) => {
      const vesselId = trip.vesselId || "Unknown"
      acc[vesselId] = (acc[vesselId] || 0) + 1
      return acc
    }, {})

    const activeVessels = Object.keys(tripsByVessel).length

    return [
      { label: "Total Trips", value: tripReports.length, description: "All completed trips" },
      { label: "This Month", value: currentMonthTrips.length, description: "Trips in current month" },
      { label: "Total Revenue", value: `$${totalCost.toLocaleString()}`, description: "From all trips" },
      { label: "Average Trip Cost", value: `$${averageCost.toLocaleString()}`, description: "Per trip" },
      { label: "Active Vessels", value: activeVessels, description: "Vessels with trips" },
    ]
  }

  // Calculate notification statistics
  const getNotificationStats = () => {
    return [{ label: "Total Notifications", value: notifications.length, description: "System notifications" }]
  }

  // Get chart data for trips by month
  const getMonthlyTripData = () => {
    if (tripReports.length === 0) return []

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()

    const monthlyData = months.map((month, index) => ({
      period: month,
      price: 0,
    }))

    tripReports.forEach((trip) => {
      const tripDate = new Date(trip.date)
      if (tripDate.getFullYear() === currentYear) {
        const monthIndex = tripDate.getMonth()
        monthlyData[monthIndex].price += 1
      }
    })

    return monthlyData
  }

  // Get chart data for revenue by month
  const getMonthlyRevenueData = () => {
    if (tripReports.length === 0) return []

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()

    const monthlyData = months.map((month, index) => ({
      period: month,
      price: 0,
    }))

    tripReports.forEach((trip) => {
      const tripDate = new Date(trip.date)
      if (tripDate.getFullYear() === currentYear) {
        const monthIndex = tripDate.getMonth()
        monthlyData[monthIndex].price += Number.parseFloat(trip.totalCost) || 0
      }
    })

    // Convert to thousands for better display
    return monthlyData.map((item) => ({
      ...item,
      price: Math.round(item.price / 1000),
    }))
  }

  const getCurrentStats = () => {
    switch (activeTab) {
      case "vessels":
        return getVesselStats()
      case "trips":
        return getTripStats()
      case "notifications":
        return getNotificationStats()
      default:
        return []
    }
  }

  const getChartData = () => {
    switch (activeTab) {
      case "trips":
        return getMonthlyTripData()
      case "revenue":
        return getMonthlyRevenueData()
      default:
        return []
    }
  }

  const getChartTitle = () => {
    switch (activeTab) {
      case "trips":
        return "Monthly Trips Completed"
      case "revenue":
        return "Monthly Revenue ($K)"
      default:
        return "No Chart Available"
    }
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto max-w-7xl w-full">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">⚠️ Database Connection Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">Unable to load statistics from the database:</p>
              <p className="text-sm text-red-600 bg-red-100 p-3 rounded">{error}</p>
              <p className="text-sm text-red-700 mt-4">
                Please check your Firebase configuration and ensure you have proper permissions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-7xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Database Statistics</h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border overflow-hidden mb-6">
          <div className="flex border-b">
            <button
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "vessels"
                  ? "bg-[#2e1a47] text-white border-b-2 border-[#2e1a47]"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
              onClick={() => setActiveTab("vessels")}
            >
              🚢 Vessels ({vessels.length})
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "trips"
                  ? "bg-[#2e1a47] text-white border-b-2 border-[#2e1a47]"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
              onClick={() => setActiveTab("trips")}
            >
              📊 Trips ({tripReports.length})
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "revenue"
                  ? "bg-[#2e1a47] text-white border-b-2 border-[#2e1a47]"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
              onClick={() => setActiveTab("revenue")}
            >
              💰 Revenue
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "notifications"
                  ? "bg-[#2e1a47] text-white border-b-2 border-[#2e1a47]"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              🔔 Notifications ({notifications.length})
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2e1a47]"></div>
                <p className="mt-4 text-gray-600">Loading data from database...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getCurrentStats().map((stat, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">{stat.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chart Section - Only show for trips and revenue */}
        {(activeTab === "trips" || activeTab === "revenue") && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Chart */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">📊 {getChartTitle()}</CardTitle>
                <p className="text-sm text-gray-600">
                  {getChartData().length > 0
                    ? "Data from your database for current year"
                    : "No data available - add some trip reports to see charts"}
                </p>
              </CardHeader>
              <CardContent>
                {getChartData().length > 0 ? (
                  <SimpleChart data={getChartData()} width={700} height={300} />
                ) : (
                  <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md border">
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">No data to display</p>
                      <p className="text-sm text-gray-400">Add trip reports to see analytics</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>📈 Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{vessels.length}</p>
                    <p className="text-sm text-blue-800">Total Vessels</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{tripReports.length}</p>
                    <p className="text-sm text-green-800">Total Trips</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{notifications.length}</p>
                    <p className="text-sm text-purple-800">Notifications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vessel Details Table - Only show for vessels tab */}
        {activeTab === "vessels" && vessels.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>🚢 Vessel Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Vessel Name</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Capacity</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vessels.map((vessel, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{vessel.vesselName || "Unknown"}</td>
                        <td className="p-2">{vessel.vesselType || "Unknown"}</td>
                        <td className="p-2">{vessel.capacity || "N/A"}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trip Reports Table - Only show for trips tab */}
        {activeTab === "trips" && tripReports.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>📊 Recent Trip Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Vessel ID</th>
                      <th className="text-left p-2">Total Cost</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tripReports.slice(0, 10).map((trip, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(trip.date).toLocaleDateString()}</td>
                        <td className="p-2">{trip.vesselId || "Unknown"}</td>
                        <td className="p-2 font-medium">${Number.parseFloat(trip.totalCost || 0).toLocaleString()}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Completed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tripReports.length > 10 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Showing 10 of {tripReports.length} trip reports
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State Messages */}
        {vessels.length === 0 && tripReports.length === 0 && notifications.length === 0 && !loading && (
          <Card className="mt-6">
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No data available in database</p>
              <p className="text-sm text-gray-400">Add some vessels and trip reports to see statistics and analytics</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Statistics
