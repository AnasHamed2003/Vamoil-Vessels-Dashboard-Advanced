"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { getAllVessels, deleteVessel } from "../utils/firebaseUtils"
import { Plus, Edit, Trash2, Ship, Search, Eye, AlertCircle, Loader2, RefreshCw } from "lucide-react"

const VesselsList = () => {
  const navigate = useNavigate()
  const [vessels, setVessels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(null)

  // Load vessels
  const loadVessels = async () => {
    try {
      console.log("VesselsList: Loading vessels...")
      setLoading(true)
      setError("")
      const vesselsData = await getAllVessels()
      console.log("VesselsList: Loaded vessels:", vesselsData.length)
      setVessels(vesselsData)
    } catch (error) {
      console.error("VesselsList: Error loading vessels:", error)
      setError("Failed to load vessels. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVessels()
  }, [])

  // Handle vessel deletion
  const handleDelete = async (vesselId, vesselName) => {
    if (!window.confirm(`Are you sure you want to delete "${vesselName}"? This action cannot be undone.`)) {
      return
    }

    try {
      console.log("VesselsList: Deleting vessel:", vesselId)
      setDeleteLoading(vesselId)
      await deleteVessel(vesselId)
      console.log("VesselsList: Vessel deleted successfully")

      // Remove vessel from local state
      setVessels((prev) => prev.filter((vessel) => vessel.id !== vesselId))

      // Show success message (you could add a toast notification here)
      alert("Vessel deleted successfully!")
    } catch (error) {
      console.error("VesselsList: Error deleting vessel:", error)
      alert("Failed to delete vessel. Please try again.")
    } finally {
      setDeleteLoading(null)
    }
  }

  // Filter vessels based on search and filters
  const filteredVessels = vessels.filter((vessel) => {
    const matchesSearch =
      vessel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.type?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || vessel.type === filterType
    const matchesStatus = !filterStatus || vessel.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Get unique vessel types for filter
  const vesselTypes = [...new Set(vessels.map((vessel) => vessel.type).filter(Boolean))]

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading vessels...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vessels</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your fleet of vessels and their specifications
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                onClick={loadVessels}
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => navigate("/vessels/add")} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Vessel
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-6 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search vessels by name or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Types</option>
                  {vesselTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vessels Grid */}
        {filteredVessels.length === 0 ? (
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="p-12 text-center">
              <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {vessels.length === 0 ? "No vessels found" : "No vessels match your search"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {vessels.length === 0
                  ? "Get started by adding your first vessel to the fleet."
                  : "Try adjusting your search terms or filters."}
              </p>
              {vessels.length === 0 && (
                <Button
                  onClick={() => navigate("/vessels/add")}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vessel
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVessels.map((vessel) => (
              <Card
                key={vessel.id}
                className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {vessel.name || "Unnamed Vessel"}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{vessel.type || "Unknown Type"}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vessel.status)}`}>
                        {vessel.status || "Unknown"}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Vessel Image */}
                  <div className="mb-4">
                    <img
                      src={vessel.image || "/placeholder.svg?height=200&width=300"}
                      alt={vessel.name || "Vessel"}
                      className="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                  </div>

                  {/* Vessel Details */}
                  <div className="space-y-2 mb-4">
                    {vessel.capacity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{vessel.capacity} DWT</span>
                      </div>
                    )}
                    {vessel.specifications?.length && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Length:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {vessel.specifications.length} m
                        </span>
                      </div>
                    )}
                    {vessel.specifications?.maxSpeed && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Max Speed:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {vessel.specifications.maxSpeed} knots
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => navigate(`/vessels/${vessel.id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => navigate(`/vessels/edit/${vessel.id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(vessel.id, vessel.name)}
                      variant="outline"
                      size="sm"
                      disabled={deleteLoading === vessel.id}
                      className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {deleteLoading === vessel.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {vessels.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{vessels.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Vessels</div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {vessels.filter((v) => v.status === "active").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Vessels</div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{vesselTypes.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Vessel Types</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default VesselsList
