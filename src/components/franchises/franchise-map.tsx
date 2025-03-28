import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FranchiseMapProps {
  franchises: Array<{
    id: number;
    name: string;
    address: string;
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
    zoom: 14
  });

  return (
    <div className="h-[600px] rounded-lg overflow-hidden">
      <MapContainer 
        center={[viewState.latitude, viewState.longitude]} 
        zoom={viewState.zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {franchises
          .filter(franchise => franchise.coordinates !== null)
          .map((franchise) => (
            <Marker
              key={franchise.id}
              position={[franchise.coordinates.lat, franchise.coordinates.lng]}
              eventHandlers={{
                click: () => onSelect(franchise.id),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{franchise.name}</h3>
                  <p className="text-sm">{franchise.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}