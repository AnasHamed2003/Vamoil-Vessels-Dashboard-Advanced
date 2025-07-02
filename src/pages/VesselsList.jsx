"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { getAllVessels, deleteVessel } from "../utils/firebaseUtils"
import { Card, CardContent } from "../components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { useFirebase } from "../components/FirebaseProvider"

const VesselsList = () => {
  const [vessels, setVessels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { userRole } = useFirebase()
  const isAdmin = userRole === "admin"

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        setLoading(true)
        const vesselsList = await getAllVessels()
        setVessels(vesselsList)
        setError(null)
      } catch (error) {
        console.error("Error fetching vessels:", error)
        setError("Failed to load vessels. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchVessels()
  }, [])

  const handleDeleteVessel = async (vesselId, vesselName) => {
    if (!window.confirm(`Are you sure you want to delete ${vesselName}? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteVessel(vesselId)
      // Update the vessels list without a page refresh
      setVessels(vessels.filter((vessel) => vessel.id !== vesselId))
    } catch (error) {
      console.error("Error deleting vessel:", error)
      setError("Failed to delete vessel. Please try again.")
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Vessels</h1>
          {isAdmin && (
            <Link to="/vessels/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Vessel
              </Button>
            </Link>
          )}
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>}

        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">Loading vessels...</div>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            {vessels.length > 0 ? (
              vessels.map((vessel) => (
                <div key={vessel.id} className="p-4 border-b last:border-b-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-md overflow-hidden border flex-shrink-0">
                        <img
                          src={vessel.image || "/placeholder.svg"}
                          alt={vessel.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg"
                            e.target.onerror = null
                          }}
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{vessel.name}</h2>
                        <p className="text-sm text-gray-600">
                          Location: {vessel.location} · Load: {vessel.load} · Capacity: {vessel.capacity}
                          {vessel.mmsi && ` · MMSI: ${vessel.mmsi}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/vessels/${vessel.id}`}>
                        <Button>Details</Button>
                      </Link>
                      {isAdmin && (
                        <>
                          <Link to={`/vessels/edit/${vessel.id}`}>
                            <Button variant="outline">Edit</Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.preventDefault()
                              handleDeleteVessel(vessel.id, vessel.name)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500 mb-4">No vessels found</p>
                {isAdmin && (
                  <Link to="/vessels/add">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Your First Vessel
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VesselsList
