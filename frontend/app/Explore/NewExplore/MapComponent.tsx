'use client';

// Set default icon for Leaflet
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Landmark, Building, FerrisWheel, TentTree } from 'lucide-react';

let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Define monument interface
interface Monument {
  id: string;
  name: string;
  coords: [number, number];
  icon: string;
}

// Define prop types
interface MapComponentProps {
    location: [number, number];
    autoCenterEnabled: boolean;
    triggerCenter: number;
    monuments: Monument[];
  }

const MapComponent = ({ location, autoCenterEnabled = true, monuments = [] }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const monumentMarkersRef = useRef<{[key: string]: L.Marker}>({});

  // Create custom icon based on monument type
  const createMonumentIcon = (iconType: string) => {
    // Different colors for different monument types
    const colors: {[key: string]: string} = {
      'landmark': '#0ea5e9', // Sky blue
      'building': '#8b5cf6', // Purple
      'museum': '#f59e0b',  // Amber
      'monument': '#ef4444', // Red
      'tent-tree': '#10b981', // Emerald
    };
    
    const color = colors[iconType] || '#6366f1'; // Default to indigo
    
    return L.divIcon({
      className: 'monument-marker',
      html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2" style="border-color: ${color};">
              <div class="w-4 h-4" style="color: ${color};">⭐</div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  // Update monument markers
  const updateMonumentMarkers = () => {
    if (!mapInstanceRef.current) return;
    
    // Track existing monument IDs to remove stale markers
    const currentIds = new Set<string>();
    
    // Add or update monument markers
    monuments.forEach(monument => {
      currentIds.add(monument.id);
      
      if (monumentMarkersRef.current[monument.id]) {
        // Update existing marker
        monumentMarkersRef.current[monument.id].setLatLng(monument.coords);
      } else {
        // Create new marker
        const monumentIcon = createMonumentIcon(monument.icon);
        const marker = L.marker(monument.coords, { icon: monumentIcon })
          .addTo(mapInstanceRef.current!)
          .bindPopup(`<strong>${monument.name}</strong><br>Lat: ${monument.coords[0].toFixed(6)}<br>Lng: ${monument.coords[1].toFixed(6)}`);
        
        monumentMarkersRef.current[monument.id] = marker;
      }
    });
    
    // Remove stale markers
    Object.keys(monumentMarkersRef.current).forEach(id => {
      if (!currentIds.has(id) && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(monumentMarkersRef.current[id]);
        delete monumentMarkersRef.current[id];
      }
    });
  };

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView(location, 15);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
      
      // Add marker for current location
      markerRef.current = L.marker(location).addTo(mapInstanceRef.current);
      
      // Initially add monument markers
      updateMonumentMarkers();
    } 
    
    // If map exists, update the marker position and center the map if enabled
    if (mapInstanceRef.current) {
      // Update marker
      if (markerRef.current) {
        markerRef.current.setLatLng(location);
      } else {
        markerRef.current = L.marker(location).addTo(mapInstanceRef.current);
      }
      
      // Center the map on the marker if auto-center is enabled
      if (autoCenterEnabled) {
        mapInstanceRef.current.setView(location, mapInstanceRef.current.getZoom());
      }
      
      // Update monument markers
      updateMonumentMarkers();
    }
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        monumentMarkersRef.current = {};
      }
    };
  }, [location, autoCenterEnabled, monuments]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

export default MapComponent;