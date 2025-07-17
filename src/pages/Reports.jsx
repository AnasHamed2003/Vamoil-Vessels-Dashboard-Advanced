"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { getAllTripReports, deleteTripReport, getUserTripReports } from "../utils/firebaseUtils"
import {
  FileText,
  Trash2,
  Eye,
  BarChart3,
  Filter,
  Download,
  FileDown,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Link } from "react-router-dom"
import { generateTripReportPDF, exportToCSV } from "../utils/pdfGenerator"
import { useFirebase } from "../components/FirebaseProvider"

const Reports = () => {
  const { user } = useFirebase()
  const [selectedReport, setSelectedReport] = useState(null)
  const [tripReports, setTripReports] = useState([])
  const [userReports, setUserReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [selectedReports, setSelectedReports] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [filterMonth, setFilterMonth] = useState("")
  const [filterYear, setFilterYear] = useState("")
  const [filterVessel, setFilterVessel] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        
        // Fetch approved reports for all users
        const reports = await getAllTripReports()
        setTripReports(reports)
        setFilteredReports(reports)
        
        // Fetch user's own reports (including pending) if user is logged in
        if (user?.uid) {
          const userOwnReports = await getUserTripReports(user.uid)
          setUserReports(userOwnReports)
        }
        
        setError(null)
      } catch (error) {
        console.error("Error fetching trip reports:", error)

        if (error.code === "permission-denied") {
          setError("Permission denied: Please update your Firestore security rules to allow access to trip reports.")
        } else {
          setError("Failed to load trip reports. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [user?.uid])

  // Filter reports based on selected criteria
  useEffect(() => {
    let filtered = tripReports

    if (filterMonth) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.tripDate)
        return reportDate.getMonth() === Number.parseInt(filterMonth)
      })
    }

    if (filterYear) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.tripDate)
        return reportDate.getFullYear() === Number.parseInt(filterYear)
      })
    }

    if (filterVessel) {
      filtered = filtered.filter((report) => report.vesselName.toLowerCase().includes(filterVessel.toLowerCase()))
    }

    setFilteredReports(filtered)
    // Clear selected reports when filters change
    setSelectedReports(new Set())
  }, [tripReports, filterMonth, filterYear, filterVessel])

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this trip report? This action cannot be undone.")) {
      return
    }

    try {
      await deleteTripReport(reportId)
      const updatedReports = tripReports.filter((report) => report.id !== reportId)
      setTripReports(updatedReports)
      setSuccess("Trip report deleted successfully")

      // Remove from selected reports if it was selected
      const newSelected = new Set(selectedReports)
      newSelected.delete(reportId)
      setSelectedReports(newSelected)

      // If we were viewing this report, clear it
      if (selectedReport?.id === reportId) {
        setSelectedReport(null)
      }
    } catch (error) {
      console.error("Error deleting trip report:", error)
      setError("Failed to delete trip report. Please try again.")
    }
  }

  const handleSelectReport = (reportId) => {
    const newSelected = new Set(selectedReports)
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId)
    } else {
      newSelected.add(reportId)
    }
    setSelectedReports(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedReports.size === filteredReports.length) {
      setSelectedReports(new Set())
    } else {
      setSelectedReports(new Set(filteredReports.map((report) => report.id)))
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Calculate statistics from filtered reports
  const calculateStatistics = () => {
    if (!filteredReports.length) {
      return {
        totalTrips: 0,
        totalCost: 0,
        totalRevenue: 0,
        totalProfit: 0,
        averageProfitMargin: 0,
        totalDays: 0,
        averageCostPerMT: 0,
        averageRevenuePerMT: 0,
        profitableTrips: 0,
        mostProfitableTrip: null,
        leastProfitableTrip: null,
      }
    }

    const totalCost = filteredReports.reduce((sum, report) => sum + (report.summary?.totalCost || 0), 0)
    const totalRevenue = filteredReports.reduce((sum, report) => sum + (report.summary?.totalRevenue || 0), 0)
    const totalProfit = totalRevenue - totalCost
    const totalDays = filteredReports.reduce((sum, report) => sum + (report.summary?.totalDays || 0), 0)
    const totalCapacity = filteredReports.reduce((sum, report) => sum + (report.summary?.vesselCapacityMT || 0), 0)

    const reportsWithMargin = filteredReports.filter(
      (report) => report.summary && report.summary.totalProfitMargin !== undefined,
    )

    const averageProfitMargin =
      reportsWithMargin.length > 0
        ? reportsWithMargin.reduce((sum, report) => sum + report.summary.totalProfitMargin, 0) /
          reportsWithMargin.length
        : 0

    const profitableTrips = filteredReports.filter((report) => report.summary && report.summary.totalProfit > 0).length

    const averageCostPerMT = totalCapacity > 0 ? totalCost / totalCapacity : 0
    const averageRevenuePerMT = totalCapacity > 0 ? totalRevenue / totalCapacity : 0

    // Find most and least profitable trips
    const sortedByProfit = [...filteredReports]
      .filter((report) => report.summary && report.summary.totalProfit !== undefined)
      .sort((a, b) => b.summary.totalProfit - a.summary.totalProfit)

    const mostProfitableTrip = sortedByProfit[0] || null
    const leastProfitableTrip = sortedByProfit[sortedByProfit.length - 1] || null

    return {
      totalTrips: filteredReports.length,
      totalCost,
      totalRevenue,
      totalProfit,
      averageProfitMargin,
      totalDays,
      averageCostPerMT,
      averageRevenuePerMT,
      profitableTrips,
      mostProfitableTrip,
      leastProfitableTrip,
    }
  }

  // Export Functions
  const handleExportPDF = async (reports, includeStatistics = true) => {
    setIsExporting(true)
    try {
      await generateTripReportPDF(reports, includeStatistics)
      setSuccess(
        `PDF export initiated for ${reports.length} report(s). A new window will open with the printable report.`,
      )
    } catch (error) {
      console.error("Error generating PDF:", error)
      setError(error.message || "Failed to generate PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = (reports) => {
    try {
      exportToCSV(reports)
      setSuccess(`CSV file downloaded successfully with ${reports.length} report(s).`)
    } catch (error) {
      console.error("Error exporting CSV:", error)
      setError("Failed to export CSV. Please try again.")
    }
  }

  const handleExportSingle = (report, format = "pdf") => {
    if (format === "pdf") {
      handleExportPDF([report], false)
    } else {
      handleExportCSV([report])
    }
  }

  const handleExportSelected = (format = "pdf") => {
    const reportsToExport = filteredReports.filter((report) => selectedReports.has(report.id))
    if (reportsToExport.length === 0) {
      setError("Please select at least one report to export.")
      return
    }

    if (format === "pdf") {
      handleExportPDF(reportsToExport, true)
    } else {
      handleExportCSV(reportsToExport)
    }
  }

  const handleExportAll = (format = "pdf") => {
    if (filteredReports.length === 0) {
      setError("No reports available to export.")
      return
    }

    if (format === "pdf") {
      handleExportPDF(filteredReports, true)
    } else {
      handleExportCSV(filteredReports)
    }
  }

  const stats = calculateStatistics()

  // Get unique vessels and years for filter options
  const uniqueVessels = [...new Set(tripReports.map((report) => report.vesselName))].sort()
  const uniqueYears = [...new Set(tripReports.map((report) => new Date(report.tripDate).getFullYear()))].sort(
    (a, b) => b - a,
  )

  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ]

  const clearFilters = () => {
    setFilterMonth("")
    setFilterYear("")
    setFilterVessel("")
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Trip Reports & Statistics
          </h1>
          <div className="flex gap-2">
            <Link to="/trip-calculator">
              <Button>Create New Trip Report</Button>
            </Link>
          </div>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>}
        {success && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">{success}</div>
        )}

        {/* User's Pending Reports Notification */}
        {!loading && userReports && userReports.length > 0 && (
          (() => {
            const pendingReports = userReports.filter(report => report.status === 'pending')
            const rejectedReports = userReports.filter(report => report.status === 'rejected')
            
            if (pendingReports.length > 0 || rejectedReports.length > 0) {
              return (
                <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Your Report Status Updates
                        </h3>
                        {pendingReports.length > 0 && (
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                            <Clock className="h-4 w-4 inline mr-1" />
                            You have {pendingReports.length} trip report(s) pending admin approval.
                          </p>
                        )}
                        {rejectedReports.length > 0 && (
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            <XCircle className="h-4 w-4 inline mr-1" />
                            {rejectedReports.length} of your trip reports were rejected. Please review and resubmit if needed.
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          {[...pendingReports, ...rejectedReports].map(report => (
                            <div key={report.id} className="text-xs text-orange-600 dark:text-orange-400">
                              • {report.tripName} - {report.status === 'pending' ? 'Pending Review' : `Rejected: ${report.rejectionReason || 'No reason provided'}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }
            return null
          })()
        )}

        {/* Export Controls */}
        {!loading && filteredReports.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-3">PDF Export</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleExportAll("pdf")}
                      disabled={isExporting}
                      className="flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4" />
                      {isExporting ? "Exporting..." : `All Reports (${filteredReports.length})`}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportSelected("pdf")}
                      disabled={isExporting || selectedReports.size === 0}
                      className="flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4" />
                      {isExporting ? "Exporting..." : `Selected (${selectedReports.size})`}
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">CSV Export</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleExportAll("csv")}
                      className="flex items-center gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      All Reports CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportSelected("csv")}
                      disabled={selectedReports.size === 0}
                      className="flex items-center gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Selected CSV
                    </Button>
                  </div>
                </div>
              </div>
              {selectedReports.size > 0 && (
                <div className="mt-3 text-sm text-gray-600">{selectedReports.size} reports selected for export</div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label htmlFor="filterMonth" className="block text-sm font-medium mb-1">
                  Month
                </label>
                <select
                  id="filterMonth"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">All Months</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filterYear" className="block text-sm font-medium mb-1">
                  Year
                </label>
                <select
                  id="filterYear"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">All Years</option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filterVessel" className="block text-sm font-medium mb-1">
                  Vessel
                </label>
                <select
                  id="filterVessel"
                  value={filterVessel}
                  onChange={(e) => setFilterVessel(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">All Vessels</option>
                  {uniqueVessels.map((vessel) => (
                    <option key={vessel} value={vessel}>
                      {vessel}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredReports.length} of {tripReports.length} reports
            </div>
          </CardContent>
        </Card>

        {/* Statistics Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Financial Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-md text-center">
                <h4 className="text-sm font-medium text-blue-900">Total Trips</h4>
                <p className="text-2xl font-bold text-blue-700">{stats.totalTrips}</p>
                <p className="text-xs text-blue-600">{stats.profitableTrips} profitable</p>
              </div>
              <div className="p-4 bg-green-50 rounded-md text-center">
                <h4 className="text-sm font-medium text-green-900">Total Revenue</h4>
                <p className="text-2xl font-bold text-green-700">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-green-600">${stats.averageRevenuePerMT.toFixed(2)} avg/MT</p>
              </div>
              <div className="p-4 bg-red-50 rounded-md text-center">
                <h4 className="text-sm font-medium text-red-900">Total Cost</h4>
                <p className="text-2xl font-bold text-red-700">${stats.totalCost.toFixed(2)}</p>
                <p className="text-xs text-red-600">${stats.averageCostPerMT.toFixed(2)} avg/MT</p>
              </div>
              <div
                className={`p-4 rounded-md text-center ${stats.totalProfit >= 0 ? "bg-emerald-50" : "bg-orange-50"}`}
              >
                <h4 className="text-sm font-medium text-gray-900">Net Profit</h4>
                <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? "text-emerald-700" : "text-orange-700"}`}>
                  ${stats.totalProfit.toFixed(2)}
                </p>
                <p className={`text-xs ${stats.totalProfit >= 0 ? "text-emerald-600" : "text-orange-600"}`}>
                  {stats.averageProfitMargin.toFixed(2)}% avg margin
                </p>
              </div>
            </div>

            {/* Additional Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Total Days at Sea</h4>
                <p className="text-xl font-bold text-gray-700">{stats.totalDays}</p>
                <p className="text-xs text-gray-600">
                  {stats.totalTrips > 0 ? (stats.totalDays / stats.totalTrips).toFixed(1) : 0} avg days/trip
                </p>
              </div>

              {stats.mostProfitableTrip && (
                <div className="p-4 bg-emerald-50 rounded-md">
                  <h4 className="text-sm font-medium text-emerald-900 mb-2">Most Profitable Trip</h4>
                  <p className="text-lg font-bold text-emerald-700">
                    ${stats.mostProfitableTrip.summary.totalProfit.toFixed(2)}
                  </p>
                  <p className="text-xs text-emerald-600">{stats.mostProfitableTrip.vesselName}</p>
                  <p className="text-xs text-emerald-600">{formatDate(stats.mostProfitableTrip.tripDate)}</p>
                </div>
              )}

              {stats.leastProfitableTrip && (
                <div className="p-4 bg-orange-50 rounded-md">
                  <h4 className="text-sm font-medium text-orange-900 mb-2">Least Profitable Trip</h4>
                  <p className="text-lg font-bold text-orange-700">
                    ${stats.leastProfitableTrip.summary.totalProfit.toFixed(2)}
                  </p>
                  <p className="text-xs text-orange-600">{stats.leastProfitableTrip.vesselName}</p>
                  <p className="text-xs text-orange-600">{formatDate(stats.leastProfitableTrip.tripDate)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {loading && <div className="text-center">Loading trip reports...</div>}

        {!loading && tripReports.length === 0 && !error && (
          <Card>
            <CardHeader>
              <CardTitle>No Trip Reports Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">No trip reports found. This could be because:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
                <li>You haven't created any trip reports yet</li>
                <li>Your Firestore security rules need to be updated</li>
              </ul>
              <Link to="/trip-calculator">
                <Button>Create Your First Trip Report</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!loading && filteredReports.length === 0 && tripReports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Reports Match Your Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No trip reports match your current filter criteria. Try adjusting your filters or clearing them to see
                all reports.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && filteredReports.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Trip Reports</CardTitle>
                <Button variant="outline" size="sm" onClick={handleSelectAll} className="flex items-center gap-2">
                  {selectedReports.size === filteredReports.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {selectedReports.size === filteredReports.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedReports.size === filteredReports.length && filteredReports.length > 0}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left py-3 px-4">Trip Name</th>
                      <th className="text-left py-3 px-4">Vessel</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Revenue</th>
                      <th className="text-left py-3 px-4">Cost</th>
                      <th className="text-left py-3 px-4">Profit</th>
                      <th className="text-left py-3 px-4">Margin</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedReports.has(report.id)}
                            onChange={() => handleSelectReport(report.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="py-3 px-4 font-medium">{report.tripName}</td>
                        <td className="py-3 px-4">{report.vesselName}</td>
                        <td className="py-3 px-4">{formatDate(report.tripDate)}</td>
                        <td className="py-3 px-4 text-green-600">
                          ${report.summary?.totalRevenue?.toFixed(2) || "0.00"}
                        </td>
                        <td className="py-3 px-4 text-red-600">${report.summary?.totalCost?.toFixed(2) || "0.00"}</td>
                        <td
                          className={`py-3 px-4 font-medium ${
                            (report.summary?.totalProfit || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          ${report.summary?.totalProfit?.toFixed(2) || "0.00"}
                        </td>
                        <td
                          className={`py-3 px-4 ${
                            (report.summary?.totalProfitMargin || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {report.summary?.totalProfitMargin?.toFixed(2) || "0.00"}%
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => setSelectedReport(report)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportSingle(report, "pdf")}
                              disabled={isExporting}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                              title="Export as PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportSingle(report, "csv")}
                              className="text-green-500 hover:text-green-700 hover:bg-green-50"
                              title="Export as CSV"
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteReport(report.id)}
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
            </CardContent>
          </Card>
        )}

        {/* Report Detail Modal */}
        {selectedReport && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Trip Report Details: {selectedReport.tripName}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExportSingle(selectedReport, "pdf")}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportSingle(selectedReport, "csv")}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedReport(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Trip Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Vessel:</span> {selectedReport.vesselName}
                    </p>
                    <p>
                      <span className="font-medium">Trip Date:</span> {formatDate(selectedReport.tripDate)}
                    </p>
                    <p>
                      <span className="font-medium">Created:</span> {formatDateTime(selectedReport.createdAt)}
                    </p>
                    <p>
                      <span className="font-medium">Created by:</span> {selectedReport.userName}
                    </p>
                    <p>
                      <span className="font-medium">Vessel Capacity:</span> {selectedReport.vesselCapacity}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Financial Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Total Revenue:</span>
                      <span className="text-green-600 ml-2">
                        ${selectedReport.summary?.totalRevenue?.toFixed(2) || "0.00"}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Total Cost:</span>
                      <span className="text-red-600 ml-2">
                        ${selectedReport.summary?.totalCost?.toFixed(2) || "0.00"}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Net Profit:</span>
                      <span
                        className={`ml-2 font-bold ${
                          (selectedReport.summary?.totalProfit || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        ${selectedReport.summary?.totalProfit?.toFixed(2) || "0.00"}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Profit Margin:</span>
                      <span
                        className={`ml-2 ${
                          (selectedReport.summary?.totalProfitMargin || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {selectedReport.summary?.totalProfitMargin?.toFixed(2) || "0.00"}%
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Total Days:</span> {selectedReport.summary?.totalDays || 0}
                    </p>
                  </div>
                </div>
              </div>

              {selectedReport.results && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Detailed Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <h5 className="font-medium text-blue-900 mb-2">Loading Operations:</h5>
                      <p>
                        Total Cost:{" "}
                        <span className="font-medium">${selectedReport.results.loading.totalCost.toFixed(2)}</span>
                      </p>
                      <p>
                        Revenue:{" "}
                        <span className="font-medium text-green-600">
                          ${selectedReport.results.loading.revenue.toFixed(2)}
                        </span>
                      </p>
                      <p>
                        Profit:{" "}
                        <span
                          className={`font-medium ${selectedReport.results.loading.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}
                        >
                          ${selectedReport.results.loading.profit.toFixed(2)}
                        </span>
                      </p>
                      <p>
                        Days: <span className="font-medium">{selectedReport.results.loading.totalDays}</span>
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-orange-900 mb-2">Discharging Operations:</h5>
                      <p>
                        Total Cost:{" "}
                        <span className="font-medium">${selectedReport.results.discharging.totalCost.toFixed(2)}</span>
                      </p>
                      <p>
                        Revenue:{" "}
                        <span className="font-medium text-green-600">
                          ${selectedReport.results.discharging.revenue.toFixed(2)}
                        </span>
                      </p>
                      <p>
                        Profit:{" "}
                        <span
                          className={`font-medium ${selectedReport.results.discharging.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}
                        >
                          ${selectedReport.results.discharging.profit.toFixed(2)}
                        </span>
                      </p>
                      <p>
                        Days: <span className="font-medium">{selectedReport.results.discharging.totalDays}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Reports
