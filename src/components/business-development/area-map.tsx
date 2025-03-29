import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AreaMapProps {
  areaName: string;
  areaCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const AreaMap = ({ areaName, areaCode, coordinates }: AreaMapProps) => {
  const defaultCenter = { lat: 48.8566, lng: 2.3522 }; // Paris coordinates as fallback
  const position = coordinates || defaultCenter;

  return (
    <Card>
      <CardHeader>
      <h2 className="text-2xl font-bold text-gray-800">Area Overview</h2>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] rounded-lg overflow-hidden">
          <MapContainer 
            center={[position.lat, position.lng]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[position.lat, position.lng]}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{areaName}</h3>
                  <p className="text-sm">{areaCode}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AreaMap;