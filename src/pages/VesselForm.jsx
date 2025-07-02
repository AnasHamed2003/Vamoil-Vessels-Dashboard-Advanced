"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { createVesselWithImage, getVesselById, updateVesselWithImage } from "../utils/firebaseUtils"
import { ArrowLeft, Upload, X, ImageIcon } from "lucide-react"
import { useFirebase } from "../components/FirebaseProvider"

const VesselForm = () => {
  const { id } = useParams()
  const isEditMode = !!id
  const navigate = useNavigate()
  const { userRole } = useFirebase()
  const [loading, setLoading] = useState(isEditMode)
  const [error, setError] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    load: "",
    capacity: "",
    status: "active",
    image: "/placeholder.svg",
    imagePath: "",
    mmsi: "",
    // Trip calculation fields
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

  useEffect(() => {
    const fetchVessel = async () => {
      if (!isEditMode) return

      try {
        const vesselData = await getVesselById(id)
        if (vesselData) {
          setFormData({
            name: vesselData.name || "",
            location: vesselData.location || "",
            load: vesselData.load || "",
            capacity: vesselData.capacity || "",
            status: vesselData.status || "active",
            image: vesselData.image || "/placeholder.svg",
            imagePath: vesselData.imagePath || "",
            mmsi: vesselData.mmsi || "",
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
          setError("Vessel not found")
        }
      } catch (error) {
        console.error("Error fetching vessel:", error)
        setError("Failed to load vessel data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchVessel()
  }, [id, isEditMode])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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

    try {
      if (isEditMode) {
        await updateVesselWithImage(id, formData, imageFile, formData.imagePath)
      } else {
        await createVesselWithImage(formData, imageFile)
      }
      navigate("/vessels")
    } catch (error) {
      console.error("Error saving vessel:", error)
      setError(`Failed to ${isEditMode ? "update" : "create"} vessel. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEditMode) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto max-w-6xl w-full text-center">Loading vessel data...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{isEditMode ? "Edit Vessel" : "Add New Vessel"}</h1>
          <Link to="/vessels">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vessels
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Vessel Name*
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">
                    Current Location*
                  </label>
                  <input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="load" className="block text-sm font-medium mb-1">
                    Load Type*
                  </label>
                  <input
                    id="load"
                    name="load"
                    value={formData.load}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium mb-1">
                    Capacity*
                  </label>
                  <input
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mmsi" className="block text-sm font-medium mb-1">
                    MMSI Number
                  </label>
                  <input
                    id="mmsi"
                    name="mmsi"
                    value={formData.mmsi}
                    onChange={handleChange}
                    placeholder="9-digit vessel identifier"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    maxLength={9}
                    pattern="[0-9]{9}"
                    title="MMSI should be a 9-digit number"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maritime Mobile Service Identity - 9 digits</p>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">In Maintenance</option>
                    <option value="docked">Docked</option>
                    <option value="transit">In Transit</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Calculation Information */}
          <Card>
            <CardHeader>
              <CardTitle>Trip Calculation Information</CardTitle>
              <p className="text-sm text-gray-600">Required for trip cost calculations</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="doPrice" className="block text-sm font-medium mb-1">
                    D.O Price ($)
                  </label>
                  <input
                    id="doPrice"
                    name="doPrice"
                    type="number"
                    step="0.01"
                    value={formData.doPrice}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="doStandby" className="block text-sm font-medium mb-1">
                    D.O Standby
                  </label>
                  <input
                    id="doStandby"
                    name="doStandby"
                    type="number"
                    step="0.1"
                    value={formData.doStandby}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label htmlFor="doAtSea" className="block text-sm font-medium mb-1">
                    D.O At Sea
                  </label>
                  <input
                    id="doAtSea"
                    name="doAtSea"
                    type="number"
                    step="0.1"
                    value={formData.doAtSea}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label htmlFor="doDischarge" className="block text-sm font-medium mb-1">
                    D.O Discharge
                  </label>
                  <input
                    id="doDischarge"
                    name="doDischarge"
                    type="number"
                    step="0.1"
                    value={formData.doDischarge}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="doIdle" className="block text-sm font-medium mb-1">
                    D.O Idle
                  </label>
                  <input
                    id="doIdle"
                    name="doIdle"
                    type="number"
                    step="0.1"
                    value={formData.doIdle}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label htmlFor="loading" className="block text-sm font-medium mb-1">
                    Loading
                  </label>
                  <input
                    id="loading"
                    name="loading"
                    type="number"
                    step="0.1"
                    value={formData.loading}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label htmlFor="idle" className="block text-sm font-medium mb-1">
                    Idle
                  </label>
                  <input
                    id="idle"
                    name="idle"
                    type="number"
                    step="0.1"
                    value={formData.idle}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label htmlFor="hire" className="block text-sm font-medium mb-1">
                    Hire ($)
                  </label>
                  <input
                    id="hire"
                    name="hire"
                    type="number"
                    step="0.01"
                    value={formData.hire}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="hirePerDay" className="block text-sm font-medium mb-1">
                    Hire Per Day ($)
                  </label>
                  <input
                    id="hirePerDay"
                    name="hirePerDay"
                    type="number"
                    step="0.01"
                    value={formData.hirePerDay}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="vesselCapacity" className="block text-sm font-medium mb-1">
                    Vessel Capacity
                  </label>
                  <input
                    id="vesselCapacity"
                    name="vesselCapacity"
                    value={formData.vesselCapacity}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g., 5000 MT"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="seaBallastWithCargoTemp" className="block text-sm font-medium mb-1">
                    Sea Ballast with Cargo Temp
                  </label>
                  <input
                    id="seaBallastWithCargoTemp"
                    name="seaBallastWithCargoTemp"
                    type="number"
                    step="0.1"
                    value={formData.seaBallastWithCargoTemp}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label htmlFor="discharging" className="block text-sm font-medium mb-1">
                    Discharging
                  </label>
                  <input
                    id="discharging"
                    name="discharging"
                    type="number"
                    step="0.1"
                    value={formData.discharging}
                    onChange={handleChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vessel Image */}
          <Card>
            <CardHeader>
              <CardTitle>Vessel Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="mt-1 flex items-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Vessel preview"
                        className="h-40 w-auto object-cover rounded-md border"
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
                        className="h-40 w-auto object-cover rounded-md border"
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
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 w-full">
                      <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No image selected</p>
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
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current.click()}>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditMode ? "Update Vessel" : "Add Vessel"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/vessels")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VesselForm
