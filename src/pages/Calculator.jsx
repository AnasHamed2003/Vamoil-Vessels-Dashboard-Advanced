"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"

const Calculator = () => {
  const [vesselType, setVesselType] = useState("")
  const [distance, setDistance] = useState("")
  const [cargo, setCargo] = useState("")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const handleCalculate = () => {
    // Reset error
    setError("")

    // Validate inputs
    if (!vesselType) {
      setError("Please select a vessel type")
      return
    }

    if (!distance || isNaN(distance) || Number(distance) <= 0) {
      setError("Please enter a valid distance")
      return
    }

    if (!cargo || isNaN(cargo) || Number(cargo) <= 0) {
      setError("Please enter a valid cargo weight")
      return
    }

    // This is a simplified calculation for demonstration
    const distanceNum = Number.parseFloat(distance)
    const cargoNum = Number.parseFloat(cargo)

    // Mock calculation based on vessel type
    let rate = 0
    switch (vesselType) {
      case "tanker":
        rate = 2.5
        break
      case "cargo":
        rate = 1.8
        break
      case "container":
        rate = 3.2
        break
      default:
        rate = 2.0
    }

    const calculatedResult = distanceNum * cargoNum * rate
    setResult(calculatedResult)
  }

  const handleReset = () => {
    setVesselType("")
    setDistance("")
    setCargo("")
    setResult(null)
    setError("")
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <h1 className="text-2xl font-bold mb-6">Cost Calculator</h1>

        <Card>
          <CardHeader>
            <CardTitle>Calculate Shipping Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>}

              <div className="grid gap-2">
                <label htmlFor="vessel-type" className="text-sm font-medium">
                  Vessel Type
                </label>
                <select
                  id="vessel-type"
                  value={vesselType}
                  onChange={(e) => setVesselType(e.target.value)}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">Select vessel type</option>
                  <option value="tanker">Tanker</option>
                  <option value="cargo">Cargo</option>
                  <option value="container">Container</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="distance" className="text-sm font-medium">
                  Distance (nautical miles)
                </label>
                <input
                  id="distance"
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="Enter distance"
                  className="rounded-md border px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="cargo" className="text-sm font-medium">
                  Cargo Weight (metric tons)
                </label>
                <input
                  id="cargo"
                  type="number"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Enter cargo weight"
                  className="rounded-md border px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleCalculate}>Calculate</Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>

              {result !== null && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                  <p className="font-semibold">Estimated Cost:</p>
                  <p className="text-2xl font-bold">${result.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Based on {vesselType} vessel, {distance} nautical miles, and {cargo} metric tons.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Calculator
