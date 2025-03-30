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
import InventoryChart from './inventory-chart';

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
        <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-lg border ">
          High Opportunity
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <CommuneInfo></CommuneInfo>

        <AreaStatsCard totalAgencies={area.totalAgencies} population={area.population}></AreaStatsCard>

      </div>
      
      <AgencesWidget2 />

      <div className="grid gap-6 lg:grid-cols-2">
      <MarketMetrics
          listingsForSale={area.listingsForSale}
          listingsForRent={area.listingsForRent}
        />        
        <InventoryChart></InventoryChart>
        
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
      <ApartmentPriceChart></ApartmentPriceChart>
      <HousePriceChart></HousePriceChart>
      <RealEstateTransactions></RealEstateTransactions>

</div>
      

      <div className="grid gap-6 sm:grid-cols-2"> 
        <RealEstateMetrics />
        <BuildingDonutChart />
      </div>
    </div>
  );
}