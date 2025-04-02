import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, AlertTriangle } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';

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
  onSelect: (franchise: any) => void; // Changed to pass the entire franchise object
}

export function FranchiseMap({ franchises, onSelect }: FranchiseMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 4.3499721822997515,
    latitude: 50.83357740595144, 
    zoom: 13
  });

  // Initial warning dialog state - set to true so it shows on render
  const [warningDialogOpen, setWarningDialogOpen] = useState(true);

  return (
    <>
      {/* Warning Dialog - appears immediately on render */}
      <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-2">
              <MapPin className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">Geolocation Coordinates Not Found</DialogTitle>
            <DialogDescription className="pt-2 text-center">
              You can contact your administrator to share the geolocation coordinates.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Map Container */}
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
                  click: () => {
                    // Execute your select function when marker is clicked
                    onSelect(franchise);
                  },
                  mouseover: (e) => {
                    // Open popup when mouse hovers over the marker
                    e.target.openPopup();
                  },
                  mouseout: (e) => {
                    // Optionally close popup when mouse leaves the marker
                    // Comment this line if you want popups to stay open until clicked elsewhere
                    // e.target.closePopup();
                  },
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
    </>
  );
}