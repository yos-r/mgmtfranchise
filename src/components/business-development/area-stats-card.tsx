import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Building2, Users, Percent, MapPin, ChartBar, BarChart, House, HousePlugIcon, HousePlusIcon, MapPinHouse } from 'lucide-react';

const AreaStatsCard = ({ areaName = "Quartier Centre", totalAgencies, population, marketShare = "25%" }) => {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="border-b py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Aperçu </h2>
          </div>
          <div className="bg-[#beaf87]/20 p-2 rounded-full">
            <BarChart className="h-6 w-6 text-[#746649]" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
            {/* Population stat */}
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-sm bg-[#beaf87]/20 mb-2">
              <House className="h-6 w-6 text-[#746649]" />
              
            </div>
            <p className="text-2xl font-bold text-gray-800">€6,452</p>
            <p className="text-xs text-gray-500 text-center">Prix moyen du <br />mètre carré 2024</p>
            <p className="text-xs font-semibold text-green-700 text-center">+3.25% depuis 2023 </p>

          </div>
          {/* Agencies stat */}
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-sm bg-gray-100 mb-2">
              <Building2 className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalAgencies}</p>
            <p className="text-xs text-gray-500 text-center"> Agences actives</p>
          </div>
          
          {/* Population stat */}
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-sm bg-[#beaf87]/20 mb-2">
              <MapPinHouse className="h-6 w-6 text-[#746649]" />
              {/* <MapPinHouse></MapPinHouse> */}
            </div>
            <p className="text-2xl font-bold text-gray-800">900</p>
            <p className="text-xs text-gray-500 text-center">Biens disponibles</p>
          </div>
          
          {/* Market share stat */}
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-sm bg-gray-100 mb-2">
              <Percent className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{marketShare}</p>
            <p className="text-xs text-gray-500 text-center">Market Share</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AreaStatsCard;