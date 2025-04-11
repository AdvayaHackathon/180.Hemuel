'use client';

import type React from "react";

import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ChevronRight, Telescope, History, MapPin, Map, Settings, Landmark, AlertTriangle, Target } from "lucide-react";
import { Instagram, TentTree } from 'lucide-react';
import Link from "next/link";
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';


// Dynamically import the MapComponent with ssr disabled
const MapComponent = dynamic(
  () => import('./MapComponent').then(mod => mod.default), 
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full">Loading map...</div>
  }
);

interface Location {
  id: string;
  name: string;
  timestamp: string;
  coords: [number, number];
}

interface Monument {
  id: string;
  name: string;
  coords: [number, number];
  icon: string; // To store the icon type
}

// Minimum distance in meters to consider a location change significant
const SIGNIFICANT_DISTANCE = 20; // 20 meters
// Proximity distance for monument alerts (1km = 1000m)
const MONUMENT_PROXIMITY = 1000; // 1km
// Display monuments within 5km radius
const MONUMENT_DISPLAY_RADIUS = 5000; // 5km

// Hardcoded monuments
const HARDCODED_MONUMENTS: Monument[] = [
  {
    id: "monument-1",
    name: "Monument One",
    coords: [13.014281, 77.544687],
    icon: "landmark"
  },
  {
    id: "monument-2",
    name: "Monument Two",
    coords: [13.004252, 77.544677],
    icon: "museum"
  }
];

