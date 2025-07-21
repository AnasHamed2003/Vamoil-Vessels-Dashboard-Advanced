// AIS API Service for vessel tracking
const AIS_API_BASE_URL = "/api/v2" // Using relative path to work with proxy
const API_KEY = "WhZHTlKGq9e^UN5yC$83R7vomxw!s4r!*0"
// const SECRET_KEY = "JUcJnp1FW" // Reserved for future use

// Helper function to make API requests with authentication
const makeAisRequest = async (endpoint, params = {}) => {
  try {
    const url = new URL(`${AIS_API_BASE_URL}${endpoint}`, window.location.origin)
    
    // Add all parameters to URL (no API key in params anymore)
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key])
      }
    })

    console.log("Making AIS API request to:", url.toString())
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'User-Agent': 'Vamoil-Dashboard/1.0'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("AIS API Error Response:", errorText)
      throw new Error(`AIS API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("AIS API Response:", data)
    console.log("AIS API Response type:", typeof data, "isArray:", Array.isArray(data))
    return data
  } catch (error) {
    console.error("Error making AIS API request:", error)
    throw error
  }
}

// Get vessel information by MMSI
export const getVesselByMMSI = async (mmsi, extended = true) => {
  try {
    if (!mmsi) {
      throw new Error("MMSI is required")
    }

    const params = { mmsi }
    if (extended) {
      params.response = "extended"
    }

    const data = await makeAisRequest("/vessel", params)
    return data
  } catch (error) {
    console.error("Error fetching vessel by MMSI:", error)
    throw error
  }
}

// Get vessel information by IMO
export const getVesselByIMO = async (imo) => {
  try {
    if (!imo) {
      throw new Error("IMO is required")
    }

    const data = await makeAisRequest("/vessels", { imo })
    return data
  } catch (error) {
    console.error("Error fetching vessel by IMO:", error)
    throw error
  }
}

// Search vessels by name
export const searchVesselsByName = async (name) => {
  try {
    if (!name || name.trim().length < 3) {
      throw new Error("Vessel name must be at least 3 characters")
    }

    const data = await makeAisRequest("/vessel/search", { name: name.trim() })
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data
    } else if (data && data.vessels && Array.isArray(data.vessels)) {
      return data.vessels
    } else if (data && data.data && Array.isArray(data.data)) {
      return data.data
    } else if (data && typeof data === 'object') {
      return [data] // Single vessel
    }
    
    return []
  } catch (error) {
    console.error("Error searching vessels by name:", error)
    throw error
  }
}

// Get vessels in a specific area (bounding box)
export const getVesselsInArea = async (minLat, minLon, maxLat, maxLon) => {
  try {
    const data = await makeAisRequest("/vessels", {
      minlat: minLat,
      minlon: minLon,
      maxlat: maxLat,
      maxlon: maxLon
    })
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data
    } else if (data && data.vessels && Array.isArray(data.vessels)) {
      return data.vessels
    } else if (data && data.data && Array.isArray(data.data)) {
      return data.data
    }
    
    return []
  } catch (error) {
    console.error("Error fetching vessels in area:", error)
    throw error
  }
}

// Get vessel positions/tracks
export const getVesselTrack = async (mmsi, period = "1day") => {
  try {
    if (!mmsi) {
      throw new Error("MMSI is required")
    }

    const data = await makeAisRequest("/vesseltrack", { 
      mmsi,
      period // Options: 1hour, 6hours, 1day, 3days, 1week
    })
    return data
  } catch (error) {
    console.error("Error fetching vessel track:", error)
    throw error
  }
}

// Get port information
export const getPortInfo = async (portId) => {
  try {
    if (!portId) {
      throw new Error("Port ID is required")
    }

    const data = await makeAisRequest("/ports", { id: portId })
    return data
  } catch (error) {
    console.error("Error fetching port info:", error)
    throw error
  }
}

// Get vessels in port
export const getVesselsInPort = async (portId) => {
  try {
    if (!portId) {
      throw new Error("Port ID is required")
    }

    const data = await makeAisRequest("/port", { id: portId })
    return data
  } catch (error) {
    console.error("Error fetching vessels in port:", error)
    throw error
  }
}

// Helper function to convert navigation status code to readable text
const getNavigationStatusText = (statusCode) => {
  const statusMap = {
    0: "Under way using engine",
    1: "At anchor",
    2: "Not under command",
    3: "Restricted manoeuvrability",
    4: "Constrained by her draught",
    5: "Moored",
    6: "Aground",
    7: "Engaged in fishing",
    8: "Under way sailing",
    9: "Reserved for future amendment",
    10: "Reserved for future amendment",
    11: "Reserved for future use",
    12: "Reserved for future use",
    13: "Reserved for future use",
    14: "AIS-SART is active",
    15: "Not defined (default)"
  };
  return statusMap[statusCode] || `Status ${statusCode}`;
};

// Helper function to convert vessel type code to readable text
const getVesselTypeText = (typeCode) => {
  const typeMap = {
    1: "Reserved",
    2: "Wing in ground",
    3: "Special category",
    4: "High speed craft",
    5: "Special category",
    6: "Passenger",
    7: "Cargo",
    8: "Tanker",
    9: "Other",
    10: "Reserved",
    // Add more mappings as needed
  };
  return typeMap[typeCode] || `Type ${typeCode}`;
};

// Helper function to format vessel data for display
export const formatVesselData = (vesselData) => {
  if (!vesselData) return null

  // Handle nested data structure - if data is wrapped in a 'data' property, use that
  const actualData = vesselData.data || vesselData;
  
  // Handle different possible latitude/longitude field names
  const lat = actualData.LAT || actualData.latitude || actualData.lat || actualData.LATITUDE || 0;
  const lng = actualData.LON || actualData.longitude || actualData.lng || actualData.lon || actualData.LONGITUDE || 0;

  // Handle vessel name variations
  const vesselName = actualData.NAME || actualData.name || actualData.vessel_name || actualData.VESSEL_NAME || "Unknown Vessel";
  
  // Handle type variations - convert numeric codes to readable text
  let vesselType = actualData.TYPE || actualData.type || actualData.VESSEL_TYPE || actualData.vtype || actualData.SHIP_TYPE || "Unknown";
  if (typeof vesselType === 'number') {
    vesselType = getVesselTypeText(vesselType);
  }
  
  // Handle status variations - convert numeric codes to readable text
  let vesselStatus = actualData.STATUS || actualData.status || actualData.NAV_STATUS || actualData.nav_status || actualData.NAVIGATION_STATUS || "Unknown";
  if (typeof vesselStatus === 'number') {
    vesselStatus = getNavigationStatusText(vesselStatus);
  }

  console.log("Formatting vessel data:", {
    name: vesselName,
    mmsi: actualData.MMSI || actualData.mmsi,
    type: vesselType,
    status: vesselStatus,
    originalLat: actualData.LAT || actualData.latitude || actualData.lat,
    originalLng: actualData.LON || actualData.longitude || actualData.lng,
    formattedLat: lat,
    formattedLng: lng,
    rawData: vesselData,
    actualData: actualData
  });

  return {
    mmsi: actualData.MMSI || actualData.mmsi || "Unknown",
    imo: actualData.IMO || actualData.imo || actualData.IMO_NUMBER || "Unknown",
    name: vesselName,
    callsign: actualData.CALLSIGN || actualData.callsign || actualData.CALL_SIGN || "Unknown",
    flag: actualData.FLAG || actualData.flag || actualData.FLAG_COUNTRY || "Unknown",
    type: vesselType,
    status: vesselStatus,
    course: actualData.COURSE || actualData.course || actualData.COG || actualData.COURSE_OVER_GROUND || 0,
    speed: actualData.SPEED || actualData.speed || actualData.SOG || actualData.SPEED_OVER_GROUND || 0,
    heading: actualData.HEADING || actualData.heading || actualData.HDG || actualData.TRUE_HEADING || 0,
    destination: actualData.DESTINATION || actualData.destination || actualData.DEST || "Unknown",
    eta: actualData.ETA || actualData.eta || actualData.ESTIMATED_TIME_OF_ARRIVAL || "Unknown",
    draught: actualData.DRAUGHT || actualData.draught || actualData.MAXIMUM_DRAUGHT || actualData.MAX_DRAUGHT || "Unknown",
    length: actualData.LENGTH || actualData.length || actualData.LENGTH_OVERALL || (actualData.DIM_A && actualData.DIM_B ? actualData.DIM_A + actualData.DIM_B : "Unknown"),
    width: actualData.WIDTH || actualData.width || actualData.BEAM || (actualData.DIM_C && actualData.DIM_D ? actualData.DIM_C + actualData.DIM_D : "Unknown"),
    latitude: Number(lat) || 0,
    longitude: Number(lng) || 0,
    timestamp: actualData.TIMESTAMP || actualData.timestamp || actualData.LAST_POS || actualData.received || actualData.LAST_POSITION_TIME || new Date().toISOString(),
    photo: actualData.PHOTO || actualData.photo || actualData.IMAGE || null
  }
}

// Helper function to determine vessel icon based on type
export const getVesselIcon = (vesselType) => {
  const type = String(vesselType).toLowerCase()
  
  if (type.includes("tanker") || type.includes("oil")) return "🛢️"
  if (type.includes("cargo") || type.includes("bulk")) return "📦"
  if (type.includes("container")) return "📦"
  if (type.includes("passenger") || type.includes("cruise")) return "🚢"
  if (type.includes("fishing")) return "🎣"
  if (type.includes("tug")) return "🚛"
  if (type.includes("pilot")) return "🚁"
  if (type.includes("military")) return "⚓"
  
  return "🚢" // Default ship icon
}

// Helper function to format speed
export const formatSpeed = (speed) => {
  const knots = Number(speed) || 0
  return `${knots.toFixed(1)} knots (${(knots * 1.852).toFixed(1)} km/h)`
}

// Helper function to format coordinates
export const formatCoordinates = (lat, lon) => {
  const latitude = Number(lat) || 0
  const longitude = Number(lon) || 0
  
  const latDir = latitude >= 0 ? 'N' : 'S'
  const lonDir = longitude >= 0 ? 'E' : 'W'
  
  return `${Math.abs(latitude).toFixed(4)}°${latDir}, ${Math.abs(longitude).toFixed(4)}°${lonDir}`
}

// Helper function to calculate distance between two points
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const d = R * c // Distance in kilometers
  return d
}

// Export all functions for external use
const aisApiService = {
  getVesselByMMSI,
  getVesselByIMO,
  searchVesselsByName,
  getVesselsInArea,
  getVesselTrack,
  getPortInfo,
  getVesselsInPort,
  formatVesselData,
  getVesselIcon,
  formatSpeed,
  formatCoordinates,
  calculateDistance
}

export default aisApiService
