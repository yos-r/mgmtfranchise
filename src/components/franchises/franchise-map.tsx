import { useState } from 'react';
// import Map, { Marker } from 'react-map-gl';
import { MapPin } from "lucide-react";
// import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2V4YW1wbGUiLCJhIjoiY2tleGFtcGxlIn0.example';

interface FranchiseMapProps {
  franchises: Array<{
    id: number;
    coordinates: {
      lat: number;
      lng: number;
    };
  }>;
  onSelect: (id: number) => void;
}

export function FranchiseMap({ franchises, onSelect }: FranchiseMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 4.298558312213245,
    latitude: 50.83003140632331, 
    zoom: 5
  });

  return (
    <div className="h-[600px] rounded-lg overflow-hidden">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {franchises
          .filter(franchise => franchise.coordinates !== null)
          .map((franchise) => (
            <Marker
              key={franchise.id}
              longitude={franchise.coordinates.lng}
              latitude={franchise.coordinates.lat}
              onClick={() => onSelect(franchise.id)}
            >
              <div className="cursor-pointer">
          <MapPin className="h-6 w-6 text-primary" />
              </div>
            </Marker>
          ))}
      </Map>
    </div>
  );
}