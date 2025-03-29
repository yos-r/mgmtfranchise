import { useState } from 'react';
import {
  Euro,
  Building2,
  Percent,
  Users,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AgencesWidget2 from './agences-widget2';
import PriceEvolutionCard from './price-evolution-card';
import RealEstateMetrics from './real-estate-metrics';
import BuildingDonutChart from './building-donut-chart';
import AreaMap from './area-map';
import MarketMetrics from './market-metrics';
import ApartmentPriceChart from './apartment-price-chart';
import HousePriceChart from './house-price-chart';
import OfficePriceChart from './office-price-chart';
import RealEstateTransactions from './real-estate-transactions';
import CommuneInfo from './commune-info';
import AreaStatsCard from './area-stats-card';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="tagline-1 text-3xl font-bold">{area.areaName}</h2>
            <p className="body-lead text-muted-foreground">
              Market Analysis for {area.areaCode}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <CommuneInfo></CommuneInfo>

        {/* <Card>
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
        </Card> */}
        <AreaStatsCard totalAgencies={area.totalAgencies} population={area.population}></AreaStatsCard>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Total Agencies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{area.totalAgencies}</div>
            <p className="legal text-muted-foreground">Active in the area</p>
          </CardContent>
        </Card> */}

        

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tagline-3">Population</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="numbers text-2xl font-bold">{area.population.toLocaleString()}</div>
            <p className="legal text-muted-foreground">Residents</p>
          </CardContent>
        </Card> */}
      


      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AreaMap 
          areaName={area.areaName}
          areaCode={area.areaCode}
          coordinates={area.coordinates}
        />

        <MarketMetrics
          listingsForSale={area.listingsForSale}
          listingsForRent={area.listingsForRent}
        />
        
        {/* <PriceEvolutionCard /> */}
        
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
      <ApartmentPriceChart></ApartmentPriceChart>
      <HousePriceChart></HousePriceChart>
      {/* <OfficePriceChart></OfficePriceChart> */}
      <RealEstateTransactions></RealEstateTransactions>

</div>
      
      <AgencesWidget2 />

      <div className="grid gap-6 grid-cols-2"> 
        <RealEstateMetrics />
        <BuildingDonutChart />
      </div>
    </div>
  );
}