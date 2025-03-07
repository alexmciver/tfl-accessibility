'use client';

import { useState, useEffect, useRef } from 'react';
import { useJourneyStore } from '../../hooks/useJourneyStore';
import RouteDetails from './RouteDetails';

export default function MapContainer() {
  const mapRef = useRef<HTMLIFrameElement>(null);
  const { currentJourney } = useJourneyStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show/hide map container based on whether a journey is active
    if (currentJourney) {
      setIsVisible(true);
      
      // In a real implementation, we would use a proper map library like Mapbox GL,
      // but for this demo we'll simulate with an iframe that would point to Google Maps
      
      if (mapRef.current && currentJourney.startStation && currentJourney.endStation) {
        const start = encodeURIComponent(currentJourney.startStation);
        const end = encodeURIComponent(currentJourney.endStation);
        
        // In a real app, this would be a proper embedded map
        // This is just for demonstration purposes
        mapRef.current.src = `https://www.google.com/maps/embed/v1/directions?key=YOUR_API_KEY&origin=${start}&destination=${end}&mode=transit`;
      }
    }
  }, [currentJourney]);

  if (!isVisible) {
    return null;
  }

  return (
    <section 
      id="map-container" 
      className="map-wrapper bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-8"
      aria-labelledby="route-title"
    >
      <div className="map-header mb-4">
        <h2 id="route-title" className="route-title text-xl font-semibold">Your Route</h2>
        
        {currentJourney && (
          <RouteDetails journey={currentJourney} />
        )}
      </div>
      
      <div className="map-frame relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
        <iframe 
          id="map" 
          ref={mapRef}
          className="absolute top-0 left-0 w-full h-full border-0"
          title="Journey route map"
          aria-label="Interactive map showing your planned route"
          loading="lazy"
          allowFullScreen
        ></iframe>
      </div>
      
      <div className="map-accessibility-info mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded text-sm">
        <p>
          <strong>Note:</strong> Map data provided by Google Maps. Accessibility information for stations comes from Transport for London.
        </p>
      </div>
    </section>
  );
} 