"use client"

import { useState } from "react"

const SimpleChart = ({ data, width = 800, height = 300 }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null)

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md border">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No data available</p>
          <p className="text-sm text-gray-400">Add some trip reports to see charts</p>
        </div>
      </div>
    )
  }

  // Filter out months with no data for cleaner visualization
  const filteredData = data.filter((item) => item.price > 0)

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md border">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No activity data</p>
          <p className="text-sm text-gray-400">Complete some trips to see trends</p>
        </div>
      </div>
    )
  }

  // Calculate chart dimensions
  const padding = 60
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Find min and max values
  const prices = filteredData.map((d) => d.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  // Add some padding to the range for better visualization
  const paddedMin = Math.max(0, minPrice - priceRange * 0.1)
  const paddedMax = maxPrice + priceRange * 0.1
  const paddedRange = paddedMax - paddedMin

  // Create SVG path for the line
  const createPath = () => {
    return filteredData
      .map((point, index) => {
        const x = padding + (index / (filteredData.length - 1)) * chartWidth
        const y = padding + ((paddedMax - point.price) / paddedRange) * chartHeight
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  // Create area path for gradient fill
  const createAreaPath = () => {
    const linePath = filteredData
      .map((point, index) => {
        const x = padding + (index / (filteredData.length - 1)) * chartWidth
        const y = padding + ((paddedMax - point.price) / paddedRange) * chartHeight
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")

    const firstX = padding
    const lastX = padding + (filteredData.length > 1 ? chartWidth : 0)
    const bottomY = height - padding

    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`
  }

  // Create points for hover interaction
  const createPoints = () => {
    return filteredData.map((point, index) => {
      const x = padding + (index / (filteredData.length - 1)) * chartWidth
      const y = padding + ((paddedMax - point.price) / paddedRange) * chartHeight
      return { x, y, ...point, index }
    })
  }

  const points = createPoints()

  // Create Y-axis labels
  const yAxisLabels = []
  const labelCount = 5
  for (let i = 0; i <= labelCount; i++) {
    const value = paddedMin + (paddedRange * i) / labelCount
    const y = padding + chartHeight - (i / labelCount) * chartHeight
    yAxisLabels.push({ value: Math.round(value), y })
  }

  return (
    <div className="relative">
      <svg width={width} height={height} className="border rounded-md bg-white">
        {/* Define gradient */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2e1a47" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2e1a47" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yAxisLabels.map((label, index) => (
          <line
            key={index}
            x1={padding}
            y1={label.y}
            x2={width - padding}
            y2={label.y}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        ))}

        {/* Y-axis */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2" />

        {/* X-axis */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#374151"
          strokeWidth="2"
        />

        {/* Y-axis labels */}
        {yAxisLabels.map((label, index) => (
          <text key={index} x={padding - 10} y={label.y + 4} textAnchor="end" fontSize="12" fill="#6b7280">
            {label.value}
          </text>
        ))}

        {/* X-axis labels */}
        {points.map((point, index) => (
          <text key={index} x={point.x} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#6b7280">
            {point.period}
          </text>
        ))}

        {/* Area fill */}
        {filteredData.length > 1 && <path d={createAreaPath()} fill="url(#areaGradient)" />}

        {/* Chart line */}
        {filteredData.length > 1 && <path d={createPath()} fill="none" stroke="#2e1a47" strokeWidth="3" />}

        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={hoveredPoint === index ? 6 : 4}
            fill="#2e1a47"
            stroke="white"
            strokeWidth="2"
            className="cursor-pointer transition-all duration-200"
            onMouseEnter={() => setHoveredPoint(index)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}

        {/* Chart title */}
        <text x={width / 2} y={25} textAnchor="middle" fontSize="14" fill="#374151" fontWeight="600">
          Database Records by Month
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredPoint !== null && (
        <div
          className="absolute bg-gray-900 text-white px-4 py-3 rounded-lg text-sm pointer-events-none z-10 shadow-lg"
          style={{
            left: Math.min(points[hoveredPoint].x - 50, width - 120),
            top: Math.max(points[hoveredPoint].y - 80, 10),
          }}
        >
          <div className="font-semibold text-center mb-1">{points[hoveredPoint].period}</div>
          <div className="text-center">
            <span className="text-blue-300">Value: </span>
            <span className="font-bold">{points[hoveredPoint].price}</span>
          </div>
          <div className="text-xs text-gray-300 text-center mt-1">From database</div>
        </div>
      )}
    </div>
  )
}

export default SimpleChart
