import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
  onSelect: (id: number) => void;
}

export function FranchiseMap({ franchises, onSelect }: FranchiseMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 4.298558312213245,
    latitude: 50.83003140632331,
    zoom: 14
  });

  // Initial warning dialog state - set to true so it shows on render
  const [warningDialogOpen, setWarningDialogOpen] = useState(true);

  return (
    <>
      {/* Warning Dialog - appears immediately on render */}
      {/* <AlertDialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}> */}
      <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">Connexion au CRM requise</DialogTitle>
            <DialogDescription className="pt-2 text-center">
              Vous devez connecter le CRM de votre agence pour charger les données ici.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button className="bg-relentlessgold " >
              Configurer la connexion CRM
            </Button>
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            Contactez le support technique si vous avez besoin d'aide
          </div>
        </DialogContent>
      </Dialog>
      {/* </AlertDialog> */}

      {/* Map Container - original component unchanged */}
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
    </>
  );
}