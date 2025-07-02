"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { getVesselById, deleteVessel } from "../utils/firebaseUtils"
import { useFirebase } from "../components/FirebaseProvider"
import { ArrowLeft, Edit, Trash2, ExternalLink, AlertCircle, Calendar, User, Clock } from "lucide-react"

const VesselDetails = () => {
  const { id } = useParams()
  const [vessel, setVessel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { userRole } = useFirebase()
  const isAdmin = userRole === "admin"
  const navigate = useNavigate()

  useEffect(() => {
    const fetchVessel = async () => {
      try {
        setLoading(true)
        const vesselData = await getVesselById(id)
        if (vesselData) {
          setVessel(vesselData)
          setError(null)
        } else {
          setError("Vessel not found")
          setVessel(null)
        }
      } catch (error) {
        console.error("Error fetching vessel:", error)
        setError("Failed to load vessel details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchVessel()
  }, [id])

  const handleDeleteVessel = async () => {
    if (!window.confirm("Are you sure you want to delete this vessel? This action cannot be undone.")) {
      return
    }

    try {
      await deleteVessel(id)
      navigate("/vessels")
    } catch (error) {
      console.error("Error deleting vessel:", error)
      alert("Failed to delete vessel. Please try again.")
    }
  }

  const handleTrackVessel = () => {
    if (!vessel.mmsi) return

    // Open Marine Traffic in a new tab with the vessel's MMSI
    const trackingUrl = `https://www.marinetraffic.com/en/ais/details/ships/mmsi:${vessel.mmsi}/`
    window.open(trackingUrl, "_blank")
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not available"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto max-w-6xl w-full text-center">Loading vessel details...</div>
      </div>
    )
  }

  if (error || !vessel) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto max-w-6xl w-full">
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-md text-center">
            {error || "Vessel not found"}
          </div>
          <div className="mt-4 text-center">
            <Link to="/vessels">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vessels
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{vessel.name}</h1>
          <div className="flex gap-2">
            <Link to="/vessels">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </Link>
            {isAdmin && (
              <>
                <Link to={`/vessels/edit/${id}`}>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </Link>
                <Button variant="outline" className="text-red-500 bg-transparent" onClick={handleDeleteVessel}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Vessel Creation Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Vessel Record Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-blue-700">
              <Clock className="mr-2 h-4 w-4" />
              <span className="font-medium">Created:</span>
              <span className="ml-2">{formatDateTime(vessel.createdAt)}</span>
            </div>
            <div className="flex items-center text-blue-700">
              <User className="mr-2 h-4 w-4" />
              <span className="font-medium">Created by:</span>
              <span className="ml-2">{vessel.createdBy || "Unknown User"}</span>
            </div>
            {vessel.updatedAt && vessel.updatedAt !== vessel.createdAt && (
              <>
                <div className="flex items-center text-blue-700">
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-2">{formatDateTime(vessel.updatedAt)}</span>
                </div>
                <div className="flex items-center text-blue-700">
                  <User className="mr-2 h-4 w-4" />
                  <span className="font-medium">Updated by:</span>
                  <span className="ml-2">{vessel.updatedBy || "Unknown User"}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Location:</h2>
                <p>{vessel.location}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Load:</h2>
                <p>{vessel.load}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Capacity:</h2>
                <p>{vessel.capacity}</p>
              </div>

              {vessel.vesselType && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Vessel Type:</h2>
                  <p>{vessel.vesselType}</p>
                </div>
              )}

              {vessel.mmsi && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">MMSI Number:</h2>
                  <p>{vessel.mmsi}</p>
                </div>
              )}

              {vessel.status && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Status:</h2>
                  <p>{vessel.status}</p>
                </div>
              )}

              {vessel.mmsi ? (
                <Button className="mt-4" onClick={handleTrackVessel}>
                  <ExternalLink className="mr-2 h-4 w-4" /> Track on Marine Traffic
                </Button>
              ) : (
                <div className="mt-4 flex items-center text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">MMSI number required for vessel tracking</span>
                </div>
              )}
            </div>

            <div>
              <div className="rounded-md overflow-hidden border">
                <img
                  src={vessel.image || "/placeholder.svg"}
                  alt={`${vessel.name} vessel`}
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: "400px" }}
                  onError={(e) => {
                    e.target.src = "/placeholder.svg"
                    e.target.onerror = null
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VesselDetails
