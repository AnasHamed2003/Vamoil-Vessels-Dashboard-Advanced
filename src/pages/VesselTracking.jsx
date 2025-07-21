"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  getVesselByMMSI,
  searchVesselsByName,
  getVesselsInArea,
  getVesselTrack,
  formatVesselData,
} from "../utils/aisApiService"
import { Navigation, RefreshCw, Activity } from "lucide-react"
import { Button } from "../components/ui/button"
import MapComponent from '../components/MapComponent';
import SearchPanel from '../components/SearchPanel';
import VesselDetails from '../components/VesselDetails';

const VesselTracking = () => {
  const [searchType, setSearchType] = useState("name")
  const [searchValue, setSearchValue] = useState("")
  const [vessels, setVessels] = useState([])
  const [selectedVessel, setSelectedVessel] = useState(null)
  const [vesselTrack, setVesselTrack] = useState(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsScriptLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.onload = () => setIsScriptLoaded(true);
      return;
    }

    // Load the script
    const script = document.createElement("script");
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError("Google Maps API key is not configured. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file.");
      return;
    }
    
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&language=en&region=US&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => setError("Failed to load Google Maps. Please check your internet connection or API key.");
    document.head.appendChild(script);

    // Cleanup function - but don't remove the script as it might be used elsewhere
    return () => {
      // We don't remove the script on unmount as Google Maps should be available globally
    };
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchValue.trim()) {
      setError("Please enter a search value");
      return;
    }

    setLoading(true);
    setError(null);
    setVessels([]);
    setSelectedVessel(null);
    setVesselTrack(null);

    try {
      let results = [];
      if (searchType === "name") {
        // First get search results (which may only have basic info)
        const searchResults = await searchVesselsByName(searchValue.trim());
        console.log("Search results:", searchResults);
        
        // Then fetch detailed information for each vessel using MMSI
        if (searchResults && searchResults.length > 0) {
          const detailedResults = await Promise.all(
            searchResults.slice(0, 5).map(async (vessel) => { // Limit to 5 vessels to avoid too many requests
              try {
                const mmsi = vessel.MMSI || vessel.mmsi;
                if (mmsi) {
                  console.log(`Fetching detailed info for MMSI: ${mmsi}`);
                  const detailedVessel = await getVesselByMMSI(mmsi.toString());
                  return detailedVessel || vessel; // Fall back to search result if detailed fetch fails
                }
                return vessel;
              } catch (error) {
                console.warn(`Failed to fetch details for vessel ${vessel.MMSI || vessel.mmsi}:`, error);
                return vessel; // Return original search result if detailed fetch fails
              }
            })
          );
          results = detailedResults.filter(vessel => vessel !== null);
        }
      } else if (searchType === "mmsi") {
        const result = await getVesselByMMSI(searchValue.trim());
        results = result ? [result] : [];
      } else if (searchType === "area") {
        const coords = searchValue.split(",").map(c => Number(c.trim()));
        if (coords.length === 4 && coords.every(c => !isNaN(c))) {
          results = await getVesselsInArea(coords[0], coords[1], coords[2], coords[3]);
        } else {
          throw new Error("Invalid coordinate format. Use: lat1,lon1,lat2,lon2");
        }
      }
      
      // Ensure results is always an array
      if (!Array.isArray(results)) {
        console.log("API Response is not an array:", results);
        // If it's an object with data property, use that
        if (results && results.data && Array.isArray(results.data)) {
          results = results.data;
        }
        // If it's an object with vessels property, use that
        else if (results && results.vessels && Array.isArray(results.vessels)) {
          results = results.vessels;
        }
        // If it's a single object, wrap it in an array
        else if (results && typeof results === 'object') {
          results = [results];
        }
        // Otherwise, default to empty array
        else {
          results = [];
        }
      }
      
      const formattedResults = results.map(formatVesselData);
      setVessels(formattedResults);

      if (formattedResults.length === 0) {
        setError("No vessels found.");
      }
    } catch (err) {
      setError(err.message || "Failed to search for vessels.");
    } finally {
      setLoading(false);
    }
  }, [searchValue, searchType]);

  const handleGetTrack = useCallback(async (vessel) => {
    setLoading(true);
    setVesselTrack(null);
    try {
      const track = await getVesselTrack(vessel.mmsi, "1day");
      if (track && track.length > 0) {
        setVesselTrack(track);
      } else {
        setError("No track data available for this vessel.");
      }
    } catch (err) {
      setError("Failed to load vessel track.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshVesselData = useCallback(async () => {
    if (vessels.length === 0) return;
    setLoading(true);
    try {
      const refreshedVessels = await Promise.all(
        vessels.map(v => getVesselByMMSI(v.mmsi).catch(() => v))
      );
      setVessels(refreshedVessels.map(formatVesselData));
    } catch (err) {
      setError("Failed to refresh vessel data.");
    } finally {
      setLoading(false);
    }
  }, [vessels]);

  useEffect(() => {
    let interval;
    if (autoRefresh && vessels.length > 0) {
      interval = setInterval(refreshVesselData, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, vessels, refreshVesselData]);

  const handleVesselSelect = useCallback((vessel) => {
    setSelectedVessel(vessel);
    setVesselTrack(null); // Clear previous track
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Left Panel */}
      <div className="w-full lg:w-1/3 xl:w-1/4 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Navigation className="h-6 w-6 text-blue-500" />
            Vessel Tracking
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <SearchPanel
          searchType={searchType}
          setSearchType={setSearchType}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          handleSearch={handleSearch}
          loading={loading}
          vessels={vessels}
          selectedVessel={selectedVessel}
          onVesselSelect={handleVesselSelect}
        />

        <VesselDetails
          vessel={selectedVessel}
          onGetTrack={handleGetTrack}
          loading={loading}
        />
      </div>

      {/* Right Panel (Map) */}
      <div className="w-full lg:w-2/3 xl:w-3/4 relative">
        {isScriptLoaded ? (
          <MapComponent 
            vessels={vessels}
            selectedVessel={selectedVessel}
            onVesselSelect={handleVesselSelect}
            track={vesselTrack}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            onClick={refreshVesselData}
            disabled={loading || vessels.length === 0}
            className="bg-white dark:bg-gray-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="bg-white dark:bg-gray-800"
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VesselTracking;
