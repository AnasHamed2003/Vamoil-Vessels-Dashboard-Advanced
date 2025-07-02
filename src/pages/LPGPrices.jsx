"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import SimpleChart from "../components/SimpleChart"
import { ArrowLeft, Plus, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { useFirebase } from "../components/FirebaseProvider"
import { getAllLPGPrices, addLPGPrice, updateLPGPrice, deleteLPGPrice } from "../utils/firebaseUtils"

const LPGPrices = () => {
  const { userRole } = useFirebase()
  const navigate = useNavigate()
  const [lpgPrices, setLpgPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [currentEntry, setCurrentEntry] = useState({ id: "", month: "", year: "", price: "" })
  const isAdmin = userRole === "admin"

  // Fetch LPG prices
  useEffect(() => {
    const fetchLPGPrices = async () => {
      try {
        setLoading(true)
        const lpgList = await getAllLPGPrices()
        setLpgPrices(lpgList)
        setError(null)
      } catch (error) {
        console.error("Error fetching LPG prices:", error)
        setError("Failed to load LPG prices. Please try again.")
        // Fallback to mock data for demonstration
        setLpgPrices([
          { id: "1", month: "Jan", year: "2024", price: 270, date: "2024-01-01" },
          { id: "2", month: "Feb", year: "2024", price: 275, date: "2024-02-01" },
          { id: "3", month: "Mar", year: "2024", price: 280, date: "2024-03-01" },
          { id: "4", month: "Apr", year: "2024", price: 285, date: "2024-04-01" },
          { id: "5", month: "May", year: "2024", price: 290, date: "2024-05-01" },
          { id: "6", month: "Jun", year: "2024", price: 295, date: "2024-06-01" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchLPGPrices()
  }, [])

  // Prepare chart data
  const chartData = lpgPrices
    .map((entry) => ({
      period: `${entry.month} ${entry.year}`,
      price: Number.parseFloat(entry.price),
      month: entry.month,
      year: entry.year,
    }))
    .reverse() // Show oldest to newest for better chart visualization

  // Calculate price trend
  const calculateTrend = () => {
    if (lpgPrices.length < 2) return { trend: "neutral", change: 0 }

    const latest = Number.parseFloat(lpgPrices[0]?.price || 0)
    const previous = Number.parseFloat(lpgPrices[1]?.price || 0)
    const change = latest - previous

    return {
      trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      change: Math.abs(change),
      percentage: previous > 0 ? ((change / previous) * 100).toFixed(1) : 0,
    }
  }

  const trend = calculateTrend()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentEntry((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!currentEntry.month || !currentEntry.year || !currentEntry.price) {
      setError("All fields are required")
      return
    }

    if (isNaN(Number.parseFloat(currentEntry.price))) {
      setError("Price must be a valid number")
      return
    }

    try {
      // Format the date properly
      const monthIndex = months.indexOf(currentEntry.month)
      const formattedMonth = String(monthIndex + 1).padStart(2, "0")

      const entryData = {
        month: currentEntry.month,
        year: currentEntry.year,
        price: Number.parseFloat(currentEntry.price),
        date: `${currentEntry.year}-${formattedMonth}-01`,
      }

      console.log("Submitting LPG price data:", entryData)

      if (isEditing) {
        await updateLPGPrice(currentEntry.id, entryData)

        // Update local state
        setLpgPrices(lpgPrices.map((entry) => (entry.id === currentEntry.id ? { ...entry, ...entryData } : entry)))

        setSuccess("LPG price updated successfully")
      } else {
        const newEntryId = await addLPGPrice(entryData)

        // Add to local state
        setLpgPrices([{ id: newEntryId, ...entryData }, ...lpgPrices])

        setSuccess("LPG price added successfully")
      }

      // Reset form
      resetForm()
    } catch (error) {
      console.error("Error saving LPG price:", error)
      setError(`Failed to ${isEditing ? "update" : "add"} LPG price. Please try again.`)
    }
  }

  const handleEdit = (entry) => {
    setCurrentEntry({
      id: entry.id,
      month: entry.month,
      year: entry.year,
      price: entry.price.toString(),
    })
    setIsEditing(true)
    setError(null)
    setSuccess(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this LPG price entry?")) {
      return
    }

    try {
      await deleteLPGPrice(id)
      setLpgPrices(lpgPrices.filter((entry) => entry.id !== id))
      setSuccess("LPG price deleted successfully")

      if (currentEntry.id === id) {
        resetForm()
      }
    } catch (error) {
      console.error("Error deleting LPG price:", error)
      setError("Failed to delete LPG price. Please try again.")
    }
  }

  const resetForm = () => {
    setCurrentEntry({ id: "", month: "", year: "", price: "" })
    setIsEditing(false)
    setError(null)
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">LPG Price Tracking</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Price Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>LPG Price Trend</span>
              {lpgPrices.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  {trend.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : trend.trend === "down" ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : null}
                  <span
                    className={`font-medium ${
                      trend.trend === "up"
                        ? "text-green-600"
                        : trend.trend === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {trend.trend === "up" ? "+" : trend.trend === "down" ? "-" : ""}${trend.change} ({trend.percentage}
                    %)
                  </span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p>Loading chart data...</p>
              </div>
            ) : chartData.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <SimpleChart data={chartData} width={800} height={300} />
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-500">No price data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Price Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${lpgPrices.length > 0 ? lpgPrices[0].price : "N/A"}</div>
              <p className="text-xs text-muted-foreground">
                {lpgPrices.length > 0 ? `${lpgPrices[0].month} ${lpgPrices[0].year}` : "No data"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {lpgPrices.length > 0
                  ? (
                      lpgPrices.reduce((sum, entry) => sum + Number.parseFloat(entry.price), 0) / lpgPrices.length
                    ).toFixed(2)
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">Based on {lpgPrices.length} entries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Price Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lpgPrices.length > 0 ? (
                  <>
                    ${Math.min(...lpgPrices.map((p) => Number.parseFloat(p.price)))} - $
                    {Math.max(...lpgPrices.map((p) => Number.parseFloat(p.price)))}
                  </>
                ) : (
                  "N/A"
                )}
              </div>
              <p className="text-xs text-muted-foreground">Min - Max</p>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form (Admin Only) */}
        {isAdmin && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{isEditing ? "Edit LPG Price" : "Add New LPG Price"}</CardTitle>
            </CardHeader>
            <CardContent>
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">{success}</div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="month" className="text-sm font-medium">
                    Month*
                  </label>
                  <select
                    id="month"
                    name="month"
                    value={currentEntry.month}
                    onChange={handleInputChange}
                    className="rounded-md border px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="year" className="text-sm font-medium">
                    Year*
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={currentEntry.year}
                    onChange={handleInputChange}
                    className="rounded-md border px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Price ($)*
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={currentEntry.price}
                    onChange={handleInputChange}
                    className="rounded-md border px-3 py-2 text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button type="submit">{isEditing ? "Update" : "Add"}</Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Price History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading price history...</div>
            ) : lpgPrices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Period</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Change</th>
                      {isAdmin && <th className="text-left py-3 px-4 w-32">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {lpgPrices.map((entry, index) => {
                      const previousPrice =
                        index < lpgPrices.length - 1 ? Number.parseFloat(lpgPrices[index + 1].price) : null
                      const currentPrice = Number.parseFloat(entry.price)
                      const change = previousPrice ? currentPrice - previousPrice : null
                      const changePercent = previousPrice && change ? ((change / previousPrice) * 100).toFixed(1) : null

                      return (
                        <tr key={entry.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">
                            {entry.month} {entry.year}
                          </td>
                          <td className="py-3 px-4">${entry.price}</td>
                          <td className="py-3 px-4">
                            {change !== null ? (
                              <span
                                className={`flex items-center gap-1 ${
                                  change > 0 ? "text-red-600" : change < 0 ? "text-green-600" : "text-gray-600"
                                }`}
                              >
                                {change > 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : change < 0 ? (
                                  <TrendingDown className="h-3 w-3" />
                                ) : null}
                                {change > 0 ? "+" : ""}${change.toFixed(2)} ({changePercent}%)
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          {isAdmin && (
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEdit(entry)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDelete(entry.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No price data found</p>
                {isAdmin && (
                  <Button onClick={() => setCurrentEntry({ id: "", month: "", year: "", price: "" })}>
                    <Plus className="mr-2 h-4 w-4" /> Add First Price Entry
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LPGPrices
