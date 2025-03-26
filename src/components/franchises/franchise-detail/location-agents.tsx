import { useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import { MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2V4YW1wbGUiLCJhIjoiY2tleGFtcGxlIn0.example';

const agents = [
  { name: "Sophie Martin", sales: 24, rentals: 18, revenue: "€450,000", performance: 95 },
  { name: "Jean Dupont", sales: 20, rentals: 15, revenue: "€380,000", performance: 88 },
  { name: "Marie Lambert", sales: 18, rentals: 22, revenue: "€360,000", performance: 85 },
  // { name: "Lucas Bernard", sales: 15, rentals: 20, revenue: "€320,000", performance: 82 },
  // { name: "Emma Petit", sales: 12, rentals: 16, revenue: "€280,000", performance: 78 },
];

export function LocationAndAgents({franchise}: any) {
  const [viewState, setViewState] = useState(() => {
    if (franchise.coordinates) {
      return {
        longitude: franchise.coordinates.lng,
        latitude: franchise.coordinates.lat,
        zoom: 14
      };
    }
    return { longitude: 0, latitude: 0, zoom: 1 }; // Default values
  });

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="tagline-2">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-lg overflow-hidden">
            {franchise.coordinates && (
              <Map
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              mapStyle="mapbox://styles/mapbox/light-v11"
              mapboxAccessToken={MAPBOX_TOKEN}
              >
              <Marker longitude={franchise.coordinates.lng} latitude={franchise.coordinates.lat}>
                <MapPin className="h-6 w-6 text-primary" />
              </Marker>
              </Map>
            )}
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