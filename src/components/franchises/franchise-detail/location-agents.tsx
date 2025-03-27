import { useState } from 'react';
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

const agents = [
  { name: "Sophie Martin", sales: 24, rentals: 18, revenue: "€450,000", performance: 95 },
  { name: "Jean Dupont", sales: 20, rentals: 15, revenue: "€380,000", performance: 88 },
  { name: "Marie Lambert", sales: 18, rentals: 22, revenue: "€360,000", performance: 85 },
];

interface LocationAndAgentsProps {
  franchise: {
    id: string;
    name: string;
    address: string;
    commune: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export function LocationAndAgents({ franchise }: LocationAndAgentsProps) {
  // Default coordinates for Brussels
  const defaultCenter = { lat: 50.8503, lng: 4.3517 };
  
  // Get coordinates from franchise or use default
  const position = franchise.coordinates || defaultCenter;

  // Get coordinates from commune if available
  const communeCoordinates: { [key: string]: { lat: number; lng: number } } = {
    '1000': { lat: 50.8466, lng: 4.3528 }, // Brussels City
    '1020': { lat: 50.8876, lng: 4.3459 }, // Laeken
    '1030': { lat: 50.8668, lng: 4.3773 }, // Schaerbeek
    '1040': { lat: 50.8366, lng: 4.3816 }, // Etterbeek
    '1050': { lat: 50.8333, lng: 4.3666 }, // Ixelles
    '1060': { lat: 50.8333, lng: 4.3500 }, // Saint-Gilles
    '1070': { lat: 50.8333, lng: 4.3166 }, // Anderlecht
    '1080': { lat: 50.8558, lng: 4.3369 }, // Molenbeek
    '1081': { lat: 50.8583, lng: 4.3166 }, // Koekelberg
    '1082': { lat: 50.8666, lng: 4.3000 }, // Berchem
    '1083': { lat: 50.8666, lng: 4.3166 }, // Ganshoren
    '1090': { lat: 50.8833, lng: 4.3333 }, // Jette
    '1120': { lat: 50.9000, lng: 4.3833 }, // Neder
    '1130': { lat: 50.8977, lng: 4.4242 }, // Haren
    '1140': { lat: 50.8666, lng: 4.4000 }, // Evere
    '1150': { lat: 50.8333, lng: 4.4333 }, // Woluwe-Saint-Pierre
    '1160': { lat: 50.8166, lng: 4.4333 }, // Auderghem
    '1170': { lat: 50.8000, lng: 4.4166 }, // Watermael
    '1180': { lat: 50.8000, lng: 4.3333 }, // Uccle
    '1190': { lat: 50.8166, lng: 4.3333 }, // Forest
    '1200': { lat: 50.8500, lng: 4.4166 }, // Woluwe-Saint-Lambert
    '1210': { lat: 50.8500, lng: 4.3666 }, // Saint-Josse
  };

  // Use commune coordinates if available, otherwise use position
  const mapPosition = franchise.commune && communeCoordinates[franchise.commune] 
    ? communeCoordinates[franchise.commune] 
    : position;

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="tagline-2">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-lg overflow-hidden">
            <MapContainer 
              center={[mapPosition.lat, mapPosition.lng]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[mapPosition.lat, mapPosition.lng]}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold">{franchise.name}</h3>
                    <p className="text-sm">{franchise.address}</p>
                    {franchise.commune && (
                      <p className="text-sm text-muted-foreground">
                        Commune: {franchise.commune}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="tagline-2">Top Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {agents.map((agent, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="body-1 font-medium">{agent.name}</span>
                  </div>
                  <Badge variant="secondary" className="numbers">
                    {agent.revenue}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="label-2">Performance</span>
                    <span className="numbers">{agent.performance}%</span>
                  </div>
                  <Progress value={agent.performance} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="legal">Sales: {agent.sales}</span>
                    <span className="legal">Rentals: {agent.rentals}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}