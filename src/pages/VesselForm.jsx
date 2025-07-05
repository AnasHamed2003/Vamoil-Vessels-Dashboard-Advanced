"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useLocation, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { createVesselWithImage, getVesselById, updateVesselWithImage } from "../utils/firebaseUtils"
import { ArrowLeft, Upload, X, ImageIcon, Save, Loader2 } from "lucide-react"
import { useFirebase } from "../components/FirebaseProvider"

const VesselForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { userRole } = useFirebase()

  // Check if we're in add mode by looking at the URL path
  const isAddMode = location.pathname.includes("/add") || id === "add"
  const isEditMode = !isAddMode && id

  console.log("VesselForm: Route params:", { id, pathname: location.pathname, isAddMode, isEditMode })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  // Combined form data with all fields from both versions
  const [formData, setFormData] = useState({
    // Basic vessel information (from original)
    name: "",
    location: "",
    load: "",
    capacity: "",
    status: "active",
    image: "/placeholder.svg",
    imagePath: "",
    mmsi: "",

    // Additional fields (from new version)
    type: "",
    description: "",

    // Technical specifications (from new version)
    specifications: {
      length: "",
      width: "",
      draft: "",
      grossTonnage: "",
      netTonnage: "",
      enginePower: "",
      maxSpeed: "",
      fuelCapacity: "",
      crewCapacity: "",
    },

    // Trip calculation fields (from original)
    doPrice: "",
    doStandby: "",
    doAtSea: "",
    doDischarge: "",
    doIdle: "",
    loading: "",
    idle: "",
    hire: "",
    hirePerDay: "",
    vesselCapacity: "",
    seaBallastWithCargoTemp: "",
    discharging: "",
  })

  // Redirect if not admin
  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/vessels")
    }
  }, [userRole, navigate])

  // Only fetch vessel data if we're in edit mode
  useEffect(() => {
    const fetchVessel = async () => {
      if (!isEditMode) {
        console.log("VesselForm: Add mode - not fetching vessel data")
        return
      }

      if (!id) {
        console.log("VesselForm: No vessel ID provided for edit mode")
        setError("No vessel ID provided")
        return
      }

      console.log("VesselForm: Edit mode - fetching vessel with ID:", id)
      setLoading(true)

      try {
        const vesselData = await getVesselById(id)
        if (vesselData) {
          console.log("VesselForm: Vessel data loaded:", vesselData)
          setFormData({
            // Basic vessel information
            name: vesselData.name || "",
            location: vesselData.location || "",
            load: vesselData.load || "",
            capacity: vesselData.capacity || "",
            status: vesselData.status || "active",
            image: vesselData.image || "/placeholder.svg",
            imagePath: vesselData.imagePath || "",
            mmsi: vesselData.mmsi || "",

            // Additional fields
            type: vesselData.type || "",
            description: vesselData.description || "",

            // Technical specifications
            specifications: {
              length: vesselData.specifications?.length || "",
              width: vesselData.specifications?.width || "",
              draft: vesselData.specifications?.draft || "",
              grossTonnage: vesselData.specifications?.grossTonnage || "",
              netTonnage: vesselData.specifications?.netTonnage || "",
              enginePower: vesselData.specifications?.enginePower || "",
              maxSpeed: vesselData.specifications?.maxSpeed || "",
              fuelCapacity: vesselData.specifications?.fuelCapacity || "",
              crewCapacity: vesselData.specifications?.crewCapacity || "",
            },

            // Trip calculation fields
            doPrice: vesselData.doPrice || "",
            doStandby: vesselData.doStandby || "",
            doAtSea: vesselData.doAtSea || "",
            doDischarge: vesselData.doDischarge || "",
            doIdle: vesselData.doIdle || "",
            loading: vesselData.loading || "",
            idle: vesselData.idle || "",
            hire: vesselData.hire || "",
            hirePerDay: vesselData.hirePerDay || "",
            vesselCapacity: vesselData.vesselCapacity || "",
            seaBallastWithCargoTemp: vesselData.seaBallastWithCargoTemp || "",
            discharging: vesselData.discharging || "",
          })

          // Set image preview if there's an image
          if (vesselData.image && !vesselData.image.includes("placeholder")) {
            setImagePreview(vesselData.image)
          }

          setError(null)
        } else {
          console.log("VesselForm: Vessel not found with ID:", id)
          setError("Vessel not found")
        }
      } catch (error) {
        console.error("VesselForm: Error fetching vessel:", error)
        setError("Failed to load vessel data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchVessel()
  }, [id, isEditMode])

  // Handle input changes for both regular fields and nested specifications
  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith("specifications.")) {
      const specField = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    setImageFile(file)
    setError("")

    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    // If we're in edit mode and had an existing image, reset to placeholder
    if (isEditMode) {
      setFormData((prev) => ({
        ...prev,
        image: "/placeholder.svg",
        imagePath: "",
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess("")

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Vessel name is required")
      }

      console.log("VesselForm: Submitting vessel form:", { isEditMode, formData })

      if (isEditMode) {
        console.log("VesselForm: Updating vessel with ID:", id)
        await updateVesselWithImage(id, formData, imageFile, formData.imagePath)
        setSuccess("Vessel updated successfully!")
        console.log("VesselForm: Vessel updated successfully")
      } else {
        console.log("VesselForm: Creating new vessel")
        const newVesselId = await createVesselWithImage(formData, imageFile)
        setSuccess("Vessel created successfully!")
        console.log("VesselForm: Vessel created successfully with ID:", newVesselId)
      }

      // Navigate back to vessels list after a short delay
      setTimeout(() => {
        navigate("/vessels")
      }, 1500)
    } catch (error) {
      console.error("VesselForm: Error saving vessel:", error)
      setError(error.message || `Failed to ${isEditMode ? "update" : "create"} vessel. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  // Show loading only for edit mode
  if (loading && isEditMode) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-6xl w-full text-center text-gray-600 dark:text-gray-300">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading vessel data...
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="mx-auto max-w-6xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? "Edit Vessel" : "Add New Vessel"}
          </h1>
          <Link to="/vessels">
            <Button
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vessels
            </Button>
          </Link>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                    Vessel Name *
                  </Label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter vessel name"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">
                    Vessel Type
                  </Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select vessel type</option>
                    <option value="Oil Tanker">Oil Tanker</option>
                    <option value="LPG Carrier">LPG Carrier</option>
                    <option value="Chemical Tanker">Chemical Tanker</option>
                    <option value="Bulk Carrier">Bulk Carrier</option>
                    <option value="Container Ship">Container Ship</option>
                    <option value="General Cargo">General Cargo</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">
                    Current Location *
                  </Label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter current location"
                  />
                </div>

                <div>
                  <Label htmlFor="load" className="text-gray-700 dark:text-gray-300">
                    Load Type *
                  </Label>
                  <input
                    type="text"
                    id="load"
                    name="load"
                    value={formData.load}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter load type"
                  />
                </div>

                <div>
                  <Label htmlFor="capacity" className="text-gray-700 dark:text-gray-300">
                    Capacity (DWT) *
                  </Label>
                  <input
                    type="text"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter capacity"
                  />
                </div>

                <div>
                  <Label htmlFor="mmsi" className="text-gray-700 dark:text-gray-300">
                    MMSI Number
                  </Label>
                  <input
                    type="text"
                    id="mmsi"
                    name="mmsi"
                    value={formData.mmsi}
                    onChange={handleChange}
                    placeholder="9-digit vessel identifier"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    maxLength={9}
                    pattern="[0-9]{9}"
                    title="MMSI should be a 9-digit number"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maritime Mobile Service Identity - 9 digits
                  </p>
                </div>

                <div>
                  <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">
                    Status
                  </Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">In Maintenance</option>
                    <option value="docked">Docked</option>
                    <option value="transit">In Transit</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                  Description
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter vessel description"
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="specifications.length" className="text-gray-700 dark:text-gray-300">
                    Length (m)
                  </Label>
                  <input
                    type="number"
                    id="specifications.length"
                    name="specifications.length"
                    value={formData.specifications.length}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Length in meters"
                  />
                </div>

                <div>
                  <Label htmlFor="specifications.width" className="text-gray-700 dark:text-gray-300">
                    Width (m)
                  </Label>
                  <input
                    type="number"
                    id="specifications.width"
                    name="specifications.width"
                    value={formData.specifications.width}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Width in meters"
                  />
                </div>

                <div>
                  <Label htmlFor="specifications.draft" className="text-gray-700 dark:text-gray-300">
                    Draft (m)
                  </Label>
                  <input
                    type="number"
                    id="specifications.draft"
                    name="specifications.draft"
                    value={formData.specifications.draft}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Draft in meters"
                  />
                </div>

                <div>
                  <Label htmlFor="specifications.grossTonnage" className="text-gray-700 dark:text-gray-300">
                    Gross Tonnage
                  </Label>
                  <input
                    type="number"
                    id="specifications.grossTonnage"
                    name="specifications.grossTonnage"
                    value={formData.specifications.grossTonnage}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Gross tonnage"
                  />
                </div>

                <div>
                  <Label htmlFor="specifications.netTonnage" className="text-gray-700 dark:text-gray-300">
                    Net Tonnage
                  </Label>
                  <input
                    type="number"
                    id="specifications.netTonnage"
                    name="specifications.netTonnage"
                    value={formData.specifications.netTonnage}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Net tonnage"
                  />
                </div>

                <div>
                  <Label htmlFor="specifications.enginePower" className="text-gray-700 dark:text-gray-300">
                    Engine Power (HP)
                  </Label>
                  <input
                    type="number"
                    id="specifications.enginePower"
                    name="specifications.enginePower"
                    value={formData.specifications.enginePower}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Engine power in HP"
                  />
                </div>

                <div>
                  <Label htmlFor="specifications.maxSpeed" className="text-gray-700 dark:text-gray-300">
                    Max Speed (knots)
                  </Label>
                  <input
                    type="number"
                    id="specifications.maxSpeed"
                    name="specifications.maxSpeed"
                    value={formData.specifications.maxSpeed}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Maximum speed in knots"
                  />
                </div>

                <div>
                  <Label htmlFor="specifications.fuelCapacity" className="text-gray-700 dark:text-gray-300">
                    Fuel Capacity (tons)
                  </Label>
                  <input
                    type="number"
                    id="specifications.fuelCapacity"
                    name="specifications.fuelCapacity"
                    value={formData.specifications.fuelCapacity}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Fuel capacity in tons"
                  />
                </div>

                <div>
                  <Label htmlFor="specifications.crewCapacity" className="text-gray-700 dark:text-gray-300">
                    Crew Capacity
                  </Label>
                  <input
                    type="number"
                    id="specifications.crewCapacity"
                    name="specifications.crewCapacity"
                    value={formData.specifications.crewCapacity}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Maximum crew capacity"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Calculation Information */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Trip Calculation Information</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Required for trip cost calculations</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="doPrice" className="text-gray-700 dark:text-gray-300">
                    D.O Price ($)
                  </Label>
                  <input
                    id="doPrice"
                    name="doPrice"
                    type="number"
                    step="0.01"
                    value={formData.doPrice}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="doStandby" className="text-gray-700 dark:text-gray-300">
                    D.O Standby
                  </Label>
                  <input
                    id="doStandby"
                    name="doStandby"
                    type="number"
                    step="0.1"
                    value={formData.doStandby}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="doAtSea" className="text-gray-700 dark:text-gray-300">
                    D.O At Sea
                  </Label>
                  <input
                    id="doAtSea"
                    name="doAtSea"
                    type="number"
                    step="0.1"
                    value={formData.doAtSea}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="doDischarge" className="text-gray-700 dark:text-gray-300">
                    D.O Discharge
                  </Label>
                  <input
                    id="doDischarge"
                    name="doDischarge"
                    type="number"
                    step="0.1"
                    value={formData.doDischarge}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="doIdle" className="text-gray-700 dark:text-gray-300">
                    D.O Idle
                  </Label>
                  <input
                    id="doIdle"
                    name="doIdle"
                    type="number"
                    step="0.1"
                    value={formData.doIdle}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="loading" className="text-gray-700 dark:text-gray-300">
                    Loading
                  </Label>
                  <input
                    id="loading"
                    name="loading"
                    type="number"
                    step="0.1"
                    value={formData.loading}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="idle" className="text-gray-700 dark:text-gray-300">
                    Idle
                  </Label>
                  <input
                    id="idle"
                    name="idle"
                    type="number"
                    step="0.1"
                    value={formData.idle}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="hire" className="text-gray-700 dark:text-gray-300">
                    Hire ($)
                  </Label>
                  <input
                    id="hire"
                    name="hire"
                    type="number"
                    step="0.01"
                    value={formData.hire}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hirePerDay" className="text-gray-700 dark:text-gray-300">
                    Hire Per Day ($)
                  </Label>
                  <input
                    id="hirePerDay"
                    name="hirePerDay"
                    type="number"
                    step="0.01"
                    value={formData.hirePerDay}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="vesselCapacity" className="text-gray-700 dark:text-gray-300">
                    Vessel Capacity
                  </Label>
                  <input
                    id="vesselCapacity"
                    name="vesselCapacity"
                    value={formData.vesselCapacity}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 5000 MT"
                  />
                </div>
                <div>
                  <Label htmlFor="seaBallastWithCargoTemp" className="text-gray-700 dark:text-gray-300">
                    Sea Ballast with Cargo Temp
                  </Label>
                  <input
                    id="seaBallastWithCargoTemp"
                    name="seaBallastWithCargoTemp"
                    type="number"
                    step="0.1"
                    value={formData.seaBallastWithCargoTemp}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discharging" className="text-gray-700 dark:text-gray-300">
                    Discharging
                  </Label>
                  <input
                    id="discharging"
                    name="discharging"
                    type="number"
                    step="0.1"
                    value={formData.discharging}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vessel Image */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Vessel Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="mt-1 flex items-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Vessel preview"
                        className="h-40 w-auto object-cover rounded-md border border-gray-200 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : formData.image && !formData.image.includes("placeholder") ? (
                    <div className="relative">
                      <img
                        src={formData.image || "/placeholder.svg"}
                        alt="Vessel"
                        className="h-40 w-auto object-cover rounded-md border border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg"
                          e.target.onerror = null
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 w-full">
                      <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No image selected</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current.click()}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {imagePreview || (formData.image && !formData.image.includes("placeholder"))
                      ? "Change Image"
                      : "Upload Image"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#2e1a47] hover:bg-[#3d2456] dark:bg-[#4a2d5f] dark:hover:bg-[#5a3d6f]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update Vessel" : "Add Vessel"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/vessels")}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VesselForm