const Page = () => {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visitedLocations, setVisitedLocations] = useState<Location[]>([]);
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [isCircularMap, setIsCircularMap] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<{id: string, message: string}[]>([]);
  const [checkedMonuments, setCheckedMonuments] = useState<Set<string>>(new Set());
  const [nearbyMonuments, setNearbyMonuments] = useState<Monument[]>([]);
  const [autoCenterMap, setAutoCenterMap] = useState<boolean>(false);
  const [triggerMapCenter, setTriggerMapCenter] = useState<number>(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate distance between two coordinates in meters (Haversine formula)
  const calculateDistance = (
    lat1: number, lon1: number, 
    lat2: number, lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };



  // Find nearby monuments within specified radius
  const findNearbyMonuments = (coords: [number, number]) => {
    if (!coords) return [];
    
    const nearby = HARDCODED_MONUMENTS.filter(monument => {
      const distance = calculateDistance(
        coords[0], coords[1],
        monument.coords[0], monument.coords[1]
      );
      
      return distance <= MONUMENT_DISPLAY_RADIUS;
    }).map(monument => {
      // Calculate distance for each nearby monument
      const distance = calculateDistance(
        coords[0], coords[1],
        monument.coords[0], monument.coords[1]
      );
      
      // Return monument with distance
      return {
        ...monument,
        distance: distance
      };
    });
    
    // Sort by distance
    return nearby.sort((a, b) => a.distance - b.distance);
  };

  // Check proximity to monuments and create alerts
  // Updated checkMonumentProximity function with auto-dismissing alerts
const checkMonumentProximity = (coords: [number, number]) => {
    if (!coords) return;
    
    HARDCODED_MONUMENTS.forEach(monument => {
      const distance = calculateDistance(
        coords[0], coords[1],
        monument.coords[0], monument.coords[1]
      );
      
      // Only alert if within proximity and not already alerted
      if (distance <= MONUMENT_PROXIMITY && !checkedMonuments.has(monument.id)) {
        const alertId = Date.now().toString();
        const newAlert = {
          id: alertId,
          message: `You are within 1km of "${monument.name}"! (${distance.toFixed(0)}m away)`
        };
        
        setAlerts(prev => [newAlert, ...prev]);
        
        // Add to checked monuments to prevent duplicate alerts
        setCheckedMonuments(prev => new Set(prev).add(monument.id));
        
        // Auto-dismiss this alert after 5 seconds
        setTimeout(() => {
          dismissAlert(alertId);
        }, 5000);
      } else if (distance > MONUMENT_PROXIMITY) {
        // Reset checked status when user leaves the proximity
        setCheckedMonuments(prev => {
          const newSet = new Set(prev);
          newSet.delete(monument.id);
          return newSet;
        });
      }
    });
  };
 

  // Function to dismiss an alert
  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Function to update current location
  const updateCurrentLocation = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setLocation(newCoords);
          
          // Update nearby monuments when location changes
          const nearby = findNearbyMonuments(newCoords);
          setNearbyMonuments(nearby);
          
          if (isTracking) {
            checkMonumentProximity(newCoords);
          }
        },
        (err) => {
          setError(`Error getting location: ${err.message}`);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // Function to center the map on current location
  const centerMapOnLocation = () => {
    setTriggerMapCenter(prev => prev + 1);
  };

  // Function to toggle auto-centering
  const toggleAutoCenter = () => {
    setAutoCenterMap(!autoCenterMap);
  };

  // Function to toggle tracking on/off
  const toggleTracking = () => {
    if (isTracking) {
      // Stop tracking
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsTracking(false);
    } else {
      // Resume tracking
      updateCurrentLocation();
      intervalRef.current = setInterval(() => {
        updateCurrentLocation();
      }, 10000);
      setIsTracking(true);
    }
  };

  // Function to toggle map view (circular/full)
  const toggleMapView = () => {
    setIsCircularMap(!isCircularMap);
  };

  // Initial location setup and interval setup
  useEffect(() => {
    // Get initial location
    updateCurrentLocation();
    
    // Set up interval to update location every 10 seconds
    intervalRef.current = setInterval(() => {
      updateCurrentLocation();
    }, 10000); // 10 seconds
    
    // Clean up interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Effect to check monument proximity when location changes
  useEffect(() => {
    if (location) {
      checkMonumentProximity(location);
    }
  }, [location]);

  const clearHistory = () => {
    setVisitedLocations([]);
  };

  const refreshMap = () => {
    updateCurrentLocation();
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 rounded-full bg-primary/10">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-space font-bold">Location Tracker</h1>
              <p className="text-muted-foreground">
                Track your location and view your movement history
              </p>
            </div>
          </div>
          
          {/* Alert Messages */}
          {alerts.length > 0 && (
            <div className="mb-4 space-y-2">
              {alerts.map(alert => (
                <motion.div 
                  key={alert.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md"
                >
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <p>{alert.message}</p>
                  </div>
                  <button 
                    onClick={() => dismissAlert(alert.id)}
                    className="text-amber-700 hover:text-amber-900"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-6 mt-8">
            {/* New Section: Monuments Within 50m */}
<div className="w-full lg:w-1/4 bg-card rounded-lg shadow-sm overflow-hidden mt-4">
  <div className="bg-muted/50 p-4 border-b border-border flex items-center">
    <Landmark className="w-5 h-5 mr-2 text-primary" />
    <h2 className="text-lg font-semibold">Know More About Monuments NearBy</h2>
  </div>

  <div className="p-4">
    {location ? (
      <>
        {(() => {
          // Find monuments less than 50m away
          const veryCloseMonuments = HARDCODED_MONUMENTS.filter(monument => {
            if (!location) return false;
            const distance = calculateDistance(
              location[0], location[1],
              monument.coords[0], monument.coords[1]
            );
            return distance < 50;
          });

          if (veryCloseMonuments.length > 0) {
            return (
              <ul className="space-y-3">
                {veryCloseMonuments.map(monument => (
                  <motion.li 
                    key={monument.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card p-3 rounded-md border border-border hover:border-primary/20 hover:bg-primary/5 transition-colors"
                  >
                    <div className="font-medium">{monument.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const distance = calculateDistance(
                          location[0], location[1],
                          monument.coords[0], monument.coords[1]
                        );
                        return `${distance.toFixed(1)}m away`;
                      })()}
                    </div>
                    <Link href={`/Explore/NewExplore/Knowmore?name=${encodeURIComponent(monument.name)}`}>
                      <button className="mt-2 w-full text-sm bg-primary/10 text-primary hover:bg-primary/20 py-1 px-3 rounded flex items-center justify-center">
                        <span>Learn More</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            );
          } else {
            return (
              <div className="bg-muted/30 p-6 rounded-md text-center">
                <p className="text-muted-foreground">No monuments within 50m.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Get closer to interesting locations to learn more!
                </p>
              </div>
            );
          }
        })()}
      </>
    ) : (
      <div className="bg-muted/30 p-6 rounded-md text-center">
        <p className="text-muted-foreground">Waiting for your location...</p>
      </div>
    )}
  </div>
</div>

            {/* Middle Column: Map (Circular or Full) */}
            <div className="w-full lg:w-2/4 flex flex-col items-center justify-center p-4">
              {/* Map Controls */}
              <div className="flex justify-center mb-3 space-x-3">
                <button
                  onClick={centerMapOnLocation}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-1.5 rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  Center On Me
                </button>
                <button 
                  onClick={toggleAutoCenter}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-colors ${autoCenterMap ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {autoCenterMap ? 'Auto-Center On' : 'Auto-Center Off'}
                </button>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`overflow-hidden shadow-lg bg-card ${isCircularMap ? 'rounded-full' : 'rounded-lg'}`} 
                style={{ 
                  width: isCircularMap ? '400px' : '100%', 
                  height: isCircularMap ? '400px' : '500px' 
                }}
              >
                {error ? (
                  <div className="h-full w-full flex items-center justify-center bg-muted/30 text-destructive p-4 text-center">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      {error}
                    </div>
                  </div>
                ) : location ? (
                  <MapComponent 
                    location={location} 
                    autoCenterEnabled={autoCenterMap}
                    triggerCenter={triggerMapCenter}
                    monuments={nearbyMonuments} 
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted/30">
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin h-8 w-8 text-primary mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading your location...
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column: Options */}
            <div className="w-full lg:w-1/4 space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card rounded-lg shadow-sm overflow-hidden"
              >
                <div className="bg-muted/50 p-4 border-b border-border flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-primary" />
                  <h2 className="text-lg font-semibold">Options</h2>
                </div>
                
                <div className="p-4 space-y-3">
                  <button 
                    onClick={toggleTracking}
                    className={`w-full flex items-center justify-center ${isTracking ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded-md transition-colors`}
                  >
                    {isTracking ? (
                      <>
                        <span className="mr-2">Stop Tracking</span>
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                      </>
                    ) : 'Resume Tracking'}
                  </button>
                  
                  <button 
                    onClick={toggleMapView}
                    className="w-full bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
                  >
                    {isCircularMap ? 'View Full Map' : 'View Circular Map'}
                  </button>
                  
                  <button 
                    onClick={refreshMap}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Refresh Map
                  </button>
                  
                  <button 
                    onClick={clearHistory}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Clear History
                  </button>
                </div>
              </motion.div>

{/* Monument Information Section - Now showing only monuments within 5km */}
<motion.div 
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.3 }}
  className="bg-card rounded-lg shadow-sm overflow-hidden"
>
  <div className="bg-muted/50 p-4 border-b border-border flex items-center">
    <Landmark className="w-5 h-5 mr-2 text-primary" />
    <h3 className="font-semibold">Nearby Monuments (5km)</h3>
  </div>
  
  <div className="p-4">
    {nearbyMonuments.length > 0 ? (
      <ul className="space-y-2">
        {nearbyMonuments.map(monument => (
          <li key={monument.id} className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex-1 pr-2">
              <span className="font-medium">{monument.name}</span>
              <div className="text-xs text-muted-foreground">
                {monument.coords[0].toFixed(4)}, {monument.coords[1].toFixed(4)}
              </div>
              <div className="text-xs text-green-600 font-medium">
                {(monument as any).distance ? `${((monument as any).distance/1000).toFixed(2)}km away` : ''}
              </div>
            </div>
            {location && (
              <a 
                href={`https://www.google.com/maps/dir/?api=1&origin=${location[0]},${location[1]}&destination=${monument.coords[0]},${monument.coords[1]}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
                title="Get directions to this monument"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6l-6 6"/>
                </svg>
              </a>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-center py-3 text-muted-foreground">
        No monuments within 5km radius.
      </div>
    )}
  </div>
</motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-card rounded-lg shadow-sm overflow-hidden"
              >
                <div className="bg-muted/50 p-4 border-b border-border flex items-center">
                  <Telescope className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="font-semibold">Tracking Info</h3>
                </div>
                
                <div className="p-4 space-y-2">
                  <p>
                    Status: <span className={isTracking ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                      {isTracking ? 'Active' : 'Paused'}
                    </span>
                  </p>
                  {isTracking && (
                    <>
                      <p className="text-sm text-muted-foreground">Updating every 10 seconds</p>
                      <p className="text-sm text-muted-foreground">Recording changes &gt; {SIGNIFICANT_DISTANCE}m</p>
                      <p className="text-sm text-muted-foreground">Monument alerts within {MONUMENT_PROXIMITY/1000}km</p>
                      <p className="text-sm text-muted-foreground">Monument display within {MONUMENT_DISPLAY_RADIUS/1000}km</p>
                    </>
                  )}
                </div>
              </motion.div>
              
              {location && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-card rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="bg-muted/50 p-4 border-b border-border flex items-center">
                    <Map className="w-5 h-5 mr-2 text-primary" />
                    <h3 className="font-semibold">Current Location</h3>
                  </div>
                  
                  <div className="p-4 space-y-2">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Latitude:</span>
                      <span className="font-mono">{location[0].toFixed(6)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Longitude:</span>
                      <span className="font-mono">{location[1].toFixed(6)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                      Updated: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              )}
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6"
              >
                <Link href="/ExploreHistory">
                  <button
                    className="w-full bg-gradient-to-r from-primary to-primary/80 text-white font-medium py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <History className="w-5 h-5" />
                    View Exploration History
                    <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
};
export function getHardcodedMonuments() {
  return HARDCODED_MONUMENTS;
}
export default Page;