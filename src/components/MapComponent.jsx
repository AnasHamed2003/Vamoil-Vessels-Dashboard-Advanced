import React, { useEffect, useRef, useCallback, useState } from 'react';
import { getVesselIcon, formatSpeed, formatCoordinates } from '../utils/aisApiService';

const MapComponent = ({ vessels, onVesselSelect, track, selectedVessel }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const trackPathRef = useRef(null);
  const infoWindowRef = useRef(null);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const [currentMapType, setCurrentMapType] = useState('hybrid');
  const [showPlaces, setShowPlaces] = useState(true);
  const placesMarkersRef = useRef([]);

  // Check if Google Maps is ready
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.Map) {
        setIsGoogleMapsReady(true);
      } else {
        // Retry after a short delay if not ready
        setTimeout(checkGoogleMaps, 100);
      }
    };
    checkGoogleMaps();
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  }, []);

  const clearPlacesMarkers = useCallback(() => {
    placesMarkersRef.current.forEach(marker => marker.setMap(null));
    placesMarkersRef.current = [];
  }, []);

  const clearTrack = useCallback(() => {
    if (trackPathRef.current) {
      trackPathRef.current.setMap(null);
      trackPathRef.current = null;
    }
  }, []);

  // Function to change map type
  const changeMapType = useCallback((mapType) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(mapType);
      setCurrentMapType(mapType);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (isGoogleMapsReady && mapRef.current && !mapInstanceRef.current) {
      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 25.276987, lng: 55.296249 },
          zoom: 6,
          mapTypeId: 'hybrid', // Changed from 'satellite' to 'hybrid' to show labels
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: window.google.maps.ControlPosition.TOP_RIGHT,
          },
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          scaleControl: true,
          // Enhanced styling to show more geographical details with better readability
          styles: [
            {
              featureType: "administrative.country",
              elementType: "labels",
              stylers: [
                { visibility: "on" },
                { color: "#000000" },
                { weight: 3 }
              ]
            },
            {
              featureType: "administrative.country",
              elementType: "labels.text.stroke",
              stylers: [
                { color: "#ffffff" },
                { weight: 3 }
              ]
            },
            {
              featureType: "administrative.province",
              elementType: "labels",
              stylers: [
                { visibility: "on" },
                { color: "#000000" }
              ]
            },
            {
              featureType: "administrative.province",
              elementType: "labels.text.stroke",
              stylers: [
                { color: "#ffffff" },
                { weight: 2 }
              ]
            },
            {
              featureType: "administrative.locality",
              elementType: "labels",
              stylers: [
                { visibility: "on" },
                { color: "#000000" }
              ]
            },
            {
              featureType: "administrative.locality",
              elementType: "labels.text.stroke",
              stylers: [
                { color: "#ffffff" },
                { weight: 2 }
              ]
            },
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [
                { visibility: "on" }
              ]
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [
                { color: "#000000" }
              ]
            },
            {
              featureType: "poi",
              elementType: "labels.text.stroke",
              stylers: [
                { color: "#ffffff" },
                { weight: 2 }
              ]
            },
            {
              featureType: "poi.airport",
              stylers: [
                { visibility: "on" }
              ]
            },
            {
              featureType: "poi.business",
              stylers: [
                { visibility: "simplified" }
              ]
            },
            {
              featureType: "poi.park",
              stylers: [
                { visibility: "on" }
              ]
            },
            {
              featureType: "road.highway",
              elementType: "labels",
              stylers: [
                { visibility: "on" }
              ]
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [
                { color: "#000000" }
              ]
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.stroke",
              stylers: [
                { color: "#ffffff" },
                { weight: 2 }
              ]
            },
            {
              featureType: "road.arterial",
              elementType: "labels",
              stylers: [
                { visibility: "simplified" }
              ]
            },
            {
              featureType: "road.arterial",
              elementType: "labels.text.fill",
              stylers: [
                { color: "#000000" }
              ]
            },
            {
              featureType: "road.arterial",
              elementType: "labels.text.stroke",
              stylers: [
                { color: "#ffffff" },
                { weight: 2 }
              ]
            },
            {
              featureType: "transit.station",
              stylers: [
                { visibility: "on" }
              ]
            },
            {
              featureType: "transit.station",
              elementType: "labels.text.fill",
              stylers: [
                { color: "#000000" }
              ]
            },
            {
              featureType: "transit.station",
              elementType: "labels.text.stroke",
              stylers: [
                { color: "#ffffff" },
                { weight: 2 }
              ]
            },
            {
              featureType: "water",
              elementType: "labels",
              stylers: [
                { visibility: "on" },
                { color: "#003366" }
              ]
            },
            {
              featureType: "water",
              elementType: "labels.text.stroke",
              stylers: [
                { color: "#ffffff" },
                { weight: 2 }
              ]
            }
          ]
        });
        mapInstanceRef.current = map;
        infoWindowRef.current = new window.google.maps.InfoWindow();

        // Add Places service for enhanced location information
        if (window.google.maps.places) {
          const placesService = new window.google.maps.places.PlacesService(map);
          
          // Search for nearby ports and maritime facilities when map is idle
          const searchNearbyPlaces = () => {
            if (!showPlaces) return;
            
            clearPlacesMarkers();
            
            const center = map.getCenter();
            const bounds = map.getBounds();
            
            if (center && bounds && map.getZoom() > 8) {
              const request = {
                bounds: bounds,
                type: ['establishment'],
                keyword: 'port OR harbor OR marina OR terminal OR shipping'
              };
              
              placesService.nearbySearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                  results.slice(0, 10).forEach((place) => {
                    if (place.geometry && place.geometry.location) {
                      const marker = new window.google.maps.Marker({
                        position: place.geometry.location,
                        map: map,
                        icon: {
                          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="10" cy="10" r="8" fill="#4CAF50" stroke="#ffffff" stroke-width="2"/>
                              <text x="10" y="14" text-anchor="middle" fill="white" font-size="10">⚓</text>
                            </svg>
                          `),
                          scaledSize: new window.google.maps.Size(20, 20),
                          anchor: new window.google.maps.Point(10, 10)
                        },
                        title: place.name,
                        zIndex: 1
                      });
                      
                      marker.addListener('click', () => {
                        const content = `
                          <div style="max-width: 250px; font-family: Arial, sans-serif;">
                            <h4 style="margin: 0 0 8px 0; color: #2e1a47;">⚓ ${place.name}</h4>
                            <p style="margin: 0; font-size: 12px; color: #666;">
                              ${place.vicinity || place.formatted_address || ''}
                            </p>
                            ${place.rating ? `<p style="margin: 5px 0 0 0; font-size: 12px;">Rating: ${place.rating}/5</p>` : ''}
                            <p style="margin: 5px 0 0 0; font-size: 10px; color: #999;">Maritime Facility</p>
                          </div>
                        `;
                        infoWindowRef.current.setContent(content);
                        infoWindowRef.current.open(map, marker);
                      });
                      
                      placesMarkersRef.current.push(marker);
                    }
                  });
                }
              });
            }
          };
          
          // Search for places when map becomes idle (after pan/zoom)
          map.addListener('idle', searchNearbyPlaces);
        }
      } catch (error) {
        console.error('Failed to initialize Google Maps:', error);
      }
    }
  }, [isGoogleMapsReady, showPlaces, clearPlacesMarkers]);

  // Update markers when vessels change
  useEffect(() => {
    if (!mapInstanceRef.current || !vessels) return;

    clearMarkers();
    const bounds = new window.google.maps.LatLngBounds();

    vessels.forEach(vessel => {
      // Only show vessels with valid coordinates
      const lat = Number(vessel.latitude);
      const lng = Number(vessel.longitude);
      
      if (lat && lng && lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng)) {
        const position = { lat, lng };
        console.log(`Adding vessel to map: ${vessel.name} (${vessel.mmsi}) at ${lat}, ${lng}`);
        
        const icon = {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: selectedVessel?.mmsi === vessel.mmsi ? '#4285F4' : '#FF4444',
          fillOpacity: 1.0,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 8,
          rotation: Number(vessel.heading) || 0,
        };

        const marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          icon,
          title: `${vessel.name} (${vessel.mmsi})`,
        });

        marker.addListener('click', () => {
          onVesselSelect(vessel);
        });
        
        markersRef.current.push(marker);
        bounds.extend(position);
      } else {
        console.log(`Vessel ${vessel.name} (${vessel.mmsi}) has invalid coordinates:`, { lat, lng });
      }
    });

    if (vessels.length > 0 && !selectedVessel) {
        mapInstanceRef.current.fitBounds(bounds);
        window.google.maps.event.addListenerOnce(mapInstanceRef.current, "idle", () => {
            if (mapInstanceRef.current.getZoom() > 15) {
            mapInstanceRef.current.setZoom(15);
            }
        });
    }
  }, [vessels, clearMarkers, onVesselSelect, selectedVessel]);

  // Update selected marker info window
  useEffect(() => {
    if (!mapInstanceRef.current || !infoWindowRef.current) return;

    const infoWindow = infoWindowRef.current;
    infoWindow.close();

    if (selectedVessel) {
        const marker = markersRef.current.find(m => m.title.includes(`(${selectedVessel.mmsi})`));
        if (marker) {
            const content = `
                <div style="max-width: 300px; font-family: Arial, sans-serif;">
                  <h3 style="margin: 0 0 10px 0; color: #2e1a47; font-size: 16px;">
                    ${getVesselIcon(selectedVessel.type)} ${selectedVessel.name}
                  </h3>
                  <div style="display: grid; gap: 5px; font-size: 12px;">
                    <div><strong>MMSI:</strong> ${selectedVessel.mmsi}</div>
                    <div><strong>Type:</strong> ${selectedVessel.type}</div>
                    <div><strong>Flag:</strong> ${selectedVessel.flag}</div>
                    <div><strong>Speed:</strong> ${formatSpeed(selectedVessel.speed)}</div>
                    <div><strong>Course:</strong> ${selectedVessel.course}°</div>
                    <div><strong>Destination:</strong> ${selectedVessel.destination}</div>
                    <div><strong>Position:</strong> ${formatCoordinates(selectedVessel.latitude, selectedVessel.longitude)}</div>
                  </div>
                </div>
              `;
            infoWindow.setContent(content);
            infoWindow.open(mapInstanceRef.current, marker);
            mapInstanceRef.current.panTo(marker.getPosition());
        }
    }
  }, [selectedVessel]);

  // Draw vessel track
  useEffect(() => {
    if (!mapInstanceRef.current || !track) return;

    clearTrack();

    const path = track.map(point => ({
      lat: Number(point.LAT || point.latitude),
      lng: Number(point.LON || point.longitude),
    })).filter(p => p.lat && p.lng);

    if (path.length > 0) {
      const polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });
      polyline.setMap(mapInstanceRef.current);
      trackPathRef.current = polyline;

      const bounds = new window.google.maps.LatLngBounds();
      path.forEach(p => bounds.extend(p));
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [track, clearTrack]);

  // Handle places visibility toggle
  useEffect(() => {
    if (!showPlaces) {
      clearPlacesMarkers();
    } else if (mapInstanceRef.current && window.google && window.google.maps.places) {
      // Trigger places search when toggled on
      window.google.maps.event.trigger(mapInstanceRef.current, 'idle');
    }
  }, [showPlaces, clearPlacesMarkers]);

  return (
    <div className="w-full h-full rounded-b-lg relative" style={{ minHeight: '500px' }}>
      {!isGoogleMapsReady ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-b-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading Google Maps...</p>
          </div>
        </div>
      ) : null}
      
      {/* Map Type Controls */}
      {isGoogleMapsReady && (
        <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => changeMapType('hybrid')}
              className={`px-3 py-1 text-xs rounded ${
                currentMapType === 'hybrid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Hybrid
            </button>
            <button
              onClick={() => changeMapType('satellite')}
              className={`px-3 py-1 text-xs rounded ${
                currentMapType === 'satellite'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => changeMapType('roadmap')}
              className={`px-3 py-1 text-xs rounded ${
                currentMapType === 'roadmap'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => changeMapType('terrain')}
              className={`px-3 py-1 text-xs rounded ${
                currentMapType === 'terrain'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Terrain
            </button>
            <hr className="border-gray-300 dark:border-gray-600" />
            <button
              onClick={() => setShowPlaces(!showPlaces)}
              className={`px-3 py-1 text-xs rounded ${
                showPlaces
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              ⚓ Places {showPlaces ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full rounded-b-lg" style={{ minHeight: '500px' }} />
    </div>
  );
};

export default MapComponent;
