import { useState, useRef, useEffect } from 'react';
import { User, MapPin, Save, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/lib/supabase';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create a custom marker icon
const pinIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const agents = [
  { name: "Sophie Martin", sales: 24, rentals: 18, revenue: "€450,000", performance: 95 },
  { name: "Jean Dupont", sales: 20, rentals: 15, revenue: "€380,000", performance: 88 },
  { name: "Marie Lambert", sales: 18, rentals: 22, revenue: "€360,000", performance: 85 },
];

// Map click handler component
function LocationMarker({ position, setPosition, franchise, isPlacingPin }) {
  const map = useMapEvents({
    click(e) {
      if (isPlacingPin) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  return position ? (
    <Marker 
      position={position} 
      icon={pinIcon}
      draggable={isPlacingPin}
      eventHandlers={{
        dragend: (e) => {
          if (isPlacingPin) {
            const marker = e.target;
            const position = marker.getLatLng();
            setPosition(position);
          }
        },
      }}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold">{franchise.name}</h3>
          <p className="text-sm">{franchise.address}</p>
          {franchise.commune && (
            <p className="text-sm text-muted-foreground">
              Commune: {franchise.commune}
            </p>
          )}
          <p className="text-xs mt-2">
            Lat: {position.lat.toFixed(6)}, 
            Lng: {position.lng.toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

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
  onSaveLocation?: (franchiseId: string, coordinates: {lat: number, lng: number}) => Promise<void>;
}

export function LocationAndAgents({ franchise, onSaveLocation }: LocationAndAgentsProps) {
  // Default coordinates for Brussels
  const defaultCenter = { lat: 50.8503, lng: 4.3517 };
  
  // Get coordinates from franchise or use default
  const initialPosition = franchise.coordinates;
  
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

  // State for editing mode
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [position, setPosition] = useState(
    L.latLng(initialPosition.lat, initialPosition.lng)
  );
  
  // Reference to the map
  const mapRef = useRef(null);

  // Use commune coordinates if available, otherwise use position
  // const mapPosition = franchise.commune && communeCoordinates[franchise.commune] 
  //   ? communeCoordinates[franchise.commune] 
  //   : initialPosition;
const mapPosition=initialPosition? initialPosition : communeCoordinates[franchise.commune];
  // Function to save the location
  const saveLocation = async () => {
    setIsSaving(true);
    
    try {
      // Format coordinates to match Supabase structure (string values)
      const formattedCoordinates = {
        lat: position.lat.toString(),
        lng: position.lng.toString()
      };
      
      // Using Supabase client to update the franchise record
      // This assumes you have a supabase client initialized elsewhere
      const { error } = await supabase
        .from('franchises')
        .update({ 
          coordinates: formattedCoordinates,
          updated_at: new Date().toISOString()
        })
        .eq('id', franchise.id);

      if (error) {
        throw error;
      }

      // If successful, update UI
      console.log('Location updated successfully:', {
        franchiseId: franchise.id,
        coordinates: formattedCoordinates
      });
      
      // Exit editing mode
      setIsEditingLocation(false);
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Failed to update location. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to center the map on current coordinates
  const centerMap = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(position, 17);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="tagline-2">Location</CardTitle>
          {!isEditingLocation && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditingLocation(true)}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Set Location
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-lg overflow-hidden map-container">
            <MapContainer 
              center={[mapPosition.lat, mapPosition.lng]} 
              zoom={17} 
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker 
                position={position} 
                setPosition={setPosition} 
                franchise={franchise}
                isPlacingPin={isEditingLocation}
              />
            </MapContainer>
          </div>

          {isEditingLocation && (
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Current Position: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click on the map to place the pin or drag the existing pin
                </p>
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={centerMap}
                  disabled={isSaving}
                >
                  <Target className="mr-2 h-4 w-4" />
                  Center
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingLocation(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={saveLocation}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}
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