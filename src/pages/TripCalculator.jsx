"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { getAllVessels, saveTripReport } from "../utils/firebaseUtils"
import {
  Calculator,
  Ship,
  DollarSign,
  AlertCircle,
  Anchor,
  Truck,
  Save,
  TrendingUp,
  FileText,
  Upload,
  X,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useFirebase } from "../components/FirebaseProvider"

const TripCalculator = () => {
  const { user } = useFirebase()
  const [vessels, setVessels] = useState([])
  const [allVessels, setAllVessels] = useState([])
  const [selectedVessel, setSelectedVessel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [savingReport, setSavingReport] = useState(false)
  const [tripName, setTripName] = useState("")
  const [tripDate, setTripDate] = useState(new Date().toISOString().split("T")[0]) // Default to today
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const fileInputRef = useRef(null)
  const [loadingFormData, setLoadingFormData] = useState({
    loadingSailingDays: "",
    idleDays: "",
    loadingDays: "",
    surveyorDays: "",
    pdaCost: "",
    surveyorCost: "",
    bunkerPrice: "",
    ladenBunkerPerDay: "",
    revenuePerMT: "", // New field for revenue per metric ton
  })
  const [dischargingFormData, setDischargingFormData] = useState({
    dischargingSailingDays: "",
    dischargeDays: "",
    awrpCrewBonusPiracy: "",
    bunkerPrice: "",
    ladenBunkerPerDay: "",
    revenuePerMT: "", // New field for revenue per metric ton
  })
  const [results, setResults] = useState(null)
  const saveModalRef = useRef(null)

  const fetchVessels = async () => {
    try {
      setLoading(true)
      const vesselsList = await getAllVessels()
      setAllVessels(vesselsList)

      // Filter vessels that have the required trip calculation fields (allow 0 values but not undefined/null)
      const tripsEnabledVessels = vesselsList.filter((vessel) => {
        const requiredFields = [
          'doPrice', 'doStandby', 'doAtSea', 'doDischarge', 'doIdle',
          'loading', 'idle', 'hire', 'hirePerDay', 'vesselCapacity',
          'seaBallastWithCargoTemp', 'discharging'
        ]
        
        // Check if vessel has all required fields defined (not undefined/null)
        return requiredFields.every(field => 
          vessel.hasOwnProperty(field) && vessel[field] !== null && vessel[field] !== undefined
        )
      })
      setVessels(tripsEnabledVessels)
      setError(null)
    } catch (error) {
      console.error("Error fetching vessels:", error)
      setError("Failed to load vessels. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVessels()
  }, [])

  const handleRefreshVessels = () => {
    fetchVessels()
  }

  const handleVesselSelect = (vessel) => {
    setSelectedVessel(vessel)
    setResults(null)
    setSuccess(null)
  }

  const handleLoadingInputChange = (e) => {
    const { name, value } = e.target
    setLoadingFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDischargingInputChange = (e) => {
    const { name, value } = e.target
    setDischargingFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // File upload handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validate file types and sizes
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ]

    const maxSize = 10 * 1024 * 1024 // 10MB

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        setError(`File type not allowed: ${file.name}. Please upload PDF, images, documents, or text files.`)
        return false
      }
      if (file.size > maxSize) {
        setError(`File too large: ${file.name}. Maximum size is 10MB.`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [
        ...prev,
        ...validFiles.map((file) => ({
          file,
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploaded: false,
        })),
      ])
      setError(null)
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return "🖼️"
    if (fileType === "application/pdf") return "📄"
    if (fileType.includes("word")) return "📝"
    if (fileType.includes("excel") || fileType.includes("sheet")) return "📊"
    if (fileType.includes("text")) return "📋"
    return "📁"
  }

  const calculateTrip = () => {
    if (!selectedVessel) {
      setError("Please select a vessel first")
      return
    }

    // Validate loading fields
    const loadingRequiredFields = [
      "loadingSailingDays",
      "idleDays",
      "loadingDays",
      "surveyorDays",
      "pdaCost",
      "surveyorCost",
      "bunkerPrice",
      "ladenBunkerPerDay",
    ]

    for (const field of loadingRequiredFields) {
      if (!loadingFormData[field] || isNaN(Number(loadingFormData[field]))) {
        setError(`Please enter a valid ${field.replace(/([A-Z])/g, " $1").toLowerCase()} in loading section`)
        return
      }
    }

    // Validate discharging fields
    const dischargingRequiredFields = [
      "dischargingSailingDays",
      "dischargeDays",
      "awrpCrewBonusPiracy",
      "bunkerPrice",
      "ladenBunkerPerDay",
    ]

    for (const field of dischargingRequiredFields) {
      if (!dischargingFormData[field] || isNaN(Number(dischargingFormData[field]))) {
        setError(`Please enter a valid ${field.replace(/([A-Z])/g, " $1").toLowerCase()} in discharging section`)
        return
      }
    }

    setError(null)

    // Convert loading form data to numbers
    const loadingSailingDays = Number(loadingFormData.loadingSailingDays)
    const idleDays = Number(loadingFormData.idleDays)
    const loadingDays = Number(loadingFormData.loadingDays)
    const surveyorDays = Number(loadingFormData.surveyorDays)
    const pdaCost = Number(loadingFormData.pdaCost)
    const surveyorCost = Number(loadingFormData.surveyorCost)
    const loadingBunkerPrice = Number(loadingFormData.bunkerPrice)
    const loadingLadenBunkerPerDay = Number(loadingFormData.ladenBunkerPerDay)

    // Convert discharging form data to numbers
    const dischargingSailingDays = Number(dischargingFormData.dischargingSailingDays)
    const dischargeDays = Number(dischargingFormData.dischargeDays)
    const awrpCrewBonusPiracy = Number(dischargingFormData.awrpCrewBonusPiracy)
    const dischargingBunkerPrice = Number(dischargingFormData.bunkerPrice)
    const dischargingLadenBunkerPerDay = Number(dischargingFormData.ladenBunkerPerDay)

    // Vessel data
    const doPrice = Number(selectedVessel.doPrice)
    const doIdle = Number(selectedVessel.doIdle)
    const doAtSea = Number(selectedVessel.doAtSea)
    const hirePerDay = Number(selectedVessel.hirePerDay)
    const seaBallastWithCargoTemp = Number(selectedVessel.seaBallastWithCargoTemp)
    const discharging = Number(selectedVessel.discharging)
    const vesselCapacityMT = Number(selectedVessel.vesselCapacity.replace(/[^\d.]/g, "")) || 1

    // LOADING CALCULATIONS
    const bunkerIdleCost = idleDays * Number(selectedVessel.idle) * loadingBunkerPrice + doPrice * doIdle * idleDays
    const bunkerLadenCost =
      loadingSailingDays * (loadingLadenBunkerPerDay + seaBallastWithCargoTemp) * loadingBunkerPrice +
      doPrice * doAtSea * loadingSailingDays
    const bunkerLoadingCost =
      loadingDays * Number(selectedVessel.loading) * loadingBunkerPrice + doPrice * doIdle * loadingDays
    const surveyorBunkerCost = doPrice * doIdle * surveyorDays
    const loadingHireCost = hirePerDay * (loadingSailingDays + idleDays + loadingDays + surveyorDays)

    const totalLoadingCost =
      bunkerIdleCost +
      bunkerLadenCost +
      bunkerLoadingCost +
      surveyorBunkerCost +
      loadingHireCost +
      pdaCost +
      surveyorCost

    const loadingCostPerMT = totalLoadingCost / vesselCapacityMT

    // DISCHARGING CALCULATIONS
    const bunkerSailingCost =
      dischargingSailingDays * (dischargingLadenBunkerPerDay + seaBallastWithCargoTemp) * dischargingBunkerPrice +
      doPrice * doAtSea * dischargingSailingDays
    const bunkerDischargingCost =
      discharging * dischargeDays * dischargingBunkerPrice +
      doPrice * Number(selectedVessel.doDischarge) * dischargeDays
    const dischargingHireCost = hirePerDay * (dischargingSailingDays + dischargeDays)

    const totalDischargingCost = bunkerSailingCost + bunkerDischargingCost + dischargingHireCost + awrpCrewBonusPiracy

    const dischargingCostPerMT = totalDischargingCost / vesselCapacityMT

    const totalRevenuePerMT = Number(loadingFormData.revenuePerMT) || 0
    const loadingRevenuePerMT = totalRevenuePerMT
    const dischargingRevenuePerMT = 0 // Set to 0 since we're using total revenue only

    // TOTAL CALCULATIONS
    const totalCost = totalLoadingCost + totalDischargingCost
    const totalCostPerMT = totalCost / vesselCapacityMT
    const totalRevenue = vesselCapacityMT * totalRevenuePerMT
    const totalProfit = totalRevenue - totalCost
    const totalProfitPerMT = totalProfit / vesselCapacityMT
    const totalProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    const loadingRevenue = totalRevenue // All revenue attributed to loading
    const dischargingRevenue = 0 // No separate discharging revenue

    const loadingProfit = loadingRevenue - totalLoadingCost
    const loadingProfitPerMT = loadingProfit / vesselCapacityMT
    const loadingProfitMargin = loadingRevenue > 0 ? (loadingProfit / loadingRevenue) * 100 : 0

    const dischargingProfit = dischargingRevenue - totalDischargingCost
    const dischargingProfitPerMT = dischargingProfit / vesselCapacityMT
    const dischargingProfitMargin = dischargingRevenue > 0 ? (dischargingProfit / dischargingRevenue) * 100 : 0

    setResults({
      // Loading results
      loading: {
        bunkerIdleCost,
        bunkerLadenCost,
        bunkerLoadingCost,
        surveyorBunkerCost,
        hireCost: loadingHireCost,
        pdaCost,
        surveyorCost,
        totalCost: totalLoadingCost,
        costPerMT: loadingCostPerMT,
        totalDays: loadingSailingDays + idleDays + loadingDays + surveyorDays,
        revenue: loadingRevenue,
        revenuePerMT: loadingRevenuePerMT,
        profit: loadingProfit,
        profitPerMT: loadingProfitPerMT,
        profitMargin: loadingProfitMargin,
      },
      // Discharging results
      discharging: {
        bunkerSailingCost,
        bunkerDischargingCost,
        hireCost: dischargingHireCost,
        awrpCrewBonusPiracy,
        totalCost: totalDischargingCost,
        costPerMT: dischargingCostPerMT,
        totalDays: dischargingSailingDays + dischargeDays,
        revenue: dischargingRevenue,
        revenuePerMT: dischargingRevenuePerMT,
        profit: dischargingProfit,
        profitPerMT: dischargingProfitPerMT,
        profitMargin: dischargingProfitMargin,
      },
      // Overall totals
      totalCost,
      totalCostPerMT,
      vesselCapacityMT,
      grandTotalDays:
        loadingSailingDays + idleDays + loadingDays + surveyorDays + dischargingSailingDays + dischargeDays,
      totalRevenue,
      totalProfit,
      totalProfitPerMT,
      totalProfitMargin,
    })
  }

  const resetCalculation = () => {
    setLoadingFormData({
      loadingSailingDays: "",
      idleDays: "",
      loadingDays: "",
      surveyorDays: "",
      pdaCost: "",
      surveyorCost: "",
      bunkerPrice: "",
      ladenBunkerPerDay: "",
      revenuePerMT: "",
    })
    setDischargingFormData({
      dischargingSailingDays: "",
      dischargeDays: "",
      awrpCrewBonusPiracy: "",
      bunkerPrice: "",
      ladenBunkerPerDay: "",
      revenuePerMT: "",
    })
    setResults(null)
    setSelectedVessel(null)
    setError(null)
    setSuccess(null)
    setTripName("")
    setTripDate(new Date().toISOString().split("T")[0])
    setUploadedFiles([])
  }

  const handleSaveReport = async () => {
    if (!results || !selectedVessel) {
      setError("Please calculate trip costs before saving")
      return
    }

    if (!tripName.trim()) {
      setError("Please enter a name for this trip report")
      return
    }

    if (!tripDate) {
      setError("Please select a date for this trip")
      return
    }

    try {
      setSavingReport(true)
      setError(null)

      // Create a report object with all the necessary data
      const reportData = {
        tripName: tripName.trim(),
        tripDate: tripDate, // Store the selected date
        vesselId: selectedVessel.id,
        vesselName: selectedVessel.name,
        vesselCapacity: selectedVessel.vesselCapacity,
        userId: user?.uid || "anonymous",
        userName: user?.displayName || user?.email || "Anonymous User",
        loadingData: loadingFormData,
        dischargingData: dischargingFormData,
        results: results,
        attachedFiles: uploadedFiles.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          uploadedAt: new Date().toISOString(),
        })),
        // Add summary data for easy statistics calculation
        summary: {
          totalCost: results.totalCost,
          totalRevenue: results.totalRevenue,
          totalProfit: results.totalProfit,
          totalProfitMargin: results.totalProfitMargin,
          vesselCapacityMT: results.vesselCapacityMT,
          totalDays: results.grandTotalDays,
        },
      }

      // Save the report to Firestore (files will be uploaded by the utility function)
      await saveTripReport(
        reportData,
        uploadedFiles.map((f) => f.file),
      )

      setSuccess("Trip report submitted successfully and is pending admin approval! You will be notified once it's approved and available in the Reports section.")
      setTripName("")
      setTripDate(new Date().toISOString().split("T")[0])
      setUploadedFiles([])
    } catch (error) {
      console.error("Error saving trip report:", error)
      setError("Failed to save trip report. Please try again.")
    } finally {
      setSavingReport(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Trip Calculator
          </h1>
          <Link to="/reports">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              View Saved Reports
            </Button>
          </Link>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>}
        {success && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">{success}</div>
        )}

        {/* Vessel Selection */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Select Vessel
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshVessels}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading vessels...</div>
            ) : vessels.length > 0 ? (
              <div className="space-y-3">
                {vessels.map((vessel) => (
                  <div
                    key={vessel.id}
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${
                      selectedVessel?.id === vessel.id
                        ? "border-[#2e1a47] bg-[#2e1a47]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleVesselSelect(vessel)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{vessel.name}</h3>
                        <p className="text-sm text-gray-600">
                          Capacity: {vessel.vesselCapacity} | Hire: ${vessel.hirePerDay}/day
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p>D.O Price: ${vessel.doPrice}</p>
                        <p>D.O Idle: {vessel.doIdle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : allVessels.length > 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-2 font-medium">No vessels configured for trip calculation</p>
                <p className="text-sm text-gray-500 mb-4">
                  You have {allVessels.length} vessel(s), but they need trip calculation data to be filled in their vessel details
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4 text-left">
                  <p className="text-sm text-yellow-800 font-medium mb-2">Required fields for trip calculation:</p>
                  <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                    <li>D.O Price, D.O Standby, D.O At Sea, D.O Discharge, D.O Idle</li>
                    <li>Loading, Idle, Hire, Hire Per Day</li>
                    <li>Vessel Capacity, Sea Ballast with Cargo Temp, Discharging</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Link to="/vessels">
                    <Button variant="outline" size="sm" className="mr-2">Edit Existing Vessels</Button>
                  </Link>
                  <Link to="/vessels/add">
                    <Button size="sm">Add New Vessel</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No vessels found</p>
                <Link to="/vessels/add">
                  <Button>Add Your First Vessel</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loading Operations Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="h-5 w-5 text-blue-600" />
                Loading Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="loadingSailingDays" className="block text-sm font-medium mb-1">
                      Loading Sailing Days*
                    </label>
                    <input
                      id="loadingSailingDays"
                      name="loadingSailingDays"
                      type="number"
                      step="0.1"
                      value={loadingFormData.loadingSailingDays}
                      onChange={handleLoadingInputChange}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="idleDays" className="block text-sm font-medium mb-1">
                      Idle Days*
                    </label>
                    <input
                      id="idleDays"
                      name="idleDays"
                      type="number"
                      step="0.1"
                      value={loadingFormData.idleDays}
                      onChange={handleLoadingInputChange}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="loadingDays" className="block text-sm font-medium mb-1">
                      Loading Days*
                    </label>
                    <input
                      id="loadingDays"
                      name="loadingDays"
                      type="number"
                      step="0.1"
                      value={loadingFormData.loadingDays}
                      onChange={handleLoadingInputChange}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="surveyorDays" className="block text-sm font-medium mb-1">
                      Surveyor Days*
                    </label>
                    <input
                      id="surveyorDays"
                      name="surveyorDays"
                      type="number"
                      step="0.1"
                      value={loadingFormData.surveyorDays}
                      onChange={handleLoadingInputChange}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pdaCost" className="block text-sm font-medium mb-1">
                      PDA Cost ($)*
                    </label>
                    <input
                      id="pdaCost"
                      name="pdaCost"
                      type="number"
                      step="0.01"
                      value={loadingFormData.pdaCost}
                      onChange={handleLoadingInputChange}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label htmlFor="surveyorCost" className="block text-sm font-medium mb-1">
                      Surveyor Cost ($)*
                    </label>
                    <input
                      id="surveyorCost"
                      name="surveyorCost"
                      type="number"
                      step="0.01"
                      value={loadingFormData.surveyorCost}
                      onChange={handleLoadingInputChange}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bunkerPrice" className="block text-sm font-medium mb-1">
                      Bunker Price ($/MT)*
                    </label>
                    <input
                      id="bunkerPrice"
                      name="bunkerPrice"
                      type="number"
                      step="0.01"
                      value={loadingFormData.bunkerPrice}
                      onChange={handleLoadingInputChange}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label htmlFor="ladenBunkerPerDay" className="block text-sm font-medium mb-1">
                      Laden Bunker/Day (MT)*
                    </label>
                    <input
                      id="ladenBunkerPerDay"
                      name="ladenBunkerPerDay"
                      type="number"
                      step="0.1"
                      value={loadingFormData.ladenBunkerPerDay}
                      onChange={handleLoadingInputChange}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discharging Operations Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-orange-600" />
                Discharging Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dischargingSailingDays" className="block text-sm font-medium mb-1">
                      Discharge Sailing Days*
                    </label>
                    <input
                      id="dischargingSailingDays"
                      name="dischargingSailingDays"
                      type="number"
                      step="0.1"
                      value={dischargingFormData.dischargingSailingDays}
                      onChange={handleDischargingInputChange}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="dischargeDays" className="block text-sm font-medium mb-1">
                      Discharge Days*
                    </label>
                    <input
                      id="dischargeDays"
                      name="dischargeDays"
                      type="number"
                      step="0.1"
                      value={dischargingFormData.dischargeDays}
                      onChange={handleDischargingInputChange}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="awrpCrewBonusPiracy" className="block text-sm font-medium mb-1">
                      AWRP + Crew Bonus + Piracy ($)*
                    </label>
                    <input
                      id="awrpCrewBonusPiracy"
                      name="awrpCrewBonusPiracy"
                      type="number"
                      step="0.01"
                      value={dischargingFormData.awrpCrewBonusPiracy}
                      onChange={handleDischargingInputChange}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bunkerPrice" className="block text-sm font-medium mb-1">
                      Bunker Price ($/MT)*
                    </label>
                    <input
                      id="bunkerPrice"
                      name="bunkerPrice"
                      type="number"
                      step="0.01"
                      value={dischargingFormData.bunkerPrice}
                      onChange={handleDischargingInputChange}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label htmlFor="ladenBunkerPerDay" className="block text-sm font-medium mb-1">
                      Laden Bunker/Day (MT)*
                    </label>
                    <input
                      id="ladenBunkerPerDay"
                      name="ladenBunkerPerDay"
                      type="number"
                      step="0.1"
                      value={dischargingFormData.ladenBunkerPerDay}
                      onChange={handleDischargingInputChange}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calculate Button */}
        <div className="flex gap-2 mt-6 justify-center">
          <Button onClick={calculateTrip} disabled={!selectedVessel} size="lg">
            Calculate Trip Cost
          </Button>
          <Button variant="outline" onClick={resetCalculation} size="lg">
            Reset All
          </Button>
        </div>

        {/* Single Revenue Input */}
        {selectedVessel && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Trip Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="totalRevenuePerMT" className="block text-sm font-medium mb-1">
                    Total Revenue per MT ($)*
                  </label>
                  <input
                    id="totalRevenuePerMT"
                    name="totalRevenuePerMT"
                    type="number"
                    step="0.01"
                    value={loadingFormData.revenuePerMT}
                    onChange={(e) => {
                      const value = e.target.value
                      setLoadingFormData((prev) => ({ ...prev, revenuePerMT: value }))
                      setDischargingFormData((prev) => ({ ...prev, revenuePerMT: value }))
                    }}
                    className="w-full rounded-md border px-3 py-2 text-sm border-green-200 focus:border-green-500"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the total revenue per metric ton for the entire trip
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">Total Trip Revenue</p>
                    <p className="text-2xl font-bold text-green-800">
                      $
                      {selectedVessel && loadingFormData.revenuePerMT
                        ? (
                            Number(loadingFormData.revenuePerMT) *
                              Number(selectedVessel.vesselCapacity.replace(/[^\d.]/g, "")) || 0
                          ).toFixed(2)
                        : "0.00"}
                    </p>
                    <p className="text-xs text-green-600">
                      {selectedVessel ? `${selectedVessel.vesselCapacity} capacity` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* File Upload Section */}
        {selectedVessel && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                Trip Documents & Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Documents (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or click to select</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFiles}
                    >
                      {uploadingFiles ? "Uploading..." : "Select Files"}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported: PDF, Images, Documents, Spreadsheets, Text files (Max 10MB each)
                    </p>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Attached Files ({uploadedFiles.length})</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getFileIcon(file.type)}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} • {file.type.split("/")[1]?.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Vessel Details */}
        {selectedVessel && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Selected Vessel: {selectedVessel.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">D.O Price:</p>
                  <p>${selectedVessel.doPrice}</p>
                </div>
                <div>
                  <p className="font-medium">D.O At Sea:</p>
                  <p>{selectedVessel.doAtSea}</p>
                </div>
                <div>
                  <p className="font-medium">D.O Discharge:</p>
                  <p>{selectedVessel.doDischarge}</p>
                </div>
                <div>
                  <p className="font-medium">D.O Idle:</p>
                  <p>{selectedVessel.doIdle}</p>
                </div>
                <div>
                  <p className="font-medium">Loading:</p>
                  <p>{selectedVessel.loading}</p>
                </div>
                <div>
                  <p className="font-medium">Idle:</p>
                  <p>{selectedVessel.idle}</p>
                </div>
                <div>
                  <p className="font-medium">Hire Per Day:</p>
                  <p>${selectedVessel.hirePerDay}</p>
                </div>
                <div>
                  <p className="font-medium">Capacity:</p>
                  <p>{selectedVessel.vesselCapacity}</p>
                </div>
                <div>
                  <p className="font-medium">Sea Ballast with Cargo Temp:</p>
                  <p>{selectedVessel.seaBallastWithCargoTemp}</p>
                </div>
                <div>
                  <p className="font-medium">Discharging:</p>
                  <p>{selectedVessel.discharging}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Trip Cost & Revenue Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Save Trip Report Section */}
                <div className="bg-[#2e1a47]/5 p-4 rounded-lg border border-[#2e1a47]/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    Save Trip Report
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label htmlFor="tripName" className="block text-sm font-medium mb-1">
                        Trip Name*
                      </label>
                      <input
                        id="tripName"
                        type="text"
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="e.g., Rotterdam to Singapore"
                      />
                    </div>
                    <div>
                      <label htmlFor="tripDate" className="block text-sm font-medium mb-1">
                        Trip Date*
                      </label>
                      <input
                        id="tripDate"
                        type="date"
                        value={tripDate}
                        onChange={(e) => setTripDate(e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                    <Button
                      onClick={handleSaveReport}
                      disabled={savingReport || !tripName.trim() || !tripDate}
                      className="whitespace-nowrap"
                    >
                      {savingReport ? "Saving..." : "Save Trip Report"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Save this trip calculation with all attachments to generate reports later
                  </p>
                  {uploadedFiles.length > 0 && (
                    <p className="text-xs text-purple-600 mt-1">
                      📎 {uploadedFiles.length} file(s) will be attached to this report
                    </p>
                  )}
                </div>

                {/* Profit Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Profit Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-green-50 rounded-md text-center">
                      <h4 className="text-lg font-medium mb-2 text-green-800">Total Revenue</h4>
                      <p className="text-3xl font-bold text-green-700">${results.totalRevenue.toFixed(2)}</p>
                      <p className="text-sm text-green-600 mt-1">
                        $
                        {results.totalRevenue > 0
                          ? (results.totalRevenue / results.vesselCapacityMT).toFixed(2)
                          : "0.00"}{" "}
                        per MT
                      </p>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-md text-center">
                      <h4 className="text-lg font-medium mb-2 text-blue-800">Total Cost</h4>
                      <p className="text-3xl font-bold text-blue-700">${results.totalCost.toFixed(2)}</p>
                      <p className="text-sm text-blue-600 mt-1">${results.totalCostPerMT.toFixed(2)} per MT</p>
                    </div>
                    <div
                      className={`p-6 rounded-md text-center ${results.totalProfit >= 0 ? "bg-emerald-50" : "bg-red-50"}`}
                    >
                      <h4 className="text-lg font-medium mb-2 text-gray-800">Net Profit</h4>
                      <p
                        className={`text-3xl font-bold ${results.totalProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}
                      >
                        ${results.totalProfit.toFixed(2)}
                      </p>
                      <p className={`text-sm mt-1 ${results.totalProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {results.totalProfitMargin.toFixed(2)}% margin
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loading Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-900 flex items-center gap-2">
                    <Anchor className="h-5 w-5" />
                    Loading Operations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-blue-50 rounded-md">
                      <h4 className="font-medium text-blue-900">Bunker Idle Cost</h4>
                      <p className="text-xl font-bold text-blue-700">${results.loading.bunkerIdleCost.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-md">
                      <h4 className="font-medium text-green-900">Bunker Laden Cost</h4>
                      <p className="text-xl font-bold text-green-700">${results.loading.bunkerLadenCost.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-md">
                      <h4 className="font-medium text-yellow-900">Bunker Loading Cost</h4>
                      <p className="text-xl font-bold text-yellow-700">
                        ${results.loading.bunkerLoadingCost.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-md">
                      <h4 className="font-medium text-purple-900">Surveyor Bunker Cost</h4>
                      <p className="text-xl font-bold text-purple-700">
                        ${results.loading.surveyorBunkerCost.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-md">
                      <h4 className="font-medium text-indigo-900">Loading Hire Cost</h4>
                      <p className="text-xl font-bold text-indigo-700">${results.loading.hireCost.toFixed(2)}</p>
                      <p className="text-sm text-indigo-600">({results.loading.totalDays} days)</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <h4 className="font-medium text-gray-900">Other Costs</h4>
                      <p className="text-xl font-bold text-gray-700">
                        ${(results.loading.pdaCost + results.loading.surveyorCost).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">PDA + Surveyor</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-100 rounded-md text-center">
                      <h4 className="font-medium text-blue-900">Total Loading Cost</h4>
                      <p className="text-2xl font-bold text-blue-800">${results.loading.totalCost.toFixed(2)}</p>
                      <p className="text-sm text-blue-600">${results.loading.costPerMT.toFixed(2)} per MT</p>
                    </div>
                    <div className="p-4 bg-green-100 rounded-md text-center">
                      <h4 className="font-medium text-green-900">Loading Revenue</h4>
                      <p className="text-2xl font-bold text-green-800">${results.loading.revenue.toFixed(2)}</p>
                      <p className="text-sm text-green-600">${results.loading.revenuePerMT.toFixed(2)} per MT</p>
                    </div>
                    <div
                      className={`p-4 rounded-md text-center ${results.loading.profit >= 0 ? "bg-emerald-100" : "bg-red-100"}`}
                    >
                      <h4 className="font-medium text-gray-900">Loading Profit</h4>
                      <p
                        className={`text-2xl font-bold ${results.loading.profit >= 0 ? "text-emerald-800" : "text-red-800"}`}
                      >
                        ${results.loading.profit.toFixed(2)}
                      </p>
                      <p className={`text-sm ${results.loading.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {results.loading.profitMargin.toFixed(2)}% margin
                      </p>
                    </div>
                  </div>
                </div>

                {/* Discharging Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-orange-900 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Discharging Operations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-orange-50 rounded-md">
                      <h4 className="font-medium text-orange-900">Bunker Sailing Cost</h4>
                      <p className="text-xl font-bold text-orange-700">
                        ${results.discharging.bunkerSailingCost.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-md">
                      <h4 className="font-medium text-red-900">Bunker Discharging Cost</h4>
                      <p className="text-xl font-bold text-red-700">
                        ${results.discharging.bunkerDischargingCost.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-md">
                      <h4 className="font-medium text-pink-900">Discharging Hire Cost</h4>
                      <p className="text-xl font-bold text-pink-700">${results.discharging.hireCost.toFixed(2)}</p>
                      <p className="text-sm text-pink-600">({results.discharging.totalDays} days)</p>
                    </div>
                    <div className="p-4 bg-teal-50 rounded-md">
                      <h4 className="font-medium text-teal-900">AWRP + Crew Bonus + Piracy</h4>
                      <p className="text-xl font-bold text-teal-700">
                        ${results.discharging.awrpCrewBonusPiracy.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-orange-100 rounded-md text-center">
                      <h4 className="font-medium text-orange-900">Total Discharging Cost</h4>
                      <p className="text-2xl font-bold text-orange-800">${results.discharging.totalCost.toFixed(2)}</p>
                      <p className="text-sm text-orange-600">${results.discharging.costPerMT.toFixed(2)} per MT</p>
                    </div>
                    <div className="p-4 bg-green-100 rounded-md text-center">
                      <h4 className="font-medium text-green-900">Discharging Revenue</h4>
                      <p className="text-2xl font-bold text-green-800">${results.discharging.revenue.toFixed(2)}</p>
                      <p className="text-sm text-green-600">${results.discharging.revenuePerMT.toFixed(2)} per MT</p>
                    </div>
                    <div
                      className={`p-4 rounded-md text-center ${results.discharging.profit >= 0 ? "bg-emerald-100" : "bg-red-100"}`}
                    >
                      <h4 className="font-medium text-gray-900">Discharging Profit</h4>
                      <p
                        className={`text-2xl font-bold ${results.discharging.profit >= 0 ? "text-emerald-800" : "text-red-800"}`}
                      >
                        ${results.discharging.profit.toFixed(2)}
                      </p>
                      <p className={`text-sm ${results.discharging.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {results.discharging.profitMargin.toFixed(2)}% margin
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Total Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-[#2e1a47] text-white rounded-md text-center">
                      <h4 className="text-lg font-medium mb-2">Total Trip Cost</h4>
                      <p className="text-3xl font-bold">${results.totalCost.toFixed(2)}</p>
                      <p className="text-sm opacity-90 mt-2">
                        For {results.grandTotalDays} total days with {selectedVessel.name}
                      </p>
                    </div>
                    <div className="p-6 bg-green-600 text-white rounded-md text-center">
                      <h4 className="text-lg font-medium mb-2">Total Cost per MT</h4>
                      <p className="text-3xl font-bold">${results.totalCostPerMT.toFixed(2)}</p>
                      <p className="text-sm opacity-90 mt-2">per metric ton</p>
                    </div>
                    <div className="p-6 bg-gray-600 text-white rounded-md text-center">
                      <h4 className="text-lg font-medium mb-2">Vessel Capacity</h4>
                      <p className="text-3xl font-bold">{results.vesselCapacityMT.toFixed(0)}</p>
                      <p className="text-sm opacity-90 mt-2">metric tons</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Detailed Cost & Revenue Breakdown:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <h5 className="font-medium text-blue-900 mb-2">Loading Operations:</h5>
                      <p>
                        Bunker Idle Cost:{" "}
                        <span className="font-medium">${results.loading.bunkerIdleCost.toFixed(2)}</span>
                      </p>
                      <p>
                        Bunker Laden Cost:{" "}
                        <span className="font-medium">${results.loading.bunkerLadenCost.toFixed(2)}</span>
                      </p>
                      <p>
                        Bunker Loading Cost:{" "}
                        <span className="font-medium">${results.loading.bunkerLoadingCost.toFixed(2)}</span>
                      </p>
                      <p>
                        Surveyor Bunker Cost:{" "}
                        <span className="font-medium">${results.loading.surveyorBunkerCost.toFixed(2)}</span>
                      </p>
                      <p>
                        Loading Hire Cost: <span className="font-medium">${results.loading.hireCost.toFixed(2)}</span>
                      </p>
                      <p>
                        PDA Cost: <span className="font-medium">${results.loading.pdaCost.toFixed(2)}</span>
                      </p>
                      <p>
                        Surveyor Cost: <span className="font-medium">${results.loading.surveyorCost.toFixed(2)}</span>
                      </p>
                      <p className="font-bold border-t pt-1 mt-1">
                        Loading Total Cost: <span className="font-bold">${results.loading.totalCost.toFixed(2)}</span>
                      </p>
                      <p className="text-green-600">
                        Loading Revenue: <span className="font-medium">${results.loading.revenue.toFixed(2)}</span>
                      </p>
                      <p className={`${results.loading.profit >= 0 ? "text-emerald-600" : "text-red-600"} font-bold`}>
                        Loading Profit: <span>${results.loading.profit.toFixed(2)}</span>
                        <span className="ml-2">({results.loading.profitMargin.toFixed(2)}%)</span>
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-orange-900 mb-2">Discharging Operations:</h5>
                      <p>
                        Bunker Sailing Cost:{" "}
                        <span className="font-medium">${results.discharging.bunkerSailingCost.toFixed(2)}</span>
                      </p>
                      <p>
                        Bunker Discharging Cost:{" "}
                        <span className="font-medium">${results.discharging.bunkerDischargingCost.toFixed(2)}</span>
                      </p>
                      <p>
                        Discharging Hire Cost:{" "}
                        <span className="font-medium">${results.discharging.hireCost.toFixed(2)}</span>
                      </p>
                      <p>
                        AWRP + Crew Bonus + Piracy:{" "}
                        <span className="font-medium">${results.discharging.awrpCrewBonusPiracy.toFixed(2)}</span>
                      </p>
                      <p className="font-bold border-t pt-1 mt-1">
                        Discharging Total Cost:{" "}
                        <span className="font-bold">${results.discharging.totalCost.toFixed(2)}</span>
                      </p>
                      <p className="text-green-600">
                        Discharging Revenue:{" "}
                        <span className="font-medium">${results.discharging.revenue.toFixed(2)}</span>
                      </p>
                      <p
                        className={`${results.discharging.profit >= 0 ? "text-emerald-600" : "text-red-600"} font-bold`}
                      >
                        Discharging Profit: <span>${results.discharging.profit.toFixed(2)}</span>
                        <span className="ml-2">({results.discharging.profitMargin.toFixed(2)}%)</span>
                      </p>

                      <h5 className="font-medium text-gray-900 mb-2 mt-4">Per Metric Ton Analysis:</h5>
                      <p>
                        Total Cost/MT: <span className="font-medium">${results.totalCostPerMT.toFixed(2)}</span>
                      </p>
                      <p className="text-green-600">
                        Total Revenue/MT:{" "}
                        <span className="font-medium">
                          ${(results.totalRevenue / results.vesselCapacityMT).toFixed(2)}
                        </span>
                      </p>
                      <p className={`${results.totalProfit >= 0 ? "text-emerald-600" : "text-red-600"} font-bold`}>
                        Total Profit/MT: <span>${results.totalProfitPerMT.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default TripCalculator
