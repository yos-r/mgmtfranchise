import { useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Building2,
  TrendingUp,
  Users,
  Home,
  Clock,
  Percent,
  MapPin,
  Euro,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface AreaDetailProps {
  area: {
    areaName: string;
    areaCode: string;
    totalAgencies: number;
    listingsForSale: number;
    listingsForRent: number;
    marketCap: number;
    century21Presence: boolean;
    population: number;
    averagePrice: number;
    marketPotential: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  onBack: () => void;
}

export function AreaDetail({ area, onBack }: AreaDetailProps) {
  const [timeframe, setTimeframe] = useState('3m');
  const defaultCenter = { lat: 48.8566, lng: 2.3522 }; // Paris coordinates as fallback
  const position = area?.coordinates || defaultCenter;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="button-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Market Analysis
          </Button>
          <div>
            <h2 className="tagline-1">{area.areaName}</h2>
            <p className="body-lead text-muted-foreground">
              Market Analysis for {area.areaCode}
            </p>
          </div>
        </div>
        <Select defaultValue={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Average Price</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">€{area.averagePrice.toLocaleString()}/m²</div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="legal text-green-500">+3.2% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Total Agencies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{area.totalAgencies}</div>
            <p className="legal text-muted-foreground">Active in the area</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Market Share</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">25%</div>
            <p className="legal text-muted-foreground">Of total listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Population</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{area.population.toLocaleString()}</div>
            <p className="legal text-muted-foreground">Residents</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="tagline-2">Area Overview</CardTitle>
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
                      <h3 className="font-semibold">{area.areaName}</h3>
                      <p className="text-sm">{area.areaCode}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="tagline-2">Market Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h4 className="label-1 mb-4">Property Distribution</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="body-1">For Sale</span>
                    <span className="body-1">{area.listingsForSale}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2" 
                      style={{ width: `${(area.listingsForSale / (area.listingsForSale + area.listingsForRent)) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="body-1">For Rent</span>
                    <span className="body-1">{area.listingsForRent}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2" 
                      style={{ width: `${(area.listingsForRent / (area.listingsForSale + area.listingsForRent)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="label-1 mb-4">Key Performance Indicators</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="body-1">Avg. Days on Market</span>
                  </div>
                  <p className="numbers text-xl">45 days</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="body-1">Property Types</span>
                  </div>
                  <p className="numbers text-xl">8 types</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="body-1">Market Growth</span>
                  </div>
                  <p className="numbers text-xl">+5.2%</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                    <span className="body-1">Price Trend</span>
                  </div>
                  <p className="numbers text-xl">Upward</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="tagline-2">Price Evolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted">
              <LineChart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="tagline-2">Competition Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="body-1">Century 21</span>
                <Badge className="bg-green-100 text-green-800">Leading</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-1">Agency A</span>
                <Badge variant="outline">Second</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-1">Agency B</span>
                <Badge variant="outline">Third</Badge>
              </div>
              <div className="mt-6">
                <h4 className="label-1 mb-2">Market Share Distribution</h4>
                <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-muted">
                  <PieChart className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}