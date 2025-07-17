"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  getPendingTripReports, 
  approveTripReport, 
  rejectTripReport 
} from "../utils/firebaseUtils"
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Ship,
  Calendar,
  User,
  Eye,
  AlertCircle,
} from "lucide-react"
import { useFirebase } from "../components/FirebaseProvider"

const AdminPendingReports = () => {
  const navigate = useNavigate()
  const { userRole } = useFirebase()
  const [pendingReports, setPendingReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [actionLoading, setActionLoading] = useState({})
  const [selectedReport, setSelectedReport] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectModal, setShowRejectModal] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (userRole && userRole !== "admin") {
      navigate("/")
    }
  }, [userRole, navigate])

  useEffect(() => {
    fetchPendingReports()
  }, [])

  const fetchPendingReports = async () => {
    try {
      setLoading(true)
      const reports = await getPendingTripReports()
      setPendingReports(reports)
      setError(null)
    } catch (error) {
      console.error("Error fetching pending reports:", error)
      setError("Failed to load pending reports. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reportId) => {
    try {
      setActionLoading(prev => ({ ...prev, [reportId]: 'approving' }))
      await approveTripReport(reportId)
      setSuccess("Report approved successfully!")
      
      // Remove from pending list
      setPendingReports(prev => prev.filter(report => report.id !== reportId))
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error approving report:", error)
      setError("Failed to approve report. Please try again.")
    } finally {
      setActionLoading(prev => ({ ...prev, [reportId]: null }))
    }
  }

  const handleRejectClick = (report) => {
    setSelectedReport(report)
    setShowRejectModal(true)
    setRejectionReason("")
  }

  const handleReject = async () => {
    if (!selectedReport) return
    
    try {
      setActionLoading(prev => ({ ...prev, [selectedReport.id]: 'rejecting' }))
      await rejectTripReport(selectedReport.id, rejectionReason)
      setSuccess("Report rejected successfully!")
      
      // Remove from pending list
      setPendingReports(prev => prev.filter(report => report.id !== selectedReport.id))
      
      // Close modal and clear state
      setShowRejectModal(false)
      setSelectedReport(null)
      setRejectionReason("")
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error rejecting report:", error)
      setError("Failed to reject report. Please try again.")
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedReport.id]: null }))
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount || 0)
  }

  if (userRole !== "admin") {
    return null // Will redirect via useEffect
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="mx-auto max-w-7xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="h-6 w-6 text-orange-500" />
            Pending Trip Reports
          </h1>
          <Button
            variant="outline"
            onClick={fetchPendingReports}
            disabled={loading}
            className="bg-transparent"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 dark:text-gray-300">Loading pending reports...</p>
          </div>
        ) : pendingReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Pending Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                All trip reports have been reviewed. Great job!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingReports.map((report) => (
              <Card key={report.id} className="border-orange-200 dark:border-orange-800">
                <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {report.tripName}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mt-2">
                        <span className="flex items-center gap-1">
                          <Ship className="h-4 w-4" />
                          {report.vesselName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(report.tripDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {report.createdBy}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Review
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Submitted: {formatDate(report.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Cost</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(report.summary?.totalCost)}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(report.summary?.totalRevenue)}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      (report.summary?.totalProfit || 0) >= 0 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <p className={`text-sm font-medium ${
                        (report.summary?.totalProfit || 0) >= 0 
                          ? 'text-emerald-800 dark:text-emerald-200' 
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        Net Profit
                      </p>
                      <p className={`text-2xl font-bold ${
                        (report.summary?.totalProfit || 0) >= 0 
                          ? 'text-emerald-900 dark:text-emerald-100' 
                          : 'text-red-900 dark:text-red-100'
                      }`}>
                        {formatCurrency(report.summary?.totalProfit)}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Duration</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {report.summary?.totalDays || 0} days
                      </p>
                    </div>
                  </div>

                  {report.fileCount > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        📎 {report.fileCount} file(s) attached to this report
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement detailed view modal
                        alert("Detailed view coming soon!")
                      }}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectClick(report)}
                      disabled={actionLoading[report.id]}
                      className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                      {actionLoading[report.id] === 'rejecting' ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(report.id)}
                      disabled={actionLoading[report.id]}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {actionLoading[report.id] === 'approving' ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Reject Trip Report
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to reject "{selectedReport?.tripName}"?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Provide a reason for rejection..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false)
                    setSelectedReport(null)
                    setRejectionReason("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={actionLoading[selectedReport?.id]}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {actionLoading[selectedReport?.id] === 'rejecting' ? "Rejecting..." : "Reject Report"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPendingReports
